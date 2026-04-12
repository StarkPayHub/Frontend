"use client";

import { useState } from "react";
import { useAccount, useDisconnect } from "@starknet-react/core";
import { shortString } from "starknet";
import { ConnectWallet } from "@/components/ConnectWallet";
import { KpiSkeleton, TableRowSkeleton } from "@/components/Skeleton";
import { Toast } from "@/components/Toast";
import { STARKPAY_ADDRESS } from "@/lib/contracts";
import { useMerchantStats, usdcDisplay } from "@/hooks/useMerchantStats";
import { usePlans } from "@/hooks/usePlans";
import { useReadContract } from "@starknet-react/core";
import { starkpayAbi } from "@/lib/contracts";

// Compare two Starknet addresses ignoring leading zeros and case
function addrEq(a: string | undefined, b: string | undefined): boolean {
  if (!a || !b) return false;
  try { return BigInt(a) === BigInt(b); } catch { return false; }
}
import { useSubscriptionEvents, useWithdrawalEvents, useRenewalEvents } from "@/hooks/useContractEvents";
import { buildRevenueGroups, exportExcel, exportPdf, type GroupBy } from "@/lib/exportRevenue";
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

// ── KPI Card ───────────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, subColor, orb, loading }: {
  label: string; value: string; sub?: string; subColor?: string;
  orb: { color: string; accent: string };
  loading?: boolean;
}) {
  if (loading) return <KpiSkeleton />;
  return (
    <div style={{
      position: "relative", overflow: "hidden", borderRadius: 18,
      background: "rgba(12,9,28,0.85)",
      border: "0.5px solid rgba(255,255,255,0.1)",
      backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
      padding: "24px 24px 20px",
      boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
    }}>
      <div aria-hidden style={{
        position: "absolute", width: 130, height: 130, borderRadius: "50%",
        background: orb.color, filter: "blur(38px)", top: -35, right: -25, pointerEvents: "none",
      }} />
      <div aria-hidden style={{
        position: "absolute", bottom: 0, left: 24, right: 24, height: "1px",
        background: `linear-gradient(90deg, transparent, ${orb.accent}, transparent)`,
      }} />
      <p style={{
        fontSize: 11, fontFamily: "ui-monospace,'SF Mono',monospace",
        color: "rgba(161,161,170,0.5)", letterSpacing: "0.1em", textTransform: "uppercase",
        marginBottom: 12, position: "relative",
      }}>{label}</p>
      <p style={{ fontSize: "2.5rem", fontWeight: 700, color: "#fff", lineHeight: 1, position: "relative" }}>{value}</p>
      {sub && (
        <p style={{
          fontSize: 11, fontFamily: "ui-monospace,'SF Mono',monospace",
          color: subColor ?? "rgba(161,161,170,0.4)", marginTop: 10, position: "relative",
        }}>{sub}</p>
      )}
    </div>
  );
}

