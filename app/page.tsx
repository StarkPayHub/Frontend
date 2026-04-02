import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { MatrixBackground } from "@/components/MatrixBackground";

const features = [
  {
    title: "One-Time Sign",
    desc: "Sign once, subscribe forever. Session keys eliminate repeated approval dialogs for seamless renewals.",
    icon: "⚡",
  },
  {
    title: "Gasless Payments",
    desc: "Pay subscription fees in USDC. Zero ETH required — AVNU paymaster covers all gas costs invisibly.",
    icon: "◈",
  },
  {
    title: "Auto-Renewal Engine",
    desc: "Subscriptions renew automatically on-chain. Keeper bot triggers execute_renewal() at period end.",
    icon: "↻",
  },
  {
    title: "Instant Withdrawals",
    desc: "Merchants withdraw earned USDC anytime. No lock-up, no middlemen — full custody of your revenue.",
    icon: "↑",
  },
];

const steps = [
  {
    n: "01",
    title: "Create a Plan",
    desc: "Merchant deploys a subscription plan on-chain — set price, interval, and plan name.",
  },
  {
    n: "02",
    title: "Subscribe Once",
    desc: "User approves USDC and subscribes in a single multicall. One signature — never sign again.",
  },
  {
    n: "03",
    title: "Auto-Renew Forever",
    desc: "Keeper bot calls execute_renewal() at each period end. Contract handles everything automatically.",
  },
];

export default function Home() {
  return (
    <div className="relative text-white" style={{ background: '#000' }}>
      <MatrixBackground />

      <Navbar />

      {/* ── Hero ── */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-24 pb-32 min-h-screen">
        {/* Center glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden>
          <div className="w-[800px] h-[600px] rounded-full bg-violet-900/20 blur-[140px]" />
        </div>

        <div className="relative flex flex-col items-center gap-8 max-w-5xl w-full">
          {/* Badge */}
          <p className="font-mono text-[12px] tracking-[0.22em] uppercase px-4 py-2 rounded-full inline-block"
            style={{ color: '#c4b5fd', background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.25)' }}>
            Built on Starknet · Account Abstraction
          </p>

          {/* Headline */}
          <h1 className="font-display font-extrabold uppercase leading-[0.92] tracking-tight drop-shadow-2xl">
            <span
              className="block text-[clamp(3rem,9vw,8rem)]"
              style={{
                color: '#fff',
                textShadow: '0 0 40px rgba(167,139,250,0.9), 0 2px 8px rgba(0,0,0,0.9)',
              }}
            >
              The Subscription
            </span>
            <span
              className="block text-[clamp(3rem,9vw,8rem)]"
              style={{
                color: '#c4b5fd',
                textShadow: '0 0 60px rgba(124,58,237,0.8), 0 2px 8px rgba(0,0,0,0.9)',
              }}
            >
              Protocol for Web3
            </span>
          </h1>

          <p
            className="text-base md:text-lg max-w-xl leading-relaxed font-medium"
            style={{ color: '#e4e4e7', textShadow: '0 1px 6px rgba(0,0,0,1), 0 0 20px rgba(0,0,0,0.8)' }}
          >
            Sign once. Auto-renew forever.
            <br />
            No repeated approvals, no friction — pure on-chain SaaS.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
            <Link
              href="/pricing"
              className="group flex items-center gap-3 px-8 py-4 border border-white text-white font-mono text-sm tracking-widest uppercase hover:bg-white hover:text-black transition-all duration-200"
            >
              Start Building
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
            <Link
              href="/demo"
              className="group flex items-center gap-3 px-8 py-4 border border-violet-500/50 text-violet-300 font-mono text-sm tracking-widest uppercase hover:border-violet-400 hover:text-violet-200 transition-all duration-200"
            >
              How It Works
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>

        </div>
      </section>

      {/* ── Features ── */}
      <section className="relative z-10 border-t border-white/[0.07] py-28 px-6" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <p className="font-mono text-[11px] text-violet-500 tracking-[0.25em] uppercase mb-4">
              Protocol Features
            </p>
            <h2 className="font-display font-extrabold uppercase text-4xl md:text-5xl leading-tight">
              <span style={{ color: 'transparent', WebkitTextStroke: '1px rgba(167,139,250,0.6)' }}>
                What StarkPayHub
              </span>
              <br />
              <span className="text-white">Unlocks for Builders</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/[0.05]">
            {features.map((f) => (
              <div
                key={f.title}
                className="group p-10 bg-black hover:bg-violet-950/20 transition-colors duration-300"
              >
                <div className="text-3xl mb-6 opacity-30 group-hover:opacity-70 transition-opacity font-mono text-violet-400">
                  {f.icon}
                </div>
                <h3 className="font-display font-bold uppercase text-lg text-white mb-3 tracking-wide">
                  {f.title}
                </h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="relative z-10 border-t border-white/[0.07] py-28 px-6" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="font-mono text-[11px] text-violet-500 tracking-[0.25em] uppercase mb-4">
              How It Works
            </p>
            <h2 className="font-display font-extrabold uppercase text-4xl md:text-5xl text-white">
              Three Steps to On-Chain Subscriptions
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/[0.05]">
            {steps.map((s) => (
              <div key={s.n} className="group p-10 bg-black hover:bg-violet-950/20 transition-colors duration-300">
                <div className="font-mono text-5xl font-bold text-violet-900 mb-6 group-hover:text-violet-700 transition-colors">
                  {s.n}
                </div>
                <h3 className="font-display font-bold uppercase text-lg text-white mb-3 tracking-wide">
                  {s.title}
                </h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative z-10 border-t border-white/[0.07] py-32 px-6" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}>
        <div className="max-w-4xl mx-auto text-center space-y-10">
          <h2 className="font-display font-extrabold uppercase leading-tight text-5xl md:text-6xl">
            <span style={{ color: 'transparent', WebkitTextStroke: '1px rgba(167,139,250,0.7)' }}>
              Ready
            </span>
            {' '}
            <span className="text-white">to Build?</span>
          </h2>
          <p className="text-zinc-400 text-lg max-w-lg mx-auto leading-relaxed">
            Contracts on Sepolia. SDK ready. Keeper included.
            <br />
            Get your Web3 subscription protocol live in minutes.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/pricing"
              className="group flex items-center gap-3 px-10 py-4 border border-white text-white font-mono text-sm tracking-widest uppercase hover:bg-white hover:text-black transition-all duration-200"
            >
              Start with Contracts <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
            <a
              href="https://github.com"
              className="group flex items-center gap-3 px-10 py-4 border border-zinc-700 text-zinc-400 font-mono text-sm tracking-widest uppercase hover:border-zinc-500 hover:text-zinc-200 transition-all duration-200"
            >
              Read the Docs <span className="group-hover:translate-x-1 transition-transform">→</span>
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-white/[0.07] px-6 py-8" style={{ background: 'rgba(0,0,0,0.9)' }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-mono text-sm font-bold text-white/30 tracking-widest">
            STARKPAYHUB
          </span>
          <span className="text-xs text-zinc-700 font-mono">
            © 2026 StarkPayHub — Built for Starknet Hackathon
          </span>
          <div className="flex gap-8">
            {["GitHub", "Docs", "Voyager"].map((l) => (
              <a key={l} href="#" className="text-xs text-zinc-700 hover:text-zinc-400 transition-colors font-mono tracking-wider uppercase">
                {l}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
