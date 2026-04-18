"use client";

import { motion } from "framer-motion";
import type { Scene } from "@/lib/mock";
import { cn } from "@/lib/cn";

const fmtMs = (ms: number) => {
  const s = Math.round(ms / 1000);
  return `0:${s.toString().padStart(2, "0")}`;
};

const networkColorClass: Record<Scene["weakestNetwork"], string> = {
  reward: "border-brain-red",
  emotion: "border-brain-amber",
  attention: "border-brain-cyan",
  memory: "border-brain-violet",
};

interface Props {
  scenes: Scene[];
}

export function SceneTimeline({ scenes }: Props) {
  return (
    <div className="w-full">
      <div className="mono mb-6 flex items-baseline justify-between text-[0.72rem] uppercase tracking-[0.28em] text-muted">
        <span>Scene-by-scene</span>
        <span>{scenes.length} scenes</span>
      </div>
      <ol className="flex flex-col gap-3">
        {scenes.map((s, idx) => (
          <motion.li
            key={s.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              delay: idx * 0.06,
              ease: [0.16, 1, 0.3, 1],
            }}
            className={cn(
              "grid grid-cols-12 gap-4 border-l-2 bg-paper/50 p-5 transition hover:bg-paper",
              networkColorClass[s.weakestNetwork],
            )}
          >
            <div className="col-span-12 md:col-span-2">
              <div className="mono text-[0.7rem] uppercase tracking-[0.22em] text-muted">
                scene {idx + 1}
              </div>
              <div className="mono mt-1 text-[0.9rem] text-ink">
                {fmtMs(s.startMs)}–{fmtMs(s.endMs)}
              </div>
              <div className="mono mt-3 inline-flex rounded-full bg-ink/5 px-2 py-0.5 text-[0.62rem] uppercase tracking-[0.2em] text-muted">
                {s.dominantEmotion}
              </div>
            </div>
            <div className="col-span-12 md:col-span-6">
              <div className="serif-italic text-[clamp(1rem, calc(0.9rem + 0.4vw), 1.15rem)] leading-[1.4]">
                “{s.transcript}”
              </div>
              <div className="mono mt-3 text-[0.72rem] uppercase tracking-[0.22em] text-muted">
                seen · <span className="normal-case tracking-normal text-ink/70">{s.visual}</span>
              </div>
              <div className="mono mt-1.5 text-[0.72rem] uppercase tracking-[0.22em] text-muted">
                heard · <span className="normal-case tracking-normal text-ink/70">{s.audio}</span>
              </div>
            </div>
            <div className="col-span-12 md:col-span-4">
              <div className="flex items-baseline justify-between border-b border-ink/15 pb-1">
                <span className="mono text-[0.68rem] uppercase tracking-[0.22em] text-muted">
                  strongest
                </span>
                <span className="mono text-[0.78rem] uppercase tracking-[0.2em] text-ink">
                  {s.strongestNetwork}
                </span>
              </div>
              <div className="mt-2 flex items-baseline justify-between border-b border-ink/15 pb-1">
                <span className="mono text-[0.68rem] uppercase tracking-[0.22em] text-muted">
                  weakest
                </span>
                <span
                  className={cn(
                    "mono text-[0.78rem] uppercase tracking-[0.2em]",
                    s.weakestNetwork === "reward" && "text-brain-red",
                    s.weakestNetwork === "emotion" && "text-brain-amber",
                    s.weakestNetwork === "attention" && "text-brain-cyan",
                    s.weakestNetwork === "memory" && "text-brain-violet",
                  )}
                >
                  {s.weakestNetwork}
                </span>
              </div>
            </div>
          </motion.li>
        ))}
      </ol>
    </div>
  );
}
