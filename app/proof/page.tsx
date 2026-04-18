"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Nav } from "@/components/editorial/Nav";
import { Section } from "@/components/editorial/Section";
import { HighlightChip } from "@/components/editorial/HighlightChip";
import { AsciiBrain } from "@/components/surfaces/AsciiBrain";

const REAL_SCORE = {
  reward: 4.0,
  emotion: 5.5,
  attention: 4.9,
  memory: 4.2,
  overall: 4.6,
};

export default function ProofPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -120]);

  return (
    <main>
      <Nav />

      <Section tone="cream" className="pb-16 pt-6 md:pb-24 md:pt-12">
        <motion.div ref={heroRef} style={{ y: heroY }}>
          <div className="mono flex items-center gap-3 text-[0.72rem] uppercase tracking-[0.28em] text-muted">
            <span className="inline-block h-[1px] w-10 bg-muted/60" />
            <span>Proof · the receipts</span>
          </div>
          <h1
            className="serif mt-8 leading-[0.9] tracking-[-0.02em]"
            style={{ fontSize: "clamp(3rem, calc(1rem + 4vw), 5.3rem)" }}
          >
            A paper came out. So I{" "}
            <HighlightChip variant="orange">built it</HighlightChip>.
          </h1>
          <p className="mt-10 max-w-[62ch] text-[clamp(1.05rem, calc(0.95rem + 0.4vw), 1.28rem)] leading-[1.55] text-ink/80">
            The research landed last year. A foundation model trained on a
            thousand hours of real fMRI scans across 720 people, predicting
            cortical activation across 20,484 vertices every second. The
            paper shipped the weights. I ran them on my own reels. Here
            are the receipts.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="https://ai.meta.com/research/publications/a-foundation-model-of-vision-audition-and-language-for-in-silico-neuroscience/"
              target="_blank"
              rel="noreferrer"
              className="mono inline-flex items-center gap-2 rounded-full border border-ink px-5 py-3 text-[0.72rem] uppercase tracking-[0.24em] transition hover:bg-ink hover:text-cream"
            >
              <span>Read the research</span>
              <span aria-hidden>↗</span>
            </a>
          </div>
        </motion.div>
      </Section>

      <Section tone="ink" className="py-20 md:py-28">
        <div className="grid grid-cols-12 gap-10">
          <div className="col-span-12 md:col-span-6">
            <div className="mono text-[0.72rem] uppercase tracking-[0.28em] text-cream/60">
              01 · the run
            </div>
            <h2
              className="serif mt-6 leading-[0.95]"
              style={{ fontSize: "clamp(2.2rem, calc(1rem + 2.5vw), 3.5rem)" }}
            >
              I scored two real reels on a{" "}
              <HighlightChip variant="orange">GPU cluster</HighlightChip>.
            </h2>
            <p className="mt-6 max-w-[48ch] text-[1.02rem] leading-[1.6] text-cream/80">
              The Alpha engine runs the foundation model on an L4 GPU.
              Each second of video produces activation maps across four
              engagement networks. This is the actual cortical rotation
              output from one inference run.
            </p>
            <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-3">
              {(
                [
                  ["Reward", REAL_SCORE.reward, "#E85D1C"],
                  ["Emotion", REAL_SCORE.emotion, "#F59E0B"],
                  ["Attention", REAL_SCORE.attention, "#14B8A6"],
                  ["Memory", REAL_SCORE.memory, "#8B5CF6"],
                ] as const
              ).map(([label, value, color]) => (
                <div
                  key={label}
                  className="border-t border-cream/15 pt-2"
                >
                  <dt className="mono text-[0.65rem] uppercase tracking-[0.22em] text-cream/60">
                    {label}
                  </dt>
                  <dd
                    className="mono mt-1 text-[1.1rem]"
                    style={{ color }}
                  >
                    {value.toFixed(1)}
                    <span className="ml-2 text-[0.68rem] uppercase tracking-[0.2em] text-cream/45">
                      / 10
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
            <div className="mono mt-6 flex items-baseline gap-3 text-[0.72rem] uppercase tracking-[0.24em] text-cream/60">
              <span>Final neuro score</span>
              <span className="text-viral text-[1.6rem] tracking-tight">
                {REAL_SCORE.overall.toFixed(1)}
              </span>
              <span>/ 10</span>
            </div>
            <div className="mono mt-1 text-[0.62rem] uppercase tracking-[0.22em] text-cream/45">
              Verdict · below average · dropped at 0:25
            </div>
          </div>

          <div className="col-span-12 md:col-span-6">
            <div className="rounded-sm border border-cream/15 bg-ink/40 p-4">
              <video
                src="/proof/brain-scan.mp4"
                autoPlay
                muted
                loop
                playsInline
                className="w-full rounded-sm"
                aria-label="Rendered brain scan video output"
              />
              <div className="mono mt-3 flex items-baseline justify-between text-[0.6rem] uppercase tracking-[0.22em] text-cream/55">
                <span>Remotion render · 9:16</span>
                <span>brain-scan-final.mp4</span>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section tone="paper" className="py-20 md:py-28">
        <div className="grid grid-cols-12 gap-10">
          <div className="col-span-12 md:col-span-5">
            <div className="mono text-[0.72rem] uppercase tracking-[0.28em] text-muted">
              02 · the renders
            </div>
            <h2
              className="serif mt-6 leading-[0.95]"
              style={{ fontSize: "clamp(2rem, calc(1rem + 2.2vw), 3.2rem)" }}
            >
              Every second, a{" "}
              <HighlightChip variant="orange">new cortex</HighlightChip>.
            </h2>
            <p className="mt-6 max-w-[44ch] text-[1.02rem] leading-[1.55] text-ink/80">
              The rotating renders show the four engagement networks
              pulsing across the cortical surface. Orange is where the
              reward network fired hardest. This is the raw data before
              the Gamma engine wraps story around it.
            </p>
          </div>
          <div className="col-span-12 md:col-span-7">
            <div className="grid grid-cols-2 gap-4">
              <figure className="flex flex-col gap-2">
                <div className="overflow-hidden rounded-sm border border-ink/15 bg-cream">
                  <img
                    src="/proof/rotating-reward.gif"
                    alt="Reward network activation, rotating cortex"
                    className="h-auto w-full"
                  />
                </div>
                <figcaption className="mono text-[0.62rem] uppercase tracking-[0.22em] text-muted">
                  Reward · rotating
                </figcaption>
              </figure>
              <figure className="flex flex-col gap-2">
                <div className="overflow-hidden rounded-sm border border-ink/15 bg-cream">
                  <img
                    src="/proof/rotating-max.gif"
                    alt="Max activation across four networks, rotating cortex"
                    className="h-auto w-full"
                  />
                </div>
                <figcaption className="mono text-[0.62rem] uppercase tracking-[0.22em] text-muted">
                  All four · peak bonus
                </figcaption>
              </figure>
            </div>
          </div>
        </div>
      </Section>

      <Section tone="cream" className="py-20 md:py-28 rule-top">
        <div className="grid grid-cols-12 gap-10">
          <div className="col-span-12 md:col-span-7">
            <div className="mono text-[0.72rem] uppercase tracking-[0.28em] text-muted">
              03 · the systems
            </div>
            <h2
              className="serif mt-6 leading-[0.95]"
              style={{ fontSize: "clamp(2rem, calc(1rem + 2.2vw), 3.2rem)" }}
            >
              I wrapped the model in three{" "}
              <HighlightChip variant="orange">systems</HighlightChip>.
            </h2>
            <p className="mt-6 max-w-[52ch] text-[1.02rem] leading-[1.55] text-ink/80">
              Scoring raw activation is the start. The Alpha engine runs
              the brain model. The Beta engine reads the scene, what was
              said, what was seen, what was heard. The Gamma engine
              explains which moment went dark, then rewrites your script
              shot by shot so the next take fires harder.
            </p>
            <ol className="mt-8 flex flex-col gap-4">
              {[
                {
                  k: "Alpha engine",
                  body: "Neural scoring. Runs the foundation model on GPU, returns per-second activation across four networks.",
                },
                {
                  k: "Beta engine",
                  body: "Scene understanding. Reads the video frames, transcript, and audio, returns a timeline with emotion and visual tags.",
                },
                {
                  k: "Gamma engine",
                  body: "Script intelligence. Synthesizes weaknesses, answers in chat, rewrites shot by shot with camera and pacing direction.",
                },
              ].map((row, i) => (
                <li
                  key={row.k}
                  className="flex items-start gap-5 border-b border-ink/15 pb-5"
                >
                  <span className="mono pt-1 text-[0.7rem] uppercase tracking-[0.28em] text-muted">
                    0{i + 1}
                  </span>
                  <div>
                    <h3
                      className="serif leading-[1]"
                      style={{ fontSize: "clamp(1.3rem, calc(1rem + 0.8vw), 1.9rem)" }}
                    >
                      {row.k}
                    </h3>
                    <p className="mt-2 max-w-[52ch] text-[0.98rem] leading-[1.55] text-ink/75">
                      {row.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="col-span-12 md:col-span-5 md:pl-6">
            <div className="sticky top-8">
              <AsciiBrain
                scores={REAL_SCORE}
                cellSize={11}
                showLegend
                label="Live activation · Apr 11 · R1"
              />
            </div>
          </div>
        </div>
      </Section>

      <Section tone="ink" className="py-20 md:py-28">
        <div className="grid grid-cols-12 gap-10">
          <div className="col-span-12 md:col-span-7">
            <div className="mono text-[0.72rem] uppercase tracking-[0.28em] text-cream/60">
              04 · what this actually proves
            </div>
            <h2
              className="serif mt-6 leading-[0.95]"
              style={{ fontSize: "clamp(2rem, calc(1rem + 2.2vw), 3.2rem)" }}
            >
              Virality has{" "}
              <HighlightChip variant="orange">signature</HighlightChip>{" "}
              you can measure.
            </h2>
            <p className="mt-6 max-w-[56ch] text-[1.02rem] leading-[1.6] text-cream/80">
              The same four networks light up for every viral short. Reward
              in the first second, emotion at the 6 to 8 second metronome,
              attention recaptured at every tempo change, memory at the
              loop-back close. The reels that miss any of the four leak
              viewers at the exact moment the network went flat. lucid:v2
              shows you that moment, then rewrites it.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <a
                href="/score"
                className="mono inline-flex items-center gap-3 rounded-full bg-viral px-7 py-4 text-white transition hover:bg-cream hover:text-ink"
              >
                <span className="text-[0.78rem] uppercase tracking-[0.24em]">
                  Score your reel
                </span>
                <span aria-hidden>→</span>
              </a>
              <a
                href="/"
                className="mono inline-flex items-center gap-2 text-[0.72rem] uppercase tracking-[0.24em] text-cream/70 hover:text-viral"
              >
                <span className="underline underline-offset-[6px]">
                  back to the cover
                </span>
              </a>
            </div>
          </div>
          <div className="col-span-12 md:col-span-5">
            <figure className="overflow-hidden rounded-sm border border-cream/15 bg-cream/5 p-6">
              <img
                src="/proof/networks.png"
                alt="Four networks mapped to cortical regions"
                className="h-auto w-full"
              />
              <figcaption className="mono mt-4 text-[0.62rem] uppercase tracking-[0.22em] text-cream/55">
                The atlas · four networks, ten brain regions each
              </figcaption>
            </figure>
          </div>
        </div>
      </Section>
    </main>
  );
}
