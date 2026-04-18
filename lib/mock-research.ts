export interface ReelRow {
  id: string;
  thumbnail: string;
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

export const MOCK_RESEARCH: ResearchProfile = {
  handle: "@mrbeast",
  name: "Jimmy Donaldson",
  followers: "74.8M",
  avgScore: 8.6,
  reels: [
    {
      id: "r1",
      thumbnail: "linear-gradient(135deg,#C53030,#6D28D9)",
      caption: "I gave away a private island to a random stranger.",
      views: "42M",
      engagement: "9.1",
      hookType: "stake reveal",
      durationSec: 28,
      scoreEstimate: 9.1,
    },
    {
      id: "r2",
      thumbnail: "linear-gradient(135deg,#E85D1C,#C53030)",
      caption: "$1 vs $1,000,000 hotel. The difference will shock you.",
      views: "128M",
      engagement: "9.3",
      hookType: "contrast pair",
      durationSec: 34,
      scoreEstimate: 9.3,
    },
    {
      id: "r3",
      thumbnail: "linear-gradient(135deg,#0E7C86,#6D28D9)",
      caption: "I spent 50 hours trapped in a cube underwater.",
      views: "61M",
      engagement: "8.8",
      hookType: "time-pressure",
      durationSec: 41,
      scoreEstimate: 8.8,
    },
    {
      id: "r4",
      thumbnail: "linear-gradient(135deg,#D97706,#E85D1C)",
      caption: "Last to leave a giving-birth sim wins $500,000.",
      views: "38M",
      engagement: "8.5",
      hookType: "absurd challenge",
      durationSec: 36,
      scoreEstimate: 8.5,
    },
    {
      id: "r5",
      thumbnail: "linear-gradient(135deg,#6D28D9,#0E7C86)",
      caption: "Surprise strangers with $10,000 for a compliment.",
      views: "55M",
      engagement: "8.9",
      hookType: "warmth x reward",
      durationSec: 29,
      scoreEstimate: 8.9,
    },
    {
      id: "r6",
      thumbnail: "linear-gradient(135deg,#C53030,#D97706)",
      caption: "I bought the last Blockbuster on Earth.",
      views: "33M",
      engagement: "8.3",
      hookType: "nostalgia + stake",
      durationSec: 45,
      scoreEstimate: 8.3,
    },
    {
      id: "r7",
      thumbnail: "linear-gradient(135deg,#E85D1C,#6D28D9)",
      caption: "1000 people vs 1 Navy SEAL for $250,000.",
      views: "49M",
      engagement: "8.7",
      hookType: "asymmetry",
      durationSec: 38,
      scoreEstimate: 8.7,
    },
    {
      id: "r8",
      thumbnail: "linear-gradient(135deg,#0E7C86,#D97706)",
      caption: "I built the world's most dangerous obstacle course.",
      views: "27M",
      engagement: "8.2",
      hookType: "superlative",
      durationSec: 52,
      scoreEstimate: 8.2,
    },
  ],
  patterns: [
    {
      title: "Hook locks stakes inside two seconds",
      body: "Across all 8 reels, the first two seconds state a specific dollar amount, a superlative, or a physical impossibility. Reward network fires by 0.6s.",
    },
    {
      title: "Contrast or asymmetry primes attention",
      body: "6 of 8 openers use contrast pairs ($1 vs $1M) or asymmetric matchups. This activates the attention network through prediction error.",
    },
    {
      title: "Emotional beat every 6–8 seconds",
      body: "Reaction-cutaways or exclamations pulse on a tight metronome. Emotion network never stays flat for more than 8s.",
    },
    {
      title: "Memory hooks via oddity",
      body: "Absurd specifics (private island, 50 hours, obstacle course) create encoding spikes in parahippocampal regions. The reel sticks.",
    },
  ],
};

export const MOCK_CHAT_SEED: ChatTurn[] = [
  {
    role: "viral-engine",
    content:
      "I've ingested 8 of @mrbeast's top reels. Across them, the reward network fires in the first 600ms. Every single time. What do you want me to unpack first: hook architecture, pacing, or emotional beats?",
  },
];

export function mockChatReply(prompt: string): ChatTurn {
  const p = prompt.toLowerCase();
  if (p.includes("hook")) {
    return {
      role: "viral-engine",
      content:
        "Hook pattern across all 8 reels: name the stakes before any context. Example: 'I gave away a private island' (r1), '$1 vs $1M hotel' (r2). The brain resolves the reward prediction by 0.6s. That's what spikes retention past the 3s scroll threshold.",
      anchors: [
        { reelId: "r1", reason: "stakes-first opener, 0.6s reward ignition" },
        { reelId: "r2", reason: "contrast pair, attention prediction error" },
      ],
    };
  }
  if (p.includes("emot")) {
    return {
      role: "viral-engine",
      content:
        "Emotion beats recur every 6 to 8s. In r5 (compliment surprise) the insula fires 4 times in a 29s reel. Every single time on a reaction-cutaway. Your scripts should schedule a micro-reaction, not narrate through it.",
      anchors: [{ reelId: "r5", reason: "4 insula spikes in 29s via cutaways" }],
    };
  }
  if (p.includes("pace") || p.includes("length") || p.includes("duration")) {
    return {
      role: "viral-engine",
      content:
        "Reels between 28–38s dominate his top performers (6 of 8). After 40s, attention network drops ~18%. Target 30s for your first rewrite.",
    };
  }
  return {
    role: "viral-engine",
    content:
      "I can dig into hooks, pacing, emotional cadence, memory anchors, or CTA patterns. Which do you want to optimize for in your next reel?",
  };
}
