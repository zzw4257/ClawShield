import Link from "next/link";
import { getAttestations } from "../../../lib/api";
import { ScoreBadge } from "../../../components/score-badge";
import { PROOF } from "../../../lib/proof";

export const dynamic = "force-dynamic";

type Props = {
  params: {
    fingerprint: string;
  };
};

type AttestationItem = {
  fingerprint: string;
  score: number;
  level: "green" | "yellow" | "red";
  reportUrl: string;
  reportHash: string;
  attester: string;
  txHash: string;
  blockTime: number;
};

function formatUtcTime(unixSeconds: number): string {
  if (!Number.isFinite(unixSeconds) || unixSeconds <= 0) {
    return "N/A";
  }
  return new Date(unixSeconds * 1000).toISOString();
}

export default async function FingerprintPage({ params }: Props) {
  const data = (await getAttestations(params.fingerprint)) as {
    latest: AttestationItem | null;
    history: AttestationItem[];
  };

  return (
    <main>
      <section className="hero">
        <h2>Attestation History</h2>
        <p className="mono">Fingerprint: {params.fingerprint}</p>

        {data.latest ? (
          <article className="panel">
            <h3>Latest</h3>
            <ScoreBadge score={data.latest.score} level={data.latest.level} />
            <p className="mono">
              TX:{" "}
              <a href={`${PROOF.explorerBase}/tx/${data.latest.txHash}`} target="_blank" rel="noreferrer">
                {data.latest.txHash}
              </a>
            </p>
            <p className="mono">Attester: {data.latest.attester}</p>
            <p className="small">Block time (UTC): {formatUtcTime(data.latest.blockTime)}</p>
            <a href={data.latest.reportUrl} target="_blank" rel="noreferrer">
              Open report
            </a>
          </article>
        ) : (
          <p>No onchain attestation yet.</p>
        )}

        <article className="panel">
          <h3>History</h3>
          {data.history.length === 0 ? <p>Empty</p> : null}
          {data.history.map((item, index) => (
            <div className="finding" key={`${item.txHash}-${index}`}>
              <p>
                #{index + 1} <ScoreBadge level={item.level} score={item.score} />
              </p>
              <p className="mono">
                TX:{" "}
                <a href={`${PROOF.explorerBase}/tx/${item.txHash}`} target="_blank" rel="noreferrer">
                  {item.txHash}
                </a>
              </p>
              <p className="mono">Report: {item.reportHash}</p>
              <p className="small">Block time (UTC): {formatUtcTime(item.blockTime)}</p>
            </div>
          ))}
        </article>

        <Link href="/">Back</Link>
      </section>
    </main>
  );
}
