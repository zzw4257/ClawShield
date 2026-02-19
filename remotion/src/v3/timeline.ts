export const FPS_V3 = 30;
export const TRANSITION_FRAMES_V3 = 6;

export type SceneIdV3 =
  | "scene1"
  | "scene2"
  | "scene3"
  | "scene4"
  | "scene5"
  | "scene6"
  | "scene7";

export interface SceneSegmentV3 {
  id: SceneIdV3;
  title: string;
  duration: number;
  narration: string;
}

export const SCENE_SEGMENTS_V3: SceneSegmentV3[] = [
  {
    id: "scene1",
    title: "Problem & Threat",
    duration: 300,
    narration:
      "OpenClaw skills ship fast, but install-time trust checks are weak. Hidden remote execution and credential reads turn one command into a high-impact risk."
  },
  {
    id: "scene2",
    title: "Mechanism",
    duration: 390,
    narration:
      "ClawShield audits one repository commit, runs deterministic scoring, generates AI-readable guidance, then binds the outcome with fingerprint and report hash."
  },
  {
    id: "scene3",
    title: "Case Evidence",
    duration: 570,
    narration:
      "The Case Gallery shows three fixed inputs with three reproducible outputs: one green baseline and two policy-denied risk cases."
  },
  {
    id: "scene4",
    title: "Onchain Proof",
    duration: 480,
    narration:
      "For green outcomes, attestation on opBNB records score, fingerprint, report hash, repository, and commit in one verifiable event."
  },
  {
    id: "scene5",
    title: "AI Evidence",
    duration: 450,
    narration:
      "AI contribution is explicit: prompts, outputs, diffs, and screenshots are linked so judges can inspect exactly what AI changed."
  },
  {
    id: "scene6",
    title: "Judge Mapping",
    duration: 360,
    narration:
      "Submission claims map one-to-one to artifacts: onchain proof, reproducible runs, AI build evidence, and a strict human-controlled trust boundary."
  },
  {
    id: "scene7",
    title: "Closing",
    duration: 150,
    narration:
      "ClawShield turns commit risk into a fast and auditable go or no-go decision before installation."
  }
];

export interface SceneWindowV3 extends SceneSegmentV3 {
  from: number;
  to: number;
}

export function buildSceneWindowsV3(): SceneWindowV3[] {
  const windows: SceneWindowV3[] = [];
  let cursor = 0;

  SCENE_SEGMENTS_V3.forEach((scene, index) => {
    const from = cursor;
    const to = from + scene.duration;
    windows.push({ ...scene, from, to });

    cursor += scene.duration;
    if (index < SCENE_SEGMENTS_V3.length - 1) {
      cursor -= TRANSITION_FRAMES_V3;
    }
  });

  return windows;
}

export const SCENE_WINDOWS_V3 = buildSceneWindowsV3();
export const TOTAL_FRAMES_V3 = SCENE_WINDOWS_V3[SCENE_WINDOWS_V3.length - 1].to;

export function sceneForFrameV3(frame: number): SceneWindowV3 {
  const found = SCENE_WINDOWS_V3.find((segment) => frame >= segment.from && frame < segment.to);
  return found || SCENE_WINDOWS_V3[SCENE_WINDOWS_V3.length - 1];
}

export function toSrtTimestamp(ms: number): string {
  const total = Math.max(0, Math.floor(ms));
  const h = Math.floor(total / 3600000);
  const m = Math.floor((total % 3600000) / 60000);
  const s = Math.floor((total % 60000) / 1000);
  const r = total % 1000;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")},${String(r).padStart(3, "0")}`;
}
