import { staticFile, useCurrentFrame } from "remotion";
import { FrameScaffoldV3 } from "../FrameScaffoldV3";
import { V3_THEME, panelStyle } from "../theme";
import type { VideoV3Manifest } from "../types";

export const Scene07ClosingV3 = ({ data }: { data: VideoV3Manifest }) => {
  const frame = useCurrentFrame();

  return (
    <FrameScaffoldV3
      frame={frame}
      kicker="Scene 7 · Closing"
      title="Build Fast. Prove Trust Before Install."
      subtitle="Risk denial is not failure. It is an explicit and auditable safety outcome."
      backgroundImage={staticFile("v3/keyframes/scene-04-hero.png")}
      contractAddress={data.proof.contractAddress}
      txHash={data.proof.txHash}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 1460,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 18,
          marginTop: -24
        }}
      >
        <section style={{ ...panelStyle(), padding: "18px 20px", minHeight: 178 }}>
          <p style={{ margin: 0, fontFamily: V3_THEME.fonts.mono, fontSize: 15, color: V3_THEME.colors.muted }}>
            Public proof URL
          </p>
          <p style={{ margin: "10px 0 0", fontSize: 24, lineHeight: 1.22 }}>{data.proof.txExplorer}</p>
        </section>

        <section style={{ ...panelStyle(), padding: "18px 20px", minHeight: 178 }}>
          <p style={{ margin: 0, fontFamily: V3_THEME.fonts.mono, fontSize: 15, color: V3_THEME.colors.muted }}>
            Agent boundary
          </p>
          <p style={{ margin: "10px 0 0", fontSize: 24, lineHeight: 1.22 }}>
            AI drafts explanations, deterministic policy decides verdict, and operator wallet controls signing.
          </p>
        </section>
      </div>
    </FrameScaffoldV3>
  );
};
