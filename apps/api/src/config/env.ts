import * as dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

const configDir = path.dirname(fileURLToPath(import.meta.url));
const apiRoot = path.resolve(configDir, "../..");
const workspaceRoot = path.resolve(apiRoot, "../..");

dotenv.config({ path: path.resolve(workspaceRoot, ".env") });
dotenv.config();

const schema = z.object({
  BACKEND_PORT: z.coerce.number().default(8787),
  DB_PATH: z.string().default(path.resolve(apiRoot, "data", "clawshield.db")),
  NEXT_PUBLIC_API_URL: z.string().optional(),
  LLM_BASE_URL: z.string().optional(),
  LLM_API_KEY: z.string().optional(),
  LLM_MODEL: z.string().optional(),
  OPBNB_TESTNET_RPC_URL: z.string().default("https://opbnb-testnet-rpc.bnbchain.org"),
  PRIVATE_KEY: z.string().optional(),
  CLAWSHIELD_CONTRACT_ADDRESS: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL_PRO: z.string().optional(),
  GEMINI_MODEL_FLASH: z.string().optional(),
  BANANA_SLIDES_URL: z.string().optional()
});

const parsed = schema.parse(process.env);

export const env = {
  port: parsed.BACKEND_PORT,
  dbPath: parsed.DB_PATH,
  reportsDir: path.resolve(workspaceRoot, "data", "reports"),
  publicApiBaseUrl: parsed.NEXT_PUBLIC_API_URL || `http://localhost:${parsed.BACKEND_PORT}`,
  llmBaseUrl: parsed.LLM_BASE_URL,
  llmApiKey: parsed.LLM_API_KEY,
  llmModel: parsed.LLM_MODEL,
  opbnbRpcUrl: parsed.OPBNB_TESTNET_RPC_URL,
  attesterPrivateKey: parsed.PRIVATE_KEY,
  contractAddress: parsed.CLAWSHIELD_CONTRACT_ADDRESS,
  geminiApiKey: parsed.GEMINI_API_KEY,
  geminiModelPro: parsed.GEMINI_MODEL_PRO || "gemini-1.5-pro",
  geminiModelFlash: parsed.GEMINI_MODEL_FLASH || "gemini-1.5-flash",
  bananaSlidesUrl: parsed.BANANA_SLIDES_URL
};
