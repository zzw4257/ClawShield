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
  PUBLIC_API_BASE_URL: z.string().optional(),
  RENDER_EXTERNAL_URL: z.string().optional(),
  CORS_ALLOWED_ORIGINS: z.string().default("*"),
  LLM_BASE_URL: z.string().optional(),
  LLM_API_KEY: z.string().optional(),
  LLM_MODEL: z.string().optional(),
  OPBNB_TESTNET_RPC_URL: z.string().default("https://opbnb-testnet-rpc.bnbchain.org"),
  PRIVATE_KEY: z.string().optional(),
  CLAWSHIELD_CONTRACT_ADDRESS: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL_PRO: z.string().optional(),
  GEMINI_MODEL_FLASH: z.string().optional(),
  GEMINI_IMAGE_MODEL: z.string().optional(),
  BANANA_SLIDES_URL: z.string().optional(),
  RELEASE_REPO_URL: z.string().optional(),
  RELEASE_DEMO_URL: z.string().optional(),
  RELEASE_VIDEO_URL: z.string().optional(),
  RELEASE_API_HEALTH_URL: z.string().optional()
});

const parsed = schema.parse(process.env);
const resolvedDbPath = path.isAbsolute(parsed.DB_PATH)
  ? parsed.DB_PATH
  : path.resolve(workspaceRoot, parsed.DB_PATH);

function firstNonEmpty(...values: Array<string | undefined>): string | undefined {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }
  return undefined;
}

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

const publicApiBaseUrl =
  firstNonEmpty(parsed.PUBLIC_API_BASE_URL, parsed.RENDER_EXTERNAL_URL, parsed.NEXT_PUBLIC_API_URL) ||
  `http://localhost:${parsed.BACKEND_PORT}`;

export const env = {
  port: parsed.BACKEND_PORT,
  dbPath: resolvedDbPath,
  reportsDir: path.resolve(workspaceRoot, "data", "reports"),
  publicApiBaseUrl: normalizeBaseUrl(publicApiBaseUrl),
  corsAllowedOrigins: parsed.CORS_ALLOWED_ORIGINS,
  llmBaseUrl: parsed.LLM_BASE_URL,
  llmApiKey: parsed.LLM_API_KEY,
  llmModel: parsed.LLM_MODEL,
  opbnbRpcUrl: parsed.OPBNB_TESTNET_RPC_URL,
  attesterPrivateKey: parsed.PRIVATE_KEY?.trim(),
  contractAddress: parsed.CLAWSHIELD_CONTRACT_ADDRESS?.trim(),
  geminiApiKey: parsed.GEMINI_API_KEY,
  geminiModelPro: parsed.GEMINI_MODEL_PRO || "gemini-1.5-pro",
  geminiModelFlash: parsed.GEMINI_MODEL_FLASH || "gemini-1.5-flash",
  geminiImageModel: parsed.GEMINI_IMAGE_MODEL || "gemini-3-pro-image-preview",
  bananaSlidesUrl: parsed.BANANA_SLIDES_URL,
  releaseRepoUrl: parsed.RELEASE_REPO_URL,
  releaseDemoUrl: parsed.RELEASE_DEMO_URL,
  releaseVideoUrl: parsed.RELEASE_VIDEO_URL,
  releaseApiHealthUrl: parsed.RELEASE_API_HEALTH_URL
};
