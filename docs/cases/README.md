# Cases Module

This folder contains the concrete, judge-facing case system.

## Files

- `candidate-repos.json`: candidate public repos used by pinning script.
- `case-registry.lock.json`: locked, reproducible case inputs (single source of truth).
- `CASEBOOK.md`: per-case problem/input/expected/actual/evidence summary.
- `SHOWCASE.md`: screenshot-first visual overview.
- `artifacts/`: run outputs for each case (`audit/report/attest/flow/event/screenshots`).

## Commands

```bash
npm run cases:pin
npm run cases:run
npm run cases:capture
npm run cases:verify
```
