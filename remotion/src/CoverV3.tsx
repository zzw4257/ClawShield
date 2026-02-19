import { AbsoluteFill, Img, staticFile } from "remotion";
import { VIDEO_V3_DATA } from "./v3/generated";
import { V3_THEME } from "./v3/theme";
import { truncateMiddle } from "./v3/text-fit";

export const CoverV3 = () => {
  return (
    <AbsoluteFill
      style={{
        background: "radial-gradient(circle at 14% 12%, #1A2434 0%, #070B12 48%, #03050A 100%)",
        color: V3_THEME.colors.text,
        fontFamily: V3_THEME.fonts.title
      }}
    >
      <AbsoluteFill style={{ opacity: 0.28 }}>
        <Img src={staticFile("v3/keyframes/scene-04-hero.png")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>

      <div
        style={{
          position: "absolute",
          inset: 96,
          borderRadius: 30,
          border: `1px solid ${V3_THEME.colors.panelBorder}`,
          background: "rgba(6, 10, 16, 0.84)",
          boxShadow: V3_THEME.shadow,
          padding: 56,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center"
        }}
      >
        <p style={{ margin: 0, fontFamily: V3_THEME.fonts.mono, color: V3_THEME.colors.accent, fontSize: 24 }}>
          BNB Chain Good Vibes Only · Agent Track
        </p>
        <h1 style={{ margin: "14px 0 10px", fontSize: 98, lineHeight: 0.95 }}>ClawShield v3</h1>
        <p style={{ margin: 0, fontFamily: V3_THEME.fonts.body, color: V3_THEME.colors.muted, fontSize: 36, lineHeight: 1.2 }}>
          Evidence-first commit risk demo with subtitle-safe layout and Gemini voiceover
        </p>

        <div
          style={{
            marginTop: 28,
            display: "grid",
            gap: 8,
            fontFamily: V3_THEME.fonts.mono,
            fontSize: 21,
            color: V3_THEME.colors.muted
          }}
        >
          <div>contract {truncateMiddle(VIDEO_V3_DATA.proof.contractAddress, 14, 12)}</div>
          <div>tx {truncateMiddle(VIDEO_V3_DATA.proof.txHash, 14, 12)}</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
