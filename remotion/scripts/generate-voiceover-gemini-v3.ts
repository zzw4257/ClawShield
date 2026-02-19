import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import * as dotenv from "dotenv";
import { FPS_V3, TOTAL_FRAMES_V3, sceneForFrameV3 } from "../src/v3/timeline";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const remotionRoot = path.resolve(scriptDir, "..");
const projectRoot = path.resolve(remotionRoot, "..");

dotenv.config({ path: path.resolve(projectRoot, ".env") });
dotenv.config();

const outAudioPath = path.resolve(remotionRoot, "public/v3/audio/clawshield-voiceover-v3.mp3");
const outMetaPath = path.resolve(remotionRoot, "public/v3/audio/voiceover-v3.meta.json");
const outTranscriptPath = path.resolve(remotionRoot, "public/v3/audio/clawshield-voiceover-v3.txt");
const segmentsDir = path.resolve(remotionRoot, "public/v3/audio/segments");
const tempDir = path.resolve(remotionRoot, ".tmp");

const compositorBinDir = path.resolve(projectRoot, "node_modules/@remotion/compositor-darwin-arm64");
const ffmpegBin = fs.existsSync(path.resolve(compositorBinDir, "ffmpeg"))
  ? path.resolve(compositorBinDir, "ffmpeg")
  : "ffmpeg";
const compositorEnv =
  ffmpegBin === "ffmpeg"
    ? undefined
    : {
        DYLD_LIBRARY_PATH: [compositorBinDir, process.env.DYLD_LIBRARY_PATH || ""]
          .filter(Boolean)
          .join(":")
      };

interface GeminiAudioResult {
  ok: boolean;
  provider: "gemini";
  model: string;
  voice: string;
  mimeType: string;
  outputPath: string;
  inferredDurationSec?: number;
  reason?: string;
}

interface ScenePlan {
  id: string;
  narration: string;
  fromFrame: number;
  toFrame: number;
  targetDurationSec: number;
}

interface SceneAudioSummary {
  id: string;
  model: string;
  voice: string;
  mimeType: string;
  sourceDurationSec: number;
  targetDurationSec: number;
  durationDeltaSec: number;
  outputPath: string;
}

function runCommand(
  command: string,
  args: string[],
  cwd: string,
  timeoutMs?: number,
  extraEnv?: NodeJS.ProcessEnv
): { ok: boolean; stdout: string; stderr: string; timedOut: boolean } {
  const run = spawnSync(command, args, {
    cwd,
    env: {
      ...process.env,
      ...(extraEnv || {})
    },
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    timeout: timeoutMs,
    maxBuffer: 32 * 1024 * 1024
  });

  const timedOut = Boolean(run.error && "code" in run.error && run.error.code === "ETIMEDOUT");

  return {
    ok: run.status === 0 && !timedOut,
    stdout: run.stdout || "",
    stderr: run.stderr || "",
    timedOut
  };
}

function postJsonWithCurl(url: string, body: unknown): { ok: boolean; status: number; body: string; error?: string } {
  fs.mkdirSync(tempDir, { recursive: true });
  const requestPath = path.resolve(tempDir, "gemini-tts-request.json");
  fs.writeFileSync(requestPath, JSON.stringify(body), "utf8");

  const run = runCommand(
    "curl",
    [
      "-sS",
      "--connect-timeout",
      "20",
      "--max-time",
      "240",
      "-H",
      "Content-Type: application/json",
      "--data-binary",
      `@${requestPath}`,
      url,
      "-w",
      "\\nHTTP_STATUS:%{http_code}"
    ],
    projectRoot,
    250000
  );

  if (!run.ok) {
    return {
      ok: false,
      status: 0,
      body: run.stdout,
      error: run.timedOut ? "curl timed out after 250s" : run.stderr || "curl failed"
    };
  }

  const marker = "HTTP_STATUS:";
  const markerIndex = run.stdout.lastIndexOf(marker);
  if (markerIndex === -1) {
    return {
      ok: false,
      status: 0,
      body: run.stdout,
      error: "cannot parse HTTP status from curl output"
    };
  }

  const bodyText = run.stdout.slice(0, markerIndex).trim();
  const statusRaw = run.stdout.slice(markerIndex + marker.length).trim();
  const status = Number(statusRaw);

  return {
    ok: Number.isFinite(status) && status >= 200 && status < 300,
    status: Number.isFinite(status) ? status : 0,
    body: bodyText
  };
}

