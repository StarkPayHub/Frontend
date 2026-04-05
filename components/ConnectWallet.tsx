"use client";

import { useAccount, useConnect, useDisconnect } from "@starknet-react/core";
import { useState, useRef, useEffect } from "react";

/* ── Wallet brand colours & labels ── */
const WALLET: Record<string, { bg: string; label: string; desc: string }> = {
  argentx: { bg: "linear-gradient(145deg,#f97316,#ea580c)", label: "Ax", desc: "Argent X" },
  braavos:  { bg: "linear-gradient(145deg,#3b82f6,#1d4ed8)", label: "Bv", desc: "Braavos"  },
};

function walletMeta(id: string) {
  const key = id.toLowerCase().replace(/[\s_-]/g, "");
  return (
    Object.entries(WALLET).find(([k]) => key.includes(k))?.[1] ??
    { bg: "linear-gradient(145deg,#7c3aed,#4338ca)", label: id.slice(0,2).toUpperCase(), desc: id }
  );
}

/* ── Wallet icon ── */
function WalletAvatar({ id, size = 40 }: { id: string; size?: number }) {
  const { bg, label } = walletMeta(id);
  return (
    <div
      className="flex-shrink-0 flex items-center justify-center rounded-2xl font-bold text-white"
      style={{ width: size, height: size, background: bg, fontSize: size * 0.35,
               boxShadow: "0 4px 16px rgba(0,0,0,0.4)" }}
    >
      {label}
    </div>
  );
}

/* ══════════════════════════════════════════════════════ */
export function ConnectWallet() {
  const { address, status } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [open, setOpen] = useState(false);
  const [connecting, setConnecting] = useState<string | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  /* close on overlay click */
  const handleOverlay = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) setOpen(false);
  };

  /* close on Escape */
  useEffect(() => {
    if (!open) return;
    const fn = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [open]);

  const handleConnect = async (connector: typeof connectors[0]) => {
    setConnecting(connector.id);
    try { connect({ connector }); }
    finally { setConnecting(null); setOpen(false); }
  };

  /* ── Connected ── */
  if (status === "connected" && address) {
    return (
      <button
        onClick={() => disconnect()}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 18px",
          borderRadius: 999,
          background: "rgba(139,92,246,0.15)",
          border: "1px solid rgba(139,92,246,0.3)",
          color: "rgba(196,181,253,0.9)",
          fontSize: 13,
          fontWeight: 500,
          cursor: "pointer",
          transition: "background 0.2s",
        }}
        onMouseEnter={e => (e.currentTarget.style.background = "rgba(239,68,68,0.08)")}
        onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0"
          style={{ boxShadow: "0 0 8px rgba(52,211,153,0.8)" }} />
        <span className="font-mono">{address.slice(0,6)}…{address.slice(-4)}</span>
        <span className="text-zinc-600 group-hover:text-red-400 transition-colors text-xs ml-1">✕</span>
      </button>
    );
  }

  /* ── Not connected ── */
  return (
    <>
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

      {/* ── Wallet modal ── */}
      {open && (
        <div
          ref={overlayRef}
          onClick={handleOverlay}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{
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
                const meta = walletMeta(connector.id);
                const isLoading = connecting === connector.id;
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
                    <WalletAvatar id={connector.id} size={44} />
                    <div className="flex-1 text-left">
                      <p className="text-white font-semibold text-[15px]">{meta.desc}</p>
                      <p className="text-zinc-500 text-xs mt-0.5">Starknet browser wallet</p>
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
                  href="https://www.argent.xyz/argent-x"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-violet-400 hover:text-violet-300 transition-colors"
                >
                  Get Argent X →
                </a>
              </p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn  { from { opacity:0 } to { opacity:1 } }
        @keyframes slideUp { from { opacity:0; transform:translateY(16px) scale(.97) }
                             to   { opacity:1; transform:translateY(0)     scale(1)   } }
      `}</style>
    </>
  );
}
