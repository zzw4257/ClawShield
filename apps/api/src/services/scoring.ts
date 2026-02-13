import { Finding, RiskLevel } from "@clawshield/shared-types";
import { RepoFile } from "../lib/file-utils.js";

type Dimension = Finding["dimension"];

interface Rule {
  id: string;
  dimension: Dimension;
  severity: Finding["severity"];
  weight: number;
  regex: RegExp;
  explanation: string;
  recommendation: string;
}

const RULES: Rule[] = [
  {
    id: "remote-exec-pipe",
    dimension: "remote_execution",
    severity: "high",
    weight: 35,
    regex: /(curl|wget)\s+[^\n]{0,120}\|\s*(bash|sh)|bash\s+-c\s+["'].*(curl|wget)/i,
    explanation: "Command piping remote content into shell execution detected.",
    recommendation: "Remove direct pipe-to-shell pattern and pin checksummed artifacts."
  },
  {
    id: "credential-access",
    dimension: "credential_access",
    severity: "high",
    weight: 25,
    regex: /(mnemonic|seed phrase|private[_-]?key|\.ssh\/|id_rsa|wallet\.dat|GITHUB_TOKEN|AWS_SECRET_ACCESS_KEY|process\.env\.[A-Z_]+)/i,
    explanation: "Potential access to sensitive credentials or wallet data.",
    recommendation: "Constrain secret access and use explicit least-privilege secret mapping."
  },
  {
    id: "obfuscation",
    dimension: "obfuscation",
    severity: "medium",
    weight: 20,
    regex: /(base64\s+-d|atob\(|eval\(|Function\(|fromCharCode|\\x[0-9a-fA-F]{2})/,
    explanation: "Code obfuscation pattern detected, which may hide harmful logic.",
    recommendation: "Replace obfuscated logic with explicit, auditable code paths."
  },
  {
    id: "suspicious-network",
    dimension: "suspicious_network",
    severity: "medium",
    weight: 15,
    regex: /(ngrok|\.onion|discordapp\.com\/api\/webhooks|pastebin|raw\.githubusercontent\.com\/.+\.(sh|ps1))/i,
    explanation: "Suspicious or high-risk outbound endpoint pattern detected.",
    recommendation: "Allowlist required domains and block non-essential outbound hosts."
  },
  {
    id: "permission-mismatch",
    dimension: "permission_mismatch",
    severity: "medium",
    weight: 10,
    regex: /(sudo\s+|chmod\s+777|rm\s+-rf\s+\/|osascript|powershell\s+-enc)/i,
    explanation: "High-privilege command appears inconsistent with typical skill behavior.",
    recommendation: "Align command scope with declared functionality and document privileged actions."
  }
];

function excerpt(content: string, index: number): string {
  const start = Math.max(0, index - 60);
  const end = Math.min(content.length, index + 120);
  return content.slice(start, end).replace(/\s+/g, " ").trim();
}

function getLevel(score: number): RiskLevel {
  if (score < 30) {
    return "green";
  }
  if (score < 70) {
    return "yellow";
  }
  return "red";
}

export function evaluateRisk(files: RepoFile[]): {
  score: number;
  level: RiskLevel;
  findings: Finding[];
} {
  const findings: Finding[] = [];
  const dimensionScores = new Map<Dimension, number>();

  for (const rule of RULES) {
    let matches = 0;

    for (const file of files) {
      const match = file.content.match(rule.regex);
      if (!match || match.index === undefined) {
        continue;
      }

      matches += 1;
      if (matches > 2) {
        break;
      }

      findings.push({
        id: `${rule.id}-${findings.length + 1}`,
        dimension: rule.dimension,
        severity: rule.severity,
        evidence: `${file.relativePath}: ${excerpt(file.content, match.index)}`,
        explanation: rule.explanation,
        recommendation: rule.recommendation
      });

      const current = dimensionScores.get(rule.dimension) || 0;
      const next = Math.min(current + rule.weight, rule.weight + Math.floor(rule.weight * 0.4));
      dimensionScores.set(rule.dimension, next);
    }
  }

  const score = Math.min(
    100,
    Array.from(dimensionScores.values()).reduce((total, item) => total + item, 0)
  );

  return {
    score,
    level: getLevel(score),
    findings
  };
}
