import Link from "next/link";
import { Navbar } from "@/components/Navbar";

const features = [
  {
    title: "One-Time Sign",
    desc: "Sign once, subscribe forever. Session keys eliminate repeated approval dialogs for seamless renewals.",
    color: "violet",
    icon: "⚡",
  },
  {
    title: "Gasless Payments",
    desc: "Pay subscription fees in USDC. Zero ETH required — AVNU paymaster covers all gas costs invisibly.",
    color: "cyan",
    icon: "◈",
  },
  {
    title: "Auto-Renewal Engine",
    desc: "Subscriptions renew automatically on-chain. Keeper bot triggers execute_renewal() at period end.",
    color: "emerald",
    icon: "↻",
  },
  {
    title: "Instant Withdrawals",
    desc: "Merchants withdraw earned USDC anytime. No lock-up, no middlemen — full custody of your revenue.",
    color: "amber",
    icon: "↑",
  },
];

const steps = [
  {
    n: "01",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    title: "Create a Plan",
    desc: "Merchant deploys a subscription plan on-chain — set price, interval, and plan name. Takes one transaction.",
  },
  {
    n: "02",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    title: "Subscribe Once",
    desc: "User approves USDC and subscribes in a single multicall. One signature — that's it. Never sign again.",
  },
  {
    n: "03",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    title: "Auto-Renew Forever",
    desc: "Keeper bot calls execute_renewal() at each period end. Contract handles balance check, transfer, and period update.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 pt-32 pb-24 overflow-hidden">
        {/* Radial glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[400px] rounded-full bg-violet-600/10 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-6 max-w-4xl">
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-xs font-mono text-violet-400 tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
            Built on Starknet Account Abstraction
          </div>

          <h1 className="text-5xl md:text-7xl font-light leading-tight tracking-tight">
            <span className="text-zinc-400">The Subscription Protocol</span>
            <br />
            <span className="font-bold text-white">for Web3 SaaS</span>
          </h1>

          <p className="text-lg text-zinc-500 max-w-xl leading-relaxed">
            Sign once. Auto-renew forever.
            <br />
            Powered by native Account Abstraction — no repeated approvals, no friction.
          </p>

          <div className="flex items-center gap-4">
            <Link
              href="/pricing"
              className="px-8 py-3.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-semibold transition-colors"
            >
              Start Building →
            </Link>
            <Link
              href="/demo"
              className="px-8 py-3.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 font-medium transition-colors"
            >
              View Demo
            </Link>
          </div>

          {/* Stats */}
          <div className="flex items-center divide-x divide-white/10 mt-8">
            {[
              ["12,400+", "Active Subscriptions"],
              ["$840K+", "Total Volume (USDC)"],
              ["380+", "Merchants on Sepolia"],
            ].map(([val, label]) => (
              <div key={label} className="px-10 flex flex-col items-center gap-1">
                <span className="text-2xl font-bold text-white">{val}</span>
                <span className="text-xs text-zinc-500">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="flex items-start justify-between mb-16">
          <div>
            <h2 className="text-4xl md:text-5xl font-light text-zinc-400 leading-tight">
              What StarkPayHub
            </h2>
            <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
              Unlocks For Builders
            </h2>
          </div>
          <p className="hidden md:block text-sm text-zinc-500 max-w-xs text-right leading-relaxed">
            Real outcomes SaaS builders achieve when payments, renewals, and
            withdrawals are fully on-chain
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-white/[0.06] bg-[#111] overflow-hidden"
            >
              <div className="h-36 bg-[#0d0d0d] flex items-center justify-center">
                <span className="text-5xl opacity-20">{f.icon}</span>
              </div>
              <div className="p-6 space-y-2">
                <h3 className="text-lg font-semibold text-white">{f.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-6 py-24 border-t border-white/[0.04]">
        <div className="text-center mb-16 space-y-3">
          <p className="text-xs font-mono text-violet-400 tracking-widest uppercase">
            How It Works
          </p>
          <h2 className="text-4xl font-bold text-white">
            Three steps to on-chain subscriptions
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((s) => (
            <div
              key={s.n}
              className="p-8 rounded-xl border border-white/[0.06] bg-[#0f0f0f] space-y-4"
            >
              <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center`}>
                <span className={`font-mono text-sm font-bold ${s.color}`}>{s.n}</span>
              </div>
              <h3 className="text-xl font-semibold text-white">{s.title}</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative mx-6 mb-16 rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/20 via-transparent to-transparent" />
        <div className="relative border border-white/[0.06] bg-[#0f0f0f] rounded-2xl px-6 py-20 flex flex-col items-center text-center gap-8">
          <h2 className="text-5xl font-bold text-white">Ready to Build?</h2>
          <p className="text-lg text-zinc-500 max-w-lg leading-relaxed">
            Get your Web3 subscription protocol live in minutes.
            <br />
            Contracts on Sepolia. SDK ready. Keeper included.
          </p>
          <div className="flex gap-4">
            <Link
              href="/pricing"
              className="px-8 py-3.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-semibold transition-colors"
            >
              Start with Contracts →
            </Link>
            <a
              href="https://github.com"
              className="px-8 py-3.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 font-medium transition-colors"
            >
              Read the Docs
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] px-6 py-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span className="font-mono text-sm font-bold text-white/40 tracking-widest">
            STARKPAYHUB
          </span>
          <span className="text-xs text-zinc-600">
            © 2026 StarkPayHub — Built for Starknet Hackathon
          </span>
          <div className="flex gap-6">
            {["GitHub", "Docs", "Voyager"].map((l) => (
              <a key={l} href="#" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
                {l}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
