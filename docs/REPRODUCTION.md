# REPRODUCTION

## Prerequisites
- Node.js 20+
- npm 10+
- Git
- MetaMask (for frontend demo)

## Steps
1. `npm install`
2. `cp .env.example .env`
3. Fill required variables:
   - `LLM_BASE_URL`, `LLM_API_KEY`, `LLM_MODEL`
   - `PRIVATE_KEY`, `CLAWSHIELD_CONTRACT_ADDRESS`, `OPBNB_TESTNET_RPC_URL`
   - Optional for release automation: `SUBMISSION_TX_HASH`, `RELEASE_REPO_URL`, `RELEASE_DEMO_URL`, `RELEASE_VIDEO_URL`, `RELEASE_API_HEALTH_URL`
   - Production CORS: `CORS_ALLOWED_ORIGINS`
4. Start backend: `npm run dev:api`
5. Start frontend: `npm run dev:web`
6. Open `http://localhost:3000`
7. Submit repo URL + commit SHA
8. Wait for report completion
9. If level is green, click attestation
10. Verify tx in explorer

## Contract
- Run tests: `npm run contracts:test`
- Compile: `npm run contracts:build`
- Deploy: `npm run contracts:deploy:opbnbTestnet`

## Media
- Generate keyframe metadata/images: `npm run images:keyframes`
- Render video: `npm run video:render`
- Render cover: `npm run --workspace @clawshield/remotion still`

## Onchain proof verification
- Verify emitted `Attested` event from tx hash:
  - `npm run verify:event --workspace @clawshield/api -- --txHash <TX_HASH> --contractAddress <CONTRACT_ADDRESS>`
- Full verification bundle (flow + event + status):
  - `npm run proof:refresh --workspace @clawshield/api`

## Submission generation
- Generate final markdown for submission form:
  - `npm run submission:generate --workspace @clawshield/api`
- Sync proof fields across docs + regenerate submission:
  - `npm run release:sync-proof -- --contractAddress <CONTRACT_ADDRESS> --txHash <TX_HASH> --repoUrl <REPO_URL> --demoUrl <DEMO_URL> --videoUrl <VIDEO_URL>`
- One-command release prepare:
  - `npm run release:prepare -- --contractAddress <CONTRACT_ADDRESS> --txHash <TX_HASH>`

## Full pre-submit gate
- Run all required checks:
  - `npm run verify:all`
- Offline quality gate:
  - `npm run verify:ci`
- Secret scan:
  - `npm run security:scan`
