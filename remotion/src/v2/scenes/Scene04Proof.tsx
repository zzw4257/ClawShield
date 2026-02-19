import { Img, staticFile, useCurrentFrame } from "remotion";
import { SceneShell } from "../SceneShell";
import { V2_THEME, shortHex } from "../theme";
import { VideoV2Manifest } from "../types";

export const Scene04Proof = ({ data }: { data: VideoV2Manifest }) => {
  const frame = useCurrentFrame();
  const event = data.event;
  const cleanCase = data.cases.find((item) => item.id === "clean_baseline") || data.cases[0];

  return (
    <SceneShell
      frame={frame}
      kicker="Scene 4 · Onchain Proof"
      title="Attestation Facts Are Publicly Verifiable"
      subtitle="Fingerprint, score, report hash, repo, and commit are all queryable via tx event decode."
      backgroundImage={staticFile("v2/keyframes/scene-03-onchain-proof.png")}
    >
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 20 }}>
        <div
          style={{
            border: `1px solid ${V2_THEME.colors.panelBorder}`,
            borderRadius: 20,
            background: "rgba(8, 11, 16, 0.86)",
            overflow: "hidden"
          }}
        >
          <div style={{ height: 230 }}>
            <Img
              src={staticFile(cleanCase?.evidence.fingerprintImage || "v2/cases/clean_baseline/fingerprint.png")}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
          <div style={{ padding: 18 }}>
            <p style={{ margin: 0, fontFamily: V2_THEME.fonts.mono, fontSize: 16, color: V2_THEME.colors.muted }}>
              contract
            </p>
            <p style={{ margin: "4px 0 8px", fontFamily: V2_THEME.fonts.mono, fontSize: 20 }}>
              {data.proof.contractAddress}
            </p>
            <p style={{ margin: 0, fontFamily: V2_THEME.fonts.mono, fontSize: 16, color: V2_THEME.colors.muted }}>
              tx
            </p>
            <p style={{ margin: "4px 0 0", fontFamily: V2_THEME.fonts.mono, fontSize: 20 }}>
              {data.proof.txHash}
            </p>
          </div>
        </div>

        <div
          style={{
            border: `1px solid ${V2_THEME.colors.panelBorder}`,
            borderRadius: 20,
            background: "rgba(8, 11, 16, 0.86)",
            padding: 18,
            display: "grid",
            gap: 12,
            alignContent: "start"
          }}
        >
          {[
            ["fingerprint", shortHex(event.fingerprint, 14, 10)],
            ["score", String(event.score)],
            ["reportHash", shortHex(event.reportHash, 14, 10)],
            ["attester", shortHex(event.attester, 12, 8)],
            ["repo", event.repo],
            ["commit", shortHex(event.commit, 12, 8)]
          ].map(([label, value]) => (
            <div key={label as string}>
              <p
                style={{
                  margin: 0,
                  fontFamily: V2_THEME.fonts.mono,
                  fontSize: 14,
                  color: V2_THEME.colors.muted,
                  textTransform: "uppercase"
                }}
              >
                {label}
              </p>
              <p style={{ margin: "3px 0 0", fontFamily: V2_THEME.fonts.body, fontSize: 20, lineHeight: 1.25 }}>
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </SceneShell>
  );
};
