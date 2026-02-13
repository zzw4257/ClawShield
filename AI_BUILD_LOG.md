# AI_BUILD_LOG

## Tools & Models
- GPT/Codex: architecture, implementation, refactoring, test scaffolding
- OpenAI-compatible API (`LLM_BASE_URL`): report explanation generation
- Gemini (`GEMINI_MODEL_FLASH/PRO`): keyframe prompt optimization
- Banana image endpoint (`BANANA_SLIDES_URL`): optional keyframe rendering

## Day-by-day timeline
- Day 1: monorepo scaffold + contract/API/web baseline
- Day 2: risk engine + report persistence + attestation flow
- Day 3: docs 4-pack + submission structure
- Day 4: media scripts + subtitle + video composition

## Top 4 AI interventions
1. Input: "Enforce green-only policy end-to-end"
   Decision: enforce in backend and contract (`maxAttestableScore`)
   Benefit: avoids policy bypass and improves judge trust in consistency.
2. Input: "Make onchain proof quickly auditable"
   Decision: add `verify:event` CLI with expected-field assertions
   Benefit: converts explorer screenshot evidence into deterministic command evidence.
3. Input: "Stabilize frontend demo path"
   Decision: add Playwright E2E for home -> audit -> attest flow
   Benefit: reduces demo-day regression risk.
4. Input: "Provide one-command pre-submit gate"
   Decision: add `verify:flow`, `proof:refresh`, and root `verify:all`
   Benefit: reproducibility and final submission confidence.

## Prompt -> Output -> Decision samples
1. Prompt: "Design commit-bound attestation contract with revocation" -> Output: storage/event schema -> Decision: keep allowlist + history + latest pointer
2. Prompt: "Define reproducible risk scoring dimensions" -> Output: 5-dimension rules -> Decision: fixed weights + capped score
3. Prompt: "Generate API interface strict to hackathon scope" -> Output: 5 endpoints -> Decision: keep async queue for `/audit/start`
4. Prompt: "Draft 90-second scene structure" -> Output: 7-scene frame plan -> Decision: keep 2700-frame timeline

## Code generation examples
- Contract skeleton and tests
- API route handlers and DB schema
- Next.js audit pages and polling state
- Remotion timeline composition and subtitle scaffold
- Playwright E2E smoke tests for judge-facing UI flow
- Onchain `Attested` event verification CLI script
- DoraHacks final submission markdown generator script
- Live end-to-end flow verifier script with JSON report output (`verify:flow`)

## Debugging with AI
- Type mismatch cleanups in shared domain types
- API fallback flow when LLM endpoint is unavailable
- Chain attestation env validation strategy
- Rule scoring threshold alignment with green-only policy

## Time saved estimate
- Estimated 70-80% implementation speed-up vs manual from-scratch coding.

## Risk/quality controls
- Rule scoring remains deterministic without AI dependency
- LLM only explains findings, does not assign score directly
- Contract tests cover allowlist, bounds, and revocation
- API exposes explicit error states for reproducibility
- Browser-level E2E smoke verifies core demo path before submission
- Onchain event decoding validates emitted facts against expected fields
- One-command real-flow verification outputs auditable artifact in `docs/verification/`

## Evidence checklist (target)
- [x] >=12 traceable records in `docs/ai-log/` (`TRACE_LOG.md`)
- [x] >=6 screenshots in `docs/ai-log/screenshots/` (shot-01..shot-06)
- [x] >=4 prompt-output-result closed loops (`prompts/`, `outputs/`, `diffs/`)
