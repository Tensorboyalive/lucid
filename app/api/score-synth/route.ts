import { NextRequest } from "next/server";
import {
  getAnthropic,
  CLAUDE_MODEL,
  hasAnthropic,
} from "@/lib/providers/anthropic";
import { SCORE_WEAKNESS_SYSTEM } from "@/lib/providers/prompts";
import {
  MOCK_RESULT,
  type Scene,
  type WeaknessCallout,
} from "@/lib/mock";
import { logScore } from "@/lib/supabase/repository";
import { scoreSynthBodySchema, sanitizeForPrompt } from "@/lib/validation";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const raw = await req.json().catch(() => null);
  const parsed = scoreSynthBodySchema.safeParse(raw);
  if (!parsed.success) {
    return Response.json({ error: "invalid_body" }, { status: 400 });
  }
  const body = parsed.data;

  const anthropic = getAnthropic();
  if (!hasAnthropic() || !anthropic) {
    return Response.json({
      weaknesses: MOCK_RESULT.weaknesses,
      fallback: true,
    });
  }

  const safeSource = sanitizeForPrompt(body.sourceUrl, 200) || "uploaded reel";
  const userMessage = [
    `Source: ${safeSource}`,
    `Brain network scores: ${JSON.stringify(body.scores)}`,
    `Scene timeline (${body.scenes.length} scenes):`,
    JSON.stringify(body.scenes, null, 2),
    `Return a JSON array of 2-4 WeaknessCallout objects, ordered critical -> minor. No preface, no code fence.`,
  ].join("\n\n");

  try {
    const response = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 1600,
      system: SCORE_WEAKNESS_SYSTEM,
      messages: [{ role: "user", content: userMessage }],
    });

    const textBlock = response.content.find((c) => c.type === "text");
    const raw = textBlock && "text" in textBlock ? textBlock.text : "";
    const cleaned = raw
      .replace(/^\s*```(?:json)?\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    const parsed = JSON.parse(cleaned);
    const weaknesses = (Array.isArray(parsed) ? parsed : [])
      .slice(0, 4)
      .map((w: Record<string, unknown>) => ({
        sceneId: String(w.sceneId ?? "s1"),
        timestamp: String(w.timestamp ?? "0:00 · 0:02"),
        network: ["reward", "emotion", "attention", "memory"].includes(
          String(w.network),
        )
          ? w.network
          : "reward",
        severity: ["critical", "moderate", "minor"].includes(String(w.severity))
          ? w.severity
          : "moderate",
        issue: String(w.issue ?? ""),
        suggestion: String(w.suggestion ?? ""),
      }));

    const finalWeaknesses: WeaknessCallout[] =
      weaknesses.length > 0
        ? (weaknesses as WeaknessCallout[])
        : MOCK_RESULT.weaknesses;

    // Persist the score. Fire and forget; failures fall through silently so the
    // user experience is never blocked on the database.
    const lastScene = body.scenes[body.scenes.length - 1] as
      | (typeof body.scenes)[number]
      | undefined;
    void logScore({
      sourceUrl: body.sourceUrl,
      sourceKind: body.sourceUrl?.includes("instagram.com")
        ? "instagram_url"
        : "demo",
      durationMs:
        lastScene && typeof lastScene.endMs === "number" ? lastScene.endMs : 0,
      scores: body.scores,
      verdict: verdictForScore(body.scores.overall),
      scenes: body.scenes as unknown as Scene[],
      weaknesses: finalWeaknesses,
      topMoment: MOCK_RESULT.topMoment,
      bottomMoment: MOCK_RESULT.bottomMoment,
    }).catch(() => undefined);

    return Response.json({
      weaknesses: finalWeaknesses,
      fallback: false,
    });
  } catch (err) {
    console.error("[api/score-synth] failed:", err);
    return Response.json({
      weaknesses: MOCK_RESULT.weaknesses,
      fallback: true,
    });
  }
}

function verdictForScore(s: number): string {
  if (s >= 8.5) return "EXPLOSIVE";
  if (s >= 7.0) return "HIGH VIRAL POTENTIAL";
  if (s >= 5.5) return "MODERATE POTENTIAL";
  if (s >= 4.0) return "BELOW AVERAGE";
  return "LOW ENGAGEMENT";
}
