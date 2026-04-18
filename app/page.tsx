import Link from "next/link";
import { Nav } from "@/components/editorial/Nav";
import { Hero } from "@/components/editorial/Hero";
import { Marquee } from "@/components/editorial/Marquee";
import { Section } from "@/components/editorial/Section";
import { Pullquote } from "@/components/editorial/Pullquote";
import { HighlightChip } from "@/components/editorial/HighlightChip";

const surfaces = [
  {
    tag: "01 · Score",
    title: "The mirror.",
    body: "Paste a reel. The Alpha engine maps 20,484 cortical vertices every second. You get a score, a scene timeline, and the exact moments where the brain went dark.",
    href: "/score",
    cta: "Score a reel",
  },
  {
    tag: "02 · Research",
    title: "The inspiration.",
    body: "Type a handle. We pull their 20 most-watched reels, transcribe them, and open a chat with the viral engine about what actually worked. Patterns, hooks, pacing.",
    href: "/research",
    cta: "Research a creator",
  },
  {
    tag: "03 · Rewrite",
    title: "The execution.",
    body: "Paste a draft. The Gamma engine, anchored to fMRI patterns and real viral transcripts, returns a rewritten script plus shooting directions. Frame by frame.",
    href: "/rewrite",
    cta: "Rewrite a script",
  },
];

const marqueeItems = [
  "20,484 cortical vertices",
  "1,000+ hours of fMRI",
  "720 real subjects",
  "Reward · Emotion · Attention · Memory",
  "Alpha engine · neuro scoring",
  "Beta engine · scene understanding",
  "Gamma engine · script intelligence",
  "Apify creator scrape",
  "yt-dlp download",
];

