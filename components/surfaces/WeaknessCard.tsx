"use client";

import { motion } from "framer-motion";
import type { WeaknessCallout } from "@/lib/mock";
import { cn } from "@/lib/cn";

const severityClass: Record<WeaknessCallout["severity"], string> = {
  critical: "bg-brain-red text-cream",
  moderate: "bg-brain-amber text-ink",
  minor: "bg-paper text-ink border border-ink/20",
};

const networkClass: Record<WeaknessCallout["network"], string> = {
  reward: "text-brain-red",
  emotion: "text-brain-amber",
  attention: "text-brain-cyan",
  memory: "text-brain-violet",
};

interface Props {
  weakness: WeaknessCallout;
  index: number;
}

export function WeaknessCard({ weakness, index }: Props) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="grid grid-cols-12 gap-6 rounded-sm bg-cream p-7 md:p-9"
    >
      <div className="col-span-12 md:col-span-3">
        <span
          className={cn(
            "mono inline-flex items-center rounded-full px-3 py-1 text-[0.65rem] uppercase tracking-[0.22em]",
            severityClass[weakness.severity],
          )}
        >
          {weakness.severity}
        </span>
        <div className="mono mt-4 text-[0.72rem] uppercase tracking-[0.22em] text-muted">
          {weakness.timestamp}
        </div>
        <div
          className={cn(
            "mono mt-1 text-[0.78rem] uppercase tracking-[0.2em]",
            networkClass[weakness.network],
          )}
        >
          {weakness.network} net
        </div>
      </div>
      <div className="col-span-12 md:col-span-9">
        <h3
          className="serif leading-[1.15]"
          style={{ fontSize: "clamp(1.25rem, calc(1rem + 0.8vw), 1.8rem)" }}
        >
          {weakness.issue}
        </h3>
        <p className="mono mt-5 text-[0.7rem] uppercase tracking-[0.28em] text-muted">
          suggestion
        </p>
        <p className="mt-2 text-[1.02rem] leading-[1.6] text-ink/85">
          {weakness.suggestion}
        </p>
      </div>
    </motion.article>
  );
}
