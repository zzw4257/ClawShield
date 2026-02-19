import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as dotenv from "dotenv";
import {
  createPublicClient,
  decodeEventLog,
  defineChain,
  http,
  parseAbiItem,
  type Hex
} from "viem";
import type { FindingDimension, RiskLevel } from "@clawshield/shared-types";

type ArgsMap = Record<string, string | boolean>;

type CaseAttestability = "allowed" | "denied";

type DemoCase = {
  id: "clean_baseline" | "remote_execution_risk" | "credential_access_risk";
  title: string;
  problem: string;
  repoUrl: string;
  commitSha: string;
  expectedLevel: RiskLevel;
  expectedDimensions: FindingDimension[];
  expectedAttestability: CaseAttestability;
};

type CaseRegistry = {
  version: number;
  generatedAt: string;
  source: string;
  cases: DemoCase[];
};

type AuditResponse = {
  status: "queued" | "running" | "done" | "failed";
  fingerprint?: string;
  score?: number;
  level?: RiskLevel;
  reportUrl?: string;
  reportHash?: string;
  findings?: Array<{ dimension: FindingDimension }>;
  llmSummary?: string;
  error?: string;
};

type JsonResponse<T> = {
  ok: boolean;
  status: number;
  body: T;
};

type CaseRunResult = {
  caseId: DemoCase["id"];
  title: string;
  repoUrl: string;
  commitSha: string;
  expected: {
    level: RiskLevel;
    dimensions: FindingDimension[];
    attestability: CaseAttestability;
  };
  actual: {
    auditId: string;
    status: AuditResponse["status"];
    level?: RiskLevel;
    score?: number;
    dimensions: FindingDimension[];
    attestOk: boolean;
    attestStatus: number;
    txHash?: string;
    attestError?: string;
  };
  assertions: {
    auditDone: boolean;
    levelMatch: boolean;
    requiredDimensionsPresent: boolean;
    attestabilityMatch: boolean;
    eventVerified: boolean;
  };
  passed: boolean;
  artifactPaths: {
    caseDir: string;
    audit: string;
    report?: string;
    attest: string;
    flow: string;
    event?: string;
    screenshots?: {
      home?: string;
      audit?: string;
      fingerprint?: string;
    };
  };
};

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(scriptDir, "..");
const projectRoot = path.resolve(workspaceRoot, "../..");

dotenv.config({ path: path.resolve(projectRoot, ".env") });
dotenv.config();

const attestedEvent = parseAbiItem(
  "event Attested(bytes32 indexed fingerprint, uint8 score, address indexed attester, string reportURI, bytes32 reportHash, string repo, string commit, uint256 timestamp)"
);

const opbnbTestnet = defineChain({
  id: 5611,
  name: "opBNB Testnet",
  nativeCurrency: { name: "tBNB", symbol: "tBNB", decimals: 18 },
  rpcUrls: {
    default: {
      http: [process.env.OPBNB_TESTNET_RPC_URL || "https://opbnb-testnet-rpc.bnbchain.org"]
    }
  },
  blockExplorers: {
    default: { name: "opBNBScan", url: "https://testnet.opbnbscan.com" }
  }
});

function parseArgs(argv: string[]): ArgsMap {
  const out: ArgsMap = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) continue;

    const key = token.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      out[key] = true;
      continue;
    }

    out[key] = next;
    index += 1;
  }
  return out;
}

function getArg(args: ArgsMap, key: string): string | undefined {
  const value = args[key];
  return typeof value === "string" ? value.trim() : undefined;
}

function getNumArg(args: ArgsMap, key: string, fallback: number): number {
  const raw = getArg(args, key);
  if (!raw) return fallback;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`${key} must be positive`);
  }
  return parsed;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function readCaseRegistry(registryPath: string): CaseRegistry {
  const raw = fs.readFileSync(registryPath, "utf8");
  const parsed = JSON.parse(raw) as CaseRegistry;
  if (!Array.isArray(parsed.cases) || parsed.cases.length === 0) {
    throw new Error(`Case registry has no cases: ${registryPath}`);
  }
  return parsed;
}

async function requestJson<T>(url: string, options?: RequestInit): Promise<JsonResponse<T>> {
  const response = await fetch(url, options);
  let body: unknown = {};
  try {
    body = await response.json();
  } catch {
    body = {};
  }
  return {
    ok: response.ok,
    status: response.status,
    body: body as T
  };
}

