import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Img,
  staticFile,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/SpaceMono";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { COLORS, background, centered } from "../styles";

const { fontFamily: mono } = loadFont("normal", {
  weights: ["700"],
  subsets: ["latin"],
});

const { fontFamily: inter } = loadInter("normal", {
  weights: ["400"],
  subsets: ["latin"],
});

type Props = {
  frameFiles: string[];
  framesDir: string;
  videoName: string;
};

export const BrainScan: React.FC<Props> = ({
  frameFiles,
  framesDir,
  videoName,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Each brain frame shows for 0.5 seconds
  const framesPerImage = Math.floor(fps * 0.5);
  const currentImageIndex = Math.min(
    Math.floor(frame / framesPerImage),
    frameFiles.length - 1
  );
  const currentFile = frameFiles[currentImageIndex];

  // Extract timestamp from filename (e.g., "brain_t012.png" -> "12s")
  const timeMatch = currentFile.match(/brain_t(\d+)/);
  const timeLabel = timeMatch ? timeMatch[1].replace(/^0+/, "") + "s" : "";

  // Progress bar
  const progress = (currentImageIndex + 1) / frameFiles.length;

  // Subtle pulse on frame change
  const withinFrame = frame % framesPerImage;
  const flashOpacity = interpolate(withinFrame, [0, 5], [0.15, 0], {
    extrapolateRight: "clamp",
  });

  // Title fade in
  const titleOpacity = interpolate(frame, [0, fps * 0.3], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <div style={background}>
      {/* Flash on frame change */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: COLORS.accent,
          opacity: flashOpacity,
          zIndex: 5,
        }}
      />

      {/* Header */}
      <div
        style={{
          position: "absolute",
          top: 60,
          left: 0,
          width: "100%",
          textAlign: "center",
          opacity: titleOpacity,
          zIndex: 2,
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
          BRAIN ACTIVITY SCAN
        </div>
        <div
          style={{
            fontFamily: inter,
            fontSize: 16,
            color: COLORS.textDim,
            marginTop: 8,
          }}
        >
          {videoName} — 20,484 cortical vertices
        </div>
      </div>

      {/* Brain image */}
      <div
        style={{
          ...centered,
          position: "absolute",
          top: 160,
          left: 40,
          right: 40,
          bottom: 340,
        }}
      >
        <Img
          src={staticFile(`${framesDir}/${currentFile}`)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            borderRadius: 12,
          }}
        />
      </div>

      {/* Time indicator */}
      <div
        style={{
          position: "absolute",
          bottom: 250,
          left: 0,
          width: "100%",
          textAlign: "center",
        }}
      >
        <span
          style={{
            fontFamily: mono,
            fontSize: 48,
            color: COLORS.accent,
            fontWeight: 700,
          }}
        >
          t = {timeLabel}
        </span>
      </div>

      {/* Progress bar */}
      <div
        style={{
          position: "absolute",
          bottom: 200,
          left: 60,
          right: 60,
          height: 4,
          backgroundColor: COLORS.textDim + "30",
          borderRadius: 2,
        }}
      >
        <div
          style={{
            width: `${progress * 100}%`,
            height: "100%",
            backgroundColor: COLORS.accent,
            borderRadius: 2,
            boxShadow: `0 0 10px ${COLORS.accent}60`,
          }}
        />
      </div>

      {/* Legend */}
      <div
        style={{
          position: "absolute",
          bottom: 110,
          left: 0,
          width: "100%",
          ...centered,
          flexDirection: "row",
          gap: 40,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 3,
              backgroundColor: "#E53935",
            }}
          />
          <span
            style={{ fontFamily: inter, fontSize: 14, color: COLORS.textDim }}
          >
            Positive activation
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 3,
              backgroundColor: "#1565C0",
            }}
          />
          <span
            style={{ fontFamily: inter, fontSize: 14, color: COLORS.textDim }}
          >
            Negative activation
          </span>
        </div>
      </div>

      {/* Scanning indicator */}
      <div
        style={{
          position: "absolute",
          bottom: 50,
          left: 0,
          width: "100%",
          textAlign: "center",
        }}
      >
        <span
          style={{
            fontFamily: mono,
            fontSize: 13,
            color: COLORS.accent,
            letterSpacing: 2,
            opacity: 0.6 + 0.4 * Math.sin(frame * 0.15),
          }}
        >
          ● SCANNING
        </span>
      </div>
    </div>
  );
};
