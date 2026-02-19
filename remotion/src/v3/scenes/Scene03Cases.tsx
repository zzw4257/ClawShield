import { Img, staticFile, useCurrentFrame } from "remotion";
import { FrameScaffoldV3 } from "../FrameScaffoldV3";
import { V3_THEME, levelColor, panelStyle } from "../theme";
import type { VideoV3Manifest } from "../types";
import { truncateMiddle } from "../text-fit";

export const Scene03CasesV3 = ({ data }: { data: VideoV3Manifest }) => {
  const frame = useCurrentFrame();

  return (
    <FrameScaffoldV3
      frame={frame}
      kicker="Scene 3 · Case Gallery"
      title="Three Inputs. Three Concrete Outcomes."
      subtitle="A green baseline gets attested; risk cases are denied by policy and still become valid proof."
      contractAddress={data.proof.contractAddress}
      txHash={data.proof.txHash}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 1540,
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 20,
          alignItems: "stretch"
        }}
      >
        {data.cases.map((item) => (
          <article
            key={item.id}
            style={{
              ...panelStyle(),
              minHeight: 500,
              overflow: "hidden",
              display: "grid",
              gridTemplateRows: "180px 1fr"
            }}
          >
            <div style={{ background: "#0D121B" }}>
              <Img src={staticFile(item.evidence.homeImage)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>

            <div style={{ padding: "16px 18px 14px", display: "grid", gridTemplateRows: "auto auto auto auto auto" }}>
              <p
                style={{
                  margin: 0,
                  fontFamily: V3_THEME.fonts.mono,
                  color: V3_THEME.colors.muted,
                  fontSize: 13,
                  textTransform: "uppercase",
                  letterSpacing: 0.8
                }}
              >
                {item.id}
              </p>

              <h3
                style={{
                  margin: "6px 0 8px",
                  fontFamily: V3_THEME.fonts.title,
                  fontSize: 31,
                  lineHeight: 1
                }}
              >
                {item.title}
              </h3>

              <p style={{ margin: 0, fontSize: 20, lineHeight: 1.2 }}>
                score <strong>{item.score}</strong> / <span style={{ color: levelColor(item.level) }}>{item.level}</span>
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 8 }}>
                {(item.dimensions.length > 0 ? item.dimensions : ["none"]).slice(0, 3).map((dimension) => (
                  <span
                    key={`${item.id}-${dimension}`}
                    style={{
                      borderRadius: 999,
                      border: `1px solid ${levelColor(item.level)}`,
                      color: levelColor(item.level),
                      padding: "2px 8px",
                      fontFamily: V3_THEME.fonts.mono,
                      fontSize: 12
                    }}
                  >
                    {dimension}
                  </span>
                ))}
              </div>

              <div style={{ marginTop: 10 }}>
                <p style={{ margin: 0, fontFamily: V3_THEME.fonts.mono, fontSize: 12, color: V3_THEME.colors.muted }}>
                  fp {truncateMiddle(item.fingerprint, 11, 9)}
                </p>
                <p style={{ margin: "6px 0 0", fontSize: 16, lineHeight: 1.26 }}>
                  attest: <strong>{item.attestOutcome}</strong> · {item.attestOutcome === "allowed" ? "tx confirmed" : "policy deny"}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </FrameScaffoldV3>
  );
};
