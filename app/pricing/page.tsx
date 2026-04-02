import { Navbar } from "@/components/Navbar";
import { ClaimUSDC } from "@/components/ClaimUSDC";
import { SubscribeButton } from "@/components/SubscribeButton";
import { PLANS } from "@/lib/constants";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
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
            All plans use on-chain USDC payments with auto-renewal. No lock-in
            contracts.
          </p>
        </div>

        {/* Testnet claim */}
        <div className="flex justify-center mb-10">
          <ClaimUSDC />
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {PLANS.map((plan) => (
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
                <SubscribeButton
                  planId={plan.id}
                  price={plan.price}
                  priceDisplay={plan.priceDisplay}
                  className={
                    plan.highlight
                      ? "bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/20"
                      : "bg-white/5 hover:bg-white/10 border border-white/10 text-white"
                  }
                />
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
