"use client";

import { useState } from "react";
import { useAccount } from "@starknet-react/core";
import { Navbar } from "@/components/Navbar";
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
      <div className="min-h-screen bg-[#0a0a0a]">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <p className="text-zinc-400">Connect your wallet to view merchant dashboard</p>
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
