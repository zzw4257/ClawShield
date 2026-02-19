import { AbsoluteFill, staticFile, Img } from "remotion";
import { VIDEO_V2_DATA } from "./v2/generated";
import { V2_THEME, shortHex } from "./v2/theme";

export const CoverV2 = () => {
  return (
    <AbsoluteFill
      style={{
        background: "radial-gradient(circle at 20% 20%, #1b2230 0%, #090d14 48%, #04060a 100%)",
        color: V2_THEME.colors.text,
        fontFamily: V2_THEME.fonts.title
      }}
    >
      <AbsoluteFill style={{ opacity: 0.28 }}>
        <Img src={staticFile("v2/keyframes/scene-04-hero.png")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>

      <div
        style={{
          margin: 100,
          borderRadius: 28,
          border: `1px solid ${V2_THEME.colors.panelBorder}`,
          background: "rgba(7,10,15,0.84)",
          boxShadow: V2_THEME.shadow,
          padding: 48
        }}
      >
        <p style={{ margin: 0, color: V2_THEME.colors.accent, fontFamily: V2_THEME.fonts.mono, fontSize: 22 }}>
          BNB Chain Good Vibes Only · Agent Track
        </p>
        <h1 style={{ margin: "14px 0 10px", fontSize: 92, lineHeight: 0.92 }}>ClawShield v2</h1>
        <p style={{ margin: 0, fontFamily: V2_THEME.fonts.body, color: V2_THEME.colors.muted, fontSize: 34 }}>
          Evidence-first commit security demo with onchain attestation proof
        </p>

        <div style={{ marginTop: 26, fontFamily: V2_THEME.fonts.mono, fontSize: 20, color: V2_THEME.colors.muted }}>
          contract {shortHex(VIDEO_V2_DATA.proof.contractAddress, 12, 10)} · tx {shortHex(VIDEO_V2_DATA.proof.txHash, 12, 10)}
        </div>
      </div>
    </AbsoluteFill>
  );
};
