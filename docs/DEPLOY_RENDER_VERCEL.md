# DEPLOY_RENDER_VERCEL

## 1) Render API Deployment

1. Create a new Render Web Service from this repository.
2. Runtime: `Node`.
3. Use `render.yaml` or set commands manually:
   - Build: `npm install && npm run build --workspace @clawshield/shared-types && npm run build --workspace @clawshield/api`
   - Start: `npm run start --workspace @clawshield/api`
4. Set environment variables:
   - `BACKEND_PORT=8787`
   - `NEXT_PUBLIC_API_URL=https://clawshield-api.onrender.com`
   - `DB_PATH=/var/data/clawshield.db`
   - `OPBNB_TESTNET_RPC_URL`
   - `PRIVATE_KEY`
   - `CLAWSHIELD_CONTRACT_ADDRESS`
   - `LLM_BASE_URL`
   - `LLM_API_KEY`
   - `LLM_MODEL`
   - `CORS_ALLOWED_ORIGINS=https://clawshield.vercel.app`
5. Verify health endpoint:
   - `https://clawshield-api.onrender.com/api/health`

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
   - `https://clawshield.vercel.app`

## 3) Post-Deploy Validation

1. API health check returns 200.
2. Home page submits an audit and navigates to detail page.
3. Audit detail page reaches `done` status.
4. Green report attestation returns a valid tx hash.
5. Fingerprint history page shows latest attestation and tx link.
