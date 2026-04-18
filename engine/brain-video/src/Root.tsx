import React from "react";
import { Composition } from "remotion";
import { BrainScanVideo } from "./BrainScanVideo";
import { APRIL_11 } from "./data";

const FPS = 30;
const WIDTH = 1080;
const HEIGHT = 1920;

// Calculate total duration based on scene lengths
const introDur = 2.5;
const scanDur = APRIL_11.frameFiles.length * 0.5;
const networksDur = 3.5;
const scoreDur = 3.5;
const rotateDur = 4;
const totalDuration = introDur + scanDur + networksDur + scoreDur + rotateDur;

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="BrainScanVideo"
      component={BrainScanVideo}
      durationInFrames={Math.ceil(totalDuration * FPS)}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
      defaultProps={{
        data: APRIL_11,
      }}
    />
  );
};
