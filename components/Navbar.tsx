"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectWallet } from "./ConnectWallet";
import { useStarkzap } from "./StarkzapProvider";
import { useAccount } from "@starknet-react/core";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

const links = [
  { href: "/",        label: "Home"    },
  { href: "/pricing", label: "Pricing" },
  { href: "/demo",    label: "Demo"    },
];

/* ── Shared dropdown styles ──────────────────────────────────────────────── */
const dropdownStyle: React.CSSProperties = {
  position: "absolute",
  top: "calc(100% + 10px)",
  right: 0,
  minWidth: 220,
  borderRadius: 14,
  background: "rgba(10,7,26,0.96)",
  border: "1px solid rgba(255,255,255,0.1)",
  boxShadow: "0 16px 48px rgba(0,0,0,0.7), 0 0 0 1px rgba(139,92,246,0.08)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  overflow: "hidden",
  zIndex: 200,
  animation: "toast-in 0.18s cubic-bezier(.16,1,.3,1)",
};

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [privyOpen, setPrivyOpen] = useState(false);
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const privyRef = useRef<HTMLDivElement>(null);

  const { status } = useAccount();
  const { privyAuthenticated, privyEmail, privyLogout } = useStarkzap();

  /* scroll shadow */
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  /* close Privy dropdown on outside click or Escape */
  useEffect(() => {
    if (!privyOpen) return;
    const onMouse = (e: MouseEvent) => {
      if (privyRef.current && !privyRef.current.contains(e.target as Node))
        setPrivyOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setPrivyOpen(false); };
    document.addEventListener("mousedown", onMouse);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onMouse);
      document.removeEventListener("keydown", onKey);
    };
  }, [privyOpen]);

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0,
      zIndex: 100, padding: "14px 20px", pointerEvents: "none",
    }}>
      <nav style={{
        maxWidth: 1080, margin: "0 auto", height: 58,
        borderRadius: 18,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 10px 0 18px",
        background: "rgba(10,6,28,0.88)",
        border: "1px solid rgba(139,92,246,0.15)",
        boxShadow: scrolled
          ? "0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(139,92,246,0.1)"
          : "0 4px 24px rgba(0,0,0,0.4)",
        backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
        transition: "box-shadow 0.3s", pointerEvents: "auto",
      }}>

        {/* ── Logo ── */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", flexShrink: 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-sm.png" alt="StarkPayHub" width={44} height={44} style={{ display: "block", objectFit: "contain" }} />
          <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 15, letterSpacing: "0.04em", color: "rgba(255,255,255,0.92)" }}>
            StarkPayHub
          </span>
        </Link>

        {/* ── Nav links ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 0, position: "absolute", left: "50%", transform: "translateX(-50%)" }}>
          {links.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href}
                style={{
                  padding: "8px 16px", fontFamily: "'Syne',sans-serif", fontSize: 14.5, fontWeight: 400,
                  color: active ? "#fff" : "rgba(180,170,220,0.5)", textDecoration: "none",
                  borderRadius: 10, transition: "color 0.15s, background 0.15s", whiteSpace: "nowrap", background: "transparent",
                }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.color = "#fff"; el.style.background = "rgba(139,92,246,0.1)"; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.color = active ? "#fff" : "rgba(180,170,220,0.5)"; el.style.background = "transparent"; }}
              >
                {label}
              </Link>
            );
          })}
        </div>

        {/* ── Right CTA ── */}
        {privyAuthenticated && privyEmail && status !== "connected" ? (
          /* Privy email pill — click to open dropdown */
          <div ref={privyRef} style={{ position: "relative" }}>
            <button
              onClick={() => setPrivyOpen(o => !o)}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "8px 16px", borderRadius: 999,
                background: privyOpen ? "rgba(52,211,153,0.15)" : "rgba(52,211,153,0.08)",
                border: "1px solid rgba(52,211,153,0.22)",
                color: "#34d399", fontSize: 13, fontWeight: 500,
                cursor: "pointer", transition: "background 0.2s",
                fontFamily: "ui-monospace,'SF Mono',monospace",
                whiteSpace: "nowrap", maxWidth: 240,
              }}
              onMouseEnter={e => { if (!privyOpen) e.currentTarget.style.background = "rgba(52,211,153,0.14)"; }}
              onMouseLeave={e => { if (!privyOpen) e.currentTarget.style.background = "rgba(52,211,153,0.08)"; }}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0"
                style={{ boxShadow: "0 0 6px rgba(52,211,153,0.8)" }} />
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", maxWidth: 170 }}>
                {privyEmail}
              </span>
              {/* chevron instead of × */}
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ flexShrink: 0, transition: "transform 0.2s", transform: privyOpen ? "rotate(180deg)" : "rotate(0deg)", opacity: 0.5 }}>
                <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>

            {/* Dropdown */}
            {privyOpen && (
              <div style={dropdownStyle}>
                {/* Header */}
                <div style={{ padding: "14px 16px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <p style={{ fontSize: 11, color: "rgba(161,161,170,0.5)", fontFamily: "monospace", letterSpacing: "0.06em", marginBottom: 4 }}>SIGNED IN WITH GOOGLE</p>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", fontFamily: "ui-monospace,'SF Mono',monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {privyEmail}
                  </p>
                </div>
                {/* Actions */}
                <div style={{ padding: "6px" }}>
                  <button
                    onClick={() => { setPrivyOpen(false); setConfirmSignOut(true); }}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: 8,
                      padding: "9px 10px", borderRadius: 8, background: "none", border: "none",
                      color: "rgba(248,113,113,0.85)", fontSize: 13, cursor: "pointer",
                      fontFamily: "'Syne',sans-serif", transition: "background 0.15s", textAlign: "left",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "none"; }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                      <polyline points="16 17 21 12 16 7"/>
                      <line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <ConnectWallet />
        )}

      </nav>

      {/* Sign-out confirmation modal — rendered via SignOutModal portal */}
      {confirmSignOut && (
        <SignOutModal
          email={privyEmail}
          onCancel={() => setConfirmSignOut(false)}
          onConfirm={() => { privyLogout?.(); setConfirmSignOut(false); }}
        />
      )}
    </div>
  );
}

