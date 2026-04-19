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

// Presentation-mode presets. Clicking a suggested handle chip jumps
// straight to the done state with a curated profile. The typed-handle
// form still hits the live Apify pipeline.
function gradient(i: number): string {
  const pairs = [
    ["#C53030", "#6D28D9"], ["#E85D1C", "#C53030"], ["#0E7C86", "#6D28D9"],
    ["#D97706", "#E85D1C"], ["#6D28D9", "#0E7C86"], ["#C53030", "#D97706"],
    ["#E85D1C", "#6D28D9"], ["#0E7C86", "#D97706"],
  ];
  const p = pairs[i % pairs.length];
  return `linear-gradient(135deg,${p[0]},${p[1]})`;
}

const PRESET_PROFILES: Record<string, ResearchProfile> = {
  "@mrbeast": {
    handle: "@mrbeast",
    name: "Jimmy Donaldson",
    followers: "74.8M",
    avgScore: 9.1,
    reels: [
      { id: "r1", thumbnail: gradient(0), thumbnailKind: "gradient", caption: "I gave away a private island to a random stranger.", views: "128M", engagement: "9.4", hookType: "stakes reveal", durationSec: 28, scoreEstimate: 9.4 },
      { id: "r2", thumbnail: gradient(1), thumbnailKind: "gradient", caption: "$1 vs $1,000,000 hotel. The difference will shock you.", views: "94M", engagement: "9.3", hookType: "contrast pair", durationSec: 34, scoreEstimate: 9.3 },
      { id: "r3", thumbnail: gradient(2), thumbnailKind: "gradient", caption: "50 hours trapped in a cube underwater.", views: "61M", engagement: "8.8", hookType: "time pressure", durationSec: 41, scoreEstimate: 8.8 },
      { id: "r4", thumbnail: gradient(3), thumbnailKind: "gradient", caption: "Last to leave a giving-birth sim wins $500,000.", views: "38M", engagement: "8.5", hookType: "absurd challenge", durationSec: 36, scoreEstimate: 8.5 },
      { id: "r5", thumbnail: gradient(4), thumbnailKind: "gradient", caption: "Surprise strangers with $10,000 for a compliment.", views: "55M", engagement: "8.9", hookType: "warmth x reward", durationSec: 29, scoreEstimate: 8.9 },
      { id: "r6", thumbnail: gradient(5), thumbnailKind: "gradient", caption: "I bought the last Blockbuster on Earth.", views: "33M", engagement: "8.3", hookType: "nostalgia + stake", durationSec: 45, scoreEstimate: 8.3 },
      { id: "r7", thumbnail: gradient(6), thumbnailKind: "gradient", caption: "1,000 people vs 1 Navy SEAL for $250,000.", views: "49M", engagement: "8.7", hookType: "asymmetry", durationSec: 38, scoreEstimate: 8.7 },
      { id: "r8", thumbnail: gradient(7), thumbnailKind: "gradient", caption: "I built the world's most dangerous obstacle course.", views: "27M", engagement: "9.0", hookType: "superlative", durationSec: 52, scoreEstimate: 9.0 },
    ],
    patterns: [
      { title: "Every hook locks stakes inside two seconds", body: "All 8 openers state a dollar amount, a superlative, or a physical impossibility. Reward network fires by 0.6s." },
      { title: "Contrast or asymmetry primes attention", body: "6 of 8 openers use contrast pairs or asymmetric matchups. Attention network peaks through prediction error." },
      { title: "Emotional beat every 6 to 8 seconds", body: "Reaction cutaways pulse on a tight metronome. Emotion network never stays flat for more than 8s." },
      { title: "Memory hooks via oddity", body: "Absurd specifics (private island, 50 hours, obstacle course) create encoding spikes in parahippocampal regions." },
    ],
  },
  "@zachking": {
    handle: "@zachking",
    name: "Zach King",
    followers: "31.2M",
    avgScore: 9.3,
    reels: [
      { id: "r1", thumbnail: gradient(0), thumbnailKind: "gradient", caption: "they caught Banksy", views: "125.5M", engagement: "9.6", hookType: "reveal", durationSec: 18, scoreEstimate: 9.6 },
      { id: "r2", thumbnail: gradient(1), thumbnailKind: "gradient", caption: "Virtual Holiday illusion. Camera impossible.", views: "3.8M", engagement: "9.0", hookType: "visual misdirect", durationSec: 14, scoreEstimate: 9.0 },
      { id: "r3", thumbnail: gradient(2), thumbnailKind: "gradient", caption: "Late again... at least I have an iced coffee @nespresso", views: "1.6M", engagement: "8.4", hookType: "product misdirect", durationSec: 22, scoreEstimate: 8.4 },
      { id: "r4", thumbnail: gradient(3), thumbnailKind: "gradient", caption: "Jump trend but make it physically impossible.", views: "2.1M", engagement: "9.1", hookType: "trend twist", durationSec: 11, scoreEstimate: 9.1 },
      { id: "r5", thumbnail: gradient(4), thumbnailKind: "gradient", caption: "Perfecting the impossible parkour handoff.", views: "4.7M", engagement: "9.2", hookType: "skill reveal", durationSec: 17, scoreEstimate: 9.2 },
      { id: "r6", thumbnail: gradient(5), thumbnailKind: "gradient", caption: "Pulling the phone out of the phone.", views: "8.9M", engagement: "9.5", hookType: "recursive frame", durationSec: 13, scoreEstimate: 9.5 },
      { id: "r7", thumbnail: gradient(6), thumbnailKind: "gradient", caption: "The cat actually caught it. Slow-mo proof.", views: "3.2M", engagement: "8.8", hookType: "authenticity beat", durationSec: 15, scoreEstimate: 8.8 },
      { id: "r8", thumbnail: gradient(7), thumbnailKind: "gradient", caption: "I am the painting now.", views: "6.4M", engagement: "9.4", hookType: "frame break", durationSec: 12, scoreEstimate: 9.4 },
    ],
    patterns: [
      { title: "The frame always breaks by 0.8s", body: "Every opener establishes a familiar frame, then breaks it with a physical impossibility before the second beat. Attention network peaks at 2.1σ." },
      { title: "No narration, all diegetic sound", body: "Zero voiceovers across all 8 reels. Music and ambient sfx only. Frees the attention network from parsing language, doubles visual throughput." },
      { title: "One beat, one reveal", body: "Reels are 11 to 22 seconds. Every second carries a setup or a payoff. No filler frames. Reward network pulses at the reveal moment." },
      { title: "Loop-back baked in", body: "Most reels end on a frame nearly identical to the opener, inviting a re-watch. Memory network fires at the loop close." },
    ],
  },
  "@brittany.broski": {
    handle: "@brittany.broski",
    name: "Brittany Broski",
    followers: "8.4M",
    avgScore: 8.5,
    reels: [
      { id: "r1", thumbnail: gradient(3), thumbnailKind: "gradient", caption: "POV: you're my therapist and I just told you I named my plant.", views: "12.1M", engagement: "8.9", hookType: "confessional POV", durationSec: 24, scoreEstimate: 8.9 },
      { id: "r2", thumbnail: gradient(4), thumbnailKind: "gradient", caption: "Reviewing the airport snacks I eat while crying.", views: "8.4M", engagement: "8.7", hookType: "self-deprecation", durationSec: 29, scoreEstimate: 8.7 },
      { id: "r3", thumbnail: gradient(1), thumbnailKind: "gradient", caption: "Explaining my taste in men to a panel of confused owls.", views: "15.2M", engagement: "9.1", hookType: "absurdist premise", durationSec: 31, scoreEstimate: 9.1 },
      { id: "r4", thumbnail: gradient(5), thumbnailKind: "gradient", caption: "When the group chat asks who's driving.", views: "6.8M", engagement: "8.3", hookType: "relatable moment", durationSec: 18, scoreEstimate: 8.3 },
      { id: "r5", thumbnail: gradient(2), thumbnailKind: "gradient", caption: "Ranking every emotion I've had in a grocery store.", views: "4.2M", engagement: "8.1", hookType: "list format", durationSec: 36, scoreEstimate: 8.1 },
      { id: "r6", thumbnail: gradient(6), thumbnailKind: "gradient", caption: "My chiropractor asked how I sleep. We cried.", views: "9.7M", engagement: "8.8", hookType: "emotional beat", durationSec: 22, scoreEstimate: 8.8 },
    ],
    patterns: [
      { title: "First-person confessional opener", body: "Every reel starts with 'POV' or direct camera address. Parasocial emotional network fires instantly. Insula peaks within 1s." },
      { title: "Absurd premise, earnest delivery", body: "Setup is surreal. Delivery is sincere. This tension activates both attention and memory. The bit sticks because it shouldn't make sense but does." },
      { title: "Timing beats visuals", body: "Minimal editing, single-take feel. Pacing is carried entirely by vocal inflection and comedic pause. Under 35s every time." },
      { title: "Self as punchline", body: "Brittany is always the subject being observed. Ironic distance layers attention on top of emotion. Highest retention cohort: women 18-34." },
    ],
  },
  "@tensorboy": {
    handle: "@tensorboy",
    name: "Manav Gupta · tensorboy",
    followers: "260K",
    avgScore: 8.2,
    reels: [
      { id: "r1", thumbnail: gradient(0), thumbnailKind: "gradient", caption: "I ran my own reels through a fMRI-trained brain model. Here's what I learned.", views: "4.1M", engagement: "9.0", hookType: "stakes reveal", durationSec: 32, scoreEstimate: 9.0 },
      { id: "r2", thumbnail: gradient(1), thumbnailKind: "gradient", caption: "The AI that's watching your thumb scroll before you do.", views: "2.3M", engagement: "8.6", hookType: "inevitability hook", durationSec: 28, scoreEstimate: 8.6 },
      { id: "r3", thumbnail: gradient(2), thumbnailKind: "gradient", caption: "Built a tool that scores your reel's neuro-viral potential.", views: "1.8M", engagement: "8.4", hookType: "build-in-public", durationSec: 35, scoreEstimate: 8.4 },
      { id: "r4", thumbnail: gradient(3), thumbnailKind: "gradient", caption: "Meta just open-sourced a brain. I ran it on a GPU.", views: "3.4M", engagement: "8.9", hookType: "news + action", durationSec: 29, scoreEstimate: 8.9 },
      { id: "r5", thumbnail: gradient(4), thumbnailKind: "gradient", caption: "Five patterns that predicted every viral short in my dataset.", views: "2.9M", engagement: "8.5", hookType: "list promise", durationSec: 38, scoreEstimate: 8.5 },
      { id: "r6", thumbnail: gradient(5), thumbnailKind: "gradient", caption: "Why your scroll-stopper is a neuroscience problem, not a luck problem.", views: "1.6M", engagement: "8.1", hookType: "reframe", durationSec: 33, scoreEstimate: 8.1 },
    ],
    patterns: [
      { title: "Technical specificity as the hook", body: "Numbers and named systems ('fMRI-trained', 'GPU', 'five patterns') signal depth in the first 2s. Reward network responds to concrete specificity, not generic claims." },
      { title: "Build-in-public credibility layer", body: "Showing the tool being built (code, renders, cortex maps) borrows authority from what is visible. Memory encoding is higher on reels that showed process vs only results." },
      { title: "News as pacing trigger", body: "'Meta just open-sourced' style openers ride attention network urgency. Engagement drops 23% if the news hook lands after the 3s mark." },
      { title: "Under 40s is the sweet spot", body: "Reels that cross 40s leak 18% retention on the attention network. Tensorboy's best performers all land between 28-35s." },
    ],
  },
};

export default function ResearchPage() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [handle, setHandle] = useState("");
  const [status, setStatus] = useState({ label: "Queued", pct: 0 });
  const [profile, setProfile] = useState<ResearchProfile | null>(null);

  function handleInstantPreset(h: string) {
    const preset = PRESET_PROFILES[h.toLowerCase()] ?? PRESET_PROFILES[h];
    if (!preset) return false;
    setHandle(h);
    setProfile(preset);
    saveResearchContext(preset);
    setStatus({ label: "Research loaded · preset", pct: 1 });
    setPhase("done");
    return true;
  }

  async function handleSubmit(h: string) {
    if (!h.trim()) return;
    // Presentation mode: if the handle matches a curated preset, skip
    // streaming and Apify entirely.
    if (handleInstantPreset(h)) return;
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
          <HighlightChip variant="orange" hero>virality</HighlightChip>
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
            <label
              htmlFor="creator-handle"
              className="mono block text-[0.72rem] uppercase tracking-[0.26em] text-muted"
            >
              Creator handle
            </label>
            <input
              id="creator-handle"
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
              Break it down
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
