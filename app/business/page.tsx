import Link from "next/link";
import { Nav } from "@/components/editorial/Nav";
import { Section } from "@/components/editorial/Section";
import { HighlightChip } from "@/components/editorial/HighlightChip";
import { Pullquote } from "@/components/editorial/Pullquote";

export const metadata = {
  title: "lucid · business",
  description:
    "The economics of scoring virality with a foundation model trained on the human brain.",
};

const marketBeats = [
  { label: "Short-form ad market", value: "$94B", note: "2025 · reels, shorts, tiktok combined" },
  { label: "Paying creators worldwide", value: "50M+", note: "full-time + part-time, across platforms" },
  { label: "Creators earning > $100K", value: "2.4M", note: "our beachhead · they already pay for tools" },
  { label: "Avg monthly tool spend", value: "$180", note: "per serious creator · analytics + edit + AI" },
];

const tiers = [
  {
    tag: "Free",
    verb: "Try the mirror.",
    price: "$0",
    sub: "forever",
    body: "One score per day. One research query per day. Read-only rewrite plan. Enough to feel the edge without a card.",
    bullets: [
      "1 scored reel / day",
      "1 creator research / day",
      "1 rewrite plan / day (read-only)",
      "Community patterns feed",
    ],
    tone: "cream",
    cta: "Start free",
    href: "/score",
  },
  {
    tag: "Creator",
    verb: "Ship smarter.",
    price: "$29",
    sub: "per month",
    body: "Unlimited scoring, research, and conversational rewrite. History you can search. The plan most tensorboys land on.",
    bullets: [
      "Unlimited scores, research, rewrites",
      "Conversational rewrite with history",
      "Export scene timelines + shot plans",
      "Network-weight A/B experiments",
      "Priority inference queue",
    ],
    tone: "orange",
    cta: "Go creator",
    href: "/score",
    featured: true,
  },
  {
    tag: "Agency",
    verb: "Run a roster.",
    price: "$99",
    sub: "per month",
    body: "Manage multiple creators, assign network targets per brand, share research libraries across teammates.",
    bullets: [
      "Up to 10 creator profiles",
      "Per-brand network-weight presets",
      "Shared research libraries",
      "Team seats, role permissions",
      "White-label PDF briefs",
    ],
    tone: "ink",
    cta: "Start agency",
    href: "/score",
  },
  {
    tag: "Enterprise",
    verb: "Own the engine.",
    price: "Talk",
    sub: "custom contract",
    body: "Alpha engine API access, custom network weighting for vertical goals, on-prem option for studios and labs.",
    bullets: [
      "Direct Alpha engine API",
      "Custom cortical weight schemas",
      "On-prem or VPC deploy",
      "Dedicated GPU allocation",
      "SOC 2 roadmap · Q3 2026",
    ],
    tone: "cream",
    cta: "Talk to us",
    href: "mailto:hi@lucid.tools",
  },
];

const moat = [
  {
    k: "01",
    title: "Proprietary neuro alignment",
    body: "We don't just run an open foundation model. We calibrate its activations against our own viral-outcome dataset: real reels and their actual share rates. That calibration is ours.",
  },
  {
    k: "02",
    title: "The loop compounds",
    body: "Score → research → rewrite → score. Every reel a creator ships adds a row to our shared pattern graph. Product data compounds faster than any single competitor can match.",
  },
  {
    k: "03",
    title: "Distribution is built in",
    body: "Founder ships to 260K. Every new v2 feature launches with a real reel that teaches the feature. Acquisition cost approaches zero when the product markets itself.",
  },
  {
    k: "04",
    title: "The horizon is bigger than creators",
    body: "The same engine scores ad creatives for DTC brands, trailer cuts for studios, and training stimuli for labs. Creators first — because they test every day. Then everyone who buys attention.",
  },
];

const roiRows = [
  { label: "Reels shipped per month", you: "20", lucid: "20" },
  { label: "Hit rate (> 1M views)", you: "5 %", lucid: "18 %" },
  { label: "Brand deal ceiling / reel", you: "$3K", lucid: "$8K" },
  { label: "Expected monthly ceiling", you: "$3K", lucid: "$28K" },
  { label: "Cost of lucid Creator", you: "—", lucid: "$29" },
];

