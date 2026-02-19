export type V3RiskLevel = "green" | "yellow" | "red";

export interface VideoV3Proof {
  chain: string;
  chainId: number;
  contractAddress: string;
  txHash: string;
  contractExplorer: string;
  txExplorer: string;
}

export interface VideoV3CaseSnapshot {
  id: string;
  title: string;
  problem: string;
  repoUrl: string;
  commitSha: string;
  expectedLevel: V3RiskLevel;
  expectedDimensions: string[];
  score: number;
  level: V3RiskLevel;
  fingerprint: string;
  reportHash: string;
  dimensions: string[];
  attestOutcome: "allowed" | "denied";
  attestMessage: string;
  txHash?: string;
  evidence: {
    homeImage: string;
    auditImage: string;
    fingerprintImage: string;
    flowJson: string;
    reportJson: string;
    attestJson: string;
  };
}

export interface VideoV3EventSnapshot {
  txHash: string;
  contractAddress: string;
  blockNumber: number;
  fingerprint: string;
  score: number;
  attester: string;
  reportHash: string;
  repo: string;
  commit: string;
  timestamp: number;
}

export interface VideoV3Manifest {
  generatedAt: string;
  proof: VideoV3Proof;
  cases: VideoV3CaseSnapshot[];
  event: VideoV3EventSnapshot;
  aiEvidence: {
    loops: number;
    screenshots: string[];
    keyframes: string[];
    evidenceIndexPath: string;
  };
  urls: {
    repoUrl: string;
    demoUrl: string;
    videoUrl: string;
    apiHealthUrl: string;
  };
  media: {
    voiceoverPath: string;
    subtitlePath: string;
  };
}

export interface V3LayoutSpec {
  FRAME_W: number;
  FRAME_H: number;
  SAFE_X: number;
  TOP_BAR_Y: number;
  HEADER_Y: number;
  HEADER_MAX_W: number;
  CONTENT_Y: number;
  CONTENT_H: number;
  SUBTITLE_LANE_Y: number;
  SUBTITLE_LANE_H: number;
}

export interface V3SubtitleCue {
  id: number;
  fromFrame: number;
  toFrame: number;
  text: string;
}
