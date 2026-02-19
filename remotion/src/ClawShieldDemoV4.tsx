import { AbsoluteFill, Audio, staticFile } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { Fragment } from "react";
import { SCENE_SEGMENTS_V3, TRANSITION_FRAMES_V3 } from "./v3/timeline";
import { VIDEO_V3_DATA } from "./v3/generated";
import { Scene01ThreatV4 } from "./v4/scenes/Scene01Threat";
import { Scene02MechanismV3 } from "./v3/scenes/Scene02Mechanism";
import { Scene03CasesV3 } from "./v3/scenes/Scene03Cases";
import { Scene04ProofV3 } from "./v3/scenes/Scene04Proof";
import { Scene05AiEvidenceV3 } from "./v3/scenes/Scene05AiEvidence";
import { Scene06JudgeMapV3 } from "./v3/scenes/Scene06JudgeMap";
import { Scene07ClosingV3 } from "./v3/scenes/Scene07Closing";
import { SubtitleOverlayV3 } from "./v3/SubtitleOverlayV3";

const SCENE_COMPONENTS = {
  scene1: Scene01ThreatV4,
  scene2: Scene02MechanismV3,
  scene3: Scene03CasesV3,
  scene4: Scene04ProofV3,
  scene5: Scene05AiEvidenceV3,
  scene6: Scene06JudgeMapV3,
  scene7: Scene07ClosingV3
} as const;

export const ClawShieldDemoV4 = () => {
  const presentations = [
    fade(),
    slide({ direction: "from-right" as const }),
    fade(),
    slide({ direction: "from-bottom" as const }),
    fade(),
    slide({ direction: "from-left" as const })
  ];

  return (
    <AbsoluteFill>
      <TransitionSeries>
        {SCENE_SEGMENTS_V3.map((scene, index) => {
          const SceneComponent = SCENE_COMPONENTS[scene.id];
          return (
            <Fragment key={scene.id}>
              <TransitionSeries.Sequence durationInFrames={scene.duration} premountFor={10}>
                <SceneComponent data={VIDEO_V3_DATA} />
              </TransitionSeries.Sequence>
              {index < SCENE_SEGMENTS_V3.length - 1 ? (
                <TransitionSeries.Transition
                  presentation={presentations[index] || fade()}
                  timing={linearTiming({ durationInFrames: TRANSITION_FRAMES_V3 })}
                />
              ) : null}
            </Fragment>
          );
        })}
      </TransitionSeries>

      <Audio src={staticFile(VIDEO_V3_DATA.media.voiceoverPath)} />
      <SubtitleOverlayV3 />
    </AbsoluteFill>
  );
};
