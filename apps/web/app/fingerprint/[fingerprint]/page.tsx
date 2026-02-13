import Link from "next/link";
import { getAttestations } from "../../../lib/api";

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
            <p>
              Score {data.latest.score} · {data.latest.level}
            </p>
            <p className="mono">TX: {data.latest.txHash}</p>
            <p className="mono">Attester: {data.latest.attester}</p>
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
                #{index + 1} {item.level} · {item.score}
              </p>
              <p className="mono">TX: {item.txHash}</p>
              <p className="mono">Report: {item.reportHash}</p>
            </div>
          ))}
        </article>

        <Link href="/">Back</Link>
      </section>
    </main>
  );
}
