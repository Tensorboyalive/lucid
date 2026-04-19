import Anthropic from "@anthropic-ai/sdk";

export const CLAUDE_MODEL =
  process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6";

let _client: Anthropic | null = null;

function getClient(): Anthropic | null {
  if (_client) return _client;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  _client = new Anthropic({ apiKey });
  return _client;
}

export function hasAnthropic(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}

export function getAnthropic(): Anthropic | null {
  return getClient();
}

export interface StreamDelta {
  type: "text" | "done" | "error";
  text?: string;
  error?: string;
}

export async function* streamClaude(
  system: string,
  messages: { role: "user" | "assistant"; content: string }[],
  opts: { maxTokens?: number; model?: string } = {},
): AsyncGenerator<StreamDelta> {
  const client = getClient();
  if (!client) {
    yield {
      type: "error",
      error: "ANTHROPIC_API_KEY not set — check .env.local or Vercel project env vars",
    };
    return;
  }
  try {
    const stream = await client.messages.stream({
      model: opts.model ?? CLAUDE_MODEL,
      max_tokens: opts.maxTokens ?? 1800,
      system,
      messages,
    });
    for await (const event of stream) {
      if (
        event.type === "content_block_delta" &&
        event.delta.type === "text_delta"
      ) {
        yield { type: "text", text: event.delta.text };
      }
    }
    yield { type: "done" };
  } catch (err) {
    yield {
      type: "error",
      error: err instanceof Error ? err.message : "unknown claude error",
    };
  }
}
