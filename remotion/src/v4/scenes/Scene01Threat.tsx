import { Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { FrameScaffoldV3 } from "../../v3/FrameScaffoldV3";
import { V3_THEME, panelStyle } from "../../v3/theme";
import type { VideoV3Manifest } from "../../v3/types";
import { clampText } from "../../v3/text-fit";

export const Scene01ThreatV4 = ({ data }: { data: VideoV3Manifest }) => {
  const frame = useCurrentFrame();
  const introFrames = 108;
  const keyframes = data.aiEvidence.keyframes.length > 0
    ? data.aiEvidence.keyframes
    : ["v3/keyframes/scene-01-problem.png", "v3/keyframes/scene-02-scan.png", "v3/keyframes/scene-03-onchain-proof.png"];
  const introSlides = keyframes.slice(0, 3);
  const contentOpacity = interpolate(frame, [introFrames - 24, introFrames + 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp"
  });

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
      <>
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: interpolate(frame, [0, introFrames - 10, introFrames + 10], [1, 1, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp"
            }),
            pointerEvents: "none"
          }}
        >
          {introSlides.map((slide, index) => {
            const start = index * 32;
            const end = start + 52;
            const opacity = interpolate(frame, [start, start + 9, end - 9, end], [0, 1, 1, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp"
            });
            const translateY = interpolate(frame, [start, end], [20, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp"
            });
            const scale = interpolate(frame, [start, end], [1.05, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp"
            });

            return (
              <div
                key={`${slide}-${index}`}
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  width: 1220,
                  height: 430,
                  borderRadius: 24,
                  overflow: "hidden",
                  border: `1px solid ${V3_THEME.colors.panelBorder}`,
                  boxShadow: "0 28px 72px rgba(0,0,0,0.5)",
                  transform: `translate(-50%, -50%) translateY(${translateY}px) scale(${scale})`,
                  opacity
                }}
              >
                <Img src={staticFile(slide)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(180deg, rgba(5,8,15,0.08) 0%, rgba(5,8,15,0.68) 100%)"
                  }}
                />
              </div>
            );
          })}

          <div
            style={{
              position: "absolute",
              left: "50%",
              bottom: 34,
              transform: "translateX(-50%)",
              padding: "10px 18px",
              borderRadius: 999,
              border: `1px solid ${V3_THEME.colors.panelBorder}`,
              background: "rgba(6,10,17,0.76)",
              fontFamily: V3_THEME.fonts.mono,
              fontSize: 16,
              letterSpacing: 0.4,
              color: V3_THEME.colors.accent
            }}
          >
            Vibe Intro: threat snapshots -&gt; evidence-grade verdict
          </div>
        </div>

        <div
          style={{
            width: "100%",
            maxWidth: 1460,
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 22,
            alignItems: "stretch",
            opacity: contentOpacity
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
      </>
    </FrameScaffoldV3>
  );
};
