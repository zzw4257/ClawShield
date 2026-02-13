# SECURITY

## Smart Contract Controls
- Owner-managed attester allowlist
- Onchain max attestable score (default `29`)
- Score bounds (`0-100`)
- Latest + history attestation storage
- Revocation support with reason URI

## API Safety Controls
- Strict schema validation for request payloads
- Deterministic rule engine scoring
- LLM timeout and fallback behavior
- Green-only attestation enforcement
- Idempotent attestation guard (reuse existing tx for same audit)
- Lightweight per-route rate limiting for `audit/start` and `attest`
- Bounded in-memory audit queue to avoid unbounded concurrent git fetches
- Explicit error responses for reproducibility

## Operational Controls
- `.env` is local-only and ignored by git
- No private key in frontend runtime
- Report hash anchored onchain for integrity checks
