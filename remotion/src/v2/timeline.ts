export const FPS_V2 = 30;
export const TRANSITION_FRAMES_V2 = 6;

export type SceneIdV2 =
  | "scene1"
  | "scene2"
  | "scene3"
  | "scene4"
  | "scene5"
  | "scene6"
  | "scene7";

export interface SceneSegmentV2 {
  id: SceneIdV2;
  title: string;
  duration: number;
  narration: string;
}

export const SCENE_SEGMENTS_V2: SceneSegmentV2[] = [
  {
    id: "scene1",
    title: "Problem & Threat",
    duration: 300,
    narration:
      "OpenClaw skills move fast, but trust checks usually happen too late. Attackers hide remote execution and credential reads behind normal install instructions."
  },
  {
    id: "scene2",
    title: "Mechanism",
    duration: 390,
    narration:
      "ClawShield takes one repo and one commit, then runs deterministic scoring, AI explanation, and commit-bound hashing. The output becomes a clear allow or deny policy decision."
  },
  {
    id: "scene3",
    title: "Case Evidence",
    duration: 570,
    narration:
      "The Case Gallery proves behavior with three concrete inputs: a clean baseline, a remote execution risk, and a credential access risk. Same pipeline, different verifiable outcomes."
  },
  {
    id: "scene4",
    title: "Onchain Proof",
    duration: 480,
    narration:
      "Only green outcomes can attest on opBNB testnet. The transaction event stores fingerprint, score, report hash, repo, and commit so judges can independently verify every field."
  },
  {
    id: "scene5",
    title: "AI Build Log",
    duration: 450,
    narration:
      "AI contribution is not hand-waved. We keep prompt, output, code diff, and screenshot loops to show exactly where AI accelerated delivery and where human control stayed in place."
  },
  {
    id: "scene6",
    title: "Requirement Mapping",
    duration: 360,
    narration:
      "Competition requirements map directly to artifacts: onchain proof, reproducible case runs, and AI evidence. What we claim in docs is exactly what the product and chain report."
  },
  {
    id: "scene7",
    title: "Closing",
    duration: 150,
    narration:
      "Result: faster shipping, with auditable trust boundaries before installation."
  }
];

export interface SceneWindowV2 extends SceneSegmentV2 {
  from: number;
  to: number;
}

export function buildSceneWindowsV2(): SceneWindowV2[] {
  const out: SceneWindowV2[] = [];
  let cursor = 0;

  SCENE_SEGMENTS_V2.forEach((scene, index) => {
    const from = cursor;
    const to = from + scene.duration;
    out.push({ ...scene, from, to });

    cursor += scene.duration;
    if (index < SCENE_SEGMENTS_V2.length - 1) {
      cursor -= TRANSITION_FRAMES_V2;
    }
  });

  return out;
}

export const SCENE_WINDOWS_V2 = buildSceneWindowsV2();

export const TOTAL_FRAMES_V2 = SCENE_WINDOWS_V2[SCENE_WINDOWS_V2.length - 1].to;

export function sceneForFrame(frame: number): SceneWindowV2 {
  const item = SCENE_WINDOWS_V2.find((segment) => frame >= segment.from && frame < segment.to);
  return item || SCENE_WINDOWS_V2[SCENE_WINDOWS_V2.length - 1];
}

export function toSrtTimestamp(ms: number): string {
  const total = Math.max(0, Math.floor(ms));
  const h = Math.floor(total / 3600000);
  const m = Math.floor((total % 3600000) / 60000);
  const s = Math.floor((total % 60000) / 1000);
  const r = total % 1000;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(
    2,
    "0"
  )},${String(r).padStart(3, "0")}`;
}
