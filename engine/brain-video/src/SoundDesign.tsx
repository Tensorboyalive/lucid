import React from "react";
import { Audio } from "@remotion/media";
import {
  Sequence,
  staticFile,
  useVideoConfig,
  interpolate,
  useCurrentFrame,
} from "remotion";

type Props = {
  frameCount: number; // number of brain scan frames
};

export const SoundDesign: React.FC<Props> = ({ frameCount }) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();

  // Scene timing (must match BrainScanVideo)
  const introDur = 2.5;
  const scanDur = frameCount * 0.5;
  const networksDur = 3.5;
  const scoreDur = 3.5;

  // Scene start frames
  const introStart = 0;
  const scanStart = Math.ceil(introDur * fps);
  const networksStart = scanStart + Math.ceil(scanDur * fps);
  const scoreStart = networksStart + Math.ceil(networksDur * fps);
  const rotateStart = scoreStart + Math.ceil(scoreDur * fps);

  // Scan beep: one beep per frame change (every 0.5s during scan scene)
  const beepSequences = Array.from({ length: frameCount }, (_, i) => ({
    startFrame: scanStart + Math.ceil(i * 0.5 * fps),
    key: `beep-${i}`,
  }));

  return (
    <>
      {/* Layer 1: Ambient drone — entire video, low volume */}
      <Audio
        src={staticFile("sfx_ambient.wav")}
        volume={(f) =>
          interpolate(f, [0, fps * 1, fps * 19, fps * 21], [0, 0.25, 0.25, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })
        }
      />

      {/* Layer 2: Boot-up sound — intro scene */}
      <Sequence from={introStart} durationInFrames={Math.ceil(introDur * fps)}>
        <Audio
          src={staticFile("sfx_boot.wav")}
          volume={(f) =>
            interpolate(f, [0, fps * 0.3], [0, 0.7], {
              extrapolateRight: "clamp",
            })
          }
        />
      </Sequence>

      {/* Layer 3: Scan beeps — one per brain frame */}
      {beepSequences.map(({ startFrame, key }) => (
        <Sequence key={key} from={startFrame} durationInFrames={Math.ceil(0.2 * fps)}>
          <Audio src={staticFile("sfx_beep.wav")} volume={0.5} />
        </Sequence>
      ))}

      {/* Layer 4: Data whoosh — networks scene entrance */}
      <Sequence from={networksStart} durationInFrames={Math.ceil(1.5 * fps)}>
        <Audio src={staticFile("sfx_whoosh.wav")} volume={0.6} />
      </Sequence>

      {/* Layer 5: Score rise — starts with score counting */}
      <Sequence
        from={scoreStart + Math.ceil(0.3 * fps)}
        durationInFrames={Math.ceil(2.0 * fps)}
      >
        <Audio
          src={staticFile("sfx_rise.wav")}
          volume={(f) =>
            interpolate(f, [0, fps * 1.5], [0.3, 0.7], {
              extrapolateRight: "clamp",
            })
          }
        />
      </Sequence>

      {/* Layer 6: Reveal hit — when score finishes counting */}
      <Sequence
        from={scoreStart + Math.ceil(2.0 * fps)}
        durationInFrames={Math.ceil(1.5 * fps)}
      >
        <Audio src={staticFile("sfx_reveal.wav")} volume={0.75} />
      </Sequence>

      {/* Layer 7: Completion chime — rotating brain scene */}
      <Sequence from={rotateStart + Math.ceil(0.5 * fps)} durationInFrames={Math.ceil(2.5 * fps)}>
        <Audio
          src={staticFile("sfx_chime.wav")}
          volume={(f) =>
            interpolate(f, [0, fps * 0.3], [0, 0.5], {
              extrapolateRight: "clamp",
            })
          }
        />
      </Sequence>
    </>
  );
};
