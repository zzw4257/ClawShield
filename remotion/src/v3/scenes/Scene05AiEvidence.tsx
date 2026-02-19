import { Img, staticFile, useCurrentFrame } from "remotion";
import { FrameScaffoldV3 } from "../FrameScaffoldV3";
import { V3_THEME, panelStyle } from "../theme";
import type { VideoV3Manifest } from "../types";

export const Scene05AiEvidenceV3 = ({ data }: { data: VideoV3Manifest }) => {
  const frame = useCurrentFrame();

  const bullets = [
    `Closed loops: ${data.aiEvidence.loops}`,
    "Prompt -> Output -> Code -> Result trace is linked.",
    "Screenshots and diffs show visible AI contribution.",
    "Human controls policy and transaction signing boundary."
  ];

  return (
    <FrameScaffoldV3
      frame={frame}
      kicker="Scene 5 · AI Evidence Wall"
      title="AI Contribution Is Explicit And Auditable"
      subtitle="Evidence is organized for judge review instead of narrative-only claims."
      contractAddress={data.proof.contractAddress}
      txHash={data.proof.txHash}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 1480,
          display: "grid",
          gridTemplateColumns: "1.1fr 1fr",
          gap: 22,
          alignItems: "center"
        }}
      >
        <section style={{ ...panelStyle(), padding: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 10 }}>
            {data.aiEvidence.screenshots.slice(0, 6).map((src) => (
              <div key={src} style={{ height: 150, borderRadius: 10, overflow: "hidden", background: "#0D121B" }}>
                <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            ))}
          </div>
        </section>

        <section
          style={{
            ...panelStyle(),
            padding: "20px 20px 18px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            minHeight: 500
          }}
        >
          {bullets.map((line) => (
            <p key={line} style={{ margin: "0 0 14px", fontSize: 24, lineHeight: 1.25 }}>
              {line}
            </p>
          ))}
          <p style={{ margin: 0, color: V3_THEME.colors.muted, fontFamily: V3_THEME.fonts.mono, fontSize: 15 }}>
            Index: {data.aiEvidence.evidenceIndexPath}
          </p>
        </section>
      </div>
    </FrameScaffoldV3>
  );
};
