# CONTRACT_EXPLAINED

`ClawShieldRegistry` is the minimal trust layer for attestation facts.

## Core policy
- Only allowlisted attesters can write attestations.
- Attestation score is bounded to `0-100`.
- Default max attestable score is `29` (green-only policy).
- Owner can update allowlist and max attestable score.

## Data model
Each attestation stores:
- `fingerprint` (bytes32)
- `score` (uint8)
- `reportURI` (string)
- `reportHash` (bytes32)
- `repo` and `commit` (string)
- `attester` and `timestamp`
- revocation flags (`revoked`, `reasonURI`)

## Public methods
- `setAttester(address,bool)` owner-only
- `setMaxAttestableScore(uint8)` owner-only
- `attest(bytes32,uint8,string,bytes32,string,string)`
- `revoke(bytes32,string)` owner or latest attester
- `getLatest(bytes32)`
- `getHistory(bytes32)`

## Why this shape
- Keeps chain writes minimal and verifiable.
- Leaves heavy report content offchain but hash-verifiable.
- Enforces policy onchain so backend cannot bypass by mistake.
