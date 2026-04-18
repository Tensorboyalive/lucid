export type NetworkScore = {
  name: string;
  displayName: string;
  score: number;
  weight: number;
  color: string;
  icon: string;
};

export type VideoData = {
  videoName: string;
  finalScore: number;
  verdict: string;
  networks: NetworkScore[];
  frameFiles: string[];
  framesDir: string;
  networksPng: string;
  rotatingGif: string;
};

export const APRIL_11: VideoData = {
  videoName: "April-11_R1",
  finalScore: 4.6,
  verdict: "BELOW AVERAGE",
  networks: [
    { name: "reward", displayName: "Reward", score: 4.0, weight: 0.3, color: "#FF6B35", icon: "$" },
    { name: "emotion", displayName: "Emotion", score: 5.5, weight: 0.25, color: "#E91E63", icon: "!" },
    { name: "attention", displayName: "Attention", score: 4.9, weight: 0.25, color: "#2196F3", icon: ">" },
    { name: "memory", displayName: "Memory", score: 4.2, weight: 0.2, color: "#9C27B0", icon: "@" },
  ],
  frameFiles: [
    "brain_t000.png", "brain_t002.png", "brain_t004.png", "brain_t006.png",
    "brain_t008.png", "brain_t010.png", "brain_t012.png", "brain_t014.png",
    "brain_t016.png", "brain_t018.png", "brain_t020.png", "brain_t022.png",
    "brain_t024.png",
  ],
  framesDir: "April-11_R1_frames",
  networksPng: "April-11_R1_networks.png",
  rotatingGif: "April-11_R1_rotating_reward.gif",
};
