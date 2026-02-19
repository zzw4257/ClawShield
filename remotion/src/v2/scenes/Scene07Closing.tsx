import { staticFile, useCurrentFrame } from "remotion";
import { SceneShell } from "../SceneShell";
import { V2_THEME } from "../theme";
import { VideoV2Manifest } from "../types";

export const Scene07Closing = ({ data }: { data: VideoV2Manifest }) => {
  const frame = useCurrentFrame();

  return (
    <SceneShell
      frame={frame}
      kicker="Scene 7 · Closing"
      title="Build Fast. Prove Trust Onchain."
      subtitle="ClawShield turns risky uncertainty into auditable go/no-go decisions for skill installation."
      backgroundImage={staticFile("v2/keyframes/scene-04-hero.png")}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16
        }}
      >
        <div
          style={{
            border: `1px solid ${V2_THEME.colors.panelBorder}`,
            borderRadius: 18,
            background: "rgba(8,11,16,0.88)",
            padding: 18
          }}
        >
          <p style={{ margin: 0, fontFamily: V2_THEME.fonts.mono, color: V2_THEME.colors.muted, fontSize: 16 }}>
            Public proof
          </p>
          <p style={{ margin: "6px 0 0", fontFamily: V2_THEME.fonts.body, fontSize: 24 }}>{data.proof.txExplorer}</p>
        </div>

        <div
          style={{
            border: `1px solid ${V2_THEME.colors.panelBorder}`,
            borderRadius: 18,
            background: "rgba(8,11,16,0.88)",
            padding: 18
          }}
        >
          <p style={{ margin: 0, fontFamily: V2_THEME.fonts.mono, color: V2_THEME.colors.muted, fontSize: 16 }}>
            Product boundary
          </p>
          <p style={{ margin: "6px 0 0", fontFamily: V2_THEME.fonts.body, fontSize: 24 }}>
            Non-green reports are intentionally denied and preserved as evidence.
          </p>
        </div>
      </div>
    </SceneShell>
  );
};
