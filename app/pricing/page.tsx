"use client";

import { Navbar } from "@/components/Navbar";
import { ClaimUSDC } from "@/components/ClaimUSDC";
import { SubscribeButton } from "@/components/SubscribeButton";
import { useAccount } from "@starknet-react/core";
import { useMySubscriptions } from "@/hooks/useMySubscriptions";
import { PLANS } from "@/lib/constants";

/* ── Format helpers ─────────────────────────────────────────────────────────── */
function formatInterval(secs: number): string {
  if (secs <= 0) return "—";
  const days = Math.round(secs / 86400);
  if (days === 1)  return "Daily";
  if (days === 7)  return "Weekly";
  if (days === 30 || days === 31) return "Monthly";
  if (days === 365) return "Yearly";
  return `${days} days`;
}

/* ── Orb palette (cycles per index) ─────────────────────────────────────────── */
const ORB_CFG = [
  {
    color: "radial-gradient(circle, rgba(59,130,246,0.55) 0%, transparent 70%)",
    size: 180, style: { top: -50, right: -30, animation: "orb-float-a 10s ease-in-out infinite" },
    cardBg: "rgba(5,8,22,0.82)", cardBorder: "rgba(59,130,246,0.18)",
    accentColor: "rgba(59,130,246,0.45)", checkColor: "#60a5fa",
  },
  {
    color: "radial-gradient(circle, rgba(124,58,237,0.7) 0%, transparent 65%)",
    size: 280, style: { top: -80, left: "50%", animation: "orb-float-b 9s ease-in-out infinite" },
    cardBg: "rgba(8,5,22,0.9)", cardBorder: "transparent",
    accentColor: "rgba(139,92,246,0.7)", checkColor: "#a78bfa",
  },
  {
    color: "radial-gradient(circle, rgba(16,185,129,0.4) 0%, transparent 70%)",
    size: 160, style: { bottom: -40, left: -30, animation: "orb-float-c 12s ease-in-out infinite" },
    cardBg: "rgba(4,12,10,0.82)", cardBorder: "rgba(16,185,129,0.15)",
    accentColor: "rgba(16,185,129,0.5)", checkColor: "#34d399",
  },
];

export default function PricingPage() {
  const { status } = useAccount();
  const { subscriptions } = useMySubscriptions();

  const isLoading = status === "reconnecting";

  function getSubForPlan(planId: number) {
    return subscriptions.find(s => s.planId === planId && s.active && !s.isExpired);
  }

  // Middle card gets highlight treatment
  const highlightIdx = Math.floor(PLANS.length / 2);

  return (
    <div className="min-h-screen" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(60,20,120,0.3) 0%, rgba(4,2,18,1) 60%)", backgroundColor: "#04020f" }}>
      <Navbar />

      <section className="max-w-5xl mx-auto px-6 pt-[96px] pb-24">

        {/* Header */}
        <div className="text-center space-y-5 mb-14">
          <p className="text-sm font-mono text-violet-400 tracking-[0.22em] uppercase inline-block px-4 py-1.5 rounded-full"
            style={{ background: "rgba(109,40,217,0.12)", border: "1px solid rgba(109,40,217,0.25)" }}>
            Subscription Plans
          </p>
          <h1 style={{ fontSize: "clamp(2rem,5vw,3.5rem)", fontWeight: 700, color: "#fff", lineHeight: 1.1 }}>
            Choose a plan for your SaaS
          </h1>
          <p className="text-zinc-500 max-w-md mx-auto">
            On-chain USDC payments with auto-renewal. No lock-in. Cancel anytime.
          </p>
        </div>

        {/* Testnet claim */}
        <div className="flex justify-center mb-10">
          <ClaimUSDC />
        </div>

        {/* Auth pill */}
        <div className="flex items-center justify-center mb-12">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-zinc-400">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            Argent X / Braavos
          </span>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 gap-5 items-center md:grid-cols-3">
          {isLoading
            ? [1, 2, 3].map(i => <div key={i} style={{ height: 400, borderRadius: 22, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", animation: "pulse 2s ease-in-out infinite" }} />)
            : PLANS.map((plan, idx) => {
                const orb = ORB_CFG[idx % ORB_CFG.length];
                const isHighlight = idx === highlightIdx;
                const priceDisplay = plan.priceDisplay;
                const intervalLabel = formatInterval(plan.interval);
                const sub = getSubForPlan(plan.id);

                return (
                  <div
                    key={plan.id}
                    style={isHighlight ? {
                      background: "linear-gradient(145deg,rgba(139,92,246,0.75),rgba(109,40,217,0.4),rgba(167,139,250,0.6))",
                      padding: "1.5px", borderRadius: 22,
                      transform: "scale(1.04)",
                      animation: "highlight-glow 3.5s ease-in-out infinite",
                      position: "relative", zIndex: 2,
                    } : {
                      border: `1px solid ${orb.cardBorder}`,
                      borderRadius: 22,
                    }}
                  >
                    <div style={{
                      position: "relative", overflow: "hidden",
                      borderRadius: 21, background: orb.cardBg,
                      backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
                      padding: "32px 28px",
                    }}>
                      {/* Liquid orb */}
                      <div aria-hidden style={{
                        position: "absolute", width: orb.size, height: orb.size,
                        borderRadius: "50%", background: orb.color, filter: "blur(48px)",
                        pointerEvents: "none", ...orb.style,
                      }} />

                      {/* Grid overlay */}
                      <div aria-hidden style={{
                        position: "absolute", inset: 0,
                        backgroundImage: `linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)`,
                        backgroundSize: "28px 28px", pointerEvents: "none", opacity: 0.6,
                      }} />

                      <div style={{ position: "relative", zIndex: 1 }}>

                        {/* Badge */}
                        {isHighlight && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-5"
                            style={{ background: "linear-gradient(90deg,rgba(124,58,237,0.35),rgba(109,40,217,0.2))", border: "1px solid rgba(139,92,246,0.45)", color: "#c4b5fd" }}>
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
                            <span style={{ fontSize: "3rem", fontWeight: 700, color: "#fff", lineHeight: 1, letterSpacing: "-0.02em" }}>
                              {priceDisplay}
                            </span>
                            {plan.price > 0n && (
                              <span className="text-zinc-500 mb-1.5 text-sm">/ {intervalLabel.toLowerCase()}</span>
                            )}
                          </div>
                        </div>

                        {/* Divider */}
                        <div style={{ height: 1, background: `linear-gradient(90deg,transparent,${orb.accentColor},transparent)`, marginBottom: 20 }} />

                        {/* Features */}
                        <ul className="space-y-2.5 mb-7">
                          {[...plan.features, `Renews ${intervalLabel.toLowerCase()}`].map(f => (
                            <li key={f} className="flex items-start gap-2.5 text-sm">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={orb.checkColor}
                                strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                              <span style={{ color: isHighlight ? "rgba(255,255,255,0.85)" : "rgba(161,161,170,0.8)" }}>{f}</span>
                            </li>
                          ))}
                        </ul>

                        {/* CTA */}
                        <SubscribeButton
                          planId={plan.id}
                          price={plan.price}
                          priceDisplay={priceDisplay}
                          isSubscribed={!!sub}
                          periodEnd={sub?.currentPeriodEnd}
                          className={
                            isHighlight
                              ? "bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/25"
                              : "bg-white/5 hover:bg-white/10 border border-white/10 text-white"
                          }
                        />
                      </div>
                    </div>
                  </div>
                );
              })
          }
        </div>
      </section>
    </div>
  );
}
