import { useCurrentFrame } from "remotion";
import { FrameScaffoldV3 } from "../FrameScaffoldV3";
import { V3_THEME, panelStyle } from "../theme";
import type { VideoV3Manifest } from "../types";
import { truncateMiddle } from "../text-fit";

export const Scene06JudgeMapV3 = ({ data }: { data: VideoV3Manifest }) => {
  const frame = useCurrentFrame();

  const rows = [
    {
      requirement: "Onchain proof",
      evidence: `${truncateMiddle(data.proof.contractAddress)} + ${truncateMiddle(data.proof.txHash)}`,
      status: "PASS"
    },
    {
      requirement: "Reproducible cases",
      evidence: "3 locked repo+commit inputs in case registry",
      status: "PASS"
    },
    {
      requirement: "AI bonus",
      evidence: `${data.aiEvidence.loops} closed loops with screenshots and diffs`,
      status: "PASS"
    },
    {
      requirement: "Safety boundary",
      evidence: "AI explains only; policy gate decides attestation",
      status: "PASS"
    }
  ];

  return (
    <FrameScaffoldV3
      frame={frame}
      kicker="Scene 6 · Judge Mapping"
      title="Every Claim Maps To A Verifiable Artifact"
      subtitle="Submission text, product behavior, and chain records are synchronized to one source of truth."
      contractAddress={data.proof.contractAddress}
      txHash={data.proof.txHash}
    >
      <section
        style={{
          ...panelStyle(),
          width: "100%",
          maxWidth: 1500,
          overflow: "hidden"
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.25fr 130px",
            padding: "12px 16px",
            borderBottom: `1px solid ${V3_THEME.colors.panelBorder}`,
            color: V3_THEME.colors.muted,
            fontFamily: V3_THEME.fonts.mono,
            fontSize: 15,
            textTransform: "uppercase"
          }}
        >
          <div>Requirement</div>
          <div>Evidence</div>
          <div>Status</div>
        </div>

        {rows.map((row) => (
          <div
            key={row.requirement}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1.25fr 130px",
              padding: "14px 16px",
              borderBottom: `1px solid ${V3_THEME.colors.panelBorderSoft}`
            }}
          >
            <div style={{ fontSize: 24, lineHeight: 1.2 }}>{row.requirement}</div>
            <div style={{ fontSize: 20, color: V3_THEME.colors.muted, lineHeight: 1.24 }}>{row.evidence}</div>
            <div style={{ fontFamily: V3_THEME.fonts.mono, fontSize: 20, color: V3_THEME.colors.green, fontWeight: 700 }}>
              {row.status}
            </div>
          </div>
        ))}
      </section>
    </FrameScaffoldV3>
  );
};
