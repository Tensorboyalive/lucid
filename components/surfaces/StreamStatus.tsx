"use client";

interface Props {
  label: string;
  pct: number;
}

export function StreamStatus({ label, pct }: Props) {
  const clamped = Math.max(0, Math.min(1, pct));
  const pctRounded = Math.round(clamped * 100);
  // When we're past scripted steps and waiting on upstream (>=90%), breathe the bar
  // so the user knows we're live, not frozen. Percent stays honest, motion signals work.
  const waiting = clamped >= 0.9 && clamped < 1;

  return (
    <div className="w-full">
      <div className="mono flex items-baseline justify-between text-[0.72rem] uppercase tracking-[0.26em] text-muted">
        <span>{label}</span>
        <span>{pctRounded}%</span>
      </div>
      <div
        className="relative mt-3 h-[2px] w-full overflow-hidden bg-ink/10"
        role="progressbar"
        aria-valuenow={pctRounded}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          className={`absolute left-0 top-0 h-full bg-viral transition-[width] duration-[350ms] ease-out ${waiting ? "stream-waiting" : ""}`}
          style={{ width: `${clamped * 100}%` }}
        />
      </div>
    </div>
  );
}