function buildScenePlans(): ScenePlan[] {
  const plans: ScenePlan[] = [];
  let active = sceneForFrameV3(0);
  let startFrame = 0;

  for (let frame = 1; frame < TOTAL_FRAMES_V3; frame += 1) {
    const now = sceneForFrameV3(frame);
    if (now.id !== active.id) {
      plans.push({
        id: active.id,
        narration: active.narration,
        fromFrame: startFrame,
        toFrame: frame,
        targetDurationSec: Number(((frame - startFrame) / FPS_V3).toFixed(3))
      });
      active = now;
      startFrame = frame;
    }
  }

  plans.push({
    id: active.id,
    narration: active.narration,
    fromFrame: startFrame,
    toFrame: TOTAL_FRAMES_V3,
    targetDurationSec: Number(((TOTAL_FRAMES_V3 - startFrame) / FPS_V3).toFixed(3))
  });

  return plans;
}

function buildNarrationText(plans: ScenePlan[]): string {
  return plans.map((scene, index) => `Scene ${index + 1} (${scene.id}, ${scene.targetDurationSec}s): ${scene.narration}`).join("\n\n");
}

function buildAtempoFilter(targetFactor: number): string {
  const factors: number[] = [];
  let value = targetFactor;

  while (value < 0.5) {
    factors.push(0.5);
    value /= 0.5;
  }

  while (value > 2) {
    factors.push(2);
    value /= 2;
  }

  factors.push(value);
  return factors.map((item) => `atempo=${item.toFixed(5)}`).join(",");
}

function inferPcmDurationSec(buffer: Buffer, mimeType: string): number | null {
  const normalized = mimeType.toLowerCase();
  if (!normalized.includes("pcm") && !normalized.includes("l16")) {
    return null;
  }

  const rateMatch = normalized.match(/rate=(\d+)/);
  const sampleRate = rateMatch ? Number(rateMatch[1]) : 24000;
  if (!Number.isFinite(sampleRate) || sampleRate <= 0) {
    return null;
  }

  const channelMatch = normalized.match(/channels=(\d+)/) || normalized.match(/channel_count=(\d+)/);
  const channels = channelMatch ? Number(channelMatch[1]) : 1;
  if (!Number.isFinite(channels) || channels <= 0) {
    return null;
  }

  let bytesPerSample = 2;
  if (normalized.includes("l24")) {
    bytesPerSample = 3;
  } else if (normalized.includes("l8")) {
    bytesPerSample = 1;
  }

  const duration = buffer.length / (sampleRate * channels * bytesPerSample);
  return Number.isFinite(duration) && duration > 0 ? duration : null;
}

function saveAudioBufferAsMp3(buffer: Buffer, mimeType: string, outputPath: string, fileTag: string): string {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.mkdirSync(tempDir, { recursive: true });

  const normalizedMime = mimeType.toLowerCase();
  if (normalizedMime.includes("mpeg") || normalizedMime.includes("mp3")) {
    fs.writeFileSync(outputPath, buffer);
    return outputPath;
  }

  const safeTag = fileTag.replace(/[^a-z0-9_-]+/gi, "_");
  let tempInput = path.resolve(tempDir, `${safeTag}-input.bin`);
  let ffmpegArgs: string[] = [];

  if (normalizedMime.includes("wav")) {
    tempInput = path.resolve(tempDir, `${safeTag}-input.wav`);
    fs.writeFileSync(tempInput, buffer);
    ffmpegArgs = ["-y", "-i", tempInput, "-ar", "24000", "-ac", "1", outputPath];
  } else if (normalizedMime.includes("pcm") || normalizedMime.includes("raw") || normalizedMime.includes("l16")) {
    tempInput = path.resolve(tempDir, `${safeTag}-input.pcm`);
    fs.writeFileSync(tempInput, buffer);
    ffmpegArgs = ["-y", "-f", "s16le", "-ar", "24000", "-ac", "1", "-i", tempInput, outputPath];
  } else {
    fs.writeFileSync(tempInput, buffer);
    ffmpegArgs = ["-y", "-i", tempInput, "-ar", "24000", "-ac", "1", outputPath];
  }

  const convert = runCommand(ffmpegBin, ffmpegArgs, projectRoot, undefined, compositorEnv);
  if (!convert.ok || !fs.existsSync(outputPath)) {
    throw new Error(`Failed to convert Gemini v3 audio to mp3. ${convert.stderr || convert.stdout}`);
  }

  return outputPath;
}

