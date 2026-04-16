"use client";

import { useAccount, useConnect, useDisconnect, useBalance } from "@starknet-react/core";

const STRK_ADDRESS = "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d";
const USDC_ADDRESS = "0x021ab8a417e9cb94bf02ff0595bca7506d1237ffed6b5f80ad39460368955891";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

/* ── Compact USDC formatter (6 decimals, handles huge test balances) ── */
function fmtUsdc(raw: bigint): string {
  const usdc = raw / 1_000_000n;
  if (usdc >= 1_000_000_000_000n) return `${(usdc / 1_000_000_000_000n).toString()}T`;
  if (usdc >= 1_000_000_000n)     return `${(usdc / 1_000_000_000n).toString()}B`;
  if (usdc >= 1_000_000n)         return `${(usdc / 1_000_000n).toString()}M`;
  if (usdc >= 1_000n)             return `${(usdc / 1_000n).toString()}K`;
  const cents = (raw % 1_000_000n) / 10_000n;
  return `${usdc}.${String(cents).padStart(2, "0")}`;
}

/* ── Wallet display name ── */
function walletName(id: string): string {
  const key = id.toLowerCase().replace(/[\s_-]/g, "");
  if (key.includes("argentwebwallet") || key.includes("webwallet")) return "Argent Web Wallet";
  if (key.includes("argentx") || key.includes("argent")) return "Argent X";
  if (key.includes("braavos")) return "Braavos";
  return id;
}

function walletSubtitle(id: string): string {
  const key = id.toLowerCase().replace(/[\s_-]/g, "");
  if (key.includes("argentwebwallet") || key.includes("webwallet")) return "Login with email or Google — no extension needed";
  return "Starknet browser wallet";
}

/* ── Wallet icon — uses real connector.icon, falls back to initials ── */
function WalletAvatar({
  icon, id, size = 44,
}: { icon?: string; id: string; size?: number }) {
  const key = id.toLowerCase().replace(/[\s_-]/g, "");
  const bg = key.includes("webwallet") ? "linear-gradient(145deg,#f97316,#ea580c)"
           : key.includes("argent") ? "linear-gradient(145deg,#f97316,#ea580c)"
           : key.includes("braavos") ? "linear-gradient(145deg,#3b82f6,#1d4ed8)"
           : "linear-gradient(145deg,#7c3aed,#4338ca)";

  // Web wallet — show a globe icon (no reliable image URL)
  if (key.includes("webwallet")) {
    return (
      <div
        className="flex-shrink-0 flex items-center justify-center rounded-2xl text-white"
        style={{ width: size, height: size, background: bg,
                 boxShadow: "0 4px 16px rgba(0,0,0,0.4)" }}
      >
        <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="2" y1="12" x2="22" y2="12"/>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
      </div>
    );
  }

  if (icon) {
    return (
      <img
        src={icon}
        alt={walletName(id)}
        width={size}
        height={size}
        onError={(e) => { e.currentTarget.style.display = "none"; }}
        style={{ borderRadius: 14, flexShrink: 0, objectFit: "contain",
                 boxShadow: "0 4px 16px rgba(0,0,0,0.35)" }}
      />
    );
  }
  // fallback initials
  return (
    <div
      className="flex-shrink-0 flex items-center justify-center rounded-2xl font-bold text-white"
      style={{ width: size, height: size, background: bg, fontSize: size * 0.35,
               boxShadow: "0 4px 16px rgba(0,0,0,0.4)" }}
    >
      {id.slice(0, 2).toUpperCase()}
    </div>
  );
}

