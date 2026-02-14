import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as dotenv from "dotenv";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(scriptDir, "..");
const projectRoot = path.resolve(workspaceRoot, "../..");

dotenv.config({ path: path.resolve(projectRoot, ".env") });
dotenv.config();

interface KeyframeSpec {
  id: string;
  purpose: string;
  prompt: string;
}

const ASPECT_RATIO = "16:9";
const RESOLUTION = "2K";

const SPECS: KeyframeSpec[] = [
  {
    id: "scene-01-problem",
    purpose: "opening threat context",
    prompt:
      "Cinematic cyber safety dashboard, BNB yellow and black warning palette, plugin supply chain risk, high contrast, clean typography, widescreen 16:9"
  },
  {
    id: "scene-02-scan",
    purpose: "risk scanning visualization",
    prompt:
      "AI audit engine scanning code repositories, risk badges, structured report cards, modern fintech UI, BNB chain vibe, 16:9"
  },
  {
    id: "scene-03-onchain-proof",
    purpose: "onchain attestation moment",
    prompt:
      "Blockchain transaction confirmation for security attestation, opBNB explorer style UI, trust seal animation frame, yellow black palette, 16:9"
  },
  {
    id: "scene-04-hero",
    purpose: "closing brand hero",
    prompt:
      "ClawShield brand hero visual, secure AI agent ecosystem, futuristic but professional, bold headline area, 16:9"
  }
];

async function optimizePrompt(basePrompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL_FLASH || "gemini-1.5-flash";

  if (!apiKey) {
    return basePrompt;
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Optimize the following prompt for high quality visual generation while keeping style constraints and 16:9 framing. Return only prompt text.\n\n${basePrompt}`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2
        }
      })
    }
  );

  if (!response.ok) {
    return basePrompt;
  }

  const json = (await response.json()) as {
    candidates?: Array<{
      content?: {
        parts?: Array<{ text?: string }>;
      };
    }>;
  };

  return json.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || basePrompt;
}

async function generateViaBanana(prompt: string): Promise<Buffer | null> {
  const endpoint = process.env.BANANA_SLIDES_URL;
  if (!endpoint) {
    return null;
  }

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: process.env.LLM_API_KEY ? `Bearer ${process.env.LLM_API_KEY}` : ""
      },
      body: JSON.stringify({
        prompt,
        size: "1920x1080",
        format: "png"
      })
    });
  } catch {
    return null;
  }

  if (!response.ok) {
    return null;
  }

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const payload = (await response.json()) as { imageBase64?: string };
    if (!payload.imageBase64) {
      return null;
    }
    return Buffer.from(payload.imageBase64, "base64");
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function generateViaGeminiImage(prompt: string): Promise<{ image: Buffer; model: string } | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_IMAGE_MODEL || "gemini-3-pro-image-preview";
  if (!apiKey) {
    return null;
  }

  let response: Response;
  try {
    response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            responseModalities: ["TEXT", "IMAGE"],
            imageConfig: {
              aspectRatio: ASPECT_RATIO,
              imageSize: RESOLUTION
            }
          }
        })
      }
    );
  } catch {
    return null;
  }

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as {
    candidates?: Array<{
      content?: {
        parts?: Array<{
          inlineData?: {
            mimeType?: string;
            data?: string;
          };
        }>;
      };
    }>;
  };

  const parts = payload.candidates?.[0]?.content?.parts || [];
  const imagePart = parts.find((part) => part.inlineData?.data);
  const base64 = imagePart?.inlineData?.data;
  if (!base64) {
    return null;
  }

  return {
    image: Buffer.from(base64, "base64"),
    model
  };
}

async function main() {
  const outputDir = path.resolve(projectRoot, "media/keyframes");
  const metaDir = path.resolve(projectRoot, "docs/ai-log/outputs");
  fs.mkdirSync(outputDir, { recursive: true });
  fs.mkdirSync(metaDir, { recursive: true });

  const runAt = new Date().toISOString();

  for (const spec of SPECS) {
    const optimized = await optimizePrompt(spec.prompt);
    const bananaImage = await generateViaBanana(optimized);
    const geminiImage = bananaImage ? null : await generateViaGeminiImage(optimized);
    const finalImage = bananaImage || geminiImage?.image || null;
    const provider = bananaImage ? "banana_slides" : geminiImage ? `gemini:${geminiImage.model}` : "none";

    const meta = {
      id: spec.id,
      purpose: spec.purpose,
      generatedAt: runAt,
      promptBase: spec.prompt,
      promptOptimized: optimized,
      provider,
      status: finalImage ? "generated" : "generation_failed",
      aspectRatio: ASPECT_RATIO,
      resolution: RESOLUTION
    };

    fs.writeFileSync(path.join(metaDir, `${spec.id}.json`), JSON.stringify(meta, null, 2), "utf8");

    if (finalImage) {
      fs.writeFileSync(path.join(outputDir, `${spec.id}.png`), finalImage);
      console.log(`generated ${spec.id}.png`);
    } else {
      console.log(`image generation unavailable for ${spec.id}; metadata saved`);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