function retimeAudioToTargetDuration(audioPath: string, targetDurationSec: number, currentDurationSec: number): number {
  const delta = Math.abs(currentDurationSec - targetDurationSec);
  if (delta <= 0.12) {
    return currentDurationSec;
  }

  const factor = currentDurationSec / targetDurationSec;
  const filter = buildAtempoFilter(factor);
  const tempPath = audioPath.replace(/\.mp3$/i, ".retime.mp3");

  const run = runCommand(
    ffmpegBin,
    ["-y", "-i", audioPath, "-filter:a", filter, "-ar", "24000", "-ac", "1", "-vn", tempPath],
    projectRoot,
    undefined,
    compositorEnv
  );

  if (!run.ok || !fs.existsSync(tempPath)) {
    throw new Error(`Failed to retime v3 voiceover segment. ${run.stderr || run.stdout}`);
  }

  fs.renameSync(tempPath, audioPath);
  return targetDurationSec;
}

function concatSegmentsToFinal(segments: string[]): void {
  if (segments.length === 0) {
    throw new Error("No scene segments to concatenate");
  }

  fs.mkdirSync(path.dirname(outAudioPath), { recursive: true });
  fs.mkdirSync(tempDir, { recursive: true });

  const listPath = path.resolve(tempDir, "voiceover-v3-segments.txt");
  const listBody = segments
    .map((segment) => `file '${segment.replace(/'/g, "'\\''")}'`)
    .join("\n");
  fs.writeFileSync(listPath, `${listBody}\n`, "utf8");

  const run = runCommand(
    ffmpegBin,
    [
      "-y",
      "-f",
      "concat",
      "-safe",
      "0",
      "-i",
      listPath,
      "-ar",
      "24000",
      "-ac",
      "1",
      "-c:a",
      "libmp3lame",
      "-b:a",
      "128k",
      outAudioPath
    ],
    projectRoot,
    undefined,
    compositorEnv
  );

  if (!run.ok || !fs.existsSync(outAudioPath)) {
    throw new Error(`Failed to concatenate v3 scene audio segments. ${run.stderr || run.stdout}`);
  }
}

function extractInlineAudio(payload: unknown): { base64: string; mimeType: string } | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const candidates = (payload as { candidates?: Array<{ content?: { parts?: Array<unknown> } }> }).candidates;
  if (!Array.isArray(candidates)) {
    return null;
  }

  for (const candidate of candidates) {
    const parts = candidate?.content?.parts;
    if (!Array.isArray(parts)) {
      continue;
    }

    for (const part of parts) {
      if (!part || typeof part !== "object") {
        continue;
      }

      const inlineData = (part as { inlineData?: { data?: string; mimeType?: string } }).inlineData;
      if (inlineData?.data) {
        return {
          base64: inlineData.data,
          mimeType: inlineData.mimeType || "audio/wav"
        };
      }
    }
  }

  return null;
}

async function tryGeminiTts(scriptText: string, outputPath: string, fileTag: string): Promise<GeminiAudioResult> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  const voice = (process.env.GEMINI_TTS_VOICE || "Kore").trim();

  if (!apiKey) {
    return {
      ok: false,
      provider: "gemini",
      model: "",
      voice,
      mimeType: "",
      outputPath,
      reason: "GEMINI_API_KEY is missing"
    };
  }

  const requestedModel = (process.env.GEMINI_TTS_MODEL || "gemini-2.5-pro-preview-tts").trim();
  const modelCandidates = [requestedModel, "gemini-2.5-flash-preview-tts"].filter(
    (value, index, array) => Boolean(value) && array.indexOf(value) === index
  );

  let lastReason = "No Gemini TTS model executed";

  for (const model of modelCandidates) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const requestBodies = [
      {
        contents: [{ role: "user", parts: [{ text: scriptText }] }],
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: voice
              }
            }
          }
        }
      },
      {
        contents: [{ role: "user", parts: [{ text: scriptText }] }],
        generationConfig: {
          responseModalities: ["AUDIO"]
        }
      }
    ];

    for (const body of requestBodies) {
      const response = postJsonWithCurl(endpoint, body);
      if (!response.ok) {
        lastReason = response.error
          ? `network error on ${model}: ${response.error}`
          : `HTTP ${response.status} on ${model}: ${response.body}`;
        continue;
      }

      let payload: unknown;
      try {
        payload = JSON.parse(response.body) as unknown;
      } catch (error) {
        lastReason = `Invalid JSON payload from ${model}: ${String(error)}`;
        continue;
      }

      const extracted = extractInlineAudio(payload);
      if (!extracted) {
        lastReason = `No inline audio payload returned by ${model}`;
        continue;
      }

      try {
        const buffer = Buffer.from(extracted.base64, "base64");
        const inferredDurationSec = inferPcmDurationSec(buffer, extracted.mimeType);
        const savedPath = saveAudioBufferAsMp3(buffer, extracted.mimeType, outputPath, fileTag);
        return {
          ok: true,
          provider: "gemini",
          model,
          voice,
          mimeType: extracted.mimeType,
          outputPath: savedPath,
          inferredDurationSec
        };
      } catch (error) {
        lastReason = `Audio conversion failed on ${model}: ${String(error)}`;
      }
    }
  }

  return {
    ok: false,
    provider: "gemini",
    model: "",
    voice,
    mimeType: "",
    outputPath,
    reason: lastReason
  };
}

