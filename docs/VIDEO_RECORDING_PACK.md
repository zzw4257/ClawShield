# Video Recording Pack (Local Demo -> Public Deployment)

This pack is designed for fast recording before public deployment.

## 0) V3 Render Path (Evidence-First, Local)

Run these two commands from repo root:

```bash
npm run video:v3:prepare
npm run video:v3:render
```

Expected outputs:
- `media/video/clawshield-demo-v3.mp4`
- `media/video/clawshield-cover-v3.png`
- `remotion/public/subtitles/clawshield-v3.srt`
- `remotion/public/v3/audio/clawshield-voiceover-v3.mp3`
- `remotion/public/v3/audio/voiceover-v3.meta.json`

V3 companion docs:
- `docs/VIDEO_V3_SHOTLIST.md`
- `docs/VIDEO_V3_ASSET_INDEX.md`
- `docs/VIDEO_V3_NARRATION.md`

Fallback (legacy v2, keep for backup):
- `npm run video:v2:prepare`
- `npm run video:v2:render`
- `docs/VIDEO_V2_SHOTLIST.md`
- `docs/VIDEO_V2_ASSET_INDEX.md`
- `docs/VIDEO_V2_NARRATION.md`

## 1) Core Architecture (底层构造)

### 1.1 One-line framework
- Input (`repoUrl + commitSha`) -> deterministic rule audit -> AI explanation -> report hash + fingerprint -> green-only onchain attestation.

### 1.2 Trust boundary
- Deterministic risk score is produced by rule engine (not by LLM).
- LLM is explanation-only, used for readability and remediation guidance.
- Onchain write is backend wallet controlled; AI does not sign transactions.
- Non-green result is intentionally denied by policy and recorded as proof of refusal.

### 1.3 Layer map
- Contract: `contracts/contracts/ClawShieldRegistry.sol`
- API entry: `apps/api/src/routes/api.ts`
- Audit worker: `apps/api/src/services/audit-job.ts`
- Rule engine: `apps/api/src/services/scoring.ts`
- Onchain attestation writer: `apps/api/src/services/attestation.ts`
- Home (Case Gallery): `apps/web/components/home-client.tsx`
- Audit detail (Verdict-first): `apps/web/app/audits/[auditId]/page.tsx`
- Fingerprint query: `apps/web/app/fingerprint/[fingerprint]/page.tsx`
- Shared domain types: `packages/shared-types/src/index.ts`

## 2) Ready-to-use Input Cases (录制可直接输入)

## 2.1 Primary cases (recommended, stable)

| Case ID | Repo URL | Commit SHA | Expected | Onchain outcome |
|---|---|---|---|---|
| `clean_baseline` | `https://github.com/octocat/Hello-World` | `7fd1a60b01f91b314f59955a4e4d4e80d8edf11d` | `score 0, green` | allowed, tx produced |
| `remote_execution_risk` | `https://github.com/Homebrew/install` | `5838cadbb2c7beb17c7dcdddb5f0dba6c4780feb` | `score 99, red` + `remote_execution` | denied by policy |
| `credential_access_risk` | `https://github.com/OWASP/NodeGoat` | `c5cb68a7084e4ae7dcc60e6a98768720a81841e8` | `score 63, yellow` + `credential_access` | denied by policy |

Sources:
- `docs/cases/case-registry.lock.json`
- `docs/cases/CASEBOOK.md`
- `docs/cases/SHOWCASE.md`

## 2.2 Backup cases (from your 3 reference repos)

These were evaluated locally against current rules (2026-02-18):

| Repo | Commit | Rule result |
|---|---|---|
| `https://github.com/SCARPxVeNOM/clawgency` | `44b6058abf33432a856c48a71dfd52033411c53b` | `35 / yellow`, `credential_access` |
| `https://github.com/mthdroid/YieldPilot` | `7c85cd5f89326e20e04e2063c51b715aa6480a39` | `35 / yellow`, `credential_access` |
| `https://github.com/Tarran6/VibeGuard-AI` | `5fe031ae2b6dd1a8ba9c730774a4f597b115469c` | `0 / green` |

Use backup cases only if you want to reference peer projects in video.

## 3) Recording Path (不用额外脚本)

