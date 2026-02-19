import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as dotenv from "dotenv";
import type { VideoV3CaseSnapshot, VideoV3Manifest, V3RiskLevel } from "../src/v3/types";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const remotionRoot = path.resolve(scriptDir, "..");
const projectRoot = path.resolve(remotionRoot, "..");

dotenv.config({ path: path.resolve(projectRoot, ".env") });
dotenv.config();

type JsonObject = Record<string, unknown>;

interface LockedCase {
  id: string;
  title: string;
  problem: string;
  repoUrl: string;
  commitSha: string;
  expectedLevel: V3RiskLevel;
  expectedDimensions: string[];
  expectedAttestability: "allowed" | "denied";
}

function readJson<T>(filePath: string): T {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing required file: ${filePath}`);
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

function readOptionalJson<T>(filePath: string): T | null {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

function extractMarkdownCodeLine(markdown: string, label: string): string {
  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`- ${escapedLabel}: [\\x60]([^\\x60]+)[\\x60]`, "m");
  const matched = markdown.match(regex);
  if (!matched?.[1]) {
    throw new Error(`Could not parse \"${label}\" from docs/PROOF_INDEX.md`);
  }
  return matched[1].trim();
}

function countAiLoops(evidenceIndexPath: string): number {
  if (!fs.existsSync(evidenceIndexPath)) {
    return 0;
  }
  const text = fs.readFileSync(evidenceIndexPath, "utf8");
  return (text.match(/^## Loop /gm) || []).length;
}

function listPublicFiles(relativeDir: string, exts: RegExp): string[] {
  const fullDir = path.resolve(remotionRoot, "public", relativeDir);
  if (!fs.existsSync(fullDir)) {
    return [];
  }

  return fs
    .readdirSync(fullDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && exts.test(entry.name))
    .map((entry) => `${relativeDir}/${entry.name}`)
    .sort((a, b) => a.localeCompare(b));
}

function asRiskLevel(value: unknown, fallback: V3RiskLevel): V3RiskLevel {
  if (value === "green" || value === "yellow" || value === "red") {
    return value;
  }
  return fallback;
}

function caseSnapshotFromArtifacts(item: LockedCase): VideoV3CaseSnapshot {
  const baseDir = path.resolve(projectRoot, "docs/cases/artifacts", item.id);
  const flow = readOptionalJson<JsonObject>(path.resolve(baseDir, "flow.json"));
  const report = readOptionalJson<JsonObject>(path.resolve(baseDir, "report.json"));
  const attest = readOptionalJson<JsonObject>(path.resolve(baseDir, "attest.json"));

  const flowAudit = (flow?.audit as JsonObject | undefined) || {};
  const reportObj = report || {};

  const score = Number(flowAudit.score ?? reportObj.score ?? 0);
  const level = asRiskLevel(flowAudit.level ?? reportObj.level, item.expectedLevel);
  const fingerprint = String(flowAudit.fingerprint ?? reportObj.fingerprint ?? "");
  const reportHash = String(flowAudit.reportHash ?? reportObj.reportHash ?? "");

  const findings = (flowAudit.findings as JsonObject[]) || (reportObj.findings as JsonObject[]) || [];
  const dimensions = Array.from(
    new Set(
      findings
        .map((finding) => String(finding.dimension || "").trim())
        .filter((value) => value.length > 0)
    )
  );

  const attestBody = (attest?.body as JsonObject | undefined) || {};
  const txHashRaw = attestBody.txHash;
  const txHash = typeof txHashRaw === "string" && txHashRaw.trim().length > 0 ? txHashRaw.trim() : undefined;
  const errorText =
    typeof attestBody.error === "string" && attestBody.error.trim().length > 0
      ? attestBody.error.trim()
      : "Policy denied attestation for non-green report.";

  const attestOutcome = txHash ? "allowed" : "denied";
  const attestMessage = txHash ? "Onchain attestation confirmed" : errorText;

  return {
    id: item.id,
    title: item.title,
    problem: item.problem,
    repoUrl: item.repoUrl,
    commitSha: item.commitSha,
    expectedLevel: item.expectedLevel,
    expectedDimensions: item.expectedDimensions,
    score,
    level,
    fingerprint,
    reportHash,
    dimensions,
    attestOutcome,
    attestMessage,
    txHash,
    evidence: {
      homeImage: `v3/cases/${item.id}/home.png`,
      auditImage: `v3/cases/${item.id}/audit.png`,
      fingerprintImage: `v3/cases/${item.id}/fingerprint.png`,
      flowJson: `v3/cases/${item.id}/flow.json`,
      reportJson: `v3/cases/${item.id}/report.json`,
      attestJson: `v3/cases/${item.id}/attest.json`
    }
  };
}

function toV3VideoUrl(rawVideoUrl: string): string {
  if (rawVideoUrl.length === 0) {
    return "media/video/clawshield-demo-v3.mp4";
  }
  if (rawVideoUrl.includes("clawshield-demo-v3.mp4")) {
    return rawVideoUrl;
  }
  if (rawVideoUrl.includes("clawshield-demo-v2.mp4")) {
    return rawVideoUrl.replace("clawshield-demo-v2.mp4", "clawshield-demo-v3.mp4");
  }
  if (rawVideoUrl.includes("clawshield-demo.mp4")) {
    return rawVideoUrl.replace("clawshield-demo.mp4", "clawshield-demo-v3.mp4");
  }
  return rawVideoUrl;
}

function writeGeneratedTs(data: VideoV3Manifest): void {
  const outPath = path.resolve(remotionRoot, "src/v3/generated.ts");
  const payload = JSON.stringify(data, null, 2);

  const file = `import type { VideoV3Manifest } from "./types";\n\n// Auto-generated by remotion/scripts/sync-video-v3-data.ts\n// Do not edit manually.\nexport const VIDEO_V3_DATA: VideoV3Manifest = ${payload};\n`;

  fs.writeFileSync(outPath, file, "utf8");
  console.log(`synced ${path.relative(projectRoot, outPath)}`);
}

function main(): void {
  const proofIndexText = fs.readFileSync(path.resolve(projectRoot, "docs/PROOF_INDEX.md"), "utf8");
  const contractAddress = extractMarkdownCodeLine(proofIndexText, "Contract Address");
  const txHash = extractMarkdownCodeLine(proofIndexText, "Submission TX Hash");
  const contractExplorer = extractMarkdownCodeLine(proofIndexText, "Contract Explorer");
  const txExplorer = extractMarkdownCodeLine(proofIndexText, "TX Explorer");

  const submissionConfig =
    readOptionalJson<JsonObject>(path.resolve(projectRoot, "docs/submission.config.json")) || {};

  const lock = readJson<{ cases: LockedCase[] }>(
    path.resolve(projectRoot, "docs/cases/case-registry.lock.json")
  );

  const event =
    readOptionalJson<JsonObject>(path.resolve(projectRoot, "docs/verification/event-latest.json")) || {};

  const evidenceIndexPath = path.resolve(projectRoot, "docs/ai-log/EVIDENCE_INDEX.md");

  const repoUrl = String(
    submissionConfig.repoUrl || process.env.RELEASE_REPO_URL || "https://github.com/zzw4257/ClawShield"
  );
  const demoUrl = String(submissionConfig.demoUrl || process.env.RELEASE_DEMO_URL || "http://localhost:3000");
  const rawVideoUrl = String(submissionConfig.videoUrl || "");

  const data: VideoV3Manifest = {
    generatedAt: new Date().toISOString(),
    proof: {
      chain: "opBNB Testnet",
      chainId: 5611,
      contractAddress,
      txHash,
      contractExplorer,
      txExplorer
    },
    cases: lock.cases.map(caseSnapshotFromArtifacts),
    event: {
      txHash: String(event.txHash || txHash),
      contractAddress: String(event.contractAddress || contractAddress),
      blockNumber: Number(event.blockNumber || 0),
      fingerprint: String(event.fingerprint || ""),
      score: Number(event.score || 0),
      attester: String(event.attester || ""),
      reportHash: String(event.reportHash || ""),
      repo: String(event.repo || ""),
      commit: String(event.commit || ""),
      timestamp: Number(event.timestamp || 0)
    },
    aiEvidence: {
      loops: countAiLoops(evidenceIndexPath),
      screenshots: listPublicFiles("v3/ai-log/screenshots", /\.(png|jpg|jpeg|webp)$/i),
      keyframes: listPublicFiles("v3/keyframes", /\.(png|jpg|jpeg|webp)$/i),
      evidenceIndexPath: "docs/ai-log/EVIDENCE_INDEX.md"
    },
    urls: {
      repoUrl,
      demoUrl,
      videoUrl: toV3VideoUrl(rawVideoUrl),
      apiHealthUrl: String(process.env.RELEASE_API_HEALTH_URL || "http://localhost:8787/api/health")
    },
    media: {
      voiceoverPath: "v3/audio/clawshield-voiceover-v3.mp3",
      subtitlePath: "subtitles/clawshield-v3.srt"
    }
  };

  writeGeneratedTs(data);
}

main();
