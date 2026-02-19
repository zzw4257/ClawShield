# SYSTEM_BLUEPRINT

This document explains the backend/core construction of ClawShield for technical walkthroughs.

## 1) Purpose

ClawShield turns one exact Git commit into a verifiable security decision:
- deterministic risk scoring
- explainable AI summary
- commit-bound report hash and fingerprint
- policy-gated onchain attestation

## 2) Runtime Components

- Web UI: `apps/web/`
- API server: `apps/api/src/app.ts`
- Audit queue worker: `apps/api/src/services/audit-queue.ts`
- Git checkout service: `apps/api/src/services/git.ts`
- Rule engine: `apps/api/src/services/scoring.ts`
- LLM explainer: `apps/api/src/services/llm.ts`
- Fingerprint/hash service: `apps/api/src/services/fingerprint.ts`
- DB persistence: `apps/api/src/lib/db.ts`
- Onchain attester: `apps/api/src/services/attestation.ts`
- Smart contract: `contracts/contracts/ClawShieldRegistry.sol`

## 3) Request -> Data -> Chain Flow

1. `POST /api/audit/start` creates `audits` row with status `queued`.
2. Queue picks task and runs `runAuditJob`.
3. Git service checks out target commit into temp directory.
4. File collector reads text files and passes content to rule engine.
5. Rule engine returns `score + level + findings` (deterministic).
6. LLM builds human-readable summary (non-authoritative).
7. API writes report JSON and computes `reportHash`.
8. API stores final audit row (`done`) with `fingerprint`, `reportUrl`, `reportHash`.
9. For green case, `POST /api/attest` sends attestation tx to opBNB.
10. DB stores tx metadata and API exposes history by fingerprint.

## 4) State Machine

Audit status transitions:
- `queued -> running -> done`
- `queued/running -> failed`

Attestation policy transitions:
- `green` => allowed (`POST /api/attest` can return tx)
- `yellow/red` => denied (`Only green reports are eligible for attestation`)

## 5) Deterministic Security Core

Rule file: `apps/api/src/services/scoring.ts`

Risk dimensions:
- `remote_execution`
- `credential_access`
- `obfuscation`
- `suspicious_network`
- `permission_mismatch`

Score mapping:
- `0-29 => green`
- `30-69 => yellow`
- `70-100 => red`

Important boundary:
- LLM does not set score or level.
- Score comes only from regex-rule engine.

## 6) Integrity and Reproducibility Primitives

- Fingerprint (`computeFingerprint`): SHA-256 over `relativePath + content` for all collected files.
- Report hash (`computeReportHash`): SHA-256 over serialized report payload.
- Commit-bound object: `repoUrl + commitSha` identifies one audit target.

Core files:
- `apps/api/src/services/fingerprint.ts`
- `packages/shared-types/src/index.ts`

## 7) Persistence Model

DB: SQLite (`better-sqlite3`) with WAL mode.

Tables:
- `audits`
  - input: `repo_url`, `commit_sha`
  - outputs: `fingerprint`, `score`, `level`, `report_url`, `report_hash`, `findings_json`, `llm_summary`, `status`
- `attestations`
  - onchain proof: `tx_hash`, `attester`, `block_time`, `contract_address`, `chain_id`
  - unique constraint on `audit_id` (idempotent attestation per audit)

Schema file:
- `apps/api/src/lib/db.ts`

## 8) Onchain Enforcement

Contract enforces:
- attester allowlist (`isAttester`)
- score range check (`<=100`)
- attestation threshold (`maxAttestableScore`, default `29`)
- mandatory fields for fingerprint/report/repo/commit

API and contract both enforce green-only behavior:
- API: blocks non-green before chain call
- Contract: rejects score above threshold even if API bypass is attempted

Contract file:
- `contracts/contracts/ClawShieldRegistry.sol`

## 9) Failure Strategy

- Git checkout failure => audit `failed`
- LLM failure => fallback summary path (no score impact)
- Onchain write failure => API returns error, no attestation row inserted
- Non-green attestation request => policy-denied response as explicit evidence

## 10) What to say on camera

- "The scoring and gating are deterministic. AI explains, but AI does not decide trust level."
- "Each report is tied to one commit by fingerprint and report hash, then optionally anchored onchain."
- "Risk cases are expected to be blocked; policy denial is a product success path, not a failure."
