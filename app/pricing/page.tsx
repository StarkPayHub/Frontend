"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { ClaimUSDC } from "@/components/ClaimUSDC";
import { SubscribeButton } from "@/components/SubscribeButton";
import { SocialLoginButton } from "@/components/SocialLoginButton";
import { PricingCardSkeleton } from "@/components/Skeleton";
import { PLANS } from "@/lib/constants";
import { useAccount } from "@starknet-react/core";

export default function PricingPage() {
  // starkzapWallet is set per-plan when user completes social login onboarding
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [starkzapWallets, setStarkzapWallets] = useState<Record<number, any>>({});
  const { status } = useAccount();

  // Show skeleton while the starknet-react provider is initialising
  const isInitialising = status === "reconnecting";

  return (
    <div className="min-h-screen" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(60,20,120,0.3) 0%, rgba(4,2,18,1) 60%)", backgroundColor: "#04020f" }}>
      <Navbar />

      <section className="max-w-5xl mx-auto px-6 py-20">
        {/* Header */}
        <div className="text-center space-y-4 mb-12">
          <p className="text-xs font-mono text-violet-400 tracking-widest uppercase">
            Subscription Plans
          </p>
          <h1 className="text-5xl font-bold text-white">
            Choose a plan for your SaaS
          </h1>
          <p className="text-zinc-500">
            All plans use on-chain USDC payments with auto-renewal. No lock-in contracts.
          </p>
        </div>

        {/* Testnet claim */}
        <div className="flex justify-center mb-10">
          <ClaimUSDC />
        </div>

        {/* Auth path toggle hint */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-zinc-400">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
            Wallet (Argent X / Braavos)
          </span>
          <span className="text-zinc-700 text-xs">or</span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/25 text-xs text-violet-300">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
            Email / Google (gasless)
          </span>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {isInitialising
            ? [1, 2, 3].map((i) => <PricingCardSkeleton key={i} />)
            : PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`rounded-xl p-8 space-y-7 ${
                  plan.highlight
                    ? "bg-[#13101e] border border-violet-500/40"
                    : "bg-[#111] border border-white/[0.06]"
                }`}
              >
                {plan.highlight && (
                  <span className="inline-block px-3 py-1 rounded-full bg-violet-600 text-white text-xs font-bold">
                    Most Popular
                  </span>
                )}

                <div className="space-y-2">
                  <h2 className="text-lg font-semibold text-white">{plan.name}</h2>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-bold text-white">
                      {plan.priceDisplay}
                    </span>
                    {plan.price > 0n && (
                      <span className="text-zinc-500 mb-1">/ month</span>
                    )}
                  </div>
                </div>

                <hr className={plan.highlight ? "border-violet-500/20" : "border-white/[0.06]"} />

                <ul className="space-y-3">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className={`flex items-start gap-2 text-sm ${
                        plan.highlight ? "text-white" : "text-zinc-400"
                      }`}
                    >
                      <span className={plan.highlight ? "text-violet-400" : "text-zinc-600"}>
                        ✓
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>

                {plan.price > 0n ? (
                  <div className="space-y-3">
                    {/* Path 1: starknet-react wallet */}
                    <SubscribeButton
                      planId={plan.id}
                      price={plan.price}
                      priceDisplay={plan.priceDisplay}
                      starkzapWallet={starkzapWallets[plan.id] ?? null}
                      className={
                        plan.highlight
                          ? "bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/20"
                          : "bg-white/5 hover:bg-white/10 border border-white/10 text-white"
                      }
                    />

                    {/* Divider */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-px bg-white/[0.06]" />
                      <span className="text-[10px] text-zinc-600 font-mono uppercase tracking-wider">or</span>
                      <div className="flex-1 h-px bg-white/[0.06]" />
                    </div>

                    {/* Path 2: social login → Starkzap gasless */}
                    <SocialLoginButton
                      onWalletReady={(wallet) =>
                        setStarkzapWallets((prev) => ({ ...prev, [plan.id]: wallet }))
                      }
                      label="Subscribe with Email"
                      className="bg-transparent border border-violet-500/30 hover:bg-violet-500/10 text-violet-300 hover:text-violet-200"
                    />
                  </div>
                ) : (
                  <button className="w-full h-11 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-semibold transition-colors">
                    Contact Us
                  </button>
                )}
              </div>
            ))}
        </div>
      </section>
    </div>
  );
}