const gtm = [
  {
    phase: "Phase 1 · now",
    title: "Founder-led creator drop",
    body: "Soft launch to 260K audience. Every score shipped as a reel. Target 1,000 paying creators in 90 days at $29, $29K MRR. CAC near zero.",
  },
  {
    phase: "Phase 2 · H2 2026",
    title: "Agency beachhead",
    body: "Warm intros to MCNs and boutique talent agencies. 50 agencies at $99 is $5K MRR from a dozen conversations. Their creators inherit the tool.",
  },
  {
    phase: "Phase 3 · 2027",
    title: "Enterprise API",
    body: "Ad agencies and brand studios buy Alpha engine access by the inference. $0.25 per scored asset, minimum 10K per month. The ad-creative vertical is 100× the creator TAM.",
  },
];

export default function BusinessPage() {
  return (
    <main>
      <Nav />

      {/* HERO */}
      <Section tone="cream" className="py-16 md:py-28">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 md:col-span-8">
            <div className="mono text-[0.72rem] uppercase tracking-[0.28em] text-muted">
              Issue 01 · the business of brains
            </div>
            <h1
              className="serif mt-8 leading-[0.94]"
              style={{ fontSize: "var(--text-display)" }}
            >
              The{" "}
              <HighlightChip variant="orange">first</HighlightChip>{" "}
              neuro tool creators
              <br />
              actually{" "}
              <span className="serif-italic">pay for.</span>
            </h1>
            <p className="mt-10 max-w-[56ch] text-[1.08rem] leading-[1.6] text-ink/80">
              The creator economy runs on guesses. A $94B short-form ad market
              moves every day on vibes. lucid ships the first product that
              grades a reel against the actual brain networks that decide what
              gets shared. We are not a dashboard. We are the operating table.
            </p>
          </div>
          <div className="col-span-12 md:col-span-4">
            <figure className="rounded-sm border border-ink/20 bg-paper p-6 md:p-8">
              <div className="mono text-[0.68rem] uppercase tracking-[0.28em] text-muted">
                North star
              </div>
              <p
                className="serif mt-4 leading-[0.98]"
                style={{ fontSize: "clamp(2.2rem, calc(1rem + 2vw), 3.2rem)" }}
              >
                $1 of creator spend,{" "}
                <HighlightChip variant="orange">$7</HighlightChip>{" "}
                <span className="serif-italic">of reel revenue.</span>
              </p>
              <div className="mono mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[0.7rem] uppercase tracking-[0.24em] text-muted">
                <span>ARR target · Y1</span>
                <span className="opacity-40">/</span>
                <span className="text-viral">$3.5M</span>
                <span className="opacity-40">/</span>
                <span>paying creators</span>
                <span className="opacity-40">/</span>
                <span className="text-viral">10K</span>
              </div>
            </figure>
          </div>
        </div>
      </Section>

      {/* MARKET */}
      <Section tone="ink" className="py-20 md:py-28">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-5">
            <div className="mono text-[0.72rem] uppercase tracking-[0.28em] text-cream/60">
              Market · the arithmetic
            </div>
            <h2
              className="serif mt-8 leading-[0.95] text-cream"
              style={{ fontSize: "var(--text-hero)" }}
            >
              The numbers{" "}
              <HighlightChip variant="orange">want</HighlightChip>{" "}
              <span className="serif-italic">this.</span>
            </h2>
            <p className="mt-8 max-w-[42ch] text-[1.02rem] leading-[1.6] text-cream/75">
              Short-form owns attention. Creators already spend on editing and
              analytics. Nobody has sold them neuro until now. Price discovery
              is not the risk, existence is.
            </p>
          </div>
          <div className="col-span-12 md:col-span-7">
            <ol className="divide-y divide-cream/15">
              {marketBeats.map((m, i) => (
                <li
                  key={m.label}
                  className="flex items-baseline gap-6 py-5 md:py-6"
                >
                  <span className="mono w-6 shrink-0 text-[0.7rem] uppercase tracking-[0.28em] text-cream/50">
                    0{i + 1}
                  </span>
                  <span
                    className="serif flex-1 leading-[1] text-cream"
                    style={{
                      fontSize: "clamp(2.4rem, calc(1rem + 2.4vw), 3.6rem)",
                    }}
                  >
                    {m.value}
                  </span>
                  <div className="flex-1 text-right">
                    <div className="mono text-[0.72rem] uppercase tracking-[0.24em] text-cream/70">
                      {m.label}
                    </div>
                    <div className="mt-1 text-[0.85rem] text-cream/50">
                      {m.note}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Section>

      {/* PRICING */}
      <Section tone="cream" className="py-24 md:py-36">
        <div className="grid grid-cols-12 gap-6 md:gap-10">
          <div className="col-span-12 md:col-span-4">
            <div className="mono text-[0.72rem] uppercase tracking-[0.28em] text-muted">
              Pricing · four tiers
            </div>
            <h2
              className="serif mt-8 leading-[0.95]"
              style={{ fontSize: "var(--text-hero)" }}
            >
              Pay for{" "}
              <HighlightChip variant="orange">lift.</HighlightChip>
              <br />
              <span className="serif-italic">Not seats.</span>
            </h2>
            <p className="mt-8 max-w-[38ch] text-[1.02rem] leading-[1.6] text-ink/75">
              Every tier unlocks the same engine. The difference is how many
              reels you push through it, and how many hands hold the wheel.
              Start free, upgrade the day the first scored reel hits a million.
            </p>
          </div>
          <div className="col-span-12 md:col-span-8">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {tiers.map((t) => {
                const isFeatured = t.featured;
                const cardTone =
                  t.tone === "ink"
                    ? "bg-ink text-cream border-ink"
                    : t.tone === "orange"
                      ? "bg-viral text-white border-viral"
                      : "bg-paper text-ink border-ink/15";
                return (
                  <div
                    key={t.tag}
                    className={`group relative flex flex-col gap-6 rounded-sm border p-6 md:p-7 ${cardTone}`}
                  >
                    {isFeatured && (
                      <span className="mono absolute -top-3 left-6 inline-flex items-center rounded-full bg-ink px-3 py-1 text-[0.62rem] uppercase tracking-[0.28em] text-cream">
                        the one most tensorboys land on
                      </span>
                    )}
                    <div className="flex items-baseline justify-between">
                      <div className="mono text-[0.72rem] uppercase tracking-[0.28em] opacity-70">
                        {t.tag}
                      </div>
                      <div className="text-right">
                        <div
                          className="serif leading-[1]"
                          style={{ fontSize: "clamp(2rem, calc(1rem + 1.4vw), 2.8rem)" }}
                        >
                          {t.price}
                        </div>
                        <div className="mono text-[0.62rem] uppercase tracking-[0.24em] opacity-60">
                          {t.sub}
                        </div>
                      </div>
                    </div>
                    <h3
                      className="serif leading-[1]"
                      style={{ fontSize: "clamp(1.6rem, calc(1rem + 1.2vw), 2.2rem)" }}
                    >
                      {t.verb}
                    </h3>
                    <p className="text-[0.95rem] leading-[1.55] opacity-90">
                      {t.body}
                    </p>
                    <ul className="mono flex flex-col gap-2 text-[0.78rem] uppercase tracking-[0.18em] opacity-85">
                      {t.bullets.map((b) => (
                        <li key={b} className="flex items-start gap-3">
                          <span className="mt-[0.45em] h-1 w-1 shrink-0 rounded-full bg-current opacity-60" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={t.href}
                      className={`mono mt-auto inline-flex items-center gap-2 rounded-full px-4 py-2 text-[0.72rem] uppercase tracking-[0.24em] transition ${
                        t.tone === "ink"
                          ? "bg-cream text-ink hover:bg-viral hover:text-white"
                          : t.tone === "orange"
                            ? "bg-ink text-cream hover:bg-cream hover:text-ink"
                            : "bg-ink text-cream hover:bg-viral"
                      }`}
                    >
                      {t.cta} <span aria-hidden>→</span>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Section>

      {/* ROI */}
      <Section tone="paper" className="py-24 md:py-32">
        <div className="grid grid-cols-12 gap-6 md:gap-10">
          <div className="col-span-12 md:col-span-5">
            <div className="mono text-[0.72rem] uppercase tracking-[0.28em] text-muted">
              Unit economics · the case for $29
            </div>
            <h2
              className="serif mt-8 leading-[0.95]"
              style={{ fontSize: "var(--text-hero)" }}
            >
              One hit pays for{" "}
              <HighlightChip variant="orange">ten years</HighlightChip>{" "}
              <span className="serif-italic">of the tool.</span>
            </h2>
            <p className="mt-8 max-w-[42ch] text-[1.02rem] leading-[1.6] text-ink/75">
              The math below is a working creator shipping the same number of
              reels, with and without lucid. Hit rate is the lever. Brand deal
              ceiling is the multiplier.
            </p>
          </div>
          <div className="col-span-12 md:col-span-7">
            <div className="overflow-hidden rounded-sm border border-ink/15 bg-cream">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-ink/15">
                    <th className="mono px-5 py-4 text-[0.68rem] uppercase tracking-[0.24em] text-muted">
                      Month of shipping
                    </th>
                    <th className="mono px-5 py-4 text-right text-[0.68rem] uppercase tracking-[0.24em] text-muted">
                      You, today
                    </th>
                    <th className="mono px-5 py-4 text-right text-[0.68rem] uppercase tracking-[0.24em] text-viral">
                      You, on lucid
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {roiRows.map((r, i) => {
                    const isTotal = i === roiRows.length - 2;
                    return (
                      <tr
                        key={r.label}
                        className={`border-b border-ink/10 ${isTotal ? "bg-paper" : ""}`}
                      >
                        <td className={`px-5 py-4 text-[0.98rem] ${isTotal ? "font-medium" : "text-ink/80"}`}>
                          {r.label}
                        </td>
                        <td className={`serif px-5 py-4 text-right leading-[1] ${isTotal ? "text-ink/70" : "text-ink/70"}`} style={{ fontSize: "clamp(1.1rem, calc(0.95rem + 0.4vw), 1.5rem)" }}>
                          {r.you}
                        </td>
                        <td
                          className="serif px-5 py-4 text-right leading-[1] text-viral"
                          style={{
                            fontSize: isTotal
                              ? "clamp(1.4rem, calc(1rem + 0.7vw), 2rem)"
                              : "clamp(1.1rem, calc(0.95rem + 0.4vw), 1.5rem)",
                          }}
                        >
                          {r.lucid}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="mono mt-5 text-[0.7rem] uppercase tracking-[0.24em] text-muted">
              Model assumes 3.6× lift in hit rate · validated on creator's 170-reel back-catalog
            </p>
          </div>
        </div>
      </Section>

      {/* MOAT */}
      <Section tone="ink" className="py-24 md:py-32">
        <div className="grid grid-cols-12 gap-6 md:gap-10">
          <div className="col-span-12 md:col-span-4">
            <div className="mono text-[0.72rem] uppercase tracking-[0.28em] text-cream/60">
              Moat · why we win
            </div>
            <h2
              className="serif mt-8 leading-[0.95] text-cream"
              style={{ fontSize: "var(--text-hero)" }}
            >
              Open weights
              <br />
              don't build{" "}
              <HighlightChip variant="orange">products.</HighlightChip>
            </h2>
            <p className="mt-8 max-w-[36ch] text-[1rem] leading-[1.6] text-cream/75">
              Anyone can download the fMRI foundation model. Almost nobody will
              align it to shareability, wrap it in a loop creators use daily, or
              build the creator distribution to seed it. We are doing all four.
            </p>
          </div>
          <ol className="col-span-12 grid grid-cols-1 gap-6 md:col-span-8 md:grid-cols-2">
            {moat.map((m) => (
              <li
                key={m.k}
                className="group flex flex-col gap-4 rounded-sm border border-cream/15 bg-ink-soft/40 p-6"
              >
                <div className="mono text-[0.7rem] uppercase tracking-[0.28em] text-viral">
                  {m.k}
                </div>
                <h3
                  className="serif leading-[1.05] text-cream"
                  style={{ fontSize: "clamp(1.35rem, calc(1rem + 0.7vw), 1.8rem)" }}
                >
                  {m.title}
                </h3>
                <p className="text-[0.95rem] leading-[1.6] text-cream/70">
                  {m.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      {/* GTM */}
      <Section tone="cream" className="py-24 md:py-32">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-5">
            <div className="mono text-[0.72rem] uppercase tracking-[0.28em] text-muted">
              Go to market · three phases
            </div>
            <h2
              className="serif mt-8 leading-[0.95]"
              style={{ fontSize: "var(--text-hero)" }}
            >
              A creator sells
              <br />
              <span className="serif-italic">to creators.</span>
            </h2>
          </div>
          <ol className="col-span-12 grid grid-cols-1 gap-6 md:col-span-7">
            {gtm.map((g, i) => (
              <li
                key={g.phase}
                className="grid grid-cols-12 gap-5 border-b border-ink/15 pb-6"
              >
                <div className="mono col-span-12 text-[0.72rem] uppercase tracking-[0.28em] text-viral md:col-span-3">
                  {g.phase}
                </div>
                <div className="col-span-12 md:col-span-9">
                  <h3
                    className="serif leading-[1.05]"
                    style={{ fontSize: "clamp(1.5rem, calc(1rem + 0.9vw), 2.1rem)" }}
                  >
                    {g.title}
                  </h3>
                  <p className="mt-3 max-w-[54ch] text-[0.98rem] leading-[1.6] text-ink/75">
                    {g.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      {/* PULLQUOTE */}
      <Section tone="ink" className="py-20 md:py-28">
        <Pullquote attribution="the close" tone="ink" size="lg">
          The first tool that measured page speed{" "}
          <HighlightChip variant="orange">won</HighlightChip> the web. The first
          tool that measures brain speed{" "}
          <span className="serif-italic">wins</span> the feed.
        </Pullquote>
      </Section>

      {/* CTA */}
      <Section tone="cream" className="py-20 md:py-24">
        <div className="flex flex-col items-start justify-between gap-10 md:flex-row md:items-end">
          <div className="max-w-[54ch]">
            <div className="mono text-[0.72rem] uppercase tracking-[0.28em] text-muted">
              For founders, investors, partners
            </div>
            <h2
              className="serif mt-6 leading-[0.95]"
              style={{ fontSize: "clamp(2.2rem, calc(1rem + 2vw), 3.4rem)" }}
            >
              If you buy attention,
              <br />
              you should be{" "}
              <HighlightChip variant="orange">measuring</HighlightChip>{" "}
              <span className="serif-italic">brains.</span>
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/score"
              className="mono inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-[0.72rem] uppercase tracking-[0.24em] text-cream hover:bg-viral"
            >
              Score a reel <span aria-hidden>→</span>
            </Link>
            <a
              href="mailto:hi@lucid.tools"
              className="mono inline-flex items-center gap-2 rounded-full border border-ink px-5 py-3 text-[0.72rem] uppercase tracking-[0.24em] text-ink hover:bg-ink hover:text-cream"
            >
              Talk to the founder
            </a>
          </div>
        </div>
      </Section>

      {/* FOOTER */}
      <Section tone="ink" className="py-16">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="mono text-[0.7rem] uppercase tracking-[0.28em] text-cream/60">
              lucid · business
            </div>
            <p
              className="serif-italic mt-3 leading-[1]"
              style={{ fontSize: "clamp(1.2rem, calc(1rem + 0.8vw), 1.8rem)" }}
            >
              Hack virality at the neuro level.
            </p>
          </div>
          <div className="mono flex flex-wrap gap-x-6 gap-y-2 text-[0.72rem] uppercase tracking-[0.24em] text-cream/60">
            <Link href="/score" className="hover:text-viral">Score</Link>
            <Link href="/research" className="hover:text-viral">Research</Link>
            <Link href="/rewrite" className="hover:text-viral">Rewrite</Link>
            <Link href="/proof" className="hover:text-viral">Proof</Link>
            <a href="https://github.com/Tensorboyalive/lucid" className="hover:text-viral">
              GitHub
            </a>
          </div>
        </div>
      </Section>
    </main>
  );
}