export default function Home() {
  return (
    <main>
      <Nav />
      <Hero />

      <Marquee items={marqueeItems} tone="orange" />

      <Section tone="cream" className="py-24 md:py-36">
        <div className="grid grid-cols-12 gap-6 md:gap-10">
          <div className="col-span-12 md:col-span-4">
            <div className="mono text-[0.72rem] uppercase tracking-[0.28em] text-muted">
              The product · three surfaces
            </div>
            <h2
              className="serif mt-8 leading-[0.95]"
              style={{ fontSize: "var(--text-hero)" }}
            >
              Test.{" "}
              <HighlightChip variant="cream">Research.</HighlightChip>{" "}
              <span className="serif-italic">Rewrite.</span>
            </h2>
            <p className="mt-8 max-w-[38ch] text-[1.05rem] leading-[1.55] text-ink/80">
              One loop. Every reel you ship gets smarter than the last.
            </p>
          </div>
          <div className="col-span-12 md:col-span-8">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {surfaces.map((s, i) => (
                <Link
                  href={s.href}
                  key={s.tag}
                  className="group relative flex flex-col gap-6 rounded-sm border border-ink/15 bg-paper p-6 transition hover:border-viral hover:bg-cream md:min-h-[22rem]"
                >
                  <div className="mono text-[0.68rem] uppercase tracking-[0.28em] text-muted">
                    {s.tag}
                  </div>
                  <h3
                    className="serif leading-[1]"
                    style={{ fontSize: "clamp(2rem, calc(1rem + 1.5vw), 2.75rem)" }}
                  >
                    {s.title}
                  </h3>
                  <p className="text-[0.98rem] leading-[1.55] text-ink/75">
                    {s.body}
                  </p>
                  <span className="mono mt-auto inline-flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.26em] text-ink group-hover:text-viral">
                    {s.cta} <span aria-hidden>→</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section tone="ink" className="py-24 md:py-36">
        <Pullquote
          attribution="the thesis"
          tone="ink"
        >
          Brains follow patterns. Most creators ship content{" "}
          <HighlightChip variant="orange">blind</HighlightChip>. You won’t.
        </Pullquote>
      </Section>

      <Section tone="cream" className="py-24 md:py-36">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-5">
            <div className="mono text-[0.72rem] uppercase tracking-[0.28em] text-muted">
              How the loop runs
            </div>
            <h2
              className="serif mt-8 leading-[0.95]"
              style={{ fontSize: "var(--text-hero)" }}
            >
              Four networks.{" "}
              <HighlightChip variant="orange">One number.</HighlightChip>
            </h2>
          </div>
          <ol className="col-span-12 grid grid-cols-1 gap-8 md:col-span-7 md:gap-6">
            {[
              {
                k: "Reward",
                w: "30%",
                body: "Orbitofrontal cortex. The “I want to share this” signal. Dopamine arousal.",
              },
              {
                k: "Emotion",
                w: "25%",
                body: "Insula + cingulate. The “I feel this” signal. Salience and valence.",
              },
              {
                k: "Attention",
                w: "25%",
                body: "Parietal + frontal. The “I can’t look away” signal. Sustained focus.",
              },
              {
                k: "Memory",
                w: "20%",
                body: "Parahippocampal + DMN. The “I’ll remember this” signal. Encoding strength.",
              },
            ].map((row, idx) => (
              <li
                key={row.k}
                className="group flex items-start gap-6 border-b border-ink/15 pb-6"
              >
                <span className="mono pt-3 text-[0.72rem] uppercase tracking-[0.28em] text-muted">
                  0{idx + 1}
                </span>
                <div className="flex-1">
                  <div className="flex items-baseline justify-between">
                    <h3
                      className="serif leading-[1]"
                      style={{ fontSize: "clamp(1.5rem, calc(1rem + 1.1vw), 2.3rem)" }}
                    >
                      {row.k}
                    </h3>
                    <span className="mono text-[0.78rem] uppercase tracking-[0.22em] text-viral">
                      weight {row.w}
                    </span>
                  </div>
                  <p className="mt-3 max-w-[52ch] text-[0.98rem] leading-[1.55] text-ink/75">
                    {row.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      <Section tone="paper" className="py-24 md:py-36">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 md:col-span-6">
            <div className="mono text-[0.72rem] uppercase tracking-[0.28em] text-muted">
              Built for creators who don’t guess
            </div>
            <h2
              className="serif mt-8 leading-[0.95]"
              style={{ fontSize: "var(--text-hero)" }}
            >
              Ship the reel. <HighlightChip variant="orange">Then</HighlightChip>{" "}
              <span className="serif-italic">ship a better one.</span>
            </h2>
            <p className="mt-8 max-w-[52ch] text-[1.05rem] leading-[1.55] text-ink/75">
              This isn’t a dashboard. It’s a feedback loop. Test your content,
              research what’s working, rewrite with AI that knows the
              neuroscience, then test again. Every reel informs the next.
            </p>
          </div>
          <div className="col-span-12 md:col-span-6">
            <figure className="rounded-sm border border-ink/15 bg-cream p-8">
              <blockquote className="text-[1.02rem] leading-[1.6] text-ink/85">
                I’ve posted 170 reels to 260K followers. I’m a sniper. I
                don’t post mindlessly, I{" "}
                <HighlightChip variant="orange">re-engineer</HighlightChip>.
                I’ve shipped creator tooling with OpenAI and Google. This
                is the system I’ve always wanted behind every upload.
              </blockquote>
              <figcaption className="mono mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-[0.7rem] uppercase tracking-[0.24em] text-muted">
                <span>@tensorboy</span>
                <span className="opacity-40">/</span>
                <span>creator, 260K</span>
                <span className="opacity-40">/</span>
                <a
                  href="https://ai.meta.com/research/publications/tribe-v2/"
                  target="_blank"
                  rel="noreferrer"
                  className="underline underline-offset-[6px] hover:text-viral"
                >
                  Read the research
                </a>
              </figcaption>
            </figure>
          </div>
        </div>
      </Section>

      <Section tone="paper" className="py-20 md:py-28">
        <div className="grid grid-cols-12 gap-6 md:gap-10">
          <div className="col-span-12 md:col-span-5">
            <div className="mono text-[0.72rem] uppercase tracking-[0.28em] text-muted">
              The business, in one line
            </div>
            <h2
              className="serif mt-8 leading-[0.95]"
              style={{ fontSize: "var(--text-hero)" }}
            >
              $29 a month.
              <br />
              <HighlightChip variant="orange">One hit</HighlightChip>{" "}
              <span className="serif-italic">pays for a decade.</span>
            </h2>
            <p className="mt-8 max-w-[44ch] text-[1rem] leading-[1.6] text-ink/75">
              Four tiers, one engine. Free for the curious, $29 for the creator
              who ships weekly, $99 for the agency running a roster, custom for
              the studios that buy attention by the GPU hour.
            </p>
            <Link
              href="/business"
              className="mono mt-8 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-[0.72rem] uppercase tracking-[0.24em] text-cream hover:bg-viral"
            >
              See the business page <span aria-hidden>→</span>
            </Link>
          </div>
          <div className="col-span-12 md:col-span-7">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {[
                { t: "Free", p: "$0", s: "try the mirror" },
                { t: "Creator", p: "$29", s: "ship smarter", hot: true },
                { t: "Agency", p: "$99", s: "run a roster" },
                { t: "Enterprise", p: "Talk", s: "own the engine" },
              ].map((t) => (
                <div
                  key={t.t}
                  className={`flex flex-col gap-2 rounded-sm border p-5 ${
                    t.hot
                      ? "bg-viral text-white border-viral"
                      : "bg-cream text-ink border-ink/15"
                  }`}
                >
                  <div className="mono text-[0.62rem] uppercase tracking-[0.28em] opacity-80">
                    {t.t}
                  </div>
                  <div
                    className="serif leading-[1]"
                    style={{ fontSize: "clamp(1.8rem, calc(1rem + 1.2vw), 2.4rem)" }}
                  >
                    {t.p}
                  </div>
                  <div className="mono text-[0.62rem] uppercase tracking-[0.22em] opacity-70">
                    {t.s}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section tone="ink" className="py-20">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <div>
            <div className="mono text-[0.7rem] uppercase tracking-[0.28em] text-cream/60">
              lucid:v2
            </div>
            <p
              className="serif-italic mt-4 leading-[1]"
              style={{ fontSize: "clamp(1.4rem, calc(1rem + 1vw), 2rem)" }}
            >
              Hack virality at the neuro level.
            </p>
          </div>
          <div className="mono flex flex-wrap gap-x-6 gap-y-2 text-[0.72rem] uppercase tracking-[0.24em] text-cream/60">
            <Link href="/score" className="hover:text-viral">Score</Link>
            <Link href="/research" className="hover:text-viral">Research</Link>
            <Link href="/rewrite" className="hover:text-viral">Rewrite</Link>
            <Link href="/proof" className="hover:text-viral">Proof</Link>
            <Link href="/business" className="hover:text-viral">Business</Link>
            <a
              href="https://github.com/Tensorboyalive/lucid"
              className="hover:text-viral"
            >
              GitHub
            </a>
          </div>
        </div>
      </Section>
    </main>
  );
}
