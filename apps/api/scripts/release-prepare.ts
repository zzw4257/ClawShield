import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as dotenv from "dotenv";

type ArgsMap = Record<string, string | boolean>;

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(scriptDir, "..");
const projectRoot = path.resolve(workspaceRoot, "../..");

dotenv.config({ path: path.resolve(projectRoot, ".env") });
dotenv.config();

function parseArgs(argv: string[]): ArgsMap {
  const out: ArgsMap = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) continue;

    const raw = token.slice(2);
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

function requiredHexAddress(value: string | undefined, field: string): string {
  if (!value || !/^0x[a-fA-F0-9]{40}$/.test(value)) {
    throw new Error(`${field} must be a 0x-prefixed 40-byte hex address`);
  }
  return value;
}

function requiredHexHash(value: string | undefined, field: string): string {
  if (!value || !/^0x[a-fA-F0-9]{64}$/.test(value)) {
    throw new Error(`${field} must be a 0x-prefixed 32-byte hash`);
  }
  return value;
}

function run(cmd: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      cwd: projectRoot,
      env: process.env,
      stdio: "inherit"
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`${cmd} ${args.join(" ")} exited with ${code}`));
    });
  });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  const contractAddress = requiredHexAddress(
    getArg(args, "contractAddress") || process.env.CLAWSHIELD_CONTRACT_ADDRESS,
    "contractAddress"
  );
  const txHash = requiredHexHash(
    getArg(args, "txHash") || process.env.SUBMISSION_TX_HASH,
    "txHash"
  );
  const repoUrl = getArg(args, "repoUrl") || process.env.RELEASE_REPO_URL;
  const demoUrl = getArg(args, "demoUrl") || process.env.RELEASE_DEMO_URL;
  const videoUrl = getArg(args, "videoUrl") || process.env.RELEASE_VIDEO_URL;
  const apiHealthUrl = getArg(args, "apiHealthUrl") || process.env.RELEASE_API_HEALTH_URL;
  const explorerBase = getArg(args, "explorerBase") || "https://opbnb-testnet-scan.bnbchain.org";

  await run("npm", [
    "run",
    "verify:event",
    "--workspace",
    "@clawshield/api",
    "--",
    "--txHash",
    txHash,
    "--contractAddress",
    contractAddress,
    "--out",
    "docs/verification/event-latest.json"
  ]);

  const syncArgs = [
    "run",
    "sync:proof",
    "--workspace",
    "@clawshield/api",
    "--",
    "--contractAddress",
    contractAddress,
    "--txHash",
    txHash,
    "--explorerBase",
    explorerBase
  ];

  if (repoUrl) syncArgs.push("--repoUrl", repoUrl);
  if (demoUrl) syncArgs.push("--demoUrl", demoUrl);
  if (videoUrl) syncArgs.push("--videoUrl", videoUrl);
  if (apiHealthUrl) syncArgs.push("--apiHealthUrl", apiHealthUrl);

  await run("npm", syncArgs);

  await run("npm", [
    "run",
    "submission:generate",
    "--workspace",
    "@clawshield/api",
    "--",
    "--contractAddress",
    contractAddress,
    "--txHash",
    txHash,
    "--explorerBase",
    explorerBase,
    ...(repoUrl ? ["--repoUrl", repoUrl] : []),
    ...(demoUrl ? ["--demoUrl", demoUrl] : []),
    ...(videoUrl ? ["--videoUrl", videoUrl] : [])
  ]);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
