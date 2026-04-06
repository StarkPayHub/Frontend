"use client";

import { useState } from "react";
import { useAccount, useDisconnect } from "@starknet-react/core";
import { useStarkzap } from "@/components/StarkzapProvider";
import { ClaimUSDC } from "@/components/ClaimUSDC";
import { ConnectWallet } from "@/components/ConnectWallet";
import { KpiSkeleton, SubRowSkeleton } from "@/components/Skeleton";
import { Toast } from "@/components/Toast";
import { SignOutModal } from "@/components/Navbar";
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

// ── KPI Card with liquid orb ───────────────────────────────────────────────────
function KpiCard({ label, value, orb }: { label: string; value: string; orb: { color: string; accent: string } }) {
  return (
    <div style={{
      position: "relative",
      overflow: "hidden",
      borderRadius: 18,
      background: "rgba(12,9,28,0.85)",
      border: "0.5px solid rgba(255,255,255,0.1)",
      backdropFilter: "blur(24px)",
      WebkitBackdropFilter: "blur(24px)",
      padding: "24px 24px 20px",
      boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
    }}>
      {/* Liquid orb */}
      <div aria-hidden style={{
        position: "absolute",
        width: 140,
        height: 140,
        borderRadius: "50%",
        background: orb.color,
        filter: "blur(40px)",
        top: -40,
        right: -30,
        pointerEvents: "none",
      }} />
      {/* Bottom accent line */}
      <div aria-hidden style={{
        position: "absolute",
        bottom: 0,
        left: 24,
        right: 24,
        height: "1px",
        background: `linear-gradient(90deg, transparent, ${orb.accent}, transparent)`,
      }} />

      <p style={{
        fontSize: 11,
        fontFamily: "ui-monospace,'SF Mono',monospace",
        color: "rgba(161,161,170,0.5)",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        marginBottom: 12,
        position: "relative",
      }}>
        {label}
      </p>
      <p style={{
        fontSize: "2.5rem",
        fontWeight: 700,
        color: "#fff",
        lineHeight: 1,
        position: "relative",
      }}>
        {value}
      </p>
    </div>
  );
}

