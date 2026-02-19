import { staticFile, useCurrentFrame } from "remotion";
import { SceneShell } from "../SceneShell";
import { V2_THEME } from "../theme";

export const Scene01Threat = () => {
  const frame = useCurrentFrame();

  return (
    <SceneShell
      frame={frame}
      kicker="Scene 1 · Threat Context"
      title="Trust Decisions Fail When Signals Arrive Too Late"
      subtitle="Autonomous skills can hide risky behavior behind simple install paths."
      backgroundImage={staticFile("v2/keyframes/scene-01-problem.png")}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 20
        }}
      >
        {[
          "Remote execution hidden in install command",
          "Credential access mixed with routine scripts",
          "No commit-bound evidence for user verification",
          "Decision quality depends on luck, not proof"
        ].map((item) => (
          <div
            key={item}
            style={{
              padding: "18px 20px",
              borderRadius: 16,
              border: `1px solid ${V2_THEME.colors.panelBorder}`,
              background: "rgba(11,14,20,0.82)",
              fontSize: 25,
              fontFamily: V2_THEME.fonts.body,
              lineHeight: 1.25
            }}
          >
            {item}
          </div>
        ))}
      </div>
    </SceneShell>
  );
};
