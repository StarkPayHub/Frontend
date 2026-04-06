'use client';

import { useEffect, useRef } from 'react';

export function DemoBackground() {
  const orbRefs = useRef<(HTMLDivElement | null)[]>([null, null, null, null, null]);

  useEffect(() => {
    let raf: number;

    function update() {
      const scrollMax = document.documentElement.scrollHeight - window.innerHeight;
      const p = scrollMax > 0 ? Math.min(window.scrollY / scrollMax, 1) : 0;

      // Each orb follows its own opacity curve across the scroll range (p: 0→1)
      const opacities = [
        // 0: large purple top-left — dominant at top, fades as you scroll
        1 - p * 0.85,
        // 1: indigo top-right — rises then falls (peaks at ~40%)
        0.2 + Math.sin(p * Math.PI * 0.9) * 0.7,
        // 2: violet center — mid-scroll bloom (peaks at ~50%)
        Math.max(0, Math.sin(p * Math.PI * 1.1 - 0.2) * 0.75),
        // 3: blue bottom-right — grows steadily with scroll
        Math.min(1, p * 1.1),
        // 4: teal bottom-left — only visible in the lower half
        Math.max(0, (p - 0.45) * 1.6) * 0.8,
      ];

      orbRefs.current.forEach((el, i) => {
        if (el) el.style.opacity = String(Math.max(0, Math.min(1, opacities[i])).toFixed(3));
      });
    }

    function onScroll() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0, contain: 'strict' }}>

      {/* ── Keyframe drift animations ── */}
      <style>{`
        @keyframes drift-a {
          0%, 100% { transform: translate(0px,   0px);  }
          30%       { transform: translate(50px,  35px); }
          70%       { transform: translate(-30px, 20px); }
        }
        @keyframes drift-b {
          0%, 100% { transform: translate(0px,   0px);  }
          25%       { transform: translate(-40px, 30px); }
          60%       { transform: translate(25px, -35px); }
        }
        @keyframes drift-c {
          0%, 100% { transform: translate(0px,   0px);  }
          50%       { transform: translate(-25px,-40px); }
        }
        @keyframes drift-d {
          0%, 100% { transform: translate(0px,  0px);  }
          40%       { transform: translate(35px, 25px); }
          75%       { transform: translate(-20px,30px); }
        }
        .orb-drift-a { animation: drift-a 18s ease-in-out infinite; }
        .orb-drift-b { animation: drift-b 22s ease-in-out infinite; }
        .orb-drift-c { animation: drift-c 14s ease-in-out infinite; }
        .orb-drift-d { animation: drift-d 20s ease-in-out infinite; }
      `}</style>

      {/* Base dark */}
      <div className="absolute inset-0" style={{ background: '#02020a' }} />

      {/* ── Orb 0: Purple — top-left. Full at top, fades on scroll ── */}
      <div
        ref={el => { orbRefs.current[0] = el; }}
        className="absolute rounded-full orb-drift-a"
        style={{
          width: 1000, height: 1000,
          top: '-25%', left: '-20%',
          background: 'radial-gradient(circle, rgba(109,40,217,0.45) 0%, transparent 68%)',
          filter: 'blur(80px)',
          transition: 'opacity 0.65s ease',
          willChange: 'opacity',
        }}
      />

      {/* ── Orb 1: Indigo — top-right. Rises then falls ── */}
      <div
        ref={el => { orbRefs.current[1] = el; }}
        className="absolute rounded-full orb-drift-b"
        style={{
          width: 900, height: 900,
          top: '-15%', right: '-18%',
          background: 'radial-gradient(circle, rgba(67,56,202,0.4) 0%, transparent 68%)',
          filter: 'blur(90px)',
          transition: 'opacity 0.65s ease',
          opacity: 0.2,
          willChange: 'opacity',
        }}
      />

      {/* ── Orb 2: Violet — center. Mid-scroll bloom ── */}
      <div
        ref={el => { orbRefs.current[2] = el; }}
        className="absolute rounded-full orb-drift-c"
        style={{
          width: 800, height: 800,
          top: '32%', left: '18%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 68%)',
          filter: 'blur(100px)',
          transition: 'opacity 0.65s ease',
          opacity: 0,
          willChange: 'opacity',
        }}
      />

      {/* ── Orb 3: Blue — bottom-right. Grows with scroll ── */}
      <div
        ref={el => { orbRefs.current[3] = el; }}
        className="absolute rounded-full orb-drift-d"
        style={{
          width: 900, height: 900,
          bottom: '-18%', right: '-5%',
          background: 'radial-gradient(circle, rgba(37,99,235,0.4) 0%, transparent 68%)',
          filter: 'blur(85px)',
          transition: 'opacity 0.65s ease',
          opacity: 0,
          willChange: 'opacity',
        }}
      />

      {/* ── Orb 4: Teal — bottom-left. Only late scroll ── */}
      <div
        ref={el => { orbRefs.current[4] = el; }}
        className="absolute rounded-full orb-drift-b"
        style={{
          width: 650, height: 650,
          bottom: '8%', left: '-8%',
          background: 'radial-gradient(circle, rgba(20,184,166,0.32) 0%, transparent 68%)',
          filter: 'blur(80px)',
          transition: 'opacity 0.65s ease',
          opacity: 0,
          willChange: 'opacity',
        }}
      />

      {/* ── Static top light ray ── */}
      <div className="absolute" style={{
        top: 0, left: '50%',
        transform: 'translateX(-50%)',
        width: 700, height: 320,
        background: 'radial-gradient(ellipse at top, rgba(139,92,246,0.13) 0%, transparent 70%)',
        filter: 'blur(40px)',
      }} />

      {/* ── Faint grid ── */}
      <div className="absolute inset-0" style={{
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)
        `,
        backgroundSize: '80px 80px',
      }} />

      {/* ── Bottom fade ── */}
      <div className="absolute bottom-0 left-0 right-0" style={{
        height: '25%',
        background: 'linear-gradient(to bottom, transparent, rgba(2,2,10,0.9))',
      }} />
    </div>
  );
}
