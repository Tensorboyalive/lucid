export const COLORS = {
  bg: "#0a0a0f",
  bgCard: "#111118",
  accent: "#00e5ff",
  accentDim: "#00758a",
  text: "#e8e8f0",
  textDim: "#6b6b80",
  reward: "#FF6B35",
  emotion: "#E91E63",
  attention: "#2196F3",
  memory: "#9C27B0",
  green: "#4CAF50",
  yellow: "#FFC107",
  red: "#F44336",
};

export const fullScreen: React.CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
};

export const centered: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "column",
};

export const background: React.CSSProperties = {
  ...fullScreen,
  backgroundColor: COLORS.bg,
  overflow: "hidden",
};

export function scoreColor(score: number): string {
  if (score >= 7.5) return COLORS.green;
  if (score >= 5.0) return COLORS.yellow;
  return COLORS.red;
}
