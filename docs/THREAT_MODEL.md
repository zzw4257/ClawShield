# THREAT_MODEL

```mermaid
flowchart TD
  A[Threat Surface] --> B[Remote command execution]
  A --> C[Credential exfiltration]
  A --> D[Obfuscated payload]
  A --> E[Suspicious outbound endpoints]
  A --> F[Permission mismatch]

  B --> M1[Rule detection + high severity weighting]
  C --> M2[Sensitive pattern scanning]
  D --> M3[Obfuscation signatures]
  E --> M4[Endpoint allowlist strategy]
  F --> M5[README-intent mismatch checks]

  M1 --> G[Score + finding evidence]
  M2 --> G
  M3 --> G
  M4 --> G
  M5 --> G

  G --> H[Green/Yellow/Red decision]
  H --> I[Green-only attestation gate]
```

## Security Boundaries
- Contract does not judge risk semantics; it stores attestation facts.
- API enforces attestation policy and audit preconditions.
- LLM cannot override deterministic score and level.
