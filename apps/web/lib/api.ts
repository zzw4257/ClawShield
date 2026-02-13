export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";

export async function startAudit(payload: { repoUrl: string; commitSha: string }) {
  const response = await fetch(`${API_BASE}/api/audit/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error("Failed to start audit");
  }

  return response.json() as Promise<{ auditId: string; status: string }>;
}

export async function getAudit(auditId: string) {
  const response = await fetch(`${API_BASE}/api/audit/${auditId}`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Failed to fetch audit status");
  }
  return response.json();
}

export async function submitAttestation(auditId: string) {
  const response = await fetch(`${API_BASE}/api/attest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ auditId })
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error || "Attestation failed");
  }

  return payload as { txHash: string; chainId: number; contractAddress: string };
}

export async function getAttestations(fingerprint: string) {
  const response = await fetch(`${API_BASE}/api/attestations/${fingerprint}`, {
    cache: "no-store"
  });
  if (!response.ok) {
    throw new Error("Failed to fetch attestations");
  }
  return response.json();
}
