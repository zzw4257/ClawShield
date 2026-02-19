import { AbsoluteFill, useCurrentFrame } from "remotion";
import { sceneForFrame } from "./timeline";
import { V2_THEME } from "./theme";

export const SubtitleOverlayV2 = () => {
  const frame = useCurrentFrame();
  const active = sceneForFrame(frame);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: 44,
        pointerEvents: "none"
      }}
    >
      <div
        style={{
          maxWidth: 1500,
          padding: "12px 22px",
          borderRadius: 14,
          background: "rgba(5, 8, 13, 0.78)",
          border: `1px solid ${V2_THEME.colors.panelBorder}`,
          fontSize: 28,
          fontFamily: V2_THEME.fonts.body,
          textAlign: "center",
          lineHeight: 1.25,
          color: "#FFFFFF"
        }}
      >
        {active.narration}
      </div>
    </AbsoluteFill>
  );
};
