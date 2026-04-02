import { Navbar } from "@/components/Navbar";
import Link from "next/link";

const before = [
  "Sign every single renewal transaction",
  "Need ETH in wallet just to pay gas",
  "Manual approve + subscribe = 2 transactions",
  "No on-chain renewal automation possible",
  "Merchants manually track payments off-chain",
];

const after = [
  "Sign once — renew forever automatically",
  "AVNU Paymaster: pay gas in USDC, zero ETH",
  "Approve + subscribe in 1 multicall transaction",
  "Keeper bot automates every renewal on-chain",
  "Merchant dashboard with real-time on-chain stats",
];

const flowSteps = [
  { n: "01", label: "Install SDK", detail: "pnpm add @starkpay/sdk", color: "violet" },
  { n: "02", label: "Visit Landing", detail: "starkpayhub.xyz", color: "cyan" },
  { n: "03", label: "Choose Plan", detail: "Pricing page", color: "amber" },
  { n: "04", label: "Approve Wallet", detail: "1 multicall tx", color: "violet" },
  { n: "05", label: "Dashboard Live", detail: "Subscribed ✓", color: "emerald" },
];

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-20 space-y-20">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold text-white">Before vs After</h1>
          <p className="text-zinc-500">
            How StarkPayHub transforms the Web3 subscription experience
          </p>
        </div>

        {/* Before / After */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="p-8 rounded-xl bg-[#0f0a0a] border border-red-500/15 space-y-5">
            <span className="inline-block px-3 py-1 rounded-md bg-red-500/10 text-red-400 text-xs font-mono tracking-wider">
              ✕ WITHOUT STARKPAYHUB
            </span>
            <h2 className="text-xl font-semibold text-white">
              Traditional Web3 Subscriptions
            </h2>
            <ul className="space-y-3">
              {before.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-red-400/80">
                  <span className="mt-0.5 flex-shrink-0">✕</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="p-8 rounded-xl bg-[#0a0f0a] border border-emerald-500/15 space-y-5">
            <span className="inline-block px-3 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-xs font-mono tracking-wider">
              ✓ WITH STARKPAYHUB
            </span>
            <h2 className="text-xl font-semibold text-white">
              On-Chain Auto-Renewal Protocol
            </h2>
            <ul className="space-y-3">
              {after.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-emerald-400/80">
                  <span className="mt-0.5 flex-shrink-0">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors mt-2"
            >
              Try Live Demo →
            </Link>
          </div>
        </div>

        {/* Onboarding Flow */}
        <div className="space-y-10">
          <div className="text-center space-y-2">
            <p className="text-xs font-mono text-violet-400 tracking-widest uppercase">
              Developer Onboarding Flow
            </p>
            <h2 className="text-3xl font-bold text-white">
              From SDK install to live subscription in 5 steps
            </h2>
          </div>

          <div className="flex items-center justify-between gap-2">
            {flowSteps.map((step, i) => (
              <div key={step.n} className="flex items-center gap-2 flex-1">
                <div className="flex flex-col items-center gap-3 flex-1">
                  <div
                    className={`w-14 h-14 rounded-xl flex items-center justify-center border ${
                      step.color === "emerald"
                        ? "bg-emerald-500/10 border-emerald-500/30"
                        : step.color === "cyan"
                        ? "bg-cyan-500/10 border-cyan-500/30"
                        : step.color === "amber"
                        ? "bg-amber-500/10 border-amber-500/30"
                        : "bg-violet-500/10 border-violet-500/30"
                    }`}
                  >
                    <span
                      className={`font-mono text-xs font-bold ${
                        step.color === "emerald"
                          ? "text-emerald-400"
                          : step.color === "cyan"
                          ? "text-cyan-400"
                          : step.color === "amber"
                          ? "text-amber-400"
                          : "text-violet-400"
                      }`}
                    >
                      {step.n}
                    </span>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-white">{step.label}</p>
                    <p className="text-xs text-zinc-500 font-mono mt-1">{step.detail}</p>
                  </div>
                </div>
                {i < flowSteps.length - 1 && (
                  <span className="text-zinc-600 text-xl flex-shrink-0 mb-6">›</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Wallet mock + success */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Argent X mock */}
          <div className="p-6 rounded-xl bg-[#111] border border-violet-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white">Argent X</span>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-mono text-emerald-400">Sepolia</span>
              </div>
            </div>
            <hr className="border-white/[0.06]" />
            <p className="text-xs text-zinc-500">Confirm Transaction</p>
            <div className="space-y-2">
              {[
                { fn: "approve (USDC)", val: "$49.00" },
                { fn: "subscribe (plan #1)", val: "Pro Plan" },
              ].map((tx) => (
                <div key={tx.fn} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-[#0a0a0a]">
                  <span className="text-xs font-mono text-zinc-400">{tx.fn}</span>
                  <span className="text-xs font-mono text-white">{tx.val}</span>
                </div>
              ))}
              <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-cyan-500/5 border border-cyan-500/20">
                <span className="text-xs font-mono text-cyan-400">Gas (AVNU Paymaster)</span>
                <span className="text-xs font-mono font-bold text-cyan-400">FREE</span>
              </div>
            </div>
            <button className="w-full h-11 rounded-lg bg-violet-600 text-white text-sm font-semibold">
              Confirm &amp; Subscribe
            </button>
          </div>

          {/* Success */}
          <div className="p-6 rounded-xl bg-[#0a0f0a] border border-emerald-500/20 flex flex-col items-center justify-center gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-2xl">
              ✓
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Subscription Active!</h3>
              <p className="text-sm text-zinc-500 mt-2 leading-relaxed">
                You&apos;re now subscribed to Pro Plan.
                <br />
                Next renewal: May 2, 2026 (auto)
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 text-xs font-mono text-zinc-500">
              ↗ 0x4f2a...e91c · View on Voyager
            </div>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors"
            >
              Go to Dashboard →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