## 3.1 Shot order (recommended)
1. Home page (`Case Gallery`) -> show three concrete problems.
2. Run `clean_baseline` -> jump to audit detail -> green verdict.
3. Click `Attest Onchain` -> show tx hash appears.
4. Open fingerprint page -> show history + explorer link.
5. Run `remote_execution_risk` -> red verdict + findings.
6. Try attestation -> show policy denial message.
7. Open `docs/cases/SHOWCASE.md` -> show screenshots + JSON evidence links.
8. Open `docs/PROOF_INDEX.md` + explorer -> close with onchain verification.

## 3.2 Files to open during recording
- Product UI:
  - `apps/web/components/home-client.tsx`
  - `apps/web/app/audits/[auditId]/page.tsx`
  - `apps/web/app/fingerprint/[fingerprint]/page.tsx`
- Technical proof:
  - `docs/verification/flow-latest.json`
  - `docs/verification/event-latest.json`
  - `docs/verification/STATUS.md`
  - `docs/PROOF_INDEX.md`
- Case evidence:
  - `docs/cases/SHOWCASE.md`
  - `docs/cases/CASEBOOK.md`
  - `docs/cases/artifacts/<case-id>/audit.json`
  - `docs/cases/artifacts/<case-id>/attest.json`
- AI bonus:
  - `AI_BUILD_LOG.md`
  - `docs/ai-log/EVIDENCE_INDEX.md`
  - `docs/ai-log/screenshots/INDEX.md`

## 4) Key Talking Points (可直接念)

## 4.1 Opening lines
- EN: "ClawShield helps users verify whether a specific OpenClaw skill commit is safe before installation."
- EN: "We do not just generate advice; we produce reproducible evidence and onchain proof."
- CN: "ClawShield 解决的是安装前的信任问题，不是泛泛的安全建议。"

## 4.2 Agent-track alignment lines
- EN: "The agent orchestrates repository checkout, deterministic risk evaluation, AI-readable explanation, and policy-based onchain action."
- EN: "This is an AI Agent with execution boundaries, not a static scanner dashboard."
- CN: "这不是纯看板，而是有执行闭环的 Agent：审计、解释、决策、上链。"

## 4.3 Safety boundary lines
- EN: "AI never signs transactions. Wallet control is explicit and operator-owned."
- EN: "Only green reports are attestable; non-green outcomes are intentionally blocked and logged."
- CN: "AI 只负责解释，分数与上链策略由确定性规则和合约边界控制。"

## 4.4 Reproducibility lines
- EN: "Every output is commit-bound: fingerprint, report hash, and attestation record can be cross-checked."
- EN: "Judges can replay the exact cases in Case Gallery and verify the same outcomes."
- CN: "输入同一个 repo+commit，会得到可复验的同类结论与证据链。"

## 4.5 Closing lines
- EN: "Build fast with AI, but make trust decisions verifiable onchain."
- EN: "ClawShield turns commit risk into an auditable go/no-go decision."
- CN: "我们把‘能跑’升级为‘可证明可信’。"

## 5) Concrete Evidence You Can Cite

- Green case tx (casebook run): `0x8edd560fb3ba17aa8f3f289e23f625ebaa5ccce5c94bf329b881d46190e9d216`
- Submission proof tx (docs canonical): `0x7c4b2c3d5bb8dd1aaa34c9dd7a218b0ab91f607d9faac237b40d6500378eab77`
- Contract: `0x8F4aF898fc2f28281D2a51d322b586C1DA0481f9`
- Rule evidence example (`remote_execution`): Homebrew README contains curl-pipe-to-shell pattern in report evidence.
- Rule evidence example (`credential_access`): NodeGoat config accesses `process.env.*` in report evidence.

## 6) Deployment Handoff (before going public)

Run in this order:
1. `npm run verify:ci`
2. `npm run cases:verify`
3. `npm run release:check`
4. `npm run proof:refresh --workspace @clawshield/api` (freeze once)
5. `npm run release:sync-proof -- --contractAddress <0x...> --txHash <0x...> --repoUrl https://github.com/zzw4257/ClawShield --demoUrl <your-public-web-url> --videoUrl media/video/clawshield-demo-v3.mp4`
6. `npm run submission:generate --workspace @clawshield/api`
7. `npm run release:check`

After deployment, replace demo URL and run step 5+6+7 once more to keep all submission docs aligned.
