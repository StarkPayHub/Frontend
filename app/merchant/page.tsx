"use client";

import { useState } from "react";
import { useAccount, useDisconnect } from "@starknet-react/core";
import { ConnectWallet } from "@/components/ConnectWallet";
import { KpiSkeleton, TableRowSkeleton } from "@/components/Skeleton";
import { STARKPAY_ADDRESS } from "@/lib/contracts";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Section = "revenue" | "plans" | "subscribers" | "withdrawals";

const BG = { background: "radial-gradient(ellipse at 50% 0%, rgba(60,20,120,0.3) 0%, rgba(4,2,18,1) 60%)", backgroundColor: "#04020f" };

// ── Icons ──────────────────────────────────────────────────────────────────────
const IcoRevenue     = (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"/></svg>);
const IcoPlans       = (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0z"/></svg>);
const IcoSubscribers = (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0z"/></svg>);
const IcoWithdraw    = (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"/></svg>);
const IcoDash        = (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="3"/><path d="M2 10h20"/></svg>);

// ── Mock data ──────────────────────────────────────────────────────────────────
const mockPlans = [
  { id: 1, name: "Pro Monthly",     price: "$49 USDC", interval: "Monthly", subs: 62, revenue: "$3,038", status: "Active"  },
  { id: 2, name: "Starter Monthly", price: "$9 USDC",  interval: "Monthly", subs: 25, revenue: "$225",   status: "Active"  },
  { id: 3, name: "Enterprise",      price: "$199 USDC",interval: "Monthly", subs: 0,  revenue: "$0",     status: "Draft"   },
];

const mockSubscribers = [
  { id: 1, address: "0x04a1…f3c2", plan: "Pro Monthly",     since: "Jan 2026", nextRenewal: "Apr 30, 2026", status: "Active"  },
  { id: 2, address: "0x07b2…a1d4", plan: "Starter Monthly", since: "Feb 2026", nextRenewal: "May 15, 2026", status: "Active"  },
  { id: 3, address: "0x02c3…b5e1", plan: "Pro Monthly",     since: "Jan 2026", nextRenewal: "Apr 30, 2026", status: "Active"  },
  { id: 4, address: "0x09d4…c2f3", plan: "Pro Monthly",     since: "Mar 2026", nextRenewal: "Apr 30, 2026", status: "Active"  },
  { id: 5, address: "0x01e5…d4a2", plan: "Starter Monthly", since: "Mar 2026", nextRenewal: "May 15, 2026", status: "Failed"  },
  { id: 6, address: "0x06f6…e5b1", plan: "Pro Monthly",     since: "Feb 2026", nextRenewal: "Apr 30, 2026", status: "Active"  },
];

const mockWithdrawals = [
  { id: 1, date: "Mar 31, 2026", amount: "$3,860", tx: "0x04a1…f3c2" },
  { id: 2, date: "Feb 28, 2026", amount: "$3,540", tx: "0x07b2…a1d4" },
  { id: 3, date: "Jan 31, 2026", amount: "$2,990", tx: "0x02c3…b5e1" },
];

// ── Sidebar ────────────────────────────────────────────────────────────────────
function Sidebar({ address, section, setSection }: { address?: string; section: Section; setSection: (s: Section) => void }) {
  const { disconnect } = useDisconnect();
  const router = useRouter();

  const navItems: { label: string; key: Section; icon: React.ReactNode }[] = [
    { label: "Revenue",     key: "revenue",     icon: IcoRevenue     },
    { label: "My Plans",    key: "plans",       icon: IcoPlans       },
    { label: "Subscribers", key: "subscribers", icon: IcoSubscribers },
    { label: "Withdrawals", key: "withdrawals", icon: IcoWithdraw    },
  ];

  return (
    <aside className="hidden md:flex flex-col w-60 min-h-screen border-r border-white/[0.06] bg-[#080610]/80 backdrop-blur-sm p-5 gap-1 sticky top-0 flex-shrink-0">
      <Link href="/" className="flex items-center gap-2.5 px-1 pb-5 mb-1 border-b border-white/[0.06]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-sm.png" alt="StarkPayHub" width={32} height={32} style={{ objectFit: "contain" }} />
        <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14, color: "rgba(255,255,255,0.9)" }}>
          StarkPayHub
        </span>
      </Link>

      <p className="px-3 py-2 text-[10px] font-mono text-zinc-600 tracking-widest uppercase">Merchant</p>

      {navItems.map((item) => {
        const active = section === item.key;
        return (
          <button key={item.key} onClick={() => setSection(item.key)}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors ${
              active ? "bg-violet-500/10 text-white font-medium" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]"
            }`}>
            <span className={active ? "text-violet-400" : "text-zinc-600"}>{item.icon}</span>
            {item.label}
          </button>
        );
      })}

      <p className="px-3 pt-4 pb-2 text-[10px] font-mono text-zinc-600 tracking-widest uppercase border-t border-white/[0.06] mt-3">User</p>
      <Link href="/dashboard"
        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04] transition-colors">
        <span className="text-zinc-600">{IcoDash}</span>
        My Subscriptions
      </Link>

      {address && (
        <div className="mt-auto pt-4 border-t border-white/[0.06] space-y-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.04]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" style={{ boxShadow: "0 0 6px rgba(52,211,153,0.8)" }} />
            <span className="font-mono text-xs text-zinc-400 truncate">{address.slice(0, 8)}…{address.slice(-4)}</span>
          </div>
          <button onClick={() => { disconnect(); router.push("/"); }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-zinc-600 hover:text-red-400 hover:bg-red-500/5 transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Disconnect
          </button>
        </div>
      )}
    </aside>
  );
}

// ── Section: Revenue ──────────────────────────────────────────────────────────
function SectionRevenue({ account, address }: { account: any; address?: string }) {
  const [withdrawing, setWithdrawing] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  async function handleWithdraw() {
    if (!account) return;
    setWithdrawing(true);
    try {
      const result = await account.execute([{ contractAddress: STARKPAY_ADDRESS, entrypoint: "withdraw", calldata: [] }]);
      setTxHash(result.transaction_hash);
    } catch (err) {
      console.error("Withdraw failed:", err);
    } finally {
      setWithdrawing(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Merchant Revenue</h1>
          <p className="text-sm text-zinc-500 mt-1">Your subscription earnings on Starknet Sepolia</p>
        </div>
        {txHash ? (
          <a href={`https://sepolia.voyager.online/tx/${txHash}`} target="_blank" rel="noopener noreferrer"
            className="text-xs font-mono text-emerald-400 flex items-center gap-1 flex-shrink-0">
            ✓ Withdrawn · View tx ↗
          </a>
        ) : (
          <button onClick={handleWithdraw} disabled={withdrawing || !account}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm transition-colors shadow-lg shadow-violet-500/20 disabled:opacity-50 flex-shrink-0">
            {IcoWithdraw}
            {withdrawing ? "Withdrawing…" : "Withdraw $4,280"}
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Monthly Revenue",    value: "$4,280",  sub: "↑ +12.4% vs last month",  subColor: "text-emerald-400" },
          { label: "Active Subscribers", value: "87",      sub: "↑ +6 this month",          subColor: "text-emerald-400" },
          { label: "Total Revenue",      value: "$28,140", sub: "Lifetime earnings",         subColor: "text-zinc-500"   },
          { label: "Transactions",       value: "312",     sub: "Auto-renewals processed",   subColor: "text-zinc-500"   },
        ].map((kpi) => (
          <div key={kpi.label} className="p-5 rounded-xl bg-white/[0.04] border border-white/[0.06] space-y-2">
            <p className="text-xs text-zinc-500">{kpi.label}</p>
            <p className="text-3xl font-bold text-white">{kpi.value}</p>
            <p className={`text-xs font-mono ${kpi.subColor}`}>{kpi.sub}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] overflow-hidden">
        <div className="px-6 py-4 border-b border-white/[0.06]">
          <h2 className="font-semibold text-white text-sm">Active Plans Summary</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.04]">
              {["Plan", "Price", "Subscribers", "Monthly Revenue"].map((h) => (
                <th key={h} className="px-6 py-3 text-left text-xs text-zinc-500 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockPlans.filter(p => p.status === "Active").map((plan) => (
              <tr key={plan.id} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02]">
                <td className="px-6 py-4 text-sm text-white">{plan.name}</td>
                <td className="px-6 py-4 text-sm font-mono text-zinc-400">{plan.price}</td>
                <td className="px-6 py-4 text-sm font-mono text-zinc-400">{plan.subs}</td>
                <td className="px-6 py-4 text-sm font-mono text-emerald-400">{plan.revenue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Section: My Plans ─────────────────────────────────────────────────────────
function SectionPlans() {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">My Plans</h1>
          <p className="text-sm text-zinc-500 mt-1">Create and manage your subscription plans</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm transition-colors flex-shrink-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New Plan
        </button>
      </div>

      {showForm && (
        <div className="rounded-xl bg-white/[0.04] border border-violet-500/20 p-6 space-y-4">
          <h2 className="font-semibold text-white text-sm">Create New Plan</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-zinc-500">Plan Name</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Pro Monthly"
                className="w-full px-3 py-2.5 rounded-lg bg-white/[0.06] border border-white/[0.08] text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500/50" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-zinc-500">Price (USDC / month)</label>
              <input value={price} onChange={e => setPrice(e.target.value)} placeholder="e.g. 49"
                className="w-full px-3 py-2.5 rounded-lg bg-white/[0.06] border border-white/[0.08] text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500/50" />
            </div>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors">
              Create on-chain
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg border border-white/[0.08] text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.04]">
              {["Plan Name", "Price", "Interval", "Subscribers", "Revenue", "Status", ""].map((h) => (
                <th key={h} className="px-6 py-3 text-left text-xs text-zinc-500 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockPlans.map((plan) => (
              <tr key={plan.id} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02]">
                <td className="px-6 py-4 text-sm text-white font-medium">{plan.name}</td>
                <td className="px-6 py-4 text-sm font-mono text-zinc-400">{plan.price}</td>
                <td className="px-6 py-4 text-sm text-zinc-400">{plan.interval}</td>
                <td className="px-6 py-4 text-sm font-mono text-zinc-400">{plan.subs}</td>
                <td className="px-6 py-4 text-sm font-mono text-emerald-400">{plan.revenue}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-mono ${
                    plan.status === "Active"
                      ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                      : "bg-zinc-500/10 border border-zinc-500/30 text-zinc-400"
                  }`}>
                    {plan.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button className="text-xs text-zinc-600 hover:text-zinc-300 transition-colors">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Section: Subscribers ──────────────────────────────────────────────────────
function SectionSubscribers() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Subscribers</h1>
        <p className="text-sm text-zinc-500 mt-1">All active and at-risk subscriptions</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Subscribers", value: "87"  },
          { label: "Active",            value: "85"  },
          { label: "At Risk (Failed)",  value: "2"   },
        ].map((kpi) => (
          <div key={kpi.label} className="p-5 rounded-xl bg-white/[0.04] border border-white/[0.06] space-y-1">
            <p className="text-xs text-zinc-500">{kpi.label}</p>
            <p className="text-3xl font-bold text-white">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] overflow-hidden">
        <div className="px-6 py-4 border-b border-white/[0.06]">
          <h2 className="font-semibold text-white text-sm">Subscriber List</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.04]">
              {["Wallet", "Plan", "Since", "Next Renewal", "Status"].map((h) => (
                <th key={h} className="px-6 py-3 text-left text-xs text-zinc-500 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockSubscribers.map((sub) => (
              <tr key={sub.id} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02]">
                <td className="px-6 py-4 font-mono text-xs text-zinc-400">{sub.address}</td>
                <td className="px-6 py-4 text-sm text-white">{sub.plan}</td>
                <td className="px-6 py-4 text-xs text-zinc-500 font-mono">{sub.since}</td>
                <td className="px-6 py-4 text-xs text-zinc-400 font-mono">{sub.nextRenewal}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-mono ${
                    sub.status === "Active"
                      ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                      : "bg-red-500/10 border border-red-500/30 text-red-400"
                  }`}>
                    {sub.status === "Active" ? "● Active" : "✕ Failed"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Section: Withdrawals ──────────────────────────────────────────────────────
function SectionWithdrawals({ account }: { account: any }) {
  const [withdrawing, setWithdrawing] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  async function handleWithdraw() {
    if (!account) return;
    setWithdrawing(true);
    try {
      const result = await account.execute([{ contractAddress: STARKPAY_ADDRESS, entrypoint: "withdraw", calldata: [] }]);
      setTxHash(result.transaction_hash);
    } catch (err) {
      console.error("Withdraw failed:", err);
    } finally {
      setWithdrawing(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Withdrawals</h1>
        <p className="text-sm text-zinc-500 mt-1">Withdraw your accumulated USDC balance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Available to Withdraw", value: "$4,280"  },
          { label: "Total Withdrawn",       value: "$10,390" },
          { label: "Last Withdrawal",       value: "Mar 31"  },
        ].map((kpi) => (
          <div key={kpi.label} className="p-5 rounded-xl bg-white/[0.04] border border-white/[0.06] space-y-1">
            <p className="text-xs text-zinc-500">{kpi.label}</p>
            <p className="text-3xl font-bold text-white">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-white/[0.04] border border-violet-500/20 px-6 py-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-white font-medium">$4,280.00 USDC available</p>
          <p className="text-xs text-zinc-500 mt-0.5">Funds are sent directly to your connected wallet</p>
        </div>
        {txHash ? (
          <a href={`https://sepolia.voyager.online/tx/${txHash}`} target="_blank" rel="noopener noreferrer"
            className="text-xs font-mono text-emerald-400 flex items-center gap-1 flex-shrink-0">
            ✓ Withdrawn · View tx ↗
          </a>
        ) : (
          <button onClick={handleWithdraw} disabled={withdrawing || !account}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm transition-colors shadow-lg shadow-violet-500/20 disabled:opacity-50 flex-shrink-0">
            {IcoWithdraw}
            {withdrawing ? "Withdrawing…" : "Withdraw All"}
          </button>
        )}
      </div>

      <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] overflow-hidden">
        <div className="px-6 py-4 border-b border-white/[0.06]">
          <h2 className="font-semibold text-white text-sm">Withdrawal History</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.04]">
              {["Date", "Amount", "Tx Hash"].map((h) => (
                <th key={h} className="px-6 py-3 text-left text-xs text-zinc-500 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockWithdrawals.map((w) => (
              <tr key={w.id} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02]">
                <td className="px-6 py-4 text-xs text-zinc-400 font-mono">{w.date}</td>
                <td className="px-6 py-4 text-sm font-mono text-emerald-400">{w.amount}</td>
                <td className="px-6 py-4">
                  <a href={`https://sepolia.voyager.online/tx/${w.tx}`} target="_blank" rel="noopener noreferrer"
                    className="font-mono text-xs text-violet-400 hover:text-violet-300 transition-colors">
                    {w.tx} ↗
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Skeleton ───────────────────────────────────────────────────────────────────
function MerchantSkeleton() {
  return (
    <div className="min-h-screen flex" style={BG}>
      <aside className="hidden md:flex flex-col w-60 min-h-screen border-r border-white/[0.06] bg-[#080610]/80 backdrop-blur-sm p-5 gap-1 sticky top-0 flex-shrink-0">
        <div className="skeleton h-8 w-32 rounded-md mb-6" />
        <div className="skeleton h-4 w-16 rounded mb-3" />
        {[1,2,3,4].map(i => <div key={i} className="skeleton h-10 rounded-lg" />)}
      </aside>
      <main className="flex-1 p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2"><div className="skeleton h-6 w-44 rounded-md" /><div className="skeleton h-4 w-64 rounded-md" /></div>
          <div className="skeleton h-10 w-36 rounded-lg" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4"><KpiSkeleton /><KpiSkeleton /><KpiSkeleton /><KpiSkeleton /></div>
        <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] overflow-hidden">
          <div className="px-6 py-4 border-b border-white/[0.06]"><div className="skeleton h-5 w-24 rounded-md" /></div>
          <table className="w-full"><tbody><TableRowSkeleton /><TableRowSkeleton /><TableRowSkeleton /></tbody></table>
        </div>
      </main>
    </div>
  );
}

// ── Not connected ──────────────────────────────────────────────────────────────
function NotConnected() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={BG}>
      <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(109,40,217,0.12) 0%, transparent 70%)", filter: "blur(40px)", pointerEvents: "none" }} />
      <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 28, maxWidth: 400, textAlign: "center" }}>
        <div style={{ width: 72, height: 72, borderRadius: 20, background: "rgba(109,40,217,0.12)", border: "1px solid rgba(139,92,246,0.25)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 40px rgba(109,40,217,0.15)" }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(167,139,250,0.85)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        </div>
        <div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "1.35rem", color: "#fff" }}>Connect your wallet</h2>
          <p style={{ fontSize: "0.875rem", color: "rgba(161,161,170,0.6)", lineHeight: 1.6, marginTop: 8 }}>Sign in to access the merchant dashboard and manage your plans.</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, width: "100%" }}>
          <ConnectWallet />
          <Link href="/pricing" style={{ fontSize: "0.8rem", color: "rgba(139,92,246,0.6)", textDecoration: "none", fontFamily: "monospace", letterSpacing: "0.06em" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#c4b5fd"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(139,92,246,0.6)"; }}>
            View pricing plans →
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function MerchantPage() {
  const { account, address, status } = useAccount();
  const [section, setSection] = useState<Section>("revenue");

  if (status === "reconnecting") return <MerchantSkeleton />;
  if (status !== "connected")    return <NotConnected />;

  return (
    <div className="min-h-screen flex" style={BG}>
      <Sidebar address={address} section={section} setSection={setSection} />
      <main className="flex-1 p-8 min-w-0">
        {section === "revenue"     && <SectionRevenue account={account} address={address} />}
        {section === "plans"       && <SectionPlans />}
        {section === "subscribers" && <SectionSubscribers />}
        {section === "withdrawals" && <SectionWithdrawals account={account} />}
      </main>
    </div>
  );
}
