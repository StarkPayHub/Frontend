'use client';

export function DemoBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>

      {/* Base — very deep dark blue-black */}
      <div className="absolute inset-0" style={{ background: '#02020a' }} />

      {/* Orb 1 — large violet, top-left */}
      <div
        className="absolute rounded-full"
        style={{
          width: 900, height: 900,
          top: '-20%', left: '-15%',
          background: 'radial-gradient(circle, rgba(109,40,217,0.35) 0%, transparent 70%)',
          filter: 'blur(80px)',
          animation: 'orb-a 28s ease-in-out infinite',
        }}
      />

      {/* Orb 2 — indigo-blue, top-right */}
      <div
        className="absolute rounded-full"
        style={{
          width: 800, height: 800,
          top: '-10%', right: '-10%',
          background: 'radial-gradient(circle, rgba(67,56,202,0.3) 0%, transparent 70%)',
          filter: 'blur(100px)',
          animation: 'orb-b 35s ease-in-out infinite',
        }}
      />

      {/* Orb 3 — violet-pink, center */}
      <div
        className="absolute rounded-full"
        style={{
          width: 700, height: 700,
          top: '30%', left: '30%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)',
          filter: 'blur(120px)',
          animation: 'orb-c 42s ease-in-out infinite',
        }}
      />

      {/* Orb 4 — deep cyan-blue, bottom-right */}
      <div
        className="absolute rounded-full"
        style={{
          width: 600, height: 600,
          bottom: '-5%', right: '10%',
          background: 'radial-gradient(circle, rgba(37,99,235,0.25) 0%, transparent 70%)',
          filter: 'blur(90px)',
          animation: 'orb-d 38s ease-in-out infinite',
        }}
      />

      {/* Orb 5 — tiny accent violet, bottom-left */}
      <div
        className="absolute rounded-full"
        style={{
          width: 400, height: 400,
          bottom: '15%', left: '5%',
          background: 'radial-gradient(circle, rgba(167,139,250,0.15) 0%, transparent 70%)',
          filter: 'blur(60px)',
          animation: 'orb-a 22s ease-in-out infinite reverse',
        }}
      />

      {/* Noise grain texture */}
      <svg
        className="absolute pointer-events-none"
        style={{ width: '120%', height: '120%', top: '-10%', left: '-10%', opacity: 0.045 }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id="demo-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="4" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#demo-noise)" />
      </svg>

      {/* Subtle top light ray — like Apple product pages */}
      <div
        className="absolute"
        style={{
          top: 0, left: '50%',
          transform: 'translateX(-50%)',
          width: 600, height: 400,
          background: 'radial-gradient(ellipse at top, rgba(139,92,246,0.12) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      {/* Very faint grid lines */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
        }}
      />

      {/* Bottom fade to black so content below fades cleanly */}
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{
          height: '30%',
          background: 'linear-gradient(to bottom, transparent, rgba(2,2,10,0.8))',
        }}
      />
    </div>
  );
}
