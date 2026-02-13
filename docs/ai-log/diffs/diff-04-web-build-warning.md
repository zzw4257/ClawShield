# Diff 04 - Webpack Alias for Wagmi Optional Dependency

## Before
- Next build showed unresolved optional dependency from MetaMask SDK path.

## After
- Added alias for `@react-native-async-storage/async-storage` to `false` in Next config.

## Outcome
- `next build` succeeds cleanly.
