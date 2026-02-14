# DoraHacks Submission Final

Generated at: 2026-02-14T03:28:35.978Z

## BUIDL Name
ClawShield

## Track
Agent

## One-Liner
Commit-bound AI security attestation with onchain proof on opBNB Testnet.

## Is this an AI Agent?
Yes. ClawShield uses deterministic rules for commit risk scoring and AI for explainable security guidance.

## Problem
OpenClaw skill ecosystems move quickly, but users cannot reliably verify whether a specific skill commit is safe before installation.

## Solution
ClawShield audits a GitHub repo plus commit SHA, produces a reproducible risk report, and stores attestation facts onchain for transparent verification.

## Key Differentiators
- Fingerprint + report hash bind every result to one exact commit.
- Green-only attestation policy is enforced in backend and smart contract.
- Structured findings combine deterministic evidence with AI-readable summaries.
- Submission package includes architecture docs, test commands, and AI Build Log evidence.

## Onchain Proof
- Contract Address: 0x8F4aF898fc2f28281D2a51d322b586C1DA0481f9
- Explorer (Contract): https://opbnb-testnet-scan.bnbchain.org/address/0x8F4aF898fc2f28281D2a51d322b586C1DA0481f9
- Proof TX Hash: 0x7c4b2c3d5bb8dd1aaa34c9dd7a218b0ab91f607d9faac237b40d6500378eab77
- Explorer (TX): https://opbnb-testnet-scan.bnbchain.org/tx/0x7c4b2c3d5bb8dd1aaa34c9dd7a218b0ab91f607d9faac237b40d6500378eab77

## Links
- Repository: https://github.com/zzw4257/ClawShield
- Demo: https://clawshield.vercel.app
- Video: media/video/clawshield-demo.mp4

## Reproducibility
- Public monorepo with .env.example and deterministic API interfaces.
- Contract/API/Web tests and E2E smoke command documented in docs/TESTING.md.
- Single command workflow for deployment, attestation, and event verification.

## AI Build Log Evidence
- AI_BUILD_LOG.md
- docs/ai-log/TRACE_LOG.md
- docs/ai-log/prompts/
- docs/ai-log/outputs/
- docs/ai-log/screenshots/
- docs/ai-log/diffs/
