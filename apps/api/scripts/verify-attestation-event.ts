import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as dotenv from "dotenv";
import { createPublicClient, decodeEventLog, defineChain, http, isAddress, parseAbiItem } from "viem";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(scriptDir, "..");
const projectRoot = path.resolve(workspaceRoot, "../..");

dotenv.config({ path: path.resolve(projectRoot, ".env") });
dotenv.config();

const opbnbTestnet = defineChain({
  id: 5611,
  name: "opBNB Testnet",
  nativeCurrency: { name: "tBNB", symbol: "tBNB", decimals: 18 },
  rpcUrls: {
    default: { http: [process.env.OPBNB_TESTNET_RPC_URL || "https://opbnb-testnet-rpc.bnbchain.org"] }
  },
  blockExplorers: {
    default: { name: "opBNBScan", url: "https://opbnb-testnet-scan.bnbchain.org" }
  }
});

const attestedEvent = parseAbiItem(
  "event Attested(bytes32 indexed fingerprint, uint8 score, address indexed attester, string reportURI, bytes32 reportHash, string repo, string commit, uint256 timestamp)"
);

type ArgsMap = Record<string, string | boolean>;

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
  npm run verify:event --workspace @clawshield/api -- --txHash <0x...> [options]

Required:
  --txHash <hash>               Transaction hash to verify

Optional:
  --rpcUrl <url>                RPC URL (fallback: OPBNB_TESTNET_RPC_URL)
  --contractAddress <0x...>     Contract address filter (fallback: CLAWSHIELD_CONTRACT_ADDRESS)
  --fingerprint <0x...bytes32>  Expected fingerprint
  --score <0-100>               Expected score
  --reportHash <0x...bytes32>   Expected report hash
  --reportURI <string>          Expected report URI
  --repo <string>               Expected repository URL
  --commit <string>             Expected commit SHA
  --attester <0x...>            Expected attester address
  --out <path>                  Optional JSON output path
