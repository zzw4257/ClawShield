import { Composition, Still } from "remotion";
import { z } from "zod";
import { ClawShieldDemo } from "./ClawShieldDemo";
import { TOTAL_FRAMES, FPS } from "./data";
import { Cover } from "./Cover";
import { ClawShieldDemoV2 } from "./ClawShieldDemoV2";
import { CoverV2 } from "./CoverV2";
import { TOTAL_FRAMES_V2, FPS_V2 } from "./v2/timeline";
import { ClawShieldDemoV3 } from "./ClawShieldDemoV3";
import { ClawShieldDemoV3Silent } from "./ClawShieldDemoV3Silent";
import { ClawShieldDemoV4 } from "./ClawShieldDemoV4";
import { CoverV3 } from "./CoverV3";
import { TOTAL_FRAMES_V3, FPS_V3 } from "./v3/timeline";

export const DemoSchema = z.object({
  headline: z.string().default("ClawShield")
});

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="ClawShieldDemo"
        component={ClawShieldDemo}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={{
          headline: "ClawShield"
        }}
        schema={DemoSchema}
      />
      <Still id="ClawShieldCover" component={Cover} width={1920} height={1080} />
      <Composition
        id="ClawShieldDemoV2"
        component={ClawShieldDemoV2}
        durationInFrames={TOTAL_FRAMES_V2}
        fps={FPS_V2}
        width={1920}
        height={1080}
        defaultProps={{
          headline: "ClawShield v2"
        }}
        schema={DemoSchema}
      />
      <Still id="ClawShieldCoverV2" component={CoverV2} width={1920} height={1080} />
      <Composition
        id="ClawShieldDemoV3"
        component={ClawShieldDemoV3}
        durationInFrames={TOTAL_FRAMES_V3}
        fps={FPS_V3}
        width={1920}
        height={1080}
        defaultProps={{
          headline: "ClawShield v3"
        }}
        schema={DemoSchema}
      />
      <Still id="ClawShieldCoverV3" component={CoverV3} width={1920} height={1080} />
      <Composition
        id="ClawShieldDemoV3Silent"
        component={ClawShieldDemoV3Silent}
        durationInFrames={TOTAL_FRAMES_V3}
        fps={FPS_V3}
        width={1920}
        height={1080}
        defaultProps={{
          headline: "ClawShield v3 Silent"
        }}
        schema={DemoSchema}
      />
      <Composition
        id="ClawShieldDemoV4"
        component={ClawShieldDemoV4}
        durationInFrames={TOTAL_FRAMES_V3}
        fps={FPS_V3}
        width={1920}
        height={1080}
        defaultProps={{
          headline: "ClawShield v4"
        }}
        schema={DemoSchema}
      />
      <Still id="ClawShieldCoverV4" component={CoverV3} width={1920} height={1080} />
    </>
  );
};
