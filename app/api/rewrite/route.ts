import { NextRequest } from "next/server";
import {
  getAnthropic,
  CLAUDE_MODEL,
  hasAnthropic,
} from "@/lib/providers/anthropic";
import { REWRITE_SYSTEM, REWRITE_REFINEMENT_SYSTEM } from "@/lib/providers/prompts";
import { MOCK_REWRITE } from "@/lib/mock-rewrite";
import { logRewrite } from "@/lib/supabase/repository";
import {
  rewriteBodySchema,
  sanitizeForPrompt,
  type RewriteBodyValidated,
} from "@/lib/validation";

export const runtime = "nodejs";
export const maxDuration = 120;

type ResearchContextShape = NonNullable<RewriteBodyValidated["researchContext"]>;

/** Keep previousPlan prompt interpolation bounded so a pathological history
 *  can't balloon the context window silently. */
const MAX_PREVIOUS_PLAN_CHARS = 8000;

/**
 * Build the research-context prompt block. Every string that came from the
 * browser is pushed through `sanitizeForPrompt` first: `researchContext`
 * can be sourced from Apify's scrape of Instagram captions, which is
 * attacker-influenced territory. A caption that says "ignore previous
 * instructions" reaches the Gamma prompt otherwise.
 */
function formatResearchContext(ctx: ResearchContextShape | undefined): string {
  if (!ctx?.profile) return "";
  const { handle, name, patterns, topReelCaptions } = ctx.profile;
  const blocks: string[] = [];
  const creatorLabel = sanitizeForPrompt(handle ?? name ?? "a creator", 120);
  blocks.push(
    `Research context active. The user just analyzed ${creatorLabel}.`,
  );
  if (patterns && patterns.length > 0) {
    blocks.push(
      "Patterns observed in their top reels:\n" +
        patterns
          .map(
            (p, i) =>
              `  ${i + 1}. ${sanitizeForPrompt(p.title, 120)}: ${sanitizeForPrompt(p.body, 600)}`,
          )
          .join("\n"),
    );
  }
  if (topReelCaptions && topReelCaptions.length > 0) {
    blocks.push(
      "Top reel captions from the scraped feed:\n" +
        topReelCaptions
          .map(
            (r) =>
              `  ${sanitizeForPrompt(r.id, 80)} (${sanitizeForPrompt(r.views, 30)} views, ${sanitizeForPrompt(r.hookType, 80)}): "${sanitizeForPrompt(r.caption, 500)}"`,
          )
          .join("\n"),
    );
  }
  blocks.push(
    "Weave in these patterns when relevant. Cite reel IDs when the rewrite mirrors a specific hook.",
  );
  return blocks.join("\n\n");
}

export async function POST(req: NextRequest) {
  const raw = await req.json().catch(() => null);
  const parsed = rewriteBodySchema.safeParse(raw);
  if (!parsed.success) {
    return Response.json({ error: "invalid_body" }, { status: 400 });
  }
  const body = parsed.data;

  const isRefinement = Boolean(
    body.message && body.history && body.previousPlan,
  );

  if (!isRefinement && (!body.script || body.script.trim().length < 10)) {
    return Response.json({ error: "script_too_short" }, { status: 400 });
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
  const baseSystem = isRefinement ? REWRITE_REFINEMENT_SYSTEM : REWRITE_SYSTEM;
  const system = researchBlock
    ? `${baseSystem}\n\n${researchBlock}`
    : baseSystem;

  const safeReference = sanitizeForPrompt(body.reference, 200);
  const scriptTrimmed = body.script.trim().slice(0, 8000);

  let userMessage: string;
  if (isRefinement) {
    const previousPlanStr = JSON.stringify(body.previousPlan, null, 2).slice(
      0,
      MAX_PREVIOUS_PLAN_CHARS,
    );
    const safeMessage = sanitizeForPrompt(body.message, 4000);
    userMessage = [
      `Original draft:\n\`\`\`\n${scriptTrimmed}\n\`\`\``,
      safeReference ? `Reference: ${safeReference}` : undefined,
      `Current plan (previous Gamma output):\n\`\`\`json\n${previousPlanStr}\n\`\`\``,
      `User's refinement: ${safeMessage}`,
      `Return the updated full plan JSON, then a separator, then narration.`,
    ]
      .filter(Boolean)
      .join("\n\n");
  } else {
    userMessage = [
      `Draft script:\n\`\`\`\n${scriptTrimmed}\n\`\`\``,
      safeReference ? `Reference reel / creator: ${safeReference}` : undefined,
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
      // Only expose the raw model output in dev — prevents leaking reasoning,
      // partial JSON, and SDK-wrapped response bodies to the browser in prod.
      ...(process.env.NODE_ENV !== "production" && { assistantRaw: raw }),
      fallback: false,
    });
  } catch (err) {
    console.error("[api/rewrite] failed:", err);
    return Response.json({
      result: MOCK_REWRITE,
      narration: "",
      fallback: true,
      error: "rewrite_engine_unavailable",
    });
  }
}
