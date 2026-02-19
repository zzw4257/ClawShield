import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

type RunCase = {
  caseId: string;
  repoUrl: string;
  commitSha: string;
  expected?: {
    level?: string;
    dimensions?: string[];
    attestability?: string;
  };
  actual: {
    auditId: string;
    status?: string;
    level?: string;
    score?: number;
  };
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

type RunSummary = {
  generatedAt: string;
  baseUrl: string;
  cases: RunCase[];
  passed: boolean;
};

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(scriptDir, "..");
const projectRoot = path.resolve(webRoot, "../..");
const runSummaryPath = path.resolve(projectRoot, "docs/cases/artifacts/run-latest.json");

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

function writeJson(filePath: string, data: unknown): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function toCasebookMarkdown(projectRootPath: string, run: RunSummary): string {
  const casesRoot = path.resolve(projectRootPath, "docs/cases");
  const lines: string[] = [];

  lines.push("# CASEBOOK");
  lines.push("");
  lines.push("This file captures concrete demo cases with reproducible evidence artifacts.");
  lines.push("");
  lines.push(`- Generated at (UTC): ${run.generatedAt}`);
  lines.push(`- API Base URL: ${run.baseUrl}`);
  lines.push("");

  for (const item of run.cases) {
    const audit = fs.existsSync(item.artifactPaths.audit)
      ? readJson<{
          status?: string;
          score?: number;
          level?: string;
          findings?: Array<{ dimension?: string }>;
        }>(item.artifactPaths.audit)
      : {};
    const attest = fs.existsSync(item.artifactPaths.attest)
      ? readJson<{ body?: { txHash?: string; error?: string } }>(item.artifactPaths.attest)
      : {};

    const dimensions = Array.isArray(audit.findings)
      ? Array.from(new Set(audit.findings.map((f) => f.dimension).filter(Boolean)))
      : [];
    const expected = (item as unknown as {
      expected?: { level?: string; dimensions?: string[]; attestability?: string };
    }).expected;

    lines.push(`## ${item.caseId}`);
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
    lines.push(`- Audit ID: \`${item.actual.auditId}\``);
    lines.push(`- Repo: \`${(item as unknown as { repoUrl?: string }).repoUrl || "N/A"}\``);
    lines.push(`- Commit: \`${(item as unknown as { commitSha?: string }).commitSha || "N/A"}\``);
    lines.push("");
    lines.push("### Expected");
    lines.push(`- Level: \`${expected?.level || "N/A"}\``);
    lines.push(
      `- Required dimensions: ${Array.isArray(expected?.dimensions) && expected.dimensions.length > 0 ? expected.dimensions.map((dim) => `\`${dim}\``).join(", ") : "none"}`
    );
    lines.push(`- Attestation: \`${expected?.attestability || "N/A"}\``);
    lines.push("");
    lines.push("### Actual");
    lines.push(`- Status: \`${audit.status || "N/A"}\``);
    lines.push(`- Score/Level: \`${audit.score ?? "N/A"} / ${audit.level ?? "N/A"}\``);
    lines.push(`- Dimensions: ${dimensions.length > 0 ? dimensions.map((dim) => `\`${dim}\``).join(", ") : "none"}`);
    lines.push(
      `- Attestation outcome: ${attest.body?.txHash ? `success, tx=\`${attest.body.txHash}\`` : `denied (${attest.body?.error || "no tx"})`}`
    );
    lines.push("");
    lines.push("### Evidence Links");
    lines.push(`- audit.json: \`${path.relative(casesRoot, item.artifactPaths.audit)}\``);
    lines.push(`- attest.json: \`${path.relative(casesRoot, item.artifactPaths.attest)}\``);
    lines.push(`- flow.json: \`${path.relative(casesRoot, path.resolve(item.artifactPaths.caseDir, "flow.json"))}\``);
    if (fs.existsSync(path.resolve(item.artifactPaths.caseDir, "report.json"))) {
      lines.push(
        `- report.json: \`${path.relative(casesRoot, path.resolve(item.artifactPaths.caseDir, "report.json"))}\``
      );
    }
    if (fs.existsSync(path.resolve(item.artifactPaths.caseDir, "event.json"))) {
      lines.push(
        `- event.json: \`${path.relative(casesRoot, path.resolve(item.artifactPaths.caseDir, "event.json"))}\``
      );
    }
    if (item.artifactPaths.screenshots?.home) {
      lines.push(`- home.png: \`${path.relative(casesRoot, item.artifactPaths.screenshots.home)}\``);
    }
    if (item.artifactPaths.screenshots?.audit) {
      lines.push(`- audit.png: \`${path.relative(casesRoot, item.artifactPaths.screenshots.audit)}\``);
    }
    if (item.artifactPaths.screenshots?.fingerprint) {
      lines.push(
        `- fingerprint.png: \`${path.relative(casesRoot, item.artifactPaths.screenshots.fingerprint)}\``
      );
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

async function main() {
  const baseUrl = process.env.CASES_WEB_BASE_URL || "http://localhost:3000";

  if (!fs.existsSync(runSummaryPath)) {
    throw new Error(`run summary not found: ${runSummaryPath}`);
  }

  const runSummary = readJson<RunSummary>(runSummaryPath);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  for (const item of runSummary.cases) {
    const caseDir = path.resolve(item.artifactPaths.caseDir);
    fs.mkdirSync(caseDir, { recursive: true });

    const homePath = path.resolve(caseDir, "home.png");
    const auditPath = path.resolve(caseDir, "audit.png");
    const fingerprintPath = path.resolve(caseDir, "fingerprint.png");

    await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
    await page.screenshot({ path: homePath, fullPage: true });

    await page.goto(`${baseUrl}/audits/${item.actual.auditId}`, { waitUntil: "networkidle" });
    await page.screenshot({ path: auditPath, fullPage: true });

    let fingerprint: string | undefined;
    if (fs.existsSync(item.artifactPaths.audit)) {
      const audit = readJson<{ fingerprint?: string }>(item.artifactPaths.audit);
      fingerprint = audit.fingerprint;
    }

    if (fingerprint) {
      await page.goto(`${baseUrl}/fingerprint/${fingerprint}`, { waitUntil: "networkidle" });
      await page.screenshot({ path: fingerprintPath, fullPage: true });
    }

    item.artifactPaths.screenshots = {
      home: homePath,
      audit: auditPath,
      fingerprint: fs.existsSync(fingerprintPath) ? fingerprintPath : undefined
    };

    console.log(`captured screenshots for ${item.caseId}`);
  }

  await browser.close();

  runSummary.generatedAt = new Date().toISOString();
  writeJson(runSummaryPath, runSummary);
  const casebookPath = path.resolve(projectRoot, "docs/cases/CASEBOOK.md");
  fs.writeFileSync(casebookPath, toCasebookMarkdown(projectRoot, runSummary), "utf8");
  console.log(`updated run summary: ${runSummaryPath}`);
  console.log(`updated casebook: ${casebookPath}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