function ensureDir(dir: string): void {
  fs.mkdirSync(dir, { recursive: true });
}

function writeJson(filePath: string, data: unknown): void {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function requiredDimensions(findings: AuditResponse["findings"] | undefined): FindingDimension[] {
  if (!Array.isArray(findings)) return [];
  return Array.from(new Set(findings.map((item) => item.dimension)));
}

async function verifyAttestedEvent(input: {
  txHash: Hex;
  contractAddress: string;
  outFile: string;
}): Promise<boolean> {
  const publicClient = createPublicClient({
    chain: opbnbTestnet,
    transport: http(opbnbTestnet.rpcUrls.default.http[0])
  });

  const receipt = await publicClient.getTransactionReceipt({ hash: input.txHash });
  const logs = receipt.logs.filter(
    (log) => log.address.toLowerCase() === input.contractAddress.toLowerCase()
  );

  for (const log of logs) {
    try {
      const decoded = decodeEventLog({
        abi: [attestedEvent],
        data: log.data,
        topics: log.topics
      });

      if (decoded.eventName !== "Attested") {
        continue;
      }

      const args = decoded.args as {
        fingerprint: Hex;
        score: number | bigint;
        attester: Hex;
        reportURI: string;
        reportHash: Hex;
        repo: string;
        commit: string;
        timestamp: bigint;
      };

      writeJson(input.outFile, {
        txHash: input.txHash,
        contractAddress: log.address,
        blockNumber: Number(receipt.blockNumber),
        logIndex: Number(log.logIndex),
        fingerprint: args.fingerprint,
        score: Number(args.score),
        attester: args.attester,
        reportURI: args.reportURI,
        reportHash: args.reportHash,
        repo: args.repo,
        commit: args.commit,
        timestamp: Number(args.timestamp)
      });

      return true;
    } catch {
      continue;
    }
  }

  return false;
}

function toCasebookMarkdown(run: {
  generatedAt: string;
  baseUrl: string;
  cases: CaseRunResult[];
}): string {
  const lines: string[] = [];
  lines.push("# CASEBOOK");
  lines.push("");
  lines.push("This file captures concrete demo cases with reproducible evidence artifacts.");
  lines.push("");
  lines.push(`- Generated at (UTC): ${run.generatedAt}`);
  lines.push(`- API Base URL: ${run.baseUrl}`);
  lines.push("");

  for (const item of run.cases) {
    lines.push(`## ${item.title} (${item.caseId})`);
    lines.push("");
    lines.push("### Problem");
    lines.push(
      item.caseId === "clean_baseline"
        ? "Show a low-risk baseline where deterministic scoring allows attestation."
        : item.caseId === "remote_execution_risk"
          ? "Show detection of risky remote execution patterns before install-time execution."
          : "Show detection of credential access patterns that require human review."
    );
    lines.push("");
    lines.push("### Input");
    lines.push(`- Repo: \`${item.repoUrl}\``);
    lines.push(`- Commit: \`${item.commitSha}\``);
    lines.push("");
    lines.push("### Expected");
    lines.push(`- Level: \`${item.expected.level}\``);
    lines.push(`- Required dimensions: ${item.expected.dimensions.length > 0 ? item.expected.dimensions.map((v) => `\`${v}\``).join(", ") : "none"}`);
    lines.push(`- Attestation: \`${item.expected.attestability}\``);
    lines.push("");
    lines.push("### Actual");
    lines.push(`- Audit ID: \`${item.actual.auditId}\``);
    lines.push(`- Status: \`${item.actual.status}\``);
    lines.push(`- Score/Level: \`${item.actual.score ?? "N/A"} / ${item.actual.level ?? "N/A"}\``);
    lines.push(`- Dimensions: ${item.actual.dimensions.length > 0 ? item.actual.dimensions.map((v) => `\`${v}\``).join(", ") : "none"}`);
    lines.push(
      `- Attestation outcome: ${item.actual.txHash ? `success, tx=\`${item.actual.txHash}\`` : `denied (${item.actual.attestError || "no tx"})`}`
    );
    lines.push("");
    lines.push("### Evidence Links");
    lines.push(`- audit.json: \`${path.relative(path.resolve(projectRoot, "docs/cases"), item.artifactPaths.audit)}\``);
    if (item.artifactPaths.report) {
      lines.push(`- report.json: \`${path.relative(path.resolve(projectRoot, "docs/cases"), item.artifactPaths.report)}\``);
    }
    lines.push(`- attest.json: \`${path.relative(path.resolve(projectRoot, "docs/cases"), item.artifactPaths.attest)}\``);
    lines.push(`- flow.json: \`${path.relative(path.resolve(projectRoot, "docs/cases"), item.artifactPaths.flow)}\``);
    if (item.artifactPaths.event) {
      lines.push(`- event.json: \`${path.relative(path.resolve(projectRoot, "docs/cases"), item.artifactPaths.event)}\``);
    }
    if (item.artifactPaths.screenshots?.home) {
      lines.push(`- home.png: \`${path.relative(path.resolve(projectRoot, "docs/cases"), item.artifactPaths.screenshots.home)}\``);
    }
    if (item.artifactPaths.screenshots?.audit) {
      lines.push(`- audit.png: \`${path.relative(path.resolve(projectRoot, "docs/cases"), item.artifactPaths.screenshots.audit)}\``);
    }
    if (item.artifactPaths.screenshots?.fingerprint) {
      lines.push(`- fingerprint.png: \`${path.relative(path.resolve(projectRoot, "docs/cases"), item.artifactPaths.screenshots.fingerprint)}\``);
    }
    lines.push("");
    lines.push("### Judge One-Line Takeaway");
    lines.push(
      item.caseId === "clean_baseline"
        ? "The pipeline can produce a deterministic green verdict and an onchain attestation for a commit-bound fingerprint."
        : "The pipeline blocks attestation on non-green outcomes and exposes concrete risk evidence for reviewer decision-making."
    );
    lines.push("");
  }

  return `${lines.join("\n")}\n`;
}

