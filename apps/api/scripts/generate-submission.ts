import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as dotenv from "dotenv";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(scriptDir, "..");
const projectRoot = path.resolve(workspaceRoot, "../..");

dotenv.config({ path: path.resolve(projectRoot, ".env") });
dotenv.config();

type ArgsMap = Record<string, string | boolean>;

type SubmissionConfig = {
  buidlName: string;
  track: string;
  isAiAgent: string;
  oneLiner: string;
  problem: string;
  solution: string;
  keyDifferentiators: string[];
  reproducibility: string[];
  aiBuildLog: string[];
  repoUrl?: string;
  demoUrl?: string;
  videoUrl?: string;
};

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

function printUsage(): void {
  console.log(`Usage:
  npm run submission:generate --workspace @clawshield/api -- [options]

Options:
  --config <path>               Config file path (default: docs/submission.config.json)
  --out <path>                  Output markdown path (default: docs/DORAHACKS_SUBMISSION_FINAL.md)
  --contractAddress <0x...>     Override contract address
  --txHash <0x...>              Override proof tx hash
  --repoUrl <url>               Override repository URL
  --demoUrl <url>               Override demo URL
  --videoUrl <url>              Override video URL
  --explorerBase <url>          Override explorer base URL
`);
}

function assertStringArray(input: unknown, field: string): string[] {
  if (!Array.isArray(input) || input.some((item) => typeof item !== "string")) {
    throw new Error(`${field} must be string[]`);
  }
  return input as string[];
}

function loadConfig(configPath: string): SubmissionConfig {
  if (!fs.existsSync(configPath)) {
    throw new Error(`Config not found: ${configPath}`);
  }
  const json = JSON.parse(fs.readFileSync(configPath, "utf8")) as Record<string, unknown>;

  const must = (key: keyof SubmissionConfig): string => {
    const value = json[key];
    if (typeof value !== "string" || !value.trim()) {
      throw new Error(`submission config missing field: ${String(key)}`);
    }
    return value.trim();
  };

  return {
    buidlName: must("buidlName"),
    track: must("track"),
    isAiAgent: must("isAiAgent"),
    oneLiner: must("oneLiner"),
    problem: must("problem"),
    solution: must("solution"),
    keyDifferentiators: assertStringArray(json.keyDifferentiators, "keyDifferentiators"),
    reproducibility: assertStringArray(json.reproducibility, "reproducibility"),
    aiBuildLog: assertStringArray(json.aiBuildLog, "aiBuildLog"),
    repoUrl: typeof json.repoUrl === "string" ? json.repoUrl : undefined,
    demoUrl: typeof json.demoUrl === "string" ? json.demoUrl : undefined,
    videoUrl: typeof json.videoUrl === "string" ? json.videoUrl : undefined
  };
}

function isHexAddress(value: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(value);
}

function isHexHash(value: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(value);
}

function nullableLine(label: string, value?: string): string {
  return value && value.trim() ? `- ${label}: ${value.trim()}` : `- ${label}: TBD`;
}

function generateMarkdown(params: {
  config: SubmissionConfig;
  contractAddress: string;
  txHash: string;
  explorerBase: string;
  repoUrl?: string;
  demoUrl?: string;
  videoUrl?: string;
  generatedAt: string;
}): string {
  const { config } = params;
  const explorerBase = params.explorerBase.replace(/\/$/, "");
  const contractLink = isHexAddress(params.contractAddress)
    ? `${explorerBase}/address/${params.contractAddress}`
    : "TBD";
  const txLink = isHexHash(params.txHash) ? `${explorerBase}/tx/${params.txHash}` : "TBD";

  return `# DoraHacks Submission Final

Generated at: ${params.generatedAt}

## BUIDL Name
${config.buidlName}

## Track
${config.track}

## One-Liner
${config.oneLiner}

## Is this an AI Agent?
${config.isAiAgent}

## Problem
${config.problem}

## Solution
${config.solution}

## Key Differentiators
${config.keyDifferentiators.map((item) => `- ${item}`).join("\n")}

## Onchain Proof
- Contract Address: ${params.contractAddress}
- Explorer (Contract): ${contractLink}
- Proof TX Hash: ${params.txHash}
- Explorer (TX): ${txLink}

## Links
${nullableLine("Repository", params.repoUrl || config.repoUrl)}
${nullableLine("Demo", params.demoUrl || config.demoUrl)}
${nullableLine("Video", params.videoUrl || config.videoUrl)}

## Reproducibility
${config.reproducibility.map((item) => `- ${item}`).join("\n")}

## AI Build Log Evidence
${config.aiBuildLog.map((item) => `- ${item}`).join("\n")}
`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || args.h) {
    printUsage();
    return;
  }

  const configPath = path.resolve(
    projectRoot,
    getArg(args, "config") || path.join("docs", "submission.config.json")
  );
  const outputPath = path.resolve(
    projectRoot,
    getArg(args, "out") || path.join("docs", "DORAHACKS_SUBMISSION_FINAL.md")
  );

  const config = loadConfig(configPath);
  const contractAddress = getArg(args, "contractAddress") || process.env.CLAWSHIELD_CONTRACT_ADDRESS || "TBD";
  const txHash = getArg(args, "txHash") || process.env.SUBMISSION_TX_HASH || "TBD";
  const explorerBase = getArg(args, "explorerBase") || "https://opbnb-testnet-scan.bnbchain.org";
  const repoUrl = getArg(args, "repoUrl");
  const demoUrl = getArg(args, "demoUrl");
  const videoUrl = getArg(args, "videoUrl");

  const markdown = generateMarkdown({
    config,
    contractAddress,
    txHash,
    explorerBase,
    repoUrl,
    demoUrl,
    videoUrl,
    generatedAt: new Date().toISOString()
  });

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, markdown, "utf8");
  console.log(`submission generated: ${outputPath}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
