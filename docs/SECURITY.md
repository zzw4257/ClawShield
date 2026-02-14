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
- Secret scan command: `npm run security:scan`
- Dedicated CI workflow: `.github/workflows/secret-scan.yml`

## Incident Response & Rotation Log

| UTC Timestamp | Scope | Action | Verification |
|---|---|---|---|
| 2026-02-14T03:20:00Z | `.env.example` template | Replaced all real-looking credentials with redacted template tokens | `rg -n "sk-|AIza|PRIVATE_KEY=" .env.example` returns no live secrets |
| 2026-02-14T03:21:00Z | Repo secret detection | Added `.gitleaks.toml` and `npm run security:scan` | Local scan command available; CI workflow added |
| 2026-02-14T03:22:00Z | Git history hygiene | Planned rewrite to remove historical sensitive `.env.example` blobs | Execute `git filter-repo` + force push + tag rebuild in release freeze step |
