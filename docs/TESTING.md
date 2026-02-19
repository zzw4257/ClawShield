# TESTING

## Contract tests

```bash
npm run contracts:test
```

Coverage focus:
- owner/attester permissions
- green-threshold attestation enforcement
- score bounds and revocation flow

## API unit + integration tests

```bash
npm run test --workspace @clawshield/api
```

Coverage focus:
- risk scoring determinism
- fingerprint determinism
- request validation
- idempotent attestation behavior
- report endpoint validation and retrieval

## Build validation

```bash
npm run build
```

This validates shared types, API TypeScript compilation, and Next.js production build.

## Full pre-submit validation (one command)

```bash
npm run verify:all
```

This runs: `test -> build -> lint -> e2e -> verify:flow`.

## Offline CI-quality gate (no new onchain tx)

```bash
npm run verify:ci
```

This runs: `test -> build -> lint -> e2e`.

## Secret hygiene

```bash
npm run security:scan
```

## Frontend E2E smoke (Playwright)

```bash
npx playwright install chromium
npm run test:e2e --workspace @clawshield/web
```

Coverage focus:
- homepage audit form visibility
- audit submission redirect flow
- audit detail render + attestation trigger state

## Concrete local casebook verification

```bash
npm run cases:pin
npm run cases:run
npm run cases:capture
npm run cases:verify
```

Coverage focus:
- 3-case registry is pinned and reusable
- green baseline case returns real tx + event artifact
- risk cases are denied by policy and produce refusal evidence
- each case writes JSON and screenshot artifacts

## Onchain event verification

```bash
npm run verify:event --workspace @clawshield/api -- --txHash <TX_HASH> --contractAddress <CONTRACT_ADDRESS>
```

Optional expected-field checks:
- `--fingerprint`
- `--score`
- `--reportHash`
- `--repo`
- `--commit`
- `--attester`

## End-to-end flow verification (real API)

```bash
npm run verify:flow --workspace @clawshield/api
```

Output:
- `docs/verification/flow-latest.json`

This command validates a full live chain:
- health check
- audit start + polling to `done`
- report retrieval
- first onchain attestation
- second idempotent attestation (expects `reused: true`)
- fingerprint attestation query consistency

## Proof refresh (flow + event + status)

```bash
npm run proof:refresh --workspace @clawshield/api
```

Outputs:
- `docs/verification/flow-latest.json`
- `docs/verification/event-latest.json`
- `docs/verification/STATUS.md`

`STATUS.md` includes:
- `Latest Verify Tx Hash` (from the latest live proof run)
- `Submission Tx Hash (env)` (canonical submission proof from `.env`)

## Release consistency gate

```bash
npm run release:check
```

This checks:
- proof tuple consistency across `README`, `JUDGE_PACKET`, `PROOF_INDEX`, and `DORAHACKS_SUBMISSION_FINAL`
- required artifacts exist (`flow/event/casebook/showcase/video`)
- latest case run and verify reports are passed
- no placeholder terms remain in judge-facing docs

## Media validation

```bash
npm run --workspace @clawshield/remotion still
npm run video:render
```

## Smoke flow
1. Start API and Web.
2. Submit repo URL + commit SHA.
3. Confirm status transitions to `done`.
4. If green, call `/api/attest` and confirm tx hash.
5. Run `verify:event` against the tx hash to confirm `Attested` event fields.
