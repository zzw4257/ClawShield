import fs from "node:fs";
import path from "node:path";
import { Router } from "express";
import { z } from "zod";
import { DatabaseClient } from "../lib/db.js";
import { submitAttestationOnchain } from "../services/attestation.js";
import { v4 as uuidv4 } from "uuid";
import { env } from "../config/env.js";

const startSchema = z.object({
  repoUrl: z
    .string()
    .url()
    .refine((value) => value.startsWith("https://github.com/"), {
      message: "repoUrl must be a public GitHub repository URL"
    }),
  commitSha: z.string().regex(/^[a-fA-F0-9]{7,40}$/, "commitSha must be 7-40 hex chars")
});

const attestSchema = z.object({
  auditId: z.string().uuid()
});

const reportIdSchema = z.string().uuid();
const fingerprintSchema = z.string().regex(/^0x[a-fA-F0-9]{64}$/);

export interface ApiRouterDeps {
  enqueueAudit?: (auditId: string) => void;
  attestOnchain?: typeof submitAttestationOnchain;
}

export function createApiRouter(db: DatabaseClient, deps: ApiRouterDeps): Router {
  const router = Router();
  const attestOnchain = deps.attestOnchain || submitAttestationOnchain;
  const enqueueAudit = deps.enqueueAudit || (() => undefined);

  router.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  router.post("/audit/start", async (req, res) => {
    const parsed = startSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }

    const auditId = uuidv4();
    db.createAudit(auditId, parsed.data.repoUrl, parsed.data.commitSha);

    enqueueAudit(auditId);

    res.json({
      auditId,
      status: "queued"
    });
  });

  router.get("/audit/:auditId", (req, res) => {
    const audit = db.getAudit(req.params.auditId);
    if (!audit) {
      res.status(404).json({ error: "Audit not found" });
      return;
    }

    const findings = audit.findingsJson ? JSON.parse(audit.findingsJson) : undefined;

    res.json({
      status: audit.status,
      fingerprint: audit.fingerprint || undefined,
      score: audit.score ?? undefined,
      level: audit.level || undefined,
      reportUrl: audit.reportUrl || undefined,
      reportHash: audit.reportHash || undefined,
      findings,
      llmSummary: audit.llmSummary || undefined,
      error: audit.errorMessage || undefined
    });
  });

  router.post("/attest", async (req, res) => {
    const parsed = attestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }

    const audit = db.getAudit(parsed.data.auditId);
    if (!audit) {
      res.status(404).json({ error: "Audit not found" });
      return;
    }

    if (audit.status !== "done" || !audit.fingerprint || audit.score === null || !audit.level) {
      res.status(400).json({ error: "Audit is not ready" });
      return;
    }

    if (audit.level !== "green") {
      res.status(400).json({ error: "Only green reports are eligible for attestation" });
      return;
    }

    if (!audit.reportUrl || !audit.reportHash) {
      res.status(500).json({ error: "Audit report metadata missing" });
      return;
    }

    const existingAttestation = db.getAttestationByAuditId(audit.id);
    if (existingAttestation) {
      res.json({
        txHash: existingAttestation.txHash,
        chainId: existingAttestation.chainId,
        contractAddress: existingAttestation.contractAddress,
        reused: true
      });
      return;
    }

    try {
      const chainResult = await attestOnchain({
        fingerprint: audit.fingerprint,
        score: audit.score,
        reportUrl: audit.reportUrl,
        reportHash: audit.reportHash,
        repoUrl: audit.repoUrl,
        commitSha: audit.commitSha
      });

      db.insertAttestation({
        auditId: audit.id,
        fingerprint: audit.fingerprint,
        score: audit.score,
        level: audit.level,
        reportUrl: audit.reportUrl,
        reportHash: audit.reportHash,
        attester: chainResult.attester,
        txHash: chainResult.txHash,
        blockTime: chainResult.blockTime,
        chainId: chainResult.chainId,
        contractAddress: chainResult.contractAddress
      });

      res.json({
        txHash: chainResult.txHash,
        chainId: chainResult.chainId,
        contractAddress: chainResult.contractAddress
      });
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "Attestation failed"
      });
    }
  });

  router.get("/attestations/:fingerprint", (req, res) => {
    const parsedFingerprint = fingerprintSchema.safeParse(req.params.fingerprint);
    if (!parsedFingerprint.success) {
      res.status(400).json({ error: "Invalid fingerprint format" });
      return;
    }

    const history = db.getAttestationsByFingerprint(parsedFingerprint.data);

    res.json({
      latest:
        history.length > 0
          ? {
              fingerprint: history[0].fingerprint,
              score: history[0].score,
              level: history[0].level,
              reportUrl: history[0].reportUrl,
              reportHash: history[0].reportHash,
              attester: history[0].attester,
              txHash: history[0].txHash,
              blockTime: history[0].blockTime
            }
          : null,
      history: history.map((row) => ({
        fingerprint: row.fingerprint,
        score: row.score,
        level: row.level,
        reportUrl: row.reportUrl,
        reportHash: row.reportHash,
        attester: row.attester,
        txHash: row.txHash,
        blockTime: row.blockTime
      }))
    });
  });

  router.get("/reports/:reportId", (req, res) => {
    const parsedReportId = reportIdSchema.safeParse(req.params.reportId);
    if (!parsedReportId.success) {
      res.status(400).json({ error: "Invalid reportId format" });
      return;
    }

    const reportPath = path.resolve(env.reportsDir, `${parsedReportId.data}.json`);

    if (!fs.existsSync(reportPath)) {
      res.status(404).json({ error: "Report not found" });
      return;
    }

    const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
    res.json(report);
  });

  return router;
}
