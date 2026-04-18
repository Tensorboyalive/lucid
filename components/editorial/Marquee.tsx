import { cn } from "@/lib/cn";

interface Props {
  items: string[];
  tone?: "cream" | "ink" | "orange";
  className?: string;
}

const toneClass = {
  cream: "bg-cream text-ink",
  ink: "bg-ink text-cream",
  orange: "bg-viral text-white",
} as const;

export function Marquee({ items, tone = "orange", className }: Props) {
  const doubled = [...items, ...items];
  return (
    <div
      className={cn(
        "w-full overflow-hidden border-y border-ink/10 py-4",
        toneClass[tone],
        className,
      )}
    >
      <div className="marquee-track whitespace-nowrap">
        {doubled.map((item, i) => (
          <span
            key={i}
            className="mono text-[0.82rem] uppercase tracking-[0.22em]"
          >
            {item}
            <span className="mx-12 opacity-40">/</span>
          </span>
        ))}
      </div>
    </div>
  );
}
