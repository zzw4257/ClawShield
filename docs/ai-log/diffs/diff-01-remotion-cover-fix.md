# Diff 01 - Remotion Cover JSX Fix

## Before
- Cover subtitle used `->` which triggered JSX parser issue in this bundler context.

## After
- Replaced with plain text `to`.

## Outcome
- `npm run --workspace @clawshield/remotion still` passes and exports cover png.
