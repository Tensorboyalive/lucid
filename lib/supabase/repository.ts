// Thin repository layer over the Supabase client. Every method returns null
// when Supabase is not configured, letting the product run in demo mode with
// authored fallbacks.

import { getSupabase } from "./client";
import type { Json } from "./types";
import type { BrainScores, Scene, WeaknessCallout } from "@/lib/mock";
import type { ShotDirection } from "@/lib/mock-rewrite";

interface CreatorUpsert {
  handle: string;
  displayName?: string;
  followers?: string;
  avgScore?: number;
}

export async function upsertCreator(input: CreatorUpsert): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const handle = input.handle.startsWith("@") ? input.handle : "@" + input.handle;
  const { data, error } = await sb
    .from("creators")
    .upsert(
      {
        handle,
        display_name: input.displayName ?? null,
        followers: input.followers ?? null,
        avg_score: input.avgScore ?? null,
        last_scraped: new Date().toISOString(),
      },
      { onConflict: "handle" },
    )
    .select("id")
    .single();
  if (error) return null;
  return data?.id ?? null;
}

export async function logScore(input: {
  sourceUrl?: string;
  sourceKind: "instagram_url" | "upload" | "demo";
  durationMs: number;
  scores: BrainScores;
  verdict: string;
  scenes: Scene[];
  weaknesses: WeaknessCallout[];
  topMoment: { timestamp: string; why: string };
  bottomMoment: { timestamp: string; why: string };
}): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb
    .from("scores")
    .insert({
      source_url: input.sourceUrl ?? null,
      source_kind: input.sourceKind,
      duration_ms: input.durationMs,
      overall: input.scores.overall,
      reward: input.scores.reward,
      emotion: input.scores.emotion,
      attention: input.scores.attention,
      memory: input.scores.memory,
      verdict: input.verdict,
      scenes: input.scenes as unknown as Json,
      weaknesses: input.weaknesses as unknown as Json,
      top_moment: input.topMoment as unknown as Json,
      bottom_moment: input.bottomMoment as unknown as Json,
    })
    .select("id")
    .single();
  if (error) return null;
  return data?.id ?? null;
}

export async function logRewrite(input: {
  scoreId?: string;
  draft: string;
  reference?: string;
  targetDurationSec: number;
  predictedScore: number;
  predictedLift: number;
  summary: string;
  shots: ShotDirection[];
  researchContext?: unknown;
}): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb
    .from("rewrites")
    .insert({
      score_id: input.scoreId ?? null,
      draft: input.draft,
      reference: input.reference ?? null,
      target_duration_sec: input.targetDurationSec,
      predicted_score: input.predictedScore,
      predicted_lift: input.predictedLift,
      summary: input.summary,
      shots: input.shots as unknown as Json,
      research_context: (input.researchContext ?? null) as unknown as Json,
    })
    .select("id")
    .single();
  if (error) return null;
  return data?.id ?? null;
}

export async function logRewriteTurn(
  rewriteId: string,
  role: "user" | "gamma",
  content: string,
): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  await sb.from("rewrite_turns").insert({
    rewrite_id: rewriteId,
    role,
    content,
  });
}

export async function fetchCachedCreator(
  handle: string,
): Promise<{ id: string; avgScore: number | null } | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const normalized = handle.startsWith("@") ? handle : "@" + handle;
  const { data } = await sb
    .from("creators")
    .select("id, avg_score")
    .eq("handle", normalized)
    .single();
  if (!data) return null;
  return { id: data.id, avgScore: data.avg_score };
}
