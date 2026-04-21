"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Nav } from "@/components/editorial/Nav";
import { Section } from "@/components/editorial/Section";
import { HighlightChip } from "@/components/editorial/HighlightChip";
import { EnginePulse } from "@/components/waitlist/EnginePulse";
import { FAQ } from "@/components/waitlist/FAQ";
import { capture } from "@/components/analytics/PostHogProvider";
import { LOCKED_LABELS, PUBLIC_ONLY } from "@/lib/config";

type Phase = "idle" | "submitting" | "done";

export default function WaitlistPage() {
  const [email, setEmail] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [lockedFromLabel, setLockedFromLabel] = useState<string | null>(null);

  // If the visitor was redirected here by the public-build gate, surface
  // which surface they were trying to reach. Read from window.location to
  // avoid opting the whole route into dynamic rendering via useSearchParams.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const locked = params.get("locked");
    if (!locked) return;
    const label = LOCKED_LABELS[locked];
    if (label) setLockedFromLabel(label);
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || phase === "submitting") return;

    setPhase("submitting");
    setError(null);

    try {
      const referrer =
        typeof document !== "undefined" ? document.referrer : undefined;
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: trimmed,
          source: "waitlist-page",
          referrer: referrer && referrer.length > 0 ? referrer : undefined,
        }),
      });
      if (res.status === 429) {
        setError("too many signups from this network. try again in a few minutes.");
        setPhase("idle");
        return;
      }
      if (res.status === 400) {
        setError("that doesn't look like a valid email.");
        setPhase("idle");
        return;
      }
      if (!res.ok) {
        setError("the list is down for a second. try again?");
        setPhase("idle");
        return;
      }
      capture("waitlist_signup", {
        source: "waitlist-page",
        locked_from: lockedFromLabel ?? null,
      });
      setPhase("done");
    } catch {
      setError("couldn't reach the list. check your connection.");
      setPhase("idle");
    }
  }

  return (
    <main>
      <Nav />

      <Section tone="cream" className="pb-8 pt-6 md:pb-12 md:pt-10">
        <div className="grid grid-cols-12 gap-8 md:gap-12">
          <div className="col-span-12 md:col-span-7">
            <div className="mono flex items-center gap-3 text-[0.72rem] uppercase tracking-[0.28em] text-muted">
              <span className="inline-block h-[1px] w-10 bg-muted/60" />
              <span>Early access · lucid:v2</span>
            </div>
            {lockedFromLabel && (
              <div
                role="status"
                className="mono mt-6 inline-flex max-w-full items-center gap-3 rounded-full border border-ink/15 bg-paper px-4 py-2 text-[0.66rem] uppercase tracking-[0.24em] text-ink/75"
              >
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-viral" />
                <span className="truncate">
                  {lockedFromLabel} opens with early access · join below
                </span>
              </div>
            )}
            <h1
              className="serif mt-8 leading-[0.9] tracking-[-0.02em]"
              style={{ fontSize: "clamp(3rem, calc(1rem + 4vw), 5.3rem)" }}
            >
              Get first{" "}
              <HighlightChip variant="orange" hero>access</HighlightChip>
              <br />
              to the scoring engine.
            </h1>
            <p className="mt-8 max-w-[58ch] text-[clamp(1.02rem, calc(0.92rem + 0.35vw), 1.22rem)] leading-[1.5] text-ink/80">
              lucid:v2 is in closed iteration. Drop your email and we&rsquo;ll
              let you in when the engine opens up. No drip, no newsletter, no
              noise. One message when it&rsquo;s your turn.
            </p>
          </div>
          <div className="col-span-12 md:col-span-5 md:self-end">
            <EnginePulse />
          </div>
        </div>
      </Section>

      <Section tone="paper" className="py-10 md:py-14">
        {phase !== "done" ? (
          <form onSubmit={handleSubmit} className="w-full">
            <label
              htmlFor="waitlist-email"
              className="mono block text-[0.72rem] uppercase tracking-[0.28em] text-muted"
            >
              your email
            </label>
            <div className="mt-4 flex flex-col gap-3 md:flex-row">
              <input
                id="waitlist-email"
                type="email"
                name="email"
                autoComplete="email"
                inputMode="email"
                required
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={phase === "submitting"}
                className="serif-italic flex-1 border-b border-ink/30 bg-transparent pb-3 text-[clamp(1.1rem,calc(1rem+0.5vw),1.5rem)] outline-none focus:outline-none focus-visible:outline-none placeholder:text-ink/30 focus:border-ink disabled:opacity-60"
                aria-invalid={error ? "true" : "false"}
                aria-describedby={error ? "waitlist-error" : undefined}
              />
              <button
                type="submit"
                disabled={phase === "submitting" || !email.trim()}
                className="mono inline-flex items-center justify-center gap-3 rounded-full bg-ink px-7 py-4 text-cream transition hover:bg-viral hover:text-ink focus:outline-none focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40"
              >
                <span className="text-[0.78rem] uppercase tracking-[0.24em]">
                  {phase === "submitting" ? "Holding your spot" : "Get on the list"}
                </span>
                <span aria-hidden>→</span>
              </button>
            </div>
            {error && (
              <p
                id="waitlist-error"
                role="alert"
                className="mono mt-4 text-[0.72rem] uppercase tracking-[0.24em] text-brain-red"
              >
                {error}
              </p>
            )}
            <p className="mono mt-6 text-[0.66rem] uppercase tracking-[0.24em] text-muted">
              one email when the scoring engine opens · unsubscribe anytime · no
              spam, ever
            </p>
          </form>
        ) : (
          <div
            role="status"
            aria-live="polite"
            className="flex flex-col items-start gap-6"
          >
            <div className="mono text-[0.72rem] uppercase tracking-[0.28em] text-viral">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-viral align-middle" />
              <span className="ml-3">You&rsquo;re in.</span>
            </div>
            <h2
              className="serif leading-[0.95]"
              style={{ fontSize: "clamp(2.2rem, calc(1rem + 2.5vw), 3.6rem)" }}
            >
              Hold tight. We&rsquo;ll reach out when the engine{" "}
              <HighlightChip variant="orange">opens up</HighlightChip>.
            </h2>
            <p className="max-w-[58ch] text-[1.05rem] leading-[1.55] text-ink/75">
              {PUBLIC_ONLY
                ? "Until then, read the receipts. The model is real. The scores below come from actual GPU runs on real reels."
                : "In the meantime, the product is live in demo mode if you want to poke around. Score a reel, research a creator, rewrite a draft. No keys needed."}
            </p>
            <div className="mono mt-2 flex flex-wrap gap-3 text-[0.72rem] uppercase tracking-[0.24em]">
              {!PUBLIC_ONLY && (
                <>
                  <a
                    href="/score"
                    className="inline-flex items-center gap-2 rounded-full border border-ink/20 px-4 py-2 transition hover:border-viral hover:text-viral"
                  >
                    <span>Try the mirror</span>
                    <span aria-hidden>→</span>
                  </a>
                  <a
                    href="/research"
                    className="inline-flex items-center gap-2 rounded-full border border-ink/20 px-4 py-2 transition hover:border-viral hover:text-viral"
                  >
                    <span>Reverse-engineer a creator</span>
                    <span aria-hidden>→</span>
                  </a>
                </>
              )}
              <a
                href="/proof"
                className="inline-flex items-center gap-2 rounded-full border border-ink/20 px-4 py-2 transition hover:border-viral hover:text-viral"
              >
                <span>See the receipts</span>
                <span aria-hidden>→</span>
              </a>
            </div>
          </div>
        )}
      </Section>

      <Section tone="cream" className="py-14 md:py-20">
        <FAQ />
      </Section>

      <Section tone="ink" className="py-16 md:py-20">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 md:col-span-5">
            <div className="mono text-[0.72rem] uppercase tracking-[0.28em] text-cream/60">
              what you&rsquo;re signing up for
            </div>
            <h3
              className="serif-italic mt-6 leading-[1.1]"
              style={{ fontSize: "clamp(1.5rem, calc(1rem + 1.5vw), 2.3rem)" }}
            >
              The first tool that grades a reel against the brain.
            </h3>
          </div>
          <div className="col-span-12 md:col-span-7">
            <ul className="flex flex-col gap-5">
              {[
                [
                  "Score",
                  "Paste any Instagram reel. Alpha engine scores brain activation, frame by frame. Gamma tells you which moment went dark.",
                ],
                [
                  "Research",
                  "Paste a creator handle. We pull their top reels, extract patterns, and open a chat with the viral engine.",
                ],
                [
                  "Rewrite",
                  "Paste a script. Gamma returns a shot-by-shot plan anchored to the four brain networks. Iterate in the drawer.",
                ],
              ].map(([title, body]) => (
                <li
                  key={title}
                  className="group flex items-start gap-6 border-b border-cream/15 pb-5"
                >
                  <span className="mono pt-1 text-[0.72rem] uppercase tracking-[0.28em] text-cream/50">
                    {title}
                  </span>
                  <p className="flex-1 text-[0.98rem] leading-[1.55] text-cream/80">
                    {body}
                  </p>
                </li>
              ))}
            </ul>
            <div className="mono mt-10 flex flex-wrap gap-x-6 gap-y-2 text-[0.66rem] uppercase tracking-[0.24em] text-cream/50">
              <a href="/privacy" className="hover:text-viral">Privacy</a>
              <a href="/terms" className="hover:text-viral">Terms</a>
              <a href="/contact" className="hover:text-viral">Contact</a>
            </div>
          </div>
        </div>
      </Section>
    </main>
  );
}
