# Live Run 2026-02-18 (UTC)

## Goal
- Execute a real end-to-end run (not unit tests), including:
  - API health
  - audit start and polling
  - report fetch
  - onchain attestation
  - onchain event verification
  - UI screenshots

## Environment
- API: `http://localhost:8787`
- Web: `http://localhost:3000`
- Contract: `0x8F4aF898fc2f28281D2a51d322b586C1DA0481f9`
- Chain: `opBNB Testnet (5611)`

## Commands
```bash
npm rebuild better-sqlite3
npm run dev:api
npm run dev:web
npm run verify:flow --workspace @clawshield/api -- --baseUrl http://localhost:8787 --out docs/verification/archive/2026-02-18/flow-live-local.json
npm run verify:event --workspace @clawshield/api -- --txHash 0xdc024ea0f6258bc9c2e836d7ce683831b2b24a610323aba48f07f65959e2b8b8 --contractAddress 0x8F4aF898fc2f28281D2a51d322b586C1DA0481f9 --out docs/verification/archive/2026-02-18/event-live-local.json
npx playwright screenshot --device="Desktop Chrome" http://localhost:3000 docs/verification/archive/2026-02-18/screenshots/home-local.png
npx playwright screenshot --device="Desktop Chrome" "http://localhost:3000/audits/e0828611-d6d2-4a69-a6f1-2a452cb48a59" docs/verification/archive/2026-02-18/screenshots/audit-detail-local.png
npx playwright screenshot --device="Desktop Chrome" "http://localhost:3000/fingerprint/0xe89688d203c73e040cca08740fc43c998fdbeba4d144b2c627a8a96dc6d38796" docs/verification/archive/2026-02-18/screenshots/fingerprint-local.png
```

## Result Summary
- Audit ID: `e0828611-d6d2-4a69-a6f1-2a452cb48a59`
- Fingerprint: `0xe89688d203c73e040cca08740fc43c998fdbeba4d144b2c627a8a96dc6d38796`
- Score / Level: `0 / green`
- Tx: `0xdc024ea0f6258bc9c2e836d7ce683831b2b24a610323aba48f07f65959e2b8b8`
- Event verification: passed

## Artifacts
- `docs/verification/archive/2026-02-18/flow-live-local.json`
- `docs/verification/archive/2026-02-18/event-live-local.json`
- `docs/verification/archive/2026-02-18/screenshots/home-local.png`
- `docs/verification/archive/2026-02-18/screenshots/audit-detail-local.png`
- `docs/verification/archive/2026-02-18/screenshots/fingerprint-local.png`
