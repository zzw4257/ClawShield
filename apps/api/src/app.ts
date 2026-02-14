import express from "express";
import cors from "cors";
import morgan from "morgan";
import { DatabaseClient } from "./lib/db.js";
import { createApiRouter } from "./routes/api.js";
import { createRateLimiter } from "./lib/rate-limit.js";
import { AuditQueue } from "./services/audit-queue.js";
import { env } from "./config/env.js";

function isAllowedOrigin(origin: string | undefined, raw: string): boolean {
  if (!origin) {
    return true;
  }
  if (raw.trim() === "*" || raw.trim() === "") {
    return true;
  }

  const allowlist = new Set(
    raw
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
  );

  return allowlist.has(origin);
}

export function createApp(db: DatabaseClient) {
  const app = express();
  const queue = new AuditQueue(db, 1);

  app.use(
    cors({
      origin: (origin, callback) => {
        if (isAllowedOrigin(origin, env.corsAllowedOrigins)) {
          callback(null, true);
          return;
        }
        callback(new Error("CORS origin denied"));
      }
    })
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(morgan("dev"));

  app.use(
    "/api/audit/start",
    createRateLimiter({
      windowMs: 60_000,
      maxRequests: 30,
      key: (req) => req.ip || "unknown"
    })
  );

  app.use(
    "/api/attest",
    createRateLimiter({
      windowMs: 60_000,
      maxRequests: 20,
      key: (req) => req.ip || "unknown"
    })
  );

  app.use(
    "/api",
    createApiRouter(db, {
      enqueueAudit: (auditId) => queue.enqueue(auditId)
    })
  );

  app.get("/", (_req, res) => {
    res.json({
      name: "ClawShield API",
      version: "0.2.0",
      docs: [
        "POST /api/audit/start",
        "GET /api/audit/:auditId",
        "POST /api/attest",
        "GET /api/attestations/:fingerprint",
        "GET /api/reports/:reportId"
      ]
    });
  });

  return app;
}
