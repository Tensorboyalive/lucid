import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Img,
  staticFile,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/SpaceMono";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { COLORS, background, centered } from "../styles";
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
  networksPng: string;
  networks: NetworkScore[];
};

export const Networks: React.FC<Props> = ({ networksPng, networks }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({ frame, fps, config: { damping: 200 } });

  return (
    <div style={background}>
      {/* Header */}
      <div
        style={{
          position: "absolute",
          top: 60,
          left: 0,
          width: "100%",
          textAlign: "center",
          opacity: titleSpring,
          transform: `translateY(${interpolate(titleSpring, [0, 1], [20, 0])}px)`,
        }}
      >
        <div
          style={{
            fontFamily: mono,
            fontSize: 22,
            color: COLORS.accent,
            letterSpacing: 3,
          }}
        >
          ENGAGEMENT NETWORKS
        </div>
        <div
          style={{
            fontFamily: inter,
            fontSize: 14,
            color: COLORS.textDim,
            marginTop: 8,
          }}
        >
          Destrieux Atlas parcellation on fsaverage5
        </div>
      </div>

      {/* Networks image */}
      <div
        style={{
          position: "absolute",
          top: 160,
          left: 20,
          right: 20,
          height: 300,
          ...centered,
        }}
      >
        <Img
          src={staticFile(networksPng)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            borderRadius: 12,
            opacity: interpolate(frame, [fps * 0.3, fps * 0.8], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        />
      </div>

      {/* Network cards */}
      <div
        style={{
          position: "absolute",
          top: 500,
          left: 40,
          right: 40,
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        {networks.map((net, i) => {
          const delay = i * 5;
          const cardSpring = spring({
            frame,
            fps,
            delay: fps * 0.5 + delay,
            config: { damping: 200 },
          });
          const barWidth = interpolate(
            spring({
              frame,
              fps,
              delay: fps * 0.8 + delay,
              config: { damping: 200 },
            }),
            [0, 1],
            [0, (net.score / 10) * 100]
          );

          return (
            <div
              key={net.name}
              style={{
                opacity: cardSpring,
                transform: `translateX(${interpolate(cardSpring, [0, 1], [40, 0])}px)`,
              }}
            >
              {/* Label row */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  marginBottom: 6,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span
                    style={{
                      fontFamily: mono,
                      fontSize: 20,
                      color: net.color,
                      fontWeight: 700,
                    }}
                  >
                    {net.icon}
                  </span>
                  <span
                    style={{
                      fontFamily: inter,
                      fontSize: 18,
                      color: COLORS.text,
                      fontWeight: 700,
                    }}
                  >
                    {net.displayName}
                  </span>
                  <span
                    style={{
                      fontFamily: inter,
                      fontSize: 13,
                      color: COLORS.textDim,
                    }}
                  >
                    {Math.round(net.weight * 100)}%
                  </span>
                </div>
                <span
                  style={{
                    fontFamily: mono,
                    fontSize: 22,
                    color: net.color,
                    fontWeight: 700,
                  }}
                >
                  {net.score.toFixed(1)}
                </span>
              </div>

              {/* Bar */}
              <div
                style={{
                  height: 8,
                  backgroundColor: COLORS.textDim + "20",
                  borderRadius: 4,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${barWidth}%`,
                    height: "100%",
                    backgroundColor: net.color,
                    borderRadius: 4,
                    boxShadow: `0 0 8px ${net.color}50`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
