"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/cn";

interface Turn {
  role: "user" | "gamma";
  content: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  turns: Turn[];
  refining: boolean;
  input: string;
  onInput: (v: string) => void;
  onSend: (v: string) => void;
  suggestions: string[];
}

export function ChatDrawer({
  open,
  onClose,
  turns,
  refining,
  input,
  onInput,
  onSend,
  suggestions,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [turns.length, refining, open]);

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-ink/30 backdrop-blur-sm"
            aria-hidden
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.aside
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="fixed right-0 top-0 z-50 flex h-[100dvh] w-[min(520px,94vw)] flex-col bg-paper shadow-[0_0_60px_rgba(0,0,0,0.25)]"
            role="dialog"
            aria-label="Gamma engine chat"
          >
            <div className="flex items-center justify-between border-b border-ink/15 px-6 py-5">
              <div>
                <div className="mono text-[0.62rem] uppercase tracking-[0.26em] text-viral">
                  Gamma engine
                </div>
                <div className="serif-italic mt-0.5 text-[1.05rem] text-ink">
                  keep sharpening
                </div>
              </div>
              <button
                onClick={onClose}
                className="mono flex h-9 w-9 items-center justify-center rounded-full border border-ink/20 text-[0.9rem] text-ink transition hover:border-viral hover:text-viral"
                aria-label="Close chat"
              >
                ✕
              </button>
            </div>

            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-6 py-6"
            >
              {turns.map((t, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={cn(
                    "mb-5 max-w-[94%]",
                    t.role === "user" && "ml-auto text-right",
                  )}
                >
                  <div
                    className={cn(
                      "mono mb-1 text-[0.6rem] uppercase tracking-[0.22em]",
                      t.role === "user" ? "text-ink/50" : "text-viral",
                    )}
                  >
                    {t.role === "user" ? "you" : "gamma engine"}
                  </div>
                  <div
                    className={cn(
                      "inline-block rounded-sm px-4 py-3 text-[0.95rem] leading-[1.55]",
                      t.role === "user"
                        ? "bg-ink text-cream"
                        : "border border-ink/15 bg-cream text-ink",
                    )}
                  >
                    {t.content}
                  </div>
                </motion.div>
              ))}
              {refining && (
                <div className="mono flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.22em] text-muted">
                  <span className="flex gap-1">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-viral" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-viral [animation-delay:120ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-viral [animation-delay:240ms]" />
                  </span>
                  rewriting
                </div>
              )}
            </div>

            <div className="border-t border-ink/15 px-6 py-4">
              <div className="mb-3 flex flex-wrap gap-1.5">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => onSend(s)}
                    disabled={refining}
                    className="mono rounded-full border border-ink/20 px-2.5 py-1 text-[0.62rem] uppercase tracking-[0.2em] text-muted transition hover:border-viral hover:text-viral disabled:opacity-40"
                  >
                    {s}
                  </button>
                ))}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  onSend(input);
                }}
                className="flex items-center gap-3"
              >
                <input
                  value={input}
                  onChange={(e) => onInput(e.target.value)}
                  placeholder="Ask Gamma to tweak a shot"
                  className="flex-1 border-b border-ink/30 bg-transparent pb-2 text-[0.98rem] outline-none placeholder:text-ink/30 focus:border-viral"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || refining}
                  className="mono rounded-full bg-ink px-4 py-2 text-[0.68rem] uppercase tracking-[0.22em] text-cream transition hover:bg-viral disabled:opacity-40"
                >
                  Send
                </button>
              </form>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
