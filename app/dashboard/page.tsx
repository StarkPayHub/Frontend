"use client";

import { useState } from "react";
import { useAccount, useDisconnect } from "@starknet-react/core";
import { ClaimUSDC } from "@/components/ClaimUSDC";
import { ConnectWallet } from "@/components/ConnectWallet";
import { KpiSkeleton, SubRowSkeleton } from "@/components/Skeleton";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Section = "subscriptions" | "history" | "settings";

const BG = { background: "radial-gradient(ellipse at 50% 0%, rgba(60,20,120,0.3) 0%, rgba(4,2,18,1) 60%)", backgroundColor: "#04020f" };

// ── Icons ──────────────────────────────────────────────────────────────────────
const IcoCard     = (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="3"/><path d="M2 10h20"/></svg>);
const IcoHistory  = (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>);
const IcoSettings = (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><circle cx="12" cy="12" r="3"/></svg>);
const IcoBolt     = (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L4.09 12.6A1 1 0 0 0 5 14h6l-1 8 8.91-10.6A1 1 0 0 0 18 10h-6l1-8z"/></svg>);
const IcoSparkles = (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456z"/></svg>);
const IcoMerchant = (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"/></svg>);

// ── Mock data ──────────────────────────────────────────────────────────────────
const mockSubs = [
  { planId: 1, name: "Pro Plan",     price: "$49.00 / month", renewsAt: "Apr 30, 2026", variant: "emerald" },
  { planId: 2, name: "Starter Plan", price: "$9.00 / month",  renewsAt: "May 15, 2026", variant: "amber"   },
];

const mockHistory = [
  { id: 1, date: "Mar 30, 2026", plan: "Pro Plan",     amount: "$49.00", status: "Success", tx: "0x04a1…f3c2" },
  { id: 2, date: "Mar 15, 2026", plan: "Starter Plan", amount: "$9.00",  status: "Success", tx: "0x07b2…a1d4" },
  { id: 3, date: "Feb 28, 2026", plan: "Pro Plan",     amount: "$49.00", status: "Success", tx: "0x02c3…b5e1" },
  { id: 4, date: "Feb 15, 2026", plan: "Starter Plan", amount: "$9.00",  status: "Success", tx: "0x09d4…c2f3" },
  { id: 5, date: "Jan 30, 2026", plan: "Pro Plan",     amount: "$49.00", status: "Failed",  tx: "0x01e5…d4a2" },
  { id: 6, date: "Jan 15, 2026", plan: "Starter Plan", amount: "$9.00",  status: "Success", tx: "0x06f6…e5b1" },
];

// ── Sidebar ────────────────────────────────────────────────────────────────────
function Sidebar({ address, section, setSection }: { address?: string; section: Section; setSection: (s: Section) => void }) {
  const { disconnect } = useDisconnect();
  const router = useRouter();

  const navItems: { label: string; key: Section; icon: React.ReactNode }[] = [
    { label: "My Subscriptions", key: "subscriptions", icon: IcoCard     },
    { label: "Payment History",  key: "history",       icon: IcoHistory  },
    { label: "Settings",         key: "settings",      icon: IcoSettings },
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

      <p className="px-3 py-2 text-[10px] font-mono text-zinc-600 tracking-widest uppercase">User</p>

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

      <p className="px-3 pt-4 pb-2 text-[10px] font-mono text-zinc-600 tracking-widest uppercase border-t border-white/[0.06] mt-3">Merchant</p>
      <Link href="/merchant"
        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04] transition-colors">
        <span className="text-zinc-600">{IcoMerchant}</span>
        Revenue Dashboard
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

// ── Section: My Subscriptions ─────────────────────────────────────────────────
function SectionSubscriptions() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">My Subscriptions</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage your active plans and billing</p>
        </div>
        <ClaimUSDC />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Active Plans",       value: "2"       },
          { label: "Next Renewal",       value: "12 days" },
          { label: "Total Spent (USDC)", value: "$126.00" },
        ].map((kpi) => (
          <div key={kpi.label} className="p-5 rounded-xl bg-white/[0.04] border border-white/[0.06] space-y-1">
            <p className="text-xs text-zinc-500">{kpi.label}</p>
            <p className="text-3xl font-bold text-white">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {mockSubs.map((sub) => {
          const isActive = sub.variant === "emerald";
          return (
            <div key={sub.planId}
              className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.07] transition-colors"
              style={{ border: `1px solid ${isActive ? "rgba(52,211,153,0.15)" : "rgba(245,158,11,0.15)"}` }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: isActive ? "rgba(109,40,217,0.18)" : "rgba(217,119,6,0.18)",
                  border: `1px solid ${isActive ? "rgba(139,92,246,0.3)" : "rgba(245,158,11,0.3)"}`,
                  color: isActive ? "rgba(167,139,250,1)" : "rgba(251,191,36,0.9)",
                }}>
                {isActive ? IcoBolt : IcoSparkles}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-sm">{sub.name}</p>
                <p className="text-xs text-zinc-500 mt-0.5 truncate">Renews {sub.renewsAt} · {sub.price}</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-mono flex-shrink-0"
                style={{
                  background: isActive ? "rgba(52,211,153,0.1)" : "rgba(245,158,11,0.1)",
                  border: `1px solid ${isActive ? "rgba(52,211,153,0.3)" : "rgba(245,158,11,0.3)"}`,
                  color: isActive ? "#34d399" : "#fbbf24",
                }}>
                ● {isActive ? "Active" : "Renewing"}
              </span>
              <button className="px-3 py-1.5 rounded-lg border border-white/[0.06] text-xs text-zinc-500 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/5 transition-all flex-shrink-0">
                Cancel
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Section: Payment History ──────────────────────────────────────────────────
function SectionHistory() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Payment History</h1>
        <p className="text-sm text-zinc-500 mt-1">All auto-renewal transactions on Starknet</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Payments",  value: "6"       },
          { label: "Total Spent",     value: "$174.00" },
          { label: "Success Rate",    value: "83%"     },
        ].map((kpi) => (
          <div key={kpi.label} className="p-5 rounded-xl bg-white/[0.04] border border-white/[0.06] space-y-1">
            <p className="text-xs text-zinc-500">{kpi.label}</p>
            <p className="text-3xl font-bold text-white">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] overflow-hidden">
        <div className="px-6 py-4 border-b border-white/[0.06]">
          <h2 className="font-semibold text-white text-sm">Transactions</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.04]">
              {["Date", "Plan", "Amount", "Status", "Tx Hash"].map((h) => (
                <th key={h} className="px-6 py-3 text-left text-xs text-zinc-500 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockHistory.map((row) => (
              <tr key={row.id} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02]">
                <td className="px-6 py-4 text-xs text-zinc-400 font-mono">{row.date}</td>
                <td className="px-6 py-4 text-sm text-white">{row.plan}</td>
                <td className="px-6 py-4 text-sm font-mono text-zinc-300">{row.amount}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-mono ${
                    row.status === "Success"
                      ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                      : "bg-red-500/10 border border-red-500/30 text-red-400"
                  }`}>
                    {row.status === "Success" ? "● Success" : "✕ Failed"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <a href={`https://sepolia.voyager.online/tx/${row.tx}`} target="_blank" rel="noopener noreferrer"
                    className="font-mono text-xs text-violet-400 hover:text-violet-300 transition-colors">
                    {row.tx} ↗
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

// ── Section: Settings ─────────────────────────────────────────────────────────
function SectionSettings({ address }: { address?: string }) {
  const { disconnect } = useDisconnect();
  const router = useRouter();

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Settings</h1>
        <p className="text-sm text-zinc-500 mt-1">Manage your account preferences</p>
      </div>

      {/* Wallet info */}
      <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] divide-y divide-white/[0.06]">
        <div className="px-6 py-4">
          <p className="text-xs text-zinc-500 mb-3 font-mono uppercase tracking-widest">Connected Wallet</p>
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 flex-shrink-0" style={{ boxShadow: "0 0 8px rgba(52,211,153,0.8)" }} />
            <span className="font-mono text-sm text-zinc-200 break-all">{address}</span>
          </div>
        </div>
        <div className="px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-white">Network</p>
            <p className="text-xs text-zinc-500 mt-0.5">Starknet Sepolia Testnet</p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-mono bg-violet-500/10 border border-violet-500/30 text-violet-400">Testnet</span>
        </div>
        <div className="px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-white">Auto-renewal</p>
            <p className="text-xs text-zinc-500 mt-0.5">Subscriptions renew automatically each period</p>
          </div>
          <div className="w-10 h-6 rounded-full bg-violet-500 flex items-center px-1 cursor-default">
            <span className="w-4 h-4 rounded-full bg-white ml-auto block" />
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] divide-y divide-white/[0.06]">
        <div className="px-6 py-4">
          <p className="text-xs text-zinc-500 mb-1 font-mono uppercase tracking-widest">Notifications</p>
        </div>
        {[
          { label: "Renewal reminders", desc: "3 days before each renewal", on: true  },
          { label: "Payment failures",  desc: "Alert when a renewal fails",  on: true  },
          { label: "New features",      desc: "Protocol updates and news",   on: false },
        ].map((item) => (
          <div key={item.label} className="px-6 py-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-white">{item.label}</p>
              <p className="text-xs text-zinc-500 mt-0.5">{item.desc}</p>
            </div>
            <div className={`w-10 h-6 rounded-full flex items-center px-1 cursor-default transition-colors ${item.on ? "bg-violet-500" : "bg-white/10"}`}>
              <span className={`w-4 h-4 rounded-full bg-white block transition-transform ${item.on ? "ml-auto" : ""}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Danger zone */}
      <div className="rounded-xl bg-red-500/5 border border-red-500/20 px-6 py-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-white font-medium">Disconnect wallet</p>
          <p className="text-xs text-zinc-500 mt-0.5">You will be signed out and returned to the home page.</p>
        </div>
        <button onClick={() => { disconnect(); router.push("/"); }}
          className="px-4 py-2 rounded-lg text-xs font-medium text-red-400 border border-red-500/30 hover:bg-red-500/10 transition-colors flex-shrink-0">
          Disconnect
        </button>
      </div>
    </div>
  );
}

// ── Skeleton ───────────────────────────────────────────────────────────────────
function DashboardSkeleton() {
  return (
    <div className="min-h-screen flex" style={BG}>
      <aside className="hidden md:flex flex-col w-60 min-h-screen border-r border-white/[0.06] bg-[#080610]/80 backdrop-blur-sm p-5 gap-1 sticky top-0 flex-shrink-0">
        <div className="skeleton h-8 w-32 rounded-md mb-6" />
        <div className="skeleton h-4 w-16 rounded mb-3" />
        {[1,2,3].map(i => <div key={i} className="skeleton h-10 rounded-lg" />)}
      </aside>
      <main className="flex-1 p-8 space-y-6">
        <div className="space-y-1.5">
          <div className="skeleton h-6 w-44 rounded-md" />
          <div className="skeleton h-4 w-64 rounded-md" />
        </div>
        <div className="grid grid-cols-3 gap-4"><KpiSkeleton /><KpiSkeleton /><KpiSkeleton /></div>
        <div className="space-y-3"><SubRowSkeleton /><SubRowSkeleton /></div>
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
            <rect x="2" y="7" width="20" height="14" rx="3"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
            <circle cx="12" cy="14" r="1.5" fill="rgba(167,139,250,0.85)" stroke="none"/>
          </svg>
        </div>
        <div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "1.35rem", color: "#fff" }}>Connect your wallet</h2>
          <p style={{ fontSize: "0.875rem", color: "rgba(161,161,170,0.6)", lineHeight: 1.6, marginTop: 8 }}>Sign in to view and manage your subscriptions.</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, width: "100%" }}>
          <ConnectWallet />
          <Link href="/pricing" style={{ fontSize: "0.8rem", color: "rgba(139,92,246,0.6)", textDecoration: "none", fontFamily: "monospace", letterSpacing: "0.06em" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#c4b5fd"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(139,92,246,0.6)"; }}>
            Browse plans first →
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { address, status } = useAccount();
  const [section, setSection] = useState<Section>("subscriptions");

  if (status === "reconnecting") return <DashboardSkeleton />;
  if (status !== "connected")    return <NotConnected />;

  return (
    <div className="min-h-screen flex" style={BG}>
      <Sidebar address={address} section={section} setSection={setSection} />
      <main className="flex-1 p-8 min-w-0">
        {section === "subscriptions" && <SectionSubscriptions />}
        {section === "history"       && <SectionHistory />}
        {section === "settings"      && <SectionSettings address={address} />}
      </main>
    </div>
  );
}
