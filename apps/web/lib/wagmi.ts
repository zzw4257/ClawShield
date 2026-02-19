import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { defineChain } from "viem";

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
      http: [process.env.NEXT_PUBLIC_OPBNB_RPC_URL || "https://opbnb-testnet-rpc.bnbchain.org"]
    }
  },
  blockExplorers: {
    default: {
      name: "opBNBScan",
      url: "https://testnet.opbnbscan.com"
    }
  }
});

export const wagmiConfig = createConfig({
  chains: [opbnbTestnet],
  connectors: [injected()],
  transports: {
    [opbnbTestnet.id]: http()
  }
});
