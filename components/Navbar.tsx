"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectWallet } from "./ConnectWallet";
import { useAccount } from "@starknet-react/core";
import { useState, useEffect, useRef } from "react";
import { useMySubscriptions } from "@/hooks/useMySubscriptions";

// Desktop nav links (center) — tanpa Home karena logo sudah jadi Home
const links = [
  { href: "/",        label: "Home"    },
  { href: "/pricing", label: "Pricing" },
  { href: "/demo",    label: "How To Use"    },
];

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled]     = useState(false);
  const [menuOpen, setMenuOpen]     = useState(false);
  const [isMobile, setIsMobile]     = useState(false);
  const menuRef                      = useRef<HTMLDivElement>(null);
  const { status }                   = useAccount();
  const { subscriptions }            = useMySubscriptions();

  const isConnected  = status === "connected";
  const hasActiveSub = subscriptions.some(s => s.active && !s.isExpired);

  /* scroll shadow */
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  /* detect mobile */
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  /* close menu on outside click */
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  /* close menu on route change */
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  // Mobile burger: Home + semua links + Dashboard (kalau ada)
  const allMenuLinks = [
    { href: "/", label: "Home" },
    ...links.filter(l => l.href !== "/"),
    ...(hasActiveSub ? [{ href: "/dashboard", label: "Dashboard" }] : []),
  ];

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0,
      zIndex: 100, padding: "14px 16px", pointerEvents: "none",
    }}>
      <nav style={{
        maxWidth: 1080, margin: "0 auto", height: 58,
        borderRadius: 18,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 10px 0 14px",
        background: "rgba(10,6,28,0.88)",
        border: "1px solid rgba(139,92,246,0.15)",
        boxShadow: scrolled
          ? "0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(139,92,246,0.1)"
          : "0 4px 24px rgba(0,0,0,0.4)",
        backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
        transition: "box-shadow 0.3s", pointerEvents: "auto",
        position: "relative",
      }}>

        {/* ── Logo (desktop: kiri, mobile: kanan) ── */}
        {!isMobile && (
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", flexShrink: 0 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-sm.png" alt="StarkPayHub" width={38} height={38} style={{ display: "block", objectFit: "contain" }} />
            <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 15, letterSpacing: "0.04em", color: "rgba(255,255,255,0.92)" }}>
              StarkPayHub
            </span>
          </Link>
        )}

        {/* ── Desktop nav links (center) ── */}
        {!isMobile && (
          <div style={{ display: "flex", alignItems: "center", position: "absolute", left: "50%", transform: "translateX(-50%)" }}>
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
        )}

        {/* ── Right side ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>

          {/* Desktop: Dashboard + ConnectWallet */}
          {!isMobile && (
            <>
              {hasActiveSub && (
                <Link href="/dashboard"
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "7px 16px", borderRadius: 10, textDecoration: "none",
                    fontSize: 13, fontWeight: 600, fontFamily: "'Syne',sans-serif",
                    color: pathname === "/dashboard" ? "#c4b5fd" : "rgba(196,181,253,0.75)",
                    background: pathname === "/dashboard" ? "rgba(139,92,246,0.2)" : "rgba(139,92,246,0.08)",
                    border: "1px solid rgba(139,92,246,0.22)",
                    transition: "all 0.15s", whiteSpace: "nowrap",
                  }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = "rgba(139,92,246,0.2)"; el.style.color = "#c4b5fd"; el.style.borderColor = "rgba(139,92,246,0.4)"; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = pathname === "/dashboard" ? "rgba(139,92,246,0.2)" : "rgba(139,92,246,0.08)"; el.style.color = pathname === "/dashboard" ? "#c4b5fd" : "rgba(196,181,253,0.75)"; el.style.borderColor = "rgba(139,92,246,0.22)"; }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                    <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
                  </svg>
                  Dashboard
                </Link>
              )}
              <ConnectWallet />
            </>
          )}

          {/* Mobile: Hamburger + ConnectWallet (kiri), Logo (kanan) */}
          {isMobile && (
            <>
              {/* Hamburger */}
              <div ref={menuRef} style={{ position: "relative" }}>
                <button
                  onClick={() => setMenuOpen(o => !o)}
                  style={{
                    display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
                    gap: 4, width: 36, height: 36, borderRadius: 10, border: "1px solid rgba(139,92,246,0.2)",
                    background: menuOpen ? "rgba(139,92,246,0.12)" : "rgba(139,92,246,0.06)",
                    cursor: "pointer", padding: 0, transition: "background 0.15s",
                  }}
                  aria-label="Menu"
                >
                  {/* 3 lines → X when open */}
                  {menuOpen ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(196,181,253,0.9)" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(196,181,253,0.9)" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/>
                    </svg>
                  )}
                </button>

                {/* Dropdown */}
                {menuOpen && (
                  <div style={{
                    position: "absolute", top: "calc(100% + 8px)", left: 0,
                    minWidth: 180, borderRadius: 14,
                    background: "rgba(12,8,32,0.97)",
                    border: "1px solid rgba(139,92,246,0.2)",
                    boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
                    backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
                    overflow: "hidden",
                  }}>
                    {allMenuLinks.map(({ href, label }) => {
                      const active = pathname === href;
                      return (
                        <Link key={href} href={href}
                          style={{
                            display: "block", padding: "13px 18px",
                            fontFamily: "'Syne',sans-serif", fontSize: 14, fontWeight: active ? 600 : 400,
                            color: active ? "#c4b5fd" : "rgba(200,190,240,0.75)",
                            textDecoration: "none",
                            background: active ? "rgba(139,92,246,0.12)" : "transparent",
                            borderBottom: "1px solid rgba(139,92,246,0.08)",
                            transition: "background 0.12s, color 0.12s",
                          }}
                          onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = "rgba(139,92,246,0.12)"; el.style.color = "#fff"; }}
                          onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = active ? "rgba(139,92,246,0.12)" : "transparent"; el.style.color = active ? "#c4b5fd" : "rgba(200,190,240,0.75)"; }}
                        >
                          {label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
              <ConnectWallet />
            </>
          )}

        </div>

        {/* ── Logo mobile (kanan) ── */}
        {isMobile && (
          <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none", flexShrink: 0 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-sm.png" alt="StarkPayHub" width={36} height={36} style={{ display: "block", objectFit: "contain" }} />
          </Link>
        )}

      </nav>
    </div>
  );
}
