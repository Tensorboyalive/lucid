import { NextRequest } from "next/server";
import { spawn } from "child_process";
import { promises as fs } from "fs";
import path from "path";
import os from "os";
import { randomUUID } from "crypto";
import { GoogleGenAI, Type, FileState } from "@google/genai";
import {
  MOCK_RESULT,
  type ScoreResult,
  type Scene,
  type Network,
  type BrainScores,
} from "@/lib/mock";
import { scoreLiveBodySchema, isSafeVideoUrl } from "@/lib/validation";

const MAX_VIDEO_BYTES = 80 * 1024 * 1024;
const MAX_STDERR_BYTES = 4096;

export const runtime = "nodejs";
export const maxDuration = 300;

// Default to the binary being on $PATH (true on most Linux hosts via apt/brew).
// Override with YT_DLP_PATH env var in any deploy (Vercel, self-hosted, etc.).
const YT_DLP_PATH = process.env.YT_DLP_PATH ?? "yt-dlp";
const PRIMARY_MODEL = "gemini-2.5-pro";
const FALLBACK_MODEL = "gemini-2.5-flash";
const INSTAGRAM_HOST_RE = /(^|\.)instagram\.com$/i;
const POLL_INTERVAL_MS = 1000;
const POLL_MAX_MS = 60_000;

interface LiveBody {
  url: string;
}

interface GeminiScene {
  id: string;
  startMs: number;
  endMs: number;
  transcript: string;
  visual: string;
  audio: string;
  dominantEmotion: string;
  strongestNetwork: Network;
  weakestNetwork: Network;
  weaknessScore: number;
}

interface GeminiResult {
  durationMs: number;
  scenes: GeminiScene[];
  topMoment: { timestamp: string; why: string };
  bottomMoment: { timestamp: string; why: string };
  brainSignals: {
    rewardIntensity: number;
    emotionIntensity: number;
    attentionIntensity: number;
    memoryIntensity: number;
  };
}

const NETWORKS: Network[] = ["reward", "emotion", "attention", "memory"];

