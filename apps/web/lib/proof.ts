const DEFAULT_CONTRACT = "0x8F4aF898fc2f28281D2a51d322b586C1DA0481f9";
const DEFAULT_TX = "0x7c4b2c3d5bb8dd1aaa34c9dd7a218b0ab91f607d9faac237b40d6500378eab77";
const EXPLORER_BASE = "https://testnet.opbnbscan.com";

export const PROOF = {
  contractAddress: process.env.NEXT_PUBLIC_CLAWSHIELD_CONTRACT_ADDRESS || DEFAULT_CONTRACT,
  txHash: process.env.NEXT_PUBLIC_SUBMISSION_TX_HASH || DEFAULT_TX,
  explorerBase: EXPLORER_BASE,
  get contractExplorer() {
    return `${EXPLORER_BASE}/address/${this.contractAddress}`;
  },
  get txExplorer() {
    return `${EXPLORER_BASE}/tx/${this.txHash}`;
  }
};

export function shortHex(value: string, head = 6, tail = 4): string {
  if (!value || value.length < head + tail + 3) {
    return value;
  }
  return `${value.slice(0, head)}...${value.slice(-tail)}`;
}