function writeMeta(meta: Record<string, unknown>): void {
  fs.mkdirSync(path.dirname(outMetaPath), { recursive: true });
  fs.writeFileSync(outMetaPath, `${JSON.stringify(meta, null, 2)}\n`, "utf8");
}

async function main(): Promise<void> {
  const plans = buildScenePlans();
  const expectedDurationSec = Number((TOTAL_FRAMES_V3 / FPS_V3).toFixed(3));

  fs.mkdirSync(path.dirname(outTranscriptPath), { recursive: true });
  fs.mkdirSync(segmentsDir, { recursive: true });

  const transcript = buildNarrationText(plans);
  fs.writeFileSync(outTranscriptPath, `${transcript}\n`, "utf8");

  const summaries: SceneAudioSummary[] = [];
  const segmentPaths: string[] = [];

  for (let index = 0; index < plans.length; index += 1) {
    const scene = plans[index];
    const segmentPath = path.resolve(segmentsDir, `${String(index + 1).padStart(2, "0")}-${scene.id}.mp3`);
    const prompt = `Narrate this sentence naturally in English for a hackathon demo voiceover. Keep neutral pace and clear diction. ${scene.narration}`;

    console.log(`Gemini TTS v3 scene ${index + 1}/${plans.length}: ${scene.id} target=${scene.targetDurationSec.toFixed(3)}s`);
    const geminiResult = await tryGeminiTts(prompt, segmentPath, `voiceover-v3-${scene.id}`);

    if (!geminiResult.ok || !fs.existsSync(segmentPath)) {
      throw new Error(`Gemini TTS v3 failed on ${scene.id}: ${geminiResult.reason || "unknown reason"}`);
    }

    const sourceDurationSec =
      typeof geminiResult.inferredDurationSec === "number" && Number.isFinite(geminiResult.inferredDurationSec)
        ? geminiResult.inferredDurationSec
        : scene.targetDurationSec;

    const finalDurationSec = retimeAudioToTargetDuration(segmentPath, scene.targetDurationSec, sourceDurationSec);

    summaries.push({
      id: scene.id,
      model: geminiResult.model,
      voice: geminiResult.voice,
      mimeType: geminiResult.mimeType,
      sourceDurationSec: Number(sourceDurationSec.toFixed(3)),
      targetDurationSec: scene.targetDurationSec,
      durationDeltaSec: Number(Math.abs(finalDurationSec - scene.targetDurationSec).toFixed(3)),
      outputPath: path.relative(projectRoot, segmentPath)
    });

    segmentPaths.push(segmentPath);
  }

  concatSegmentsToFinal(segmentPaths);

  const durationSec = Number(
    summaries.reduce((acc, item) => acc + item.targetDurationSec, 0).toFixed(3)
  );
  const durationDeltaSec = Number(Math.abs(durationSec - expectedDurationSec).toFixed(3));

  if (durationDeltaSec >= 0.25) {
    throw new Error(`Gemini TTS v3 duration mismatch too large: ${durationDeltaSec}s`);
  }

  writeMeta({
    generatedAt: new Date().toISOString(),
    provider: "gemini",
    model: summaries[0]?.model || (process.env.GEMINI_TTS_MODEL || "gemini-2.5-pro-preview-tts"),
    voice: summaries[0]?.voice || (process.env.GEMINI_TTS_VOICE || "Kore"),
    durationSec,
    expectedDurationSec,
    durationDeltaSec,
    transcriptPath: "remotion/public/v3/audio/clawshield-voiceover-v3.txt",
    strategy: "scene-segmented-gemini-tts",
    scenes: summaries
  });

  console.log(`Gemini TTS v3 saved: ${path.relative(projectRoot, outAudioPath)}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
