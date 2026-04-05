"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectWallet } from "./ConnectWallet";
import { useState, useEffect } from "react";

const links = [
  { href: "/",          label: "Home"      },
  { href: "/pricing",   label: "Pricing"   },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/merchant",  label: "Merchant"  },
  { href: "/demo",      label: "Demo"      },
];

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    /*
     * Outer wrapper — fixed, full width, padded on all sides
     * so the pill "floats" above the page with visible margin.
     * pointer-events: none lets clicks pass through the empty margin area.
     */
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      padding: "14px 20px",
      pointerEvents: "none",
    }}>
      {/* ── Floating pill — matches Superfluid's centered card ── */}
      <nav style={{
        maxWidth: 1080,
        margin: "0 auto",
        height: 58,
        borderRadius: 18,            /* Superfluid uses ~18-20px, not a full pill */
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 10px 0 18px",
        background: "rgba(10,6,28,0.88)",
        border: "1px solid rgba(139,92,246,0.15)",
        boxShadow: scrolled
          ? "0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(139,92,246,0.1)"
          : "0 4px 24px rgba(0,0,0,0.4)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        transition: "box-shadow 0.3s",
        pointerEvents: "auto",       /* re-enable on the pill */
      }}>

        {/* ── Logo — square icon + name ── */}
        <Link href="/" style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          textDecoration: "none",
          flexShrink: 0,
        }}>
          {/* Square logo mark — like Superfluid's [+] icon */}
          <div style={{
            width: 34,
            height: 34,
            borderRadius: 9,
            background: "linear-gradient(135deg, #7c3aed 0%, #4338ca 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            boxShadow: "0 2px 8px rgba(124,58,237,0.35)",
          }}>
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
              <path
                d="M11 4.5C10 3.5 9 3 7.5 3C5.5 3 4 4.2 4 5.7C4 7.2 5.5 8 8 8.5C10.5 9 12 9.8 12 11.3C12 12.8 10.5 14 8 14C6 14 4.5 13 4 12"
                stroke="white"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <span style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 700,
            fontSize: 15,
            letterSpacing: "0.04em",
            color: "rgba(255,255,255,0.92)",
          }}>
            StarkPayHub
          </span>
        </Link>

        {/* ── Nav links — flat centered, Superfluid style ── */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 0,
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
        }}>
          {links.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                style={{
                  padding: "8px 16px",
                  fontFamily: "'Syne', sans-serif",
                  fontSize: 14.5,
                  fontWeight: 400,
                  color: active ? "#fff" : "rgba(180,170,220,0.5)",
                  textDecoration: "none",
                  borderRadius: 10,
                  transition: "color 0.15s, background 0.15s",
                  whiteSpace: "nowrap",
                  background: "transparent",
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.color = "#fff";
                  el.style.background = "rgba(139,92,246,0.1)";
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.color = active ? "#fff" : "rgba(180,170,220,0.5)";
                  el.style.background = "transparent";
                }}
              >
                {label}
              </Link>
            );
          })}
        </div>

        {/* ── CTA — dark oval filled button (Superfluid "Contact" style) ── */}
        <ConnectWallet />

      </nav>
    </div>
  );
}
