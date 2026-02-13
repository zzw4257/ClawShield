import { AuditStatusResponse, Finding, RiskLevel } from "@clawshield/shared-types";

export type AuditStatus = AuditStatusResponse["status"];

export interface AuditRow {
  id: string;
  repoUrl: string;
  commitSha: string;
  fingerprint: string | null;
  score: number | null;
  level: RiskLevel | null;
  reportId: string | null;
  reportUrl: string | null;
  reportHash: string | null;
  findingsJson: string | null;
  llmSummary: string | null;
  status: AuditStatus;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CompletedAuditPayload {
  fingerprint: string;
  score: number;
  level: RiskLevel;
  reportId: string;
  reportUrl: string;
  reportHash: string;
  findings: Finding[];
  llmSummary: string;
}

export interface AttestationRow {
  id: number;
  auditId: string;
  fingerprint: string;
  score: number;
  level: RiskLevel;
  reportUrl: string;
  reportHash: string;
  attester: string;
  txHash: string;
  blockTime: number;
  chainId: number;
  contractAddress: string;
  createdAt: string;
}
