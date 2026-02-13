import fs from "node:fs";
import path from "node:path";
import { v4 as uuidv4 } from "uuid";
import { AuditReport } from "@clawshield/shared-types";
import { env } from "../config/env.js";
import { collectTextFiles } from "../lib/file-utils.js";
import { DatabaseClient } from "../lib/db.js";
import { checkoutRepositoryCommit, cleanupDirectory } from "./git.js";
import { computeFingerprint, computeReportHash } from "./fingerprint.js";
import { evaluateRisk } from "./scoring.js";
import { generateLlmSummary } from "./llm.js";

export async function runAuditJob(db: DatabaseClient, auditId: string): Promise<void> {
  const audit = db.getAudit(auditId);
  if (!audit) {
    return;
  }

  db.updateAuditStatus(auditId, "running");

  let checkoutDir = "";

  try {
    checkoutDir = await checkoutRepositoryCommit(audit.repoUrl, audit.commitSha);
    const files = collectTextFiles(checkoutDir);

    const fingerprint = computeFingerprint(files);
    const risk = evaluateRisk(files);

    const llmSummary = await generateLlmSummary({
      repoUrl: audit.repoUrl,
      commitSha: audit.commitSha,
      score: risk.score,
      level: risk.level,
      findings: risk.findings
    });

    const reportId = uuidv4();
    const reportPayload: AuditReport = {
      reportId,
      repoUrl: audit.repoUrl,
      commitSha: audit.commitSha,
      fingerprint,
      score: risk.score,
      level: risk.level,
      findings: risk.findings,
      llmSummary,
      generatedAt: new Date().toISOString()
    };

    const reportHash = computeReportHash(reportPayload);
    const reportPath = path.resolve(env.reportsDir, `${reportId}.json`);
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, JSON.stringify(reportPayload, null, 2), "utf8");

    const reportUrl = `${env.publicApiBaseUrl}/api/reports/${reportId}`;

    db.completeAudit(auditId, {
      fingerprint,
      score: risk.score,
      level: risk.level,
      reportId,
      reportUrl,
      reportHash,
      findings: risk.findings,
      llmSummary
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown audit failure";
    db.updateAuditStatus(auditId, "failed", message);
  } finally {
    if (checkoutDir) {
      await cleanupDirectory(checkoutDir);
    }
  }
}
