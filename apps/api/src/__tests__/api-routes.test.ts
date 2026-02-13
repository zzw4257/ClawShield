import express from "express";
import request from "supertest";
import { afterEach, describe, expect, it } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { v4 as uuidv4 } from "uuid";
import { DatabaseClient } from "../lib/db.js";
import { createApiRouter } from "../routes/api.js";
import { env } from "../config/env.js";

function buildTestApp(dbPath: string, deps?: Parameters<typeof createApiRouter>[1]) {
  const db = new DatabaseClient(dbPath);
  const app = express();
  app.use(express.json());
  app.use(
    "/api",
    createApiRouter(db, {
      enqueueAudit: () => undefined,
      ...deps
    })
  );

  return { app, db };
}

describe("api routes", () => {
  const tempDbFiles: string[] = [];

  afterEach(() => {
    for (const file of tempDbFiles.splice(0)) {
      try {
        fs.rmSync(file, { force: true });
        fs.rmSync(`${file}-shm`, { force: true });
        fs.rmSync(`${file}-wal`, { force: true });
      } catch {
        // ignore cleanup errors in tests
      }
    }
  });

  it("rejects invalid commit sha", async () => {
    const dbPath = path.join(os.tmpdir(), `clawshield-test-${Date.now()}-1.db`);
    tempDbFiles.push(dbPath);
    const { app } = buildTestApp(dbPath);

    const response = await request(app).post("/api/audit/start").send({
      repoUrl: "https://github.com/org/repo",
      commitSha: "not-a-sha"
    });

    expect(response.status).toBe(400);
  });

  it("enqueues audit job and returns queued", async () => {
    const dbPath = path.join(os.tmpdir(), `clawshield-test-${Date.now()}-2.db`);
    tempDbFiles.push(dbPath);
    const enqueued: string[] = [];
    const { app } = buildTestApp(dbPath, {
      enqueueAudit: (auditId) => enqueued.push(auditId)
    });

    const response = await request(app).post("/api/audit/start").send({
      repoUrl: "https://github.com/org/repo",
      commitSha: "deadbeef"
    });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("queued");
    expect(typeof response.body.auditId).toBe("string");
    expect(enqueued).toEqual([response.body.auditId]);
  });

  it("returns existing attestation without rebroadcasting", async () => {
    const dbPath = path.join(os.tmpdir(), `clawshield-test-${Date.now()}-3.db`);
    tempDbFiles.push(dbPath);

    let chainCallCount = 0;
    const { app, db } = buildTestApp(dbPath, {
      attestOnchain: async () => {
        chainCallCount += 1;
        return {
          txHash: "0xabc",
          chainId: 5611,
          contractAddress: "0x123",
          attester: "0xattester",
          blockTime: 1
        };
      }
    });

    const auditId = uuidv4();
    db.createAudit(auditId, "https://github.com/org/repo", "deadbeef");
    db.completeAudit(auditId, {
      fingerprint: "0x" + "11".repeat(32),
      score: 10,
      level: "green",
      reportId: uuidv4(),
      reportUrl: "https://example.com/report",
      reportHash: "0x" + "22".repeat(32),
      findings: [],
      llmSummary: "ok"
    });

    db.insertAttestation({
      auditId,
      fingerprint: "0x" + "11".repeat(32),
      score: 10,
      level: "green",
      reportUrl: "https://example.com/report",
      reportHash: "0x" + "22".repeat(32),
      attester: "0xattester",
      txHash: "0xexisting",
      blockTime: 111,
      chainId: 5611,
      contractAddress: "0xcontract"
    });

    const response = await request(app).post("/api/attest").send({ auditId });

    expect(response.status).toBe(200);
    expect(response.body.txHash).toBe("0xexisting");
    expect(response.body.reused).toBe(true);
    expect(chainCallCount).toBe(0);
  });

  it("attests onchain for green report", async () => {
    const dbPath = path.join(os.tmpdir(), `clawshield-test-${Date.now()}-4.db`);
    tempDbFiles.push(dbPath);

    const { app, db } = buildTestApp(dbPath, {
      attestOnchain: async () => ({
        txHash: "0xnew",
        chainId: 5611,
        contractAddress: "0xcontract",
        attester: "0xattester",
        blockTime: 1234
      })
    });

    const auditId = uuidv4();
    db.createAudit(auditId, "https://github.com/org/repo", "deadbeef");
    db.completeAudit(auditId, {
      fingerprint: "0x" + "33".repeat(32),
      score: 0,
      level: "green",
      reportId: uuidv4(),
      reportUrl: "https://example.com/report-2",
      reportHash: "0x" + "44".repeat(32),
      findings: [],
      llmSummary: "ok"
    });

    const response = await request(app).post("/api/attest").send({ auditId });

    expect(response.status).toBe(200);
    expect(response.body.txHash).toBe("0xnew");

    const history = db.getAttestationsByFingerprint("0x" + "33".repeat(32));
    expect(history.length).toBe(1);
    expect(history[0].txHash).toBe("0xnew");
  });

  it("validates fingerprint and report id formats", async () => {
    const dbPath = path.join(os.tmpdir(), `clawshield-test-${Date.now()}-5.db`);
    tempDbFiles.push(dbPath);
    const { app } = buildTestApp(dbPath);

    const badFingerprint = await request(app).get("/api/attestations/not-hex");
    expect(badFingerprint.status).toBe(400);

    const badReportId = await request(app).get("/api/reports/not-uuid");
    expect(badReportId.status).toBe(400);
  });

  it("returns report content for valid report id", async () => {
    const dbPath = path.join(os.tmpdir(), `clawshield-test-${Date.now()}-6.db`);
    tempDbFiles.push(dbPath);
    const { app } = buildTestApp(dbPath);

    fs.mkdirSync(env.reportsDir, { recursive: true });
    const reportId = uuidv4();
    const reportFile = path.join(env.reportsDir, `${reportId}.json`);
    fs.writeFileSync(reportFile, JSON.stringify({ reportId, score: 10 }), "utf8");

    const response = await request(app).get(`/api/reports/${reportId}`);

    expect(response.status).toBe(200);
    expect(response.body.reportId).toBe(reportId);

    fs.rmSync(reportFile, { force: true });
  });
});
