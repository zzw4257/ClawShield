import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import * as dotenv from "dotenv";
import { SCENE_SEGMENTS_V2, FPS_V2, TOTAL_FRAMES_V2 } from "../src/v2/timeline";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const remotionRoot = path.resolve(scriptDir, "..");
const projectRoot = path.resolve(remotionRoot, "..");

dotenv.config({ path: path.resolve(projectRoot, ".env") });
dotenv.config();

const outAudioPath = path.resolve(remotionRoot, "public/v2/audio/clawshield-voiceover-v2.mp3");
const outMetaPath = path.resolve(remotionRoot, "public/v2/audio/voiceover-v2.meta.json");
const outTranscriptPath = path.resolve(remotionRoot, "public/v2/audio/clawshield-voiceover-v2.txt");

interface GeminiAudioResult {
  ok: boolean;
  provider: string;
  model: string;
  voice: string;
  mimeType: string;
  outputPath: string;
  reason?: string;
}

function buildNarrationText(): string {
  return SCENE_SEGMENTS_V2.map((scene, index) => `Scene ${index + 1}. ${scene.narration}`).join("\n\n");
}

function runCommand(command: string, args: string[], cwd: string): { ok: boolean; stdout: string; stderr: string } {
  const run = spawnSync(command, args, {
    cwd,
    env: process.env,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });

  return {
    ok: run.status === 0,
    stdout: run.stdout || "",
    stderr: run.stderr || ""
  };
}

function probeDurationSeconds(audioPath: string): number | null {
  const probe = runCommand(
    "ffprobe",
    [
      "-v",
      "error",
      "-show_entries",
      "format=duration",
      "-of",
      "default=nokey=1:noprint_wrappers=1",
      audioPath
    ],
    projectRoot
  );

  if (!probe.ok) {
    return null;
  }

  const value = Number(probe.stdout.trim());
  return Number.isFinite(value) ? value : null;
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

function retimeAudioToExpectedDuration(audioPath: string, expectedDurationSec: number): number | null {
  const current = probeDurationSeconds(audioPath);
  if (current === null) {
    return null;
  }

  const delta = Math.abs(current - expectedDurationSec);
  if (delta <= 1.2) {
    return current;
  }

  const factor = current / expectedDurationSec;
  const filter = buildAtempoFilter(factor);
  const tempPath = audioPath.replace(/\.mp3$/i, ".retime.mp3");

  const run = runCommand(
    "ffmpeg",
    ["-y", "-i", audioPath, "-filter:a", filter, "-vn", tempPath],
    projectRoot
  );

  if (!run.ok || !fs.existsSync(tempPath)) {
    return current;
  }

  fs.renameSync(tempPath, audioPath);
  return probeDurationSeconds(audioPath);
}

function writeMeta(meta: Record<string, unknown>): void {
  fs.mkdirSync(path.dirname(outMetaPath), { recursive: true });
  fs.writeFileSync(outMetaPath, `${JSON.stringify(meta, null, 2)}\n`, "utf8");
}

function saveAudioBufferAsMp3(buffer: Buffer, mimeType: string): string {
  fs.mkdirSync(path.dirname(outAudioPath), { recursive: true });

  const normalizedMime = mimeType.toLowerCase();
  if (normalizedMime.includes("mpeg") || normalizedMime.includes("mp3")) {
    fs.writeFileSync(outAudioPath, buffer);
    return outAudioPath;
  }

  const tempDir = path.resolve(remotionRoot, ".tmp");
  fs.mkdirSync(tempDir, { recursive: true });

  let tempInput = path.resolve(tempDir, "voiceover-v2-input.bin");
  let ffmpegArgs: string[] = [];

  if (normalizedMime.includes("wav")) {
    tempInput = path.resolve(tempDir, "voiceover-v2-input.wav");
    fs.writeFileSync(tempInput, buffer);
    ffmpegArgs = ["-y", "-i", tempInput, outAudioPath];
  } else if (normalizedMime.includes("pcm") || normalizedMime.includes("raw")) {
    tempInput = path.resolve(tempDir, "voiceover-v2-input.pcm");
    fs.writeFileSync(tempInput, buffer);
    ffmpegArgs = ["-y", "-f", "s16le", "-ar", "24000", "-ac", "1", "-i", tempInput, outAudioPath];
  } else {
    fs.writeFileSync(tempInput, buffer);
    ffmpegArgs = ["-y", "-i", tempInput, outAudioPath];
  }

  const convert = runCommand("ffmpeg", ffmpegArgs, projectRoot);
  if (!convert.ok || !fs.existsSync(outAudioPath)) {
    throw new Error(`Failed to convert Gemini audio to mp3. ${convert.stderr}`);
  }

  return outAudioPath;
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

async function tryGeminiTts(scriptText: string): Promise<GeminiAudioResult> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  const voice = (process.env.GEMINI_TTS_VOICE || "Kore").trim();

  if (!apiKey) {
    return {
      ok: false,
      provider: "gemini",
      model: "",
      voice,
      mimeType: "",
      outputPath: "",
      reason: "GEMINI_API_KEY is missing"
    };
  }

  const modelCandidates = [
    process.env.GEMINI_TTS_MODEL,
    "gemini-2.5-pro-preview-tts",
    "gemini-2.5-flash-preview-tts"
  ].filter((value, index, array): value is string => Boolean(value) && array.indexOf(value) === index);

  let lastReason = "No model executed";

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
      let response: Response;
      try {
        response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(body)
        });
      } catch (error) {
        lastReason = `network error on ${model}: ${String(error)}`;
        continue;
      }

      if (!response.ok) {
        lastReason = `HTTP ${response.status} on ${model}: ${await response.text()}`;
        continue;
      }

      const payload = (await response.json()) as unknown;
      const extracted = extractInlineAudio(payload);
      if (!extracted) {
        lastReason = `No inline audio payload returned by ${model}`;
        continue;
      }

      try {
        const buffer = Buffer.from(extracted.base64, "base64");
        const savedPath = saveAudioBufferAsMp3(buffer, extracted.mimeType);
        return {
          ok: true,
          provider: "gemini",
          model,
          voice,
          mimeType: extracted.mimeType,
          outputPath: savedPath
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
    outputPath: "",
    reason: lastReason
  };
}

