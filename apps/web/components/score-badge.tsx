import { RiskLevel } from "@clawshield/shared-types";

export function ScoreBadge({ level, score }: { level?: RiskLevel; score?: number }) {
  if (score === undefined || !level) {
    return <span className="badge unknown">Unknown</span>;
  }

  return (
    <span className={`badge ${level}`}>
      {level.toUpperCase()} · {score}
    </span>
  );
}