// ── Sidebar ────────────────────────────────────────────────────────────────────
function Sidebar({ address, section, setSection }: { address?: string; section: Section; setSection: (s: Section) => void }) {
  const { disconnect } = useDisconnect();
  const { privyAuthenticated, privyLogout } = useStarkzap();
  const router = useRouter();
  const [confirmSignOut, setConfirmSignOut] = useState(false);

  const navItems: { label: string; key: Section; icon: React.ReactNode }[] = [
    { label: "My Subscriptions", key: "subscriptions", icon: IcoCard     },
    { label: "Payment History",  key: "history",       icon: IcoHistory  },
    { label: "Settings",         key: "settings",      icon: IcoSettings },
  ];

  return (
    <aside style={{
      width: 240,
      minHeight: "100vh",
      borderRight: "0.5px solid rgba(255,255,255,0.07)",
      background: "rgba(6,4,18,0.9)",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      padding: "20px 12px",
      display: "flex",
      flexDirection: "column",
      gap: 2,
      position: "sticky",
      top: 0,
      flexShrink: 0,
    }} className="hidden md:flex">
      {/* Logo */}
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 12px 20px", marginBottom: 4, borderBottom: "0.5px solid rgba(255,255,255,0.07)", textDecoration: "none" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-sm.png" alt="StarkPayHub" width={30} height={30} style={{ objectFit: "contain" }} />
        <span style={{ fontWeight: 700, fontSize: 14, color: "rgba(255,255,255,0.9)" }}>
          StarkPayHub
        </span>
      </Link>

      <p style={{ padding: "12px 14px 6px", fontSize: 10, fontFamily: "ui-monospace,'SF Mono',monospace", color: "rgba(113,113,122,0.5)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
        User
      </p>

      {navItems.map((item) => {
        const active = section === item.key;
        return (
          <button key={item.key} onClick={() => setSection(item.key)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 14px",
              borderRadius: 10,
              background: active ? "rgba(124,58,237,0.12)" : "transparent",
              border: "none",
              borderLeft: active ? "2px solid rgba(139,92,246,0.7)" : "2px solid transparent",
              color: active ? "#fff" : "rgba(113,113,122,0.8)",
              fontSize: 13.5,
              
              fontWeight: active ? 600 : 400,
              cursor: "pointer",
              transition: "all 0.15s",
              textAlign: "left",
            }}
            onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; } }}
            onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(113,113,122,0.8)"; } }}
          >
            <span style={{ color: active ? "rgba(167,139,250,0.9)" : "rgba(113,113,122,0.6)", flexShrink: 0 }}>{item.icon}</span>
            {item.label}
          </button>
        );
      })}

      <p style={{ padding: "16px 14px 6px", fontSize: 10, fontFamily: "ui-monospace,'SF Mono',monospace", color: "rgba(113,113,122,0.5)", letterSpacing: "0.12em", textTransform: "uppercase", borderTop: "0.5px solid rgba(255,255,255,0.07)", marginTop: 8 }}>
        Merchant
      </p>
      <Link href="/merchant"
        style={{
          display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
          borderRadius: 10, textDecoration: "none", color: "rgba(113,113,122,0.8)", fontSize: 13.5,
          borderLeft: "2px solid transparent", transition: "all 0.15s",
        }}
        onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = "rgba(255,255,255,0.04)"; el.style.color = "rgba(255,255,255,0.7)"; }}
        onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = "transparent"; el.style.color = "rgba(113,113,122,0.8)"; }}
      >
        <span style={{ color: "rgba(113,113,122,0.6)", flexShrink: 0 }}>{IcoMerchant}</span>
        Revenue Dashboard
      </Link>

      {/* User identity */}
      {address && (
        <div style={{ marginTop: "auto", paddingTop: 16, borderTop: "0.5px solid rgba(255,255,255,0.07)" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8, padding: "10px 14px",
            borderRadius: 10, background: "rgba(255,255,255,0.03)",
            border: "0.5px solid rgba(255,255,255,0.08)",
          }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#34d399", flexShrink: 0, boxShadow: "0 0 6px rgba(52,211,153,0.8)", display: "block" }} />
            {address.startsWith("0x") ? (
              <span style={{ fontFamily: "ui-monospace,'SF Mono',monospace", fontSize: 11.5, color: "rgba(161,161,170,0.7)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {address.slice(0, 8)}…{address.slice(-4)}
              </span>
            ) : (
              <span style={{ fontSize: 11.5, color: "rgba(161,161,170,0.7)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {address}
              </span>
            )}
          </div>
          <button onClick={() => setConfirmSignOut(true)}
            style={{
              width: "100%", display: "flex", alignItems: "center", gap: 8,
              padding: "9px 14px", borderRadius: 10, background: "none", border: "none",
              color: "rgba(113,113,122,0.5)", fontSize: 12, cursor: "pointer",
              transition: "color 0.15s", textAlign: "left",
              marginTop: 2,
            }}
            onMouseEnter={e => { e.currentTarget.style.color = "#f87171"; e.currentTarget.style.background = "rgba(239,68,68,0.05)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "rgba(113,113,122,0.5)"; e.currentTarget.style.background = "none"; }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            {privyAuthenticated ? "Sign out" : "Disconnect"}
          </button>
        </div>
      )}
      {confirmSignOut && (
        <SignOutModal
          email={privyAuthenticated ? (address ?? null) : null}
          onCancel={() => setConfirmSignOut(false)}
          onConfirm={() => {
            if (privyAuthenticated) { privyLogout?.(); }
            else { disconnect(); }
            setConfirmSignOut(false);
            router.push("/");
          }}
        />
      )}
    </aside>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState({ icon, title, desc, action }: { icon: React.ReactNode; title: string; desc: string; action?: React.ReactNode }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "72px 24px", gap: 16, borderRadius: 18,
      background: "rgba(12,9,28,0.5)",
      border: "0.5px solid rgba(255,255,255,0.07)",
    }}>
      <div style={{
        width: 52, height: 52, borderRadius: 14,
        background: "rgba(124,58,237,0.1)", border: "0.5px solid rgba(139,92,246,0.25)",
        display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(167,139,250,0.7)",
      }}>
        {icon}
      </div>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.7)", marginBottom: 4 }}>{title}</p>
        <p style={{ fontSize: 12.5, color: "rgba(113,113,122,0.6)" }}>{desc}</p>
      </div>
      {action}
    </div>
  );
}

// ── Section: My Subscriptions ─────────────────────────────────────────────────
function SectionSubscriptions() {
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  function handleCancel(planName: string) {
    setToast({ message: `Cancellation requested for ${planName}`, type: "success" });
  }

  return (
    <div className="space-y-7 section-fade">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#fff", lineHeight: 1.1 }}>
            My Subscriptions
          </h1>
          <p style={{ fontSize: 13.5, color: "rgba(113,113,122,0.7)", marginTop: 6 }}>Manage your active plans and billing</p>
        </div>
        <ClaimUSDC />
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        <KpiCard label="Active Plans"        value="2"        orb={{ color: "radial-gradient(circle, rgba(139,92,246,0.5) 0%, transparent 70%)",  accent: "rgba(139,92,246,0.35)" }} />
        <KpiCard label="Next Renewal"        value="12 days"  orb={{ color: "radial-gradient(circle, rgba(59,130,246,0.45) 0%, transparent 70%)", accent: "rgba(59,130,246,0.3)"  }} />
        <KpiCard label="Total Spent (USDC)"  value="$126"     orb={{ color: "radial-gradient(circle, rgba(16,185,129,0.4) 0%, transparent 70%)",  accent: "rgba(16,185,129,0.3)"  }} />
      </div>

      {/* Subscriptions list */}
      {mockSubs.length === 0 ? (
        <EmptyState
          icon={IcoCard}
          title="No active subscriptions"
          desc="Subscribe to a plan to get started"
          action={<Link href="/pricing" style={{ fontSize: 12, fontFamily: "ui-monospace,'SF Mono',monospace", color: "rgba(139,92,246,0.7)", textDecoration: "none" }}>Browse plans →</Link>}
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {mockSubs.map((sub) => {
            const isActive = sub.variant === "emerald";
            const accentColor = isActive ? "rgba(52,211,153,1)" : "rgba(251,191,36,0.9)";
            const accentBg = isActive ? "rgba(52,211,153,0.08)" : "rgba(245,158,11,0.08)";
            const accentBorder = isActive ? "rgba(52,211,153,0.2)" : "rgba(245,158,11,0.2)";
            const iconBg = isActive ? "rgba(109,40,217,0.15)" : "rgba(217,119,6,0.15)";
            const iconBorder = isActive ? "rgba(139,92,246,0.3)" : "rgba(245,158,11,0.3)";
            const iconColor = isActive ? "rgba(167,139,250,1)" : "rgba(251,191,36,0.9)";

            return (
              <div key={sub.planId}
                style={{
                  display: "flex", alignItems: "center", gap: 16, padding: "18px 20px",
                  borderRadius: 16,
                  background: "rgba(12,9,28,0.7)",
                  border: `0.5px solid ${isActive ? "rgba(52,211,153,0.15)" : "rgba(245,158,11,0.15)"}`,
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  transition: "background 0.2s",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(20,14,42,0.85)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(12,9,28,0.7)"; }}
              >
                {/* Icon */}
                <div style={{
                  width: 44, height: 44, borderRadius: 13, flexShrink: 0,
                  background: iconBg, border: `1px solid ${iconBorder}`, color: iconColor,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {isActive ? IcoBolt : IcoSparkles}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontSize: 14.5, color: "#fff" }}>{sub.name}</p>
                  <p style={{ fontSize: 12, color: "rgba(113,113,122,0.7)", marginTop: 3 }}>Renews {sub.renewsAt} · {sub.price}</p>
                </div>

                {/* Status dot */}
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: accentColor, boxShadow: `0 0 6px ${accentColor}`, display: "block" }} />
                  <span style={{ fontSize: 12, fontFamily: "ui-monospace,'SF Mono',monospace", color: accentColor }}>
                    {isActive ? "Active" : "Renewing"}
                  </span>
                </div>

                {/* Cancel */}
                <button onClick={() => handleCancel(sub.name)}
                  style={{
                    padding: "7px 14px", borderRadius: 9, flexShrink: 0, cursor: "pointer",
                    background: "transparent", border: "0.5px solid rgba(255,255,255,0.1)",
                    color: "rgba(113,113,122,0.6)", fontSize: 12,
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = "#f87171"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.35)"; e.currentTarget.style.background = "rgba(239,68,68,0.06)"; }}
                  onMouseLeave={e => { e.currentTarget.style.color = "rgba(113,113,122,0.6)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.background = "transparent"; }}
                >
                  Cancel
                </button>
              </div>
            );
          })}
        </div>
      )}
      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
    </div>
  );
}

// ── Section: Payment History ──────────────────────────────────────────────────
function SectionHistory() {
  return (
    <div className="space-y-7 section-fade">
      <div>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#fff", lineHeight: 1.1 }}>
          Payment History
        </h1>
        <p style={{ fontSize: 13.5, color: "rgba(113,113,122,0.7)", marginTop: 6 }}>All auto-renewal transactions on Starknet</p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        <KpiCard label="Total Payments"  value="6"        orb={{ color: "radial-gradient(circle, rgba(139,92,246,0.5) 0%, transparent 70%)",  accent: "rgba(139,92,246,0.35)" }} />
        <KpiCard label="Total Spent"     value="$174"     orb={{ color: "radial-gradient(circle, rgba(59,130,246,0.45) 0%, transparent 70%)", accent: "rgba(59,130,246,0.3)"  }} />
        <KpiCard label="Success Rate"    value="83%"      orb={{ color: "radial-gradient(circle, rgba(16,185,129,0.4) 0%, transparent 70%)",  accent: "rgba(16,185,129,0.3)"  }} />
      </div>

      {/* Transaction table */}
      <div style={{
        borderRadius: 18,
        background: "rgba(12,9,28,0.8)",
        border: "0.5px solid rgba(255,255,255,0.09)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        overflow: "hidden",
      }}>
        <div style={{ padding: "18px 24px", borderBottom: "0.5px solid rgba(255,255,255,0.07)" }}>
          <h2 style={{ fontWeight: 600, fontSize: 15, color: "#fff" }}>Transactions</h2>
        </div>

        {mockHistory.length === 0 ? (
          <div style={{ padding: "0 24px 24px" }}>
            <EmptyState icon={IcoHistory} title="No transactions yet" desc="Your payment history will appear here after your first renewal" />
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "0.5px solid rgba(255,255,255,0.06)" }}>
                {["Date", "Plan", "Amount", "Status", "Tx Hash"].map((h) => (
                  <th key={h} style={{ padding: "10px 24px", textAlign: "left", fontSize: 10.5, color: "rgba(113,113,122,0.5)", fontFamily: "ui-monospace,'SF Mono',monospace", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockHistory.map((row, i) => (
                <tr key={row.id}
                  style={{ borderBottom: i < mockHistory.length - 1 ? "0.5px solid rgba(255,255,255,0.05)" : "none", transition: "background 0.15s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  <td style={{ padding: "16px 24px", fontSize: 12, color: "rgba(113,113,122,0.7)", fontFamily: "ui-monospace,'SF Mono',monospace" }}>{row.date}</td>
                  <td style={{ padding: "16px 24px", fontSize: 13.5, color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>{row.plan}</td>
                  <td style={{ padding: "16px 24px", fontSize: 13, color: "rgba(255,255,255,0.75)", fontFamily: "ui-monospace,'SF Mono',monospace" }}>{row.amount}</td>
                  <td style={{ padding: "16px 24px" }}>
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 5,
                      padding: "4px 10px", borderRadius: 999, fontSize: 11.5,
                      fontFamily: "ui-monospace,'SF Mono',monospace",
                      background: row.status === "Success" ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)",
                      border: `0.5px solid ${row.status === "Success" ? "rgba(52,211,153,0.3)" : "rgba(239,68,68,0.3)"}`,
                      color: row.status === "Success" ? "#34d399" : "#f87171",
                    }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: "currentColor", display: "block", flexShrink: 0 }} />
                      {row.status}
                    </span>
                  </td>
                  <td style={{ padding: "16px 24px" }}>
                    <a href={`https://sepolia.voyager.online/tx/${row.tx}`} target="_blank" rel="noopener noreferrer"
                      style={{ fontFamily: "ui-monospace,'SF Mono',monospace", fontSize: 12, color: "rgba(139,92,246,0.7)", textDecoration: "none", transition: "color 0.15s" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#c4b5fd"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(139,92,246,0.7)"; }}
                    >
                      {row.tx} ↗
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

// ── Toggle ─────────────────────────────────────────────────────────────────────
function Toggle({ on }: { on: boolean }) {
  return (
    <div style={{
      width: 44, height: 26, borderRadius: 999,
      background: on ? "#7c3aed" : "rgba(255,255,255,0.1)",
      display: "flex", alignItems: "center",
      padding: "0 3px",
      transition: "background 0.2s",
      cursor: "default",
      flexShrink: 0,
      boxShadow: on ? "0 0 12px rgba(124,58,237,0.4)" : "none",
    }}>
      <span style={{
        width: 20, height: 20, borderRadius: "50%",
        background: "#fff",
        display: "block",
        marginLeft: on ? "auto" : 0,
        transition: "margin 0.2s",
        boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
      }} />
    </div>
  );
}

// ── Settings row ───────────────────────────────────────────────────────────────
function SettingsRow({ label, desc, right }: { label: string; desc: string; right: React.ReactNode }) {
  return (
    <div style={{ padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
      <div>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>{label}</p>
        <p style={{ fontSize: 12, color: "rgba(113,113,122,0.6)", marginTop: 3 }}>{desc}</p>
      </div>
      {right}
    </div>
  );
}

// ── Section: Settings ─────────────────────────────────────────────────────────
function SectionSettings({ address }: { address?: string }) {
  const { disconnect } = useDisconnect();
  const router = useRouter();

  const glassCard: React.CSSProperties = {
    borderRadius: 18,
    background: "rgba(12,9,28,0.8)",
    border: "0.5px solid rgba(255,255,255,0.09)",
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
    overflow: "hidden",
  };

  const divider: React.CSSProperties = {
    height: "0.5px",
    background: "rgba(255,255,255,0.07)",
  };

  return (
    <div className="section-fade" style={{ maxWidth: 560, display: "flex", flexDirection: "column", gap: 28 }}>
      <div>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#fff", lineHeight: 1.1 }}>
          Settings
        </h1>
        <p style={{ fontSize: 13.5, color: "rgba(113,113,122,0.7)", marginTop: 6 }}>Manage your account preferences</p>
      </div>

      {/* Account card */}
      <div style={glassCard}>
        <div style={{ padding: "12px 24px 10px" }}>
          <p style={{ fontSize: 10.5, fontFamily: "ui-monospace,'SF Mono',monospace", color: "rgba(113,113,122,0.5)", letterSpacing: "0.12em", textTransform: "uppercase" }}>Account</p>
        </div>
        <div style={divider} />

        <div style={{ padding: "18px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#34d399", flexShrink: 0, boxShadow: "0 0 8px rgba(52,211,153,0.8)", display: "block" }} />
            <span style={{ fontFamily: "ui-monospace,'SF Mono',monospace", fontSize: 13, color: "rgba(220,220,240,0.85)", wordBreak: "break-all" }}>{address}</span>
          </div>
        </div>
        <div style={divider} />

        <SettingsRow
          label="Network"
          desc="Starknet Sepolia Testnet"
          right={
            <span style={{ padding: "4px 12px", borderRadius: 999, fontSize: 11.5, fontFamily: "ui-monospace,'SF Mono',monospace", background: "rgba(124,58,237,0.1)", border: "0.5px solid rgba(139,92,246,0.3)", color: "rgba(196,181,253,0.85)" }}>
              Testnet
            </span>
          }
        />
        <div style={divider} />
        <SettingsRow label="Auto-renewal" desc="Subscriptions renew automatically each period" right={<Toggle on={true} />} />
      </div>

      {/* Notifications card */}
      <div style={glassCard}>
        <div style={{ padding: "12px 24px 10px" }}>
          <p style={{ fontSize: 10.5, fontFamily: "ui-monospace,'SF Mono',monospace", color: "rgba(113,113,122,0.5)", letterSpacing: "0.12em", textTransform: "uppercase" }}>Notifications</p>
        </div>
        {[
          { label: "Renewal reminders", desc: "3 days before each renewal", on: true  },
          { label: "Payment failures",  desc: "Alert when a renewal fails",  on: true  },
          { label: "New features",      desc: "Protocol updates and news",   on: false },
        ].map((item, i, arr) => (
          <div key={item.label}>
            <div style={divider} />
            <SettingsRow label={item.label} desc={item.desc} right={<Toggle on={item.on} />} />
          </div>
        ))}
      </div>

      {/* Danger zone */}
      <div style={{
        borderRadius: 18, padding: "20px 24px",
        background: "rgba(239,68,68,0.04)",
        border: "0.5px solid rgba(239,68,68,0.18)",
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
      }}>
        <div>
          <p style={{ fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.85)" }}>Disconnect wallet</p>
          <p style={{ fontSize: 12, color: "rgba(113,113,122,0.6)", marginTop: 3 }}>You will be signed out and returned to the home page.</p>
        </div>
        <button onClick={() => { disconnect(); router.push("/"); }}
          style={{
            padding: "8px 18px", borderRadius: 10, flexShrink: 0, cursor: "pointer",
            background: "transparent", border: "0.5px solid rgba(239,68,68,0.35)",
            color: "#f87171", fontSize: 13,
            fontWeight: 500, transition: "all 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
        >
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
          <h2 style={{ fontWeight: 700, fontSize: "1.35rem", color: "#fff" }}>Connect your wallet</h2>
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
  const { privyAuthenticated, privyEmail } = useStarkzap();
  const [section, setSection] = useState<Section>("subscriptions");

  const isAuth = status === "connected" || privyAuthenticated;
  const displayId = address ?? privyEmail ?? undefined;

  if (status === "reconnecting") return <DashboardSkeleton />;
  if (!isAuth) return <NotConnected />;

  return (
    <div className="min-h-screen flex" style={BG}>
      <Sidebar address={displayId} section={section} setSection={setSection} />
      <main style={{ flex: 1, padding: "40px 40px", minWidth: 0 }}>
        {section === "subscriptions" && <SectionSubscriptions />}
        {section === "history"       && <SectionHistory />}
        {section === "settings"      && <SectionSettings address={displayId} />}
      </main>
    </div>
  );
}
