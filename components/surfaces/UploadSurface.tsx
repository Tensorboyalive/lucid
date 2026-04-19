"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { DEMO_URLS } from "@/lib/mock";

interface Props {
  onSubmit: (input: { url?: string; file?: File }) => void;
  disabled?: boolean;
}

export function UploadSurface({ onSubmit, disabled }: Props) {
  const [url, setUrl] = useState("");
  const isValid = url.trim().length > 0;

  return (
    <div className="w-full">
      {/* Fast path: scored demos first. This is the 2-second happy path. */}
      <div className="mono flex items-center gap-3 text-[0.72rem] uppercase tracking-[0.28em] text-muted">
        <span>Try instantly</span>
        <span className="h-[1px] flex-1 bg-ink/10" />
        <span className="text-ink/50">no URL needed</span>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        {DEMO_URLS.map((d) => (
          <button
            key={d.url}
            onClick={() => onSubmit({ url: d.url })}
            disabled={disabled}
            className="mono group inline-flex items-center gap-3 rounded-full border border-ink/20 bg-cream px-5 py-3 text-[0.74rem] uppercase tracking-[0.22em] transition hover:border-viral hover:bg-viral hover:text-cream disabled:pointer-events-none disabled:opacity-40"
          >
            <span>{d.label}</span>
            <span aria-hidden className="opacity-60 group-hover:opacity-100">→</span>
          </button>
        ))}
      </div>

      {/* Slow path: paste a live URL. */}
      <div className="mono mt-12 flex items-center gap-3 text-[0.68rem] uppercase tracking-[0.26em] text-muted">
        <span>or paste a live reel</span>
        <span className="h-[1px] flex-1 bg-ink/10" />
      </div>
      <label htmlFor="score-url" className="sr-only">
        Instagram reel URL
      </label>
      <form
        className="mt-4 flex flex-col gap-3 md:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          if (isValid) onSubmit({ url: url.trim() });
        }}
      >
        <input
          id="score-url"
          type="url"
          placeholder="https://www.instagram.com/reel/..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={disabled}
          className="serif-italic flex-1 border-b border-ink/30 bg-transparent pb-3 text-[clamp(1.1rem, calc(1rem + 0.5vw), 1.5rem)] outline-none placeholder:text-ink/30 focus:border-viral"
        />
        <button
          type="submit"
          disabled={disabled || !isValid}
          className={cn(
            "mono inline-flex items-center gap-3 rounded-full bg-ink px-7 py-4 text-cream transition",
            "hover:bg-viral",
            "disabled:pointer-events-none disabled:opacity-40",
          )}
        >
          <span className="text-[0.78rem] uppercase tracking-[0.24em]">
            Score it
          </span>
          <span aria-hidden>→</span>
        </button>
      </form>
      {!isValid && !disabled && (
        <p className="mono mt-3 text-[0.66rem] uppercase tracking-[0.24em] text-muted">
          paste a reel URL to enable scoring · or click a demo above
        </p>
      )}
    </div>
  );
}
