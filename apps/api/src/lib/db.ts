import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { AttestationRow, AuditRow, CompletedAuditPayload } from "../types/db.js";

export class DatabaseClient {
  private db: Database.Database;

  constructor(dbPath: string) {
    const dir = path.dirname(dbPath);
    fs.mkdirSync(dir, { recursive: true });

    this.db = new Database(dbPath);
    this.db.pragma("journal_mode = WAL");
    this.db.pragma("foreign_keys = ON");

    this.createTables();
  }

  private createTables(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS audits (
        id TEXT PRIMARY KEY,
        repo_url TEXT NOT NULL,
        commit_sha TEXT NOT NULL,
        fingerprint TEXT,
        score INTEGER,
        level TEXT,
        report_id TEXT,
        report_url TEXT,
        report_hash TEXT,
        findings_json TEXT,
        llm_summary TEXT,
        status TEXT NOT NULL,
        error_message TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS attestations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        audit_id TEXT NOT NULL,
        fingerprint TEXT NOT NULL,
        score INTEGER NOT NULL,
        level TEXT NOT NULL,
        report_url TEXT NOT NULL,
        report_hash TEXT NOT NULL,
        attester TEXT NOT NULL,
        tx_hash TEXT NOT NULL,
        block_time INTEGER NOT NULL,
        chain_id INTEGER NOT NULL,
        contract_address TEXT NOT NULL,
        created_at TEXT NOT NULL,
        UNIQUE(audit_id),
        FOREIGN KEY(audit_id) REFERENCES audits(id)
      );
    `);
  }

  createAudit(id: string, repoUrl: string, commitSha: string): void {
    const now = new Date().toISOString();
    this.db
      .prepare(
        `INSERT INTO audits (
          id, repo_url, commit_sha, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?)`
      )
      .run(id, repoUrl, commitSha, "queued", now, now);
  }

  updateAuditStatus(id: string, status: AuditRow["status"], errorMessage?: string): void {
    this.db
      .prepare("UPDATE audits SET status = ?, error_message = ?, updated_at = ? WHERE id = ?")
      .run(status, errorMessage || null, new Date().toISOString(), id);
  }

  completeAudit(id: string, payload: CompletedAuditPayload): void {
    this.db
      .prepare(
        `UPDATE audits SET
          status = ?,
          fingerprint = ?,
          score = ?,
          level = ?,
          report_id = ?,
          report_url = ?,
          report_hash = ?,
          findings_json = ?,
          llm_summary = ?,
          updated_at = ?
         WHERE id = ?`
      )
      .run(
        "done",
        payload.fingerprint,
        payload.score,
        payload.level,
        payload.reportId,
        payload.reportUrl,
        payload.reportHash,
        JSON.stringify(payload.findings),
        payload.llmSummary,
        new Date().toISOString(),
        id
      );
  }

  getAudit(id: string): AuditRow | undefined {
    const row = this.db.prepare("SELECT * FROM audits WHERE id = ?").get(id) as
      | {
          id: string;
          repo_url: string;
          commit_sha: string;
          fingerprint: string | null;
          score: number | null;
          level: AuditRow["level"];
          report_id: string | null;
          report_url: string | null;
          report_hash: string | null;
          findings_json: string | null;
          llm_summary: string | null;
          status: AuditRow["status"];
          error_message: string | null;
          created_at: string;
          updated_at: string;
        }
      | undefined;

    if (!row) {
      return undefined;
    }

    return {
      id: row.id,
      repoUrl: row.repo_url,
      commitSha: row.commit_sha,
      fingerprint: row.fingerprint,
      score: row.score,
      level: row.level,
      reportId: row.report_id,
      reportUrl: row.report_url,
      reportHash: row.report_hash,
      findingsJson: row.findings_json,
      llmSummary: row.llm_summary,
      status: row.status,
      errorMessage: row.error_message,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  insertAttestation(entry: Omit<AttestationRow, "id" | "createdAt">): AttestationRow {
    const createdAt = new Date().toISOString();
    const result = this.db
      .prepare(
        `INSERT INTO attestations (
          audit_id, fingerprint, score, level, report_url, report_hash,
          attester, tx_hash, block_time, chain_id, contract_address, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        entry.auditId,
        entry.fingerprint,
        entry.score,
        entry.level,
        entry.reportUrl,
        entry.reportHash,
        entry.attester,
        entry.txHash,
        entry.blockTime,
        entry.chainId,
        entry.contractAddress,
        createdAt
      );

    return {
      id: Number(result.lastInsertRowid),
      ...entry,
      createdAt
    };
  }

  getAttestationByAuditId(auditId: string): AttestationRow | undefined {
    const row = this.db
      .prepare("SELECT * FROM attestations WHERE audit_id = ? LIMIT 1")
      .get(auditId) as
      | {
          id: number;
          audit_id: string;
          fingerprint: string;
          score: number;
          level: AttestationRow["level"];
          report_url: string;
          report_hash: string;
          attester: string;
          tx_hash: string;
          block_time: number;
          chain_id: number;
          contract_address: string;
          created_at: string;
        }
      | undefined;

    if (!row) {
      return undefined;
    }

    return {
      id: row.id,
      auditId: row.audit_id,
      fingerprint: row.fingerprint,
      score: row.score,
      level: row.level,
      reportUrl: row.report_url,
      reportHash: row.report_hash,
      attester: row.attester,
      txHash: row.tx_hash,
      blockTime: row.block_time,
      chainId: row.chain_id,
      contractAddress: row.contract_address,
      createdAt: row.created_at
    };
  }

  getAttestationsByFingerprint(fingerprint: string): AttestationRow[] {
    const rows = this.db
      .prepare("SELECT * FROM attestations WHERE fingerprint = ? ORDER BY id DESC")
      .all(fingerprint) as Array<{
      id: number;
      audit_id: string;
      fingerprint: string;
      score: number;
      level: AttestationRow["level"];
      report_url: string;
      report_hash: string;
      attester: string;
      tx_hash: string;
      block_time: number;
      chain_id: number;
      contract_address: string;
      created_at: string;
    }>;

    return rows.map((row) => ({
      id: row.id,
      auditId: row.audit_id,
      fingerprint: row.fingerprint,
      score: row.score,
      level: row.level,
      reportUrl: row.report_url,
      reportHash: row.report_hash,
      attester: row.attester,
      txHash: row.tx_hash,
      blockTime: row.block_time,
      chainId: row.chain_id,
      contractAddress: row.contract_address,
      createdAt: row.created_at
    }));
  }
}
