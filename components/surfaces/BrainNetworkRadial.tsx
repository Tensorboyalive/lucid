"use client";

import { motion } from "framer-motion";
import type { BrainScores } from "@/lib/mock";

interface Props {
  scores: BrainScores;
  size?: number;
  showLegend?: boolean;
}

// Sky brain. A stylized top-down brain silhouette with four glowing activation
// regions. Each region's opacity + scale is driven by its network's score.
// Inspired by the cortical surface heatmaps used in fMRI visualizations.

const NETWORKS = [
  {
    key: "reward",
    label: "Reward",
    sublabel: "orbitofrontal",
    color: "#E85D1C",
    // anterior frontal zones (near the front of the brain)
    blobs: [
      { cx: 50, cy: 18, rx: 18, ry: 12 },
      { cx: 50, cy: 28, rx: 12, ry: 8 },
    ],
  },
  {
    key: "emotion",
    label: "Emotion",
    sublabel: "insula · cingulate",
    color: "#D97706",
    // deep mid-brain zones (centered)
    blobs: [
      { cx: 38, cy: 50, rx: 10, ry: 12 },
      { cx: 62, cy: 50, rx: 10, ry: 12 },
    ],
  },
  {
    key: "attention",
    label: "Attention",
    sublabel: "parietal · frontal",
    color: "#0E7C86",
    // upper-lateral zones (parietal)
    blobs: [
      { cx: 25, cy: 38, rx: 14, ry: 14 },
      { cx: 75, cy: 38, rx: 14, ry: 14 },
    ],
  },
  {
    key: "memory",
    label: "Memory",
    sublabel: "parahippocampal · DMN",
    color: "#6D28D9",
    // posterior zones (back of the brain)
    blobs: [
      { cx: 35, cy: 74, rx: 12, ry: 10 },
      { cx: 65, cy: 74, rx: 12, ry: 10 },
      { cx: 50, cy: 82, rx: 14, ry: 8 },
    ],
  },
] as const;

// Top-down brain silhouette (stylized). Two hemispheres with a central fissure.
const BRAIN_PATH = `
  M 50 5
  C 30 5, 10 20, 10 50
  C 10 80, 30 95, 50 95
  C 70 95, 90 80, 90 50
  C 90 20, 70 5, 50 5
  Z
`.trim();

// Central fissure (line down the middle)
const FISSURE_PATH = "M 50 8 Q 48 35, 50 50 Q 52 65, 50 92";

// Gyri lines (brain folds) for texture
const GYRI = [
  "M 20 30 Q 30 32, 40 30",
  "M 60 30 Q 70 32, 80 30",
  "M 18 45 Q 28 47, 38 45",
  "M 62 45 Q 72 47, 82 45",
  "M 22 60 Q 32 62, 42 60",
  "M 58 60 Q 68 62, 78 60",
  "M 25 75 Q 35 77, 45 75",
  "M 55 75 Q 65 77, 75 75",
];

export function BrainNetworkRadial({
  scores,
  size = 360,
  showLegend = true,
}: Props) {
  return (
    <div className="flex flex-col items-center gap-6">
      <svg
        viewBox="0 0 100 100"
        className="w-full"
        style={{ maxWidth: size, aspectRatio: "1" }}
        aria-label="Sky brain activation map"
      >
        <defs>
          {NETWORKS.map((n) => (
            <radialGradient
              key={n.key}
              id={`glow-${n.key}`}
              cx="50%"
              cy="50%"
              r="50%"
            >
              <stop offset="0%" stopColor={n.color} stopOpacity="0.9" />
              <stop offset="55%" stopColor={n.color} stopOpacity="0.45" />
              <stop offset="100%" stopColor={n.color} stopOpacity="0" />
            </radialGradient>
          ))}
          <filter id="brain-blur">
            <feGaussianBlur stdDeviation="1.2" />
          </filter>
          <filter id="blob-glow">
            <feGaussianBlur stdDeviation="1.5" />
          </filter>
        </defs>

        <path
          d={BRAIN_PATH}
          fill="#FAF7F0"
          stroke="#0A0A0A"
          strokeOpacity={0.35}
          strokeWidth={0.6}
        />

        {GYRI.map((d, i) => (
          <path
            key={i}
            d={d}
            fill="none"
            stroke="#0A0A0A"
            strokeOpacity={0.12}
            strokeWidth={0.35}
            strokeLinecap="round"
          />
        ))}

        <path
          d={FISSURE_PATH}
          fill="none"
          stroke="#0A0A0A"
          strokeOpacity={0.18}
          strokeWidth={0.5}
        />

        <g clipPath="url(#brain-clip)">
          <defs>
            <clipPath id="brain-clip">
              <path d={BRAIN_PATH} />
            </clipPath>
          </defs>
          {NETWORKS.map((n) => {
            const score = scores[n.key];
            const intensity = Math.min(1, Math.max(0.15, score / 10));
            return (
              <g key={n.key}>
                {n.blobs.map((blob, i) => (
                  <motion.ellipse
                    key={i}
                    cx={blob.cx}
                    cy={blob.cy}
                    rx={blob.rx}
                    ry={blob.ry}
                    fill={`url(#glow-${n.key})`}
                    filter="url(#blob-glow)"
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{
                      opacity: intensity,
                      scale: 0.85 + intensity * 0.25,
                    }}
                    style={{ transformOrigin: `${blob.cx}px ${blob.cy}px` }}
                    transition={{
                      duration: 1.1,
                      delay: i * 0.08,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  />
                ))}
              </g>
            );
          })}
        </g>

        {/* Pulse rings on the most-activated region */}
        {(() => {
          const ranked = NETWORKS.slice().sort(
            (a, b) => scores[b.key] - scores[a.key],
          );
          const top = ranked[0];
          const primaryBlob = top.blobs[0];
          return (
            <motion.circle
              cx={primaryBlob.cx}
              cy={primaryBlob.cy}
              r={primaryBlob.rx}
              fill="none"
              stroke={top.color}
              strokeOpacity={0.5}
              strokeWidth={0.4}
              initial={{ scale: 1, opacity: 0.8 }}
              animate={{
                scale: [1, 1.6, 1],
                opacity: [0.7, 0, 0.7],
              }}
              style={{ transformOrigin: `${primaryBlob.cx}px ${primaryBlob.cy}px` }}
              transition={{
                duration: 2.4,
                repeat: Infinity,
                ease: "easeOut",
              }}
            />
          );
        })()}
      </svg>

      {showLegend && (
        <dl className="grid w-full grid-cols-2 gap-x-6 gap-y-2 md:grid-cols-4">
          {NETWORKS.map((n) => (
            <div key={n.key} className="flex items-center gap-2">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{
                  background: n.color,
                  opacity: Math.max(0.3, scores[n.key] / 10),
                  boxShadow: `0 0 10px ${n.color}60`,
                }}
              />
              <div>
                <dt className="mono text-[0.65rem] uppercase tracking-[0.22em] text-muted">
                  {n.label}
                </dt>
                <dd
                  className="mono text-[0.88rem]"
                  style={{ color: n.color }}
                >
                  {scores[n.key].toFixed(1)}
                </dd>
              </div>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