/* ── Sign-out confirmation modal — Apple alert style ────────────────────── */
export function SignOutModal({ email, onCancel, onConfirm }: { email: string | null; onCancel: () => void; onConfirm: () => void }) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onCancel(); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [onCancel]);

  return createPortal(
    <div
      onClick={e => { if (e.target === e.currentTarget) onCancel(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        display: "flex", alignItems: "center", justifyContent: "center", padding: "0 24px",
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        animation: "toast-in 0.22s cubic-bezier(.16,1,.3,1)",
      }}
    >
      <div style={{
        width: "100%", maxWidth: 320,
        borderRadius: 26,
        background: "linear-gradient(160deg, rgba(26,20,52,0.97) 0%, rgba(14,10,32,0.98) 100%)",
        boxShadow: "0 48px 100px rgba(0,0,0,0.75), inset 0 0.5px 0 rgba(255,255,255,0.18), 0 0 0 0.5px rgba(139,92,246,0.15)",
        overflow: "hidden",
      }}>

        {/* ── App icon + text ── */}
        <div style={{ padding: "40px 28px 28px", textAlign: "center" }}>

          {/* Logo — large, glowing, no box */}
          <div style={{ position: "relative", width: 96, height: 96, margin: "0 auto 26px" }}>
            {/* outer halo */}
            <div style={{
              position: "absolute", inset: -16,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(124,58,237,0.45) 0%, transparent 70%)",
              filter: "blur(18px)",
              animation: "dot-breathe 3s ease-in-out infinite",
            }} />
            {/* inner crisp glow ring */}
            <div style={{
              position: "absolute", inset: -2,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(167,139,250,0.18) 0%, transparent 65%)",
              filter: "blur(6px)",
            }} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-sm.png" alt="StarkPayHub" width={96} height={96}
              style={{ objectFit: "contain", position: "relative", zIndex: 1, filter: "drop-shadow(0 0 12px rgba(167,139,250,0.6))" }} />
          </div>

          <h3 style={{
            fontSize: 20, fontWeight: 700, color: "#fff",
            fontFamily: "'Syne', -apple-system, sans-serif",
            letterSpacing: "-0.025em", marginBottom: 10, lineHeight: 1.2,
          }}>
            Sign out of<br />StarkPayHub?
          </h3>

          {email && (
            <p style={{
              fontSize: 12.5, color: "rgba(167,139,250,0.55)",
              fontFamily: "ui-monospace,'SF Mono',monospace", marginBottom: 8,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {email}
            </p>
          )}

          <p style={{
            fontSize: 13.5, color: "rgba(235,235,245,0.4)",
            lineHeight: 1.6,
          }}>
            Your subscriptions stay active on-chain.
          </p>
        </div>

        {/* ── iOS-style hairline + buttons ── */}
        <div style={{ borderTop: "0.5px solid rgba(255,255,255,0.1)" }}>
          <div style={{ display: "flex" }}>
            <button
              onClick={onCancel}
              style={{
                flex: 1, height: 50, background: "none", border: "none",
                borderRight: "0.5px solid rgba(255,255,255,0.1)",
                color: "rgba(235,235,245,0.75)", fontSize: 17,
                fontFamily: "'Syne', -apple-system, sans-serif",
                fontWeight: 400, cursor: "pointer", transition: "background 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "none"; }}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              style={{
                flex: 1, height: 50, background: "none", border: "none",
                color: "#ff453a",   /* iOS system red */
                fontSize: 17,
                fontFamily: "'Syne', -apple-system, sans-serif",
                fontWeight: 600, cursor: "pointer", transition: "background 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,69,58,0.08)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "none"; }}
            >
              Sign out
            </button>
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
}
