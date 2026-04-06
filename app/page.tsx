"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { MatrixBackground } from "@/components/MatrixBackground";

/* ─────────────────────────────────────────────
   Single IntersectionObserver for all sections
   Add data-reveal (+ optional data-delay="ms")
   to any element to opt in.
───────────────────────────────────────────── */
function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>("[data-reveal]");
    // track pending timers so we can cancel on scroll-back-up
    const timers = new Map<HTMLElement, ReturnType<typeof setTimeout>>();

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target as HTMLElement;
          const delay = Number(el.dataset.delay ?? "0");

          if (entry.isIntersecting) {
            // entering viewport → show after delay
            const t = setTimeout(() => el.classList.add("is-visible"), delay);
            timers.set(el, t);
          } else {
            // leaving viewport (scroll back up) → cancel pending, hide again
            const pending = timers.get(el);
            if (pending !== undefined) {
              clearTimeout(pending);
              timers.delete(el);
            }
            el.classList.remove("is-visible");
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );

    els.forEach((el) => obs.observe(el));
    return () => { obs.disconnect(); timers.forEach(clearTimeout); };
  }, []);
}

/* ── data ── */
/* ── SF-quality SVG icons (Heroicons 2.0 outline) ── */
const FeatureIcons = {
  // PencilSquare — "sign once on a document"
  sign: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.862 4.487zm0 0L19.5 7.125" />
      <path d="M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
    </svg>
  ),
  // BoltSlash — "no gas / gasless"
  gasless: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11.412 15.655 9.75 21.75l3.745-4.012M9.257 13.5H3.75l2.659-2.849m2.048-2.194L14.25 2.25 12 10.5h8.25l-4.707 5.043M6.75 15.75 4.5 21l4.5-2.25" />
    </svg>
  ),
  // ArrowPath — "cycle / auto-renew"
  renew: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  ),
  // Banknotes — "instant withdrawal / money out"
  withdraw: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
    </svg>
  ),
};

const features = [
  { title: "One-Time Sign",       desc: "Sign once, subscribe forever. Session keys eliminate repeated approval dialogs for seamless renewals.", icon: FeatureIcons.sign     },
  { title: "Gasless Payments",    desc: "Pay subscription fees in USDC. Zero ETH required — AVNU paymaster covers all gas costs invisibly.",    icon: FeatureIcons.gasless  },
  { title: "Auto-Renewal Engine", desc: "Subscriptions renew automatically on-chain. Keeper bot triggers execute_renewal() at period end.",     icon: FeatureIcons.renew    },
  { title: "Instant Withdrawals", desc: "Merchants withdraw earned USDC anytime. No lock-up, no middlemen — full custody of your revenue.",     icon: FeatureIcons.withdraw },
];

const steps = [
  { n: "01", title: "Create a Plan",      desc: "Merchant deploys a subscription plan on-chain — set price, interval, and plan name." },
  { n: "02", title: "Subscribe Once",     desc: "User approves USDC and subscribes in a single multicall. One signature — never sign again." },
  { n: "03", title: "Auto-Renew Forever", desc: "Keeper bot calls execute_renewal() at each period end. Contract handles everything automatically." },
];

/* ── gradient divider ── */
function FlowDivider() {
  return (
    <div style={{ position: "relative", height: 1, overflow: "visible" }}>
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(90deg, transparent 0%, rgba(139,92,246,0.6) 30%, rgba(196,181,253,0.9) 50%, rgba(139,92,246,0.6) 70%, transparent 100%)",
        animation: "divider-pulse 4s ease-in-out infinite",
      }} />
      {/* center dot */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%,-50%)",
        width: 6, height: 6, borderRadius: "50%",
        background: "#c4b5fd",
        boxShadow: "0 0 12px rgba(196,181,253,0.9)",
        animation: "dot-breathe 4s ease-in-out infinite",
      }} />
    </div>
  );
}

