"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";

interface Props {
  tone?: "cream" | "ink";
}

const LINKS = [
  ["Score", "/score"],
  ["Research", "/research"],
  ["Rewrite", "/rewrite"],
  ["Proof", "/proof"],
  ["Business", "/business"],
  ["Waitlist", "/waitlist"],
] as const;

export function Nav({ tone = "cream" }: Props) {
  const isInk = tone === "ink";
  const [open, setOpen] = useState(false);

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
      <nav className="hidden items-center gap-10 md:flex" aria-label="Main navigation">
        {LINKS.map(([label, href]) => (
          <Link
            key={href}
            href={href}
            className="mono text-[0.75rem] uppercase tracking-[0.28em] transition-colors hover:text-viral"
          >
            {label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-3">
        <Link
          href="/score"
          className={cn(
            "mono inline-flex min-h-[44px] items-center gap-2 rounded-full px-4 py-2 text-[0.72rem] uppercase tracking-[0.24em] transition",
            isInk
              ? "bg-cream text-ink hover:bg-viral hover:text-ink"
              : "bg-ink text-cream hover:bg-viral hover:text-ink",
          )}
        >
          <span>Score a reel</span>
          <span aria-hidden>→</span>
        </Link>
        {/* Mobile menu trigger */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          aria-controls="mobile-nav"
          className={cn(
            "mono inline-flex h-11 w-11 items-center justify-center rounded-full border transition md:hidden",
            isInk
              ? "border-cream/40 text-cream hover:border-cream"
              : "border-ink/30 text-ink hover:border-ink",
          )}
        >
          <span className="sr-only">menu</span>
          {open ? (
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" fill="none">
              <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" fill="none">
              <path d="M2.5 4.5H13.5M2.5 8H13.5M2.5 11.5H13.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </div>

      {open && (
        <div
          id="mobile-nav"
          className={cn(
            "absolute left-0 right-0 top-full z-30 border-t px-6 py-6 md:hidden",
            isInk
              ? "bg-ink text-cream border-cream/15"
              : "bg-cream text-ink border-ink/10",
          )}
        >
          <nav aria-label="Mobile navigation" className="flex flex-col gap-4">
            {LINKS.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="mono text-[0.9rem] uppercase tracking-[0.28em] hover:text-viral"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
