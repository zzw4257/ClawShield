import { AbsoluteFill } from "remotion";

export const Cover: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(120deg, #fff6b0, #f3ba2f)",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Space Grotesk, sans-serif",
        color: "#111"
      }}
    >
      <div
        style={{
          border: "4px solid #111",
          borderRadius: 28,
          boxShadow: "14px 14px 0 #111",
          background: "#fff",
          padding: 60,
          textAlign: "center"
        }}
      >
        <div style={{ fontSize: 32, marginBottom: 20 }}>BNB Chain Good Vibes Only</div>
        <div style={{ fontSize: 88, lineHeight: 0.95 }}>ClawShield</div>
        <div style={{ fontSize: 28, marginTop: 20 }}>AI Skill Audit to Onchain Attestation</div>
      </div>
    </AbsoluteFill>
  );
};
