import { cn } from "@/lib/cn";

type Variant = "orange" | "cream" | "ink" | "strike";

interface Props {
  children: React.ReactNode;
  variant?: Variant;
  italic?: boolean;
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
  className,
}: Props) {
  return (
    <span
      className={cn(
        variantClass[variant],
        italic && "serif-italic",
        className,
      )}
    >
      {children}
    </span>
  );
}
