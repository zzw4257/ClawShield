# VIDEO V3 SHOTLIST

Evidence-grid 7-scene timeline for `ClawShieldDemoV3`.

## Scene 1 · Problem & Threat
- Frames: `0-300`
- Time: `00:00-00:10`
- Visuals:
  - Keyframe `remotion/public/v3/keyframes/scene-01-problem.png`
  - Centered 2x2 risk cards
- Subtitle-safe check:
  - Content lane ends at `y=820`
  - Subtitle lane starts at `y=860`

## Scene 2 · Mechanism
- Frames: `294-684`
- Time: `00:09.8-00:22.8`
- Visuals:
  - 60/40 centered layout
  - Left deterministic pipeline, right proof tuple
- Data source:
  - `remotion/src/v3/generated.ts`

## Scene 3 · Case Gallery
- Frames: `678-1248`
- Time: `00:22.6-00:41.6`
- Visuals:
  - Three equal-height case cards
  - `clean / remote_execution / credential_access` outcomes
- Focus:
  - Green case attests
  - Non-green cases policy-denied

## Scene 4 · Onchain Proof
- Frames: `1242-1722`
- Time: `00:41.4-00:57.4`
- Visuals:
  - Left main evidence screenshot
  - Right event decode field list
- Data source:
  - `docs/verification/event-latest.json`
  - `docs/PROOF_INDEX.md`

## Scene 5 · AI Evidence Wall
- Frames: `1716-2166`
- Time: `00:57.2-01:12.2`
- Visuals:
  - 3x2 screenshot wall
  - Right-side evidence bullets
- Data source:
  - `docs/ai-log/EVIDENCE_INDEX.md`
  - `remotion/public/v3/ai-log/screenshots/*.png`

## Scene 6 · Judge Mapping
- Frames: `2160-2520`
- Time: `01:12.0-01:24.0`
- Visuals:
  - Compact requirement-to-evidence table
  - PASS status column

## Scene 7 · Closing
- Frames: `2514-2664`
- Time: `01:23.8-01:28.8`
- Visuals:
  - Hero keyframe background
  - Two CTA cards lifted above subtitle lane

## Output targets
- `media/video/clawshield-demo-v3.mp4`
- `media/video/clawshield-cover-v3.png`
- `remotion/public/subtitles/clawshield-v3.srt`
- `remotion/public/v3/audio/clawshield-voiceover-v3.mp3`
- `remotion/public/v3/audio/voiceover-v3.meta.json`
