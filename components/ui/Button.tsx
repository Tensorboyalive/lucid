"use client";

import { cn } from "@/lib/cn";
import Link from "next/link";

type Variant = "ink" | "cream" | "orange" | "ghost";
type Size = "sm" | "md" | "lg";

interface Props {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: Variant;
  size?: Size;
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
}

const variantClass: Record<Variant, string> = {
  ink: "bg-ink text-cream hover:bg-viral",
  cream: "bg-cream text-ink border border-ink hover:bg-ink hover:text-cream",
  orange: "bg-viral text-white hover:bg-ink",
  ghost: "text-ink hover:text-viral",
};

const sizeClass: Record<Size, string> = {
  sm: "px-4 py-2 text-[0.7rem] tracking-[0.22em]",
  md: "px-6 py-3.5 text-[0.78rem] tracking-[0.24em]",
  lg: "px-8 py-5 text-[0.85rem] tracking-[0.24em]",
};

export function Button({
  children,
  href,
  onClick,
  variant = "ink",
  size = "md",
  className,
  type = "button",
  disabled,
}: Props) {
  const cls = cn(
    "mono inline-flex items-center gap-3 rounded-full uppercase transition",
    variantClass[variant],
    sizeClass[size],
    disabled && "pointer-events-none opacity-40",
    className,
  );
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls}>
      {children}
    </button>
  );
}