export default function Home() {
  useScrollReveal();

  return (
    <>
      <div className="relative text-white" style={{ background: "#000" }}>
        <MatrixBackground />
        <Navbar />

        {/* ══════ HERO ══════ */}
        <section className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-24 pb-32 min-h-screen">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden>
            <div className="w-[800px] h-[600px] rounded-full bg-violet-900/20 blur-[140px]" />
          </div>

          <div className="relative flex flex-col items-center gap-8 max-w-5xl w-full">
            <p className="font-mono text-[12px] tracking-[0.22em] uppercase px-4 py-2 rounded-full inline-block"
              style={{ color: "#c4b5fd", background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.25)" }}>
              Built on Starknet · Account Abstraction
            </p>

            <h1 className="font-display font-extrabold uppercase leading-[0.92] tracking-tight drop-shadow-2xl">
              <span className="block text-[clamp(1.8rem,4.5vw,4.5rem)]"
                style={{ color: "#fff", textShadow: "0 0 40px rgba(167,139,250,0.9), 0 2px 8px rgba(0,0,0,0.9)" }}>
                The Subscription
              </span>
              <span className="block text-[clamp(1.8rem,4.5vw,4.5rem)]"
                style={{ color: "#c4b5fd", textShadow: "0 0 60px rgba(124,58,237,0.8), 0 2px 8px rgba(0,0,0,0.9)" }}>
                Protocol for Web3
              </span>
            </h1>

            <p className="max-w-md leading-relaxed text-center"
              style={{ fontSize: "1.05rem", color: "rgba(196,181,253,0.7)", fontWeight: 400 }}>
              Sign once.{" "}
              <span style={{ color: "#c4b5fd", fontWeight: 600 }}>Auto-renew forever.</span>
              <br />
              No repeated approvals, no friction —{" "}
              <span style={{ color: "rgba(255,255,255,0.85)" }}>pure on-chain SaaS.</span>
            </p>

            <div className="flex flex-col items-center gap-3 mt-2">
              <Link href="/dashboard" className="cta-pill"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 10,
                  padding: "14px 36px", borderRadius: 999,
                  background: "linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)",
                  color: "#fff", fontFamily: "'Syne', sans-serif",
                  fontSize: "0.95rem", fontWeight: 600, textDecoration: "none",
                }}>
                Start Building →
              </Link>
              <Link href="/demo"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  color: "rgba(167,139,250,0.7)", fontFamily: "'Syne', sans-serif",
                  fontSize: "0.88rem", fontWeight: 500,
                  textDecoration: "underline", textDecorationColor: "rgba(139,92,246,0.35)",
                  textUnderlineOffset: 4, transition: "color 0.2s",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#c4b5fd"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(167,139,250,0.7)"; }}
              >
                How It Works →
              </Link>
            </div>
          </div>
        </section>

        <FlowDivider />

        {/* ══════ FEATURES ══════ */}
        <section className="relative z-10 py-28 px-6" style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(6px)" }}>
          <div className="max-w-6xl mx-auto">

            {/* heading */}
            <div className="mb-16" data-reveal="scale" data-delay="0">
              <p className="font-mono text-[11px] text-violet-500 tracking-[0.25em] uppercase mb-4">
                Protocol Features
              </p>
              <h2 className="font-display font-extrabold uppercase text-4xl md:text-5xl leading-tight">
                <span style={{ color: "transparent", WebkitTextStroke: "1px rgba(167,139,250,0.55)" }}>
                  What StarkPayHub
                </span>
                <br />
                <span className="text-white">Unlocks for Builders</span>
              </h2>
            </div>

            {/* cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px" style={{ background: "rgba(255,255,255,0.04)" }}>
              {features.map((f, i) => (
                <div
                  key={f.title}
                  data-reveal="card"
                  data-delay={i * 130}
                  className="feat-card p-10"
                  style={{ background: "#000" }}
                >
                  <div
                    className="feat-icon mb-7"
                    style={{
                      color: "rgba(139,92,246,0.55)",
                      width: 44, height: 44,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: "rgba(109,40,217,0.1)",
                      borderRadius: 10,
                      border: "1px solid rgba(139,92,246,0.18)",
                    }}
                  >
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

        <FlowDivider />

        {/* ══════ HOW IT WORKS ══════ */}
        <section className="relative z-10 py-28 px-6 overflow-hidden" style={{ background: "rgba(2,1,8,0.92)", backdropFilter: "blur(8px)" }}>
          <div className="max-w-6xl mx-auto">

            {/* heading */}
            <div className="text-center mb-20" data-reveal data-delay="0">
              <p className="font-mono text-[11px] text-violet-500 tracking-[0.25em] uppercase mb-4">
                How It Works
              </p>
              <h2 className="font-display font-extrabold uppercase text-4xl md:text-5xl text-white">
                Three Steps to On-Chain Subscriptions
              </h2>
            </div>

            {/* steps — card layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {steps.map((s, i) => (
                <div
                  key={s.n}
                  data-reveal="card"
                  data-delay={i * 150}
                  className="feat-card"
                  style={{
                    background: "rgba(20,12,48,0.85)",
                    border: "1px solid rgba(139,92,246,0.35)",
                    borderRadius: 16,
                    padding: "32px 28px",
                    position: "relative",
                    overflow: "hidden",
                    boxShadow: "0 0 0 1px rgba(109,40,217,0.08), 0 8px 32px rgba(0,0,0,0.4)",
                  }}
                >
                  {/* step number badge — top right, large ghost */}
                  <div style={{
                    position: "absolute", top: 16, right: 20,
                    fontFamily: "'Syne', sans-serif",
                    fontWeight: 800,
                    fontSize: "4.5rem",
                    lineHeight: 1,
                    color: "transparent",
                    WebkitTextStroke: "1px rgba(109,40,217,0.2)",
                    letterSpacing: "-0.05em",
                    userSelect: "none",
                    pointerEvents: "none",
                  }}>
                    {s.n}
                  </div>

                  {/* numbered pill badge — clear, filled */}
                  <div style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "5px 12px",
                    borderRadius: 999,
                    background: "rgba(109,40,217,0.2)",
                    border: "1px solid rgba(139,92,246,0.35)",
                    marginBottom: 24,
                  }}>
                    <div style={{
                      width: 6, height: 6, borderRadius: "50%",
                      background: "#a78bfa",
                      boxShadow: "0 0 8px rgba(167,139,250,0.8)",
                      animation: `dot-breathe ${2.5 + i * 0.4}s ease-in-out infinite`,
                    }} />
                    <span style={{
                      fontFamily: "monospace",
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#c4b5fd",
                      letterSpacing: "0.12em",
                    }}>
                      STEP {s.n}
                    </span>
                  </div>

                  {/* connector arrow (except last) */}
                  {i < 2 && (
                    <div className="hidden md:block" style={{
                      position: "absolute",
                      right: -18,
                      top: "50%",
                      transform: "translateY(-50%)",
                      zIndex: 10,
                      color: "rgba(139,92,246,0.5)",
                      fontSize: 20,
                      fontWeight: 300,
                    }}>
                      ›
                    </div>
                  )}

                  <h3 style={{
                    fontFamily: "'Syne', sans-serif",
                    fontWeight: 700,
                    fontSize: 17,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: "#fff",
                    marginBottom: 12,
                  }}>
                    {s.title}
                  </h3>
                  <p style={{
                    fontSize: 13.5,
                    color: "rgba(161,161,170,0.7)",
                    lineHeight: 1.65,
                  }}>
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <FlowDivider />

        {/* ══════ CTA ══════ */}
        <section className="relative z-10 py-32 px-6 overflow-hidden" style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(6px)" }}>
          {/* ambient glow */}
          <div aria-hidden style={{
            position: "absolute", inset: 0,
            background: "radial-gradient(ellipse at 50% 60%, rgba(109,40,217,0.14) 0%, transparent 65%)",
            pointerEvents: "none",
          }} />

          <div className="max-w-4xl mx-auto text-center relative z-10">
            <div data-reveal data-delay="0">
              <h2 className="font-display font-extrabold uppercase leading-tight text-5xl md:text-6xl mb-6">
                <span style={{ color: "transparent", WebkitTextStroke: "1px rgba(167,139,250,0.65)" }}>
                  Ready
                </span>
                {" "}
                <span className="text-white">to Build?</span>
              </h2>
              <p className="text-zinc-400 text-lg max-w-lg mx-auto leading-relaxed mb-10">
                Contracts on Sepolia. SDK ready. Keeper included.
                <br />
                Get your Web3 subscription protocol live in minutes.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4" data-reveal data-delay="150">
              <Link href="/pricing" className="cta-pill"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 10,
                  padding: "15px 38px", borderRadius: 999,
                  background: "linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)",
                  color: "#fff", fontFamily: "'Syne', sans-serif",
                  fontSize: "0.95rem", fontWeight: 600, textDecoration: "none",
                }}>
                Start with Contracts →
              </Link>
              <a href="https://github.com"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "14px 32px", borderRadius: 999,
                  background: "transparent",
                  border: "1px solid rgba(139,92,246,0.25)",
                  color: "rgba(167,139,250,0.7)",
                  fontFamily: "'Syne', sans-serif",
                  fontSize: "0.9rem", fontWeight: 500,
                  textDecoration: "none",
                  transition: "border-color 0.2s, color 0.2s, background 0.2s",
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = "rgba(139,92,246,0.55)";
                  el.style.color = "#c4b5fd";
                  el.style.background = "rgba(139,92,246,0.08)";
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = "rgba(139,92,246,0.25)";
                  el.style.color = "rgba(167,139,250,0.7)";
                  el.style.background = "transparent";
                }}
              >
                Read the Docs →
              </a>
            </div>
          </div>
        </section>

        <FlowDivider />

        {/* ══════ FOOTER ══════ */}
        <footer className="relative z-10 px-6 py-8" style={{ background: "rgba(0,0,0,0.95)" }}>
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4"
            data-reveal="none" data-delay="0">
            <span className="font-mono text-sm font-bold tracking-widest" style={{ color: "rgba(255,255,255,0.2)" }}>
              STARKPAYHUB
            </span>
            <span className="text-xs font-mono" style={{ color: "rgba(63,63,70,0.9)" }}>
              © 2026 StarkPayHub — Built for Starknet Hackathon
            </span>
            <div className="flex gap-8">
              {["GitHub", "Docs", "Voyager"].map((l) => (
                <a key={l} href="#"
                  className="text-xs font-mono tracking-wider uppercase transition-colors"
                  style={{ color: "rgba(63,63,70,0.9)" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "rgba(167,139,250,0.7)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(63,63,70,0.9)"; }}
                >
                  {l}
                </a>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
