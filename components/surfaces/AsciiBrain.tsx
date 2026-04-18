"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import type { BrainScores } from "@/lib/mock";

interface Props {
  scores: BrainScores;
  /** char cell size in pixels. Bigger = smaller rendered brain on small screens. */
  cellSize?: number;
  label?: string;
  showLegend?: boolean;
}

/**
 * ASCII brain. A lateral brain silhouette rendered in monospace characters.
 * Base characters are gray. Regions corresponding to the four engagement
 * networks shift to orange tones in proportion to their score.
 *
 * Grid layout: 40 cols x 22 rows. Regions:
 *   Frontal (reward)   : cols 5-14, rows 2-10
 *   Parietal (attention): cols 15-26, rows 0-6
 *   Temporal (emotion) : cols 10-22, rows 10-17
 *   Occipital (memory) : cols 23-36, rows 8-16
 */

type Network = "reward" | "emotion" | "attention" | "memory";

// Raw brain silhouette. "_" is outside, everything else is inside the brain.
// The density character chosen per cell below controls visual weight.
const BRAIN_MASK = [
  "________________....________________",
  "_____________,,:::::::,,.___________",
  "__________,:::;;;;;;;;;;:::,________",
  "________,::;;::::::::::::;;;::.._____",
  "______,:;;:::::::::::::::::::;;:____",
  "_____:;;::::::::::::::::::::::;;:___",
  "____,;::::::::::::::::::::::::;;::__",
  "___.;:::::::::::::::::::::::::::;;,_",
  "___:;::::::::::::::::::::::::::::;;_",
  "__.;:::::::::::::::::::::::::::::;:_",
  "__::::::::::::::::::::::::::::::::;,",
  "__::::::::::::::::::::::::::::::::;:",
  "__::::::::::::::::::::::::::::::::;:",
  "__.;:::::::::::::::::::::::::::::;::",
  "___:;:::::::::::::::::::::::::::;;::",
  "___.;;:::::::::::::::::::::::::;;:._",
  "____.;;:::::::::::::::::::::::;;:.__",
  "______:;;::::::::::::::::::::;;:____",
  "________.;;;::::::::::::::;;;:._____",
  "__________.,::;;;;;;;;;;;;:,._______",
  "_____________.,:::::::::,.__________",
  "________________......______________",
];

function regionFor(col: number, row: number): Network | null {
  const centerCol = col - 5;
  const centerRow = row;
  if (centerCol >= 0 && centerCol <= 9 && centerRow >= 2 && centerRow <= 10) {
    return "reward";
  }
  if (centerCol >= 10 && centerCol <= 21 && centerRow >= 0 && centerRow <= 6) {
    return "attention";
  }
  if (centerCol >= 5 && centerCol <= 17 && centerRow >= 10 && centerRow <= 17) {
    return "emotion";
  }
  if (centerCol >= 18 && centerCol <= 31 && centerRow >= 7 && centerRow <= 16) {
    return "memory";
  }
  return null;
}

const NETWORK_COLOR: Record<Network, string> = {
  reward: "#E85D1C",
  emotion: "#F59E0B",
  attention: "#14B8A6",
  memory: "#8B5CF6",
};

// Replace base silhouette dots with denser characters for a "brain matter" feel.
function densityChar(base: string, active: boolean, intensity: number): string {
  if (base === "_" || base === ".") return base;
  if (active && intensity > 0.75) return "@";
  if (active && intensity > 0.55) return "#";
  if (active && intensity > 0.35) return "%";
  if (base === ",") return ".";
  if (base === ";") return ":";
  if (base === ":") return ".";
  return base;
}

export function AsciiBrain({
  scores,
  cellSize = 10,
  label,
  showLegend = false,
}: Props) {
  const cells = useMemo(() => {
    const rows: { ch: string; color: string; region: Network | null }[][] = [];
    for (let r = 0; r < BRAIN_MASK.length; r++) {
      const row = BRAIN_MASK[r];
      const line: { ch: string; color: string; region: Network | null }[] = [];
      for (let c = 0; c < row.length; c++) {
        const base = row[c];
        if (base === "_") {
          line.push({ ch: " ", color: "transparent", region: null });
          continue;
        }
        const region = regionFor(c, r);
        const raw =
          region == null ? 0 : Math.max(0, Math.min(1, scores[region] / 10));
        const active = region != null && raw > 0.45;
        const ch = densityChar(base, active, raw);
        let color: string;
        if (region && active) {
          const a = 0.35 + raw * 0.6;
          color = NETWORK_COLOR[region];
          color = color + Math.round(a * 255).toString(16).padStart(2, "0");
        } else {
          const g = base === "." || base === "," ? 0.22 : 0.45;
          color = `rgba(10,10,10,${g})`;
        }
        line.push({ ch, color, region });
      }
      rows.push(line);
    }
    return rows;
  }, [scores]);

  const cols = BRAIN_MASK[0].length;
  const rowsCount = BRAIN_MASK.length;
  const lineHeight = Math.round(cellSize * 1.05);

  return (
    <div className="flex flex-col items-center gap-3">
      <motion.pre
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        aria-hidden
        className="mono select-none"
        style={{
          fontSize: `${cellSize}px`,
          lineHeight: `${lineHeight}px`,
          letterSpacing: "0.02em",
          width: `${cols * cellSize * 0.62}px`,
          maxWidth: "100%",
        }}
      >
        {cells.map((row, ri) => (
          <div key={ri} className="flex">
            {row.map((cell, ci) => (
              <span
                key={ci}
                style={{
                  color: cell.color,
                  width: `${cellSize * 0.62}px`,
                  display: "inline-block",
                  textAlign: "center",
                  textShadow:
                    cell.region &&
                    cell.color !== "transparent" &&
                    !cell.color.startsWith("rgba")
                      ? `0 0 6px ${cell.color}`
                      : undefined,
                }}
              >
                {cell.ch}
              </span>
            ))}
          </div>
        ))}
      </motion.pre>

      {label && (
        <div className="mono text-[0.62rem] uppercase tracking-[0.28em] text-muted">
          {label}
        </div>
      )}

      {showLegend && (
        <dl className="grid w-full max-w-[420px] grid-cols-2 gap-x-4 gap-y-1.5 pt-3 md:grid-cols-4">
          {(
            [
              ["Reward", scores.reward, NETWORK_COLOR.reward],
              ["Emotion", scores.emotion, NETWORK_COLOR.emotion],
              ["Attention", scores.attention, NETWORK_COLOR.attention],
              ["Memory", scores.memory, NETWORK_COLOR.memory],
            ] as const
          ).map(([name, score, color]) => (
            <div key={name} className="flex items-center gap-2">
              <span
                className="inline-block h-1.5 w-1.5"
                style={{
                  background: color,
                  boxShadow: `0 0 6px ${color}80`,
                }}
              />
              <dt className="mono text-[0.58rem] uppercase tracking-[0.22em] text-muted">
                {name}
              </dt>
              <dd
                className="mono ml-auto text-[0.72rem]"
                style={{ color }}
              >
                {score.toFixed(1)}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
