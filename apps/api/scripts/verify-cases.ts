import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { FindingDimension, RiskLevel } from "@clawshield/shared-types";

type CaseAttestability = "allowed" | "denied";

type DemoCase = {
  id: string;
  title: string;
  problem: string;
  repoUrl: string;
  commitSha: string;
  expectedLevel: RiskLevel;
  expectedDimensions: FindingDimension[];
  expectedAttestability: CaseAttestability;
};

type RunCase = {
  caseId: string;
  expected: {
    level: RiskLevel;
    dimensions: FindingDimension[];
    attestability: CaseAttestability;
  };
  actual: {
    status: "queued" | "running" | "done" | "failed";
    level?: RiskLevel;
    dimensions: FindingDimension[];
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
  };
};

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(scriptDir, "..");
const projectRoot = path.resolve(workspaceRoot, "../..");

function fileExists(filePath: string | undefined): boolean {
  return Boolean(filePath && fs.existsSync(filePath));
}

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

async function main() {
  const lockPath = path.resolve(projectRoot, "docs/cases/case-registry.lock.json");
  const runPath = path.resolve(projectRoot, "docs/cases/artifacts/run-latest.json");

  const lock = readJson<{ cases: DemoCase[] }>(lockPath);
  const run = readJson<{ cases: RunCase[]; passed: boolean; generatedAt: string }>(runPath);

  const errors: string[] = [];

  try {
    assert(Array.isArray(lock.cases) && lock.cases.length === 3, "lock file must contain exactly 3 cases");
    assert(Array.isArray(run.cases) && run.cases.length === 3, "run-latest.json must contain exactly 3 case results");
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error));
  }

  const runMap = new Map(run.cases.map((item) => [item.caseId, item]));

  for (const item of lock.cases) {
    const runCase = runMap.get(item.id);
    if (!runCase) {
      errors.push(`missing run result for case: ${item.id}`);
      continue;
    }

    if (!runCase.passed) {
      errors.push(`case failed assertions: ${item.id}`);
    }

    if (!runCase.assertions.auditDone) {
      errors.push(`audit not done: ${item.id}`);
    }

    if (runCase.actual.level !== item.expectedLevel) {
      errors.push(`level mismatch for ${item.id}: expected ${item.expectedLevel}, got ${runCase.actual.level}`);
    }

    const missingDims = item.expectedDimensions.filter((dim) => !runCase.actual.dimensions.includes(dim));
    if (missingDims.length > 0) {
      errors.push(`missing dimensions for ${item.id}: ${missingDims.join(", ")}`);
    }

    if (item.expectedAttestability === "allowed") {
      if (!runCase.actual.txHash) {
        errors.push(`missing txHash for attestable case ${item.id}`);
      }
      if (!runCase.assertions.eventVerified) {
        errors.push(`event not verified for ${item.id}`);
      }
    } else {
      if (runCase.actual.txHash) {
        errors.push(`risk case ${item.id} unexpectedly produced tx ${runCase.actual.txHash}`);
      }
      if (!String(runCase.actual.attestError || "").toLowerCase().includes("only green")) {
        errors.push(`risk case ${item.id} missing policy-denied evidence`);
      }
    }

    const expectedFiles = [
      runCase.artifactPaths.audit,
      runCase.artifactPaths.attest,
      runCase.artifactPaths.flow,
      path.resolve(runCase.artifactPaths.caseDir, "home.png"),
      path.resolve(runCase.artifactPaths.caseDir, "audit.png"),
      path.resolve(runCase.artifactPaths.caseDir, "fingerprint.png")
    ];

    if (item.expectedAttestability === "allowed") {
      expectedFiles.push(runCase.artifactPaths.event || "");
    }

    for (const artifact of expectedFiles) {
      if (!fileExists(artifact)) {
        errors.push(`missing artifact for ${item.id}: ${artifact}`);
      }
    }
  }

  const reportPath = path.resolve(projectRoot, "docs/cases/artifacts/verify-latest.json");
  fs.writeFileSync(
    reportPath,
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        runGeneratedAt: run.generatedAt,
        passed: errors.length === 0,
        errors
      },
      null,
      2
    )}\n`,
    "utf8"
  );

  console.log(`Saved verification report: ${reportPath}`);
  if (errors.length > 0) {
    console.error("Case verification failed:");
    for (const item of errors) {
      console.error(`- ${item}`);
    }
    process.exit(1);
  }

  console.log("Case verification passed.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
