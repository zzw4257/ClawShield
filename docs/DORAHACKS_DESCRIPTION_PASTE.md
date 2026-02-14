# ClawShield — Commit-Bound AI Security Attestation (Agent Track)

ClawShield helps users decide whether one OpenClaw skill commit is safe before installation.

It runs a deterministic security audit, generates explainable AI summary text, and records attestation facts on opBNB testnet for public verification.

## Problem

Skill ecosystems move quickly. Users often see a repo URL and marketing text, but cannot verify behavior-level risk of one specific commit in time.

## Solution

ClawShield enforces a reproducible loop:

`Repo + Commit -> Audit -> Report Hash -> Onchain Attestation -> Fingerprint Query`

Core policy:
- `green (0-29)`: attest allowed
- `yellow (30-69)`: no attest
- `red (70-100)`: no attest

## Why Agent Track

- AI-assisted orchestration drives the audit-to-report pipeline automatically.
- The system coordinates repo checkout, scoring, explanation, persistence, and chain write triggers.
- Human/operator remains in control of signing, while AI accelerates analysis and interpretation.

## Onchain Proof

- Contract: `0x8F4aF898fc2f28281D2a51d322b586C1DA0481f9`
- Contract explorer: `https://opbnb-testnet-scan.bnbchain.org/address/0x8F4aF898fc2f28281D2a51d322b586C1DA0481f9`
- Proof tx: `0x7c4b2c3d5bb8dd1aaa34c9dd7a218b0ab91f607d9faac237b40d6500378eab77`
- TX explorer: `https://opbnb-testnet-scan.bnbchain.org/tx/0x7c4b2c3d5bb8dd1aaa34c9dd7a218b0ab91f607d9faac237b40d6500378eab77`

## Reproducibility

- One-command full verification:

```bash
npm run verify:all
```

- Live flow verification artifact:
  - `docs/verification/flow-latest.json`
- Event verification artifact:
  - `docs/verification/event-latest.json`
- Verification status:
  - `docs/verification/STATUS.md`

## AI Build Log

- `AI_BUILD_LOG.md`
- `docs/ai-log/TRACE_LOG.md`
- `docs/ai-log/EVIDENCE_INDEX.md`
- `docs/ai-log/screenshots/`

## Demo Assets

- Demo video: `media/video/clawshield-demo.mp4`
- Cover image: `media/video/clawshield-cover.png`
- Subtitles: `remotion/public/subtitles/clawshield.srt`

## Links

- Repository: `https://github.com/zzw4257/ClawShield`
- Demo URL: `https://clawshield.vercel.app`
