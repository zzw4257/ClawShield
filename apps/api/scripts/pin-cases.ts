import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { evaluateRisk } from "../src/services/scoring.js";
import { collectTextFiles } from "../src/lib/file-utils.js";
import type { RiskLevel, FindingDimension } from "@clawshield/shared-types";

type CandidateRepo = {
  url: string;
  maxCommits?: number;
};

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
  source: "pin-cases";
  cases: DemoCase[];
};

type Discovery = {
  repoUrl: string;
  commitSha: string;
  level: RiskLevel;
  score: number;
  dimensions: FindingDimension[];
};

const execFileAsync = promisify(execFile);

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(scriptDir, "..");
const projectRoot = path.resolve(workspaceRoot, "../..");
const candidatesPath = path.resolve(projectRoot, "docs/cases/candidate-repos.json");
const lockPath = path.resolve(projectRoot, "docs/cases/case-registry.lock.json");

async function runGit(args: string[], cwd: string): Promise<string> {
  const { stdout } = await execFileAsync("git", args, { cwd });
  return stdout.trim();
}

function parseCandidateRepos(): CandidateRepo[] {
  const raw = fs.readFileSync(candidatesPath, "utf8");
  const parsed = JSON.parse(raw) as { repos?: CandidateRepo[] };
  if (!Array.isArray(parsed.repos) || parsed.repos.length === 0) {
    throw new Error("docs/cases/candidate-repos.json has no repos");
  }
  return parsed.repos;
}

function makeCasePayload(id: DemoCase["id"], discovery: Discovery): DemoCase {
  if (id === "clean_baseline") {
    return {
      id,
      title: "Clean Baseline",
      problem:
        "Judges need a low-risk baseline to verify the pipeline can produce a reproducible green verdict.",
      repoUrl: discovery.repoUrl,
      commitSha: discovery.commitSha,
      expectedLevel: "green",
      expectedDimensions: [],
      expectedAttestability: "allowed"
    };
  }

  if (id === "remote_execution_risk") {
    return {
      id,
      title: "Remote Execution Risk",
      problem: "A common supply-chain pattern pipes remote scripts directly into shell execution.",
      repoUrl: discovery.repoUrl,
      commitSha: discovery.commitSha,
      expectedLevel: discovery.level,
      expectedDimensions: ["remote_execution"],
      expectedAttestability: "denied"
    };
  }

  return {
    id,
    title: "Credential Access Risk",
    problem:
      "Repository code frequently reads runtime secrets through environment variables and should be flagged for review.",
    repoUrl: discovery.repoUrl,
    commitSha: discovery.commitSha,
    expectedLevel: discovery.level,
    expectedDimensions: ["credential_access"],
    expectedAttestability: "denied"
  };
}

function hasDimension(dimensions: FindingDimension[], target: FindingDimension): boolean {
  return dimensions.includes(target);
}

function matchesCase(
  caseId: DemoCase["id"],
  level: RiskLevel,
  score: number,
  dimensions: FindingDimension[]
): boolean {
  if (caseId === "clean_baseline") {
    return level === "green" && score <= 29;
  }

  if (caseId === "remote_execution_risk") {
    return level !== "green" && hasDimension(dimensions, "remote_execution");
  }

  return level !== "green" && hasDimension(dimensions, "credential_access");
}

async function evaluateCommit(tmpDir: string, commit: string): Promise<Discovery | null> {
  await runGit(["checkout", "--detach", "--force", commit], tmpDir);
  const files = collectTextFiles(tmpDir);
  if (files.length === 0) {
    return null;
  }

  const risk = evaluateRisk(files);
  const dimensions = Array.from(new Set(risk.findings.map((item) => item.dimension)));
  return {
    repoUrl: "",
    commitSha: commit,
    level: risk.level,
    score: risk.score,
    dimensions
  };
}

async function discoverCases(): Promise<CaseRegistry> {
  const repos = parseCandidateRepos();

  const found = new Map<DemoCase["id"], DemoCase>();
  const usedTargets = new Set<string>();
  const usedRiskRepos = new Set<string>();

  for (const repo of repos) {
    const tmpDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), "clawshield-pin-"));

    try {
      const maxCommits = Math.max(1, Math.min(repo.maxCommits ?? 30, 100));
      await runGit(["clone", "--depth", String(maxCommits), repo.url, "."], tmpDir);

      const commitsRaw = await runGit(["rev-list", `--max-count=${maxCommits}`, "HEAD"], tmpDir);
      const commits = commitsRaw.split("\n").map((line) => line.trim()).filter(Boolean);

      for (const commit of commits) {
        const result = await evaluateCommit(tmpDir, commit);
        if (!result) continue;

        const discovery: Discovery = {
          ...result,
          repoUrl: repo.url
        };

        for (const caseId of [
          "clean_baseline",
          "remote_execution_risk",
          "credential_access_risk"
        ] as DemoCase["id"][]) {
          if (found.has(caseId)) {
            continue;
          }

          if (matchesCase(caseId, discovery.level, discovery.score, discovery.dimensions)) {
            const targetKey = `${discovery.repoUrl}@${discovery.commitSha}`;
            if (caseId !== "clean_baseline" && usedTargets.has(targetKey)) {
              continue;
            }
            if (caseId !== "clean_baseline" && usedRiskRepos.has(discovery.repoUrl)) {
              continue;
            }
            found.set(caseId, makeCasePayload(caseId, discovery));
            usedTargets.add(targetKey);
            if (caseId !== "clean_baseline") {
              usedRiskRepos.add(discovery.repoUrl);
            }
          }
        }

        if (found.size === 3) {
          break;
        }
      }
    } catch (error) {
      console.warn(`skip repo ${repo.url}: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      await fs.promises.rm(tmpDir, { recursive: true, force: true });
    }

    if (found.size === 3) {
      break;
    }
  }

  const missing = ["clean_baseline", "remote_execution_risk", "credential_access_risk"].filter(
    (id) => !found.has(id as DemoCase["id"])
  );

  if (missing.length > 0) {
    throw new Error(`Failed to pin all cases. Missing: ${missing.join(", ")}`);
  }

  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    source: "pin-cases",
    cases: [
      found.get("clean_baseline")!,
      found.get("remote_execution_risk")!,
      found.get("credential_access_risk")!
    ]
  };
}

async function main() {
  const registry = await discoverCases();
  await fs.promises.mkdir(path.dirname(lockPath), { recursive: true });
  await fs.promises.writeFile(lockPath, `${JSON.stringify(registry, null, 2)}\n`, "utf8");

  console.log(`Pinned cases saved: ${lockPath}`);
  for (const item of registry.cases) {
    console.log(
      `- ${item.id}: ${item.repoUrl}@${item.commitSha} (${item.expectedLevel}, dims=${item.expectedDimensions.join(",") || "none"})`
    );
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
