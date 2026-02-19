import { Img, staticFile, useCurrentFrame } from "remotion";
import { SceneShell } from "../SceneShell";
import { V2_THEME } from "../theme";
import { VideoV2Manifest } from "../types";

export const Scene05AiEvidence = ({ data }: { data: VideoV2Manifest }) => {
  const frame = useCurrentFrame();

  return (
    <SceneShell
      frame={frame}
      kicker="Scene 5 · AI Build Evidence"
      title="AI Involvement Is Traceable, Not Hand-Waved"
      subtitle="Each major decision links prompt, output, code change, and measurable result."
    >
      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 18 }}>
        <div
          style={{
            border: `1px solid ${V2_THEME.colors.panelBorder}`,
            borderRadius: 20,
            padding: 18,
            background: "rgba(8,11,16,0.86)"
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            {data.aiEvidence.screenshots.slice(0, 6).map((path) => (
              <div key={path} style={{ borderRadius: 10, overflow: "hidden", height: 142 }}>
                <Img src={staticFile(path)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            border: `1px solid ${V2_THEME.colors.panelBorder}`,
            borderRadius: 20,
            padding: 20,
            background: "rgba(8,11,16,0.86)",
            display: "grid",
            alignContent: "start",
            gap: 12
          }}
        >
          {[
            `Closed loops: ${data.aiEvidence.loops}`,
            "Evidence includes prompts, outputs, diffs, and screenshots",
            "Submission doc links are synchronized with proof references",
            "Quality controls include deterministic scoring and event verification"
          ].map((line) => (
            <p key={line} style={{ margin: 0, fontFamily: V2_THEME.fonts.body, fontSize: 23, lineHeight: 1.32 }}>
              {line}
            </p>
          ))}
          <p
            style={{
              marginTop: 6,
              fontFamily: V2_THEME.fonts.mono,
              fontSize: 15,
              color: V2_THEME.colors.muted
            }}
          >
            Source: {data.aiEvidence.evidenceIndexPath}
          </p>
        </div>
      </div>
    </SceneShell>
  );
};