const SYSTEM_PROMPT = `You are the Beta engine inside lucid:v2, a specialist video reader that translates a short-form reel into a neuro-grounded scene timeline.

Your job: watch the attached video top to bottom and return a JSON object with one scene per narrative beat (typically 3 to 8 scenes for a reel under 60 seconds). Every field must be real and grounded in what the video actually contains.

Rules for scene fields:
- id: "s1", "s2", "s3" in order
- startMs / endMs: integer milliseconds from the start of the reel
- transcript: the exact words spoken in that scene. If silent, say "silent". Do not paraphrase.
- visual: one sentence describing framing, subject, motion, and light
- audio: one sentence. Music style, sfx, voice energy, silence
- dominantEmotion: one lowercase word (curiosity, tension, delight, confidence, intrigue, anticipation, relief, shock)
- strongestNetwork: one of reward, emotion, attention, memory. Pick the brain system the scene activates most.
- weakestNetwork: one of reward, emotion, attention, memory. Pick the one that is underfired.
- weaknessScore: 0 to 1 float. 0 means no weakness. 1 means total dead zone.

topMoment and bottomMoment must reference an actual timestamp like "0:03" or "0:14", and the "why" must be one sentence grounded in an observable video cue (cut, expression, beat drop, line delivery).

brainSignals are your own 0 to 10 estimates for the overall reel. Use the weighting hint: Reward 30%, Emotion 25%, Attention 25%, Memory 20%.

Brain network definitions you must honor:
- Reward: orbitofrontal cortex. Promise of payoff. Dopamine arousal. Fires on stakes, specificity, superlatives.
- Emotion: insula and cingulate. Salience and valence. Fires on reaction cutaways, micro expressions, vocal inflection.
- Attention: parietal and frontal. Fires on tempo changes, contrast pairs, prediction error.
- Memory: parahippocampal and default mode. Fires on oddity, specificity, loop backs.

Output style rules (non negotiable):
1. Never use em dashes. Use periods, commas, or colons.
2. Never use en dashes in prose. Use "to" or a hyphen.
3. Never mention yourself as Gemini, Google, or a model. You are the Beta engine inside lucid:v2.
4. Plain punctuation only. No meta commentary.
5. Keep every string short and specific.

Return ONLY the JSON object that matches the provided schema. No preface, no code fence, no trailing commentary.`;

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    durationMs: { type: Type.NUMBER },
    scenes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          startMs: { type: Type.NUMBER },
          endMs: { type: Type.NUMBER },
          transcript: { type: Type.STRING },
          visual: { type: Type.STRING },
          audio: { type: Type.STRING },
          dominantEmotion: { type: Type.STRING },
          strongestNetwork: { type: Type.STRING },
          weakestNetwork: { type: Type.STRING },
          weaknessScore: { type: Type.NUMBER },
        },
        required: [
          "id",
          "startMs",
          "endMs",
          "transcript",
          "visual",
          "audio",
          "dominantEmotion",
          "strongestNetwork",
          "weakestNetwork",
          "weaknessScore",
        ],
      },
    },
    topMoment: {
      type: Type.OBJECT,
      properties: {
        timestamp: { type: Type.STRING },
        why: { type: Type.STRING },
      },
      required: ["timestamp", "why"],
    },
    bottomMoment: {
      type: Type.OBJECT,
      properties: {
        timestamp: { type: Type.STRING },
        why: { type: Type.STRING },
      },
      required: ["timestamp", "why"],
    },
    brainSignals: {
      type: Type.OBJECT,
      properties: {
        rewardIntensity: { type: Type.NUMBER },
        emotionIntensity: { type: Type.NUMBER },
        attentionIntensity: { type: Type.NUMBER },
        memoryIntensity: { type: Type.NUMBER },
      },
      required: [
        "rewardIntensity",
        "emotionIntensity",
        "attentionIntensity",
        "memoryIntensity",
      ],
    },
  },
  required: [
    "durationMs",
    "scenes",
    "topMoment",
    "bottomMoment",
    "brainSignals",
  ],
} as const;

function isInstagramUrl(raw: string): boolean {
  try {
    const u = new URL(raw);
    if (!INSTAGRAM_HOST_RE.test(u.hostname)) return false;
    return /\/(reel|reels|p|tv)\//i.test(u.pathname);
  } catch {
    return false;
  }
}

function fallback(reason: string, sourceUrl?: string) {
  console.warn("[score-live] fallback:", reason);
  const result: ScoreResult = sourceUrl
    ? { ...MOCK_RESULT, sourceUrl }
    : MOCK_RESULT;
  return Response.json({ result, fallback: true, reason });
}

async function runYtDlp(url: string, cwd: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const args = [
      "-f",
      "best[ext=mp4]/best",
      "--no-warnings",
      "--max-filesize",
      "80M",
      "--no-playlist",
      "-o",
      "%(id)s.%(ext)s",
      url,
    ];
    const child = spawn(YT_DLP_PATH, args, { cwd });
    // Cap the accumulated stderr buffer so a pathological yt-dlp run with
    // megabytes of stderr can't pin memory or leak paths into our error log.
    let stderr = "";
    child.stderr.on("data", (chunk: Buffer | string) => {
      if (stderr.length < MAX_STDERR_BYTES) {
        const text = typeof chunk === "string" ? chunk : chunk.toString();
        stderr += text.slice(0, MAX_STDERR_BYTES - stderr.length);
      }
    });
    child.on("error", (err) => reject(err));
    child.on("close", (code) => {
      if (code === 0) return resolve();
      reject(new Error(`yt-dlp exit ${code}`));
    });
  });
}

const APIFY_URL_ACTOR = "shu8hvrXbJbY3Eb9W"; // apify/instagram-scraper posts by direct URL

/**
 * Fallback resolver. yt-dlp against Instagram now fails without browser cookies
 * in a server environment. Apify's Instagram scraper returns a direct CDN
 * videoUrl that we can fetch with a standard GET. Downloads up to 80MB to the
 * job workspace.
 */
