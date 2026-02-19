export type V2RiskLevel = "green" | "yellow" | "red";

export interface VideoV2Proof {
  chain: string;
  chainId: number;
  contractAddress: string;
  txHash: string;
  contractExplorer: string;
  txExplorer: string;
}

export interface VideoV2CaseSnapshot {
  id: string;
  title: string;
  problem: string;
  repoUrl: string;
  commitSha: string;
  expectedLevel: V2RiskLevel;
  expectedDimensions: string[];
  score: number;
  level: V2RiskLevel;
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

export interface VideoV2EventSnapshot {
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

export interface VideoV2Manifest {
  generatedAt: string;
  proof: VideoV2Proof;
  cases: VideoV2CaseSnapshot[];
  event: VideoV2EventSnapshot;
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
