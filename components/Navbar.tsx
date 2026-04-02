"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectWallet } from "./ConnectWallet";
import { useRef, useState, useEffect } from "react";

const links = [
  { href: "/",          label: "Home"      },
  { href: "/pricing",   label: "Pricing"   },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/merchant",  label: "Merchant"  },
  { href: "/demo",      label: "Demo"      },
];

export function Navbar() {
  const pathname = usePathname();

  const magRef = useRef<HTMLDivElement>(null);
  const [mag, setMag] = useState({ x: 0, y: 0 });
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    /* Outer wrapper — sticky, full width, transparent */
    <div
      style={{
        position: "sticky", top: 0, zIndex: 50, width: "100%",
        padding: "10px 16px",
        background: scrolled ? "rgba(2,2,10,0.5)" : "transparent",
        backdropFilter: scrolled ? "blur(8px)" : "none",
        transition: "background 0.4s",
      }}
    >
      {/* ── Floating pill card ── */}
      <nav
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          height: 56,
          borderRadius: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px 0 16px",
          background: "rgba(12,10,26,0.92)",
          border: "1px solid rgba(255,255,255,0.09)",
          boxShadow: "0 4px 32px rgba(0,0,0,0.45), 0 1px 0 rgba(255,255,255,0.04) inset",
          backdropFilter: "blur(32px) saturate(200%)",
          WebkitBackdropFilter: "blur(32px) saturate(200%)",
        }}
      >

        {/* ── Logo ── */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none", flexShrink: 0 }}>
          <div
            style={{
              width: 32, height: 32, borderRadius: 9,
              background: "linear-gradient(145deg,#7c3aed,#4338ca)",
              boxShadow: "0 2px 10px rgba(124,58,237,0.5)",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "transform 0.25s, box-shadow 0.25s",
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.transform = "scale(1.1) rotate(-5deg)";
              el.style.boxShadow = "0 0 20px rgba(139,92,246,0.75)";
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.transform = "";
              el.style.boxShadow = "0 2px 10px rgba(124,58,237,0.5)";
            }}
          >
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
              <path d="M11 4.5C10 3.5 9 3 7.5 3C5.5 3 4 4.2 4 5.7C4 7.2 5.5 8 8 8.5C10.5 9 12 9.8 12 11.3C12 12.8 10.5 14 8 14C6 14 4.5 13 4 12"
                stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          </div>
          <span style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 700, fontSize: 14.5,
            letterSpacing: "0.1em",
            color: "rgba(255,255,255,0.9)",
          }}>
            STARKPAYHUB
          </span>
        </Link>

        {/* ── Nav links ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
          {links.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                style={{
                  position: "relative",
                  padding: "6px 14px",
                  fontSize: 13.5,
                  fontWeight: active ? 600 : 400,
                  color: active ? "#fff" : "rgba(161,161,170,0.55)",
                  textDecoration: "none",
                  transition: "color 0.15s",
                  letterSpacing: "0.01em",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={e => {
                  if (!active)(e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.8)";
                }}
                onMouseLeave={e => {
                  if (!active)(e.currentTarget as HTMLElement).style.color = "rgba(161,161,170,0.55)";
                }}
              >
                {label}

                {/* Short centered underline — exact reference style */}
                <span style={{
                  position: "absolute",
                  bottom: -1,
                  left: "50%", transform: "translateX(-50%)",
                  width: active ? 22 : 0,
                  height: 2,
                  borderRadius: 2,
                  background: "linear-gradient(90deg,#8b5cf6,#6366f1)",
                  boxShadow: "0 0 8px rgba(139,92,246,1)",
                  transition: "width 0.25s cubic-bezier(.4,0,.2,1)",
                  display: "block",
                }} />
              </Link>
            );
          })}
        </div>

        {/* ── Magnetic CTA ── */}
        <div
          ref={magRef}
          onMouseMove={e => {
            const r = magRef.current?.getBoundingClientRect();
            if (!r) return;
            setMag({
              x: (e.clientX - r.left - r.width  / 2) * 0.28,
              y: (e.clientY - r.top  - r.height / 2) * 0.28,
            });
          }}
          onMouseLeave={() => setMag({ x: 0, y: 0 })}
          style={{
            transform: `translate(${mag.x}px,${mag.y}px)`,
            transition: "transform 0.4s cubic-bezier(.2,.8,.2,1)",
            flexShrink: 0,
          }}
        >
          <ConnectWallet />
        </div>

      </nav>
    </div>
  );
}
