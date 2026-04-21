import Link from "next/link";
import type { Metadata } from "next";

/**
 * 404 page. Matches the editorial identity rather than shipping Next's
 * default white screen. Links out to the three routes a stranded visitor
 * actually wants: the home, the receipts, and the waitlist.
 */
export const metadata: Metadata = {
  title: "404 · lost in the feed",
};

export default function NotFound() {
  return (
    <main className="min-h-screen bg-cream text-ink">
      <section className="mx-auto flex min-h-screen w-full max-w-[1100px] flex-col justify-between px-6 py-14 md:px-10 md:py-20 lg:px-14">
        <div className="mono flex items-center gap-3 text-[0.72rem] uppercase tracking-[0.28em] text-muted">
          <span className="inline-block h-[1px] w-10 bg-muted/60" />
          <span>404 · lucid:v2</span>
        </div>

        <div className="my-16 flex flex-col gap-10">
          <h1
            className="serif leading-[0.92] tracking-[-0.02em]"
            style={{ fontSize: "clamp(3.2rem, calc(1rem + 6vw), 7rem)" }}
          >
            Nothing{" "}
            <span className="serif-italic text-viral">here.</span>
            <br />
            Keep scrolling.
          </h1>
          <p className="max-w-[58ch] text-[1.08rem] leading-[1.55] text-ink/80">
            The page you were after either never existed, got renamed, or is
            behind the early-access curtain. Try one of the three below.
          </p>
        </div>

        <div className="mono flex flex-wrap gap-x-6 gap-y-3 text-[0.78rem] uppercase tracking-[0.24em]">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-ink/20 px-5 py-3 transition hover:border-viral hover:text-viral"
          >
            <span>Home</span>
            <span aria-hidden>→</span>
          </Link>
          <Link
            href="/proof"
            className="inline-flex items-center gap-2 rounded-full border border-ink/20 px-5 py-3 transition hover:border-viral hover:text-viral"
          >
            <span>Proof</span>
            <span aria-hidden>→</span>
          </Link>
          <Link
            href="/waitlist"
            className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-cream transition hover:bg-viral hover:text-ink"
          >
            <span>Waitlist</span>
            <span aria-hidden>→</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
