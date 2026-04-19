import { NextRequest } from "next/server";
import { streamClaude, hasAnthropic } from "@/lib/providers/anthropic";
import { VIRAL_ENGINE_SYSTEM } from "@/lib/providers/prompts";
import {
  chatBodySchema,
  sanitizeForPrompt,
  type ChatBodyValidated,
} from "@/lib/validation";

export const runtime = "nodejs";
export const maxDuration = 60;

function buildResearchContext(body: ChatBodyValidated): string {
  if (!body.researchHandle) return "";
  const handle = sanitizeForPrompt(body.researchHandle, 100);
  const reelLines = (body.researchReels ?? [])
    .slice(0, 10)
    .map(
      (r, i) =>
        `  - ${sanitizeForPrompt(r.id, 100)} (${i + 1}): "${sanitizeForPrompt(r.caption, 500)}" · ${sanitizeForPrompt(r.hookType, 80) || "—"} · ${sanitizeForPrompt(r.views, 30) || "—"} views${
          r.scoreEstimate !== undefined ? ` · ~${r.scoreEstimate}/10` : ""
        }`,
    )
    .join("\n");
  const patternLines = (body.researchPatterns ?? [])
    .map(
      (p) =>
        `  - ${sanitizeForPrompt(p.title, 120)}: ${sanitizeForPrompt(p.body, 600)}`,
    )
    .join("\n");
  const reelsBlock = reelLines
    ? `Top reels:\n${reelLines}\n\n`
    : "Live scrape did not return reels for this creator. Speak in general neuro-viral patterns and reference the handle directly.\n\n";
  const patternsBlock = patternLines
    ? `Patterns the Gamma engine has already identified:\n${patternLines}`
    : "";
  return `Research context for ${handle}:\n\n${reelsBlock}${patternsBlock}`;
}

export async function POST(req: NextRequest) {
  const raw = await req.json().catch(() => null);
  const parsed = chatBodySchema.safeParse(raw);
  if (!parsed.success) {
    return Response.json({ error: "invalid_body" }, { status: 400 });
  }
  const body = parsed.data;
  const researchContext = buildResearchContext(body);

  const system =
    VIRAL_ENGINE_SYSTEM + (researchContext ? "\n\n" + researchContext : "");

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      const send = (data: unknown) =>
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(data)}\n\n`),
        );

      if (!hasAnthropic()) {
        send({ type: "error", message: "ANTHROPIC_API_KEY not configured" });
        controller.close();
        return;
      }

      try {
        for await (const delta of streamClaude(system, body.messages, {
          maxTokens: 800,
        })) {
          if (delta.type === "text" && delta.text) {
            send({ type: "text", text: delta.text });
          } else if (delta.type === "error") {
            send({ type: "error", message: delta.error });
          }
        }
        send({ type: "done" });
      } catch (err) {
        send({
          type: "error",
          message: err instanceof Error ? err.message : "stream error",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
