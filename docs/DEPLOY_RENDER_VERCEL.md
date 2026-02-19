# DEPLOY_RENDER_VERCEL

## 1) Render API Deployment

1. Create a new Render Web Service from this repository.
2. Runtime: `Node`.
3. Root Directory: keep empty (repository root).
4. Use `render.yaml` or set commands manually:
   - Build: `npm install && npm run build --workspace @clawshield/shared-types && npm run build --workspace @clawshield/api`
   - Start: `npm run start --workspace @clawshield/api`
5. Set environment variables:
   - `BACKEND_PORT=8787`
   - `NEXT_PUBLIC_API_URL=https://clawshield-api.onrender.com`
   - `PUBLIC_API_BASE_URL=https://clawshield-api.onrender.com`
   - `DB_PATH=./apps/api/data/clawshield.db` (free plan safe)
   - `OPBNB_TESTNET_RPC_URL`
   - `PRIVATE_KEY=0x...` (must be 32-byte hex)
   - `CLAWSHIELD_CONTRACT_ADDRESS`
   - `LLM_BASE_URL`
   - `LLM_API_KEY`
   - `LLM_MODEL`
   - `CORS_ALLOWED_ORIGINS=https://claw-shield-web.vercel.app,https://<your-custom-domain>`
   - `NODE_VERSION=22`
6. Verify health endpoint:
   - `https://clawshield-api.onrender.com/api/health`
7. Verify audit output links:
   - Start any audit and confirm returned `reportUrl` uses `https://clawshield-api.onrender.com/...`, not `localhost`.
   - If `PUBLIC_API_BASE_URL` is omitted, backend will fallback to `RENDER_EXTERNAL_URL` when available.
   - If you want persistent DB across restarts, attach a Render Disk and then switch `DB_PATH` to mounted path such as `/var/data/clawshield.db`.

## 2) Vercel Web Deployment

1. Import this repository into Vercel.
2. Framework preset: `Next.js`.
3. Root Directory: `apps/web`.
4. Set environment variables:
   - `NEXT_PUBLIC_API_URL=https://clawshield-api.onrender.com`
   - `NEXT_PUBLIC_OPBNB_RPC_URL=https://opbnb-testnet-rpc.bnbchain.org`
   - `NEXT_PUBLIC_CLAWSHIELD_CONTRACT_ADDRESS=<deployed contract address>`
   - `NEXT_PUBLIC_SUBMISSION_TX_HASH=<submission tx hash>`
5. Deploy and verify:
   - `https://claw-shield-web.vercel.app`

## 3) Post-Deploy Validation

1. API health check returns 200.
2. Home page submits an audit and navigates to detail page.
3. Audit detail page reaches `done` status.
4. Green report attestation returns a valid tx hash.
5. Fingerprint history page shows latest attestation and tx link.
