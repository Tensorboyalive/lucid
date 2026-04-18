import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  staticFile,
  AnimatedImage,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/SpaceMono";
import { COLORS, background, centered } from "../styles";

const { fontFamily: mono } = loadFont("normal", {
  weights: ["700"],
  subsets: ["latin"],
});

type Props = {
  rotatingGif: string;
  videoName: string;
};

export const RotatingBrain: React.FC<Props> = ({ rotatingGif, videoName }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, fps * 0.5], [0, 1], {
    extrapolateRight: "clamp",
  });

  const scale = spring({
    frame,
    fps,
    config: { damping: 200 },
  });

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
          opacity: fadeIn,
        }}
      >
        <div
          style={{
            fontFamily: mono,
            fontSize: 20,
            color: COLORS.accent,
            letterSpacing: 3,
          }}
        >
          PEAK REWARD ACTIVATION
        </div>
      </div>

      {/* Rotating brain GIF */}
      <div
        style={{
          ...centered,
          position: "absolute",
          top: 160,
          left: 40,
          right: 40,
          bottom: 200,
          transform: `scale(${scale})`,
        }}
      >
        <AnimatedImage
          src={staticFile(rotatingGif)}
          width={900}
          height={900}
          fit="contain"
          style={{
            borderRadius: 20,
            maxWidth: "100%",
            maxHeight: "100%",
          }}
        />
      </div>

      {/* Bottom label */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          left: 0,
          width: "100%",
          textAlign: "center",
          opacity: fadeIn,
        }}
      >
        <div
          style={{
            fontFamily: mono,
            fontSize: 16,
            color: COLORS.textDim,
            letterSpacing: 2,
          }}
        >
          {videoName} — 360° CORTICAL VIEW
        </div>
        <div
          style={{
            fontFamily: mono,
            fontSize: 13,
            color: COLORS.accent,
            marginTop: 8,
            letterSpacing: 2,
          }}
        >
          @TENSORBOYALIVE
        </div>
      </div>
    </div>
  );
};
