# RISKS

## R-001 LLM instability
- Impact: Explanation missing or inconsistent.
- Mitigation: Fallback template summary; rule-based score remains deterministic.

## R-002 Git clone/fetch failure for commit
- Impact: Audit job fails.
- Mitigation: Return explicit `failed` state with error message and retry path.

## R-003 Missing chain credentials
- Impact: `/api/attest` cannot broadcast tx.
- Mitigation: Validate env and return actionable error; keep API deterministic.

## R-004 False positive rule hits
- Impact: Legit code marked risky.
- Mitigation: Surface raw evidence snippets and recommendation context.

## R-005 Demo media delay
- Impact: weaker final presentation.
- Mitigation: Prioritize executable product first; fallback to 60s cut if required.

## R-006 Key leakage risk
- Impact: severe compromise.
- Mitigation: keep `.env` local-only, no secret logging, no frontend secret exposure.
