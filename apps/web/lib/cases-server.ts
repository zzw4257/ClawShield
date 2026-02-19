import fs from "node:fs";
import path from "node:path";
import type { CaseRegistry } from "./cases";

function candidateRegistryPaths(): string[] {
  const cwd = process.cwd();
  return [
    path.resolve(cwd, "docs/cases/case-registry.lock.json"),
    path.resolve(cwd, "../../docs/cases/case-registry.lock.json"),
    path.resolve(cwd, "../docs/cases/case-registry.lock.json")
  ];
}

export function loadCaseRegistry(): CaseRegistry {
  for (const candidate of candidateRegistryPaths()) {
    if (!fs.existsSync(candidate)) {
      continue;
    }
    const raw = fs.readFileSync(candidate, "utf8");
    const parsed = JSON.parse(raw) as CaseRegistry;
    if (Array.isArray(parsed.cases) && parsed.cases.length > 0) {
      return parsed;
    }
  }

  return {
    version: 1,
    generatedAt: new Date(0).toISOString(),
    source: "fallback",
    cases: []
  };
}
