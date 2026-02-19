import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { defineChain } from "viem";
import { env } from "../config/env.js";

const opbnbTestnet = defineChain({
  id: 5611,
  name: "opBNB Testnet",
  nativeCurrency: {
    name: "tBNB",
    symbol: "tBNB",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: [env.opbnbRpcUrl]
    }
  },
  blockExplorers: {
    default: {
      name: "opBNBScan",
      url: "https://testnet.opbnbscan.com"
    }
  }
});

const ABI = [
  {
    type: "function",
    name: "attest",
    stateMutability: "nonpayable",
    inputs: [
      { name: "fingerprint", type: "bytes32" },
      { name: "score", type: "uint8" },
      { name: "reportURI", type: "string" },
      { name: "reportHash", type: "bytes32" },
      { name: "repo", type: "string" },
      { name: "commit", type: "string" }
    ],
    outputs: []
  }
] as const;

export async function submitAttestationOnchain(input: {
  fingerprint: string;
  score: number;
  reportUrl: string;
  reportHash: string;
  repoUrl: string;
  commitSha: string;
}): Promise<{
  txHash: string;
  chainId: number;
  contractAddress: string;
  attester: string;
  blockTime: number;
}> {
  if (!env.attesterPrivateKey || !env.contractAddress) {
    throw new Error("Missing PRIVATE_KEY or CLAWSHIELD_CONTRACT_ADDRESS in .env");
  }

  const normalizedPrivateKey = normalizePrivateKey(env.attesterPrivateKey);
  const normalizedContractAddress = normalizeContractAddress(env.contractAddress);

  const account = privateKeyToAccount(normalizedPrivateKey);

  const publicClient = createPublicClient({
    chain: opbnbTestnet,
    transport: http(env.opbnbRpcUrl)
  });

  const walletClient = createWalletClient({
    account,
    chain: opbnbTestnet,
    transport: http(env.opbnbRpcUrl)
  });

  const txHash = await walletClient.writeContract({
    account,
    chain: opbnbTestnet,
    address: normalizedContractAddress,
    abi: ABI,
    functionName: "attest",
    args: [
      input.fingerprint as `0x${string}`,
      input.score,
      input.reportUrl,
      input.reportHash as `0x${string}`,
      input.repoUrl,
      input.commitSha
    ]
  });

  const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
  const block = await publicClient.getBlock({ blockHash: receipt.blockHash });

  return {
    txHash,
    chainId: opbnbTestnet.id,
    contractAddress: normalizedContractAddress,
    attester: account.address,
    blockTime: Number(block.timestamp)
  };
}

function normalizePrivateKey(raw: string): `0x${string}` {
  const trimmed = raw.trim().replace(/^['"]|['"]$/g, "");
  const withPrefix = trimmed.startsWith("0x") ? trimmed : `0x${trimmed}`;
  if (!/^0x[0-9a-fA-F]{64}$/.test(withPrefix)) {
    const hexLength = withPrefix.slice(2).length;
    throw new Error(
      `Invalid PRIVATE_KEY format: expected 64 hex chars (32 bytes), got ${hexLength}.`
    );
  }
  return withPrefix as `0x${string}`;
}

function normalizeContractAddress(raw: string): `0x${string}` {
  const trimmed = raw.trim();
  if (!/^0x[0-9a-fA-F]{40}$/.test(trimmed)) {
    throw new Error("Invalid CLAWSHIELD_CONTRACT_ADDRESS format: expected 0x + 40 hex chars.");
  }
  return trimmed as `0x${string}`;
}
