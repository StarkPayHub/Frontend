"use client";

import { useState } from "react";
import { useAccount } from "@starknet-react/core";
import { Navbar } from "@/components/Navbar";
import { ConnectWallet } from "@/components/ConnectWallet";
import { STARKPAY_ADDRESS } from "@/lib/contracts";
import Link from "next/link";

const mockPlans = [
  { id: 1, name: "Pro Monthly", price: "$49 USDC", subs: 62, status: "Active" },
  { id: 2, name: "Starter Monthly", price: "$9 USDC", subs: 25, status: "Active" },
];

export default function MerchantPage() {
  const { account, address, status } = useAccount();
  const [withdrawing, setWithdrawing] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  async function handleWithdraw() {
    if (!account) return;
    setWithdrawing(true);
    try {
      const result = await account.execute([
        {
          contractAddress: STARKPAY_ADDRESS,
          entrypoint: "withdraw",
          calldata: [],
        },
      ]);
      setTxHash(result.transaction_hash);
    } catch (err) {
      console.error("Withdraw failed:", err);
    } finally {
      setWithdrawing(false);
    }
  }

  if (status !== "connected") {
    return (
      <div className="min-h-screen" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(60,20,120,0.3) 0%, rgba(4,2,18,1) 60%)", backgroundColor: "#04020f" }}>
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-6">
          {/* Glow backdrop */}
          <div style={{
            position: "absolute",
            width: 500, height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(109,40,217,0.12) 0%, transparent 70%)",
            filter: "blur(40px)",
            pointerEvents: "none",
          }} />

          <div style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 28,
            maxWidth: 400,
            textAlign: "center",
          }}>
            {/* Icon */}
            <div style={{
              width: 72, height: 72,
              borderRadius: 20,
              background: "rgba(109,40,217,0.12)",
              border: "1px solid rgba(139,92,246,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 40px rgba(109,40,217,0.15)",
            }}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="rgba(167,139,250,0.85)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>

            {/* Text */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <h2 style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 700,
                fontSize: "1.35rem",
                color: "#fff",
                letterSpacing: "-0.01em",
              }}>
                Connect your wallet
              </h2>
              <p style={{
                fontSize: "0.875rem",
                color: "rgba(161,161,170,0.6)",
                lineHeight: 1.6,
              }}>
                Sign in with your Starknet wallet to access the merchant dashboard and manage your plans.
              </p>
            </div>

            {/* CTA */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, width: "100%" }}>
              <ConnectWallet />
              <Link href="/pricing" style={{
                fontSize: "0.8rem",
                color: "rgba(139,92,246,0.6)",
                textDecoration: "none",
                fontFamily: "monospace",
                letterSpacing: "0.06em",
                transition: "color 0.2s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#c4b5fd"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(139,92,246,0.6)"; }}
              >
                View pricing plans →
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-60 min-h-[calc(100vh-64px)] border-r border-white/[0.06] bg-[#0d0d0d] p-6 gap-2">
          <div className="flex items-center gap-2 pb-5 border-b border-white/[0.06]">
            <div className="w-7 h-7 rounded-md bg-violet-600" />
            <span className="font-semibold text-white text-sm">StarkPayHub</span>
          </div>
          {[
            { label: "Revenue", active: true },
            { label: "My Plans", active: false },
            { label: "Subscribers", active: false },
            { label: "Withdrawals", active: false },
          ].map((item) => (
            <button
              key={item.label}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                item.active
                  ? "bg-violet-500/10 text-white font-medium"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {item.label}
            </button>
          ))}
          <div className="mt-auto pt-4 border-t border-white/[0.06]">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="font-mono text-xs text-zinc-400">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </span>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 p-8 space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Merchant Revenue</h1>
              <p className="text-sm text-zinc-500 mt-1">
                Your subscription earnings on Starknet Sepolia
              </p>
            </div>
            {txHash ? (
              <a
                href={`https://sepolia.voyager.online/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono text-emerald-400"
              >
                ✓ Withdrawn · View tx ↗
              </a>
            ) : (
              <button
                onClick={handleWithdraw}
                disabled={withdrawing || !account}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm transition-colors shadow-lg shadow-violet-500/20 disabled:opacity-50"
              >
                ↑ {withdrawing ? "Withdrawing..." : "Withdraw $4,280"}
              </button>
            )}
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "Monthly Revenue", value: "$4,280", sub: "↑ +12.4% vs last month", subColor: "text-emerald-400" },
              { label: "Active Subscribers", value: "87", sub: "↑ +6 this month", subColor: "text-emerald-400" },
              { label: "Total Revenue", value: "$28,140", sub: "Lifetime earnings", subColor: "text-zinc-500" },
              { label: "Transactions", value: "312", sub: "Auto-renewals processed", subColor: "text-zinc-500" },
            ].map((kpi) => (
              <div key={kpi.label} className="p-5 rounded-xl bg-[#111] border border-white/[0.06] space-y-2">
                <p className="text-xs text-zinc-500">{kpi.label}</p>
                <p className="text-3xl font-bold text-white">{kpi.value}</p>
                <p className={`text-xs font-mono ${kpi.subColor}`}>{kpi.sub}</p>
              </div>
            ))}
          </div>

          {/* Plans table */}
          <div className="rounded-xl bg-[#111] border border-white/[0.06] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
              <h2 className="font-semibold text-white">My Plans</h2>
              <button className="px-3 py-1.5 rounded-lg text-xs font-medium text-violet-400 border border-violet-500/30 bg-violet-500/10 hover:bg-violet-500/20 transition-colors">
                + New Plan
              </button>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.04]">
                  {["Plan Name", "Price", "Subscribers", "Status"].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-xs text-zinc-500 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mockPlans.map((plan) => (
                  <tr key={plan.id} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02]">
                    <td className="px-6 py-4 text-sm text-white">{plan.name}</td>
                    <td className="px-6 py-4 text-sm font-mono text-zinc-400">{plan.price}</td>
                    <td className="px-6 py-4 text-sm font-mono text-zinc-400">{plan.subs}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-mono bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                        {plan.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}
