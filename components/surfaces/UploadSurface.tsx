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

  return (
    <div className="w-full">
      <label className="mono block text-[0.72rem] uppercase tracking-[0.28em] text-muted">
        Paste an Instagram reel URL
      </label>
      <form
        className="mt-4 flex flex-col gap-3 md:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          if (url.trim()) onSubmit({ url: url.trim() });
        }}
      >
        <input
          type="url"
          placeholder="https://www.instagram.com/reel/..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={disabled}
          className="serif-italic flex-1 border-b border-ink/30 bg-transparent pb-3 text-[clamp(1.1rem, calc(1rem + 0.5vw), 1.5rem)] outline-none placeholder:text-ink/30 focus:border-viral"
        />
        <button
          type="submit"
          disabled={disabled || !url.trim()}
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

      <div className="mono mt-6 flex items-center gap-3 text-[0.68rem] uppercase tracking-[0.26em] text-muted">
        <span>or</span>
        <span className="h-[1px] flex-1 bg-ink/10" />
      </div>

      <div
        aria-disabled
        className="mt-4 flex flex-col items-center justify-center gap-3 rounded-sm border border-dashed border-ink/20 bg-ink/[0.02] p-10 text-center"
      >
        <span className="mono inline-flex items-center gap-2 rounded-full bg-ink/10 px-3 py-1 text-[0.62rem] uppercase tracking-[0.26em] text-ink/70">
          <span className="h-1.5 w-1.5 rounded-full bg-viral" />
          Coming soon
        </span>
        <span className="serif-italic text-[clamp(1.2rem, calc(1rem + 0.6vw), 1.6rem)] text-ink/50">
          direct file upload
        </span>
        <span className="mono max-w-[44ch] text-[0.72rem] uppercase tracking-[0.22em] text-muted">
          Drag-and-drop scoring is rolling out next pass. For now, paste
          the reel URL and the Beta engine streams it end-to-end.
        </span>
      </div>

      <div className="mt-10">
        <div className="mono text-[0.68rem] uppercase tracking-[0.26em] text-muted">
          try a demo reel
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {DEMO_URLS.map((d) => (
            <button
              key={d.url}
              onClick={() => onSubmit({ url: d.url })}
              disabled={disabled}
              className="mono rounded-full border border-ink/20 px-4 py-2 text-[0.72rem] uppercase tracking-[0.22em] transition hover:border-viral hover:text-viral disabled:pointer-events-none disabled:opacity-40"
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
