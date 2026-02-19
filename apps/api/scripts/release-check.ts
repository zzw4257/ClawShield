import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(scriptDir, "..");
const projectRoot = path.resolve(workspaceRoot, "../..");

const HEX_ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;
const HEX_HASH_RE = /^0x[a-fA-F0-9]{64}$/;

type CheckResult = {
  name: string;
  ok: boolean;
  detail: string;
};

function readFile(relPath: string): string {
  return fs.readFileSync(path.resolve(projectRoot, relPath), "utf8");
}

function fileExists(relPath: string): boolean {
  return fs.existsSync(path.resolve(projectRoot, relPath));
}

function capture(content: string, regex: RegExp, label: string): string {
  const match = content.match(regex);
  if (!match?.[1]) {
    throw new Error(`Cannot extract ${label}`);
  }
  return match[1].trim();
}

function safeCapture(content: string, regex: RegExp): string | undefined {
  const match = content.match(regex);
  return match?.[1]?.trim();
}

function walkFiles(dirPath: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".git") continue;
    const full = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      walkFiles(full, out);
      continue;
    }
    out.push(full);
  }
  return out;
}

function main() {
  const results: CheckResult[] = [];

  const readme = readFile("README.md");
  const judge = readFile("docs/JUDGE_PACKET.md");
  const proofIndex = readFile("docs/PROOF_INDEX.md");
  const finalSubmission = readFile("docs/DORAHACKS_SUBMISSION_FINAL.md");
  const submissionConfig = JSON.parse(readFile("docs/submission.config.json")) as {
    demoUrl?: string;
    repoUrl?: string;
  };

  let readmeContract = "";
  let readmeTx = "";
  let readmeDemo = "";
  let readmeApiHealth = "";

  let judgeContract = "";
  let judgeTx = "";
  let judgeDemo = "";
  let judgeApiHealth = "";

  let proofContract = "";
  let proofTx = "";

  let finalContract = "";
  let finalTx = "";
  let finalDemo = "";

  try {
    readmeContract = capture(readme, /^- Contract Address: `([^`]+)`$/m, "README contract");
    readmeTx = capture(readme, /^- Proof TX: `([^`]+)`$/m, "README tx");
    readmeDemo = capture(readme, /^- Live Demo: `([^`]+)`$/m, "README demo");
    readmeApiHealth = capture(readme, /^- API Health: `([^`]+)`$/m, "README api health");

    judgeContract = capture(judge, /^- Contract: `([^`]+)`$/m, "JUDGE contract");
    judgeTx = capture(judge, /^- Proof TX: `([^`]+)`$/m, "JUDGE tx");
    judgeDemo = capture(judge, /^- Web: `([^`]+)`$/m, "JUDGE demo");
    judgeApiHealth = capture(judge, /^- API health: `([^`]+)`$/m, "JUDGE api health");

    proofContract = capture(proofIndex, /^- Contract Address: `([^`]+)`$/m, "PROOF_INDEX contract");
    proofTx = capture(proofIndex, /^- Submission TX Hash: `([^`]+)`$/m, "PROOF_INDEX tx");

    finalContract = capture(finalSubmission, /^- Contract Address:\s*([^\s]+)$/m, "FINAL contract");
    finalTx = capture(finalSubmission, /^- Proof TX Hash:\s*([^\s]+)$/m, "FINAL tx");
    finalDemo = capture(finalSubmission, /^- Demo:\s*([^\s]+)$/m, "FINAL demo");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    results.push({ name: "Extract proof fields", ok: false, detail: message });
  }

  if (readmeContract && readmeTx) {
    const contractSet = new Set([readmeContract, judgeContract, proofContract, finalContract]);
    const txSet = new Set([readmeTx, judgeTx, proofTx, finalTx]);
    const demoSet = new Set([
      readmeDemo,
      judgeDemo,
      finalDemo,
      submissionConfig.demoUrl || ""
    ]);

    results.push({
      name: "Contract address format",
      ok: HEX_ADDRESS_RE.test(readmeContract),
      detail: readmeContract
    });
    results.push({
      name: "Submission tx format",
      ok: HEX_HASH_RE.test(readmeTx),
      detail: readmeTx
    });
    results.push({
      name: "Contract consistency",
      ok: contractSet.size === 1,
      detail: Array.from(contractSet).join(" | ")
    });
    results.push({
      name: "Tx consistency",
      ok: txSet.size === 1,
      detail: Array.from(txSet).join(" | ")
    });
    results.push({
      name: "Demo URL consistency",
      ok: demoSet.size === 1,
      detail: Array.from(demoSet).join(" | ")
    });
    results.push({
      name: "API health consistency",
      ok: readmeApiHealth === judgeApiHealth,
      detail: `${readmeApiHealth} | ${judgeApiHealth}`
    });
  }

  const requiredArtifacts = [
    "docs/verification/flow-latest.json",
    "docs/verification/event-latest.json",
    "docs/cases/CASEBOOK.md",
    "docs/cases/SHOWCASE.md",
    "docs/cases/artifacts/run-latest.json",
    "docs/cases/artifacts/verify-latest.json",
    "media/video/clawshield-demo.mp4"
  ];

  for (const relPath of requiredArtifacts) {
    results.push({
      name: `Artifact exists: ${relPath}`,
      ok: fileExists(relPath),
      detail: relPath
    });
  }

  if (fileExists("docs/cases/artifacts/run-latest.json")) {
    const runLatest = JSON.parse(readFile("docs/cases/artifacts/run-latest.json")) as {
      passed?: boolean;
    };
    results.push({
      name: "Case run result",
      ok: runLatest.passed === true,
      detail: `passed=${String(runLatest.passed)}`
    });
  }

  if (fileExists("docs/cases/artifacts/verify-latest.json")) {
    const verifyLatest = JSON.parse(readFile("docs/cases/artifacts/verify-latest.json")) as {
      passed?: boolean;
      errors?: string[];
    };
    results.push({
      name: "Case verify result",
      ok: verifyLatest.passed === true,
      detail: `passed=${String(verifyLatest.passed)} errors=${(verifyLatest.errors || []).length}`
    });
  }

  const statusDoc = fileExists("docs/verification/STATUS.md")
    ? readFile("docs/verification/STATUS.md")
    : "";
  const statusLatestTx = safeCapture(statusDoc, /^- Latest Verify Tx Hash:\s*([^\s]+)$/m);
  const statusSubmissionTx = safeCapture(statusDoc, /^- Submission Tx Hash \(env\):\s*([^\s]+)$/m);

  if (statusDoc) {
    results.push({
      name: "STATUS has latest verify tx",
      ok: Boolean(statusLatestTx && HEX_HASH_RE.test(statusLatestTx)),
      detail: statusLatestTx || "missing"
    });
    if (statusSubmissionTx) {
      results.push({
        name: "STATUS has submission tx",
        ok: HEX_HASH_RE.test(statusSubmissionTx),
        detail: statusSubmissionTx
      });
    }
  }

  const scanTargets = [path.resolve(projectRoot, "docs"), path.resolve(projectRoot, "README.md")];
  const placeholderRegex = /\b(TBD|your-org|0xYOUR_|YOUR_SUBMISSION_TX|YOUR_DEPLOYED_CONTRACT)\b/i;
  const offenders: string[] = [];

  for (const target of scanTargets) {
    if (!fs.existsSync(target)) continue;
    const stat = fs.statSync(target);
    const files = stat.isDirectory() ? walkFiles(target) : [target];
    for (const fullPath of files) {
      const rel = path.relative(projectRoot, fullPath).replaceAll(path.sep, "/");
      if (!rel.endsWith(".md") && !rel.endsWith(".json")) continue;
      if (rel.startsWith("docs/ai-log/")) continue;
      if (rel === "docs/RELEASE_TODAY.md") continue;
      const content = fs.readFileSync(fullPath, "utf8");
      if (placeholderRegex.test(content)) {
        offenders.push(rel);
      }
    }
  }

  results.push({
    name: "No placeholder terms in judge docs",
    ok: offenders.length === 0,
    detail: offenders.length === 0 ? "clean" : offenders.join(", ")
  });

  const failed = results.filter((item) => !item.ok);

  console.log("\nRelease readiness report");
  for (const item of results) {
    const tag = item.ok ? "PASS" : "FAIL";
    console.log(`- [${tag}] ${item.name} -> ${item.detail}`);
  }

  if (failed.length > 0) {
    console.error(`\nRelease check failed: ${failed.length} item(s) need fixing.`);
    process.exit(1);
  }

  console.log("\nRelease check passed.");
}

main();
