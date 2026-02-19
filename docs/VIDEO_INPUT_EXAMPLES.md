# VIDEO_INPUT_EXAMPLES

Use this file as direct input source while recording.

## 1) Primary demo inputs (stable)

## Case A: clean_baseline
- `repoUrl`: `https://github.com/octocat/Hello-World`
- `commitSha`: `7fd1a60b01f91b314f59955a4e4d4e80d8edf11d`
- Expected: `score=0`, `level=green`, attestation allowed
- Example fingerprint: `0xe89688d203c73e040cca08740fc43c998fdbeba4d144b2c627a8a96dc6d38796`
- Example tx: `0x8edd560fb3ba17aa8f3f289e23f625ebaa5ccce5c94bf329b881d46190e9d216`

## Case B: remote_execution_risk
- `repoUrl`: `https://github.com/Homebrew/install`
- `commitSha`: `5838cadbb2c7beb17c7dcdddb5f0dba6c4780feb`
- Expected: `score=99`, `level=red`, contains `remote_execution`, attestation denied
- Example fingerprint: `0x1b2de516d9e09f0bed70f2d1951236c45eb7f762a47348a2ed66cc06ea1e3a94`

## Case C: credential_access_risk
- `repoUrl`: `https://github.com/OWASP/NodeGoat`
- `commitSha`: `c5cb68a7084e4ae7dcc60e6a98768720a81841e8`
- Expected: `score=63`, `level=yellow`, contains `credential_access`, attestation denied
- Example fingerprint: `0x5c2f0f87c5e96e11e9f4a0e121cf34116ceaebc5216442f274fe98412d074956`

Source files:
- `docs/cases/case-registry.lock.json`
- `docs/cases/artifacts/*/flow.json`
- `docs/cases/artifacts/*/report.json`

## 2) Backup inputs (from reference repos)

- `https://github.com/SCARPxVeNOM/clawgency @ 44b6058abf33432a856c48a71dfd52033411c53b`
  - local rule result: `35 / yellow`, dimension includes `credential_access`
- `https://github.com/mthdroid/YieldPilot @ 7c85cd5f89326e20e04e2063c51b715aa6480a39`
  - local rule result: `35 / yellow`, dimension includes `credential_access`
- `https://github.com/Tarran6/VibeGuard-AI @ 5fe031ae2b6dd1a8ba9c730774a4f597b115469c`
  - local rule result: `0 / green`

## 3) API demo payloads (copy/paste)

## 3.1 Start audit
```bash
curl -X POST http://localhost:8787/api/audit/start \
  -H 'Content-Type: application/json' \
  -d '{"repoUrl":"https://github.com/octocat/Hello-World","commitSha":"7fd1a60b01f91b314f59955a4e4d4e80d8edf11d"}'
```

Expected shape:
```json
{
  "auditId": "<uuid>",
  "status": "queued"
}
```

## 3.2 Poll audit
```bash
curl http://localhost:8787/api/audit/<auditId>
```

Expected fields when done:
- `status`
- `fingerprint`
- `score`
- `level`
- `reportUrl`
- `reportHash`
- `findings[]`

## 3.3 Request attestation
```bash
curl -X POST http://localhost:8787/api/attest \
  -H 'Content-Type: application/json' \
  -d '{"auditId":"<auditId>"}'
```

Expected:
- green case => `{ txHash, chainId, contractAddress }`
- non-green => `{ error: "Only green reports are eligible for attestation" }`

## 3.4 Query fingerprint history
```bash
curl http://localhost:8787/api/attestations/<fingerprint>
```

Expected:
- `latest`
- `history[]`

## 3.5 Open report
```bash
curl http://localhost:8787/api/reports/<reportId>
```

## 4) Files to show while explaining evidence

- `docs/cases/SHOWCASE.md`
- `docs/cases/CASEBOOK.md`
- `docs/verification/flow-latest.json`
- `docs/verification/event-latest.json`
- `docs/PROOF_INDEX.md`
- `docs/JUDGE_PACKET.md`

## 5) Ready-made scene snippets

- Scene "problem": "Users need commit-level trust before installing autonomous skills."
- Scene "mechanism": "Input repo+commit -> deterministic scoring -> explainable summary -> policy-gated onchain proof."
- Scene "risk block": "Risky commits are intentionally blocked from attestation; denial itself is verifiable evidence."
- Scene "close": "Fast build, but auditable trust boundary."