async function runCase(input: {
  baseUrl: string;
  auditTimeoutMs: number;
  pollMs: number;
  outDir: string;
  demoCase: DemoCase;
}): Promise<CaseRunResult> {
  const { demoCase, outDir, baseUrl } = input;
  const caseDir = path.resolve(outDir, demoCase.id);
  ensureDir(caseDir);

  const start = await requestJson<{ auditId: string; status: string }>(`${baseUrl}/api/audit/start`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      repoUrl: demoCase.repoUrl,
      commitSha: demoCase.commitSha
    })
  });

  if (!start.ok || !start.body.auditId) {
    throw new Error(`Case ${demoCase.id} failed to start audit (HTTP ${start.status})`);
  }

  const auditId = start.body.auditId;
  const polls: AuditResponse[] = [];
  const deadline = Date.now() + input.auditTimeoutMs;
  let finalAudit: AuditResponse | undefined;

  while (Date.now() < deadline) {
    await sleep(input.pollMs);
    const poll = await requestJson<AuditResponse>(`${baseUrl}/api/audit/${auditId}`);
    if (!poll.ok) {
      throw new Error(`Case ${demoCase.id} polling failed (HTTP ${poll.status})`);
    }
    polls.push(poll.body);

    if (poll.body.status === "done" || poll.body.status === "failed") {
      finalAudit = poll.body;
      break;
    }
  }

  if (!finalAudit) {
    throw new Error(`Case ${demoCase.id} timed out waiting for audit completion`);
  }

  const auditFile = path.resolve(caseDir, "audit.json");
  writeJson(auditFile, finalAudit);

  let reportFile: string | undefined;
  let reportPayload: unknown;
  if (finalAudit.reportUrl) {
    const reportFetch = await requestJson<Record<string, unknown>>(finalAudit.reportUrl);
    if (reportFetch.ok) {
      reportPayload = reportFetch.body;
      reportFile = path.resolve(caseDir, "report.json");
      writeJson(reportFile, reportFetch.body);
    }
  }

  const attestCall = await requestJson<Record<string, unknown>>(`${baseUrl}/api/attest`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ auditId })
  });

  const attestFile = path.resolve(caseDir, "attest.json");
  writeJson(attestFile, {
    ok: attestCall.ok,
    status: attestCall.status,
    body: attestCall.body
  });

  const dimensions = requiredDimensions(finalAudit.findings);
  const levelMatch = finalAudit.level === demoCase.expectedLevel;
  const requiredDimensionsPresent = demoCase.expectedDimensions.every((dim) => dimensions.includes(dim));

  const txHash = typeof attestCall.body.txHash === "string" ? attestCall.body.txHash : undefined;
  const attestError =
    typeof attestCall.body.error === "string"
      ? attestCall.body.error
      : !attestCall.ok
        ? `HTTP ${attestCall.status}`
        : undefined;

  const attestabilityMatch =
    demoCase.expectedAttestability === "allowed"
      ? attestCall.ok && Boolean(txHash)
      : !attestCall.ok && (attestError || "").toLowerCase().includes("only green");

  let eventVerified = false;
  let eventFile: string | undefined;
  if (demoCase.expectedAttestability === "allowed" && txHash) {
    eventFile = path.resolve(caseDir, "event.json");
    const contractAddress =
      typeof attestCall.body.contractAddress === "string"
        ? attestCall.body.contractAddress
        : process.env.CLAWSHIELD_CONTRACT_ADDRESS || "";

    if (contractAddress) {
      eventVerified = await verifyAttestedEvent({
        txHash: txHash as Hex,
        contractAddress,
        outFile: eventFile
      });
    }
  }

  const flowFile = path.resolve(caseDir, "flow.json");
  writeJson(flowFile, {
    startedAt: new Date(Date.now() - input.pollMs * Math.max(1, polls.length)).toISOString(),
    finishedAt: new Date().toISOString(),
    caseId: demoCase.id,
    start,
    pollCount: polls.length,
    statuses: polls.map((item) => item.status),
    audit: finalAudit,
    report: reportPayload,
    attest: {
      ok: attestCall.ok,
      status: attestCall.status,
      body: attestCall.body
    }
  });

  const assertions = {
    auditDone: finalAudit.status === "done",
    levelMatch,
    requiredDimensionsPresent,
    attestabilityMatch,
    eventVerified: demoCase.expectedAttestability === "allowed" ? eventVerified : true
  };

  const passed = Object.values(assertions).every(Boolean);

  return {
    caseId: demoCase.id,
    title: demoCase.title,
    repoUrl: demoCase.repoUrl,
    commitSha: demoCase.commitSha,
    expected: {
      level: demoCase.expectedLevel,
      dimensions: demoCase.expectedDimensions,
      attestability: demoCase.expectedAttestability
    },
    actual: {
      auditId,
      status: finalAudit.status,
      level: finalAudit.level,
      score: finalAudit.score,
      dimensions,
      attestOk: attestCall.ok,
      attestStatus: attestCall.status,
      txHash,
      attestError
    },
    assertions,
    passed,
    artifactPaths: {
      caseDir,
      audit: auditFile,
      report: reportFile,
      attest: attestFile,
      flow: flowFile,
      event: eventFile
    }
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const baseUrl =
    getArg(args, "baseUrl") ||
    process.env.PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8787";
  const auditTimeoutMs = getNumArg(args, "maxWaitMs", 240_000);
  const pollMs = getNumArg(args, "pollMs", 2_000);

  const registryPath = path.resolve(
    projectRoot,
    getArg(args, "registry") || "docs/cases/case-registry.lock.json"
  );
  const outDir = path.resolve(projectRoot, getArg(args, "outDir") || "docs/cases/artifacts");

  const registry = readCaseRegistry(registryPath);
  const results: CaseRunResult[] = [];

  for (const demoCase of registry.cases) {
    console.log(`Running case: ${demoCase.id} (${demoCase.repoUrl}@${demoCase.commitSha})`);
    const result = await runCase({
      baseUrl,
      auditTimeoutMs,
      pollMs,
      outDir,
      demoCase
    });
    results.push(result);
    console.log(
      `- ${demoCase.id}: level=${result.actual.level || "N/A"}, score=${result.actual.score ?? "N/A"}, passed=${result.passed}`
    );
  }

  const generatedAt = new Date().toISOString();
  const runSummary = {
    generatedAt,
    baseUrl,
    registryPath,
    cases: results,
    passed: results.every((item) => item.passed)
  };

  const runLatestPath = path.resolve(outDir, "run-latest.json");
  writeJson(runLatestPath, runSummary);

  const casebookPath = path.resolve(projectRoot, "docs/cases/CASEBOOK.md");
  await fs.promises.writeFile(casebookPath, toCasebookMarkdown(runSummary), "utf8");

  console.log(`Saved run summary: ${runLatestPath}`);
  console.log(`Saved casebook: ${casebookPath}`);

  if (!runSummary.passed) {
    console.error("One or more cases failed assertions. See run-latest.json for details.");
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
