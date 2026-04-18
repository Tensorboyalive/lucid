"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ChatTurn } from "@/lib/mock-research";
import { cn } from "@/lib/cn";

interface Props {
  initial: ChatTurn[];
  /** Called when a mock fallback is needed. Return the full mock reply. */
  onSend: (prompt: string) => Promise<ChatTurn>;
  /** Optional research handle to anchor Claude responses. */
  researchHandle?: string;
  /** If true, stream from /api/chat with fallback to onSend. Default true. */
  live?: boolean;
}

const suggestions = [
  "What's the hook pattern?",
  "How do the emotional beats pace?",
  "What duration should I target?",
  "What's the memory anchor?",
];

export function ChatPanel({
  initial,
  onSend,
  researchHandle,
  live = true,
}: Props) {
  const [turns, setTurns] = useState<ChatTurn[]>(initial);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [streaming, setStreaming] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [turns.length, pending, streaming]);

  async function send(prompt: string) {
    if (!prompt.trim() || pending) return;
    const nextTurns: ChatTurn[] = [
      ...turns,
      { role: "user" as const, content: prompt },
    ];
    setTurns(nextTurns);
    setInput("");
    setPending(true);
    setStreaming("");

    if (live) {
      const ok = await tryLiveStream(nextTurns, (delta) => {
        setStreaming((s) => s + delta);
      });
      if (ok.success && ok.text) {
        setTurns((t) => [...t, { role: "viral-engine", content: ok.text! }]);
        setStreaming("");
        setPending(false);
        return;
      }
    }

    const reply = await onSend(prompt);
    setTurns((t) => [...t, reply]);
    setStreaming("");
    setPending(false);
  }

  async function tryLiveStream(
    history: ChatTurn[],
    onDelta: (text: string) => void,
  ): Promise<{ success: boolean; text?: string }> {
    try {
      const messages = history.map((t) => ({
        role: t.role === "user" ? ("user" as const) : ("assistant" as const),
        content: t.content,
      }));
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages, researchHandle }),
      });
      if (!res.ok || !res.body) return { success: false };
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let assembled = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const evt = JSON.parse(line.slice(6));
            if (evt.type === "text" && evt.text) {
              assembled += evt.text;
              onDelta(evt.text);
            } else if (evt.type === "error") {
              return { success: false };
            }
          } catch {}
        }
      }
      return { success: assembled.length > 0, text: assembled };
    } catch {
      return { success: false };
    }
  }

  return (
    <div className="flex h-[640px] max-h-[75vh] flex-col overflow-hidden rounded-sm border border-ink/15 bg-paper">
      <div className="flex items-center justify-between border-b border-ink/15 px-5 py-3">
        <div className="mono text-[0.7rem] uppercase tracking-[0.24em] text-muted">
          chat · viral engine
        </div>
        <div className="mono inline-flex items-center gap-2 rounded-full bg-viral/10 px-2 py-0.5 text-[0.62rem] uppercase tracking-[0.22em] text-viral">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-viral" />
          online
        </div>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-6">
        <AnimatePresence initial={false}>
          {turns.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                "mb-5 max-w-[92%]",
                t.role === "user" ? "ml-auto text-right" : "",
              )}
            >
              <div
                className={cn(
                  "mono mb-1 text-[0.62rem] uppercase tracking-[0.22em]",
                  t.role === "user" ? "text-ink/50" : "text-viral",
                )}
              >
                {t.role === "user" ? "you" : "viral engine"}
              </div>
              <div
                className={cn(
                  "inline-block rounded-sm px-4 py-3 text-[0.96rem] leading-[1.5]",
                  t.role === "user"
                    ? "bg-ink text-cream"
                    : "border border-ink/15 bg-cream text-ink",
                )}
              >
                {t.content}
              </div>
              {t.anchors && t.anchors.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {t.anchors.map((a) => (
                    <span
                      key={a.reelId}
                      className="mono rounded-full border border-ink/15 bg-paper px-2 py-0.5 text-[0.6rem] uppercase tracking-[0.22em] text-muted"
                    >
                      {a.reelId} · {a.reason.slice(0, 40)}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        {pending && streaming && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 max-w-[92%]"
          >
            <div className="mono mb-1 text-[0.62rem] uppercase tracking-[0.22em] text-viral">
              viral engine
            </div>
            <div className="inline-block rounded-sm border border-ink/15 bg-cream px-4 py-3 text-[0.96rem] leading-[1.5]">
              {streaming}
              <span className="ml-1 inline-block h-4 w-[2px] animate-pulse bg-viral align-middle" />
            </div>
          </motion.div>
        )}
        {pending && !streaming && (
          <div className="mono flex items-center gap-2 text-[0.72rem] uppercase tracking-[0.22em] text-muted">
            <span className="flex gap-1">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-viral" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-viral [animation-delay:120ms]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-viral [animation-delay:240ms]" />
            </span>
            thinking
          </div>
        )}
      </div>
      <div className="border-t border-ink/15 px-5 py-4">
        <div className="mb-3 flex flex-wrap gap-1.5">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              disabled={pending}
              className="mono rounded-full border border-ink/20 px-2.5 py-1 text-[0.62rem] uppercase tracking-[0.2em] text-muted transition hover:border-viral hover:text-viral disabled:opacity-40"
            >
              {s}
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-center gap-3"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask the viral engine…"
            className="flex-1 border-b border-ink/30 bg-transparent pb-2 text-[0.98rem] outline-none placeholder:text-ink/30 focus:border-viral"
          />
          <button
            type="submit"
            disabled={!input.trim() || pending}
            className="mono rounded-full bg-ink px-4 py-2 text-[0.68rem] uppercase tracking-[0.22em] text-cream transition hover:bg-viral disabled:opacity-40"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
