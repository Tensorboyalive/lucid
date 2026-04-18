"use client";

import { motion } from "framer-motion";

interface Props {
  label: string;
  pct: number;
}

export function StreamStatus({ label, pct }: Props) {
  return (
    <div className="w-full">
      <div className="mono flex items-baseline justify-between text-[0.72rem] uppercase tracking-[0.26em] text-muted">
        <span>{label}</span>
        <span>{Math.round(pct * 100)}%</span>
      </div>
      <div className="relative mt-3 h-[2px] w-full overflow-hidden bg-ink/10">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct * 100}%` }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="absolute left-0 top-0 h-full bg-viral"
        />
      </div>
    </div>
  );
}