/* ══════════════════════════════════════════════════════ */
export function ConnectWallet() {
  const { address, status } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: strkBalance } = useBalance({ address, token: STRK_ADDRESS as `0x${string}`, watch: true });
  const { data: usdcBalance } = useBalance({ address, token: USDC_ADDRESS as `0x${string}`, watch: true });
  const [open, setOpen] = useState(false);
  const [walletMenu, setWalletMenu] = useState(false);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [claimingUsdc, setClaimingUsdc] = useState(false);
  const [usdcClaimed, setUsdcClaimed] = useState(false);

  const handleCopy = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClaimUsdc = async () => {
    if (!address || claimingUsdc) return;
    setClaimingUsdc(true);
    try {
      const res = await fetch("/api/faucet-usdc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });
      if (res.ok) {
        setUsdcClaimed(true);
        setTimeout(() => setUsdcClaimed(false), 4000);
      }
    } catch {
      // silently ignore
    } finally {
      setClaimingUsdc(false);
    }
  };
  const [argentHref, setArgentHref] = useState("https://www.argent.xyz/argent-x");

  useEffect(() => {
    const ua = navigator.userAgent;
    if (/android/i.test(ua))
      setArgentHref("https://play.google.com/store/apps/details?id=im.argent.contractwalletclient");
    else if (/iphone|ipad|ipod/i.test(ua))
      setArgentHref("https://apps.apple.com/app/argent-x/id6468873239");
    else
      setArgentHref("https://chromewebstore.google.com/detail/ready-x/dlcobpjiigpikoobohmabehhmhfoodbb");
  }, []);
  const overlayRef = useRef<HTMLDivElement>(null);
  const walletMenuRef = useRef<HTMLDivElement>(null);

  /* close on overlay click */
  const handleOverlay = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) setOpen(false);
  };

  /* close connect modal on Escape */
  useEffect(() => {
    if (!open) return;
    const fn = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [open]);

  /* close wallet dropdown on outside click or Escape */
  useEffect(() => {
    if (!walletMenu) return;
    const onMouse = (e: MouseEvent) => {
      if (walletMenuRef.current && !walletMenuRef.current.contains(e.target as Node))
        setWalletMenu(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setWalletMenu(false); };
    document.addEventListener("mousedown", onMouse);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onMouse);
      document.removeEventListener("keydown", onKey);
    };
  }, [walletMenu]);

  const handleConnect = async (connector: typeof connectors[0]) => {
    setConnecting(connector.id);
    try { connect({ connector }); }
    finally { setConnecting(null); setOpen(false); }
  };

  /* ── Connected — dropdown menu ── */
  if (status === "connected" && address) {
    return (
      <div ref={walletMenuRef} style={{ position: "relative" }}>
        <button
          onClick={() => setWalletMenu(o => !o)}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "8px 16px", borderRadius: 999,
            background: walletMenu ? "rgba(139,92,246,0.2)" : "rgba(139,92,246,0.12)",
            border: "1px solid rgba(139,92,246,0.28)",
            color: "rgba(196,181,253,0.9)", fontSize: 13, fontWeight: 500,
            cursor: "pointer", transition: "background 0.2s",
          }}
          onMouseEnter={e => { if (!walletMenu) e.currentTarget.style.background = "rgba(139,92,246,0.2)"; }}
          onMouseLeave={e => { if (!walletMenu) e.currentTarget.style.background = "rgba(139,92,246,0.12)"; }}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0"
            style={{ boxShadow: "0 0 8px rgba(52,211,153,0.8)" }} />
          <span className="font-mono">{address.slice(0,6)}…{address.slice(-4)}</span>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
            style={{ flexShrink: 0, transition: "transform 0.2s", transform: walletMenu ? "rotate(180deg)" : "rotate(0deg)", opacity: 0.45 }}>
            <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>

        {walletMenu && (
          <div style={{
            position: "absolute", top: "calc(100% + 10px)", right: 0, minWidth: 220,
            borderRadius: 14,
            background: "rgba(10,7,26,0.96)",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 16px 48px rgba(0,0,0,0.7), 0 0 0 1px rgba(139,92,246,0.08)",
            backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
            overflow: "hidden", zIndex: 200,
            animation: "toast-in 0.18s cubic-bezier(.16,1,.3,1)",
          }}>
            {/* Wallet info */}
            <div style={{ padding: "14px 16px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <p style={{ fontSize: 11, color: "rgba(161,161,170,0.5)", fontFamily: "monospace", letterSpacing: "0.06em", marginBottom: 4 }}>
                CONNECTED WALLET
              </p>
              <p style={{ fontSize: 13, color: "rgba(196,181,253,0.85)", fontFamily: "ui-monospace,'SF Mono',monospace", marginBottom: 8 }}>
                {address.slice(0,10)}…{address.slice(-6)}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
                  <span style={{ fontSize: 18, fontWeight: 700, color: "#fff", letterSpacing: "-0.02em" }}>
                    {strkBalance ? Number(strkBalance.formatted).toFixed(4) : "—"}
                  </span>
                  <span style={{ fontSize: 12, color: "rgba(161,161,170,0.6)", fontWeight: 500 }}>STRK</span>
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: "rgba(52,211,153,0.9)", letterSpacing: "-0.01em" }}>
                    {usdcBalance?.value !== undefined ? fmtUsdc(usdcBalance.value) : "—"}
                  </span>
                  <span style={{ fontSize: 12, color: "rgba(161,161,170,0.6)", fontWeight: 500 }}>USDC</span>
                </div>
              </div>
            </div>
            {/* Actions */}
            <div style={{ padding: "6px" }}>
              {/* Copy address */}
              <button
                onClick={handleCopy}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 8,
                  padding: "9px 10px", borderRadius: 8, background: "none", border: "none",
                  color: copied ? "rgba(52,211,153,0.9)" : "rgba(196,181,253,0.8)", fontSize: 13, cursor: "pointer",
                  fontFamily: "'Syne',sans-serif", transition: "background 0.15s, color 0.15s", textAlign: "left",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(139,92,246,0.08)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "none"; }}
              >
                {copied ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                )}
                {copied ? "Copied!" : "Copy address"}
              </button>

              {/* Claim Faucet */}
              <a
                href={`https://faucet.starknet.io/${address}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 8,
                  padding: "9px 10px", borderRadius: 8, background: "none",
                  color: "rgba(251,191,36,0.85)", fontSize: 13, cursor: "pointer",
                  fontFamily: "'Syne',sans-serif", transition: "background 0.15s", textDecoration: "none",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(251,191,36,0.08)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "none"; }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
                Claim faucet ETH
              </a>

              {/* Claim USDC */}
              <button
                onClick={handleClaimUsdc}
                disabled={claimingUsdc}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 8,
                  padding: "9px 10px", borderRadius: 8, background: "none", border: "none",
                  color: usdcClaimed ? "rgba(74,222,128,0.9)" : "rgba(52,211,153,0.85)",
                  fontSize: 13, cursor: claimingUsdc ? "not-allowed" : "pointer",
                  fontFamily: "'Syne',sans-serif", transition: "background 0.15s", textAlign: "left",
                  opacity: claimingUsdc ? 0.7 : 1,
                }}
                onMouseEnter={e => { if (!claimingUsdc) e.currentTarget.style.background = "rgba(52,211,153,0.08)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "none"; }}
              >
                {usdcClaimed ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                ) : claimingUsdc ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 1s linear infinite" }}>
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="16"/>
                    <line x1="8" y1="12" x2="16" y2="12"/>
                  </svg>
                )}
                {usdcClaimed ? "100 USDC sent!" : claimingUsdc ? "Claiming…" : "Get 100 test USDC"}
              </button>

              {/* Divider */}
              <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "4px 10px" }} />

              {/* Disconnect */}
              <button
                onClick={() => { disconnect(); setWalletMenu(false); }}
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
                Disconnect wallet
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ── Modal via Portal (escapes navbar backdropFilter stacking context) ── */
  const modal = open ? createPortal(
    <div
      ref={overlayRef}
      onClick={handleOverlay}
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{
        zIndex: 9999,
        background: "rgba(0,0,0,0.85)",
        animation: "fadeIn 0.15s ease",
      }}
    >
      <div
        className="relative w-full max-w-[380px] rounded-3xl overflow-hidden"
        style={{
          background: "#0f0d1a",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.9)",
          animation: "slideUp 0.2s cubic-bezier(.4,0,.2,1)",
        }}
      >
        {/* Rainbow gradient top bar */}
        <div className="h-1 w-full" style={{
          background: "linear-gradient(90deg, #f97316, #eab308, #22c55e, #3b82f6, #8b5cf6, #ec4899)",
        }} />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-1">
          <div>
            <h2 className="text-white font-bold text-lg">Connect a wallet</h2>
            <p className="text-zinc-500 text-sm mt-0.5">Choose your Starknet wallet to continue</p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/10 transition-all"
          >
            ✕
          </button>
        </div>

        {/* Wallet options */}
        <div className="px-4 py-4 space-y-2">
          {connectors.map((connector) => {
            const isLoading = connecting === connector.id;
            const icon = typeof connector.icon === "string" ? connector.icon
                       : (connector.icon as any)?.light ?? (connector.icon as any)?.dark ?? undefined;
            return (
              <button
                key={connector.id}
                onClick={() => handleConnect(connector)}
                disabled={!!connecting}
                className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-150 group"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "rgba(139,92,246,0.08)";
                  e.currentTarget.style.border = "1px solid rgba(139,92,246,0.2)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                  e.currentTarget.style.border = "1px solid rgba(255,255,255,0.06)";
                }}
              >
                <WalletAvatar id={connector.id} icon={icon} size={44} />
                <div className="flex-1 text-left">
                  <p className="text-white font-semibold text-[15px]">{walletName(connector.id)}</p>
                  <p className="text-zinc-500 text-xs mt-0.5">{walletSubtitle(connector.id)}</p>
                </div>
                {isLoading ? (
                  <div className="w-5 h-5 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
                ) : (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
                    className="text-zinc-600 group-hover:text-violet-400 transition-colors">
                    <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/[0.05] text-center">
          <p className="text-[12px] text-zinc-600 leading-relaxed">
            New to Starknet?{" "}
            <a
              href={argentHref}
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-400 hover:text-violet-300 transition-colors"
            >
              Get Argent X →
            </a>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn  { from { opacity:0 } to { opacity:1 } }
        @keyframes slideUp { from { opacity:0; transform:translateY(16px) scale(.97) }
                             to   { opacity:1; transform:translateY(0)     scale(1)   } }
      `}</style>
    </div>,
    document.body
  ) : null;

  /* ── Not connected ── */
  return (
    <>
      {modal}
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "9px 22px",
          borderRadius: 999,
          background: "#7c3aed",
          color: "#fff",
          fontSize: 14,
          fontWeight: 600,
          fontFamily: "'Syne', sans-serif",
          border: "none",
          cursor: "pointer",
          transition: "background 0.2s, transform 0.15s",
          whiteSpace: "nowrap",
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = "#6d28d9";
          e.currentTarget.style.transform = "translateY(-1px)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = "#7c3aed";
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="opacity-90 relative">
          <rect x="1" y="4" width="14" height="10" rx="2.5" stroke="white" strokeWidth="1.5"/>
          <path d="M1 7.5h14" stroke="white" strokeWidth="1.5"/>
          <circle cx="11.5" cy="11" r="1.2" fill="white"/>
        </svg>
        <span className="relative">Connect Wallet</span>
      </button>

    </>
  );
}
