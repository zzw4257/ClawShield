# ClawShield

Commit-bound security attestation for OpenClaw skills. ClawShield audits a specific GitHub commit, generates explainable risk output, and anchors proof on opBNB Testnet.

## Judge Snapshot

- Track: `Agent`
- Network: `opBNB Testnet (chainId 5611)`
- Contract Address: `0x8F4aF898fc2f28281D2a51d322b586C1DA0481f9`
- Contract Explorer: `https://opbnb-testnet-scan.bnbchain.org/address/0x8F4aF898fc2f28281D2a51d322b586C1DA0481f9`
- Proof TX: `0x7c4b2c3d5bb8dd1aaa34c9dd7a218b0ab91f607d9faac237b40d6500378eab77`
- TX Explorer: `https://opbnb-testnet-scan.bnbchain.org/tx/0x7c4b2c3d5bb8dd1aaa34c9dd7a218b0ab91f607d9faac237b40d6500378eab77`
- 1-line Value: `Audit -> explain -> attest -> query` for one exact commit fingerprint.
- Live Demo: `http://localhost:3000` (public deployment URL in `docs/submission.config.json`)
- Video: `media/video/clawshield-demo.mp4`

## Why This Is Agent Track

- The system uses an AI-assisted workflow agent to transform deterministic findings into human-readable security decisions.
- It performs autonomous orchestration across repo checkout, rule scoring, report generation, and evidence persistence.
- It executes onchain action policy (`green` only) with audit-to-chain automation and reproducible operator controls.

## Human-in-the-Loop Boundary

- AI never signs transactions directly.
- Onchain attestation uses an explicit operator wallet key configured by environment variables.
- AI output influences explanation text only; score policy remains deterministic rule-based and contract-enforced.

## 60-Second Verification Path

1. Run services

```bash
npm run dev
```

2. Run full live flow (health -> audit -> report -> attest -> query)

```bash
npm run verify:flow --workspace @clawshield/api
```

3. Verify emitted `Attested` event onchain

```bash
npm run verify:event --workspace @clawshield/api -- --txHash 0x7c4b2c3d5bb8dd1aaa34c9dd7a218b0ab91f607d9faac237b40d6500378eab77 --contractAddress 0x8F4aF898fc2f28281D2a51d322b586C1DA0481f9
```

4. Generate DoraHacks-ready final submission text

```bash
npm run submission:generate --workspace @clawshield/api
```

## Core Flow

```text
Repo URL + Commit -> Rules Audit + LLM Explanation -> Report JSON + Hash -> Onchain Attestation
```

## Features

- Commit-bound fingerprinting and report hash
- Green/yellow/red risk policy (`0-29`, `30-69`, `70-100`)
- Green-only attestation gate (backend + contract)
- Attester allowlist and revocation path
- Idempotent attestation API
- Bounded audit queue and route-level rate limiting
- Web dashboard + API + chain proof + AI build log + Remotion assets

## Monorepo Layout

```text
contracts/              Hardhat + Solidity contract and tests
apps/api/               Express + SQLite + audit pipeline + onchain attestation API
apps/web/               Next.js frontend for audit/report/attestation/query
packages/shared-types/  Shared domain types
docs/                   Architecture / flow / threat model / demo runbook / submission docs
docs/ai-log/            Prompt-output-evidence archive
docs/verification/      Verification artifacts and status
remotion/               90s demo video project
media/                  Rendered video, cover, keyframes, voiceover transcript
```

## Quickstart

1. Install dependencies

```bash
npm install
```

2. Configure environment

```bash
cp .env.example .env
```

3. Run API + Web

```bash
npm run dev:api
npm run dev:web
```

4. Contract checks / deploy

```bash
npm run contracts:test
npm run contracts:build
npm run contracts:deploy:opbnbTestnet
```

5. QA and proof commands

```bash
npm run verify:all
npm run verify:flow --workspace @clawshield/api
npm run proof:refresh --workspace @clawshield/api
```

## API Endpoints

- `POST /api/audit/start` with `{ repoUrl, commitSha }`
- `GET /api/audit/:auditId`
- `POST /api/attest` with `{ auditId }`
- `GET /api/attestations/:fingerprint`
- `GET /api/reports/:reportId`

## Submission Docs

- `docs/DORAHACKS_SUBMISSION_FINAL.md`
- `docs/DORAHACKS_DESCRIPTION_PASTE.md`
- `docs/JUDGE_PACKET.md`
- `docs/PROOF_INDEX.md`
- `docs/TESTING.md`
- `docs/DEMO_RUNBOOK.md`
- `AI_BUILD_LOG.md`
