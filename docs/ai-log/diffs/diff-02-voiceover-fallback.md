# Diff 02 - Voiceover Fallback

## Before
- Voiceover generation failed hard when endpoint did not support selected TTS model.

## After
- Added model fallback chain and transcript fallback file output.

## Outcome
- Script always produces usable artifact (`mp3` or transcript txt) and exits successfully.
