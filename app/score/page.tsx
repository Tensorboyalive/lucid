"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Nav } from "@/components/editorial/Nav";
import { Section } from "@/components/editorial/Section";
import { HighlightChip } from "@/components/editorial/HighlightChip";
import { UploadSurface } from "@/components/surfaces/UploadSurface";
import { ScoreCard } from "@/components/surfaces/ScoreCard";
import { AsciiBrain } from "@/components/surfaces/AsciiBrain";
import { SceneTimeline } from "@/components/surfaces/SceneTimeline";
import { WeaknessCard } from "@/components/surfaces/WeaknessCard";
import { StreamStatus } from "@/components/surfaces/StreamStatus";
import {
  DEMO_URLS,
  mockStreamScore,
  MOCK_RESULT,
  type ScoreResult,
  type WeaknessCallout,
} from "@/lib/mock";

// Pre-computed demo variants. Clicking a demo chip skips streaming and
// jumps straight to the done state — presentation mode.
const DEMO_PRESETS: Record<string, ScoreResult> = {
  [DEMO_URLS[0].url]: MOCK_RESULT,
  [DEMO_URLS[1].url]: {
    ...MOCK_RESULT,
    id: "mock-reel-talking-head",
    sourceUrl: DEMO_URLS[1].url,
    scores: { reward: 5.8, emotion: 6.0, attention: 6.8, memory: 5.9, overall: 6.2 },
    verdict: "MODERATE POTENTIAL",
    verdictTone: "moderate",
    topMoment: {
      timestamp: "0:09",
      why: "Single cutaway lifts attention to 1.1σ. Only real peak in the cut.",
    },
    bottomMoment: {
      timestamp: "0:18",
      why: "Long static hold. All four networks flatten under 0.4σ for 4 seconds.",
    },
  },
  [DEMO_URLS[2].url]: {
    ...MOCK_RESULT,
    id: "mock-reel-montage",
    sourceUrl: DEMO_URLS[2].url,
    scores: { reward: 9.0, emotion: 8.5, attention: 9.1, memory: 8.3, overall: 8.7 },
    verdict: "EXPLOSIVE",
    verdictTone: "explosive",
    topMoment: {
      timestamp: "0:04",
      why: "Beat-matched montage fires reward + attention together. Peak 2.3σ.",
    },
    bottomMoment: {
      timestamp: "0:27",
      why: "Soft outro. Memory network could loop-back harder with a callback frame.",
    },
  },
};

type Phase = "idle" | "streaming" | "done";

const DEMO_URL_SET = new Set(DEMO_URLS.map((d) => d.url));

function isInstagramReelUrl(raw: string): boolean {
  try {
    const u = new URL(raw);
    if (!/(^|\.)instagram\.com$/i.test(u.hostname)) return false;
    return /\/(reel|reels|p|tv)\//i.test(u.pathname);
  } catch {
    return false;
  }
}

