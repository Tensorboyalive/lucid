import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/editorial/Nav";
import { Section } from "@/components/editorial/Section";
import { HighlightChip } from "@/components/editorial/HighlightChip";

export const metadata: Metadata = {
  title: "Contact",
  description: "One email address. One human. Fast responses.",
};

const CHANNELS: ReadonlyArray<{
  k: string;
  label: string;
  href: string;
  blurb: string;
}> = [
  {
    k: "01",
    label: "hello@lucid.ai",
    href: "mailto:hello@lucid.ai",
    blurb:
      "The main line. Questions, bug reports, partnership asks, or \"please let me in now.\" Replies usually land the same day.",
  },
  {
    k: "02",
    label: "@tensorboy on X",
    href: "https://x.com/tensorboy",
    blurb:
      "DMs open. Works best for short pings, memes, and screenshots that are easier to show than describe.",
  },
  {
    k: "03",
    label: "github.com/Tensorboyalive/lucid",
    href: "https://github.com/Tensorboyalive/lucid",
    blurb:
      "File an issue if you spot a bug that is easier to describe with a stack trace than a sentence.",
  },
];

export default function ContactPage() {
  return (
    <main>
      <Nav />

      <Section tone="cream" className="pb-10 pt-6 md:pb-16 md:pt-10">
        <div className="mono flex items-center gap-3 text-[0.72rem] uppercase tracking-[0.28em] text-muted">
          <span className="inline-block h-[1px] w-10 bg-muted/60" />
          <span>Contact · lucid:v2</span>
        </div>
        <h1
          className="serif mt-8 leading-[0.9] tracking-[-0.02em]"
          style={{ fontSize: "clamp(3rem, calc(1rem + 4vw), 5.3rem)" }}
        >
          Talk to us.
          <br />
          <HighlightChip variant="orange" hero>A human answers.</HighlightChip>
        </h1>
        <p className="mt-8 max-w-[58ch] text-[clamp(1.02rem, calc(0.92rem + 0.35vw), 1.22rem)] leading-[1.5] text-ink/80">
          No ticket queue, no support bot. One inbox, one Manav, one usually-same-day
          response. Ask anything about the model, the roadmap, the pricing, the
          paper, or the reels you wish the engine had opinions on.
        </p>
      </Section>

      <Section tone="paper" className="py-14 md:py-20">
        <ul className="flex flex-col gap-8">
          {CHANNELS.map((c) => (
            <li
              key={c.k}
              className="grid grid-cols-12 gap-6 border-b border-ink/10 pb-8 last:border-none"
            >
              <div className="col-span-12 md:col-span-3">
                <span className="mono text-[0.72rem] uppercase tracking-[0.28em] text-muted">
                  {c.k}
                </span>
                <a
                  href={c.href}
                  className="serif mt-3 block leading-[1.05] hover:text-viral"
                  style={{
                    fontSize: "clamp(1.4rem, calc(0.9rem + 1vw), 2rem)",
                  }}
                >
                  {c.label}
                </a>
              </div>
              <div className="col-span-12 md:col-span-9">
                <p className="max-w-[72ch] text-[1.02rem] leading-[1.6] text-ink/80">
                  {c.blurb}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="ink" className="py-16 md:py-20">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 md:col-span-7">
            <div className="mono text-[0.72rem] uppercase tracking-[0.28em] text-cream/60">
              the one thing
            </div>
            <h3
              className="serif-italic mt-6 leading-[1.1]"
              style={{ fontSize: "clamp(1.5rem, calc(1rem + 1.5vw), 2.3rem)" }}
            >
              Say what you are trying to do, not just what broke. We get to the
              fix twice as fast.
            </h3>
          </div>
          <div className="col-span-12 flex flex-col gap-3 md:col-span-5 md:items-end md:justify-end">
            <Link
              href="/waitlist"
              className="mono text-[0.72rem] uppercase tracking-[0.24em] text-cream/70 hover:text-viral"
            >
              Back to waitlist <span aria-hidden>→</span>
            </Link>
            <Link
              href="/privacy"
              className="mono text-[0.72rem] uppercase tracking-[0.24em] text-cream/70 hover:text-viral"
            >
              Privacy <span aria-hidden>→</span>
            </Link>
            <Link
              href="/terms"
              className="mono text-[0.72rem] uppercase tracking-[0.24em] text-cream/70 hover:text-viral"
            >
              Terms <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </Section>
    </main>
  );
}
