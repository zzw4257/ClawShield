import { Img, staticFile, useCurrentFrame } from "remotion";
import { FrameScaffoldV3 } from "../FrameScaffoldV3";
import { V3_THEME, panelStyle } from "../theme";
import type { VideoV3Manifest } from "../types";
import { truncateMiddle } from "../text-fit";

export const Scene04ProofV3 = ({ data }: { data: VideoV3Manifest }) => {
  const frame = useCurrentFrame();
  const event = data.event;
  const cleanCase = data.cases.find((item) => item.id === "clean_baseline") || data.cases[0];

  const rows: Array<[string, string]> = [
    ["fingerprint", truncateMiddle(event.fingerprint, 14, 10)],
    ["score", String(event.score)],
    ["report hash", truncateMiddle(event.reportHash, 14, 10)],
    ["attester", truncateMiddle(event.attester, 14, 8)],
    ["repo", truncateMiddle(event.repo, 25, 14)],
    ["commit", truncateMiddle(event.commit, 14, 10)]
  ];

  return (
    <FrameScaffoldV3
      frame={frame}
      kicker="Scene 4 · Onchain Evidence"
      title="Event Decode Confirms Commit-Bound Attestation"
      subtitle="Judges can independently match UI results with contract event fields on explorer."
      backgroundImage={staticFile("v3/keyframes/scene-03-onchain-proof.png")}
      contractAddress={data.proof.contractAddress}
      txHash={data.proof.txHash}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 1480,
          display: "grid",
          gridTemplateColumns: "1.18fr 1fr",
          gap: 22,
          alignItems: "stretch"
        }}
      >
        <section style={{ ...panelStyle(), overflow: "hidden", display: "grid", gridTemplateRows: "252px 1fr" }}>
          <div style={{ background: "#0D121B" }}>
            <Img
              src={staticFile(cleanCase?.evidence.fingerprintImage || "v3/cases/clean_baseline/fingerprint.png")}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
          <div style={{ padding: "16px 18px 14px" }}>
            <p style={{ margin: 0, color: V3_THEME.colors.muted, fontFamily: V3_THEME.fonts.mono, fontSize: 14 }}>
              contract
            </p>
            <p style={{ margin: "4px 0 8px", fontFamily: V3_THEME.fonts.mono, fontSize: 18 }}>{data.proof.contractAddress}</p>
            <p style={{ margin: 0, color: V3_THEME.colors.muted, fontFamily: V3_THEME.fonts.mono, fontSize: 14 }}>
              tx
            </p>
            <p style={{ margin: "4px 0 0", fontFamily: V3_THEME.fonts.mono, fontSize: 18 }}>{data.proof.txHash}</p>
          </div>
        </section>

        <section style={{ ...panelStyle(), padding: "18px 18px 16px", display: "grid", alignContent: "center", gap: 10 }}>
          {rows.map(([label, value]) => (
            <div key={label}>
              <p
                style={{
                  margin: 0,
                  fontFamily: V3_THEME.fonts.mono,
                  fontSize: 13,
                  color: V3_THEME.colors.muted,
                  textTransform: "uppercase",
                  letterSpacing: 0.7
                }}
              >
                {label}
              </p>
              <p style={{ margin: "4px 0 0", fontSize: 21, lineHeight: 1.2 }}>{value || "N/A"}</p>
            </div>
          ))}
        </section>
      </div>
    </FrameScaffoldV3>
  );
};
