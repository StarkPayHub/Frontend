import type { Metadata } from "next";
import "./globals.css";
import { StarknetProvider } from "./starknet-provider";
import { StarkzapProvider } from "@/components/StarkzapProvider";
import { AppShell } from "@/components/AppShell";

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
        {/* StarkzapProvider wraps PrivyProvider (social login) */}
        <StarkzapProvider>
          <StarknetProvider>
            <AppShell>{children}</AppShell>
          </StarknetProvider>
        </StarkzapProvider>
      </body>
    </html>
  );
}