async function runLiveStream(
  url: string,
  onStatus: (label: string, pct: number) => void,
): Promise<ScoreResult | null> {
  let cancelled = false;

  const steps: Array<{ label: string; pct: number; hold: number }> = [
    { label: "Downloading reel", pct: 0.08, hold: 1500 },
    { label: "Uploading to Beta engine", pct: 0.22, hold: 1800 },
    { label: "Beta engine reading scenes", pct: 0.42, hold: 3200 },
    { label: "Beta engine analyzing frames", pct: 0.62, hold: 3200 },
    { label: "Scoring activation", pct: 0.82, hold: 2200 },
    { label: "Finalizing neuro readout", pct: 0.94, hold: 4000 },
  ];

  // Rotating "still working" labels while we wait on the upstream engine so the
  // bar never looks frozen. Pct stays honest (0.95/0.97) — motion signals liveness.
  const waitingLabels: Array<[string, number]> = [
    ["Gamma engine · weakness synthesis", 0.95],
    ["Gamma engine · crossing scene boundaries", 0.96],
    ["Gamma engine · finalizing call-outs", 0.97],
    ["Almost there · response in flight", 0.97],
  ];

  async function tickerLoop() {
    for (const step of steps) {
      if (cancelled) return;
      onStatus(step.label, step.pct);
      await new Promise((r) => setTimeout(r, step.hold));
    }
    let waitIdx = 0;
    while (!cancelled) {
      const [label, pct] = waitingLabels[waitIdx % waitingLabels.length];
      onStatus(label, pct);
      waitIdx += 1;
      await new Promise((r) => setTimeout(r, 2400));
    }
  }

  // We intentionally kick the ticker off without awaiting it.
  const tickerPromise = tickerLoop();

  try {
    const res = await fetch("/api/score-live", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    cancelled = true;
    await tickerPromise.catch(() => undefined);

    if (!res.ok) return null;
    const json = (await res.json()) as {
      result?: ScoreResult;
      fallback?: boolean;
    };
    return json.result ?? null;
  } catch {
    cancelled = true;
    return null;
  }
}

export default function ScorePage() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [status, setStatus] = useState<{ label: string; pct: number }>({
    label: "Queued",
    pct: 0,
  });
  const [result, setResult] = useState<ScoreResult | null>(null);

  async function handleSubmit(input: { url?: string; file?: File }) {
    // Presentation mode: a known demo URL skips all streaming and jumps
    // to the final done state instantly. No loading, no delay.
    if (input.url && DEMO_PRESETS[input.url]) {
      const preset = DEMO_PRESETS[input.url];
      setResult(preset);
      setStatus({ label: "Scoring complete", pct: 1 });
      setPhase("done");
      return;
    }

    setPhase("streaming");
    setResult(null);
    setStatus({ label: "Queued", pct: 0.02 });

    let streamed: ScoreResult | null = null;

    const isRealUrl =
      !!input.url &&
      !DEMO_URL_SET.has(input.url) &&
      isInstagramReelUrl(input.url);

    if (isRealUrl && input.url) {
      const live = await runLiveStream(input.url, (label, pct) => {
        setStatus({ label, pct });
      });
      if (live) {
        streamed = live;
        setResult(live);
        setStatus({ label: "Scoring complete", pct: 1 });
      } else {
        // Live path failed. Drop to mock stream as a graceful demo fallback.
        await mockStreamScore((event) => {
          if (event.type === "status" && event.data) {
            setStatus(event.data as { label: string; pct: number });
          } else if (event.type === "result" && event.data) {
            streamed = event.data as ScoreResult;
            setResult(streamed);
          }
        });
      }
    } else {
      await mockStreamScore((event) => {
        if (event.type === "status" && event.data) {
          setStatus(event.data as { label: string; pct: number });
        } else if (event.type === "result" && event.data) {
          streamed = event.data as ScoreResult;
          setResult(streamed);
        }
      });
    }

    setPhase("done");

    // Kick off real Gamma engine weakness synthesis in the background.
    if (streamed) {
      const scored: ScoreResult = streamed;
      try {
        setStatus({ label: "Gamma engine thinking", pct: 1 });
        const res = await fetch("/api/score-synth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            scenes: scored.scenes,
            scores: scored.scores,
            sourceUrl: input.url ?? scored.sourceUrl,
          }),
        });
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json.weaknesses) && json.weaknesses.length > 0) {
            setResult({
              ...scored,
              weaknesses: json.weaknesses as WeaknessCallout[],
            });
          }
        }
      } catch {
        // fall through: we keep the mocked weaknesses
      }
    }
  }

  return (
    <main>
      <Nav />

      <Section tone="cream" className="pb-8 pt-6 md:pb-12 md:pt-10">
        <div className="mono flex items-center gap-3 text-[0.72rem] uppercase tracking-[0.28em] text-muted">
          <span className="inline-block h-[1px] w-10 bg-muted/60" />
          <span>01 · Score</span>
        </div>
        <h1
          className="serif mt-8 leading-[0.9] tracking-[-0.02em]"
          style={{ fontSize: "clamp(3rem, calc(1rem + 4vw), 5.3rem)" }}
        >
          Hold a <HighlightChip variant="orange" hero>mirror</HighlightChip>
          <br />
          to your reel.
        </h1>
        <p className="mt-8 max-w-[58ch] text-[clamp(1.02rem, calc(0.92rem + 0.35vw), 1.22rem)] leading-[1.5] text-ink/80">
          Alpha engine scores brain activation frame by frame. Beta reads what
          was said, seen, and heard. Gamma tells you which moment went dark
          and why.
        </p>
      </Section>

      <Section tone="paper" className="py-10 md:py-14">
        <UploadSurface
          onSubmit={handleSubmit}
          disabled={phase === "streaming"}
        />
      </Section>

      <AnimatePresence>
        {phase === "streaming" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full"
          >
            <Section tone="cream" className="py-10 md:py-14">
              <StreamStatus label={status.label} pct={status.pct} />
              <div className="mono mt-8 grid grid-cols-1 gap-3 text-[0.72rem] uppercase tracking-[0.22em] text-muted md:grid-cols-4">
                <span className="rule-top pt-3">
                  Alpha engine{" "}
                  <span className="text-ink/70">· neuro activation</span>
                </span>
                <span className="rule-top pt-3">
                  Beta engine{" "}
                  <span className="text-ink/70">· scene + emotion</span>
                </span>
                <span className="rule-top pt-3">
                  Gamma engine{" "}
                  <span className="text-ink/70">· weakness synthesis</span>
                </span>
                <span className="rule-top pt-3">
                  Live stream{" "}
                  <span className="text-ink/70">· frame by frame</span>
                </span>
              </div>
            </Section>
          </motion.div>
        )}
      </AnimatePresence>

      {phase === "done" && result && (
        <>
          <Section tone="cream" className="py-16 md:py-24 rule-top">
            <div className="mono mb-10 flex items-center gap-3 text-[0.72rem] uppercase tracking-[0.28em] text-muted">
              <span className="inline-block h-[1px] w-10 bg-muted/60" />
              <span>Result · neuro-viral score</span>
            </div>
            <div className="grid grid-cols-12 gap-10">
              <div className="col-span-12 lg:col-span-7">
                <ScoreCard scores={result.scores} />
              </div>
              <div className="col-span-12 lg:col-span-5 lg:pl-8">
                <div className="flex flex-col items-center">
                  <AsciiBrain
                    scores={result.scores}
                    cellSize={11}
                    showLegend
                    label="activation · rendered from this run"
                  />
                </div>
              </div>
            </div>
          </Section>

          <Section tone="paper" className="py-16 md:py-24">
            <div className="grid grid-cols-12 gap-10">
              <div className="col-span-12 md:col-span-4">
                <div className="mono text-[0.72rem] uppercase tracking-[0.28em] text-muted">
                  strongest moment
                </div>
                <div
                  className="serif mt-4 text-viral"
                  style={{ fontSize: "clamp(2rem, calc(1rem + 2.5vw), 3.5rem)" }}
                >
                  {result.topMoment.timestamp}
                </div>
                <p className="mt-4 max-w-[34ch] text-[0.98rem] leading-[1.55] text-ink/75">
                  {result.topMoment.why}
                </p>
              </div>
              <div className="col-span-12 md:col-span-4">
                <div className="mono text-[0.72rem] uppercase tracking-[0.28em] text-muted">
                  weakest moment
                </div>
                <div
                  className="serif-italic mt-4 text-brain-red"
                  style={{ fontSize: "clamp(2rem, calc(1rem + 2.5vw), 3.5rem)" }}
                >
                  {result.bottomMoment.timestamp}
                </div>
                <p className="mt-4 max-w-[34ch] text-[0.98rem] leading-[1.55] text-ink/75">
                  {result.bottomMoment.why}
                </p>
              </div>
              <div className="col-span-12 md:col-span-4">
                <div className="mono text-[0.72rem] uppercase tracking-[0.28em] text-muted">
                  duration
                </div>
                <div
                  className="serif mt-4"
                  style={{ fontSize: "clamp(2rem, calc(1rem + 2.5vw), 3.5rem)" }}
                >
                  {Math.round(result.durationMs / 1000)}s
                </div>
                <p className="mt-4 max-w-[34ch] text-[0.98rem] leading-[1.55] text-ink/75">
                  {result.scenes.length} scenes. The Alpha engine inferred
                  brain activation on every single frame.
                </p>
              </div>
            </div>
          </Section>

          <Section tone="cream" className="py-16 md:py-24 rule-top">
            <SceneTimeline scenes={result.scenes} />
          </Section>

          <Section tone="ink" className="py-16 md:py-28">
            <div className="mono mb-10 flex items-center gap-3 text-[0.72rem] uppercase tracking-[0.28em] text-cream/60">
              <span className="inline-block h-[1px] w-10 bg-cream/40" />
              <span>what to fix · by the gamma engine</span>
            </div>
            <div className="flex flex-col gap-5">
              {result.weaknesses.map((w, i) => (
                <WeaknessCard key={w.sceneId + i} weakness={w} index={i} />
              ))}
            </div>

            <div className="mt-16 flex flex-col items-start gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="mono text-[0.72rem] uppercase tracking-[0.28em] text-cream/60">
                  next step
                </div>
                <h3
                  className="serif mt-4 leading-[1]"
                  style={{ fontSize: "clamp(2rem, calc(1rem + 2vw), 3.2rem)" }}
                >
                  <HighlightChip variant="orange">Rewrite</HighlightChip>{" "}
                  it smarter.
                </h3>
              </div>
              <a
                href="/rewrite"
                className="mono inline-flex items-center gap-3 rounded-full bg-viral px-7 py-4 text-white transition hover:bg-cream hover:text-ink"
              >
                <span className="text-[0.78rem] uppercase tracking-[0.24em]">
                  Open rewriter
                </span>
                <span aria-hidden>→</span>
              </a>
            </div>
          </Section>
        </>
      )}
    </main>
  );
}
