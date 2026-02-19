# Release Today Checklist (Judge-Ready)

This checklist freezes one canonical proof set before final submission.

## 1) Preflight

```bash
npm install
npm run verify:ci
npm run cases:verify
npm run release:check
```

## 2) Freeze one final onchain proof (run once)

```bash
npm run proof:refresh --workspace @clawshield/api
```

After this command:
- `docs/verification/flow-latest.json` and `docs/verification/event-latest.json` are refreshed.
- `docs/verification/STATUS.md` records both `Latest Verify Tx Hash` and `Submission Tx Hash (env)`.

## 3) Sync canonical proof into all submission docs

```bash
npm run release:sync-proof -- \
  --contractAddress <0x...> \
  --txHash <0x...> \
  --repoUrl https://github.com/zzw4257/ClawShield \
  --demoUrl https://claw-shield-web.vercel.app \
  --videoUrl media/video/clawshield-demo.mp4
```

## 4) Regenerate final submission packet

```bash
npm run submission:generate --workspace @clawshield/api
npm run release:check
```

## 5) Manual final checks

- `README.md` Judge Snapshot proof fields are final.
- `docs/JUDGE_PACKET.md`, `docs/PROOF_INDEX.md`, `docs/DORAHACKS_SUBMISSION_FINAL.md` match exactly.
- `docs/cases/SHOWCASE.md` opens all screenshots and evidence links.
- No placeholders in judge docs:

```bash
rg -n "TBD|placeholder|your-org|0xYOUR_|YOUR_SUBMISSION_TX" README.md docs
```

## 6) Publish

- Push latest commit.
- Submit with:
  - Repo URL
  - Demo URL
  - Contract address
  - Proof tx hash
  - AI Build Log links
