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

type Takeaway = {
  title: string;
  content: string;
};

type AttestationState = {
  kind: "idle" | "success" | "denied" | "error";
  txHash?: string;
  message?: string;
};

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

function stripMarkdown(input: string): string {
  return input.replace(/^[-*\d.\s#>]+/, "").trim();
}

function extractTakeaways(summary?: string): Takeaway[] {
  if (!summary || !summary.trim()) {
    return [];
  }

  const lines = summary.split("\n").map((line) => line.trim());
  const sections: Array<{ heading: string; points: string[] }> = [];
  let current = { heading: "Overview", points: [] as string[] };

  for (const rawLine of lines) {
    if (!rawLine) continue;
    if (rawLine.startsWith("## ")) {
      if (current.points.length > 0) {
        sections.push(current);
      }
      current = { heading: stripMarkdown(rawLine.replace(/^##\s+/, "")), points: [] };
      continue;
    }

    if (/^[-*]\s+/.test(rawLine) || /^\d+\.\s+/.test(rawLine)) {
      current.points.push(stripMarkdown(rawLine));
    }
  }

  if (current.points.length > 0) {
    sections.push(current);
  }

  const direct = sections
    .slice(0, 4)
    .map((item) => ({ title: item.heading, content: item.points[0] }))
    .filter((item) => item.content);

  if (direct.length > 0) {
    return direct;
  }

  return lines
    .filter(Boolean)
    .slice(0, 4)
    .map((line, index) => ({ title: `Point ${index + 1}`, content: stripMarkdown(line) }));
}

function formatAttestationState(state: AttestationState): string {
  if (state.kind === "success") {
    return `Attested onchain (${state.txHash})`;
  }
  if (state.kind === "denied") {
    return `Policy denied: ${state.message || "Only green reports can be attested."}`;
  }
  if (state.kind === "error") {
    return state.message || "Attestation failed";
  }
  return "Not attempted";
}

export default function AuditDetailPage() {
  const params = useParams<{ auditId: string }>();
  const auditId = params.auditId;

  const [audit, setAudit] = useState<AuditResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAttesting, setIsAttesting] = useState(false);
  const [attestationState, setAttestationState] = useState<AttestationState>({ kind: "idle" });
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

  const takeaways = useMemo(() => extractTakeaways(audit?.llmSummary), [audit?.llmSummary]);
  const dimensions = useMemo(() => {
    return Array.from(new Set((audit?.findings || []).map((item) => item.dimension)));
  }, [audit?.findings]);

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

    try {
      const payload = await submitAttestation(auditId);
      setAttestationState({ kind: "success", txHash: payload.txHash });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to attest";
      if (message.toLowerCase().includes("only green")) {
        setAttestationState({ kind: "denied", message });
      } else {
        setAttestationState({ kind: "error", message });
      }
    } finally {
      setIsAttesting(false);
    }
  }

  return (
    <main>
      <section className="hero auditHero">
        <header className="verdictHeader">
          <div>
            <p className="small">Audit Detail</p>
            <h2>Commit Verdict</h2>
            <p className="mono">Audit ID: {auditId}</p>
          </div>
          <div className="verdictStats">
            <ScoreBadge level={audit?.level} score={audit?.score} />
            <span className="small">Status: {audit?.status || "loading"}</span>
          </div>
        </header>

        {isLoading ? <p>Loading...</p> : null}

        {audit ? (
          <div className="auditLayout">
            <div className="auditPrimary">
              <article className="panel">
                <h3>Workflow Timeline</h3>
                <div className="statusTimeline">
                  {(["queued", "running", "done", "failed"] as TimelineStep[]).map((step) => (
                    <span key={step} className={`timelineStep ${getTimelineState(step, audit.status)}`}>
                      {step.toUpperCase()}
                    </span>
                  ))}
                </div>

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

                {attestationState.kind === "success" && attestationState.txHash ? (
                  <p className="mono">
                    TX: <a href={`${explorerBase}/tx/${attestationState.txHash}`}>{attestationState.txHash}</a>
                  </p>
                ) : null}

                {audit.fingerprint ? (
                  <p>
                    <Link href={`/fingerprint/${audit.fingerprint}`}>View fingerprint attestations</Link>
                  </p>
                ) : null}
              </article>

              <article className="panel judgeFacts">
                <h3>Judge Facts</h3>
                <div className="judgeView">
                  <div className="judgeViewRow">
                    <span>Score / Level</span>
                    <div>
                      {audit.score ?? "N/A"} / {audit.level ?? "N/A"}
                    </div>
                  </div>
                  <div className="judgeViewRow">
                    <span>Dimensions</span>
                    <div>{dimensions.length > 0 ? dimensions.join(", ") : "none"}</div>
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
                    <span>Attestation</span>
                    <div>{formatAttestationState(attestationState)}</div>
                  </div>
                  <div className="judgeViewRow">
                    <span>Report JSON</span>
                    <div>
                      {audit.reportUrl ? (
                        <a href={audit.reportUrl} target="_blank" rel="noreferrer">
                          Open report JSON
                        </a>
                      ) : (
                        "N/A"
                      )}
                    </div>
                  </div>
                </div>
                {audit.error ? <p className="small">{audit.error}</p> : null}
              </article>

              <article className="panel">
                <h3>Findings (Primary Evidence)</h3>
                {audit.findings && audit.findings.length > 0 ? (
                  <div className="findingsList">
                    {audit.findings.map((finding) => (
                      <div key={finding.id} className="finding">
                        <p>
                          <strong>{finding.dimension}</strong> ({finding.severity})
                        </p>
                        <p className="mono">{finding.evidence}</p>
                        <p>{finding.explanation}</p>
                        <p className="small">Fix: {finding.recommendation}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No structured finding returned for this commit.</p>
                )}
              </article>
            </div>

            <div className="auditSecondary">
              <article className="panel">
                <h3>AI Takeaways</h3>
                {takeaways.length > 0 ? (
                  <div className="takeawayList">
                    {takeaways.map((item) => (
                      <div key={`${item.title}-${item.content}`} className="takeawayItem">
                        <p className="takeawayTitle">{item.title}</p>
                        <p>{item.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="small">Waiting for AI summary...</p>
                )}
              </article>

              <article className="panel">
                <details>
                  <summary>Raw AI Output</summary>
                  <pre className="rawSummary">{audit.llmSummary || "No AI summary yet."}</pre>
                </details>
              </article>
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}
