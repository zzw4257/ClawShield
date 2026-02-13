import { Finding, RiskLevel } from "@clawshield/shared-types";
import { env } from "../config/env.js";

export async function generateLlmSummary(input: {
  repoUrl: string;
  commitSha: string;
  score: number;
  level: RiskLevel;
  findings: Finding[];
}): Promise<string> {
  if (!env.llmBaseUrl || !env.llmApiKey || !env.llmModel) {
    return fallbackSummary(input);
  }

  const endpoint = env.llmBaseUrl.replace(/\/$/, "") + "/chat/completions";
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 18000);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.llmApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: env.llmModel,
        temperature: 0.1,
        messages: [
          {
            role: "system",
            content:
              "You are a security audit explainer. Output concise markdown with: overview, top risks, and fix priorities."
          },
          {
            role: "user",
            content: JSON.stringify(input)
          }
        ]
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      return fallbackSummary(input);
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const message = data.choices?.[0]?.message?.content?.trim();
    if (!message) {
      return fallbackSummary(input);
    }

    return message;
  } catch {
    return fallbackSummary(input);
  } finally {
    clearTimeout(timeout);
  }
}

function fallbackSummary(input: {
  repoUrl: string;
  commitSha: string;
  score: number;
  level: RiskLevel;
  findings: Finding[];
}): string {
  const lines = input.findings.slice(0, 3).map((finding, index) => {
    return `${index + 1}. ${finding.dimension}: ${finding.explanation}`;
  });

  return [
    `Repository: ${input.repoUrl}`,
    `Commit: ${input.commitSha}`,
    `Risk score: ${input.score} (${input.level})`,
    "Top findings:",
    ...(lines.length > 0 ? lines : ["1. No high-confidence risk pattern was detected by rules engine."]),
    "Priority: remove high-privilege/remote execution paths first, then tighten secret and network boundaries."
  ].join("\n");
}
