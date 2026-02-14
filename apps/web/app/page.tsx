"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { startAudit } from "../lib/api";
import { WalletConnect } from "../components/wallet-connect";

export default function HomePage() {
  const router = useRouter();
  const [repoUrl, setRepoUrl] = useState("");
  const [commitSha, setCommitSha] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const payload = await startAudit({ repoUrl, commitSha });
      router.push(`/audits/${payload.auditId}`);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Unknown error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main>
      <section className="hero">
        <p className="small">BNB Chain Good Vibes Only · Agent Track</p>
        <h1>ClawShield</h1>
        <p>
          Audit one OpenClaw commit, get a deterministic risk verdict, and verify the attestation
          on opBNB testnet.
        </p>
        <div className="grid">
          <form className="formCard" onSubmit={onSubmit}>
            <h3>Start Audit</h3>
            <label>
              GitHub Repository URL
              <input
                value={repoUrl}
                onChange={(event) => setRepoUrl(event.target.value)}
                placeholder="https://github.com/org/repo"
                required
              />
            </label>
            <label>
              Commit SHA
              <input
                value={commitSha}
                onChange={(event) => setCommitSha(event.target.value)}
                placeholder="e.g. 9fceb02"
                required
              />
            </label>
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Queueing..." : "Run Audit"}
            </button>
            {error ? <p className="small">{error}</p> : null}
          </form>
          <WalletConnect />
        </div>
      </section>
    </main>
  );
}