function runSayFallback(narrationText: string): { ok: boolean; reason?: string; model: string } {
  const tempDir = path.resolve(remotionRoot, ".tmp");
  fs.mkdirSync(tempDir, { recursive: true });
  const sayOutPath = path.resolve(tempDir, "voiceover-v2-say.aiff");
  const sayVoice = process.env.SYSTEM_TTS_VOICE || "Samantha";
  const sayRate = process.env.SYSTEM_TTS_RATE || "170";

  const spoken = spawnSync("say", ["-v", sayVoice, "-r", sayRate, "-o", sayOutPath, narrationText], {
    cwd: projectRoot,
    env: process.env,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });

  if (spoken.status !== 0 || !fs.existsSync(sayOutPath)) {
    return {
      ok: false,
      reason: `System say failed. ${spoken.stderr || spoken.stdout}`,
      model: "system-say"
    };
  }

  fs.mkdirSync(path.dirname(outAudioPath), { recursive: true });
  const convert = runCommand("ffmpeg", ["-y", "-i", sayOutPath, outAudioPath], projectRoot);
  if (!convert.ok || !fs.existsSync(outAudioPath)) {
    return {
      ok: false,
      reason: `System say conversion failed. ${convert.stderr || convert.stdout}`,
      model: "system-say"
    };
  }

  return {
    ok: true,
    model: "system-say"
  };
}

function runFallbackVoiceover(narrationText: string): { ok: boolean; reason?: string; model: string } {
  const result = runCommand("npm", ["run", "voiceover", "--workspace", "@clawshield/remotion"], projectRoot);
  const fallbackAudio = path.resolve(projectRoot, "media/audio/clawshield-voiceover.mp3");

  if (result.ok && fs.existsSync(fallbackAudio)) {
    fs.mkdirSync(path.dirname(outAudioPath), { recursive: true });
    fs.copyFileSync(fallbackAudio, outAudioPath);
    return {
      ok: true,
      model: process.env.LLM_TTS_MODEL || "openai-compatible-tts"
    };
  }

  const sayFallback = runSayFallback(narrationText);
  if (sayFallback.ok) {
    return sayFallback;
  }

  return {
    ok: false,
    reason: `OpenAI-compatible fallback failed. ${result.stderr || result.stdout} | ${sayFallback.reason || ""}`.trim(),
    model: process.env.LLM_TTS_MODEL || "unknown"
  };
}

async function main(): Promise<void> {
  const narrationText = buildNarrationText();
  const expectedDurationSec = Number((TOTAL_FRAMES_V2 / FPS_V2).toFixed(2));
  fs.mkdirSync(path.dirname(outTranscriptPath), { recursive: true });
  fs.writeFileSync(outTranscriptPath, `${narrationText}\n`, "utf8");

  const geminiResult = await tryGeminiTts(narrationText);

  if (geminiResult.ok) {
    const durationSec = retimeAudioToExpectedDuration(geminiResult.outputPath, expectedDurationSec);
    writeMeta({
      generatedAt: new Date().toISOString(),
      provider: "gemini",
      model: geminiResult.model,
      voice: geminiResult.voice,
      mimeType: geminiResult.mimeType,
      durationSec,
      expectedDurationSec,
      transcriptPath: "remotion/public/v2/audio/clawshield-voiceover-v2.txt"
    });
    console.log(`Gemini TTS saved: ${path.relative(projectRoot, outAudioPath)}`);
    return;
  }

  const fallback = runFallbackVoiceover(narrationText);
  if (!fallback.ok || !fs.existsSync(outAudioPath)) {
    throw new Error(
      `Gemini TTS failed and fallback failed. Gemini reason: ${geminiResult.reason || "unknown"}. Fallback reason: ${fallback.reason || "unknown"}`
    );
  }

  const durationSec = retimeAudioToExpectedDuration(outAudioPath, expectedDurationSec);
  writeMeta({
    generatedAt: new Date().toISOString(),
    provider: "fallback-openai-compatible",
    model: fallback.model,
    voice:
      fallback.model === "system-say"
        ? process.env.SYSTEM_TTS_VOICE || "Samantha"
        : process.env.LLM_TTS_VOICE || "alloy",
    durationSec,
    expectedDurationSec,
    fallbackReason: geminiResult.reason || "Gemini TTS unavailable",
    transcriptPath: "remotion/public/v2/audio/clawshield-voiceover-v2.txt"
  });

  console.log(`Fallback voiceover saved: ${path.relative(projectRoot, outAudioPath)}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
