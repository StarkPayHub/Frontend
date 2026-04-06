import { Navbar } from "@/components/Navbar";
import { DemoBackground } from "@/components/DemoBackground";
import Link from "next/link";

const glass = {
  background: 'rgba(255,255,255,0.03)',
  backdropFilter: 'blur(24px) saturate(180%)',
  WebkitBackdropFilter: 'blur(24px) saturate(180%)',
  border: '1px solid rgba(255,255,255,0.07)',
} as React.CSSProperties;

const glassCard = {
  ...glass,
  borderRadius: 20,
} as React.CSSProperties;

export default function DemoPage() {
  return (
    <div className="relative text-white" style={{ background: '#02020a' }}>
      <DemoBackground />

      <div className="relative" style={{ zIndex: 10 }}>
        <Navbar />

        {/* ── Hero ── */}
        <section className="flex flex-col items-center justify-center text-center px-6 pt-28 pb-16 min-h-[72vh]">
          <p className="font-mono text-[11px] tracking-[0.22em] uppercase mb-6 px-4 py-1.5 rounded-full inline-block"
            style={{ color: '#c4b5fd', background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.25)' }}>
            Live on Starknet Sepolia
          </p>

          <h1
            className="font-display font-extrabold leading-[0.9] tracking-tight mb-5"
            style={{ fontSize: 'clamp(2rem,4.5vw,3.5rem)' }}
          >
            <span className="block text-white" style={{ textShadow: '0 0 60px rgba(139,92,246,0.4)' }}>
              One Signature.
            </span>
            <span className="block" style={{ color: '#a78bfa', textShadow: '0 0 80px rgba(109,40,217,0.5)' }}>
              Forever.
            </span>
          </h1>

          <p className="text-sm max-w-md leading-relaxed mb-8" style={{ color: 'rgba(228,228,231,0.7)' }}>
            StarkPayHub eliminates the friction of Web3 subscriptions entirely.
            Sign once — every renewal happens automatically, on-chain, forever.
          </p>

          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/pricing"
              className="group flex items-center gap-2 px-8 py-3 font-semibold text-sm tracking-wide transition-all"
              style={{
                background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                borderRadius: 12,
                boxShadow: '0 0 32px rgba(124,58,237,0.3), inset 0 1px 0 rgba(255,255,255,0.12)',
                color: '#fff',
              }}
            >
              Start Free Trial
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
            <Link
              href="/dashboard"
              className="group flex items-center gap-2 px-8 py-3 font-medium text-sm tracking-wide transition-all text-zinc-300 hover:text-white"
              style={{ ...glass, borderRadius: 12 }}
            >
              View Dashboard
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
        </section>

        {/* ── Key numbers ── */}
        <section className="py-6 px-6">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { num: '1×',    label: 'Transaction to subscribe', sub: 'Approve + subscribe in a single multicall' },
              { num: '0 ETH', label: 'Required for gas',         sub: 'AVNU Paymaster: pay everything in USDC'   },
              { num: '∞',     label: 'Auto-renewals',            sub: 'Keeper bot runs on-chain forever'          },
            ].map((s) => (
              <div key={s.num} className="flex flex-col items-center text-center px-6 py-7 gap-2" style={glassCard}>
                <span style={{
                  fontFamily: "ui-monospace, 'SF Mono', monospace",
                  fontWeight: 700,
                  fontSize: '2rem',
                  lineHeight: 1,
                  letterSpacing: '-0.02em',
                  color: '#a78bfa',
                  textShadow: '0 0 28px rgba(167,139,250,0.35)',
                }}>
                  {s.num}
                </span>
                <p className="text-white font-semibold text-sm leading-snug">{s.label}</p>
                <p className="text-zinc-500 text-xs leading-relaxed max-w-[200px]">{s.sub}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Benefits ── */}
        <section className="py-20 px-6">
          <div className="max-w-3xl mx-auto">

            <div className="text-center mb-12">
              <p className="font-mono text-[11px] text-violet-400 tracking-[0.28em] uppercase mb-3">
                Why StarkPayHub
              </p>
              <h2
                className="font-display font-extrabold text-white leading-tight"
                style={{ fontSize: 'clamp(1.5rem,2.8vw,2.2rem)' }}
              >
                Everything you hated about Web3 payments.{' '}
                <span style={{ color: '#a78bfa' }}>Gone.</span>
              </h2>
            </div>

            <div className="space-y-0">
              {[
                {
                  icon: (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(167,139,250,0.9)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                  ),
                  headline: 'Sign once. Renew forever.',
                  sub: 'Session keys mean your users never sign again. Every monthly renewal happens silently, automatically, on-chain.',
                  before: 'Previously: manual signature required for every single renewal transaction.',
                },
                {
                  icon: (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(167,139,250,0.9)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11.412 15.655 9.75 21.75l3.745-4.012M9.257 13.5H3.75l2.659-2.849m2.048-2.194L14.25 2.25 12 10.5h8.25l-4.707 5.043M6.75 15.75 4.5 21l4.5-2.25" />
                    </svg>
                  ),
                  headline: 'Zero ETH required.',
                  sub: 'AVNU Paymaster covers all gas fees. Your users pay for subscriptions in USDC — that\'s it.',
                  before: 'Previously: users needed ETH just to pay gas, creating constant friction.',
                },
                {
                  icon: (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(167,139,250,0.9)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672ZM12 2.25V4.5m5.834.166-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243-1.59-1.59" />
                    </svg>
                  ),
                  headline: 'One click. Not two.',
                  sub: 'Approve and subscribe in a single multicall transaction. One confirmation dialog, one tap, done.',
                  before: 'Previously: approve transaction, then subscribe transaction — two separate confirmations.',
                },
                {
                  icon: (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(167,139,250,0.9)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25H6.75A2.25 2.25 0 0 0 4.5 6.75v10.5a2.25 2.25 0 0 0 2.25 2.25Zm.75-12h9v9h-9v-9Z" />
                    </svg>
                  ),
                  headline: 'Runs itself. Forever.',
                  sub: 'Keeper bot watches every subscription and calls execute_renewal() at each period end. No human needed.',
                  before: 'Previously: no on-chain automation existed. Merchants chased payments manually.',
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="group py-8"
                  style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <div className="flex items-start gap-6">
                    {/* Icon */}
                    <div
                      className="flex-shrink-0 w-11 h-11 flex items-center justify-center"
                      style={{
                        background: 'rgba(139,92,246,0.08)',
                        border: '1px solid rgba(139,92,246,0.15)',
                        borderRadius: 12,
                      }}
                    >
                      {item.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-2">
                      <h3
                        className="font-display font-bold text-white leading-snug"
                        style={{ fontSize: 'clamp(1rem,1.8vw,1.2rem)' }}
                      >
                        {item.headline}
                      </h3>
                      <p className="text-sm leading-relaxed" style={{ color: 'rgba(228,228,231,0.6)' }}>
                        {item.sub}
                      </p>
                      <p className="text-xs font-mono" style={{ color: 'rgba(161,161,170,0.3)' }}>
                        {item.before}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* ── Wallet product shot ── */}
        <section className="py-20 px-6">
          <div className="max-w-5xl mx-auto">

            <div className="text-center mb-12">
              <p className="font-mono text-[11px] text-violet-400 tracking-[0.28em] uppercase mb-3">
                The Experience
              </p>
              <h2 className="font-display font-extrabold text-white leading-tight" style={{ fontSize: 'clamp(1.8rem,3.5vw,3rem)' }}>
                One tap.{' '}
                <span style={{ color: '#a78bfa' }}>That's the whole process.</span>
              </h2>
              <p className="mt-3 max-w-sm mx-auto text-sm leading-relaxed" style={{ color: 'rgba(161,161,170,0.65)' }}>
                Two calls bundled in one transaction. Confirm once — never sign again.
              </p>
            </div>

            {/* Phone-style frame */}
            <div className="max-w-[340px] mx-auto">

              <div style={{
                padding: 1,
                borderRadius: 32,
                background: 'linear-gradient(160deg, rgba(139,92,246,0.4) 0%, rgba(67,56,202,0.15) 50%, rgba(139,92,246,0.1) 100%)',
                boxShadow: '0 0 80px rgba(109,40,217,0.2), 0 40px 80px rgba(0,0,0,0.6)',
              }}>
                <div style={{
                  background: 'rgba(8,6,22,0.97)',
                  borderRadius: 31,
                  overflow: 'hidden',
                }}>

                  {/* Status bar */}
                  <div className="px-6 pt-4 pb-0 flex items-center justify-between">
                    <span className="text-[11px] text-white/40 font-medium">9:41</span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3.5 h-2 rounded-sm border border-white/20 flex items-center px-0.5">
                        <div className="w-2 h-1 rounded-sm bg-white/40" />
                      </div>
                    </div>
                  </div>

                  {/* App header */}
                  <div className="px-6 pt-4 pb-4 flex items-center justify-between"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold"
                        style={{ background: 'linear-gradient(145deg, #7c3aed, #4338ca)', boxShadow: '0 4px 12px rgba(124,58,237,0.4)' }}>
                        A
                      </div>
                      <div>
                        <p className="text-white text-[14px] font-semibold leading-tight">Argent X</p>
                        <p className="text-zinc-600 text-[11px] font-mono mt-0.5">0x4f2a...e91c</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                      style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.18)' }}>
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" style={{ boxShadow: '0 0 6px rgba(52,211,153,0.8)' }} />
                      <span className="text-emerald-400 text-[11px] font-medium">Sepolia</span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="px-6 py-5 space-y-4">
                    <p className="text-center text-[10px] tracking-[0.2em] uppercase"
                      style={{ color: 'rgba(161,161,170,0.5)' }}>
                      Confirm Transaction
                    </p>

                    <div className="space-y-0 rounded-xl overflow-hidden"
                      style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                      {[
                        { label: 'Approve', value: '$49.00 USDC', sub: 'ERC-20 allowance', green: false },
                        { label: 'Subscribe', value: 'Pro Plan', sub: 'Plan #1 · Monthly', green: false },
                        { label: 'Gas fee', value: 'Free', sub: 'Paid by AVNU Paymaster', green: true },
                      ].map((row, i) => (
                        <div key={row.label}
                          className="flex items-center justify-between px-4 py-3"
                          style={{
                            background: row.green ? 'rgba(52,211,153,0.04)' : 'rgba(255,255,255,0.02)',
                            borderTop: i > 0 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                          }}>
                          <div>
                            <p className="text-white text-[13px] font-medium">{row.label}</p>
                            <p className="text-[11px] mt-0.5" style={{ color: 'rgba(161,161,170,0.5)' }}>{row.sub}</p>
                          </div>
                          <p className={`text-[14px] font-semibold ${row.green ? 'text-emerald-400' : 'text-white'}`}>
                            {row.value}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between px-1">
                      <span className="text-zinc-500 text-xs">Total charged</span>
                      <span className="text-white text-base font-bold">$49.00</span>
                    </div>

                    <div className="space-y-2 pt-0.5">
                      <button className="w-full h-12 text-[14px] font-semibold text-white transition-all"
                        style={{
                          background: 'linear-gradient(135deg, #7c3aed, #4338ca)',
                          borderRadius: 14,
                          boxShadow: '0 6px 24px rgba(124,58,237,0.35), inset 0 1px 0 rgba(255,255,255,0.12)',
                        }}>
                        Confirm & Subscribe
                      </button>
                      <button className="w-full h-10 text-[13px] font-medium transition-colors"
                        style={{ color: 'rgba(161,161,170,0.5)', background: 'transparent' }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Connector */}
              <div className="flex flex-col items-center py-4">
                <div className="w-px h-8 bg-gradient-to-b from-violet-500/30 to-transparent" />
                <div className="w-5 h-5 rounded-full flex items-center justify-center mt-1"
                  style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.2)' }}>
                  <span className="text-violet-400 text-[10px]">↓</span>
                </div>
              </div>

              {/* Success card */}
              <div style={{
                padding: 1,
                borderRadius: 24,
                background: 'linear-gradient(160deg, rgba(52,211,153,0.3) 0%, rgba(52,211,153,0.05) 100%)',
                boxShadow: '0 0 40px rgba(16,185,129,0.08)',
              }}>
                <div className="text-center py-7 px-6 space-y-4"
                  style={{ background: 'rgba(4,18,12,0.95)', borderRadius: 23 }}>

                  <div className="relative mx-auto w-14 h-14">
                    <div className="absolute inset-0 rounded-full"
                      style={{ background: 'rgba(52,211,153,0.1)', boxShadow: '0 0 32px rgba(52,211,153,0.2)' }} />
                    <div className="absolute inset-0 rounded-full flex items-center justify-center"
                      style={{ border: '1.5px solid rgba(52,211,153,0.3)' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M5 13l4 4L19 7" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] tracking-[0.2em] uppercase mb-1.5"
                      style={{ color: 'rgba(52,211,153,0.6)' }}>Active</p>
                    <h3 className="font-display font-bold text-white text-xl">Subscription Active</h3>
                    <p className="mt-1.5 text-xs" style={{ color: 'rgba(161,161,170,0.55)' }}>
                      Pro Plan · renews May 2, 2026
                    </p>
                  </div>

                  <a href="#"
                    className="inline-flex items-center gap-2 text-[11px] font-mono"
                    style={{ color: 'rgba(161,161,170,0.3)' }}>
                    ↗ 0x4f2a...e91c · Voyager
                  </a>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── How it works ── */}
        <section className="py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <p className="font-mono text-[11px] text-violet-400 tracking-[0.28em] uppercase mb-3">
                Developer Flow
              </p>
              <h2 className="font-display font-extrabold text-white leading-tight" style={{ fontSize: 'clamp(1.5rem,2.8vw,2.2rem)' }}>
                Live in minutes, <span style={{ color: '#a78bfa' }}>not days.</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { n: '01', title: 'Install the SDK', code: 'pnpm add @starkpay/sdk', desc: 'One package. React hooks, wallet connect, and multicall builder all included.' },
                { n: '02', title: 'Add SubscribeButton', code: '<SubscribeButton planId={1} />', desc: 'Drop in our pre-built component. Handles approve + subscribe + error states automatically.' },
                { n: '03', title: 'Collect Revenue', code: 'withdraw() → your wallet', desc: 'Merchant dashboard shows real-time revenue. Withdraw anytime with zero lock-up.' },
              ].map((s) => (
                <div key={s.n} className="p-7 space-y-4" style={glassCard}>
                  <span className="font-display font-extrabold text-4xl" style={{ color: 'rgba(109,40,217,0.35)', lineHeight: 1 }}>
                    {s.n}
                  </span>
                  <div className="space-y-2.5">
                    <h3 className="font-display font-bold text-lg text-white">{s.title}</h3>
                    <code
                      className="block text-xs font-mono text-violet-300 px-3 py-2"
                      style={{ background: 'rgba(109,40,217,0.12)', border: '1px solid rgba(139,92,246,0.15)', borderRadius: 8 }}
                    >
                      {s.code}
                    </code>
                    <p className="text-sm text-zinc-500 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className="py-20 px-6 text-center">
          <div className="max-w-2xl mx-auto space-y-5">
            <h2 className="font-display font-extrabold text-white leading-tight" style={{ fontSize: 'clamp(1.6rem,3vw,2.5rem)' }}>
              Ready to ship?
            </h2>
            <p className="text-zinc-400 text-sm leading-relaxed max-w-md mx-auto">
              Contracts deployed. SDK published. Keeper running.
              Everything is ready — you just need to build.
            </p>
            <div className="flex flex-wrap gap-3 justify-center pt-2">
              <Link
                href="/pricing"
                className="group flex items-center gap-2 px-10 py-3.5 font-semibold text-sm tracking-wide transition-all text-white"
                style={{
                  background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                  borderRadius: 12,
                  boxShadow: '0 0 40px rgba(124,58,237,0.3), inset 0 1px 0 rgba(255,255,255,0.12)',
                }}
              >
                Start Building
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
              <Link
                href="/dashboard"
                className="group flex items-center gap-2 px-10 py-3.5 font-medium text-sm tracking-wide text-zinc-300 hover:text-white transition-all"
                style={{ ...glass, borderRadius: 12 }}
              >
                Open Dashboard
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
