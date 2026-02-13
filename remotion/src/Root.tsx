import { Composition, Still } from "remotion";
import { z } from "zod";
import { ClawShieldDemo } from "./ClawShieldDemo";
import { TOTAL_FRAMES, FPS } from "./data";
import { Cover } from "./Cover";

export const DemoSchema = z.object({
  headline: z.string().default("ClawShield")
});

export const RemotionRoot: React.FC = () => {
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
    </>
  );
};
