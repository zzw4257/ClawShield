# ARCHITECTURE

```mermaid
flowchart LR
  U[User / Judge] --> W[Next.js Web]
  W --> A[API Server Express]
  A --> G[Git Commit Fetcher]
  G --> R[Rule Engine]
  R --> L[LLM Explainer]
  R --> H[Fingerprint & Report Hash]
  L --> P[Report JSON Storage]
  H --> P
  A --> D[(SQLite)]
  A --> C[ClawShieldRegistry on opBNB Testnet]
  C --> E[Explorer Verification]
```

## Components
- Web: audit submission, report visualization, and attestation trigger UI.
- API: orchestrates audit jobs, score calculation, report persistence, and onchain writes.
- Contract: immutable attestation events with attester accountability.
- Storage: SQLite for operational state, report JSON for reproducible evidence.
