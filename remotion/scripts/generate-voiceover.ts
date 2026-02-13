import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as dotenv from "dotenv";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(scriptDir, "..");
const projectRoot = path.resolve(workspaceRoot, "..");

dotenv.config({ path: path.resolve(projectRoot, ".env") });
dotenv.config();

const scriptText = [
  "Skills are powerful, but malicious skills can hide remote execution and key theft.",
  "ClawShield audits a specific commit, explains findings, and binds report evidence onchain.",
  "Paste repository URL and commit SHA, then receive a fingerprinted risk report in seconds.",
  "Approved green reports can be attested on opBNB testnet with contract and transaction verification.",
  "AI build log captures prompts, generated code, screenshots, and debugging decisions.",
  "Submission includes onchain proof, reproducible setup, and one-command verification artifacts.",
  "ClawShield. Build fast. Prove trust onchain."
].join(" ");

async function main() {
  const baseUrl = process.env.LLM_BASE_URL?.replace(/\/$/, "");
  const apiKey = process.env.LLM_API_KEY;

  if (!baseUrl || !apiKey) {
    throw new Error("LLM_BASE_URL and LLM_API_KEY are required for voiceover generation.");
  }

  const modelCandidates = [
    process.env.LLM_TTS_MODEL,
    process.env.LLM_MODEL,
    "gpt-4o-mini-tts",
    "tts-1"
  ].filter((value): value is string => Boolean(value));

  const outPath = path.resolve(projectRoot, "media/audio/clawshield-voiceover.mp3");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });

  let lastError = "";

  for (const model of modelCandidates) {
    const response = await fetch(`${baseUrl}/audio/speech`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        voice: process.env.LLM_TTS_VOICE || "alloy",
        input: scriptText,
        format: "mp3"
      })
    });

    if (response.ok) {
      const audio = Buffer.from(await response.arrayBuffer());
      fs.writeFileSync(outPath, audio);
      console.log(`voiceover saved: ${outPath} (model: ${model})`);
      return;
    }

    lastError = `model=${model}, status=${response.status}, body=${await response.text()}`;
  }

  const fallbackTxtPath = path.resolve(projectRoot, "media/audio/clawshield-voiceover.txt");
  fs.writeFileSync(fallbackTxtPath, scriptText, "utf8");
  console.warn(
    `voiceover generation failed for all models. Transcript saved at ${fallbackTxtPath}. lastError: ${lastError}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