// ── Sidebar ────────────────────────────────────────────────────────────────────
function Sidebar({ address, section, setSection }: { address?: string; section: Section; setSection: (s: Section) => void }) {
  const { disconnect } = useDisconnect();
  const router = useRouter();
  const [confirmSignOut, setConfirmSignOut] = useState(false);

  const navItems: { label: string; key: Section; icon: React.ReactNode }[] = [
    { label: "Revenue",     key: "revenue",     icon: IcoRevenue     },
    { label: "My Plans",    key: "plans",       icon: IcoPlans       },
    { label: "Subscribers", key: "subscribers", icon: IcoSubscribers },
    { label: "Withdrawals", key: "withdrawals", icon: IcoWithdraw    },
  ];

  return (
    <aside style={{
      flexDirection: "column", width: 240, minHeight: "100vh",
      borderRight: "0.5px solid rgba(255,255,255,0.08)",
      background: "rgba(8,6,22,0.85)",
      backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
      padding: "20px 12px", gap: 2, position: "sticky", top: 0, flexShrink: 0,
    }} className="hidden md:flex flex-col">

      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 8px 20px", marginBottom: 4, borderBottom: "0.5px solid rgba(255,255,255,0.07)", textDecoration: "none" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-sm.png" alt="StarkPayHub" width={32} height={32} style={{ objectFit: "contain" }} />
        <span style={{ fontWeight: 700, fontSize: 14, color: "rgba(255,255,255,0.9)" }}>
          StarkPayHub
        </span>
      </Link>

      <p style={{ padding: "8px 12px 6px", fontSize: 10, fontFamily: "ui-monospace,'SF Mono',monospace", color: "rgba(161,161,170,0.35)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
        Merchant
      </p>

      {navItems.map((item) => {
        const active = section === item.key;
        return (
          <button key={item.key} onClick={() => setSection(item.key)}
            style={{
              width: "100%", display: "flex", alignItems: "center", gap: 10,
              padding: "10px 12px", borderRadius: 10, border: "none", cursor: "pointer",
              fontSize: 13.5, fontWeight: active ? 500 : 400, textAlign: "left",
              background: active ? "rgba(124,58,237,0.12)" : "transparent",
              color: active ? "#fff" : "rgba(161,161,170,0.55)",
              borderLeft: active ? "2px solid rgba(139,92,246,0.7)" : "2px solid transparent",
              transition: "all 0.15s",
            }}
            onMouseEnter={e => { if (!active) { e.currentTarget.style.color = "rgba(210,210,230,0.85)"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; } }}
            onMouseLeave={e => { if (!active) { e.currentTarget.style.color = "rgba(161,161,170,0.55)"; e.currentTarget.style.background = "transparent"; } }}
          >
            <span style={{ color: active ? "#a78bfa" : "rgba(161,161,170,0.3)", flexShrink: 0 }}>{item.icon}</span>
            {item.label}
          </button>
        );
      })}

      <p style={{ padding: "16px 12px 6px", fontSize: 10, fontFamily: "ui-monospace,'SF Mono',monospace", color: "rgba(161,161,170,0.35)", letterSpacing: "0.12em", textTransform: "uppercase", borderTop: "0.5px solid rgba(255,255,255,0.07)", marginTop: 12 }}>
        User
      </p>
      <Link href="/dashboard"
        style={{
          display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10,
          fontSize: 13.5, color: "rgba(161,161,170,0.55)", textDecoration: "none",
          borderLeft: "2px solid transparent", transition: "all 0.15s",
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "rgba(210,210,230,0.85)"; (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(161,161,170,0.55)"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
      >
        <span style={{ color: "rgba(161,161,170,0.3)", flexShrink: 0 }}>{IcoDash}</span>
        My Subscriptions
      </Link>

      {address && (
        <div style={{ marginTop: "auto", paddingTop: 16, borderTop: "0.5px solid rgba(255,255,255,0.07)" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 10,
            background: "rgba(255,255,255,0.03)", marginBottom: 4,
          }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#34d399", flexShrink: 0, boxShadow: "0 0 6px rgba(52,211,153,0.8)", display: "inline-block" }} />
            {address.startsWith("0x") ? (
              <span style={{ fontFamily: "ui-monospace,'SF Mono',monospace", fontSize: 11, color: "rgba(161,161,170,0.6)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {address.slice(0, 8)}…{address.slice(-4)}
              </span>
            ) : (
              <span style={{ fontSize: 11, color: "rgba(161,161,170,0.6)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{address}</span>
            )}
          </div>
          <button onClick={() => setConfirmSignOut(true)}
            style={{
              width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "8px 12px",
              borderRadius: 10, background: "none", border: "none", cursor: "pointer",
              fontSize: 12, color: "rgba(161,161,170,0.35)", transition: "all 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.color = "rgba(248,113,113,0.85)"; e.currentTarget.style.background = "rgba(239,68,68,0.06)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "rgba(161,161,170,0.35)"; e.currentTarget.style.background = "none"; }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Disconnect
          </button>
        </div>
      )}
      {confirmSignOut && (
        <div
          onClick={() => setConfirmSignOut(false)}
          style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}
        >
          <div style={{ background: "rgba(14,10,32,0.98)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: "24px", maxWidth: 280, width: "100%", textAlign: "center" }}
            onClick={e => e.stopPropagation()}>
            <p style={{ color: "#fff", fontWeight: 600, marginBottom: 8 }}>Disconnect wallet?</p>
            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <button onClick={() => setConfirmSignOut(false)} style={{ flex: 1, height: 40, borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer" }}>Cancel</button>
              <button onClick={() => { disconnect(); setConfirmSignOut(false); router.push("/"); }} style={{ flex: 1, height: 40, borderRadius: 10, border: "none", background: "rgba(239,68,68,0.15)", color: "#f87171", fontWeight: 600, cursor: "pointer" }}>Disconnect</button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

// ── Glass container ────────────────────────────────────────────────────────────
const glassCard: React.CSSProperties = {
  background: "rgba(12,9,28,0.8)",
  border: "0.5px solid rgba(255,255,255,0.09)",
  backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
  borderRadius: 18, overflow: "hidden",
};

const tableHead: React.CSSProperties = { borderBottom: "0.5px solid rgba(255,255,255,0.07)" };
const tableRow: React.CSSProperties  = { borderBottom: "0.5px solid rgba(255,255,255,0.05)" };

// ── Empty state ────────────────────────────────────────────────────────────────
function EmptyState({ icon, title, desc, action }: { icon: React.ReactNode; title: string; desc: string; action?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "64px 24px", gap: 16 }}>
      <div style={{
        width: 48, height: 48, borderRadius: 14,
        background: "rgba(109,40,217,0.1)", border: "0.5px solid rgba(139,92,246,0.2)",
        display: "flex", alignItems: "center", justifyContent: "center", color: "#a78bfa",
      }}>{icon}</div>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 14, fontWeight: 500, color: "rgba(210,210,230,0.7)" }}>{title}</p>
        <p style={{ fontSize: 12, color: "rgba(161,161,170,0.4)", marginTop: 4, fontFamily: "ui-monospace,'SF Mono',monospace" }}>{desc}</p>
      </div>
      {action}
    </div>
  );
}

// ── Status pill ────────────────────────────────────────────────────────────────
function StatusPill({ status }: { status: string }) {
  const isActive = status === "Active";
  const isDraft  = status === "Draft";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 999,
      fontSize: 11, fontFamily: "ui-monospace,'SF Mono',monospace",
      background: isActive ? "rgba(52,211,153,0.08)" : isDraft ? "rgba(161,161,170,0.06)" : "rgba(239,68,68,0.08)",
      border: `0.5px solid ${isActive ? "rgba(52,211,153,0.25)" : isDraft ? "rgba(161,161,170,0.2)" : "rgba(239,68,68,0.25)"}`,
      color: isActive ? "#34d399" : isDraft ? "rgba(161,161,170,0.6)" : "#f87171",
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: "currentColor", display: "inline-block" }} />
      {status}
    </span>
  );
}

// ── Section: Revenue ──────────────────────────────────────────────────────────
function SectionRevenue({ account, address }: { account: any; address?: string }) {
  const [withdrawing, setWithdrawing] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [exporting, setExporting] = useState<"pdf" | "xlsx" | null>(null);
  const [groupBy, setGroupBy] = useState<GroupBy>("month");

  const { totalRevenueDisplay, withdrawableDisplay, activeSubs, txCount, withdrawable, totalRevenue, isLoading: statsLoading, refetch } = useMerchantStats();
  const { plans, isLoading: plansLoading } = usePlans();
  const { events: subEvents } = useSubscriptionEvents();
  const { events: renewalEvents } = useRenewalEvents();

  // Filter only plans belonging to the connected merchant
  const myPlans = address
    ? plans.filter(p => p.active && addrEq(p.merchant, address))
    : plans.filter(p => p.active);

  const myPlanIds = new Set(myPlans.map(p => p.id));

  const groups = buildRevenueGroups(subEvents, renewalEvents, myPlanIds, groupBy);
  const maxRevenue = groups.reduce((max, m) => m.revenue > max ? m.revenue : max, 0n);

  async function handleExport(type: "pdf" | "xlsx") {
    if (!address) return;
    setExporting(type);
    try {
      if (type === "xlsx") {
        await exportExcel(subEvents, renewalEvents, plans, address, myPlanIds, totalRevenue ?? 0n, withdrawable ?? 0n, activeSubs);
      } else {
        await exportPdf(subEvents, renewalEvents, plans, address, myPlanIds, totalRevenue ?? 0n, withdrawable ?? 0n, activeSubs);
      }
    } catch (err) {
      console.error("Export failed:", err);
      setToast({ message: "Export failed. Please try again.", type: "error" });
    } finally {
      setExporting(null);
    }
  }

  async function handleWithdraw() {
    if (!account) return;
    setWithdrawing(true);
    try {
      const result = await account.execute([{ contractAddress: STARKPAY_ADDRESS, entrypoint: "withdraw", calldata: [] }]);
      setTxHash(result.transaction_hash);
      setToast({ message: "Withdrawal submitted — funds on the way!", type: "success" });
      setTimeout(() => refetch(), 3000);
    } catch (err) {
      console.error("Withdraw failed:", err);
      setToast({ message: "Withdrawal failed. Please try again.", type: "error" });
    } finally {
      setWithdrawing(false);
    }
  }

  const kpis = [
    { label: "Withdrawable",       value: withdrawableDisplay,  sub: "Available now",            subColor: "#34d399", orb: { color: "radial-gradient(circle,rgba(52,211,153,0.35) 0%,transparent 70%)",  accent: "rgba(52,211,153,0.3)"  } },
    { label: "Active Subscribers", value: String(activeSubs),   sub: "On-chain right now",       subColor: "#34d399", orb: { color: "radial-gradient(circle,rgba(59,130,246,0.35) 0%,transparent 70%)",  accent: "rgba(59,130,246,0.3)"  } },
    { label: "Total Revenue",      value: totalRevenueDisplay,  sub: "Lifetime earnings",        subColor: undefined, orb: { color: "radial-gradient(circle,rgba(139,92,246,0.3)  0%,transparent 70%)",  accent: "rgba(139,92,246,0.3)"  } },
    { label: "Transactions",       value: String(txCount),      sub: "Auto-renewals processed",  subColor: undefined, orb: { color: "radial-gradient(circle,rgba(251,191,36,0.25) 0%,transparent 70%)",  accent: "rgba(251,191,36,0.25)" } },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#fff", lineHeight: 1.1 }}>Merchant Revenue</h1>
          <p style={{ fontSize: 13, color: "rgba(161,161,170,0.5)", marginTop: 6, fontFamily: "ui-monospace,'SF Mono',monospace" }}>
            Your subscription earnings on Starknet Sepolia
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          {/* Export buttons */}
          <button onClick={() => handleExport("xlsx")} disabled={exporting !== null || !address}
            style={{
              display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 10,
              background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.25)",
              color: "#34d399", fontWeight: 600, fontSize: 12.5, cursor: "pointer",
              opacity: (exporting !== null || !address) ? 0.5 : 1, transition: "background 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(52,211,153,0.15)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(52,211,153,0.08)"; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            {exporting === "xlsx" ? "Exporting…" : "Export Excel"}
          </button>
          <button onClick={() => handleExport("pdf")} disabled={exporting !== null || !address}
            style={{
              display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 10,
              background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)",
              color: "#f87171", fontWeight: 600, fontSize: 12.5, cursor: "pointer",
              opacity: (exporting !== null || !address) ? 0.5 : 1, transition: "background 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.15)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(239,68,68,0.08)"; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            {exporting === "pdf" ? "Exporting…" : "Export PDF"}
          </button>
          {/* Withdraw */}
          {txHash ? (
            <a href={`https://sepolia.voyager.online/tx/${txHash}`} target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 11, fontFamily: "ui-monospace,'SF Mono',monospace", color: "#34d399", display: "flex", alignItems: "center", gap: 4 }}>
              ✓ Withdrawn · View tx ↗
            </a>
          ) : (
            <button onClick={handleWithdraw} disabled={withdrawing || !account || withdrawable === 0n}
              style={{
                display: "flex", alignItems: "center", gap: 8, padding: "9px 18px", borderRadius: 10,
                background: "#7c3aed", color: "#fff", fontWeight: 600, fontSize: 13,
                border: "none", cursor: "pointer",
                boxShadow: "0 4px 20px rgba(124,58,237,0.3)",
                opacity: (withdrawing || !account || withdrawable === 0n) ? 0.5 : 1,
                transition: "background 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "#6d28d9"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#7c3aed"; }}
            >
              {IcoWithdraw}
              {withdrawing ? "Withdrawing…" : `Withdraw ${withdrawableDisplay}`}
            </button>
          )}
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} label={kpi.label} value={kpi.value} sub={kpi.sub} subColor={kpi.subColor} orb={kpi.orb} loading={statsLoading} />
        ))}
      </div>

      {/* ── Revenue Chart ── */}
      {groups.length > 0 && (
        <div style={glassCard}>
          {/* Card header + filter toggle */}
          <div style={{ padding: "14px 20px", borderBottom: "0.5px solid rgba(255,255,255,0.07)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "rgba(210,210,230,0.85)" }}>Revenue Overview</p>
            <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: 3 }}>
              {(["day", "week", "month"] as GroupBy[]).map(g => (
                <button key={g} onClick={() => setGroupBy(g)}
                  style={{
                    padding: "4px 12px", borderRadius: 6, border: "none", cursor: "pointer",
                    fontSize: 11, fontWeight: 600, fontFamily: "ui-monospace,'SF Mono',monospace",
                    textTransform: "capitalize",
                    background: groupBy === g ? "rgba(139,92,246,0.35)" : "transparent",
                    color: groupBy === g ? "#c4b5fd" : "rgba(161,161,170,0.5)",
                    transition: "all 0.15s",
                  }}
                >
                  {g === "day" ? "Daily" : g === "week" ? "Weekly" : "Monthly"}
                </button>
              ))}
            </div>
          </div>

          {/* Bar chart */}
          <div style={{ padding: "20px 20px 8px", overflowX: "auto" }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 130, minWidth: "max-content" }}>
              {groups.map(g => {
                const heightPct = maxRevenue > 0n ? Number((g.revenue * 100n) / maxRevenue) : 0;
                const isEmpty = g.revenue === 0n;
                const barW = groups.length > 60 ? 8 : groups.length > 30 ? 12 : groups.length > 14 ? 20 : 36;
                return (
                  <div key={g.key} title={isEmpty ? g.label : `${g.label}: $${(Number(g.revenue) / 1_000_000).toFixed(2)} · ${g.txCount} tx · ${g.subscribers.length} wallets`}
                    style={{ width: barW, flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "default" }}>
                    <p style={{ fontSize: 9, fontFamily: "ui-monospace,'SF Mono',monospace", color: isEmpty ? "transparent" : "rgba(161,161,170,0.45)", whiteSpace: "nowrap" }}>
                      ${(Number(g.revenue) / 1_000_000).toFixed(0)}
                    </p>
                    <div style={{ width: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", height: 80 }}>
                      <div style={{
                        width: "100%", borderRadius: "4px 4px 0 0",
                        height: isEmpty ? "3px" : `${Math.max(heightPct, 4)}%`,
                        background: isEmpty
                          ? "rgba(255,255,255,0.05)"
                          : "linear-gradient(180deg,rgba(167,139,250,0.95) 0%,rgba(109,40,217,0.65) 100%)",
                        transition: "height 0.25s ease",
                        boxShadow: heightPct > 60 ? "0 0 12px rgba(139,92,246,0.4)" : undefined,
                      }} />
                    </div>
                    <p style={{ fontSize: 8.5, fontFamily: "ui-monospace,'SF Mono',monospace", color: "rgba(161,161,170,0.35)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%", textAlign: "center" }}>
                      {g.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Table */}
          <table style={{ width: "100%", borderCollapse: "collapse", borderTop: "0.5px solid rgba(255,255,255,0.07)" }}>
            <thead>
              <tr style={tableHead}>
                {["Period", "Revenue", "Transactions", "Unique Wallets", "Subscribers"].map(h => (
                  <th key={h} style={{ padding: "10px 20px", textAlign: "left", fontSize: 11, fontFamily: "ui-monospace,'SF Mono',monospace", color: "rgba(161,161,170,0.4)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {groups.slice().reverse().map(g => (
                <tr key={g.key} style={tableRow}>
                  <td style={{ padding: "11px 20px", fontSize: 13, color: "#fff", fontWeight: 500 }}>{g.label}</td>
                  <td style={{ padding: "11px 20px", fontSize: 13, fontFamily: "ui-monospace,'SF Mono',monospace", color: "#34d399" }}>${(Number(g.revenue) / 1_000_000).toFixed(2)}</td>
                  <td style={{ padding: "11px 20px", fontSize: 13, fontFamily: "ui-monospace,'SF Mono',monospace", color: "rgba(161,161,170,0.7)" }}>{g.txCount}</td>
                  <td style={{ padding: "11px 20px", fontSize: 13, fontFamily: "ui-monospace,'SF Mono',monospace", color: "rgba(161,161,170,0.7)" }}>{g.subscribers.length}</td>
                  <td style={{ padding: "11px 20px", fontSize: 11, fontFamily: "ui-monospace,'SF Mono',monospace", color: "rgba(161,161,170,0.4)", maxWidth: 200 }}>
                    {g.subscribers.slice(0, 2).map(s => s.slice(0, 8) + "…").join(", ")}
                    {g.subscribers.length > 2 && ` +${g.subscribers.length - 2} more`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Active Plans Summary ── */}
      <div style={glassCard}>
        <div style={{ padding: "16px 24px", borderBottom: "0.5px solid rgba(255,255,255,0.07)" }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "rgba(210,210,230,0.85)" }}>Active Plans Summary</p>
        </div>
        {plansLoading ? (
          <table style={{ width: "100%", borderCollapse: "collapse" }}><tbody><TableRowSkeleton /><TableRowSkeleton /></tbody></table>
        ) : myPlans.length === 0 ? (
          <EmptyState icon={IcoRevenue} title="No active plans yet" desc="Create a plan to start earning" />
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={tableHead}>
                {["Plan", "Price / mo", "Interval"].map(h => (
                  <th key={h} style={{ padding: "12px 24px", textAlign: "left", fontSize: 11, fontFamily: "ui-monospace,'SF Mono',monospace", color: "rgba(161,161,170,0.4)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {myPlans.map(plan => (
                <tr key={plan.id} style={tableRow}>
                  <td style={{ padding: "14px 24px", fontSize: 14, color: "#fff" }}>{plan.name || `Plan #${plan.id}`}</td>
                  <td style={{ padding: "14px 24px", fontSize: 13, fontFamily: "ui-monospace,'SF Mono',monospace", color: "#34d399" }}>{usdcDisplay(plan.price)}</td>
                  <td style={{ padding: "14px 24px", fontSize: 13, fontFamily: "ui-monospace,'SF Mono',monospace", color: "rgba(161,161,170,0.6)" }}>{Math.round(plan.interval / 86400)}d</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
    </div>
  );
}

// ── Section: My Plans ─────────────────────────────────────────────────────────
const INTERVAL_OPTIONS = [
  { label: "Harian",   value: 86400 },
  { label: "Mingguan", value: 604800 },
  { label: "Bulanan",  value: 2592000 },
  { label: "Tahunan",  value: 31536000 },
];

// Local hook — baca tier langsung tanpa StarkPayProvider
function useMerchantTier(address?: string) {
  const { data: countData } = useReadContract({
    address: STARKPAY_ADDRESS as `0x${string}`,
    abi: starkpayAbi,
    functionName: "get_merchant_plan_count",
    args: address ? [address] : undefined,
    enabled: !!address,
    watch: true,
  });
  const { data: limitData } = useReadContract({
    address: STARKPAY_ADDRESS as `0x${string}`,
    abi: starkpayAbi,
    functionName: "get_merchant_plan_limit",
    args: address ? [address] : undefined,
    enabled: !!address,
    watch: true,
  });
  const planCount = countData !== undefined ? Number(countData) : 0;
  const planLimit = limitData !== undefined ? Number(limitData) : 1;
  const tier = planLimit <= 1 ? "free" : planLimit <= 3 ? "starter" : planLimit <= 10 ? "pro" : "enterprise";
  return { planCount, planLimit, canCreatePlan: planCount < planLimit, tier };
}

const TIER_COLORS: Record<string, string> = {
  free:       "rgba(161,161,170,0.15)",
  starter:    "rgba(52,211,153,0.12)",
  pro:        "rgba(124,58,237,0.15)",
  enterprise: "rgba(251,191,36,0.12)",
};
const TIER_TEXT: Record<string, string> = {
  free:       "#a1a1aa",
  starter:    "#34d399",
  pro:        "#a78bfa",
  enterprise: "#fbbf24",
};
const TIER_LABEL: Record<string, string> = {
  free:       "Free",
  starter:    "Starter",
  pro:        "Pro",
  enterprise: "Enterprise",
};

function SectionPlans({ account, address }: { account: any; address?: string }) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [intervalSec, setIntervalSec] = useState(2592000);
  const [creating, setCreating] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const { plans, isLoading } = usePlans();
  const myPlans = address ? plans.filter(p => addrEq(p.merchant, address)) : plans;

  const { planCount, planLimit, canCreatePlan, tier } = useMerchantTier(address);

  async function handleCreatePlan() {
    if (!account || !name.trim() || !price) return;
    setCreating(true);
    try {
      const nameFelt = shortString.encodeShortString(name.trim());
      const priceUsdc = BigInt(Math.round(Number(price) * 1_000_000));
      const result = await account.execute([{
        contractAddress: STARKPAY_ADDRESS,
        entrypoint: "create_plan",
        calldata: [nameFelt, priceUsdc.toString(), "0", intervalSec.toString()],
      }]);
      setToast({ message: `Plan "${name}" created! TX: ${result.transaction_hash.slice(0, 14)}…`, type: "success" });
      setShowForm(false);
      setName("");
      setPrice("");
      setIntervalSec(2592000);
    } catch (err: any) {
      setToast({ message: err?.message ?? "Failed to create plan", type: "error" });
    } finally {
      setCreating(false);
    }
  }

  const inputStyle = { padding: "10px 14px", borderRadius: 10, fontSize: 13, color: "#fff", background: "rgba(255,255,255,0.05)", border: "0.5px solid rgba(255,255,255,0.12)", outline: "none", fontFamily: "inherit", width: "100%", boxSizing: "border-box" as const };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#fff", lineHeight: 1.1 }}>My Plans</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
            <p style={{ fontSize: 13, color: "rgba(161,161,170,0.5)", fontFamily: "ui-monospace,'SF Mono',monospace", margin: 0 }}>
              {planCount}/{planLimit === 18446744073709551615 ? "∞" : planLimit} plans used
            </p>
            <span style={{
              fontSize: 11, fontWeight: 600, padding: "2px 10px", borderRadius: 99,
              background: TIER_COLORS[tier], color: TIER_TEXT[tier],
              fontFamily: "ui-monospace,'SF Mono',monospace", textTransform: "uppercase", letterSpacing: "0.08em",
            }}>
              {TIER_LABEL[tier]}
            </span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
          <button
            onClick={() => canCreatePlan && setShowForm(!showForm)}
            disabled={!canCreatePlan}
            style={{
              display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 12,
              background: canCreatePlan ? "#7c3aed" : "rgba(124,58,237,0.2)", color: "#fff",
              fontWeight: 600, fontSize: 13.5, border: canCreatePlan ? "none" : "1px solid rgba(124,58,237,0.3)",
              cursor: canCreatePlan ? "pointer" : "not-allowed", flexShrink: 0,
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New Plan
          </button>
          {!canCreatePlan && (
            <p style={{ fontSize: 11, color: "rgba(251,191,36,0.7)", fontFamily: "ui-monospace,'SF Mono',monospace", margin: 0, textAlign: "right" }}>
              Plan limit reached · Upgrade tier to add more
            </p>
          )}
        </div>
      </div>

      {showForm && (
        <div style={{ ...glassCard, padding: 24, border: "0.5px solid rgba(139,92,246,0.25)" }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "rgba(210,210,230,0.85)", marginBottom: 20 }}>Create New Plan (on-chain)</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 18 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 11, fontFamily: "ui-monospace,'SF Mono',monospace", color: "rgba(161,161,170,0.45)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Plan Name</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Pro" maxLength={31}
                style={inputStyle}
                onFocus={e => { e.currentTarget.style.border = "0.5px solid rgba(139,92,246,0.5)"; }}
                onBlur={e => { e.currentTarget.style.border = "0.5px solid rgba(255,255,255,0.12)"; }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 11, fontFamily: "ui-monospace,'SF Mono',monospace", color: "rgba(161,161,170,0.45)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Price (USDC)</label>
              <input value={price} onChange={e => setPrice(e.target.value)} placeholder="e.g. 49" type="number" min="0"
                style={inputStyle}
                onFocus={e => { e.currentTarget.style.border = "0.5px solid rgba(139,92,246,0.5)"; }}
                onBlur={e => { e.currentTarget.style.border = "0.5px solid rgba(255,255,255,0.12)"; }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 11, fontFamily: "ui-monospace,'SF Mono',monospace", color: "rgba(161,161,170,0.45)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Interval</label>
              <select value={intervalSec} onChange={e => setIntervalSec(Number(e.target.value))}
                style={{ ...inputStyle, cursor: "pointer" }}
                onFocus={e => { e.currentTarget.style.border = "0.5px solid rgba(139,92,246,0.5)"; }}
                onBlur={e => { e.currentTarget.style.border = "0.5px solid rgba(255,255,255,0.12)"; }}
              >
                {INTERVAL_OPTIONS.map(o => (
                  <option key={o.value} value={o.value} style={{ background: "#1a1033" }}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ fontSize: 11, color: "rgba(161,161,170,0.35)", fontFamily: "ui-monospace,'SF Mono',monospace", marginBottom: 16 }}>
            Network: Starknet Sepolia · Tier: {TIER_LABEL[tier]} ({planCount}/{planLimit === 18446744073709551615 ? "∞" : planLimit} plans)
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={handleCreatePlan} disabled={creating || !account || !name.trim() || !price}
              style={{
                padding: "9px 18px", borderRadius: 10, background: "#7c3aed", color: "#fff",
                fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer",
                opacity: (creating || !account || !name.trim() || !price) ? 0.5 : 1,
              }}
            >
              {creating ? "Creating…" : "Create on-chain"}
            </button>
            <button onClick={() => setShowForm(false)} style={{
              padding: "9px 18px", borderRadius: 10, background: "transparent",
              border: "0.5px solid rgba(255,255,255,0.12)", color: "rgba(161,161,170,0.55)", fontSize: 13, cursor: "pointer",
            }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div style={glassCard}>
        {isLoading ? (
          <table style={{ width: "100%", borderCollapse: "collapse" }}><tbody><TableRowSkeleton /><TableRowSkeleton /></tbody></table>
        ) : myPlans.length === 0 ? (
          <EmptyState icon={IcoPlans} title="No plans created yet" desc="Click 'New Plan' above to create your first subscription plan" />
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={tableHead}>
                {["Plan Name", "Price", "Interval", "Status"].map(h => (
                  <th key={h} style={{ padding: "12px 24px", textAlign: "left", fontSize: 11, fontFamily: "ui-monospace,'SF Mono',monospace", color: "rgba(161,161,170,0.4)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {myPlans.map(plan => (
                <tr key={plan.id} style={tableRow}>
                  <td style={{ padding: "14px 24px", fontSize: 14, color: "#fff", fontWeight: 500 }}>{plan.name || `Plan #${plan.id}`}</td>
                  <td style={{ padding: "14px 24px", fontSize: 13, fontFamily: "ui-monospace,'SF Mono',monospace", color: "rgba(161,161,170,0.6)" }}>{usdcDisplay(plan.price)} / mo</td>
                  <td style={{ padding: "14px 24px", fontSize: 13, color: "rgba(161,161,170,0.5)" }}>{Math.round(plan.interval / 86400)} days</td>
                  <td style={{ padding: "14px 24px" }}>
                    <StatusPill status={plan.active ? "Active" : "Inactive"} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
    </div>
  );
}

// ── Section: Subscribers ──────────────────────────────────────────────────────
function SectionSubscribers({ address }: { address?: string }) {
  const { events, isLoading } = useSubscriptionEvents();
  const { plans } = usePlans();
  const { activeSubs } = useMerchantStats();

  // Only events for plans owned by this merchant
  const myPlanIds = new Set(
    address
      ? plans.filter(p => addrEq(p.merchant, address)).map(p => p.id)
      : plans.map(p => p.id)
  );

  const myEvents = events.filter(e => myPlanIds.has(e.planId));

  // Deduplicate: keep latest event per user+plan
  const latestByKey = new Map<string, typeof events[0]>();
  for (const e of myEvents) {
    const key = `${e.user}:${e.planId}`;
    if (!latestByKey.has(key) || e.blockNumber > (latestByKey.get(key)?.blockNumber ?? 0)) {
      latestByKey.set(key, e);
    }
  }
  const subscribers = Array.from(latestByKey.values());

  function getPlanName(planId: number) {
    return plans.find(p => p.id === planId)?.name || `Plan #${planId}`;
  }

  function formatPeriodEnd(ts: number) {
    if (!ts) return "—";
    return new Date(ts * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  const subKpis = [
    { label: "Active Subscribers", value: String(activeSubs), orb: { color: "radial-gradient(circle,rgba(59,130,246,0.35) 0%,transparent 70%)", accent: "rgba(59,130,246,0.3)" } },
    { label: "Unique Wallets",     value: String(new Set(myEvents.map(e => e.user)).size), orb: { color: "radial-gradient(circle,rgba(52,211,153,0.35) 0%,transparent 70%)", accent: "rgba(52,211,153,0.3)" } },
    { label: "Total Events",       value: String(myEvents.length), orb: { color: "radial-gradient(circle,rgba(139,92,246,0.3) 0%,transparent 70%)", accent: "rgba(139,92,246,0.3)" } },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#fff", lineHeight: 1.1 }}>Subscribers</h1>
        <p style={{ fontSize: 13, color: "rgba(161,161,170,0.5)", marginTop: 6, fontFamily: "ui-monospace,'SF Mono',monospace" }}>
          All subscriptions from on-chain events
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
        {subKpis.map(kpi => (
          <KpiCard key={kpi.label} label={kpi.label} value={kpi.value} orb={kpi.orb} loading={isLoading} />
        ))}
      </div>

      <div style={glassCard}>
        <div style={{ padding: "16px 24px", borderBottom: "0.5px solid rgba(255,255,255,0.07)" }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "rgba(210,210,230,0.85)" }}>Subscriber List</p>
        </div>
        {isLoading ? (
          <table style={{ width: "100%", borderCollapse: "collapse" }}><tbody><TableRowSkeleton /><TableRowSkeleton /></tbody></table>
        ) : subscribers.length === 0 ? (
          <EmptyState icon={IcoSubscribers} title="No subscribers yet" desc="SubscriptionCreated events will appear here" />
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={tableHead}>
                {["Wallet", "Plan", "Renews Until", "Tx"].map(h => (
                  <th key={h} style={{ padding: "12px 24px", textAlign: "left", fontSize: 11, fontFamily: "ui-monospace,'SF Mono',monospace", color: "rgba(161,161,170,0.4)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {subscribers.map(sub => (
                <tr key={`${sub.user}:${sub.planId}`} style={tableRow}>
                  <td style={{ padding: "14px 24px", fontFamily: "ui-monospace,'SF Mono',monospace", fontSize: 12, color: "rgba(161,161,170,0.55)" }}>
                    {sub.user.slice(0, 8)}…{sub.user.slice(-4)}
                  </td>
                  <td style={{ padding: "14px 24px", fontSize: 14, color: "#fff" }}>{getPlanName(sub.planId)}</td>
                  <td style={{ padding: "14px 24px", fontSize: 12, fontFamily: "ui-monospace,'SF Mono',monospace", color: "rgba(161,161,170,0.5)" }}>
                    {formatPeriodEnd(sub.periodEnd)}
                  </td>
                  <td style={{ padding: "14px 24px" }}>
                    <a href={`https://sepolia.voyager.online/tx/${sub.txHash}`} target="_blank" rel="noopener noreferrer"
                      style={{ fontFamily: "ui-monospace,'SF Mono',monospace", fontSize: 11, color: "#a78bfa", textDecoration: "none" }}>
                      {sub.txHash.slice(0, 8)}…↗
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ── Section: Withdrawals ──────────────────────────────────────────────────────
function SectionWithdrawals({ account, address }: { account: any; address?: string }) {
  const [withdrawing, setWithdrawing] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const { withdrawable, withdrawableDisplay, totalRevenue, totalRevenueDisplay, isLoading: statsLoading, refetch } = useMerchantStats();
  const { events: wdEvents, isLoading: eventsLoading } = useWithdrawalEvents(address);

  const totalWithdrawn = totalRevenue - withdrawable;

  async function handleWithdraw() {
    if (!account) return;
    setWithdrawing(true);
    try {
      const result = await account.execute([{ contractAddress: STARKPAY_ADDRESS, entrypoint: "withdraw", calldata: [] }]);
      setTxHash(result.transaction_hash);
      setToast({ message: "Withdrawal submitted — funds on the way!", type: "success" });
      setTimeout(() => refetch(), 3000);
    } catch (err) {
      console.error("Withdraw failed:", err);
      setToast({ message: "Withdrawal failed. Please try again.", type: "error" });
    } finally {
      setWithdrawing(false);
    }
  }

  const wdKpis = [
    { label: "Available to Withdraw", value: withdrawableDisplay,          orb: { color: "radial-gradient(circle,rgba(52,211,153,0.35) 0%,transparent 70%)",  accent: "rgba(52,211,153,0.3)"  } },
    { label: "Total Withdrawn",       value: usdcDisplay(totalWithdrawn),  orb: { color: "radial-gradient(circle,rgba(139,92,246,0.3)  0%,transparent 70%)",  accent: "rgba(139,92,246,0.3)"  } },
    { label: "Lifetime Revenue",      value: totalRevenueDisplay,          orb: { color: "radial-gradient(circle,rgba(59,130,246,0.3)  0%,transparent 70%)",  accent: "rgba(59,130,246,0.3)"  } },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#fff", lineHeight: 1.1 }}>Withdrawals</h1>
        <p style={{ fontSize: 13, color: "rgba(161,161,170,0.5)", marginTop: 6, fontFamily: "ui-monospace,'SF Mono',monospace" }}>
          Withdraw your accumulated USDC balance
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
        {wdKpis.map(kpi => (
          <KpiCard key={kpi.label} label={kpi.label} value={kpi.value} orb={kpi.orb} loading={statsLoading} />
        ))}
      </div>

      {/* Withdraw action card */}
      <div style={{
        ...glassCard,
        border: "0.5px solid rgba(139,92,246,0.2)",
        padding: "20px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
      }}>
        <div>
          <p style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>{withdrawableDisplay} USDC available</p>
          <p style={{ fontSize: 12, fontFamily: "ui-monospace,'SF Mono',monospace", color: "rgba(161,161,170,0.4)", marginTop: 4 }}>
            Funds are sent directly to your connected wallet
          </p>
        </div>
        {txHash ? (
          <a href={`https://sepolia.voyager.online/tx/${txHash}`} target="_blank" rel="noopener noreferrer"
            style={{ fontSize: 11, fontFamily: "ui-monospace,'SF Mono',monospace", color: "#34d399", display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
            ✓ Withdrawn · View tx ↗
          </a>
        ) : (
          <button onClick={handleWithdraw} disabled={withdrawing || !account || withdrawable === 0n}
            style={{
              display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 12,
              background: "#7c3aed", color: "#fff", fontWeight: 600, fontSize: 13.5,
              border: "none", cursor: "pointer", flexShrink: 0,
              boxShadow: "0 4px 20px rgba(124,58,237,0.3)",
              opacity: (withdrawing || !account || withdrawable === 0n) ? 0.5 : 1,
              transition: "background 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#6d28d9"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#7c3aed"; }}
          >
            {IcoWithdraw}
            {withdrawing ? "Withdrawing…" : "Withdraw All"}
          </button>
        )}
      </div>

      <div style={glassCard}>
        <div style={{ padding: "16px 24px", borderBottom: "0.5px solid rgba(255,255,255,0.07)" }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "rgba(210,210,230,0.85)" }}>Withdrawal History</p>
        </div>
        {eventsLoading ? (
          <table style={{ width: "100%", borderCollapse: "collapse" }}><tbody><TableRowSkeleton /><TableRowSkeleton /></tbody></table>
        ) : wdEvents.length === 0 ? (
          <EmptyState icon={IcoWithdraw} title="No withdrawals yet" desc="Your withdrawal history will appear here" />
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={tableHead}>
                {["Block", "Amount", "Tx Hash"].map(h => (
                  <th key={h} style={{ padding: "12px 24px", textAlign: "left", fontSize: 11, fontFamily: "ui-monospace,'SF Mono',monospace", color: "rgba(161,161,170,0.4)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...wdEvents].reverse().map((w, i) => (
                <tr key={i} style={tableRow}>
                  <td style={{ padding: "14px 24px", fontSize: 12, fontFamily: "ui-monospace,'SF Mono',monospace", color: "rgba(161,161,170,0.5)" }}>#{w.blockNumber}</td>
                  <td style={{ padding: "14px 24px", fontSize: 13, fontFamily: "ui-monospace,'SF Mono',monospace", color: "#34d399" }}>{usdcDisplay(w.amount)}</td>
                  <td style={{ padding: "14px 24px" }}>
                    <a href={`https://sepolia.voyager.online/tx/${w.txHash}`} target="_blank" rel="noopener noreferrer"
                      style={{ fontFamily: "ui-monospace,'SF Mono',monospace", fontSize: 12, color: "#a78bfa", textDecoration: "none" }}>
                      {w.txHash.slice(0, 14)}…↗
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
    </div>
  );
}

// ── Skeleton ───────────────────────────────────────────────────────────────────
function MerchantSkeleton() {
  return (
    <div className="min-h-screen flex" style={BG}>
      <aside className="hidden md:flex flex-col w-60 min-h-screen p-5 gap-1 sticky top-0 flex-shrink-0"
        style={{ borderRight: "0.5px solid rgba(255,255,255,0.08)", background: "rgba(8,6,22,0.85)" }}>
        <div className="skeleton h-8 w-32 rounded-md mb-6" />
        <div className="skeleton h-4 w-16 rounded mb-3" />
        {[1,2,3,4].map(i => <div key={i} className="skeleton h-10 rounded-lg" />)}
      </aside>
      <main className="flex-1 p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2"><div className="skeleton h-7 w-44 rounded-md" /><div className="skeleton h-4 w-64 rounded-md" /></div>
          <div className="skeleton h-10 w-36 rounded-xl" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4"><KpiSkeleton /><KpiSkeleton /><KpiSkeleton /><KpiSkeleton /></div>
        <div style={{ ...glassCard }}>
          <div style={{ padding: "16px 24px", borderBottom: "0.5px solid rgba(255,255,255,0.07)" }}><div className="skeleton h-5 w-24 rounded-md" /></div>
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
        <div style={{ width: 72, height: 72, borderRadius: 20, background: "rgba(109,40,217,0.12)", border: "0.5px solid rgba(139,92,246,0.25)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 40px rgba(109,40,217,0.15)" }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(167,139,250,0.85)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        </div>
        <div>
          <h2 style={{ fontWeight: 700, fontSize: "1.35rem", color: "#fff" }}>Connect your wallet</h2>
          <p style={{ fontSize: "0.875rem", color: "rgba(161,161,170,0.6)", lineHeight: 1.6, marginTop: 8 }}>
            Sign in to access the merchant dashboard and manage your plans.
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, width: "100%" }}>
          <ConnectWallet />
          <Link href="/pricing" style={{ fontSize: "0.8rem", color: "rgba(139,92,246,0.6)", textDecoration: "none", fontFamily: "ui-monospace,'SF Mono',monospace", letterSpacing: "0.06em" }}
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

  const isAuth = status === "connected";
  const displayId = address;

  if (status === "reconnecting") return <MerchantSkeleton />;
  if (!isAuth) return <NotConnected />;

  return (
    <div className="min-h-screen flex" style={BG}>
      <Sidebar address={displayId} section={section} setSection={setSection} />
      <main style={{ flex: 1, padding: 32, minWidth: 0 }}>
        {section === "revenue"     && <SectionRevenue account={account} address={address} />}
        {section === "plans"       && <SectionPlans account={account} address={address} />}
        {section === "subscribers" && <SectionSubscribers address={address} />}
        {section === "withdrawals" && <SectionWithdrawals account={account} address={address} />}
      </main>
    </div>
  );
}
