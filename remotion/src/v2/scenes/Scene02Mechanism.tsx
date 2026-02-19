import { useCurrentFrame } from "remotion";
import { SceneShell } from "../SceneShell";
import { V2_THEME, shortHex } from "../theme";
import { VideoV2Manifest } from "../types";

export const Scene02Mechanism = ({ data }: { data: VideoV2Manifest }) => {
  const frame = useCurrentFrame();
  const cleanCase = data.cases.find((item) => item.id === "clean_baseline") || data.cases[0];

  const steps = [
    "Input repoUrl + commitSha",
    "Deterministic rules produce score + level",
    "LLM generates explainable remediation summary",
    "Fingerprint + reportHash bind one exact commit",
    "Green-only policy decides if onchain attestation is allowed"
  ];

  return (
    <SceneShell
      frame={frame}
      kicker="Scene 2 · Core Mechanism"
      title="Audit -> Explain -> Bind -> Attest"
      subtitle="Every trust decision is traceable to one commit object and one policy boundary."
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.2fr 1fr",
          gap: 24,
          alignItems: "stretch"
        }}
      >
        <div
          style={{
            border: `1px solid ${V2_THEME.colors.panelBorder}`,
            borderRadius: 20,
            padding: 24,
            background: "rgba(10,14,20,0.82)"
          }}
        >
          {steps.map((step, index) => (
            <div key={step} style={{ display: "flex", gap: 16, marginBottom: index === steps.length - 1 ? 0 : 14 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 999,
                  background: V2_THEME.colors.accent,
                  color: "#111",
                  fontFamily: V2_THEME.fonts.mono,
                  fontWeight: 700,
                  fontSize: 18,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 3,
                  flexShrink: 0
                }}
              >
                {index + 1}
              </div>
              <p
                style={{
                  margin: 0,
                  fontFamily: V2_THEME.fonts.body,
                  fontSize: 24,
                  lineHeight: 1.35
                }}
              >
                {step}
              </p>
            </div>
          ))}
        </div>

        <div
          style={{
            border: `1px solid ${V2_THEME.colors.panelBorder}`,
            borderRadius: 20,
            padding: 24,
            background: "rgba(10,14,20,0.82)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}
        >
          <div>
            <p style={{ margin: 0, color: V2_THEME.colors.muted, fontFamily: V2_THEME.fonts.mono, fontSize: 16 }}>
              Live input example
            </p>
            <p style={{ margin: "8px 0 10px", fontFamily: V2_THEME.fonts.body, fontSize: 22, lineHeight: 1.25 }}>
              {cleanCase?.repoUrl || "N/A"}
            </p>
            <p style={{ margin: 0, fontFamily: V2_THEME.fonts.mono, fontSize: 20 }}>
              commit: {shortHex(cleanCase?.commitSha || "")}
            </p>
          </div>

          <div style={{ marginTop: 20 }}>
            <p style={{ margin: 0, color: V2_THEME.colors.muted, fontFamily: V2_THEME.fonts.mono, fontSize: 16 }}>
              Canonical proof tuple
            </p>
            <p style={{ margin: "8px 0 6px", fontFamily: V2_THEME.fonts.mono, fontSize: 20 }}>
              contract: {shortHex(data.proof.contractAddress)}
            </p>
            <p style={{ margin: 0, fontFamily: V2_THEME.fonts.mono, fontSize: 20 }}>
              tx: {shortHex(data.proof.txHash)}
            </p>
          </div>
        </div>
      </div>
    </SceneShell>
  );
};
