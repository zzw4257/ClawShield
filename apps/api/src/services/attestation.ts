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
      url: "https://opbnb-testnet-scan.bnbchain.org"
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

  const normalizedPrivateKey = env.attesterPrivateKey.startsWith("0x")
    ? env.attesterPrivateKey
    : `0x${env.attesterPrivateKey}`;

  const account = privateKeyToAccount(normalizedPrivateKey as `0x${string}`);

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
    address: env.contractAddress as `0x${string}`,
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
    contractAddress: env.contractAddress,
    attester: account.address,
    blockTime: Number(block.timestamp)
  };
}
