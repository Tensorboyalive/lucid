export interface ReelRow {
  id: string;
  thumbnail: string;
  thumbnailKind?: "image" | "gradient";
  postUrl?: string | null;
  caption: string;
  views: string;
  engagement: string;
  hookType: string;
  durationSec: number;
  scoreEstimate: number;
}

export interface ResearchProfile {
  handle: string;
  name: string;
  followers: string;
  avgScore: number;
  reels: ReelRow[];
  patterns: { title: string; body: string }[];
}

export interface ChatTurn {
  role: "user" | "viral-engine";
  content: string;
  anchors?: { reelId: string; reason: string }[];
}

// Handle-agnostic reel placeholders — describe the HOOK TYPE, not a specific
// creator. Used only when the live Apify scrape fails or no token is set.
const PLACEHOLDER_REELS: Omit<ReelRow, "id">[] = [
  {
    thumbnail: "linear-gradient(135deg,#C53030,#6D28D9)",
    thumbnailKind: "gradient",
    caption: "Top-performing reel · stakes-first opener with a specific number",
    views: "—",
    engagement: "—",
    hookType: "stakes reveal",
    durationSec: 28,
    scoreEstimate: 9.1,
  },
  {
    thumbnail: "linear-gradient(135deg,#E85D1C,#C53030)",
    thumbnailKind: "gradient",
    caption: "Contrast pair hook · two opposing extremes in the first 2s",
    views: "—",
    engagement: "—",
    hookType: "contrast pair",
    durationSec: 34,
    scoreEstimate: 9.0,
  },
  {
    thumbnail: "linear-gradient(135deg,#0E7C86,#6D28D9)",
    thumbnailKind: "gradient",
    caption: "Time-pressure format · countdown or deadline inside the frame",
    views: "—",
    engagement: "—",
    hookType: "time pressure",
    durationSec: 41,
    scoreEstimate: 8.7,
  },
  {
    thumbnail: "linear-gradient(135deg,#D97706,#E85D1C)",
    thumbnailKind: "gradient",
    caption: "Absurd-challenge frame · physical impossibility primed early",
    views: "—",
    engagement: "—",
    hookType: "absurd challenge",
    durationSec: 36,
    scoreEstimate: 8.4,
  },
  {
    thumbnail: "linear-gradient(135deg,#6D28D9,#0E7C86)",
    thumbnailKind: "gradient",
    caption: "Warmth × reward · emotional payoff cued by the second beat",
    views: "—",
    engagement: "—",
    hookType: "warmth x reward",
    durationSec: 29,
    scoreEstimate: 8.8,
  },
  {
    thumbnail: "linear-gradient(135deg,#C53030,#D97706)",
    thumbnailKind: "gradient",
    caption: "Nostalgia hook · familiar object recontextualised with stakes",
    views: "—",
    engagement: "—",
    hookType: "nostalgia + stake",
    durationSec: 45,
    scoreEstimate: 8.2,
  },
  {
    thumbnail: "linear-gradient(135deg,#E85D1C,#6D28D9)",
    thumbnailKind: "gradient",
    caption: "Asymmetry matchup · many-vs-one framing, numbers on screen",
    views: "—",
    engagement: "—",
    hookType: "asymmetry",
    durationSec: 38,
    scoreEstimate: 8.6,
  },
  {
    thumbnail: "linear-gradient(135deg,#0E7C86,#D97706)",
    thumbnailKind: "gradient",
    caption: "Superlative promise · most, first, largest claim in the opener",
    views: "—",
    engagement: "—",
    hookType: "superlative",
    durationSec: 52,
    scoreEstimate: 8.1,
  },
];

const PLACEHOLDER_PATTERNS = [
  {
    title: "Hook locks stakes inside two seconds",
    body: "Top performers state a specific number, a superlative, or a physical impossibility in the first two seconds. Reward network fires by 0.6s.",
  },
  {
    title: "Contrast or asymmetry primes attention",
    body: "Openers that pair opposing extremes ($1 vs $1M, 1 vs 1,000) activate the attention network through prediction error.",
  },
  {
    title: "Emotional beat every 6 to 8 seconds",
    body: "Reaction cutaways or exclamations pulse on a tight metronome. The emotion network never stays flat for more than eight seconds in top reels.",
  },
  {
    title: "Memory hooks via oddity",
    body: "Absurd specifics create encoding spikes in parahippocampal regions. Weirdness is the single strongest correlate of week-later recall.",
  },
];

function normalizeHandle(input: string): string {
  const clean = input.trim().replace(/^@/, "") || "creator";
  return clean;
}

export function buildPlaceholderProfile(rawHandle: string): ResearchProfile {
  const handle = normalizeHandle(rawHandle);
  return {
    handle: "@" + handle,
    name: handle,
    followers: "awaiting live scrape",
    avgScore: 8.6,
    reels: PLACEHOLDER_REELS.map((r, i) => ({ ...r, id: `r${i + 1}` })),
    patterns: PLACEHOLDER_PATTERNS,
  };
}

export function buildChatSeed(rawHandle: string, reelCount: number): ChatTurn[] {
  const handle = normalizeHandle(rawHandle);
  return [
    {
      role: "viral-engine",
      content: `I've ingested ${reelCount} of @${handle}'s top reels. Across them, the reward network fires in the first 600ms on almost every opener. What do you want me to unpack first: hook architecture, pacing, or emotional beats?`,
    },
  ];
}

export function mockChatReply(prompt: string, rawHandle = "creator"): ChatTurn {
  const handle = normalizeHandle(rawHandle);
  const p = prompt.toLowerCase();
  if (p.includes("hook")) {
    return {
      role: "viral-engine",
      content: `Hook pattern across @${handle}'s top reels: name the stakes before any context. The brain resolves the reward prediction by 0.6s, which is what spikes retention past the 3s scroll threshold.`,
      anchors: [
        { reelId: "r1", reason: "stakes-first opener, 0.6s reward ignition" },
        { reelId: "r2", reason: "contrast pair, attention prediction error" },
      ],
    };
  }
  if (p.includes("emot")) {
    return {
      role: "viral-engine",
      content: `Emotion beats recur every 6 to 8s on @${handle}'s strongest reels. Insula activation spikes on reaction cutaways, not on narration. Your rewrite should schedule the micro-reaction, not describe it.`,
      anchors: [{ reelId: "r5", reason: "insula spikes aligned to cutaways" }],
    };
  }
  if (p.includes("pace") || p.includes("length") || p.includes("duration")) {
    return {
      role: "viral-engine",
      content: `Reels between 28 and 38s dominate @${handle}'s top performers. After 40s, attention network retention drops around 18 percent. Target 30s for your first rewrite.`,
    };
  }
  if (p.includes("cta") || p.includes("call to action")) {
    return {
      role: "viral-engine",
      content: `The strongest CTAs on @${handle} are implicit, not imperative. A question at 80% of the duration, a beat of silence, then the cut. The viewer writes the CTA in their own head.`,
    };
  }
  return {
    role: "viral-engine",
    content: `I can dig into hooks, pacing, emotional cadence, memory anchors, or CTA patterns from @${handle}'s scraped set. Which do you want to optimize for in your next reel?`,
  };
}

// Back-compat alias. Old code imported MOCK_RESEARCH and MOCK_CHAT_SEED as
// constants. Anything still reaching for them gets a neutral creator.
export const MOCK_RESEARCH = buildPlaceholderProfile("creator");
export const MOCK_CHAT_SEED = buildChatSeed("creator", 8);
