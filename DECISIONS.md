# DECISIONS

## D-001 Track & Scope
- Decision: Submit to `Agent` track with MVP core loop only.
- Why: Strongest alignment with hackathon prompt and fastest verifiable delivery.

## D-002 Chain Strategy
- Decision: Use `opBNB Testnet` as primary proof chain.
- Why: Fast deployment, low cost, repeatable demo transactions.

## D-003 Attestation Policy
- Decision: Green-only attestation (`score < 30`) plus single attester allowlist.
- Why: Keep trust semantics strict and easy for judges to reason about.

## D-004 Audit Engine
- Decision: Rule engine as source-of-truth, LLM for explanation only.
- Why: Reproducible scoring with graceful fallback when LLM unavailable.

## D-005 Evidence Format
- Decision: Report JSON persisted + hash stored onchain.
- Why: Human-readable detail offchain, minimal immutable proof onchain.

## D-006 Visual Strategy
- Decision: BNB yellow safety visual language + Remotion 90s timeline.
- Why: Strong event visual alignment and compact demo narrative.
