import { cn } from "@/lib/cn";

interface Props {
  children: React.ReactNode;
  attribution?: string;
  tone?: "cream" | "ink";
  className?: string;
}

export function Pullquote({ children, attribution, tone = "cream", className }: Props) {
  const isInk = tone === "ink";
  return (
    <figure
      className={cn(
        "relative mx-auto max-w-[56ch] py-20 md:py-32 text-center",
        className,
      )}
    >
      <div
        aria-hidden
        className={cn(
          "serif-italic pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 text-[10rem] leading-none opacity-20",
          isInk ? "text-cream" : "text-ink",
        )}
      >
        “
      </div>
      <blockquote className="serif text-[clamp(2.6rem, calc(1rem + 4vw), 5rem)] leading-[1]">
        {children}
      </blockquote>
      {attribution && (
        <figcaption
          className={cn(
            "mono mt-8 text-xs uppercase tracking-[0.28em]",
            isInk ? "text-cream/60" : "text-muted",
          )}
        >
          / {attribution}
        </figcaption>
      )}
    </figure>
  );
}
