import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "../components/providers";
import { ProofRibbon } from "../components/proof-ribbon";

export const metadata: Metadata = {
  title: "ClawShield",
  description: "Onchain attestation for OpenClaw skill safety"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <ProofRibbon />
          {children}
        </Providers>
      </body>
    </html>
  );
}
