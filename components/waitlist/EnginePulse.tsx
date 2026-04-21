/**
 * Right-column visual for the /waitlist hero. Replaces the large empty
 * cream gutter on desktop with a slow, breathing representation of the
 * four brain networks the engine scores against. No data fetch — the
 * intent is mood, not telemetry. Each bar pulses on its own offset so the
 * overall motion feels alive but never distracting.
 *
 * Accessibility: the whole block is `aria-hidden` — it is decorative. The
 * actual signup-facing text is covered in the adjacent `<Section>`.
 */
const NETWORKS = [
  { k: "Reward", color: "var(--brain-red)", base: 82, delay: "0s" },
  { k: "Emotion", color: "var(--brain-amber)", base: 71, delay: "0.8s" },
  { k: "Attention", color: "var(--brain-cyan)", base: 88, delay: "1.6s" },
  { k: "Memory", color: "var(--brain-violet)", base: 64, delay: "2.4s" },
] as const;

export function EnginePulse() {
  return (
    <div
      aria-hidden
      className="engine-pulse relative flex w-full flex-col gap-5 rounded-sm border border-ink/15 bg-paper p-8 md:max-w-[24rem]"
    >
      <div className="mono flex items-center justify-between text-[0.64rem] uppercase tracking-[0.26em] text-muted">
        <span className="flex items-center gap-2">
          <span className="engine-pulse-dot inline-block h-2 w-2 rounded-full bg-viral" />
          <span>live engine pulse</span>
        </span>
        <span>R1 · 12s</span>
      </div>

      <div className="flex items-end gap-3">
        <div
          className="serif text-ink"
          style={{ fontSize: "clamp(3rem, calc(1rem + 4vw), 4.8rem)", lineHeight: 0.9 }}
        >
          7.8
        </div>
        <div className="pb-2">
          <div className="mono text-[0.7rem] uppercase tracking-[0.22em] text-ink/70">
            brain score
          </div>
          <div className="mono text-[0.62rem] uppercase tracking-[0.22em] text-muted">
            4 networks · 20,484 vertices
          </div>
        </div>
      </div>

      <ul className="flex flex-col gap-3 pt-2">
        {NETWORKS.map(({ k, color, base, delay }) => (
          <li key={k} className="flex flex-col gap-1.5">
            <div className="mono flex items-baseline justify-between text-[0.64rem] uppercase tracking-[0.22em]">
              <span className="text-ink/70">{k}</span>
              <span className="text-ink" style={{ color }}>
                {(base / 10).toFixed(1)}
              </span>
            </div>
            <div className="engine-pulse-track relative h-[3px] w-full overflow-hidden rounded-full bg-ink/10">
              <span
                className="engine-pulse-fill absolute inset-y-0 left-0 rounded-full"
                style={
                  {
                    width: `${base}%`,
                    background: color,
                    animationDelay: delay,
                  } as React.CSSProperties
                }
              />
            </div>
          </li>
        ))}
      </ul>

      <div className="mono flex items-center justify-between border-t border-ink/10 pt-4 text-[0.58rem] uppercase tracking-[0.22em] text-muted">
        <span>reel · creator cut · 24s</span>
        <span className="text-viral">scoring</span>
      </div>
    </div>
  );
}
