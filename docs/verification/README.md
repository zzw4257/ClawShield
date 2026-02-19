# Verification Artifacts

- `flow-latest.json`: output from `npm run verify:flow --workspace @clawshield/api`
- `event-latest.json`: output from `npm run verify:event ... --out docs/verification/event-latest.json`
- `STATUS.md`: latest pass/fail status with both `Latest Verify Tx Hash` and `Submission Tx Hash (env)` written by `npm run proof:refresh --workspace @clawshield/api`
- `archive/`: timestamped local run archives (json + screenshots + command logs)
- Use `npm run release:prepare -- --contractAddress <0x...> --txHash <0x...>` to verify event + sync proof fields + regenerate submission markdown.

This artifact captures a full real-path verification:
- API health
- audit start + polling to done
- report retrieval
- first onchain attestation
- idempotent second attestation
- fingerprint attestation query consistency
