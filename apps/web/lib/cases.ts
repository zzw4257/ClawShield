export type CaseAttestability = "allowed" | "denied";

export type DemoCase = {
  id: "clean_baseline" | "remote_execution_risk" | "credential_access_risk";
  title: string;
  problem: string;
  repoUrl: string;
  commitSha: string;
  expectedLevel: "green" | "yellow" | "red";
  expectedDimensions: Array<
    "remote_execution" | "credential_access" | "obfuscation" | "suspicious_network" | "permission_mismatch"
  >;
  expectedAttestability: CaseAttestability;
};

export type CaseRegistry = {
  version: number;
  generatedAt: string;
  source: string;
  cases: DemoCase[];
};
