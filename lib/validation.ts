import { z } from "zod";

/**
 * Shared Zod schemas for every API route body. Keeps every external input
 * capped in size, narrowly typed, and failing fast with a 400 when malformed.
 *
 * These caps reflect the known-safe upper bounds of the product flows
 * (typical reel script ~1500 chars; chat turn ~1000 chars; scene count <= 12).
 * Raising them should always be a conscious product decision, not a default.
 */

const roleEnum = z.enum(["user", "assistant"]);

// ── /api/chat ────────────────────────────────────────────────────────────────
export const chatMessageSchema = z.object({
  role: roleEnum,
  content: z.string().max(4000),
});

export const chatBodySchema = z.object({
  messages: z.array(chatMessageSchema).min(1).max(20),
  researchHandle: z.string().max(100).optional(),
  researchReels: z
    .array(
      z.object({
        id: z.string().max(100),
        caption: z.string().max(500),
        views: z.string().max(30).optional(),
        hookType: z.string().max(80).optional(),
        scoreEstimate: z.number().min(0).max(10).optional(),
      }),
    )
    .max(20)
    .optional(),
  researchPatterns: z
    .array(
      z.object({
        title: z.string().max(120),
        body: z.string().max(600),
      }),
    )
    .max(10)
    .optional(),
});

export type ChatBodyValidated = z.infer<typeof chatBodySchema>;

// ── /api/rewrite ─────────────────────────────────────────────────────────────
const researchProfileSchema = z
  .object({
    handle: z.string().max(100).optional(),
    name: z.string().max(120).optional(),
    patterns: z
      .array(
        z.object({
          title: z.string().max(120),
          body: z.string().max(600),
        }),
      )
      .max(10)
      .optional(),
    topReelCaptions: z
      .array(
        z.object({
          id: z.string().max(100),
          caption: z.string().max(500),
          views: z.string().max(30),
          hookType: z.string().max(80),
        }),
      )
      .max(20)
      .optional(),
  })
  .partial();

export const rewriteBodySchema = z.object({
  script: z.string().max(8000),
  reference: z.string().max(200).optional(),
  history: z.array(chatMessageSchema).max(15).optional(),
  message: z.string().max(4000).optional(),
  /**
   * previousPlan comes back as the Gamma JSON we sent last turn. We validate
   * it only loosely — the shape can evolve — and cap the serialized size later
   * when building the prompt to avoid unbounded context growth.
   */
  previousPlan: z.unknown().optional(),
  researchContext: z
    .object({
      profile: researchProfileSchema.optional(),
    })
    .optional(),
});

export type RewriteBodyValidated = z.infer<typeof rewriteBodySchema>;

// ── /api/score-synth ─────────────────────────────────────────────────────────
const networkEnum = z.enum(["reward", "emotion", "attention", "memory"]);

export const scoreSynthBodySchema = z.object({
  sourceUrl: z.string().max(500).optional(),
  // Scene objects are JSON-stringified into the Claude prompt downstream.
  // `.strict()` rejects any unknown keys rather than silently passing them
  // through — without this, a malicious client could inject additional
  // properties that become part of the LLM context as prompt payload.
  scenes: z
    .array(
      z.object({
        id: z.string().max(50),
        startMs: z.number().min(0).max(15 * 60 * 1000).optional(),
        endMs: z.number().min(0).max(15 * 60 * 1000).optional(),
        transcript: z.string().max(800).optional(),
        visual: z.string().max(600).optional(),
        audio: z.string().max(400).optional(),
        dominantEmotion: z.string().max(50).optional(),
        strongestNetwork: networkEnum.optional(),
        weakestNetwork: networkEnum.optional(),
        weaknessScore: z.number().min(0).max(1).optional(),
      }).strict(),
    )
    .max(20),
  scores: z.object({
    reward: z.number().min(0).max(10),
    emotion: z.number().min(0).max(10),
    attention: z.number().min(0).max(10),
    memory: z.number().min(0).max(10),
    overall: z.number().min(0).max(10),
  }),
});

export type ScoreSynthBodyValidated = z.infer<typeof scoreSynthBodySchema>;

// ── /api/score-live ──────────────────────────────────────────────────────────
export const scoreLiveBodySchema = z.object({
  url: z.string().url().max(2048),
});

export type ScoreLiveBodyValidated = z.infer<typeof scoreLiveBodySchema>;

// ── /api/scrape-creator ──────────────────────────────────────────────────────
export const scrapeCreatorBodySchema = z.object({
  handle: z.string().min(1).max(100),
});

export type ScrapeCreatorBodyValidated = z.infer<typeof scrapeCreatorBodySchema>;

// ── /api/waitlist ────────────────────────────────────────────────────────────
// Keep the surface tiny — email + where-they-came-from. The public/anon key
// writes these rows, so every field needs a hard cap for abuse resistance.
export const waitlistBodySchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  // Free-text signup source so we can paste this link anywhere without
  // changing code ("twitter-bio", "manavs-newsletter", "pitch-deck", etc.).
  source: z.string().max(60).optional(),
  // Captured from document.referrer client-side; optional and length-capped.
  referrer: z.string().max(500).optional(),
});

export type WaitlistBodyValidated = z.infer<typeof waitlistBodySchema>;

// ── helpers ──────────────────────────────────────────────────────────────────

/**
 * Sanitize text that will be interpolated directly into an LLM prompt.
 * Strips newlines and caps length to blunt prompt-injection-by-concat and
 * control-character smuggling.
 */
export function sanitizeForPrompt(value: string | undefined, maxLen = 200): string {
  if (!value) return "";
  return value
    .replace(/[\r\n\t]+/g, " ")
    .replace(/[\u0000-\u001F\u007F]+/g, "")
    .trim()
    .slice(0, maxLen);
}

/**
 * CDN hostnames we're willing to fetch binary video bytes from inside the
 * score-live route. Anything else from an Apify response is treated as hostile.
 * Tight, explicit allowlist is the point — the SSRF surface goes to zero.
 */
const ALLOWED_VIDEO_HOST_RE =
  /(^|\.)(cdninstagram\.com|fbcdn\.net|akamaihd\.net|apify\.com)$/i;

/**
 * Returns true only when `raw` is an absolute https URL pointing at a known
 * Instagram-family CDN. Everything else — including http, localhost,
 * link-local metadata IPs, and arbitrary domains — is rejected.
 */
export function isSafeVideoUrl(raw: unknown): raw is string {
  if (typeof raw !== "string" || raw.length > 4096) return false;
  try {
    const u = new URL(raw);
    if (u.protocol !== "https:") return false;
    return ALLOWED_VIDEO_HOST_RE.test(u.hostname);
  } catch {
    return false;
  }
}
