import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/SpaceMono";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { COLORS, background, centered } from "../styles";

const { fontFamily: mono } = loadFont("normal", {
  weights: ["700"],
  subsets: ["latin"],
});

const { fontFamily: inter } = loadInter("normal", {
  weights: ["300", "700"],
  subsets: ["latin"],
});

export const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({ frame, fps, config: { damping: 200 } });
  const subtitleOpacity = interpolate(frame, [0.6 * fps, 1.2 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const scanLineY = interpolate(frame, [0, 2 * fps], [-100, 2100], {
    extrapolateRight: "clamp",
  });

  const glowPulse = interpolate(
    frame % (fps * 1.5),
    [0, fps * 0.75, fps * 1.5],
    [0.3, 0.8, 0.3]
  );

  return (
    <div style={background}>
      {/* Scan line effect */}
      <div
        style={{
          position: "absolute",
          top: scanLineY,
          left: 0,
          width: "100%",
          height: 3,
          background: `linear-gradient(90deg, transparent, ${COLORS.accent}, transparent)`,
          opacity: 0.6,
          zIndex: 10,
        }}
      />

      {/* Grid overlay */}
      <div
        style={{
          ...centered,
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundImage: `
            linear-gradient(${COLORS.accentDim}15 1px, transparent 1px),
            linear-gradient(90deg, ${COLORS.accentDim}15 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Main content */}
      <div style={{ ...centered, ...background }}>
        {/* Brain icon circle */}
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: "50%",
            border: `2px solid ${COLORS.accent}`,
            ...centered,
            marginBottom: 40,
            opacity: titleSpring,
            transform: `scale(${titleSpring})`,
            boxShadow: `0 0 ${30 * glowPulse}px ${COLORS.accent}40`,
          }}
        >
          <span style={{ fontSize: 60 }}>🧠</span>
        </div>

        {/* Title */}
        <div
          style={{
            fontFamily: mono,
            fontSize: 42,
            fontWeight: 700,
            color: COLORS.text,
            textAlign: "center",
            letterSpacing: 4,
            opacity: titleSpring,
            transform: `translateY(${interpolate(titleSpring, [0, 1], [30, 0])}px)`,
            lineHeight: 1.3,
            padding: "0 40px",
          }}
        >
          NEURO-VIRAL
          <br />
          SCORE ENGINE
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontFamily: inter,
            fontSize: 22,
            fontWeight: 300,
            color: COLORS.accentDim,
            textAlign: "center",
            marginTop: 20,
            opacity: subtitleOpacity,
            letterSpacing: 2,
          }}
        >
          Powered by Meta TRIBE v2 + fMRI
        </div>

        {/* Bottom tag */}
        <div
          style={{
            position: "absolute",
            bottom: 80,
            fontFamily: mono,
            fontSize: 14,
            color: COLORS.textDim,
            letterSpacing: 3,
            opacity: subtitleOpacity,
          }}
        >
          @TENSORBOYALIVE
        </div>
      </div>
    </div>
  );
};
