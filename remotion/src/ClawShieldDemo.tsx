import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig
} from "remotion";
import { scenes } from "./data";

const palette = {
  bg1: "#fff6b0",
  bg2: "#ffe6a3",
  ink: "#111",
  accent: "#f3ba2f",
  danger: "#d32f2f"
};

function SceneCard({ title, body }: { title: string; body: string }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const translateY = interpolate(frame, [0, fps], [30, 0], {
    extrapolateRight: "clamp"
  });

  const opacity = interpolate(frame, [0, fps * 0.8], [0, 1], {
    extrapolateRight: "clamp"
  });

  const scale = spring({
    fps,
    frame,
    config: { damping: 200 }
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        background: `linear-gradient(135deg, ${palette.bg1}, ${palette.bg2})`
      }}
    >
      <div
        style={{
          width: "82%",
          padding: 48,
          borderRadius: 28,
          border: "4px solid #111",
          boxShadow: "12px 12px 0 #111",
          background: "rgba(255,255,255,0.88)",
          transform: `translateY(${translateY}px) scale(${0.94 + scale * 0.06})`,
          opacity
        }}
      >
        <div style={{ fontFamily: "IBM Plex Sans, sans-serif", fontSize: 24, color: "#333" }}>
          Good Vibes Only · OpenClaw Edition
        </div>
        <h1
          style={{
            margin: "12px 0 18px",
            fontFamily: "Space Grotesk, sans-serif",
            fontSize: 74,
            lineHeight: 1,
            color: palette.ink
          }}
        >
          {title}
        </h1>
        <p
          style={{
            margin: 0,
            fontFamily: "IBM Plex Sans, sans-serif",
            fontSize: 34,
            color: "#222",
            lineHeight: 1.25
          }}
        >
          {body}
        </p>
      </div>
    </AbsoluteFill>
  );
}

const sceneText: Record<string, { title: string; body: string }> = {
  scene1: {
    title: "Skills Are Powerful. Also Dangerous.",
    body: "Malicious OpenClaw skills can hide remote execution and credential theft patterns."
  },
  scene2: {
    title: "ClawShield Security Loop",
    body: "Audit commit -> Explain risks -> Hash report -> Attest on opBNB."
  },
  scene3: {
    title: "Live Audit in 10 Seconds",
    body: "Paste repo + commit, get fingerprinted findings with green/yellow/red verdict."
  },
  scene4: {
    title: "Onchain, Verifiable, Traceable",
    body: "Contract 0x8F4a...81f9 and tx 0x7c4b...ab77 prove fingerprint + score + report hash."
  },
  scene5: {
    title: "AI Build Log Bonus Ready",
    body: "Prompt logs, screenshots, generated code snippets, and debug evidence included."
  },
  scene6: {
    title: "Judge Requirements Aligned",
    body: "Onchain proof + reproducibility + AI build log, validated by verify:all and proof:refresh."
  },
  scene7: {
    title: "Build Fast. Prove It Onchain.",
    body: "ClawShield makes skill trust measurable before installation."
  }
};

export const ClawShieldDemo: React.FC = () => {
  return (
    <AbsoluteFill>
      {scenes.map((scene) => (
        <Sequence key={scene.id} from={scene.from} durationInFrames={scene.duration}>
          <SceneCard title={sceneText[scene.id].title} body={sceneText[scene.id].body} />
        </Sequence>
      ))}

      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          alignItems: "center",
          paddingBottom: 28
        }}
      >
        <div
          style={{
            padding: "8px 18px",
            borderRadius: 999,
            border: `2px solid ${palette.ink}`,
            background: palette.accent,
            fontFamily: "IBM Plex Mono, monospace",
            fontSize: 20
          }}
        >
          ClawShield · Agent Track · opBNB Testnet
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
