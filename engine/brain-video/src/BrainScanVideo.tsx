import React from "react";
import { AbsoluteFill, Series, useVideoConfig } from "remotion";
import { Intro } from "./scenes/Intro";
import { BrainScan } from "./scenes/BrainScan";
import { Networks } from "./scenes/Networks";
import { ScoreReveal } from "./scenes/ScoreReveal";
import { RotatingBrain } from "./scenes/RotatingBrain";
import { SoundDesign } from "./SoundDesign";
import { VideoData } from "./data";

type Props = {
  data: VideoData;
};

export const BrainScanVideo: React.FC<Props> = ({ data }) => {
  const { fps } = useVideoConfig();

  // Scene durations in seconds
  const introDur = 2.5;
  const scanDur = data.frameFiles.length * 0.5; // 0.5s per frame
  const networksDur = 3.5;
  const scoreDur = 3.5;
  const rotateDur = 4;

  return (
    <AbsoluteFill>
      {/* Audio layer — sits above Series, spans entire composition */}
      <SoundDesign frameCount={data.frameFiles.length} />

      {/* Visual scenes */}
      <Series>
        <Series.Sequence durationInFrames={Math.ceil(introDur * fps)}>
          <Intro />
        </Series.Sequence>

        <Series.Sequence durationInFrames={Math.ceil(scanDur * fps)}>
          <BrainScan
            frameFiles={data.frameFiles}
            framesDir={data.framesDir}
            videoName={data.videoName}
          />
        </Series.Sequence>

        <Series.Sequence durationInFrames={Math.ceil(networksDur * fps)}>
          <Networks
            networksPng={data.networksPng}
            networks={data.networks}
          />
        </Series.Sequence>

        <Series.Sequence durationInFrames={Math.ceil(scoreDur * fps)}>
          <ScoreReveal
            finalScore={data.finalScore}
            verdict={data.verdict}
            networks={data.networks}
          />
        </Series.Sequence>

        <Series.Sequence durationInFrames={Math.ceil(rotateDur * fps)}>
          <RotatingBrain
            rotatingGif={data.rotatingGif}
            videoName={data.videoName}
          />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};