`);
}

function assertHex(value: string, bytes: number, name: string): `0x${string}` {
  const expectedLength = bytes * 2 + 2;
  if (!/^0x[a-fA-F0-9]+$/.test(value) || value.length !== expectedLength) {
    throw new Error(`${name} must be 0x-prefixed ${bytes}-byte hex`);
  }
  return value as `0x${string}`;
}

function assertScore(value: string): number {
  if (!/^\d+$/.test(value)) {
    throw new Error("score must be an integer");
  }
  const parsed = Number(value);
  if (parsed < 0 || parsed > 100) {
    throw new Error("score must be in range 0-100");
  }
  return parsed;
}

function normalizeHex(value: string): string {
  return value.toLowerCase();
}

function normalizeAddress(value: string, name: string): string {
  if (!isAddress(value)) {
    throw new Error(`${name} must be a valid 0x address`);
  }
  return value.toLowerCase();
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || args.h) {
    printUsage();
    return;
  }

  const txHashArg = getArg(args, "txHash");
  if (!txHashArg) {
    printUsage();
    throw new Error("Missing required --txHash");
  }

  const txHash = assertHex(txHashArg, 32, "txHash");
  const rpcUrl =
    getArg(args, "rpcUrl") || process.env.OPBNB_TESTNET_RPC_URL || "https://opbnb-testnet-rpc.bnbchain.org";
  const contractArg = getArg(args, "contractAddress") || process.env.CLAWSHIELD_CONTRACT_ADDRESS;
  const contractAddress = contractArg ? normalizeAddress(contractArg, "contractAddress") : undefined;

  const expectedFingerprint = getArg(args, "fingerprint");
  const expectedScore = getArg(args, "score");
  const expectedReportHash = getArg(args, "reportHash");
  const expectedReportURI = getArg(args, "reportURI");
  const expectedRepo = getArg(args, "repo");
  const expectedCommit = getArg(args, "commit");
  const expectedAttester = getArg(args, "attester");
  const outputPathArg = getArg(args, "out");

  const publicClient = createPublicClient({
    chain: opbnbTestnet,
    transport: http(rpcUrl)
  });

  const receipt = await publicClient.getTransactionReceipt({ hash: txHash });
  const candidateLogs = contractAddress
    ? receipt.logs.filter((item) => item.address.toLowerCase() === contractAddress)
    : receipt.logs;

  if (candidateLogs.length === 0) {
    throw new Error("No logs found for the target contract address in this transaction");
  }

  let matched:
    | {
        log: (typeof candidateLogs)[number];
        decoded: {
          eventName: string;
          args: unknown;
        };
      }
    | undefined;

  for (const log of candidateLogs) {
    try {
      const decoded = decodeEventLog({
        abi: [attestedEvent],
        data: log.data,
        topics: log.topics
      });
      if (decoded.eventName === "Attested") {
        matched = { log, decoded };
        break;
      }
    } catch {
      continue;
    }
  }

  if (!matched) {
    throw new Error("Attested event not found in transaction logs");
  }

  const argsData = matched.decoded.args as {
    fingerprint: `0x${string}`;
    score: number | bigint;
    attester: `0x${string}`;
    reportURI: string;
    reportHash: `0x${string}`;
    repo: string;
    commit: string;
    timestamp: bigint;
  };

  const observed = {
    txHash,
    contractAddress: matched.log.address,
    blockNumber: Number(receipt.blockNumber),
    logIndex: Number(matched.log.logIndex),
    fingerprint: argsData.fingerprint,
    score: Number(argsData.score),
    attester: argsData.attester,
    reportURI: argsData.reportURI,
    reportHash: argsData.reportHash,
    repo: argsData.repo,
    commit: argsData.commit,
    timestamp: Number(argsData.timestamp)
  };

  const mismatches: string[] = [];

  if (expectedFingerprint && normalizeHex(observed.fingerprint) !== normalizeHex(assertHex(expectedFingerprint, 32, "fingerprint"))) {
    mismatches.push(`fingerprint mismatch: expected ${expectedFingerprint}, got ${observed.fingerprint}`);
  }

  if (expectedScore && observed.score !== assertScore(expectedScore)) {
    mismatches.push(`score mismatch: expected ${expectedScore}, got ${observed.score}`);
  }

  if (expectedReportHash && normalizeHex(observed.reportHash) !== normalizeHex(assertHex(expectedReportHash, 32, "reportHash"))) {
    mismatches.push(`reportHash mismatch: expected ${expectedReportHash}, got ${observed.reportHash}`);
  }

  if (expectedReportURI && observed.reportURI !== expectedReportURI) {
    mismatches.push(`reportURI mismatch: expected ${expectedReportURI}, got ${observed.reportURI}`);
  }

  if (expectedRepo && observed.repo !== expectedRepo) {
    mismatches.push(`repo mismatch: expected ${expectedRepo}, got ${observed.repo}`);
  }

  if (expectedCommit && observed.commit !== expectedCommit) {
    mismatches.push(`commit mismatch: expected ${expectedCommit}, got ${observed.commit}`);
  }

  if (expectedAttester && normalizeHex(observed.attester) !== normalizeHex(normalizeAddress(expectedAttester, "attester"))) {
    mismatches.push(`attester mismatch: expected ${expectedAttester}, got ${observed.attester}`);
  }

  if (mismatches.length > 0) {
    console.error("Event verification failed:");
    for (const item of mismatches) {
      console.error(`- ${item}`);
    }
    process.exit(1);
  }

  if (outputPathArg) {
    const resolved = path.resolve(projectRoot, outputPathArg);
    await fs.promises.mkdir(path.dirname(resolved), { recursive: true });
    await fs.promises.writeFile(resolved, `${JSON.stringify(observed, null, 2)}\n`, "utf8");
    console.log(`Saved: ${resolved}`);
  }

  console.log("Event verification passed.");
  console.log(JSON.stringify(observed, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
