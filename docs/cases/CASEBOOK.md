# CASEBOOK

This file captures concrete demo cases with reproducible evidence artifacts.

- Generated at (UTC): 2026-02-18T08:23:35.240Z
- API Base URL: http://localhost:8787
- Visual overview (all screenshots in one page): `docs/cases/SHOWCASE.md`

## clean_baseline

### Problem
Show a low-risk baseline where deterministic scoring allows attestation.

### Input
- Audit ID: `90c93df0-8512-4e18-b267-ccc7dfc33f45`
- Repo: `https://github.com/octocat/Hello-World`
- Commit: `7fd1a60b01f91b314f59955a4e4d4e80d8edf11d`

### Expected
- Level: `green`
- Required dimensions: none
- Attestation: `allowed`

### Actual
- Status: `done`
- Score/Level: `0 / green`
- Dimensions: none
- Attestation outcome: success, tx=`0x8edd560fb3ba17aa8f3f289e23f625ebaa5ccce5c94bf329b881d46190e9d216`

### Evidence Links
- audit.json: `artifacts/clean_baseline/audit.json`
- attest.json: `artifacts/clean_baseline/attest.json`
- flow.json: `artifacts/clean_baseline/flow.json`
- report.json: `artifacts/clean_baseline/report.json`
- event.json: `artifacts/clean_baseline/event.json`
- home.png: `artifacts/clean_baseline/home.png`
- audit.png: `artifacts/clean_baseline/audit.png`
- fingerprint.png: `artifacts/clean_baseline/fingerprint.png`

### Judge One-Line Takeaway
The pipeline can produce a deterministic green verdict and an onchain attestation for a commit-bound fingerprint.

## remote_execution_risk

### Problem
Show detection of risky remote execution patterns before install-time execution.

### Input
- Audit ID: `da8fe367-da97-4d0d-a105-f2db5364e1a5`
- Repo: `https://github.com/Homebrew/install`
- Commit: `5838cadbb2c7beb17c7dcdddb5f0dba6c4780feb`

### Expected
- Level: `red`
- Required dimensions: `remote_execution`
- Attestation: `denied`

### Actual
- Status: `done`
- Score/Level: `99 / red`
- Dimensions: `remote_execution`, `credential_access`, `suspicious_network`, `permission_mismatch`
- Attestation outcome: denied (Only green reports are eligible for attestation)

### Evidence Links
- audit.json: `artifacts/remote_execution_risk/audit.json`
- attest.json: `artifacts/remote_execution_risk/attest.json`
- flow.json: `artifacts/remote_execution_risk/flow.json`
- report.json: `artifacts/remote_execution_risk/report.json`
- home.png: `artifacts/remote_execution_risk/home.png`
- audit.png: `artifacts/remote_execution_risk/audit.png`
- fingerprint.png: `artifacts/remote_execution_risk/fingerprint.png`

### Judge One-Line Takeaway
The pipeline blocks attestation on non-green outcomes and exposes concrete risk evidence for reviewer decision-making.

## credential_access_risk

### Problem
Show detection of credential access patterns that require human review.

### Input
- Audit ID: `df2f91e0-b95f-4e60-b78a-86d87b7d7b57`
- Repo: `https://github.com/OWASP/NodeGoat`
- Commit: `c5cb68a7084e4ae7dcc60e6a98768720a81841e8`

### Expected
- Level: `yellow`
- Required dimensions: `credential_access`
- Attestation: `denied`

### Actual
- Status: `done`
- Score/Level: `63 / yellow`
- Dimensions: `credential_access`, `obfuscation`
- Attestation outcome: denied (Only green reports are eligible for attestation)

### Evidence Links
- audit.json: `artifacts/credential_access_risk/audit.json`
- attest.json: `artifacts/credential_access_risk/attest.json`
- flow.json: `artifacts/credential_access_risk/flow.json`
- report.json: `artifacts/credential_access_risk/report.json`
- home.png: `artifacts/credential_access_risk/home.png`
- audit.png: `artifacts/credential_access_risk/audit.png`
- fingerprint.png: `artifacts/credential_access_risk/fingerprint.png`

### Judge One-Line Takeaway
The pipeline blocks attestation on non-green outcomes and exposes concrete risk evidence for reviewer decision-making.
