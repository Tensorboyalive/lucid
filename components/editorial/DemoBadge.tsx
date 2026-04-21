/**
 * DEMO chip — call this out wherever we serve authored / mock content so a
 * user can tell "real engine" from "scripted preview." Intentional design:
 * tiny, high-contrast, doesn't steal focus from the real UI underneath.
 *
 * Use when:
 *   • an API route returned `fallback: true`
 *   • the presentation-mode demo preset populated the surface
 *   • a provider key is missing and we're rendering authored data
 */

import { cn } from "@/lib/cn";

interface Props {
  /** Short reason, ≤24 chars. Example: "authored · no key" */
  reason?: string;
  tone?: "cream" | "ink";
  className?: string;
}

export function DemoBadge({ reason, tone = "cream", className }: Props) {
  const isInk = tone === "ink";
  return (
    <span
      role="note"
      aria-label="Demo content"
      className={cn(
        "mono inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[0.58rem] uppercase tracking-[0.24em]",
        isInk
          ? "border-cream/30 bg-ink text-cream"
          : "border-ink/25 bg-paper text-ink/75",
        className,
      )}
    >
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-viral" />
      <span>demo</span>
      {reason && (
        <>
          <span className={cn("opacity-40", isInk ? "text-cream" : "text-ink")}>
            ·
          </span>
          <span className={isInk ? "text-cream/70" : "text-ink/60"}>
            {reason}
          </span>
        </>
      )}
    </span>
  );
}
