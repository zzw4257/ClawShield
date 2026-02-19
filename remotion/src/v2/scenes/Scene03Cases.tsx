import { Img, staticFile, useCurrentFrame } from "remotion";
import { SceneShell } from "../SceneShell";
import { V2_THEME, levelColor, shortHex } from "../theme";
import { VideoV2Manifest } from "../types";

export const Scene03Cases = ({ data }: { data: VideoV2Manifest }) => {
  const frame = useCurrentFrame();

  return (
    <SceneShell
      frame={frame}
      kicker="Scene 3 · Concrete Cases"
      title="Three Inputs, Three Verifiable Outcomes"
      subtitle="Case Gallery converts abstract claims into reproducible judgment evidence."
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}>
        {data.cases.map((item) => (
          <article
            key={item.id}
            style={{
              borderRadius: 18,
              border: `1px solid ${V2_THEME.colors.panelBorder}`,
              background: "rgba(9, 12, 17, 0.85)",
              overflow: "hidden"
            }}
          >
            <div style={{ height: 190, background: "#0d1118" }}>
              <Img
                src={staticFile(item.evidence.homeImage)}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <div style={{ padding: 16 }}>
              <p
                style={{
                  margin: 0,
                  fontFamily: V2_THEME.fonts.mono,
                  fontSize: 14,
                  color: V2_THEME.colors.muted,
                  textTransform: "uppercase"
                }}
              >
                {item.id}
              </p>
              <h3 style={{ margin: "6px 0 8px", fontFamily: V2_THEME.fonts.title, fontSize: 32 }}>{item.title}</h3>

              <p style={{ margin: 0, fontFamily: V2_THEME.fonts.body, fontSize: 18, lineHeight: 1.25 }}>
                score {item.score} / {item.level}
              </p>
              <div style={{ display: "flex", gap: 8, marginTop: 8, marginBottom: 8 }}>
                {(item.dimensions.length > 0 ? item.dimensions : ["none"]).slice(0, 3).map((d) => (
                  <span
                    key={d}
                    style={{
                      borderRadius: 999,
                      padding: "3px 10px",
                      fontSize: 13,
                      fontFamily: V2_THEME.fonts.mono,
                      border: `1px solid ${levelColor(item.level)}`,
                      color: levelColor(item.level)
                    }}
                  >
                    {d}
                  </span>
                ))}
              </div>

              <p style={{ margin: 0, fontFamily: V2_THEME.fonts.mono, fontSize: 14, color: V2_THEME.colors.muted }}>
                fp {shortHex(item.fingerprint, 12, 8)}
              </p>
              <p style={{ margin: "6px 0 0", fontFamily: V2_THEME.fonts.body, fontSize: 15, lineHeight: 1.3 }}>
                attest: {item.attestOutcome} ({item.attestMessage})
              </p>
            </div>
          </article>
        ))}
      </div>
    </SceneShell>
  );
};
