# DoraHacks Submission Draft (Operational)

## BUIDL Name
ClawShield

## Track
Agent

## Is this an AI Agent?
Yes. ClawShield orchestrates autonomous audit-to-chain actions while keeping transaction signing under human/operator control.

## Problem
OpenClaw skill ecosystems move fast, but users cannot easily verify whether one specific commit is safe before installation.

## Solution
ClawShield audits a GitHub repo + commit SHA, outputs deterministic risk findings, adds AI-readable explanation, and writes attestation proof on opBNB testnet.

## Key Differentiators
- Fingerprint + report hash bind each verdict to one exact commit
- Green-only attestation enforced in backend and smart contract
- Reproducible API surface and verification artifacts
- Full AI Build Log and judge-oriented docs

## Onchain Proof
- Contract: `0x8F4aF898fc2f28281D2a51d322b586C1DA0481f9`
- Explorer: `https://testnet.opbnbscan.com/address/0x8F4aF898fc2f28281D2a51d322b586C1DA0481f9`
- Tx hash: `0x7c4b2c3d5bb8dd1aaa34c9dd7a218b0ab91f607d9faac237b40d6500378eab77`

## Reproducibility
- Public repository URL configured in `docs/submission.config.json`
- Demo URL configured in `docs/submission.config.json`
- One-command verification available: `npm run verify:all`

## AI Build Log
- `AI_BUILD_LOG.md`
- `docs/ai-log/TRACE_LOG.md`
- `docs/ai-log/EVIDENCE_INDEX.md`
