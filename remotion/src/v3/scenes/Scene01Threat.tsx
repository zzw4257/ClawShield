import { staticFile, useCurrentFrame } from "remotion";
import { FrameScaffoldV3 } from "../FrameScaffoldV3";
import { V3_THEME, panelStyle } from "../theme";
import type { VideoV3Manifest } from "../types";
import { clampText } from "../text-fit";

export const Scene01ThreatV3 = ({ data }: { data: VideoV3Manifest }) => {
  const frame = useCurrentFrame();

  const cards = [
    {
      title: "Hidden Remote Execution",
      detail: "Install commands can fetch and execute mutable remote scripts with no integrity lock."
    },
    {
      title: "Credential Surface Expansion",
      detail: "Build scripts may touch secrets and tokens beyond the stated function boundary."
    },
    {
      title: "No Commit-Bound Trace",
      detail: "Without fingerprint + report hash, judges cannot verify exactly what was reviewed."
    },
    {
      title: "Decision Drift",
      detail: "Human trust decisions become inconsistent when evidence is incomplete or delayed."
    }
  ];

  return (
    <FrameScaffoldV3
      frame={frame}
      kicker="Scene 1 · Threat Context"
      title="Trust Decisions Break When Signals Arrive Too Late"
      subtitle="ClawShield moves risk evidence to install-time, before a dangerous command executes."
      backgroundImage={staticFile("v3/keyframes/scene-01-problem.png")}
      contractAddress={data.proof.contractAddress}
      txHash={data.proof.txHash}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 1460,
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 22,
          alignItems: "stretch"
        }}
      >
        {cards.map((card) => (
          <article
            key={card.title}
            style={{
              ...panelStyle(),
              minHeight: 220,
              padding: "24px 26px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center"
            }}
          >
            <h3
              style={{
                margin: 0,
                fontFamily: V3_THEME.fonts.title,
                fontSize: 36,
                lineHeight: 1.05,
                letterSpacing: -0.3
              }}
            >
              {card.title}
            </h3>
            <p
              style={{
                margin: "14px 0 0",
                color: V3_THEME.colors.muted,
                fontSize: 24,
                lineHeight: 1.24
              }}
            >
              {clampText(card.detail, 95)}
            </p>
          </article>
        ))}
      </div>
    </FrameScaffoldV3>
  );
};
