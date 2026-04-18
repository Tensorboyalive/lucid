"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Nav } from "@/components/editorial/Nav";
import { Section } from "@/components/editorial/Section";
import { HighlightChip } from "@/components/editorial/HighlightChip";
import { StreamStatus } from "@/components/surfaces/StreamStatus";
import { ShotCard } from "@/components/surfaces/ShotCard";
import { ChatDrawer } from "@/components/surfaces/ChatDrawer";
import { type RewriteResult } from "@/lib/mock-rewrite";
import {
  loadResearchContext,
  type ResearchContext,
} from "@/lib/research-context";

const sampleScript = `Most people think virality is luck.
It's not. We just ran 2,400 reels through a brain model.
Here are the five patterns that actually predicted virality.
Pattern one: the hook promises a reward within two seconds.
Use this, and stop guessing. Link in bio.`;

type Phase = "idle" | "initial" | "chat";

interface Turn {
  role: "user" | "gamma";
  content: string;
}

const refineSuggestions = [
  "Make the hook sharper.",
  "Shorten the reveal.",
  "Add more emotion at the end.",
  "Make it funnier.",
  "Swap shot 3 for a contrast pair.",
];

export default function RewritePage() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [script, setScript] = useState(sampleScript);
  const [reference, setReference] = useState("research a creator first · context will attach here");
  const [status, setStatus] = useState<{ label: string; pct: number }>({
    label: "Queued",
    pct: 0,
  });
  const [turns, setTurns] = useState<Turn[]>([]);
  const [plan, setPlan] = useState<RewriteResult | null>(null);
  const [refineInput, setRefineInput] = useState("");
  const [refining, setRefining] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [research, setResearch] = useState<ResearchContext | null>(null);

  useEffect(() => {
    const ctx = loadResearchContext();
    if (ctx) {
      setResearch(ctx);
      setReference(`${ctx.profile.handle} · research context attached`);
    }
  }, []);

  async function handleInitial() {
    if (!script.trim()) return;
    setPhase("initial");
    setPlan(null);
    setTurns([]);
    setStatus({ label: "Queued", pct: 0.02 });

    const ticker = tickStatus(setStatus, [
      ["Parsing your draft", 0.12, 400],
      ["Anchoring to fMRI patterns", 0.28, 600],
      ["Gamma engine · pacing + shot design", 0.55, 700],
      ["Gamma engine · stream incoming", 0.78, 900],
      ["Assembling shot cards", 0.92, 700],
    ]);

    try {
      const res = await fetch("/api/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          script,
          reference,
          researchContext: research ?? undefined,
        }),
      });
      ticker.cancel();
      const json = await res.json();
      if (json.result) {
        setPlan(json.result as RewriteResult);
        setTurns([
          {
            role: "user",
            content: `Rewrite this script. Reference: ${reference || "none"}.`,
          },
          {
            role: "gamma",
            content:
              json.narration ||
              `Here is the first pass. Predicted score ${json.result.predictedScore} (${json.result.predictedLift >= 0 ? "+" : ""}${json.result.predictedLift} vs original). Tell me what to sharpen.`,
          },
        ]);
      }
      setPhase("chat");
      setDrawerOpen(true);
    } catch {
      ticker.cancel();
      setPhase("chat");
    }
  }

  async function handleRefine(msg: string) {
    if (!msg.trim() || refining || !plan) return;
    const userTurn: Turn = { role: "user", content: msg };
    setTurns((t) => [...t, userTurn]);
    setRefineInput("");
    setRefining(true);

    try {
      const history = turns.map((t) => ({
        role: t.role === "user" ? ("user" as const) : ("assistant" as const),
        content: t.content,
      }));

      const res = await fetch("/api/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          script,
          reference,
          history,
          message: msg,
          previousPlan: plan,
          researchContext: research ?? undefined,
        }),
      });
      const json = await res.json();
      if (json.result) {
        setPlan(json.result as RewriteResult);
        setTurns((t) => [
          ...t,
          {
            role: "gamma",
            content: json.narration || "Updated the plan. Check the shot cards.",
          },
        ]);
      }
    } catch {
      setTurns((t) => [
        ...t,
        {
          role: "gamma",
          content:
            "Couldn't reach the Gamma engine. Check the key and try again.",
        },
      ]);
    } finally {
      setRefining(false);
    }
  }

  function tickStatus(
    set: (s: { label: string; pct: number }) => void,
    steps: [string, number, number][],
  ) {
    let i = 0;
    let active = true;
    const next = () => {
      if (!active || i >= steps.length) return;
      const [label, pct, ms] = steps[i++];
      set({ label, pct });
      setTimeout(next, ms);
    };
    setTimeout(next, 100);
    return {
      cancel() {
        active = false;
      },
    };
  }

  return (
    <main className="relative">
      <Nav />

      <Section tone="cream" className="pb-16 pt-6 md:pb-24 md:pt-12">
        <div className="mono flex items-center gap-3 text-[0.72rem] uppercase tracking-[0.28em] text-muted">
          <span className="inline-block h-[1px] w-10 bg-muted/60" />
          <span>03 · Rewrite</span>
        </div>
        <h1
          className="serif mt-8 leading-[0.9] tracking-[-0.02em]"
          style={{ fontSize: "clamp(3rem, calc(1rem + 4vw), 5.3rem)" }}
        >
          Rewrite it like a{" "}
          <HighlightChip variant="orange">brain</HighlightChip>
          <br />
          wants to watch it.
        </h1>
        <p className="mt-10 max-w-[60ch] text-[clamp(1.05rem, calc(0.95rem + 0.4vw), 1.28rem)] leading-[1.55] text-ink/80">
          Paste a script. The Gamma engine returns a shot-by-shot plan
          anchored to the four brain networks. Then keep talking to it in
          the side chat. Sharpen the hook, shorten the reveal, swap the
          close. One conversation until it is exactly right.
        </p>
        {research && (
          <div className="mono mt-10 inline-flex items-center gap-3 rounded-full border border-viral/40 bg-viral/5 px-4 py-2 text-[0.68rem] uppercase tracking-[0.24em] text-viral">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-viral" />
            <span>
              Research from {research.profile.handle} attached ·{" "}
              {research.profile.patterns.length} patterns ·{" "}
              {research.profile.topReelCaptions.length} reels
            </span>
          </div>
        )}
      </Section>

      {phase === "idle" && (
        <Section tone="paper" className="py-14">
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 md:col-span-7">
              <label className="mono text-[0.72rem] uppercase tracking-[0.26em] text-muted">
                your draft script
              </label>
              <textarea
                value={script}
                onChange={(e) => setScript(e.target.value)}
                rows={10}
                className="serif-italic mt-3 w-full resize-none rounded-sm border border-ink/20 bg-cream p-5 text-[clamp(1rem, calc(0.95rem + 0.4vw), 1.2rem)] leading-[1.5] outline-none focus:border-viral"
              />
            </div>
            <div className="col-span-12 md:col-span-5">
              <label className="mono text-[0.72rem] uppercase tracking-[0.26em] text-muted">
                reference reel (optional)
              </label>
              <input
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="serif-italic mt-3 w-full border-b border-ink/30 bg-transparent pb-2 text-[clamp(1rem, calc(0.95rem + 0.4vw), 1.2rem)] outline-none focus:border-viral"
              />
              <p className="mt-3 text-[0.88rem] leading-[1.5] text-ink/65">
                Handle or URL. The Gamma engine pulls patterns to target
                in the first pass.
              </p>
              <button
                onClick={handleInitial}
                disabled={!script.trim()}
                className="mono mt-8 inline-flex w-full items-center justify-center gap-3 rounded-full bg-ink px-6 py-4 text-cream transition hover:bg-viral disabled:opacity-40"
              >
                <span className="text-[0.78rem] uppercase tracking-[0.24em]">
                  Start the rewrite chat
                </span>
                <span aria-hidden>→</span>
              </button>
            </div>
          </div>
        </Section>
      )}

      <AnimatePresence>
        {phase === "initial" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Section tone="cream" className="py-14">
              <StreamStatus label={status.label} pct={status.pct} />
            </Section>
          </motion.div>
        )}
      </AnimatePresence>

      {phase === "chat" && plan && (
        <>
          <Section tone="cream" className="py-10 md:py-14 rule-top">
            <div className="grid grid-cols-12 gap-8">
              <div className="col-span-12 md:col-span-4">
                <div className="mono text-[0.72rem] uppercase tracking-[0.26em] text-muted">
                  predicted score
                </div>
                <motion.div
                  key={plan.predictedScore}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="serif mt-3 text-viral"
                  style={{ fontSize: "clamp(3rem, calc(1rem + 4vw), 5.5rem)" }}
                >
                  {plan.predictedScore.toFixed(1)}
                </motion.div>
                <div className="mono mt-1 text-[0.8rem] uppercase tracking-[0.22em] text-brain-cyan">
                  {plan.predictedLift >= 0 ? "+" : ""}
                  {plan.predictedLift.toFixed(1)} vs original
                </div>
              </div>
              <div className="col-span-12 md:col-span-4">
                <div className="mono text-[0.72rem] uppercase tracking-[0.26em] text-muted">
                  target duration
                </div>
                <motion.div
                  key={plan.targetDurationSec}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="serif mt-3"
                  style={{ fontSize: "clamp(3rem, calc(1rem + 4vw), 5.5rem)" }}
                >
                  {plan.targetDurationSec}s
                </motion.div>
              </div>
              <div className="col-span-12 md:col-span-4">
                <div className="mono text-[0.72rem] uppercase tracking-[0.26em] text-muted">
                  shot count
                </div>
                <motion.div
                  key={plan.shots.length}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="serif mt-3"
                  style={{ fontSize: "clamp(3rem, calc(1rem + 4vw), 5.5rem)" }}
                >
                  {plan.shots.length}
                </motion.div>
              </div>
            </div>
            <motion.p
              key={plan.summary}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-10 max-w-[72ch] text-[1.02rem] leading-[1.6] text-ink/80"
            >
              {plan.summary}
            </motion.p>
          </Section>

          <Section tone="paper" className="py-12 md:py-16">
            <div className="mono mb-8 flex items-baseline justify-between text-[0.72rem] uppercase tracking-[0.28em] text-muted">
              <span>shot-by-shot plan</span>
              <span className="text-viral">{plan.shots.length} shots</span>
            </div>
            <div className="flex flex-col gap-5">
              <AnimatePresence mode="popLayout">
                {plan.shots.map((shot, i) => (
                  <ShotCard
                    key={`${shot.rewrite}-${i}`}
                    shot={shot}
                    index={i}
                  />
                ))}
              </AnimatePresence>
            </div>
          </Section>

          <Section tone="ink" className="py-16">
            <div className="flex flex-col items-start gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="mono text-[0.72rem] uppercase tracking-[0.28em] text-cream/60">
                  loop back
                </div>
                <h3
                  className="serif mt-4 leading-[1]"
                  style={{ fontSize: "clamp(2rem, calc(1rem + 2vw), 3.2rem)" }}
                >
                  Shoot it.{" "}
                  <HighlightChip variant="orange">Then</HighlightChip>{" "}
                  <span className="serif-italic">score it again.</span>
                </h3>
              </div>
              <a
                href="/score"
                className="mono inline-flex items-center gap-3 rounded-full bg-viral px-7 py-4 text-white transition hover:bg-cream hover:text-ink"
              >
                <span className="text-[0.78rem] uppercase tracking-[0.24em]">
                  Back to score
                </span>
                <span aria-hidden>→</span>
              </a>
            </div>
          </Section>

          {!drawerOpen && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              onClick={() => setDrawerOpen(true)}
              className="mono fixed bottom-6 right-6 z-30 inline-flex items-center gap-3 rounded-full bg-ink px-5 py-3 text-cream shadow-[0_10px_30px_rgba(0,0,0,0.3)] transition hover:bg-viral"
              aria-label="Open chat with Gamma"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-viral opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-viral" />
              </span>
              <span className="text-[0.72rem] uppercase tracking-[0.24em]">
                Chat with Gamma
              </span>
            </motion.button>
          )}

          <ChatDrawer
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            turns={turns}
            refining={refining}
            input={refineInput}
            onInput={setRefineInput}
            onSend={handleRefine}
            suggestions={refineSuggestions}
          />
        </>
      )}
    </main>
  );
}
