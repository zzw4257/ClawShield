import { useCurrentFrame } from "remotion";
import { FrameScaffoldV3 } from "../FrameScaffoldV3";
import { V3_THEME, panelStyle } from "../theme";
import type { VideoV3Manifest } from "../types";
import { truncateMiddle } from "../text-fit";

export const Scene02MechanismV3 = ({ data }: { data: VideoV3Manifest }) => {
  const frame = useCurrentFrame();
  const cleanCase = data.cases.find((item) => item.id === "clean_baseline") || data.cases[0];

  const steps = [
    "Pin repo URL and commit SHA as immutable input.",
    "Run deterministic rules to compute score and risk level.",
    "Generate AI explanation for human-readable remediation.",
    "Bind output with fingerprint and report hash.",
    "Allow onchain attestation only for green outcomes."
  ];

  return (
    <FrameScaffoldV3
      frame={frame}
      kicker="Scene 2 · Mechanism"
      title="Audit -> Explain -> Bind -> Policy Action"
      subtitle="The pipeline is deterministic at decision time and explicit at AI and signer boundaries."
      contractAddress={data.proof.contractAddress}
      txHash={data.proof.txHash}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 1460,
          display: "grid",
          gridTemplateColumns: "3fr 2fr",
          gap: 24,
          alignItems: "stretch"
        }}
      >
        <section style={{ ...panelStyle(), padding: "24px 24px 20px" }}>
          {steps.map((step, index) => (
            <div
              key={step}
              style={{
                display: "grid",
                gridTemplateColumns: "40px 1fr",
                alignItems: "start",
                gap: 14,
                marginBottom: index === steps.length - 1 ? 0 : 14
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 999,
                  background: V3_THEME.colors.accent,
                  color: "#111",
                  fontFamily: V3_THEME.fonts.mono,
                  fontSize: 18,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 2
                }}
              >
                {index + 1}
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: 24,
                  lineHeight: 1.26,
                  color: index === 4 ? V3_THEME.colors.accent : V3_THEME.colors.text
                }}
              >
                {step}
              </p>
            </div>
          ))}
        </section>

        <section
          style={{
            ...panelStyle(),
            padding: "24px 24px 20px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 20
          }}
        >
          <div>
            <p style={{ margin: 0, color: V3_THEME.colors.muted, fontFamily: V3_THEME.fonts.mono, fontSize: 16 }}>
              Input tuple
            </p>
            <p style={{ margin: "8px 0 6px", fontSize: 22, lineHeight: 1.25 }}>
              {cleanCase?.repoUrl || "Case input unavailable"}
            </p>
            <p style={{ margin: 0, fontFamily: V3_THEME.fonts.mono, fontSize: 19 }}>
              commit {truncateMiddle(cleanCase?.commitSha || "", 14, 10)}
            </p>
          </div>

          <div>
            <p style={{ margin: 0, color: V3_THEME.colors.muted, fontFamily: V3_THEME.fonts.mono, fontSize: 16 }}>
              Canonical proof tuple
            </p>
            <p style={{ margin: "8px 0 6px", fontFamily: V3_THEME.fonts.mono, fontSize: 19 }}>
              contract {truncateMiddle(data.proof.contractAddress, 14, 10)}
            </p>
            <p style={{ margin: 0, fontFamily: V3_THEME.fonts.mono, fontSize: 19 }}>
              tx {truncateMiddle(data.proof.txHash, 14, 10)}
            </p>
          </div>
        </section>
      </div>
    </FrameScaffoldV3>
  );
};
