# AI Evidence Index

This file maps complete `Prompt -> Output -> Code -> Result` loops for judges.

## Loop 1: Contract schema and onchain proof fields

- Prompt: `docs/ai-log/prompts/prompt-01-architecture.md`
- Output: `docs/ai-log/outputs/output-01-contract-schema.md`
- Code:
  - `contracts/contracts/ClawShieldRegistry.sol`
  - `contracts/test/ClawShieldRegistry.ts`
- Result:
  - `npm run contracts:test` passes
  - Onchain deployed contract in `README.md`

## Loop 2: API interface shape and live endpoints

- Prompt: `docs/ai-log/prompts/prompt-02-risk-rules.md`
- Output: `docs/ai-log/outputs/output-02-api-shape.md`
- Code:
  - `apps/api/src/routes/api.ts`
  - `apps/api/src/lib/db.ts`
- Result:
  - `apps/api/src/__tests__/api-routes.test.ts` passes
  - Live flow artifact: `docs/verification/flow-latest.json`

## Loop 3: Risk dimensions and deterministic scoring

- Prompt: `docs/ai-log/prompts/prompt-04-attestation-policy.md`
- Output: `docs/ai-log/outputs/output-03-risk-dimensions.md`
- Code:
  - `apps/api/src/services/scoring.ts`
  - `apps/api/src/__tests__/scoring.test.ts`
- Result:
  - Deterministic level mapping in audit output
  - Green-only gate verified via `POST /api/attest`

## Loop 4: Demo video structure and export stability

- Prompt: `docs/ai-log/prompts/prompt-03-demo-video.md`
- Output: `docs/ai-log/outputs/output-04-video-split.md`
- Code:
  - `remotion/src/data.ts`
  - `remotion/src/ClawShieldDemo.tsx`
  - `docs/ai-log/diffs/diff-01-remotion-cover-fix.md`
- Result:
  - `media/video/clawshield-demo.mp4`
  - `media/video/clawshield-cover.png`
  - `remotion/public/subtitles/clawshield.srt`

## Loop 5: Proof synchronization and release automation

- Prompt: `docs/ai-log/prompts/prompt-01-architecture.md`
- Output: `docs/ai-log/outputs/output-02-api-shape.md`
- Code:
  - `apps/api/scripts/sync-proof-references.ts`
  - `apps/api/scripts/release-prepare.ts`
  - `apps/api/scripts/verify-attestation-event.ts`
- Result:
  - `docs/PROOF_INDEX.md` and `docs/JUDGE_PACKET.md` stay aligned with one tx/contract source
  - `docs/DORAHACKS_SUBMISSION_FINAL.md` regenerated from synced values

## Loop 6: Secret hygiene and CI enforcement

- Prompt: `docs/ai-log/prompts/prompt-04-attestation-policy.md`
- Output: `docs/ai-log/outputs/output-03-risk-dimensions.md`
- Code:
  - `.gitleaks.toml`
  - `scripts/security-scan.sh`
  - `.github/workflows/secret-scan.yml`
- Result:
  - `npm run security:scan` provides local secret leak gate
  - CI fails fast on leaked credentials before merge/release
