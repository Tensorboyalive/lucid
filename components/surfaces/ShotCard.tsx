"use client";

import { motion } from "framer-motion";
import type { ShotDirection } from "@/lib/mock-rewrite";
import { cn } from "@/lib/cn";

const netClass: Record<ShotDirection["targetNetwork"], string> = {
  reward: "text-brain-red border-brain-red",
  emotion: "text-brain-amber border-brain-amber",
  attention: "text-brain-cyan border-brain-cyan",
  memory: "text-brain-violet border-brain-violet",
};

interface Props {
  shot: ShotDirection;
  index: number;
}

export function ShotCard({ shot, index }: Props) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "grid grid-cols-12 gap-6 border-l-2 bg-paper p-6 md:p-8",
        netClass[shot.targetNetwork],
      )}
    >
      <div className="col-span-12 md:col-span-2">
        <div className="mono text-[0.7rem] uppercase tracking-[0.24em] text-muted">
          shot 0{index + 1}
        </div>
        <div
          className={cn(
            "mono mt-2 inline-flex rounded-full px-2 py-0.5 text-[0.6rem] uppercase tracking-[0.22em]",
            netClass[shot.targetNetwork],
          )}
        >
          {shot.targetNetwork}
        </div>
      </div>
      <div className="col-span-12 md:col-span-6">
        <div className="mono text-[0.68rem] uppercase tracking-[0.26em] text-muted">
          original
        </div>
        <div className="serif-italic mt-2 text-ink/60 line-through decoration-ink/30">
          {shot.line}
        </div>
        <div className="mono mt-5 text-[0.68rem] uppercase tracking-[0.26em] text-viral">
          rewrite
        </div>
        <div
          className="serif mt-2 leading-[1.2]"
          style={{ fontSize: "clamp(1.1rem, calc(1rem + 0.6vw), 1.6rem)" }}
        >
          {shot.rewrite}
        </div>
      </div>
      <div className="col-span-12 md:col-span-4">
        <div className="mono text-[0.68rem] uppercase tracking-[0.26em] text-muted">
          camera
        </div>
        <p className="mt-1.5 text-[0.92rem] leading-[1.5] text-ink/80">
          {shot.camera}
        </p>
        <div className="mono mt-4 text-[0.68rem] uppercase tracking-[0.26em] text-muted">
          pacing
        </div>
        <p className="mt-1.5 text-[0.92rem] leading-[1.5] text-ink/80">
          {shot.pacing}
        </p>
        <div className="mono mt-4 text-[0.68rem] uppercase tracking-[0.26em] text-muted">
          why it fires
        </div>
        <p className="mt-1.5 text-[0.92rem] leading-[1.5] text-ink/80">
          {shot.reason}
        </p>
      </div>
    </motion.article>
  );
}