async function resolveViaApify(
  url: string,
  cwd: string,
): Promise<string | null> {
  const token = process.env.APIFY_TOKEN;
  if (!token) return null;

  // Pass token via Authorization header instead of ?token= in the URL so the
  // secret never appears in proxy/access logs.
  const actorUrl = `https://api.apify.com/v2/acts/${APIFY_URL_ACTOR}/run-sync-get-dataset-items`;
  const run = await fetch(actorUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      resultsType: "posts",
      directUrls: [url],
      resultsLimit: 1,
      addParentData: false,
    }),
  });
  if (!run.ok) {
    throw new Error(`apify ${run.status}`);
  }
  const items = (await run.json()) as Array<{
    videoUrl?: string;
    videoPlayUrl?: string;
    videoUrlBackup?: string;
    shortCode?: string;
  }>;
  const post = items[0];
  const videoUrlRaw =
    post?.videoUrl ?? post?.videoPlayUrl ?? post?.videoUrlBackup;
  // SSRF guard: even though Apify returned this URL, it's user-influenced
  // (Apify follows input directUrls). Lock the fetch target to known CDNs so
  // link-local metadata IPs and arbitrary domains can never be reached.
  if (!isSafeVideoUrl(videoUrlRaw)) return null;
  const videoUrl: string = videoUrlRaw;

  const videoRes = await fetch(videoUrl);
  if (!videoRes.ok) {
    throw new Error(`video fetch ${videoRes.status}`);
  }
  const contentLength = Number(videoRes.headers.get("content-length") ?? 0);
  if (contentLength > MAX_VIDEO_BYTES) {
    throw new Error("video too large");
  }
  // Cap on bytes actually streamed so a missing/wrong Content-Length header
  // cannot OOM the function via chunked-transfer-encoding.
  const body = videoRes.body;
  if (!body) return null;
  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    if (!value) continue;
    total += value.byteLength;
    if (total > MAX_VIDEO_BYTES) {
      try {
        await reader.cancel();
      } catch {
        /* ignore */
      }
      throw new Error("video too large");
    }
    chunks.push(value);
  }
  const buf = Buffer.concat(chunks.map((c) => Buffer.from(c)));
  const filename = `${post?.shortCode ?? randomUUID()}.mp4`;
  const outPath = path.join(cwd, filename);
  await fs.writeFile(outPath, buf);
  return outPath;
}

async function findDownloadedVideo(cwd: string): Promise<string | null> {
  const entries = await fs.readdir(cwd);
  const video = entries.find((name) => /\.(mp4|mov|mkv|webm)$/i.test(name));
  return video ? path.join(cwd, video) : null;
}

async function waitForFileActive(
  client: GoogleGenAI,
  name: string,
): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < POLL_MAX_MS) {
    const info = await client.files.get({ name });
    if (info.state === FileState.ACTIVE) return;
    if (info.state === FileState.FAILED) {
      throw new Error(`file processing failed: ${info.error?.message ?? ""}`);
    }
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }
  throw new Error("file did not become ACTIVE within 60s");
}

async function deleteUploadedFile(
  apiKey: string,
  name: string | undefined,
): Promise<void> {
  if (!name) return;
  try {
    const normalized = name.startsWith("files/") ? name : `files/${name}`;
    const url = `https://generativelanguage.googleapis.com/v1beta/${normalized}`;
    // Pass the key as a header rather than a URL query param so it never
    // appears in access/proxy logs.
    await fetch(url, {
      method: "DELETE",
      headers: { "x-goog-api-key": apiKey },
    });
  } catch (err) {
    console.warn("[score-live] delete file failed:", err);
  }
}

