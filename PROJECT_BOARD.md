# PROJECT BOARD

## Labels

- `type:contract | backend | frontend | docs | video | ai-log`
- `priority:p0 | p1 | p2`
- `status:todo | doing | blocked | review | done`
- `track:agent`
- `proof:onchain | reproducibility | ai-bonus`

## Sprint Backlog

| ID | Task | Labels | Status | Owner |
|---|---|---|---|---|
| P0-01 | Implement `ClawShieldRegistry.sol` and tests | `type:contract priority:p0 track:agent proof:onchain` | done | solo |
| P0-02 | Build audit API (`/audit/start`, `/audit/:id`, `/reports/:id`) | `type:backend priority:p0 proof:reproducibility` | done | solo |
| P0-03 | Build attestation API (`/attest`, `/attestations/:fingerprint`) | `type:backend priority:p0 proof:onchain` | done | solo |
| P0-04 | Build Next.js dashboard (submit, report, history) | `type:frontend priority:p0` | done | solo |
| P0-05 | Prepare docs 4-pack + README | `type:docs priority:p0 proof:reproducibility` | done | solo |
| P0-06 | Enforce green-only threshold onchain | `type:contract priority:p0 proof:onchain` | done | solo |
| P0-07 | Add audit queue + API rate-limit + attest idempotency | `type:backend priority:p0` | done | solo |
| P0-08 | Add API integration tests + CI workflow | `type:backend priority:p0 proof:reproducibility` | done | solo |
| P1-01 | Fill deployed contract address + first tx hash in README | `type:docs priority:p1 proof:onchain` | done | solo |
| P1-02 | Produce keyframe images with Gemini/Banana endpoint | `type:video priority:p1 proof:ai-bonus` | todo | solo |
| P1-03 | Render 90s mp4 + cover png + subtitle sync check | `type:video priority:p1` | done | solo |
| P1-04 | Capture AI screenshots and add evidence entries | `type:ai-log priority:p1 proof:ai-bonus` | done | solo |
| P1-05 | Add chain event verification script + docs | `type:backend priority:p1 proof:onchain` | done | solo |
| P1-06 | Add DoraHacks final copy generator + config | `type:docs priority:p1 proof:reproducibility` | done | solo |
| P1-07 | Judge-first README + 60-second verification path | `type:docs priority:p1 proof:reproducibility` | done | solo |
| P1-08 | Build judge packet + proof index for review flow | `type:docs priority:p1 proof:onchain` | done | solo |
| P1-09 | Add verify automation (`verify:all`, `proof:refresh`, status artifacts) | `type:backend priority:p1 proof:reproducibility` | done | solo |
| P1-10 | AI evidence index + top interventions + trace updates | `type:ai-log priority:p1 proof:ai-bonus` | done | solo |
| P1-11 | Demo runbook/script sync + remotion proof refresh | `type:video priority:p1 proof:onchain` | done | solo |
| P2-01 | Add e2e smoke with Playwright | `type:frontend priority:p2` | done | solo |
