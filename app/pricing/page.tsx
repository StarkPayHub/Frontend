"use client";

import { Navbar } from "@/components/Navbar";
import { ClaimUSDC } from "@/components/ClaimUSDC";
import { SubscribeButton } from "@/components/SubscribeButton";
import { PrivySocialButton } from "@/components/PrivySocialButton";
import { PricingCardSkeleton } from "@/components/Skeleton";
import { PLANS } from "@/lib/constants";
import { useAccount } from "@starknet-react/core";

/* ── Per-plan liquid orb config ───────────────────────────────────────────── */
const ORB_CFG = [
  // Starter — blue
  {
    color: "radial-gradient(circle, rgba(59,130,246,0.55) 0%, transparent 70%)",
    size: 180,
    style: { top: -50, right: -30, animation: "orb-float-a 10s ease-in-out infinite" },
    cardBg: "rgba(5,8,22,0.82)",
    cardBorder: "rgba(59,130,246,0.18)",
    accentColor: "rgba(59,130,246,0.45)",
    checkColor: "#60a5fa",
  },
  // Pro — violet (highlight)
  {
    color: "radial-gradient(circle, rgba(124,58,237,0.7) 0%, transparent 65%)",
    size: 280,
    style: { top: -80, left: "50%", animation: "orb-float-b 9s ease-in-out infinite" },
    cardBg: "rgba(8,5,22,0.9)",
    cardBorder: "transparent",      // gradient border from outer wrapper
    accentColor: "rgba(139,92,246,0.7)",
    checkColor: "#a78bfa",
  },
  // Enterprise — emerald
  {
    color: "radial-gradient(circle, rgba(16,185,129,0.4) 0%, transparent 70%)",
    size: 160,
    style: { bottom: -40, left: -30, animation: "orb-float-c 12s ease-in-out infinite" },
    cardBg: "rgba(4,12,10,0.82)",
    cardBorder: "rgba(16,185,129,0.15)",
    accentColor: "rgba(16,185,129,0.5)",
    checkColor: "#34d399",
  },
];

