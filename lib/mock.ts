export type Network = "reward" | "emotion" | "attention" | "memory";

export interface BrainScores {
  reward: number;
  emotion: number;
  attention: number;
  memory: number;
  overall: number;
}

export interface Scene {
  id: string;
  startMs: number;
  endMs: number;
  thumb?: string;
  transcript: string;
  visual: string;
  audio: string;
  dominantEmotion: string;
  strongestNetwork: Network;
  weakestNetwork: Network;
  weaknessScore: number;
}

export interface WeaknessCallout {
  sceneId: string;
  timestamp: string;
  network: Network;
  severity: "critical" | "moderate" | "minor";
  issue: string;
  suggestion: string;
}

export interface ScoreResult {
  id: string;
  sourceUrl?: string;
  durationMs: number;
  scores: BrainScores;
  verdict: string;
  verdictTone: "critical" | "below" | "moderate" | "high" | "explosive";
  scenes: Scene[];
  weaknesses: WeaknessCallout[];
  topMoment: { timestamp: string; why: string };
  bottomMoment: { timestamp: string; why: string };
}

export const MOCK_RESULT: ScoreResult = {
  id: "mock-reel-001",
  sourceUrl: "https://www.instagram.com/reel/Cx1AbCdEfGh/",
  durationMs: 32_400,
  scores: {
    reward: 8.4,
    emotion: 7.1,
    attention: 8.0,
    memory: 6.9,
    overall: 7.8,
  },
  verdict: "HIGH VIRAL POTENTIAL",
  verdictTone: "high",
  scenes: [
    {
      id: "s1",
      startMs: 0,
      endMs: 2200,
      transcript: "Most people think virality is luck.",
      visual: "Handheld close-up of creator's face, slight smile, direct eye contact.",
      audio: "Cold open. No music. Room tone + voice.",
      dominantEmotion: "curiosity",
      strongestNetwork: "attention",
      weakestNetwork: "reward",
      weaknessScore: 0.34,
    },
    {
      id: "s2",
      startMs: 2200,
      endMs: 7800,
      transcript: "It's not. We just ran 2,400 reels through a brain model.",
      visual: "Split screen: creator on left, terminal output on right.",
      audio: "Lo-fi hip hop kicks in at 2.4s.",
      dominantEmotion: "intrigue",
      strongestNetwork: "attention",
      weakestNetwork: "memory",
      weaknessScore: 0.22,
    },
    {
      id: "s3",
      startMs: 7800,
      endMs: 15_200,
      transcript: "Here are the five patterns that actually predicted virality.",
      visual: "Typography reveal. Numbers 1 through 5 pop in sequence.",
      audio: "Beat continues, rising filter sweep at 11s.",
      dominantEmotion: "anticipation",
      strongestNetwork: "reward",
      weakestNetwork: "emotion",
      weaknessScore: 0.18,
    },
    {
      id: "s4",
      startMs: 15_200,
      endMs: 24_800,
      transcript: "Pattern one: the hook promises a reward within two seconds.",
      visual: "B-roll montage of viral creators overlaid with clock graphic.",
      audio: "Beat + ticking sfx layered.",
      dominantEmotion: "engagement",
      strongestNetwork: "reward",
      weakestNetwork: "memory",
      weaknessScore: 0.25,
    },
    {
      id: "s5",
      startMs: 24_800,
      endMs: 32_400,
      transcript: "Use this, and stop guessing. Link in bio.",
      visual: "Tight face close-up, CTA pointer graphic.",
      audio: "Beat drops out on final word. Clean silence CTA.",
      dominantEmotion: "confidence",
      strongestNetwork: "memory",
      weakestNetwork: "emotion",
      weaknessScore: 0.41,
    },
  ],
  weaknesses: [
    {
      sceneId: "s1",
      timestamp: "0:00 · 0:02",
      network: "reward",
      severity: "critical",
      issue:
        "Hook opens with a claim but withholds the reward promise. Reward network shows only 0.34σ activation. Below viral threshold of 0.8σ.",
      suggestion:
        "Promise the specific payoff in the opening line. Try: 'I ran 2,400 reels through a brain scanner, here are the 5 patterns that predicted every hit.'",
    },
    {
      sceneId: "s5",
      timestamp: "0:24 · 0:32",
      network: "emotion",
      severity: "moderate",
      issue:
        "CTA lands on a flat emotional note. Emotion network dips to 0.41σ as the beat drops. Brain interprets silence as end-of-signal, not loop-back.",
      suggestion:
        "Punctuate the CTA with a 250ms stinger or a pitched-up vocal tag to re-engage the emotion/salience network before the loop.",
    },
    {
      sceneId: "s3",
      timestamp: "0:07 · 0:15",
      network: "emotion",
      severity: "minor",
      issue:
        "List reveal is crisp but emotionally neutral. Emotion network stays flat at 0.18σ.",
      suggestion:
        "Add a reaction cutaway (micro-expression) between items 3 and 4 to re-spike the insula.",
    },
  ],
  topMoment: {
    timestamp: "0:11",
    why: "Reward + attention co-fire as the list reveal crescendos. Peak 1.92σ.",
  },
  bottomMoment: {
    timestamp: "0:01",
    why: "Opening hook under-promises. Reward flat at 0.34σ.",
  },
};

export const DEMO_URLS = [
  {
    label: "Creator reel · 7.8 score",
    url: "https://www.instagram.com/reel/Cx1AbCdEfGh/",
  },
  {
    label: "Talking head · 6.2 score",
    url: "https://www.instagram.com/reel/Cx2IjKlMnOp/",
  },
  {
    label: "Montage POV · 8.7 score",
    url: "https://www.instagram.com/reel/Cx3QrStUvWx/",
  },
];

export async function mockStreamScore(
  onEvent: (event: { type: string; data?: unknown }) => void,
  options?: { speedMs?: number },
): Promise<ScoreResult> {
  const speed = options?.speedMs ?? 1;
  const sleep = (ms: number) =>
    new Promise((r) => setTimeout(r, Math.max(1, ms * speed)));

  onEvent({ type: "status", data: { label: "Downloading reel", pct: 0.05 } });
  await sleep(550);
  onEvent({ type: "status", data: { label: "Extracting frames + audio", pct: 0.15 } });
  await sleep(700);
  onEvent({ type: "status", data: { label: "Running TRIBE v2 (demo mode)", pct: 0.35 } });
  await sleep(900);
  onEvent({
    type: "brain_signal",
    data: { network: "reward", timelinePoints: 16 },
  });
  await sleep(550);
  onEvent({ type: "status", data: { label: "Gemini 2.5 analyzing scenes", pct: 0.55 } });
  await sleep(450);
  for (const scene of MOCK_RESULT.scenes) {
    onEvent({ type: "scene", data: scene });
    await sleep(280);
  }
  onEvent({ type: "status", data: { label: "Claude synthesizing weaknesses", pct: 0.82 } });
  await sleep(500);
  for (const w of MOCK_RESULT.weaknesses) {
    onEvent({ type: "weakness", data: w });
    await sleep(260);
  }
  onEvent({ type: "status", data: { label: "Scoring complete", pct: 1 } });
  onEvent({ type: "result", data: MOCK_RESULT });
  return MOCK_RESULT;
}
