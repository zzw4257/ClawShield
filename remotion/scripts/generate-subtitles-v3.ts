import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  FPS_V3,
  TOTAL_FRAMES_V3,
  sceneForFrameV3,
  toSrtTimestamp,
  type SceneWindowV3
} from "../src/v3/timeline";
import { wrapToTwoLines } from "../src/v3/text-fit";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const remotionRoot = path.resolve(scriptDir, "..");
const projectRoot = path.resolve(remotionRoot, "..");
const outPath = path.resolve(remotionRoot, "public/subtitles/clawshield-v3.srt");

interface SubtitleCue {
  id: number;
  fromFrame: number;
  toFrame: number;
  sceneId: SceneWindowV3["id"];
  text: string;
  lines: string[];
}

function framesToMs(frame: number): number {
  return Math.round((frame / FPS_V3) * 1000);
}

function normalizeCueText(text: string): string[] {
  return wrapToTwoLines(text, 94).slice(0, 2);
}

function buildCues(): SubtitleCue[] {
  const cues: SubtitleCue[] = [];

  let active = sceneForFrameV3(0);
  let startFrame = 0;

  for (let frame = 1; frame < TOTAL_FRAMES_V3; frame += 1) {
    const now = sceneForFrameV3(frame);
    if (now.id !== active.id) {
      const lines = normalizeCueText(active.narration);
      cues.push({
        id: cues.length + 1,
        fromFrame: startFrame,
        toFrame: frame,
        sceneId: active.id,
        text: lines.join("\n"),
        lines
      });
      active = now;
      startFrame = frame;
    }
  }

  const lines = normalizeCueText(active.narration);
  cues.push({
    id: cues.length + 1,
    fromFrame: startFrame,
    toFrame: TOTAL_FRAMES_V3,
    sceneId: active.id,
    text: lines.join("\n"),
    lines
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

  const reportPath = path.resolve(remotionRoot, "public/v3/evidence/subtitles-v3.json");
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(
    reportPath,
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        fps: FPS_V3,
        durationFrames: TOTAL_FRAMES_V3,
        cueCount: cues.length,
        outPath: "remotion/public/subtitles/clawshield-v3.srt",
        maxLines: 2,
        maxCharsPerLine: 94,
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
