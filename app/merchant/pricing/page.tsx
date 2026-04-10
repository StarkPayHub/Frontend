"use client";

import Link from "next/link";
import { useAccount, useReadContract } from "@starknet-react/core";
import { STARKPAY_ADDRESS, starkpayAbi } from "@/lib/contracts";
import { SubscribeButton } from "@/components/SubscribeButton";
import { ClaimUSDC } from "@/components/ClaimUSDC";

function useMerchantTier(address?: string) {
  const { data: countData } = useReadContract({
    address: STARKPAY_ADDRESS as `0x${string}`,
    abi: starkpayAbi,
    functionName: "get_merchant_plan_count",
    args: address ? [address] : undefined,
    enabled: !!address,
    watch: true,
  });
  const { data: limitData } = useReadContract({
    address: STARKPAY_ADDRESS as `0x${string}`,
    abi: starkpayAbi,
    functionName: "get_merchant_plan_limit",
    args: address ? [address] : undefined,
    enabled: !!address,
    watch: true,
  });
  const planCount = countData !== undefined ? Number(countData) : 0;
  const planLimit = limitData !== undefined ? Number(limitData) : 1;
  const tier = planLimit <= 1 ? "free" : planLimit <= 3 ? "starter" : planLimit <= 10 ? "pro" : "enterprise";
  return { planCount, planLimit, canCreatePlan: planCount < planLimit, tier };
}

const TIERS = [
  {
    id: "free",
    name: "Free",
    price: "Gratis",
    priceNote: "selamanya",
    planId: null,
    color: "#a1a1aa",
    bg: "rgba(161,161,170,0.06)",
    border: "rgba(161,161,170,0.15)",
    maxPlans: 1,
    features: [
      "1 subscription plan",
      "Unlimited subscribers",
      "Auto-renewal via keeper bot",
      "On-chain payment tracking",
    ],
    cta: "Mulai Gratis",
  },
  {
    id: "starter",
    name: "Starter",
    price: "$10",
    priceNote: "/ bulan",
    planId: 1,
    priceUSDC: 10_000_000n,
    color: "#34d399",
    bg: "rgba(52,211,153,0.06)",
    border: "rgba(52,211,153,0.2)",
    maxPlans: 3,
    features: [
      "3 subscription plans",
      "Unlimited subscribers",
      "Auto-renewal via keeper bot",
      "On-chain payment tracking",
      "Revenue dashboard",
    ],
    cta: "Subscribe Starter",
  },
  {
    id: "pro",
    name: "Pro",
    price: "$15",
    priceNote: "/ bulan",
    planId: 2,
    priceUSDC: 15_000_000n,
    color: "#a78bfa",
    bg: "rgba(124,58,237,0.08)",
    border: "rgba(124,58,237,0.4)",
    maxPlans: 10,
    features: [
      "10 subscription plans",
      "Unlimited subscribers",
      "Auto-renewal via keeper bot",
      "Revenue dashboard + PDF export",
      "Gasless subscribe untuk user",
      "Interval: harian / mingguan / bulanan",
      "Priority support",
    ],
    cta: "Subscribe Pro",
    highlight: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "$50",
    priceNote: "/ bulan",
    planId: 3,
    priceUSDC: 50_000_000n,
    color: "#fbbf24",
    bg: "rgba(251,191,36,0.06)",
    border: "rgba(251,191,36,0.2)",
    maxPlans: null,
    features: [
      "Unlimited subscription plans",
      "Unlimited subscribers",
      "Auto-renewal via keeper bot",
      "Revenue dashboard + PDF export",
      "Gasless subscribe untuk user",
      "Custom interval (termasuk custom hari)",
      "Dedicated support",
    ],
    cta: "Subscribe Enterprise",
  },
];

