import { useCurrentFrame } from "remotion";
import { SceneShell } from "../SceneShell";
import { V2_THEME, shortHex } from "../theme";
import { VideoV2Manifest } from "../types";

export const Scene06JudgeMap = ({ data }: { data: VideoV2Manifest }) => {
  const frame = useCurrentFrame();

  const rows = [
    {
      requirement: "Onchain proof",
      evidence: `${shortHex(data.proof.contractAddress)} + ${shortHex(data.proof.txHash)}`,
      status: "PASS"
    },
    {
      requirement: "Reproducible inputs",
      evidence: "3 locked cases with fixed repo+commit",
      status: "PASS"
    },
    {
      requirement: "AI Build Log bonus",
      evidence: `${data.aiEvidence.loops} closed loops + screenshots`,
      status: "PASS"
    },
    {
      requirement: "Safety boundary",
      evidence: "AI explains only; green-only policy controls attestation",
      status: "PASS"
    }
  ];

  return (
    <SceneShell
      frame={frame}
      kicker="Scene 6 · Judge Mapping"
      title="Requirements Mapped To Verifiable Artifacts"
      subtitle="The video narrative, docs, and onchain facts point to one consistent proof set."
    >
      <div
        style={{
          border: `1px solid ${V2_THEME.colors.panelBorder}`,
          borderRadius: 20,
          overflow: "hidden",
          background: "rgba(8,11,16,0.86)"
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.2fr 140px",
            padding: "14px 18px",
            borderBottom: `1px solid ${V2_THEME.colors.panelBorder}`,
            fontFamily: V2_THEME.fonts.mono,
            fontSize: 16,
            color: V2_THEME.colors.muted,
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
              gridTemplateColumns: "1fr 1.2fr 140px",
              padding: "16px 18px",
              borderBottom: `1px solid rgba(243,186,47,0.16)`
            }}
          >
            <div style={{ fontFamily: V2_THEME.fonts.body, fontSize: 24 }}>{row.requirement}</div>
            <div style={{ fontFamily: V2_THEME.fonts.body, fontSize: 20, color: V2_THEME.colors.muted }}>
              {row.evidence}
            </div>
            <div
              style={{
                fontFamily: V2_THEME.fonts.mono,
                fontSize: 20,
                color: V2_THEME.colors.green,
                fontWeight: 700
              }}
            >
              {row.status}
            </div>
          </div>
        ))}
      </div>
    </SceneShell>
  );
};
