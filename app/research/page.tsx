"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Nav } from "@/components/editorial/Nav";
import { Section } from "@/components/editorial/Section";
import { HighlightChip } from "@/components/editorial/HighlightChip";
import { ReelGrid } from "@/components/surfaces/ReelGrid";
import { ChatPanel } from "@/components/surfaces/ChatPanel";
import { StreamStatus } from "@/components/surfaces/StreamStatus";
import {
  buildPlaceholderProfile,
  buildChatSeed,
  mockChatReply,
  type ResearchProfile,
  type ChatTurn,
} from "@/lib/mock-research";
import { saveResearchContext } from "@/lib/research-context";

type Phase = "idle" | "streaming" | "done";

const suggestedHandles = ["@mrbeast", "@zachking", "@brittany.broski", "@tensorboy"];

export default function ResearchPage() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [handle, setHandle] = useState("");
  const [status, setStatus] = useState({ label: "Queued", pct: 0 });
  const [profile, setProfile] = useState<ResearchProfile | null>(null);

  async function handleSubmit(h: string) {
    if (!h.trim()) return;
    setPhase("streaming");
    setProfile(null);
    setHandle(h);

    const steps: [string, number, number][] = [
      ["Scraping creator · feed ingest", 0.1, 500],
      ["Pulling top reels", 0.28, 700],
      ["Local download queue", 0.45, 700],
      ["Transcribing every frame", 0.62, 700],
      ["Beta engine · scene + emotion tags", 0.78, 600],
      ["Gamma engine · pattern synthesis", 0.92, 600],
    ];

    const tick = (async () => {
      for (const [label, pct, ms] of steps) {
        setStatus({ label, pct });
        await new Promise((r) => setTimeout(r, ms));
      }
    })();

    let resolved: ResearchProfile | null = null;
    try {
      const res = await fetch("/api/scrape-creator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle: h }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.profile) resolved = json.profile as ResearchProfile;
      }
    } catch {
      // falls through to mock
    }

    await tick;

    setStatus({ label: "Opening chat · anchored to research", pct: 1 });
    const finalProfile = resolved ?? buildPlaceholderProfile(h);
    setProfile(finalProfile);
    saveResearchContext(finalProfile);
    setPhase("done");
  }

  async function handleChat(prompt: string): Promise<ChatTurn> {
    await new Promise((r) => setTimeout(r, 800));
    const h = profile?.handle ?? handle;
    return mockChatReply(prompt, h);
  }

  return (
    <main>
      <Nav />

      <Section tone="cream" className="pb-16 pt-6 md:pb-24 md:pt-12">
        <div className="mono flex items-center gap-3 text-[0.72rem] uppercase tracking-[0.28em] text-muted">
          <span className="inline-block h-[1px] w-10 bg-muted/60" />
          <span>02 · Research</span>
        </div>
        <h1
          className="serif mt-8 leading-[0.9] tracking-[-0.02em]"
          style={{ fontSize: "clamp(3rem, calc(1rem + 4vw), 5.3rem)" }}
        >
          Reverse-engineer{" "}
          <HighlightChip variant="orange">virality</HighlightChip>
          <br />
          straight from a creator.
        </h1>
        <p className="mt-10 max-w-[60ch] text-[clamp(1.05rem, calc(0.95rem + 0.4vw), 1.28rem)] leading-[1.55] text-ink/80">
          Paste a handle. We pull the top 20 reels, download and transcribe
          locally, then feed every frame and word to the Beta and Gamma
          engines. You get a pattern breakdown plus a chat window into the
          viral engine, anchored to real transcripts.
        </p>
      </Section>

      <Section tone="paper" className="py-12">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(handle);
          }}
          className="flex flex-col gap-4 md:flex-row md:items-end"
        >
          <div className="flex-1">
            <label className="mono block text-[0.72rem] uppercase tracking-[0.26em] text-muted">
              Creator handle
            </label>
            <input
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="@mrbeast"
              className="serif-italic mt-3 w-full border-b border-ink/30 bg-transparent pb-2 text-[clamp(1.3rem, calc(1rem + 0.8vw), 1.8rem)] outline-none placeholder:text-ink/30 focus:border-viral"
            />
          </div>
          <button
            type="submit"
            disabled={phase === "streaming"}
            className="mono inline-flex items-center gap-3 rounded-full bg-ink px-6 py-3.5 text-cream transition hover:bg-viral disabled:opacity-40"
          >
            <span className="text-[0.78rem] uppercase tracking-[0.24em]">
              Research creator
            </span>
            <span aria-hidden>→</span>
          </button>
        </form>
        <div className="mono mt-4 flex flex-wrap items-center gap-2 text-[0.68rem] uppercase tracking-[0.26em] text-muted">
          <span>try</span>
          {suggestedHandles.map((h) => (
            <button
              key={h}
              onClick={() => {
                setHandle(h);
                handleSubmit(h);
              }}
              className="rounded-full border border-ink/20 px-2.5 py-1 tracking-[0.22em] transition hover:border-viral hover:text-viral"
            >
              {h}
            </button>
          ))}
        </div>
      </Section>

      <AnimatePresence>
        {phase === "streaming" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Section tone="cream" className="py-12">
              <StreamStatus label={status.label} pct={status.pct} />
              <div className="mono mt-10 grid grid-cols-2 gap-4 text-[0.7rem] uppercase tracking-[0.22em] text-muted md:grid-cols-4">
                <div className="rule-top pt-3">Scraper · feed</div>
                <div className="rule-top pt-3">Downloader · local</div>
                <div className="rule-top pt-3">Beta engine · scenes</div>
                <div className="rule-top pt-3">Gamma engine · patterns</div>
              </div>
            </Section>
          </motion.div>
        )}
      </AnimatePresence>

      {phase === "done" && profile && (
        <>
          <Section tone="cream" className="py-16 md:py-20 rule-top">
            <div className="grid grid-cols-12 gap-8">
              <div className="col-span-12 md:col-span-5">
                <div className="mono text-[0.7rem] uppercase tracking-[0.26em] text-muted">
                  research subject
                </div>
                <div
                  className="serif mt-4 leading-[0.95]"
                  style={{ fontSize: "clamp(2.2rem, calc(1rem + 2.6vw), 3.6rem)" }}
                >
                  {profile.handle}
                </div>
                <div className="mono mt-2 text-[0.8rem] uppercase tracking-[0.22em] text-ink/70">
                  {profile.name}
                </div>
              </div>
              <div className="col-span-6 md:col-span-3">
                <div className="mono text-[0.7rem] uppercase tracking-[0.26em] text-muted">
                  audience
                </div>
                <div
                  className="serif mt-4 text-ink"
                  style={{ fontSize: "clamp(2.4rem, calc(1rem + 2.6vw), 3.6rem)" }}
                >
                  {profile.followers}
                </div>
              </div>
              <div className="col-span-6 md:col-span-4">
                <div className="mono text-[0.7rem] uppercase tracking-[0.26em] text-muted">
                  avg neuro score · top 20
                </div>
                <div
                  className="serif mt-4 text-viral"
                  style={{ fontSize: "clamp(2.4rem, calc(1rem + 2.6vw), 3.6rem)" }}
                >
                  {profile.avgScore.toFixed(1)}
                </div>
              </div>
            </div>
          </Section>

          <Section tone="paper" className="py-14">
            <div className="mono mb-6 flex items-baseline justify-between text-[0.72rem] uppercase tracking-[0.28em] text-muted">
              <span>top reels · ingested</span>
              <span>{profile.reels.length} of 20 shown</span>
            </div>
            <ReelGrid reels={profile.reels} />
          </Section>

          <Section tone="cream" className="py-16 rule-top">
            <div className="grid grid-cols-12 gap-10">
              <div className="col-span-12 lg:col-span-5">
                <div className="mono text-[0.72rem] uppercase tracking-[0.26em] text-muted">
                  patterns · by the gamma engine
                </div>
                <h2
                  className="serif mt-4 leading-[0.95]"
                  style={{ fontSize: "clamp(2rem, calc(1rem + 2vw), 3rem)" }}
                >
                  What <HighlightChip variant="orange">actually</HighlightChip>{" "}
                  made these reels land.
                </h2>
                <div className="mt-8 flex flex-col gap-5">
                  {profile.patterns.map((p, i) => (
                    <motion.article
                      key={p.title}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.06 }}
                      className="border-t border-ink/15 pt-4"
                    >
                      <div className="mono text-[0.7rem] uppercase tracking-[0.22em] text-viral">
                        pattern 0{i + 1}
                      </div>
                      <h3
                        className="serif mt-2 leading-[1.15]"
                        style={{ fontSize: "clamp(1.1rem, calc(1rem + 0.5vw), 1.45rem)" }}
                      >
                        {p.title}
                      </h3>
                      <p className="mt-2 text-[0.96rem] leading-[1.55] text-ink/75">
                        {p.body}
                      </p>
                    </motion.article>
                  ))}
                </div>
              </div>
              <div className="col-span-12 lg:col-span-7">
                <ChatPanel
                  initial={buildChatSeed(profile.handle, profile.reels.length)}
                  onSend={handleChat}
                  researchHandle={profile.handle}
                  researchReels={profile.reels.slice(0, 10).map((r) => ({
                    id: r.id,
                    caption: r.caption,
                    views: r.views,
                    hookType: r.hookType,
                    scoreEstimate: r.scoreEstimate,
                  }))}
                  researchPatterns={profile.patterns}
                  live
                />
              </div>
            </div>
          </Section>

          <Section tone="ink" className="py-16">
            <div className="flex flex-col items-start gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="mono text-[0.72rem] uppercase tracking-[0.28em] text-cream/60">
                  next step
                </div>
                <h3
                  className="serif mt-4 leading-[1]"
                  style={{ fontSize: "clamp(2rem, calc(1rem + 2vw), 3.2rem)" }}
                >
                  Now{" "}
                  <HighlightChip variant="orange">rewrite</HighlightChip>{" "}
                  <span className="serif-italic">your script</span>.
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
