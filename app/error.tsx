"use client";

/**
 * Root error boundary. Catches any crash in a descendant client or server
 * component so a rendering bug never ships a white screen. Styled to look
 * like a piece of the editorial design, not a browser default.
 *
 * Next.js passes `error` (with an optional digest for server traces) and
 * `reset` (a callback that re-attempts the render). We surface the digest
 * only in production so it is easier to copy into a bug report.
 */

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app/error]", error);
  }, [error]);

  return (
    <main className="min-h-screen bg-cream text-ink">
      <section className="mx-auto flex min-h-screen w-full max-w-[1100px] flex-col justify-between px-6 py-14 md:px-10 md:py-20 lg:px-14">
        <div className="mono flex items-center gap-3 text-[0.72rem] uppercase tracking-[0.28em] text-muted">
          <span className="inline-block h-[1px] w-10 bg-muted/60" />
          <span>Something broke · lucid:v2</span>
        </div>

        <div className="my-16 flex flex-col gap-10">
          <h1
            className="serif leading-[0.92] tracking-[-0.02em]"
            style={{ fontSize: "clamp(3rem, calc(1rem + 5vw), 6rem)" }}
          >
            The engine
            <br />
            <span className="serif-italic text-viral">coughed.</span>
          </h1>
          <p className="max-w-[58ch] text-[1.08rem] leading-[1.55] text-ink/80">
            A piece of the page just crashed. It is almost certainly on us,
            not on you. Hit retry below — if it happens again, drop us a
            line at{" "}
            <a
              href="mailto:hello@lucid.ai"
              className="underline underline-offset-[5px] hover:text-viral"
            >
              hello@lucid.ai
            </a>{" "}
            with the code below and we will chase it.
          </p>
          {error.digest && (
            <code className="mono inline-flex max-w-fit items-center gap-3 rounded-sm border border-ink/15 bg-paper px-4 py-2 text-[0.72rem] uppercase tracking-[0.22em] text-ink/70">
              <span className="text-muted">digest</span>
              <span>{error.digest}</span>
            </code>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={reset}
            className="mono inline-flex items-center gap-3 rounded-full bg-ink px-7 py-4 text-cream transition hover:bg-viral hover:text-ink focus:outline-none focus-visible:outline-none"
          >
            <span className="text-[0.78rem] uppercase tracking-[0.24em]">
              Try again
            </span>
            <span aria-hidden>→</span>
          </button>
          <Link
            href="/"
            className="mono inline-flex items-center gap-2 text-[0.78rem] uppercase tracking-[0.22em] text-ink/75 hover:text-viral"
          >
            <span className="underline underline-offset-[6px]">
              or start over at home
            </span>
          </Link>
        </div>
      </section>
    </main>
  );
}
