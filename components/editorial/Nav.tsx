import Link from "next/link";
import { cn } from "@/lib/cn";

interface Props {
  tone?: "cream" | "ink";
}

export function Nav({ tone = "cream" }: Props) {
  const isInk = tone === "ink";
  return (
    <header
      className={cn(
        "relative z-20 flex w-full items-center justify-between px-6 py-5 md:px-10 lg:px-14",
        isInk ? "text-cream" : "text-ink",
      )}
    >
      <Link
        href="/"
        className="mono text-[0.82rem] uppercase tracking-[0.28em]"
      >
        lucid<span className="text-viral">:</span>v2
      </Link>
      <nav className="hidden items-center gap-10 md:flex">
        {[
          ["Score", "/score"],
          ["Research", "/research"],
          ["Rewrite", "/rewrite"],
          ["Proof", "/proof"],
          ["Business", "/business"],
        ].map(([label, href]) => (
          <Link
            key={href}
            href={href}
            className="mono text-[0.75rem] uppercase tracking-[0.28em] hover:text-viral transition-colors"
          >
            {label}
          </Link>
        ))}
      </nav>
      <Link
        href="/score"
        className={cn(
          "mono inline-flex items-center gap-2 rounded-full px-4 py-2 text-[0.72rem] uppercase tracking-[0.24em] transition",
          isInk
            ? "bg-cream text-ink hover:bg-viral hover:text-white"
            : "bg-ink text-cream hover:bg-viral",
        )}
      >
        Score a reel →
      </Link>
    </header>
  );
}
