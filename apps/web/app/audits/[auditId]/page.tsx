"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getAudit, submitAttestation } from "../../../lib/api";
import { ScoreBadge } from "../../../components/score-badge";

type AuditResponse = {
  status: "queued" | "running" | "done" | "failed";
  fingerprint?: string;
  score?: number;
  level?: "green" | "yellow" | "red";
  reportUrl?: string;
  reportHash?: string;
  findings?: Array<{
    id: string;
    dimension: string;
    severity: string;
    evidence: string;
    explanation: string;
    recommendation: string;
  }>;
  llmSummary?: string;
  error?: string;
};

export default function AuditDetailPage() {
  const params = useParams<{ auditId: string }>();
  const auditId = params.auditId;

  const [audit, setAudit] = useState<AuditResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAttesting, setIsAttesting] = useState(false);
  const [tx, setTx] = useState<string | null>(null);
  const [attestError, setAttestError] = useState<string | null>(null);

  const shouldPoll = useMemo(() => {
    if (!audit) return true;
    return audit.status === "queued" || audit.status === "running";
  }, [audit]);

  const loadAudit = useCallback(async () => {
    const payload = (await getAudit(auditId)) as AuditResponse;
    setAudit(payload);
    setIsLoading(false);
  }, [auditId]);

  useEffect(() => {
    void loadAudit();
  }, [loadAudit]);

  useEffect(() => {
    if (!shouldPoll) {
      return;
    }
    const timer = setInterval(() => {
      void loadAudit();
    }, 2200);

    return () => clearInterval(timer);
  }, [loadAudit, shouldPoll]);

  async function attest() {
    setIsAttesting(true);
    setAttestError(null);
    try {
      const payload = await submitAttestation(auditId);
      setTx(payload.txHash);
    } catch (error) {
      setAttestError(error instanceof Error ? error.message : "Failed to attest");
    } finally {
      setIsAttesting(false);
    }
  }

  return (
    <main>
      <section className="hero">
        <h2>Audit Status</h2>
        <p className="mono">Audit ID: {auditId}</p>

        {isLoading ? <p>Loading...</p> : null}

        {audit ? (
          <div className="grid">
            <article className="panel">
              <h3>Summary</h3>
              <p>Status: {audit.status}</p>
              <ScoreBadge level={audit.level} score={audit.score} />
              {audit.fingerprint ? (
                <p className="mono">Fingerprint: {audit.fingerprint}</p>
              ) : null}
              {audit.reportHash ? <p className="mono">Report Hash: {audit.reportHash}</p> : null}
              {audit.reportUrl ? (
                <p>
                  <a href={audit.reportUrl} target="_blank" rel="noreferrer">
                    Open report JSON
                  </a>
                </p>
              ) : null}
              {audit.error ? <p>{audit.error}</p> : null}
              <div className="ctaRow">
                <button
                  onClick={() => {
                    void loadAudit();
                  }}
                  className="secondary"
                >
                  Refresh
                </button>
                <button
                  onClick={() => {
                    void attest();
                  }}
                  disabled={isAttesting || audit.status !== "done" || audit.level !== "green"}
                >
                  {isAttesting ? "Attesting..." : "Attest Onchain"}
                </button>
              </div>
              {tx ? <p className="mono">TX: {tx}</p> : null}
              {attestError ? <p className="small">{attestError}</p> : null}
              {audit.fingerprint ? (
                <Link href={`/fingerprint/${audit.fingerprint}`}>View fingerprint attestations</Link>
              ) : null}
            </article>

            <article className="panel">
              <h3>LLM Summary</h3>
              <pre>{audit.llmSummary || "Waiting for summary..."}</pre>
            </article>

            <article className="panel">
              <h3>Findings</h3>
              {audit.findings && audit.findings.length > 0 ? (
                audit.findings.map((finding) => (
                  <div key={finding.id} className="finding">
                    <p>
                      <strong>{finding.dimension}</strong> ({finding.severity})
                    </p>
                    <p className="mono">{finding.evidence}</p>
                    <p>{finding.explanation}</p>
                    <p className="small">Fix: {finding.recommendation}</p>
                  </div>
                ))
              ) : (
                <p>No finding yet.</p>
              )}
            </article>
          </div>
        ) : null}
      </section>
    </main>
  );
}
