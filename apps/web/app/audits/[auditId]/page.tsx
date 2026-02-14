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

type TimelineStep = "queued" | "running" | "done" | "failed";

function getTimelineState(
  step: TimelineStep,
  status: AuditResponse["status"] | undefined
): "done" | "active" | "pending" {
  if (!status) return "pending";

  if (status === "failed") {
    if (step === "failed") return "active";
    if (step === "done") return "pending";
    return "done";
  }

  const order: TimelineStep[] = ["queued", "running", "done"];
  const currentIndex = order.indexOf(status);
  const stepIndex = order.indexOf(step);

  if (step === "failed") return "pending";
  if (stepIndex < 0 || currentIndex < 0) return "pending";
  if (stepIndex < currentIndex) return "done";
  if (stepIndex === currentIndex) return "active";
  return "pending";
}

export default function AuditDetailPage() {
  const params = useParams<{ auditId: string }>();
  const auditId = params.auditId;

  const [audit, setAudit] = useState<AuditResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAttesting, setIsAttesting] = useState(false);
  const [tx, setTx] = useState<string | null>(null);
  const [attestError, setAttestError] = useState<string | null>(null);
  const explorerBase = "https://opbnb-testnet-scan.bnbchain.org";

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
              <div className="statusTimeline">
                {(["queued", "running", "done", "failed"] as TimelineStep[]).map((step) => (
                  <span key={step} className={`timelineStep ${getTimelineState(step, audit.status)}`}>
                    {step.toUpperCase()}
                  </span>
                ))}
              </div>
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
              <details>
                <summary>Judge View (one-screen facts)</summary>
                <div className="judgeView">
                  <div className="judgeViewRow">
                    <span>Score/Level</span>
                    <div>{audit.score ?? "N/A"} / {audit.level ?? "N/A"}</div>
                  </div>
                  <div className="judgeViewRow">
                    <span>Fingerprint</span>
                    <code className="mono">{audit.fingerprint || "N/A"}</code>
                  </div>
                  <div className="judgeViewRow">
                    <span>Report Hash</span>
                    <code className="mono">{audit.reportHash || "N/A"}</code>
                  </div>
                  <div className="judgeViewRow">
                    <span>TX</span>
                    {tx ? (
                      <a href={`${explorerBase}/tx/${tx}`} target="_blank" rel="noreferrer">
                        {tx}
                      </a>
                    ) : (
                      <span>N/A</span>
                    )}
                  </div>
                </div>
              </details>
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
              {tx ? (
                <p>
                  TX:{" "}
                  <a className="mono" href={`${explorerBase}/tx/${tx}`} target="_blank" rel="noreferrer">
                    {tx}
                  </a>
                </p>
              ) : null}
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
