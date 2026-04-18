import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/SpaceMono";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { COLORS, background, centered, scoreColor } from "../styles";
import { NetworkScore } from "../data";

const { fontFamily: mono } = loadFont("normal", {
  weights: ["700"],
  subsets: ["latin"],
});

const { fontFamily: inter } = loadInter("normal", {
  weights: ["400", "700"],
  subsets: ["latin"],
});

type Props = {
  finalScore: number;
  verdict: string;
  networks: NetworkScore[];
};

export const ScoreReveal: React.FC<Props> = ({
  finalScore,
  verdict,
  networks,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Counting animation: score ramps up from 0 to finalScore
  const countDuration = fps * 1.5;
  const countProgress = interpolate(frame, [fps * 0.3, fps * 0.3 + countDuration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const displayScore = (finalScore * countProgress).toFixed(1);

  const color = scoreColor(finalScore);

  // Verdict appears after count
  const verdictOpacity = interpolate(frame, [fps * 2, fps * 2.3], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Glow pulse
  const glowPulse = interpolate(
    frame % fps,
    [0, fps * 0.5, fps],
    [0.4, 1, 0.4]
  );

  // Score ring animation
  const ringProgress = spring({
    frame,
    fps,
    config: { damping: 200 },
    durationInFrames: fps * 2,
  });

  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference * (1 - ringProgress * (finalScore / 10));

  return (
    <div style={background}>
      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: 80,
          left: 0,
          width: "100%",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: mono,
            fontSize: 20,
            color: COLORS.accent,
            letterSpacing: 3,
            opacity: spring({ frame, fps, config: { damping: 200 } }),
          }}
        >
          NEURO-VIRAL SCORE
        </div>
      </div>

      {/* Score ring */}
      <div
        style={{
          ...centered,
          position: "absolute",
          top: 200,
          left: 0,
          width: "100%",
        }}
      >
        <div style={{ position: "relative", width: 280, height: 280 }}>
          <svg
            width={280}
            height={280}
            viewBox="0 0 280 280"
            style={{ position: "absolute", transform: "rotate(-90deg)" }}
          >
            {/* Background ring */}
            <circle
              cx={140}
              cy={140}
              r={120}
              fill="none"
              stroke={COLORS.textDim + "20"}
              strokeWidth={8}
            />
            {/* Score ring */}
            <circle
              cx={140}
              cy={140}
              r={120}
              fill="none"
              stroke={color}
              strokeWidth={8}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{
                filter: `drop-shadow(0 0 ${8 * glowPulse}px ${color})`,
              }}
            />
          </svg>

          {/* Score number */}
          <div
            style={{
              ...centered,
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
            }}
          >
            <span
              style={{
                fontFamily: mono,
                fontSize: 72,
                fontWeight: 700,
                color,
                textShadow: `0 0 ${20 * glowPulse}px ${color}60`,
              }}
            >
              {displayScore}
            </span>
            <span
              style={{
                fontFamily: inter,
                fontSize: 20,
                color: COLORS.textDim,
                marginTop: -8,
              }}
            >
              / 10
            </span>
          </div>
        </div>
      </div>

      {/* Verdict */}
      <div
        style={{
          position: "absolute",
          top: 520,
          left: 0,
          width: "100%",
          textAlign: "center",
          opacity: verdictOpacity,
        }}
      >
        <div
          style={{
            fontFamily: mono,
            fontSize: 24,
            color,
            fontWeight: 700,
            letterSpacing: 2,
          }}
        >
          {verdict}
        </div>
      </div>

      {/* Mini network bars */}
      <div
        style={{
          position: "absolute",
          top: 620,
          left: 60,
          right: 60,
          display: "flex",
          flexDirection: "column",
          gap: 16,
          opacity: verdictOpacity,
        }}
      >
        {networks.map((net) => (
          <div key={net.name}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 4,
              }}
            >
              <span
                style={{
                  fontFamily: inter,
                  fontSize: 15,
                  color: COLORS.text,
                }}
              >
                {net.displayName}
              </span>
              <span
                style={{
                  fontFamily: mono,
                  fontSize: 15,
                  color: net.color,
                  fontWeight: 700,
                }}
              >
                {net.score.toFixed(1)}
              </span>
            </div>
            <div
              style={{
                height: 6,
                backgroundColor: COLORS.textDim + "15",
                borderRadius: 3,
              }}
            >
              <div
                style={{
                  width: `${(net.score / 10) * 100}%`,
                  height: "100%",
                  backgroundColor: net.color,
                  borderRadius: 3,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Powered by */}
      <div
        style={{
          position: "absolute",
          bottom: 60,
          left: 0,
          width: "100%",
          textAlign: "center",
          opacity: verdictOpacity * 0.5,
        }}
      >
        <span
          style={{
            fontFamily: inter,
            fontSize: 13,
            color: COLORS.textDim,
            letterSpacing: 1,
          }}
        >
          Powered by Meta TRIBE v2 + fMRI brain prediction
        </span>
      </div>
    </div>
  );
};
