# Judge Packet (Read This First)

## 1) 15-Second Snapshot

- Track: `Agent`
- Network: `opBNB Testnet`
- Contract: `0x8F4aF898fc2f28281D2a51d322b586C1DA0481f9`
- Proof TX: `0x7c4b2c3d5bb8dd1aaa34c9dd7a218b0ab91f607d9faac237b40d6500378eab77`
- Value: commit-bound risk report + onchain attestation with reproducible evidence

## 2) 60-Second Verification

```bash
npm run dev:api
npm run dev:web
npm run verify:flow --workspace @clawshield/api
npm run verify:event --workspace @clawshield/api -- --txHash 0x7c4b2c3d5bb8dd1aaa34c9dd7a218b0ab91f607d9faac237b40d6500378eab77 --contractAddress 0x8F4aF898fc2f28281D2a51d322b586C1DA0481f9
```

## 3) Where To Check

- API health: `https://clawshield-api.onrender.com/api/health`
- Web: `https://claw-shield-web.vercel.app`
- Flow artifact: `docs/verification/flow-latest.json`
- Event artifact: `docs/verification/event-latest.json`
- Verification status: `docs/verification/STATUS.md`

## 4) Human-in-the-Loop Boundary

- AI does not hold wallet control.
- AI does not autonomously sign transactions.
- Score policy remains deterministic and contract-enforced.

## 5) AI Bonus Evidence

- Main summary: `AI_BUILD_LOG.md`
- Timeline: `docs/ai-log/TRACE_LOG.md`
- Evidence map: `docs/ai-log/EVIDENCE_INDEX.md`
- Prompt/output assets: `docs/ai-log/prompts/`, `docs/ai-log/outputs/`, `docs/ai-log/diffs/`

## 6) Concrete Local Casebook

- Case registry: `docs/cases/case-registry.lock.json`
- Candidate repos: `docs/cases/candidate-repos.json`
- Run all cases: `npm run cases:run`
- Capture screenshots: `npm run cases:capture`
- Verify all case evidence: `npm run cases:verify`
- Casebook index: `docs/cases/CASEBOOK.md`
- Visual showcase: `docs/cases/SHOWCASE.md`
