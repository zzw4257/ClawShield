"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { startAudit } from "../lib/api";
import type { DemoCase } from "../lib/cases";
import { AttesterBoundaryCard } from "./attester-boundary-card";

export function HomeClient({ demoCases }: { demoCases: DemoCase[] }) {
  const router = useRouter();
  const [repoUrl, setRepoUrl] = useState("");
  const [commitSha, setCommitSha] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sortedCases = useMemo(() => {
    return [...demoCases].sort((a, b) => {
      const order = ["clean_baseline", "remote_execution_risk", "credential_access_risk"];
      return order.indexOf(a.id) - order.indexOf(b.id);
    });
  }, [demoCases]);

  async function submitAudit(targetRepoUrl: string, targetCommitSha: string) {
    setIsSubmitting(true);
    setError(null);

    try {
      const payload = await startAudit({ repoUrl: targetRepoUrl, commitSha: targetCommitSha });
      router.push(`/audits/${payload.auditId}`);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Unknown error");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submitAudit(repoUrl, commitSha);
  }

  return (
    <main>
      <section className="hero">
        <p className="small">BNB Chain Good Vibes Only · Agent Track</p>
        <h1>ClawShield</h1>
        <p>
          Commit-bound security attestation: run a deterministic audit, inspect concrete findings,
          and prove trust decisions onchain.
        </p>

        <div className="caseGallery" aria-label="Case gallery">
          <h2>Case Gallery</h2>
          <div className="caseGrid">
            {sortedCases.map((item) => (
              <article key={item.id} className="caseCard">
                <p className="small caseTag">{item.id}</p>
                <h3>{item.title}</h3>
                <p>{item.problem}</p>
                <p className="mono">Input: {item.repoUrl}</p>
                <p className="mono">Commit: {item.commitSha}</p>
                <p className="small">
                  Expected: <strong>{item.expectedLevel.toUpperCase()}</strong>
                  {item.expectedDimensions.length > 0
                    ? ` · ${item.expectedDimensions.join(", ")}`
                    : " · no high-risk dimension"}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setRepoUrl(item.repoUrl);
                    setCommitSha(item.commitSha);
                    void submitAudit(item.repoUrl, item.commitSha);
                  }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Running..." : "Run This Case"}
                </button>
              </article>
            ))}
          </div>
        </div>

        <div className="grid homeLowerGrid">
          <form className="formCard" onSubmit={onSubmit}>
            <h3>Manual Input (Secondary)</h3>
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
            <p className="small">
              Flow: submit input {">"} monitor status {">"} inspect findings {">"} attest if green {">"} verify
              by fingerprint.
            </p>
          </form>

          <AttesterBoundaryCard />
        </div>
      </section>
    </main>
  );
}