async function runGemini(
  client: GoogleGenAI,
  model: string,
  fileUri: string,
  mimeType: string,
): Promise<GeminiResult> {
  const contents = [
    {
      role: "user" as const,
      parts: [
        { fileData: { fileUri, mimeType } },
        { text: "Read this reel and return the JSON scene timeline." },
      ],
    },
  ];
  const response = await client.models.generateContent({
    model,
    contents,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
      // Cast to satisfy the SDK Schema type while keeping the literal const.
      responseSchema: RESPONSE_SCHEMA as unknown as Record<string, unknown>,
      temperature: 0.6,
    },
  });
  const raw = response.text ?? "";
  if (!raw) throw new Error("empty response from engine");
  const cleaned = raw
    .replace(/^\s*```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
  const parsed = JSON.parse(cleaned) as GeminiResult;
  return parsed;
}

function normalizeNetwork(raw: unknown): Network {
  const lower = String(raw ?? "").toLowerCase();
  return (NETWORKS as string[]).includes(lower) ? (lower as Network) : "reward";
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

function stripEmDashes(s: string): string {
  return s.replace(/\u2014/g, ", ").replace(/\u2013/g, "-");
}

function toScene(raw: GeminiScene, idx: number): Scene {
  const id = `s${idx + 1}`;
  const startMs = clamp(Math.round(Number(raw.startMs) || 0), 0, 3_600_000);
  const endMs = clamp(
    Math.round(Number(raw.endMs) || startMs + 1000),
    startMs + 200,
    3_600_000,
  );
  return {
    id,
    startMs,
    endMs,
    transcript: stripEmDashes(String(raw.transcript ?? "").slice(0, 600)),
    visual: stripEmDashes(String(raw.visual ?? "").slice(0, 400)),
    audio: stripEmDashes(String(raw.audio ?? "").slice(0, 300)),
    dominantEmotion: String(raw.dominantEmotion ?? "neutral")
      .toLowerCase()
      .replace(/[^a-z]/g, "")
      .slice(0, 24) || "neutral",
    strongestNetwork: normalizeNetwork(raw.strongestNetwork),
    weakestNetwork: normalizeNetwork(raw.weakestNetwork),
    weaknessScore: clamp(Number(raw.weaknessScore) || 0.3, 0, 1),
  };
}

interface HeuristicInputs {
  scenes: Scene[];
  durationMs: number;
  signals: GeminiResult["brainSignals"];
}

const EMOTION_WORDS = new Set([
  "shock",
  "delight",
  "awe",
  "tension",
  "anger",
  "joy",
  "relief",
  "fear",
  "longing",
  "grief",
  "pride",
  "disgust",
]);

const HOOK_REWARD_WORDS = /(never|always|every|nobody|everyone|\$\d|million|thousand|secret|proof|hack|trick|stop|truth)/i;

function heuristicScores(input: HeuristicInputs): BrainScores {
  const { scenes, durationMs, signals } = input;
  const sceneCount = Math.max(1, scenes.length);
  const durationSec = Math.max(1, durationMs / 1000);

  // Base from Gemini's own signals, clamped 0..10.
  const rewardBase = clamp(Number(signals.rewardIntensity) || 5, 0, 10);
  const emotionBase = clamp(Number(signals.emotionIntensity) || 5, 0, 10);
  const attentionBase = clamp(Number(signals.attentionIntensity) || 5, 0, 10);
  const memoryBase = clamp(Number(signals.memoryIntensity) || 5, 0, 10);

  // Heuristic boosts.
  // Pacing density: scenes per 10s. Sweet spot 2 to 4.
  const density = (sceneCount / durationSec) * 10;
  const pacingBoost = density >= 2 && density <= 4.5 ? 0.6 : density > 4.5 ? 0.3 : -0.4;

  // Emotion: richness of dominantEmotion vocabulary.
  const emotionHits = scenes.filter((s) =>
    EMOTION_WORDS.has(s.dominantEmotion.toLowerCase()),
  ).length;
  const emotionBoost = clamp(emotionHits / sceneCount, 0, 1) * 0.9;

  // Reward: hook strength. Examine first scene transcript for reward cues.
  const first = scenes[0];
  const rewardBoost =
    first && HOOK_REWARD_WORDS.test(first.transcript) ? 0.7 : -0.2;

  // Attention: tempo change. If any scene under 2.5s early on, we assume cut tempo is strong.
  const earlyCut = scenes.slice(0, 3).some((s) => s.endMs - s.startMs < 2500);
  const attentionBoost = (earlyCut ? 0.6 : 0) + pacingBoost * 0.4;

  // Memory: specificity cues. Look for numbers in transcripts or oddity tokens.
  const memoryHits = scenes.filter((s) => /\d|specifically|exactly|private|zero/i.test(s.transcript)).length;
  const memoryBoost = clamp(memoryHits / sceneCount, 0, 1) * 0.8;

  const reward = clamp(rewardBase + rewardBoost, 0, 10);
  const emotion = clamp(emotionBase + emotionBoost, 0, 10);
  const attention = clamp(attentionBase + attentionBoost, 0, 10);
  const memory = clamp(memoryBase + memoryBoost, 0, 10);

  const overallRaw = reward * 0.3 + emotion * 0.25 + attention * 0.25 + memory * 0.2;
  const overall = Math.round(clamp(overallRaw, 0, 10) * 10) / 10;

  return {
    reward: Math.round(reward * 10) / 10,
    emotion: Math.round(emotion * 10) / 10,
    attention: Math.round(attention * 10) / 10,
    memory: Math.round(memory * 10) / 10,
    overall,
  };
}

function verdictFor(overall: number): {
  verdict: string;
  verdictTone: ScoreResult["verdictTone"];
} {
  if (overall >= 9) return { verdict: "EXPLOSIVE VIRAL POTENTIAL", verdictTone: "explosive" };
  if (overall >= 7.5) return { verdict: "HIGH VIRAL POTENTIAL", verdictTone: "high" };
  if (overall >= 6) return { verdict: "MODERATE TRACTION LIKELY", verdictTone: "moderate" };
  if (overall >= 4.5) return { verdict: "BELOW VIRAL THRESHOLD", verdictTone: "below" };
  return { verdict: "CRITICAL WEAK SIGNAL", verdictTone: "critical" };
}

async function analyzeWithGemini(
  client: GoogleGenAI,
  fileUri: string,
  mimeType: string,
): Promise<GeminiResult> {
  try {
    return await runGemini(client, PRIMARY_MODEL, fileUri, mimeType);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    // Pro may be 404, unsupported, or 429 rate limited. In any of those cases, try flash.
    if (/404|not found|unsupported|429|quota|rate limit|exhaust/i.test(msg)) {
      console.warn(`[score-live] ${PRIMARY_MODEL} unavailable, falling back to ${FALLBACK_MODEL}:`, msg);
      return await runGemini(client, FALLBACK_MODEL, fileUri, mimeType);
    }
    throw err;
  }
}

export async function POST(req: NextRequest) {
  const raw = await req.json().catch(() => null);
  const parsed = scoreLiveBodySchema.safeParse(raw);
  if (!parsed.success) return fallback("invalid_body");

  const url = parsed.data.url.trim();
  if (!url) return fallback("missing_url");
  if (!isInstagramUrl(url)) return fallback("not_instagram_url", url);

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return fallback("gemini_key_missing", url);

  const jobId = randomUUID();
  const jobDir = path.join(os.tmpdir(), `lucid-score-${jobId}`);
  await fs.mkdir(jobDir, { recursive: true });

  let downloadedPath: string | null = null;
  let uploadedName: string | undefined;
  const client = new GoogleGenAI({ apiKey });

  try {
    // 1. Download with yt-dlp.
    let ytDlpError: string | null = null;
    try {
      await runYtDlp(url, jobDir);
    } catch (err) {
      ytDlpError = err instanceof Error ? err.message : String(err);
    }

    downloadedPath = await findDownloadedVideo(jobDir);
    if (!downloadedPath) {
      // Fall back to the Apify resolver. It returns a direct CDN video URL
      // we can fetch without Instagram auth.
      try {
        downloadedPath = await resolveViaApify(url, jobDir);
      } catch (err) {
        console.warn(
          "[score-live] apify fallback failed:",
          err instanceof Error ? err.message : err,
          "yt-dlp:",
          ytDlpError,
        );
        return fallback("download_failed", url);
      }
      if (!downloadedPath) {
        console.warn(
          "[score-live] no video available — yt-dlp:",
          ytDlpError,
          "apify: no safe videoUrl",
        );
        return fallback("download_failed", url);
      }
    }

    const stat = await fs.stat(downloadedPath);
    if (stat.size < 10_000) {
      return fallback("file_too_small", url);
    }

    // 2. Upload to Gemini Files API.
    let uploadedUri: string | undefined;
    let uploadedMime: string = "video/mp4";
    try {
      const uploaded = await client.files.upload({
        file: downloadedPath,
        config: { mimeType: "video/mp4" },
      });
      uploadedName = uploaded.name;
      uploadedUri = uploaded.uri;
      uploadedMime = uploaded.mimeType ?? "video/mp4";

      if (!uploadedName) {
        throw new Error("upload returned no name");
      }

      await waitForFileActive(client, uploadedName);
    } catch (err) {
      console.warn(
        "[score-live] gemini upload failed:",
        err instanceof Error ? err.message : err,
      );
      await deleteUploadedFile(apiKey, uploadedName);
      return fallback("upload_failed", url);
    }

    if (!uploadedUri) {
      await deleteUploadedFile(apiKey, uploadedName);
      return fallback("upload_no_uri", url);
    }

    // 3. Gemini scene analysis.
    let parsedGemini: GeminiResult;
    try {
      parsedGemini = await analyzeWithGemini(client, uploadedUri, uploadedMime);
    } catch (err) {
      console.warn(
        "[score-live] gemini analysis failed:",
        err instanceof Error ? err.message : err,
      );
      return fallback("analysis_failed", url);
    }

    if (!Array.isArray(parsedGemini.scenes) || parsedGemini.scenes.length === 0) {
      return fallback("no_scenes", url);
    }

    // 4. Normalize and score.
    const scenes: Scene[] = parsedGemini.scenes
      .slice(0, 10)
      .map((s, i) => toScene(s, i));

    const durationMs = clamp(
      Math.round(Number(parsedGemini.durationMs) || scenes[scenes.length - 1].endMs),
      1000,
      10 * 60 * 1000,
    );

    const scores = heuristicScores({
      scenes,
      durationMs,
      signals: parsedGemini.brainSignals,
    });

    const { verdict, verdictTone } = verdictFor(scores.overall);

    const result: ScoreResult = {
      id: `live-${jobId.slice(0, 8)}`,
      sourceUrl: url,
      durationMs,
      scores,
      verdict,
      verdictTone,
      scenes,
      weaknesses: [],
      topMoment: {
        timestamp: stripEmDashes(String(parsedGemini.topMoment?.timestamp ?? "0:01")),
        why: stripEmDashes(String(parsedGemini.topMoment?.why ?? "Strong cut early.")),
      },
      bottomMoment: {
        timestamp: stripEmDashes(String(parsedGemini.bottomMoment?.timestamp ?? "0:00")),
        why: stripEmDashes(
          String(parsedGemini.bottomMoment?.why ?? "Underfired opening."),
        ),
      },
    };

    return Response.json({ result, source: "live" });
  } catch (err) {
    console.warn(
      "[score-live] unexpected error:",
      err instanceof Error ? err.message : err,
    );
    return fallback("unexpected_error", url);
  } finally {
    // Cleanup best effort. Never let cleanup throw back to the client.
    if (uploadedName) {
      await deleteUploadedFile(apiKey, uploadedName);
    }
    if (downloadedPath) {
      try {
        await fs.unlink(downloadedPath);
      } catch {
        /* ignore */
      }
    }
    try {
      await fs.rm(jobDir, { recursive: true, force: true });
    } catch {
      /* ignore */
    }
  }
}
