# VIDEO V2 SHOTLIST

Evidence-first 7-scene timeline for `ClawShieldDemoV2`.

## Scene 1 · Problem & Threat
- Frames: `0-300`
- Time: `00:00-00:10`
- Visuals:
  - Keyframe `remotion/public/v2/keyframes/scene-01-problem.png`
  - Threat bullets (remote execution, credential access, missing commit-bound proof)
- Narration source: `docs/VIDEO_V2_NARRATION.md` Scene 1
- Judge takeaway: this is a concrete install-time trust problem.

## Scene 2 · Mechanism
- Frames: `300-684`
- Time: `00:10-00:22.8`
- Visuals:
  - Pipeline steps (`repo+commit -> score+level -> reportHash+fingerprint -> policy decision`)
  - Live tuple preview (contract + tx)
- Data source:
  - `remotion/src/v2/generated.ts` (`proof`, `cases`)
- Judge takeaway: deterministic decision boundary, not black-box AI verdict.

## Scene 3 · Case Evidence
- Frames: `684-1248`
- Time: `00:22.8-00:41.6`
- Visuals:
  - 3 parallel case cards from Case Gallery
  - clean / remote_execution / credential_access outputs
- Data source:
  - `docs/cases/case-registry.lock.json`
  - `docs/cases/artifacts/*/flow.json`
  - `remotion/public/v2/cases/*/home.png`
- Judge takeaway: same system, three reproducible outcomes.

## Scene 4 · Onchain Proof
- Frames: `1248-1722`
- Time: `00:41.6-00:57.4`
- Visuals:
  - Proof panel with contract + tx
  - Event decode facts (`fingerprint`, `score`, `reportHash`, `repo`, `commit`)
- Data source:
  - `docs/verification/event-latest.json`
  - `docs/PROOF_INDEX.md`
- Judge takeaway: attestation facts are publicly verifiable.

## Scene 5 · AI Evidence Wall
- Frames: `1722-2166`
- Time: `00:57.4-01:12.2`
- Visuals:
  - AI screenshot wall
  - Closed-loop counters and control statements
- Data source:
  - `docs/ai-log/EVIDENCE_INDEX.md`
  - `remotion/public/v2/ai-log/screenshots/*.png`
- Judge takeaway: AI contribution is traceable and reviewable.

## Scene 6 · Requirement Mapping
- Frames: `2166-2520`
- Time: `01:12.2-01:24.0`
- Visuals:
  - Requirement-to-evidence table
  - PASS states for onchain, reproducibility, AI bonus, safety boundary
- Data source:
  - `remotion/src/v2/generated.ts`
- Judge takeaway: claims in submission map one-to-one to artifacts.

## Scene 7 · Closing CTA
- Frames: `2520-2664`
- Time: `01:24.0-01:28.8`
- Visuals:
  - Hero keyframe
  - Proof URL + policy boundary close
- Judge takeaway: risky commits are denied by design; denial is valid evidence.

## Output targets
- `media/video/clawshield-demo-v2.mp4`
- `media/video/clawshield-cover-v2.png`
- `remotion/public/subtitles/clawshield-v2.srt`
- `remotion/public/v2/audio/clawshield-voiceover-v2.mp3`
