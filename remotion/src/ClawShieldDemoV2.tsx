import { AbsoluteFill, Audio, staticFile } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { Fragment } from "react";
import { SCENE_SEGMENTS_V2, TRANSITION_FRAMES_V2 } from "./v2/timeline";
import { VIDEO_V2_DATA } from "./v2/generated";
import { Scene01Threat } from "./v2/scenes/Scene01Threat";
import { Scene02Mechanism } from "./v2/scenes/Scene02Mechanism";
import { Scene03Cases } from "./v2/scenes/Scene03Cases";
import { Scene04Proof } from "./v2/scenes/Scene04Proof";
import { Scene05AiEvidence } from "./v2/scenes/Scene05AiEvidence";
import { Scene06JudgeMap } from "./v2/scenes/Scene06JudgeMap";
import { Scene07Closing } from "./v2/scenes/Scene07Closing";
import { SubtitleOverlayV2 } from "./v2/SubtitleOverlay";
import { V2_THEME, shortHex } from "./v2/theme";

const SCENE_COMPONENTS = {
  scene1: Scene01Threat,
  scene2: Scene02Mechanism,
  scene3: Scene03Cases,
  scene4: Scene04Proof,
  scene5: Scene05AiEvidence,
  scene6: Scene06JudgeMap,
  scene7: Scene07Closing
} as const;

export const ClawShieldDemoV2 = () => {
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
        {SCENE_SEGMENTS_V2.map((scene, index) => {
          const SceneComponent = SCENE_COMPONENTS[scene.id];
          return (
            <Fragment key={scene.id}>
              <TransitionSeries.Sequence durationInFrames={scene.duration} premountFor={12}>
                <SceneComponent data={VIDEO_V2_DATA} />
              </TransitionSeries.Sequence>
              {index < SCENE_SEGMENTS_V2.length - 1 ? (
                <TransitionSeries.Transition
                  presentation={presentations[index] || fade()}
                  timing={linearTiming({ durationInFrames: TRANSITION_FRAMES_V2 })}
                />
              ) : null}
            </Fragment>
          );
        })}
      </TransitionSeries>

      <Audio src={staticFile(VIDEO_V2_DATA.media.voiceoverPath)} />
      <SubtitleOverlayV2 />

      <AbsoluteFill
        style={{
          justifyContent: "flex-start",
          alignItems: "flex-end",
          padding: "20px 28px",
          pointerEvents: "none"
        }}
      >
        <div
          style={{
            borderRadius: 999,
            border: `1px solid ${V2_THEME.colors.panelBorder}`,
            background: "rgba(4,7,12,0.86)",
            padding: "8px 16px",
            color: V2_THEME.colors.muted,
            fontFamily: V2_THEME.fonts.mono,
            fontSize: 16
          }}
        >
          {VIDEO_V2_DATA.proof.chain} · contract {shortHex(VIDEO_V2_DATA.proof.contractAddress, 10, 8)} · tx{" "}
          {shortHex(VIDEO_V2_DATA.proof.txHash, 10, 8)}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
