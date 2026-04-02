import type { Metadata } from "next";
import "./globals.css";
import { StarknetProvider } from "./starknet-provider";

export const metadata: Metadata = {
  title: "StarkPayHub — Web3 Subscription Protocol",
  description:
    "On-chain subscription protocol for SaaS on Starknet. Sign once, auto-renew forever.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <StarknetProvider>{children}</StarknetProvider>
      </body>
    </html>
  );
}
