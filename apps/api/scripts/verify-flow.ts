import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as dotenv from "dotenv";

type ArgsMap = Record<string, string | boolean>;

type RequestResult<T> = {
  ok: boolean;
  status: number;
  body: T;
};

type AuditStatusResponse = {
  status: "queued" | "running" | "done" | "failed";
  fingerprint?: string;
  score?: number;
  level?: "green" | "yellow" | "red";
  reportUrl?: string;
  reportHash?: string;
  findings?: unknown[];
  llmSummary?: string;
  error?: string;
};

type AttestResponse = {
  txHash: string;
  chainId: number;
  contractAddress: string;
  reused?: boolean;
  error?: string;
};

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(scriptDir, "..");
const projectRoot = path.resolve(workspaceRoot, "../..");

dotenv.config({ path: path.resolve(projectRoot, ".env") });
dotenv.config();

function parseArgs(argv: string[]): ArgsMap {
  const out: ArgsMap = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) {
      continue;
    }

    const raw = token.slice(2);
    if (raw.includes("=")) {
      const [key, value] = raw.split("=", 2);
      out[key] = value;
      continue;
    }

    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      out[raw] = true;
      continue;
    }

    out[raw] = next;
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
  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${key} must be a positive number`);
  }
  return value;
}

function nowIso(): string {
  return new Date().toISOString();
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function printUsage(): void {
  console.log(`Usage:
  npm run verify:flow --workspace @clawshield/api -- [options]

Options:
  --baseUrl <url>               API base URL (default: NEXT_PUBLIC_API_URL or http://localhost:8787)
  --repoUrl <url>               Repo URL to audit
  --commitSha <sha>             Commit SHA to audit
  --maxWaitMs <ms>              Max wait for audit completion (default: 120000)
  --pollMs <ms>                 Poll interval (default: 1500)
  --out <path>                  Output JSON report path (default: docs/verification/flow-latest.json)

Examples:
  npm run verify:flow --workspace @clawshield/api
  npm run verify:flow --workspace @clawshield/api -- --repoUrl https://github.com/octocat/Hello-World --commitSha 7fd1a60b01f91b314f59955a4e4d4e80d8edf11d
`);
}

async function requestJson<T>(url: string, options?: RequestInit): Promise<RequestResult<T>> {
  const response = await fetch(url, options);
  let body: T | Record<string, unknown>;
  try {
    body = (await response.json()) as T;
  } catch {
    body = {} as Record<string, unknown>;
  }
  return {
    ok: response.ok,
    status: response.status,
    body: body as T
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || args.h) {
    printUsage();
    return;
  }

  const baseUrl = getArg(args, "baseUrl") || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";
  const repoUrl = getArg(args, "repoUrl") || "https://github.com/octocat/Hello-World";
  const commitSha = getArg(args, "commitSha") || "7fd1a60b01f91b314f59955a4e4d4e80d8edf11d";
  const maxWaitMs = getNumArg(args, "maxWaitMs", 120_000);
  const pollMs = getNumArg(args, "pollMs", 1_500);
  const outputPath = path.resolve(
    projectRoot,
    getArg(args, "out") || path.join("docs", "verification", "flow-latest.json")
  );

  const report: Record<string, unknown> = {
    startedAt: nowIso(),
    config: {
      baseUrl,
      repoUrl,
      commitSha,
      maxWaitMs,
      pollMs,
      contractAddress: process.env.CLAWSHIELD_CONTRACT_ADDRESS || null
    }
  };

  const health = await requestJson<{ status: string }>(`${baseUrl}/api/health`);
  report.health = health;
  if (!health.ok) {
    throw new Error(`health check failed: HTTP ${health.status}`);
  }

  const start = await requestJson<{ auditId: string; status: string }>(`${baseUrl}/api/audit/start`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ repoUrl, commitSha })
  });
  report.startAudit = start;
  if (!start.ok) {
    throw new Error(`audit start failed: HTTP ${start.status}`);
  }

  const auditId = start.body.auditId;
  if (!auditId) {
    throw new Error("audit start response missing auditId");
  }

  const polls: AuditStatusResponse[] = [];
  const deadline = Date.now() + maxWaitMs;
  let finalAudit: AuditStatusResponse | undefined;

  while (Date.now() < deadline) {
    await sleep(pollMs);
    const poll = await requestJson<AuditStatusResponse>(`${baseUrl}/api/audit/${auditId}`);
    if (!poll.ok) {
      throw new Error(`audit poll failed: HTTP ${poll.status}`);
    }
    polls.push(poll.body);
    if (poll.body.status === "done" || poll.body.status === "failed") {
      finalAudit = poll.body;
      break;
    }
  }

  report.polls = {
    count: polls.length,
    statuses: polls.map((item) => item.status)
  };
  report.audit = finalAudit || null;

  if (!finalAudit || finalAudit.status !== "done") {
    throw new Error(`audit not completed successfully: ${finalAudit?.status || "timeout"}`);
  }

  if (!finalAudit.reportUrl) {
    throw new Error("audit completed but reportUrl is missing");
  }

  const reportFetch = await requestJson<Record<string, unknown>>(finalAudit.reportUrl);
  report.reportFetch = {
    ok: reportFetch.ok,
    status: reportFetch.status,
    reportId: reportFetch.body.reportId,
    level: reportFetch.body.level,
    score: reportFetch.body.score
  };
  if (!reportFetch.ok) {
    throw new Error(`report fetch failed: HTTP ${reportFetch.status}`);
  }

  const attestFirst = await requestJson<AttestResponse>(`${baseUrl}/api/attest`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ auditId })
  });
  report.attestFirst = attestFirst;
  if (!attestFirst.ok) {
    throw new Error(`first attestation failed: HTTP ${attestFirst.status}`);
  }

  const attestSecond = await requestJson<AttestResponse>(`${baseUrl}/api/attest`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ auditId })
  });
  report.attestSecond = attestSecond;
  if (!attestSecond.ok) {
    throw new Error(`second attestation failed: HTTP ${attestSecond.status}`);
  }

  const attestationList = await requestJson<{
    latest: { txHash?: string } | null;
    history: Array<{ txHash?: string }>;
  }>(`${baseUrl}/api/attestations/${finalAudit.fingerprint}`);
  report.attestationList = {
    ok: attestationList.ok,
    status: attestationList.status,
    latestTx: attestationList.body.latest?.txHash || null,
    historyCount: Array.isArray(attestationList.body.history) ? attestationList.body.history.length : 0
  };
  if (!attestationList.ok) {
    throw new Error(`attestation list fetch failed: HTTP ${attestationList.status}`);
  }

  const checks = {
    auditDone: finalAudit.status === "done",
    levelIsGreen: finalAudit.level === "green",
    firstTxPresent: Boolean(attestFirst.body.txHash),
    secondReused: attestSecond.body.reused === true,
    secondTxMatchesFirst: attestSecond.body.txHash === attestFirst.body.txHash,
    latestMatchesFirst: attestationList.body.latest?.txHash === attestFirst.body.txHash
  };
  report.assertions = checks;
  report.finishedAt = nowIso();

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), "utf8");

  if (!Object.values(checks).every(Boolean)) {
    console.error("Flow verification completed with failed assertions.");
    console.error(JSON.stringify(report, null, 2));
    process.exit(1);
  }

  console.log("Flow verification passed.");
  console.log(`Report: ${outputPath}`);
  console.log(`AuditId: ${auditId}`);
  console.log(`TxHash: ${attestFirst.body.txHash}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
