"use client";

import { useState } from "react";
import { PROOF, shortHex } from "../lib/proof";

export function ProofRibbon() {
  const [copied, setCopied] = useState<"contract" | "tx" | null>(null);

  async function copyText(kind: "contract" | "tx", value: string) {
    await navigator.clipboard.writeText(value);
    setCopied(kind);
    setTimeout(() => setCopied(null), 1200);
  }

  return (
    <div className="proofRibbon">
      <div className="proofCell">
        <span className="proofLabel">Contract</span>
        <code className="mono">{shortHex(PROOF.contractAddress, 8, 6)}</code>
        <a href={PROOF.contractExplorer} target="_blank" rel="noreferrer">
          Explorer
        </a>
        <button className="secondary" onClick={() => void copyText("contract", PROOF.contractAddress)}>
          {copied === "contract" ? "Copied" : "Copy"}
        </button>
      </div>
      <div className="proofCell">
        <span className="proofLabel">Proof TX</span>
        <code className="mono">{shortHex(PROOF.txHash, 8, 6)}</code>
        <a href={PROOF.txExplorer} target="_blank" rel="noreferrer">
          Explorer
        </a>
        <button className="secondary" onClick={() => void copyText("tx", PROOF.txHash)}>
          {copied === "tx" ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}
