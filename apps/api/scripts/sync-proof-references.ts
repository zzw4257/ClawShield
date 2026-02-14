import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
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

function replaceOrThrow(text: string, regex: RegExp, value: string, label: string): string {
  if (!regex.test(text)) {
    throw new Error(`Pattern not found for ${label}`);
  }
  return text.replace(regex, value);
}

function updateFile(relPath: string, updater: (content: string) => string): void {
  const fullPath = path.resolve(projectRoot, relPath);
  const before = fs.readFileSync(fullPath, "utf8");
  const after = updater(before);
  if (before !== after) {
    fs.writeFileSync(fullPath, after, "utf8");
    console.log(`updated ${relPath}`);
  } else {
    console.log(`unchanged ${relPath}`);
  }
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
  const repoUrl =
    getArg(args, "repoUrl") || process.env.RELEASE_REPO_URL || "https://github.com/zzw4257/ClawShield";
  const demoUrl =
    getArg(args, "demoUrl") || process.env.RELEASE_DEMO_URL || "https://clawshield.vercel.app";
  const videoUrl =
    getArg(args, "videoUrl") || process.env.RELEASE_VIDEO_URL || "media/video/clawshield-demo.mp4";
  const apiHealthUrl =
    getArg(args, "apiHealthUrl") ||
    process.env.RELEASE_API_HEALTH_URL ||
    "https://clawshield-api.onrender.com/api/health";
  const explorerBase =
    getArg(args, "explorerBase") || "https://opbnb-testnet-scan.bnbchain.org";

  const contractExplorer = `${explorerBase}/address/${contractAddress}`;
  const txExplorer = `${explorerBase}/tx/${txHash}`;

  updateFile("README.md", (content) => {
    let next = content;
    next = replaceOrThrow(next, /^- Contract Address: `[^`]+`$/m, `- Contract Address: \`${contractAddress}\``, "README contract");
    next = replaceOrThrow(next, /^- Contract Explorer: `[^`]+`$/m, `- Contract Explorer: \`${contractExplorer}\``, "README contract explorer");
    next = replaceOrThrow(next, /^- Proof TX: `[^`]+`$/m, `- Proof TX: \`${txHash}\``, "README proof tx");
    next = replaceOrThrow(next, /^- TX Explorer: `[^`]+`$/m, `- TX Explorer: \`${txExplorer}\``, "README tx explorer");
    next = replaceOrThrow(next, /^- Live Demo: .+$/m, `- Live Demo: \`${demoUrl}\``, "README live demo");

    if (/^- API Health: `[^`]+`$/m.test(next)) {
      next = next.replace(/^- API Health: `[^`]+`$/m, `- API Health: \`${apiHealthUrl}\``);
    } else {
      next = next.replace(/^- Live Demo: `[^`]+`$/m, (line) => `${line}\n- API Health: \`${apiHealthUrl}\``);
    }

    next = replaceOrThrow(
      next,
      /npm run verify:event --workspace @clawshield\/api -- --txHash [^\s]+ --contractAddress [^\s\n]+/m,
      `npm run verify:event --workspace @clawshield/api -- --txHash ${txHash} --contractAddress ${contractAddress}`,
      "README verify:event"
    );

    return next;
  });

  updateFile("docs/PROOF_INDEX.md", (content) => {
    let next = content;
    next = replaceOrThrow(next, /^- Contract Address: `[^`]+`$/m, `- Contract Address: \`${contractAddress}\``, "PROOF_INDEX contract");
    next = replaceOrThrow(next, /^- Contract Explorer: `[^`]+`$/m, `- Contract Explorer: \`${contractExplorer}\``, "PROOF_INDEX contract explorer");
    next = replaceOrThrow(next, /^- Submission TX Hash: `[^`]+`$/m, `- Submission TX Hash: \`${txHash}\``, "PROOF_INDEX tx");
    next = replaceOrThrow(next, /^- TX Explorer: `[^`]+`$/m, `- TX Explorer: \`${txExplorer}\``, "PROOF_INDEX tx explorer");
    next = replaceOrThrow(
      next,
      /npm run verify:event --workspace @clawshield\/api -- --txHash [^\s]+ --contractAddress [^\s]+ --out docs\/verification\/event-latest\.json/m,
      `npm run verify:event --workspace @clawshield/api -- --txHash ${txHash} --contractAddress ${contractAddress} --out docs/verification/event-latest.json`,
      "PROOF_INDEX verify:event"
    );
    return next;
  });

  updateFile("docs/JUDGE_PACKET.md", (content) => {
    let next = content;
    next = replaceOrThrow(next, /^- Contract: `[^`]+`$/m, `- Contract: \`${contractAddress}\``, "JUDGE_PACKET contract");
    next = replaceOrThrow(next, /^- Proof TX: `[^`]+`$/m, `- Proof TX: \`${txHash}\``, "JUDGE_PACKET tx");
    next = replaceOrThrow(next, /^- API health: `[^`]+`$/m, `- API health: \`${apiHealthUrl}\``, "JUDGE_PACKET api health");
    next = replaceOrThrow(next, /^- Web: `[^`]+`$/m, `- Web: \`${demoUrl}\``, "JUDGE_PACKET web");
    next = replaceOrThrow(
      next,
      /npm run verify:event --workspace @clawshield\/api -- --txHash [^\s]+ --contractAddress [^\s\n]+/m,
      `npm run verify:event --workspace @clawshield/api -- --txHash ${txHash} --contractAddress ${contractAddress}`,
      "JUDGE_PACKET verify:event"
    );
    return next;
  });

  updateFile("docs/DEMO_RUNBOOK.md", (content) => {
    let next = content;
    next = replaceOrThrow(next, /^- Contract: `[^`]+`$/m, `- Contract: \`${contractAddress}\``, "DEMO_RUNBOOK contract");
    next = replaceOrThrow(next, /^- Proof TX: `[^`]+`$/m, `- Proof TX: \`${txHash}\``, "DEMO_RUNBOOK tx");
    return next;
  });

  updateFile("docs/DEMO_SCRIPT_90S.md", (content) => {
    let next = content;
    next = replaceOrThrow(next, /^  - Contract: `[^`]+`$/m, `  - Contract: \`${contractAddress}\``, "DEMO_SCRIPT contract");
    next = replaceOrThrow(next, /^  - TX: `[^`]+`$/m, `  - TX: \`${txHash}\``, "DEMO_SCRIPT tx");
    return next;
  });

  updateFile("docs/DORAHACKS_DESCRIPTION_PASTE.md", (content) => {
    let next = content;
    next = replaceOrThrow(next, /^- Contract: `[^`]+`$/m, `- Contract: \`${contractAddress}\``, "DORAHACKS_DESCRIPTION contract");
    next = replaceOrThrow(next, /^- Contract explorer: `[^`]+`$/m, `- Contract explorer: \`${contractExplorer}\``, "DORAHACKS_DESCRIPTION contract explorer");
    next = replaceOrThrow(next, /^- Proof tx: `[^`]+`$/m, `- Proof tx: \`${txHash}\``, "DORAHACKS_DESCRIPTION tx");
    next = replaceOrThrow(next, /^- TX explorer: `[^`]+`$/m, `- TX explorer: \`${txExplorer}\``, "DORAHACKS_DESCRIPTION tx explorer");
    next = replaceOrThrow(next, /^- Repository: .+$/m, `- Repository: \`${repoUrl}\``, "DORAHACKS_DESCRIPTION repo");
    next = replaceOrThrow(next, /^- Demo URL: .+$/m, `- Demo URL: \`${demoUrl}\``, "DORAHACKS_DESCRIPTION demo");
    return next;
  });

  updateFile("docs/DORAHACKS_SUBMISSION.md", (content) => {
    let next = content;
    next = replaceOrThrow(next, /^- Contract: `[^`]+`$/m, `- Contract: \`${contractAddress}\``, "DORAHACKS_SUBMISSION contract");
    next = replaceOrThrow(next, /^- Explorer: `[^`]+`$/m, `- Explorer: \`${contractExplorer}\``, "DORAHACKS_SUBMISSION explorer");
    next = replaceOrThrow(next, /^- Tx hash: `[^`]+`$/m, `- Tx hash: \`${txHash}\``, "DORAHACKS_SUBMISSION tx");
    return next;
  });

  updateFile("docs/submission.config.json", (content) => {
    const json = JSON.parse(content) as Record<string, unknown>;
    json.repoUrl = repoUrl;
    json.demoUrl = demoUrl;
    json.videoUrl = videoUrl;
    return `${JSON.stringify(json, null, 2)}\n`;
  });

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
    "--repoUrl",
    repoUrl,
    "--demoUrl",
    demoUrl,
    "--videoUrl",
    videoUrl,
    "--explorerBase",
    explorerBase
  ]);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
