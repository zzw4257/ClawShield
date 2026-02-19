import { AbsoluteFill, useCurrentFrame } from "remotion";
import { V3_LAYOUT } from "./layout";
import { V3_THEME } from "./theme";
import { sceneForFrameV3 } from "./timeline";
import { wrapToTwoLines } from "./text-fit";

export const SubtitleOverlayV3 = () => {
  const frame = useCurrentFrame();
  const active = sceneForFrameV3(frame);
  const lines = wrapToTwoLines(active.narration, 94);
  const longest = Math.max(...lines.map((line) => line.length), 0);
  const fontSize = longest > 74 ? 22 : longest > 62 ? 24 : 26;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: V3_LAYOUT.SAFE_X,
          right: V3_LAYOUT.SAFE_X,
          top: V3_LAYOUT.SUBTITLE_LANE_Y,
          height: V3_LAYOUT.SUBTITLE_LANE_H,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <div
          style={{
            maxWidth: 1560,
            borderRadius: 14,
            background: "rgba(4, 8, 14, 0.86)",
            border: `1px solid ${V3_THEME.colors.panelBorder}`,
            padding: "14px 20px",
            textAlign: "center",
            color: "#FFFFFF",
            fontFamily: V3_THEME.fonts.body,
            fontSize,
            lineHeight: 1.24,
            boxShadow: "0 20px 36px rgba(0,0,0,0.35)"
          }}
        >
          {lines.map((line, index) => (
            <div key={`${index}-${line}`}>{line}</div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
