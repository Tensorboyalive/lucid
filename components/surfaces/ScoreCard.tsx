"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { BrainScores } from "@/lib/mock";

const verdictForScore = (s: number) => {
  if (s >= 8.5) return { label: "EXPLOSIVE", tone: "text-viral" };
  if (s >= 7.0) return { label: "HIGH VIRAL POTENTIAL", tone: "text-viral" };
  if (s >= 5.5) return { label: "MODERATE POTENTIAL", tone: "text-brain-amber" };
  if (s >= 4.0) return { label: "BELOW AVERAGE", tone: "text-brain-red" };
  return { label: "LOW ENGAGEMENT", tone: "text-brain-red" };
};

interface Props {
  scores: BrainScores;
  animate?: boolean;
}

export function ScoreCard({ scores, animate = true }: Props) {
  const [displayed, setDisplayed] = useState(animate ? 0 : scores.overall);

  useEffect(() => {
    if (!animate) return;
    const duration = 1400;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayed(eased * scores.overall);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [scores.overall, animate]);

  const verdict = verdictForScore(scores.overall);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-baseline gap-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="serif leading-[0.88] text-ink"
          style={{ fontSize: "clamp(6rem, calc(3rem + 8vw), 13rem)" }}
        >
          {displayed.toFixed(1)}
        </motion.div>
        <div className="pb-5">
          <div className="mono text-[0.72rem] uppercase tracking-[0.28em] text-muted">
            out of 10
          </div>
          <div className={`serif-italic mt-2 text-[clamp(1.1rem, calc(1rem + 0.6vw), 1.6rem)] ${verdict.tone}`}>
            {verdict.label.toLowerCase()}
          </div>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-x-10 gap-y-4 md:grid-cols-4">
        {(
          [
            ["Reward", scores.reward, "text-brain-red", "30%"],
            ["Emotion", scores.emotion, "text-brain-amber", "25%"],
            ["Attention", scores.attention, "text-brain-cyan", "25%"],
            ["Memory", scores.memory, "text-brain-violet", "20%"],
          ] as const
        ).map(([label, value, toneClass, weight]) => (
          <div key={label} className="border-t border-ink/15 pt-3">
            <div className="mono flex items-baseline justify-between text-[0.7rem] uppercase tracking-[0.22em] text-muted">
              <span>{label}</span>
              <span>{weight}</span>
            </div>
            <div
              className={`serif mt-2 leading-none ${toneClass}`}
              style={{ fontSize: "clamp(2rem, calc(1rem + 2vw), 3.2rem)" }}
            >
              {value.toFixed(1)}
            </div>
          </div>
        ))}
      </dl>
    </div>
  );
}
