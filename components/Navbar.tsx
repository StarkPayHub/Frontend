"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectWallet } from "./ConnectWallet";
import { useAccount } from "@starknet-react/core";
import { useState, useEffect } from "react";
import { useMySubscriptions } from "@/hooks/useMySubscriptions";


const links = [
  { href: "/",        label: "Home"    },
  { href: "/pricing", label: "Pricing" },
  { href: "/demo",    label: "Demo"    },
];


export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const { status } = useAccount();
  const { subscriptions } = useMySubscriptions();

  const isConnected = status === "connected";
  const hasActiveSub = subscriptions.some(s => s.active && !s.isExpired);

  /* scroll shadow */
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

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
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>

          {/* Dashboard button — hanya tampil kalau connected + punya active subscription */}
          {isConnected && hasActiveSub && (
            <Link href="/dashboard"
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "7px 16px", borderRadius: 10, textDecoration: "none",
                fontSize: 13, fontWeight: 600, fontFamily: "'Syne',sans-serif",
                color: pathname === "/dashboard" ? "#c4b5fd" : "rgba(196,181,253,0.75)",
                background: pathname === "/dashboard"
                  ? "rgba(139,92,246,0.2)"
                  : "rgba(139,92,246,0.08)",
                border: "1px solid rgba(139,92,246,0.22)",
                transition: "all 0.15s",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = "rgba(139,92,246,0.2)";
                el.style.color = "#c4b5fd";
                el.style.borderColor = "rgba(139,92,246,0.4)";
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = pathname === "/dashboard" ? "rgba(139,92,246,0.2)" : "rgba(139,92,246,0.08)";
                el.style.color = pathname === "/dashboard" ? "#c4b5fd" : "rgba(196,181,253,0.75)";
                el.style.borderColor = "rgba(139,92,246,0.22)";
              }}
            >
              {/* Grid icon */}
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
              </svg>
              Dashboard
            </Link>
          )}

          <ConnectWallet />
        </div>

      </nav>

    </div>
  );
}
