"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";

export function WalletConnect() {
  const { isConnected, address } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  return (
    <div className="walletPanel">
      <strong>Attester Wallet</strong>
      {isConnected ? (
        <>
          <p>{address}</p>
          <button onClick={() => disconnect()}>Disconnect</button>
        </>
      ) : (
        <button
          onClick={() => {
            connect({ connector: connectors[0] });
          }}
          disabled={isPending || connectors.length === 0}
        >
          {isPending ? "Connecting..." : "Connect MetaMask"}
        </button>
      )}
    </div>
  );
}
