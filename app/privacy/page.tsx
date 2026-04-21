import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/editorial/Nav";
import { Section } from "@/components/editorial/Section";
import { HighlightChip } from "@/components/editorial/HighlightChip";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "What lucid keeps, what it discards, and how to make us forget you exist.",
};

const SECTIONS: ReadonlyArray<{ k: string; title: string; body: string[] }> = [
  {
    k: "01",
    title: "What we keep.",
    body: [
      "Your email, if you joined the waitlist.",
      "The source of the signup (\"waitlist-page\", \"twitter-bio\"), and your document.referrer at that moment.",
      "A truncated user-agent string and a daily-rotating hash of your IP. Both exist only for abuse forensics; we never map them back to you.",
      "If you use the product after it opens, the numerical score the engine produced, the rewritten script you asked for, and the transcript of your chat with it. Text, never video.",
    ],
  },
  {
    k: "02",
    title: "What we do not keep.",
    body: [
      "We do not keep your video bytes. Uploads are processed and discarded the moment the score is generated.",
      "We do not keep your raw IP. The hash we store rotates daily, which means a record made on Tuesday is unfindable by Wednesday.",
      "We do not sell, rent, or share the list. Nobody outside the team sees your email.",
    ],
  },
  {
    k: "03",
    title: "How long.",
    body: [
      "Waitlist emails: until the product opens and you either accept the invite or ignore it for 90 days.",
      "Scores and rewrites: 18 months, then aggregated into anonymous counts and deleted.",
      "Abuse logs (hash + UA): 30 days, then purged on a cron.",
    ],
  },
  {
    k: "04",
    title: "Your rights.",
    body: [
      "You can ask us to delete everything we have on you at any time. One email to hello@lucid.ai and your row is gone inside 7 days, including backups that roll forward past the next snapshot.",
      "If you are in the EU or UK, you have the right to export your data, restrict processing, and object to any use we make of it. Same email address. Same 7 days.",
      "If you are in California, the same applies under CCPA.",
    ],
  },
  {
    k: "05",
    title: "Who we share with.",
    body: [
      "Supabase stores the signup row. Vercel serves the pages. Anthropic and Google run the language and vision models. Apify runs the creator scrape. Resend sends the one email we ever send you.",
      "Each of these vendors sees only the minimum slice of data their piece of the pipe needs. None of them get the full picture.",
    ],
  },
  {
    k: "06",
    title: "Changes.",
    body: [
      "If we change this document in any way that makes it less protective, we email everyone on the list first. No surprises.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <main>
      <Nav />

      <Section tone="cream" className="pb-10 pt-6 md:pb-16 md:pt-10">
        <div className="mono flex items-center gap-3 text-[0.72rem] uppercase tracking-[0.28em] text-muted">
          <span className="inline-block h-[1px] w-10 bg-muted/60" />
          <span>Privacy · lucid:v2 · Effective 2026-04-22</span>
        </div>
        <h1
          className="serif mt-8 leading-[0.9] tracking-[-0.02em]"
          style={{ fontSize: "clamp(3rem, calc(1rem + 4vw), 5.3rem)" }}
        >
          Privacy.
          <br />
          <HighlightChip variant="orange" hero>We keep it small.</HighlightChip>
        </h1>
        <p className="mt-8 max-w-[58ch] text-[clamp(1.02rem, calc(0.92rem + 0.35vw), 1.22rem)] leading-[1.5] text-ink/80">
          Short version: we hold your email if you gave it to us, and the
          numerical output of the engine if you used it. We do not hold your
          video, your raw IP, or anything we would be embarrassed to lose.
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
              one thing to remember
            </div>
            <h3
              className="serif-italic mt-6 leading-[1.1]"
              style={{ fontSize: "clamp(1.5rem, calc(1rem + 1.5vw), 2.3rem)" }}
            >
              Email hello@lucid.ai and your row is gone. Seven days, including
              backups.
            </h3>
          </div>
          <div className="col-span-12 flex flex-col gap-3 md:col-span-6 md:items-end md:justify-end">
            <Link
              href="/terms"
              className="mono text-[0.72rem] uppercase tracking-[0.24em] text-cream/70 hover:text-viral"
            >
              Terms <span aria-hidden>→</span>
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
