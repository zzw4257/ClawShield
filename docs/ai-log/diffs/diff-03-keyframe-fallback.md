# Diff 03 - Keyframe Generator Resilience

## Before
- Banana endpoint socket failure terminated script.

## After
- Wrapped endpoint call in `try/catch`, fallback to metadata-only mode.

## Outcome
- `npm run images:keyframes` remains stable under endpoint instability.
