import { NextRequest } from "next/server";
import {
  getAnthropic,
  CLAUDE_MODEL,
  hasAnthropic,
} from "@/lib/providers/anthropic";
import { REWRITE_SYSTEM } from "@/lib/providers/prompts";
import { MOCK_REWRITE } from "@/lib/mock-rewrite";
import { logRewrite } from "@/lib/supabase/repository";

export const runtime = "nodejs";
export const maxDuration = 120;

interface ResearchContextShape {
  profile?: {
    handle?: string;
    name?: string;
    patterns?: { title: string; body: string }[];
    topReelCaptions?: {
      id: string;
      caption: string;
      views: string;
      hookType: string;
    }[];
  };
}

interface RewriteBody {
  script: string;
  reference?: string;
  /** Previous assistant turns so Gamma can iterate on its own plan. */
  history?: { role: "user" | "assistant"; content: string }[];
  /** The user's latest refinement instruction. */
  message?: string;
  /** Previous rewrite plan (JSON) we want to iterate on. */
  previousPlan?: unknown;
  /** Optional research context pulled from the user's /research session. */
  researchContext?: ResearchContextShape;
}

function formatResearchContext(ctx: ResearchContextShape | undefined): string {
  if (!ctx?.profile) return "";
  const { handle, name, patterns, topReelCaptions } = ctx.profile;
  const blocks: string[] = [];
  blocks.push(
    `Research context active. The user just analyzed ${handle ?? name ?? "a creator"}.`,
  );
  if (patterns && patterns.length > 0) {
    blocks.push(
      "Patterns observed in their top reels:\n" +
        patterns
          .map((p, i) => `  ${i + 1}. ${p.title}: ${p.body}`)
          .join("\n"),
    );
  }
  if (topReelCaptions && topReelCaptions.length > 0) {
    blocks.push(
      "Top reel captions from the scraped feed:\n" +
        topReelCaptions
          .map(
            (r) =>
              `  ${r.id} (${r.views} views, ${r.hookType}): "${r.caption}"`,
          )
          .join("\n"),
    );
  }
  blocks.push(
    "Weave in these patterns when relevant. Cite reel IDs when the rewrite mirrors a specific hook.",
  );
  return blocks.join("\n\n");
}

const REFINEMENT_SYSTEM = `${REWRITE_SYSTEM}

You are now in REFINEMENT mode. You have already produced a rewrite plan for this creator. The user is asking for a specific change. Return the COMPLETE updated plan as the same JSON shape, incorporating their change. Do not drop shots unless they explicitly ask. After the JSON, add a separator "\\n\\n---\\n\\n" followed by a tight 1-2 sentence narration explaining what you changed and why, in the Viral Engine's voice.`;

export async function POST(req: NextRequest) {
  const body = (await req.json()) as RewriteBody;

  const isRefinement = Boolean(
    body.message && body.history && body.previousPlan,
  );

  if (!isRefinement && (!body.script || body.script.trim().length < 10)) {
    return Response.json({ error: "Script too short" }, { status: 400 });
  }

  const anthropic = getAnthropic();
  if (!hasAnthropic() || !anthropic) {
    return Response.json({
      result: MOCK_REWRITE,
      narration:
        "The Gamma engine is not keyed yet. This is the pre-authored demo. Add ANTHROPIC_API_KEY and retry.",
      fallback: true,
    });
  }

  const researchBlock = formatResearchContext(body.researchContext);
  const baseSystem = isRefinement ? REFINEMENT_SYSTEM : REWRITE_SYSTEM;
  const system = researchBlock
    ? `${baseSystem}\n\n${researchBlock}`
    : baseSystem;

  let userMessage: string;
  if (isRefinement) {
    userMessage = [
      `Original draft:\n\`\`\`\n${body.script.trim()}\n\`\`\``,
      body.reference ? `Reference: ${body.reference}` : undefined,
      `Current plan (previous Gamma output):\n\`\`\`json\n${JSON.stringify(body.previousPlan, null, 2)}\n\`\`\``,
      `User's refinement: ${body.message}`,
      `Return the updated full plan JSON, then a separator, then narration.`,
    ]
      .filter(Boolean)
      .join("\n\n");
  } else {
    userMessage = [
      `Draft script:\n\`\`\`\n${body.script.trim()}\n\`\`\``,
      body.reference ? `Reference reel / creator: ${body.reference}` : undefined,
      "Return the RewriteResult JSON object. No code fence.",
    ]
      .filter(Boolean)
      .join("\n\n");
  }

  const messages: { role: "user" | "assistant"; content: string }[] = [];
  if (body.history) {
    for (const h of body.history) {
      messages.push({ role: h.role, content: h.content });
    }
  }
  messages.push({ role: "user", content: userMessage });

  try {
    const response = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 3200,
      system,
      messages,
    });

    const textBlock = response.content.find((c) => c.type === "text");
    const raw = textBlock && "text" in textBlock ? textBlock.text : "";

    let jsonStr = raw;
    let narration: string | undefined;
    if (isRefinement) {
      const sepIdx = raw.indexOf("\n---\n");
      if (sepIdx > 0) {
        jsonStr = raw.slice(0, sepIdx);
        narration = raw.slice(sepIdx + 5).trim();
      }
    }

    const cleaned = jsonStr
      .replace(/^\s*```(?:json)?\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    const parsed = JSON.parse(cleaned);

    const shots = Array.isArray(parsed.shots) ? parsed.shots : [];
    const duration = Number(parsed.targetDurationSec);
    const predScore = Number(parsed.predictedScore);
    const predLift = Number(parsed.predictedLift);

    const normalized = {
      targetDurationSec:
        Number.isFinite(duration) && duration >= 15 && duration <= 90
          ? Math.round(duration)
          : 30,
      predictedScore:
        Number.isFinite(predScore) && predScore >= 0 && predScore <= 10
          ? Math.round(predScore * 10) / 10
          : 8.5,
      predictedLift: Number.isFinite(predLift)
        ? Math.round(predLift * 10) / 10
        : 1.0,
      summary: String(parsed.summary ?? "Rewrite complete."),
      shots: shots.map((s: Record<string, unknown>) => ({
        line: String(s.line ?? ""),
        rewrite: String(s.rewrite ?? ""),
        camera: String(s.camera ?? ""),
        pacing: String(s.pacing ?? ""),
        targetNetwork: ["reward", "emotion", "attention", "memory"].includes(
          String(s.targetNetwork),
        )
          ? s.targetNetwork
          : "attention",
        reason: String(s.reason ?? ""),
      })),
    };

    // Log the rewrite. Fire and forget.
    void logRewrite({
      draft: body.script,
      reference: body.reference,
      targetDurationSec: normalized.targetDurationSec,
      predictedScore: normalized.predictedScore,
      predictedLift: normalized.predictedLift,
      summary: normalized.summary,
      shots: normalized.shots,
      researchContext: body.researchContext,
    }).catch(() => undefined);

    return Response.json({
      result: normalized,
      narration: narration ?? "",
      assistantRaw: raw,
      fallback: false,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "gamma engine error";
    console.error("[api/rewrite] failed:", msg);
    return Response.json({
      result: MOCK_REWRITE,
      narration: "",
      fallback: true,
      error: msg,
    });
  }
}
