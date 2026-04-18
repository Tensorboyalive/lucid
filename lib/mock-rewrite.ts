export interface ShotDirection {
  line: string;
  rewrite: string;
  camera: string;
  pacing: string;
  targetNetwork: "reward" | "emotion" | "attention" | "memory";
  reason: string;
}

export interface RewriteResult {
  targetDurationSec: number;
  predictedScore: number;
  predictedLift: number;
  shots: ShotDirection[];
  summary: string;
}

export const MOCK_REWRITE: RewriteResult = {
  targetDurationSec: 30,
  predictedScore: 8.9,
  predictedLift: 1.1,
  shots: [
    {
      line: "Most people think virality is luck.",
      rewrite:
        "I ran 2,400 reels through a brain scanner. Here are the 5 patterns that predicted every single hit.",
      camera: "Tight face close-up, 35mm, soft key from camera-right. Eye-direct.",
      pacing: "1.8s hold. Cut on the word 'every'.",
      targetNetwork: "reward",
      reason:
        "Stakes-first hook with specific number (2,400). Reward network ignites in 600ms. Matches the pattern from r1 and r2.",
    },
    {
      line: "It's not. We just ran 2,400 reels through a brain model.",
      rewrite: "Pattern one. The hook. You have two seconds.",
      camera:
        "Hard cut to overhead montage. Thumb-scroll on a stack of phones, 120fps slowed to 48fps.",
      pacing: "1.3s. Sync cut on 'two'.",
      targetNetwork: "attention",
      reason:
        "Tempo change from talking-head to montage triggers attention prediction error. Matches r3 contrast pacing.",
    },
    {
      line: "Here are the five patterns that actually predicted virality.",
      rewrite:
        "Pattern two. Contrast. Show me $1 versus $1,000,000. My brain will freeze.",
      camera:
        "Split screen reveal with hard wipe. Left panel cold-desaturated. Right panel warm saturated.",
      pacing: "2.2s. Cut on 'freeze'.",
      targetNetwork: "attention",
      reason:
        "Explicit contrast pair, directly cribbed from r2. Attention network peaks at ~1.9σ in prior tests.",
    },
    {
      line: "Pattern one: the hook promises a reward within two seconds.",
      rewrite:
        "Pattern three. A micro-reaction every six seconds. Not a monologue. A metronome.",
      camera:
        "Cut-in reaction: raised eyebrow, then a smirk. 50mm. Shallow DOF.",
      pacing: "0.8s reaction shot. Return to main 1.4s.",
      targetNetwork: "emotion",
      reason:
        "Re-spikes the insula every 6 to 8s. r5 does this 4 times in 29s. Emotion network never stays flat.",
    },
    {
      line: "Use this, and stop guessing. Link in bio.",
      rewrite:
        "Pattern five. The loop-back. Drop the beat. Say one word. Cut to black.",
      camera: "Black cut. Then a single phrase over a still frame.",
      pacing:
        "0.4s silence before final word. Loop re-engages memory network via encoding spike.",
      targetNetwork: "memory",
      reason:
        "Forces encoding spike in parahippocampal regions. The reel sticks. Matches r6 nostalgia pattern.",
    },
  ],
  summary:
    "The original ran 32s with a soft opener. Retarget 30s with stakes-first hook, two tempo changes, reaction cutaway at 12s, hard-cut loop close. Predicted score lift: +1.1 over original.",
};

export async function mockRewrite(
  _script: string,
  onEvent: (event: { type: string; data?: unknown }) => void,
): Promise<RewriteResult> {
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
  onEvent({ type: "status", data: { label: "Parsing your draft", pct: 0.1 } });
  await sleep(500);
  onEvent({
    type: "status",
    data: { label: "Anchoring to fMRI-validated patterns", pct: 0.3 },
  });
  await sleep(600);
  onEvent({
    type: "status",
    data: { label: "Claude · pacing + shot design", pct: 0.55 },
  });
  await sleep(600);
  for (const shot of MOCK_REWRITE.shots) {
    onEvent({ type: "shot", data: shot });
    await sleep(360);
  }
  onEvent({ type: "status", data: { label: "Rewrite complete", pct: 1 } });
  onEvent({ type: "result", data: MOCK_REWRITE });
  return MOCK_REWRITE;
}