export default function PricingPage() {
  const { status } = useAccount();
  const isInitialising = status === "reconnecting";

  return (
    <div className="min-h-screen" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(60,20,120,0.3) 0%, rgba(4,2,18,1) 60%)", backgroundColor: "#04020f" }}>
      <Navbar />

      <section className="max-w-5xl mx-auto px-6 pt-[96px] pb-24">

        {/* ── Header ── */}
        <div className="text-center space-y-5 mb-14">
          <p className="text-sm font-mono text-violet-400 tracking-[0.22em] uppercase inline-block px-4 py-1.5 rounded-full"
            style={{ background: "rgba(109,40,217,0.12)", border: "1px solid rgba(109,40,217,0.25)" }}>
            Subscription Plans
          </p>
          <h1 style={{ fontSize: "clamp(2rem,5vw,3.5rem)", fontFamily: "'Syne',sans-serif", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
            Choose a plan for your SaaS
          </h1>
          <p className="text-zinc-500 max-w-md mx-auto">
            On-chain USDC payments with auto-renewal. No lock-in. Cancel anytime.
          </p>
        </div>

        {/* ── Testnet claim ── */}
        <div className="flex justify-center mb-10">
          <ClaimUSDC />
        </div>

        {/* ── Auth path pills ── */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-zinc-400">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            Argent X / Braavos
          </span>
          <span className="text-zinc-700 text-xs">or</span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/25 text-xs text-violet-300">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
            Google / Email (gasless)
          </span>
        </div>

        {/* ── Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
          {isInitialising
            ? [1,2,3].map(i => <PricingCardSkeleton key={i} />)
            : PLANS.map((plan, idx) => {
                const orb = ORB_CFG[idx] ?? ORB_CFG[0];
                const isHighlight = plan.highlight;

                return (
                  /* Outer — gradient border for Pro, plain for others */
                  <div
                    key={plan.id}
                    style={isHighlight ? {
                      background: "linear-gradient(145deg,rgba(139,92,246,0.75),rgba(109,40,217,0.4),rgba(167,139,250,0.6))",
                      padding: "1.5px",
                      borderRadius: 22,
                      transform: "scale(1.04)",
                      animation: "highlight-glow 3.5s ease-in-out infinite",
                      position: "relative",
                      zIndex: 2,
                    } : {
                      border: `1px solid ${orb.cardBorder}`,
                      borderRadius: 22,
                    }}
                  >
                    {/* Glass card */}
                    <div style={{
                      position: "relative",
                      overflow: "hidden",
                      borderRadius: isHighlight ? 21 : 21,
                      background: orb.cardBg,
                      backdropFilter: "blur(24px)",
                      WebkitBackdropFilter: "blur(24px)",
                      padding: "32px 28px",
                    }}>

                      {/* Liquid orb */}
                      <div aria-hidden style={{
                        position: "absolute",
                        width: orb.size,
                        height: orb.size,
                        borderRadius: "50%",
                        background: orb.color,
                        filter: "blur(48px)",
                        pointerEvents: "none",
                        ...orb.style,
                      }} />

                      {/* Subtle grid overlay */}
                      <div aria-hidden style={{
                        position: "absolute",
                        inset: 0,
                        backgroundImage: `linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)`,
                        backgroundSize: "28px 28px",
                        pointerEvents: "none",
                        opacity: 0.6,
                      }} />

                      {/* Content */}
                      <div style={{ position: "relative", zIndex: 1 }}>

                        {/* Most Popular badge */}
                        {isHighlight && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-5"
                            style={{
                              background: "linear-gradient(90deg,rgba(124,58,237,0.35),rgba(109,40,217,0.2))",
                              border: "1px solid rgba(139,92,246,0.45)",
                              color: "#c4b5fd",
                            }}>
                            <span className="w-1.5 h-1.5 rounded-full bg-violet-400" style={{ boxShadow: "0 0 6px rgba(167,139,250,0.9)" }} />
                            Most Popular
                          </span>
                        )}

                        {/* Plan name & price */}
                        <div className="space-y-2 mb-6">
                          <p style={{ fontSize: 13, fontFamily: "ui-monospace,'SF Mono',monospace", color: orb.checkColor, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                            {plan.name}
                          </p>
                          <div className="flex items-end gap-1.5">
                            <span style={{
                              fontFamily: "'Syne',sans-serif",
                              fontSize: plan.price > 0n ? "3rem" : "2.25rem",
                              fontWeight: 800,
                              color: "#fff",
                              lineHeight: 1,
                              letterSpacing: "-0.04em",
                            }}>
                              {plan.priceDisplay}
                            </span>
                            {plan.price > 0n && (
                              <span className="text-zinc-500 mb-1.5 text-sm">/ month</span>
                            )}
                          </div>
                        </div>

                        {/* Divider */}
                        <div style={{ height: 1, background: `linear-gradient(90deg,transparent,${orb.accentColor},transparent)`, marginBottom: 20 }} />

                        {/* Features */}
                        <ul className="space-y-2.5 mb-7">
                          {plan.features.map(f => (
                            <li key={f} className="flex items-start gap-2.5 text-sm">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={orb.checkColor}
                                strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                                className="flex-shrink-0 mt-0.5">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                              <span style={{ color: isHighlight ? "rgba(255,255,255,0.85)" : "rgba(161,161,170,0.8)" }}>
                                {f}
                              </span>
                            </li>
                          ))}
                        </ul>

                        {/* CTA */}
                        {plan.price > 0n ? (
                          <div className="space-y-3">
                            <SubscribeButton
                              planId={plan.id}
                              price={plan.price}
                              priceDisplay={plan.priceDisplay}
                              starkzapWallet={null}
                              className={
                                isHighlight
                                  ? "bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/25"
                                  : "bg-white/5 hover:bg-white/10 border border-white/10 text-white"
                              }
                            />
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-px bg-white/[0.05]" />
                              <span className="text-[10px] text-zinc-700 font-mono uppercase tracking-wider">or</span>
                              <div className="flex-1 h-px bg-white/[0.05]" />
                            </div>
                            <PrivySocialButton variant="card" label="Subscribe with Google" />
                          </div>
                        ) : (
                          <button className="w-full h-11 rounded-xl text-sm font-semibold transition-colors"
                            style={{
                              background: "rgba(16,185,129,0.08)",
                              border: "1px solid rgba(16,185,129,0.25)",
                              color: "#34d399",
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = "rgba(16,185,129,0.15)"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "rgba(16,185,129,0.08)"; }}
                          >
                            Contact Us →
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
        </div>
      </section>
    </div>
  );
}
