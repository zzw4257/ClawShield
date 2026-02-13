export type RiskLevel = "green" | "yellow" | "red";

export type FindingSeverity = "low" | "medium" | "high";

export type FindingDimension =
  | "remote_execution"
  | "credential_access"
  | "obfuscation"
  | "suspicious_network"
  | "permission_mismatch";

export interface Finding {
  id: string;
  dimension: FindingDimension;
  severity: FindingSeverity;
  evidence: string;
  explanation: string;
  recommendation: string;
}

export interface AuditReport {
  reportId: string;
  repoUrl: string;
  commitSha: string;
  fingerprint: string;
  score: number;
  level: RiskLevel;
  findings: Finding[];
  llmSummary: string;
  generatedAt: string;
}

export interface AuditStatusResponse {
  status: "queued" | "running" | "done" | "failed";
  fingerprint?: string;
  score?: number;
  level?: RiskLevel;
  reportUrl?: string;
  reportHash?: string;
  findings?: Finding[];
  llmSummary?: string;
  error?: string;
}

export interface AttestationView {
  fingerprint: string;
  score: number;
  level: RiskLevel;
  reportUrl: string;
  reportHash: string;
  attester: string;
  txHash: string;
  blockTime: number;
}
