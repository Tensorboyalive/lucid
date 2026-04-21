import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/editorial/Nav";
import { Section } from "@/components/editorial/Section";
import { HighlightChip } from "@/components/editorial/HighlightChip";

export const metadata: Metadata = {
  title: "Terms",
  description: "The short version of how to use lucid without us fighting.",
};

const SECTIONS: ReadonlyArray<{ k: string; title: string; body: string[] }> = [
  {
    k: "01",
    title: "Who owns what.",
    body: [
      "The content you feed the engine (your reels, your drafts, your handles) stays yours. Full stop. Feeding something to lucid does not transfer any ownership to us.",
      "The engine itself, the scoring model, the score weights, and every line of code shipped with the site stay ours. Using them is not the same as owning them.",
      "What you do with the output (our scores, our rewritten scripts) is yours to post, keep, throw out, or print on a t-shirt. We do not claim credit for your next viral hit.",
    ],
  },
  {
    k: "02",
    title: "What you agree to.",
    body: [
      "Do not feed us content you do not have the right to feed us. If you did not make it and you did not get permission, the engine will still score it, but the legal problem belongs to you.",
      "Do not try to pull the scoring weights out through the API, and do not train another model on our outputs. That is a straight no.",
      "Do not use lucid to score anything that would violate applicable law in your jurisdiction or ours. You know what this means.",
    ],
  },
  {
    k: "03",
    title: "What we promise.",
    body: [
      "We promise to keep the site up to the best of our ability, to process your data honestly, and to send you one email when the product opens.",
      "We do not promise that every score is perfect. The engine is a foundation model wrapped in opinions. It is right more often than it is wrong, but it is not a god.",
      "We do not promise that your reel will go viral. lucid tells you what the brain is doing with your content. Turning that into a hit is still on you.",
    ],
  },
  {
    k: "04",
    title: "Limits of liability.",
    body: [
      "To the maximum extent permitted by law, lucid and its operators are not liable for any loss of followers, reach, deals, or hair caused by taking our advice and shipping content that flopped.",
      "The total aggregate liability for any claim related to the service will not exceed the amount you paid us in the last twelve months. Today that number is zero.",
      "None of this affects rights that cannot be disclaimed under consumer-protection law in your country. If your country says we have to honor a warranty we did not explicitly give, we honor it.",
    ],
  },
  {
    k: "05",
    title: "Changes and ending.",
    body: [
      "If we change these terms in any material way, we email everyone on the list and post a dated copy at /terms.",
      "You can stop using lucid at any moment. We can stop serving an account that violates the rules above, after one warning where possible.",
    ],
  },
  {
    k: "06",
    title: "Governing law.",
    body: [
      "These terms are governed by the laws of India, where the operator is based. Disputes go to courts in Bangalore, with small-claims exceptions for consumers in their home jurisdiction.",
    ],
  },
];

export default function TermsPage() {
  return (
    <main>
      <Nav />

      <Section tone="cream" className="pb-10 pt-6 md:pb-16 md:pt-10">
        <div className="mono flex items-center gap-3 text-[0.72rem] uppercase tracking-[0.28em] text-muted">
          <span className="inline-block h-[1px] w-10 bg-muted/60" />
          <span>Terms · lucid:v2 · Effective 2026-04-22</span>
        </div>
        <h1
          className="serif mt-8 leading-[0.9] tracking-[-0.02em]"
          style={{ fontSize: "clamp(3rem, calc(1rem + 4vw), 5.3rem)" }}
        >
          Terms.
          <br />
          <HighlightChip variant="orange" hero>The short version.</HighlightChip>
        </h1>
        <p className="mt-8 max-w-[58ch] text-[clamp(1.02rem, calc(0.92rem + 0.35vw), 1.22rem)] leading-[1.5] text-ink/80">
          These are the rules of using lucid. They are written in English,
          not lawyer, because you should actually be able to read them.
        </p>
      </Section>

      <Section tone="paper" className="py-14 md:py-20">
        <ol className="flex flex-col gap-10">
          {SECTIONS.map((s) => (
            <li
              key={s.k}
              className="grid grid-cols-12 gap-6 border-b border-ink/10 pb-10 last:border-none"
            >
              <div className="col-span-12 md:col-span-3">
                <span className="mono text-[0.72rem] uppercase tracking-[0.28em] text-muted">
                  {s.k}
                </span>
                <h2
                  className="serif mt-4 leading-[1.05]"
                  style={{
                    fontSize: "clamp(1.6rem, calc(0.9rem + 1.2vw), 2.3rem)",
                  }}
                >
                  {s.title}
                </h2>
              </div>
              <div className="col-span-12 flex flex-col gap-4 md:col-span-9">
                {s.body.map((p) => (
                  <p
                    key={p.slice(0, 40)}
                    className="max-w-[72ch] text-[1.02rem] leading-[1.6] text-ink/80"
                  >
                    {p}
                  </p>
                ))}
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section tone="ink" className="py-16 md:py-20">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 md:col-span-6">
            <div className="mono text-[0.72rem] uppercase tracking-[0.28em] text-cream/60">
              tldr
            </div>
            <h3
              className="serif-italic mt-6 leading-[1.1]"
              style={{ fontSize: "clamp(1.5rem, calc(1rem + 1.5vw), 2.3rem)" }}
            >
              Be honest about what you feed us. Ship what you make. The model
              is not a god.
            </h3>
          </div>
          <div className="col-span-12 flex flex-col gap-3 md:col-span-6 md:items-end md:justify-end">
            <Link
              href="/privacy"
              className="mono text-[0.72rem] uppercase tracking-[0.24em] text-cream/70 hover:text-viral"
            >
              Privacy <span aria-hidden>→</span>
            </Link>
            <Link
              href="/contact"
              className="mono text-[0.72rem] uppercase tracking-[0.24em] text-cream/70 hover:text-viral"
            >
              Contact <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </Section>
    </main>
  );
}
