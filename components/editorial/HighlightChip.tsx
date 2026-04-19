import { cn } from "@/lib/cn";

type Variant = "orange" | "cream" | "ink" | "strike";

interface Props {
  children: React.ReactNode;
  variant?: Variant;
  italic?: boolean;
  /** Opt-in slight rotation. Reserve for hero H1 chips so the effect stays rare. */
  hero?: boolean;
  className?: string;
}

const variantClass: Record<Variant, string> = {
  orange: "highlight",
  cream: "highlight-cream",
  ink: "highlight-ink",
  strike: "strike",
};

export function HighlightChip({
  children,
  variant = "orange",
  italic = true,
  hero = false,
  className,
}: Props) {
  return (
    <span
      className={cn(
        variantClass[variant],
        italic && "serif-italic",
        hero && variant !== "strike" && "highlight-hero",
        className,
      )}
    >
      {children}
    </span>
  );
}
