"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { ReelRow } from "@/lib/mock-research";
import { cn } from "@/lib/cn";

interface Props {
  reels: ReelRow[];
  activeId?: string | null;
}

function isImageThumb(value: string): boolean {
  return /^(https?:)?\/\//i.test(value) && !value.startsWith("linear-gradient");
}

function fallbackGradient(i: number): string {
  const pairs = [
    ["#C53030", "#6D28D9"],
    ["#E85D1C", "#C53030"],
    ["#0E7C86", "#6D28D9"],
    ["#D97706", "#E85D1C"],
    ["#6D28D9", "#0E7C86"],
    ["#C53030", "#D97706"],
    ["#E85D1C", "#6D28D9"],
    ["#0E7C86", "#D97706"],
  ];
  const p = pairs[i % pairs.length];
  return `linear-gradient(135deg,${p[0]},${p[1]})`;
}

export function ReelGrid({ reels, activeId }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {reels.map((r, i) => (
        <ReelCard key={r.id} reel={r} index={i} activeId={activeId} />
      ))}
    </div>
  );
}

function ReelCard({
  reel,
  index,
  activeId,
}: {
  reel: ReelRow;
  index: number;
  activeId?: string | null;
}) {
  const initialImage = isImageThumb(reel.thumbnail);
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = initialImage && !imageFailed;
  const gradient = initialImage ? fallbackGradient(index) : reel.thumbnail;

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.05,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={cn(
        "flex flex-col overflow-hidden rounded-sm border border-ink/15 bg-paper transition",
        activeId === reel.id && "border-viral ring-2 ring-viral/20",
      )}
    >
      <div
        className="relative aspect-[9/16] w-full overflow-hidden"
        style={{ background: gradient }}
      >
        {showImage && (
          <img
            src={reel.thumbnail}
            alt={reel.caption}
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setImageFailed(true)}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/25 to-transparent" />
        <div className="mono absolute left-3 top-3 inline-flex rounded-full bg-cream px-2 py-0.5 text-[0.6rem] uppercase tracking-[0.2em] text-ink">
          {reel.views} views
        </div>
        <div className="absolute bottom-3 left-3 right-3">
          <div className="mono text-[0.6rem] uppercase tracking-[0.22em] text-cream/85">
            {reel.hookType}
          </div>
          <div
            className="serif-italic mt-1 text-cream"
            style={{
              fontSize: "clamp(0.9rem, calc(0.85rem + 0.3vw), 1.05rem)",
              lineHeight: 1.15,
              textShadow: "0 1px 3px rgba(0,0,0,0.6)",
            }}
          >
            {reel.caption.length > 60
              ? reel.caption.slice(0, 58) + "…"
              : reel.caption}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between p-3">
        <div className="mono text-[0.62rem] uppercase tracking-[0.2em] text-muted">
          {reel.durationSec}s
        </div>
        <div className="mono text-[0.8rem] text-viral">
          {reel.scoreEstimate.toFixed(1)}
        </div>
      </div>
    </motion.article>
  );
}
