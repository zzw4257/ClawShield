export function AttesterBoundaryCard() {
  return (
    <aside className="panel boundaryCard" aria-label="Attester boundary">
      <h3>Attester Boundary</h3>
      <p>
        Onchain attestation is signed by the backend attester key. AI helps explain findings, but
        AI does not sign or move funds.
      </p>
      <ul className="boundaryList">
        <li>Deterministic score decides green/yellow/red.</li>
        <li>Only green reports are eligible for attestation.</li>
        <li>Risk cases produce policy-denied evidence for judges.</li>
      </ul>
    </aside>
  );
}
