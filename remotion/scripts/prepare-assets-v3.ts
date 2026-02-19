import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const remotionRoot = path.resolve(scriptDir, "..");
const projectRoot = path.resolve(remotionRoot, "..");

const docsCasesRoot = path.resolve(projectRoot, "docs/cases/artifacts");
const docsAiScreensRoot = path.resolve(projectRoot, "docs/ai-log/screenshots");
const keyframesRoot = path.resolve(projectRoot, "media/keyframes");

const publicV3Root = path.resolve(remotionRoot, "public/v3");
const outCasesRoot = path.resolve(publicV3Root, "cases");
const outAiRoot = path.resolve(publicV3Root, "ai-log/screenshots");
const outKeyframesRoot = path.resolve(publicV3Root, "keyframes");
const outEvidenceRoot = path.resolve(publicV3Root, "evidence");

interface AssetManifest {
  generatedAt: string;
  copied: {
    cases: Record<string, string[]>;
    aiScreenshots: string[];
    keyframes: string[];
    evidence: string[];
  };
}

function resetDir(dir: string): void {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
}

function ensureDir(dir: string): void {
  fs.mkdirSync(dir, { recursive: true });
}

function copyIfExists(from: string, to: string): boolean {
  if (!fs.existsSync(from)) {
    return false;
  }
  ensureDir(path.dirname(to));
  fs.copyFileSync(from, to);
  return true;
}

function copyCaseArtifacts(manifest: AssetManifest): void {
  if (!fs.existsSync(docsCasesRoot)) {
    throw new Error(`Missing case artifacts directory: ${docsCasesRoot}`);
  }

  const caseDirs = fs
    .readdirSync(docsCasesRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));

  for (const caseId of caseDirs) {
    const fromCase = path.resolve(docsCasesRoot, caseId);
    const toCase = path.resolve(outCasesRoot, caseId);
    ensureDir(toCase);

    const copied: string[] = [];

    const files = fs
      .readdirSync(fromCase, { withFileTypes: true })
      .filter((entry) => entry.isFile() && /\.(png|json)$/i.test(entry.name))
      .map((entry) => entry.name)
      .sort((a, b) => a.localeCompare(b));

    for (const name of files) {
      const from = path.resolve(fromCase, name);
      const to = path.resolve(toCase, name);
      fs.copyFileSync(from, to);
      copied.push(`v3/cases/${caseId}/${name}`);
    }

    manifest.copied.cases[caseId] = copied;
  }
}

function copyAiScreenshots(manifest: AssetManifest): void {
  if (!fs.existsSync(docsAiScreensRoot)) {
    return;
  }

  const files = fs
    .readdirSync(docsAiScreensRoot, { withFileTypes: true })
    .filter((entry) => entry.isFile() && /\.(png|jpg|jpeg|webp)$/i.test(entry.name))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));

  for (const name of files) {
    const from = path.resolve(docsAiScreensRoot, name);
    const to = path.resolve(outAiRoot, name);
    fs.copyFileSync(from, to);
    manifest.copied.aiScreenshots.push(`v3/ai-log/screenshots/${name}`);
  }
}

function copyKeyframes(manifest: AssetManifest): void {
  if (!fs.existsSync(keyframesRoot)) {
    return;
  }

  const files = fs
    .readdirSync(keyframesRoot, { withFileTypes: true })
    .filter((entry) => entry.isFile() && /\.(png|jpg|jpeg|webp)$/i.test(entry.name))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));

  for (const name of files) {
    const from = path.resolve(keyframesRoot, name);
    const to = path.resolve(outKeyframesRoot, name);
    fs.copyFileSync(from, to);
    manifest.copied.keyframes.push(`v3/keyframes/${name}`);
  }
}

function copyEvidence(manifest: AssetManifest): void {
  const evidenceFiles = [
    "docs/verification/event-latest.json",
    "docs/verification/flow-latest.json",
    "docs/cases/case-registry.lock.json",
    "docs/cases/artifacts/run-latest.json",
    "docs/cases/artifacts/verify-latest.json"
  ];

  for (const rel of evidenceFiles) {
    const from = path.resolve(projectRoot, rel);
    const to = path.resolve(outEvidenceRoot, path.basename(rel));
    if (copyIfExists(from, to)) {
      manifest.copied.evidence.push(`v3/evidence/${path.basename(rel)}`);
    }
  }
}

function main(): void {
  resetDir(outCasesRoot);
  resetDir(outAiRoot);
  resetDir(outKeyframesRoot);
  resetDir(outEvidenceRoot);
  ensureDir(path.resolve(publicV3Root, "audio"));

  const manifest: AssetManifest = {
    generatedAt: new Date().toISOString(),
    copied: {
      cases: {},
      aiScreenshots: [],
      keyframes: [],
      evidence: []
    }
  };

  copyCaseArtifacts(manifest);
  copyAiScreenshots(manifest);
  copyKeyframes(manifest);
  copyEvidence(manifest);

  const manifestPath = path.resolve(outEvidenceRoot, "asset-manifest.json");
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

  console.log(`v3 assets prepared at: ${path.relative(projectRoot, publicV3Root)}`);
  console.log(`cases: ${Object.keys(manifest.copied.cases).length}`);
  console.log(`ai screenshots: ${manifest.copied.aiScreenshots.length}`);
  console.log(`keyframes: ${manifest.copied.keyframes.length}`);
  console.log(`evidence files: ${manifest.copied.evidence.length + 1}`);
}

main();
