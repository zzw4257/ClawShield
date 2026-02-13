import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as dotenv from "dotenv";
import { spawn } from "node:child_process";

interface FlowReport {
  config?: { contractAddress?: string };
  attestFirst?: { body?: { txHash?: string } };
  audit?: {
    fingerprint?: string;
    score?: number;
    reportHash?: string;
  };
}

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(scriptDir, "..");
const projectRoot = path.resolve(workspaceRoot, "../..");

dotenv.config({ path: path.resolve(projectRoot, ".env") });
dotenv.config();

function parseArgs(argv: string[]): Record<string, string | boolean> {
  const out: Record<string, string | boolean> = {};
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

function getArg(args: Record<string, string | boolean>, key: string): string | undefined {
  const value = args[key];
  return typeof value === "string" ? value : undefined;
}

function run(cmd: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      cwd: projectRoot,
      stdio: "inherit",
      env: process.env
    });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} ${args.join(" ")} exited with ${code}`));
    });
  });
}

function writeStatus(data: {
  status: "passed" | "failed";
  txHash: string;
  contractAddress: string;
  flowReportPath: string;
  eventReportPath: string;
}) {
  const statusPath = path.resolve(projectRoot, "docs/verification/STATUS.md");
  const body = `# Verification Status

- Last run (UTC): ${new Date().toISOString()}
- Status: ${data.status}
- Contract Address: ${data.contractAddress}
- Tx Hash: ${data.txHash}
- Flow report: \`${data.flowReportPath}\`
- Event report: \`${data.eventReportPath}\`
`;
  fs.mkdirSync(path.dirname(statusPath), { recursive: true });
  fs.writeFileSync(statusPath, body, "utf8");
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const flowOut = getArg(args, "flowOut") || "docs/verification/flow-latest.json";
  const eventOut = getArg(args, "eventOut") || "docs/verification/event-latest.json";

  await run("npm", ["run", "verify:flow", "--workspace", "@clawshield/api", "--", "--out", flowOut]);

  const flowPath = path.resolve(projectRoot, flowOut);
  if (!fs.existsSync(flowPath)) {
    throw new Error(`Flow report not found: ${flowPath}`);
  }

  const flow = JSON.parse(fs.readFileSync(flowPath, "utf8")) as FlowReport;
  const txHash = flow.attestFirst?.body?.txHash;
  const contractAddress = flow.config?.contractAddress || process.env.CLAWSHIELD_CONTRACT_ADDRESS;

  if (!txHash) {
    throw new Error("txHash missing in flow report");
  }
  if (!contractAddress) {
    throw new Error("contractAddress missing in flow report/.env");
  }

  const cmd = [
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
    eventOut
  ];

  if (flow.audit?.fingerprint) cmd.push("--fingerprint", flow.audit.fingerprint);
  if (typeof flow.audit?.score === "number") cmd.push("--score", String(flow.audit.score));
  if (flow.audit?.reportHash) cmd.push("--reportHash", flow.audit.reportHash);

  try {
    await run("npm", cmd);
    writeStatus({
      status: "passed",
      txHash,
      contractAddress,
      flowReportPath: flowOut,
      eventReportPath: eventOut
    });
  } catch (error) {
    writeStatus({
      status: "failed",
      txHash,
      contractAddress,
      flowReportPath: flowOut,
      eventReportPath: eventOut
    });
    throw error;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