export default function MerchantPricingPage() {
  const { address } = useAccount();
  const { tier: currentTier, planCount, planLimit } = useMerchantTier(address);

  return (
    <div style={{
      minHeight: "100vh",
      background: "radial-gradient(ellipse at 50% 0%, rgba(60,20,120,0.25) 0%, #04020f 60%)",
      color: "#fff",
      fontFamily: "system-ui, sans-serif",
    }}>
      {/* Navbar */}
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 40px", borderBottom: "0.5px solid rgba(255,255,255,0.07)",
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "#fff" }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg, #7c3aed, #4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 16 }}>S</div>
          <span style={{ fontWeight: 700, fontSize: 16 }}>StarkPay</span>
        </Link>
        <Link href="/merchant" style={{ fontSize: 13, color: "rgba(161,161,170,0.6)", textDecoration: "none" }}>
          ← Kembali ke Dashboard
        </Link>
      </header>

      {/* Hero */}
      <section style={{ textAlign: "center", padding: "60px 20px 48px" }}>
        <div style={{ fontSize: 11, fontFamily: "ui-monospace,monospace", color: "#a78bfa", background: "rgba(124,58,237,0.1)", border: "0.5px solid rgba(139,92,246,0.3)", padding: "4px 12px", borderRadius: 99, display: "inline-block", marginBottom: 20, letterSpacing: "0.1em" }}>
          MERCHANT TIER
        </div>
        <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 800, lineHeight: 1.1, margin: "0 0 16px" }}>
          Pilih Tier Merchant Kamu
        </h1>
        <p style={{ fontSize: 15, color: "rgba(161,161,170,0.6)", maxWidth: 480, margin: "0 auto 24px" }}>
          Tier menentukan berapa subscription plan yang bisa kamu buat untuk users.
          Semakin tinggi tier, semakin banyak plan yang bisa dibuat.
        </p>

        {/* Testnet USDC claim */}
        {address && (
          <div style={{ marginBottom: 16 }}>
            <ClaimUSDC />
          </div>
        )}

        {/* Current tier badge */}
        {address && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 16px", borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.08)" }}>
            <span style={{ fontSize: 13, color: "rgba(161,161,170,0.5)" }}>Tier aktif:</span>
            <span style={{
              fontSize: 12, fontWeight: 700, padding: "2px 10px", borderRadius: 99,
              background: currentTier === "pro" ? "rgba(124,58,237,0.2)" : currentTier === "enterprise" ? "rgba(251,191,36,0.15)" : currentTier === "starter" ? "rgba(52,211,153,0.12)" : "rgba(161,161,170,0.1)",
              color: currentTier === "pro" ? "#a78bfa" : currentTier === "enterprise" ? "#fbbf24" : currentTier === "starter" ? "#34d399" : "#a1a1aa",
              fontFamily: "ui-monospace,monospace", textTransform: "uppercase",
            }}>
              {currentTier}
            </span>
            <span style={{ fontSize: 13, color: "rgba(161,161,170,0.4)" }}>
              {planCount}/{planLimit > 1e15 ? "∞" : planLimit} plans dipakai
            </span>
          </div>
        )}
      </section>

      {/* Tier Cards */}
      <main style={{ padding: "0 20px 80px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
          {TIERS.map(t => {
            const isActive = !!address && currentTier === t.id;
            return (
              <div key={t.id} style={{
                padding: "28px 24px", borderRadius: 20,
                background: t.bg,
                border: `1px solid ${isActive ? t.color : (t as any).highlight ? t.border : t.border}`,
                display: "flex", flexDirection: "column", gap: 16,
                position: "relative",
                boxShadow: isActive ? `0 0 32px ${t.color}20` : (t as any).highlight ? `0 0 40px rgba(124,58,237,0.15)` : "none",
                transform: (t as any).highlight ? "scale(1.02)" : "none",
              }}>
                {(t as any).highlight && !isActive && (
                  <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", fontSize: 10, fontWeight: 700, fontFamily: "ui-monospace,monospace", color: "#fff", background: "#7c3aed", padding: "3px 14px", borderRadius: 99, whiteSpace: "nowrap" }}>
                    PALING POPULER
                  </div>
                )}
                {isActive && (
                  <div style={{ position: "absolute", top: -12, right: 20, fontSize: 10, fontWeight: 700, fontFamily: "ui-monospace,monospace", color: "#04020f", background: t.color, padding: "3px 12px", borderRadius: 99 }}>
                    AKTIF
                  </div>
                )}

                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: t.color, textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "ui-monospace,monospace", margin: 0 }}>{t.name}</p>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 8 }}>
                    <span style={{ fontSize: "2.2rem", fontWeight: 700, lineHeight: 1, color: "#fff" }}>{t.price}</span>
                    <span style={{ fontSize: 13, color: "rgba(161,161,170,0.5)" }}>{t.priceNote}</span>
                  </div>
                </div>

                {/* Plan limit highlight box */}
                <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(255,255,255,0.04)", border: `0.5px solid ${t.color}33` }}>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: t.color }}>
                    {t.maxPlans === null ? "Unlimited" : `${t.maxPlans} plan`}
                  </p>
                  <p style={{ margin: "2px 0 0", fontSize: 11, color: "rgba(161,161,170,0.45)" }}>
                    subscription plan yang bisa dibuat
                  </p>
                </div>

                {/* Features */}
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8, flexGrow: 1 }}>
                  {t.features.map(f => (
                    <li key={f} style={{ fontSize: 13, color: "rgba(210,210,230,0.7)", display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <span style={{ color: t.color, flexShrink: 0, marginTop: 1 }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {isActive ? (
                  <Link href="/merchant" style={{
                    display: "block", textAlign: "center", padding: "11px 0", borderRadius: 12,
                    border: `1px solid ${t.color}`, color: t.color,
                    fontWeight: 600, fontSize: 13, textDecoration: "none",
                  }}>
                    Tier Aktif — Ke Dashboard
                  </Link>
                ) : t.planId !== null ? (
                  <SubscribeButton
                    planId={t.planId}
                    price={(t as any).priceUSDC}
                    priceDisplay={t.price}
                    className={(t as any).highlight
                      ? "bg-violet-600 hover:bg-violet-500 text-white border border-transparent"
                      : "bg-transparent hover:bg-white/5 text-white border"
                    }
                  />
                ) : (
                  <div style={{ display: "block", textAlign: "center", padding: "11px 0", borderRadius: 12, border: `1px solid ${t.color}`, color: "rgba(161,161,170,0.5)", fontWeight: 600, fontSize: 13 }}>
                    {t.cta}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Info footer */}
        <div style={{ marginTop: 48, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
          {[
            { label: "Interval Didukung", value: "Harian · Mingguan · Bulanan · Tahunan · Custom" },
            { label: "Limit Bisa Diubah", value: "Owner StarkPay bisa update limit kapan saja tanpa redeploy contract" },
            { label: "On-chain Enforcement", value: "Limit di-enforce di smart contract — tidak bisa di-bypass" },
            { label: "Gasless Subscribe", value: "User bayar 0 gas saat subscribe (Pro & Enterprise)" },
          ].map(info => (
            <div key={info.label} style={{ padding: "18px 20px", background: "rgba(255,255,255,0.02)", border: "0.5px solid rgba(255,255,255,0.06)", borderRadius: 14 }}>
              <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 600, color: "rgba(161,161,170,0.5)", fontFamily: "ui-monospace,monospace", textTransform: "uppercase", letterSpacing: "0.08em" }}>{info.label}</p>
              <p style={{ margin: 0, fontSize: 13, color: "rgba(210,210,230,0.6)", lineHeight: 1.5 }}>{info.value}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
