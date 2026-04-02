"use client";

import { useAccount } from "@starknet-react/core";
import { Navbar } from "@/components/Navbar";
import { ClaimUSDC } from "@/components/ClaimUSDC";
import Link from "next/link";

// Mock data — replace with useContractRead hooks once contracts are deployed
const mockSubs = [
  {
    planId: 1,
    name: "Pro Plan",
    price: "$49.00 / month",
    renewsAt: "Apr 30, 2026",
    status: "active",
    color: "emerald",
  },
  {
    planId: 2,
    name: "Starter Plan",
    price: "$9.00 / month",
    renewsAt: "May 15, 2026",
    status: "renewing",
    color: "amber",
  },
];

export default function DashboardPage() {
  const { address, status } = useAccount();

  if (status !== "connected") {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4 text-center">
          <p className="text-zinc-400">Connect your wallet to view subscriptions</p>
          <Link href="/pricing" className="text-sm text-violet-400 hover:text-violet-300">
            Browse plans →
          </Link>
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
            { label: "My Subscriptions", active: true },
            { label: "Payment History", active: false },
            { label: "Settings", active: false },
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
              <h1 className="text-2xl font-bold text-white">My Subscriptions</h1>
              <p className="text-sm text-zinc-500 mt-1">
                Manage your active plans and billing
              </p>
            </div>
            <ClaimUSDC />
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Active Plans", value: "2" },
              { label: "Next Renewal", value: "12 days" },
              { label: "Total Spent (USDC)", value: "$126.00" },
            ].map((kpi) => (
              <div
                key={kpi.label}
                className="p-5 rounded-xl bg-[#111] border border-white/[0.06] space-y-1"
              >
                <p className="text-xs text-zinc-500">{kpi.label}</p>
                <p className="text-3xl font-bold text-white">{kpi.value}</p>
              </div>
            ))}
          </div>

          {/* Subscription cards */}
          <div className="space-y-3">
            {mockSubs.map((sub) => (
              <div
                key={sub.planId}
                className={`flex items-center gap-5 p-5 rounded-xl bg-[#111] border ${
                  sub.color === "emerald"
                    ? "border-emerald-500/20"
                    : "border-amber-500/20"
                }`}
              >
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    sub.color === "emerald"
                      ? "bg-violet-500/15"
                      : "bg-amber-500/15"
                  }`}
                >
                  <span className="text-lg">
                    {sub.color === "emerald" ? "⚡" : "◈"}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-white text-sm">{sub.name}</p>
                  <p className="text-xs text-zinc-500">
                    Renews {sub.renewsAt} · {sub.price}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-mono border ${
                    sub.status === "active"
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                      : "bg-amber-500/10 border-amber-500/30 text-amber-400"
                  }`}
                >
                  ● {sub.status === "active" ? "Active" : "Renewing"}
                </span>
                <button className="px-4 py-1.5 rounded-md border border-white/10 text-xs text-red-400 hover:bg-red-500/10 transition-colors">
                  Cancel
                </button>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
