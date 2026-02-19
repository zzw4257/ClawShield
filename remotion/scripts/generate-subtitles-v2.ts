import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  FPS_V2,
  TOTAL_FRAMES_V2,
  sceneForFrame,
  toSrtTimestamp,
  type SceneWindowV2
} from "../src/v2/timeline";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const remotionRoot = path.resolve(scriptDir, "..");
const projectRoot = path.resolve(remotionRoot, "..");
const outPath = path.resolve(remotionRoot, "public/subtitles/clawshield-v2.srt");

interface SubtitleCue {
  id: number;
  fromFrame: number;
  toFrame: number;
  sceneId: SceneWindowV2["id"];
  text: string;
}

function framesToMs(frame: number): number {
  return Math.round((frame / FPS_V2) * 1000);
}

function buildCues(): SubtitleCue[] {
  const cues: SubtitleCue[] = [];

  let active = sceneForFrame(0);
  let startFrame = 0;

  for (let frame = 1; frame < TOTAL_FRAMES_V2; frame += 1) {
    const now = sceneForFrame(frame);
    if (now.id !== active.id) {
      cues.push({
        id: cues.length + 1,
        fromFrame: startFrame,
        toFrame: frame,
        sceneId: active.id,
        text: active.narration
      });
      active = now;
      startFrame = frame;
    }
  }

  cues.push({
    id: cues.length + 1,
    fromFrame: startFrame,
    toFrame: TOTAL_FRAMES_V2,
    sceneId: active.id,
    text: active.narration
  });

  return cues;
}

function renderSrt(cues: SubtitleCue[]): string {
  return cues
    .map((cue) => {
      const from = toSrtTimestamp(framesToMs(cue.fromFrame));
      const to = toSrtTimestamp(framesToMs(cue.toFrame));
      return `${cue.id}\n${from} --> ${to}\n${cue.text}\n`;
    })
    .join("\n");
}

function main(): void {
  const cues = buildCues();
  const srt = renderSrt(cues);

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, `${srt}\n`, "utf8");

  const reportPath = path.resolve(remotionRoot, "public/v2/evidence/subtitles-v2.json");
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(
    reportPath,
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        fps: FPS_V2,
        durationFrames: TOTAL_FRAMES_V2,
        cueCount: cues.length,
        outPath: "remotion/public/subtitles/clawshield-v2.srt",
        cues
      },
      null,
      2
    )}\n`,
    "utf8"
  );

  console.log(`subtitles generated: ${path.relative(projectRoot, outPath)}`);
}

main();
