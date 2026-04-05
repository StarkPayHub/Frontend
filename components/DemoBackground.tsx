'use client';

export function DemoBackground() {
  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 0, contain: 'strict' }}
    >
      {/* Base */}
      <div className="absolute inset-0" style={{ background: '#02020a' }} />

      {/* Static orbs — no animation, blur is composited once */}
      <div className="absolute rounded-full" style={{
        width: 900, height: 900,
        top: '-20%', left: '-15%',
        background: 'radial-gradient(circle, rgba(109,40,217,0.3) 0%, transparent 70%)',
        filter: 'blur(80px)',
      }} />

      <div className="absolute rounded-full" style={{
        width: 800, height: 800,
        top: '-10%', right: '-10%',
        background: 'radial-gradient(circle, rgba(67,56,202,0.25) 0%, transparent 70%)',
        filter: 'blur(100px)',
      }} />

      <div className="absolute rounded-full" style={{
        width: 600, height: 600,
        top: '35%', left: '30%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
        filter: 'blur(100px)',
      }} />

      <div className="absolute rounded-full" style={{
        width: 500, height: 500,
        bottom: '-5%', right: '10%',
        background: 'radial-gradient(circle, rgba(37,99,235,0.2) 0%, transparent 70%)',
        filter: 'blur(80px)',
      }} />

      {/* Top light ray */}
      <div className="absolute" style={{
        top: 0, left: '50%',
        transform: 'translateX(-50%)',
        width: 600, height: 300,
        background: 'radial-gradient(ellipse at top, rgba(139,92,246,0.1) 0%, transparent 70%)',
        filter: 'blur(40px)',
      }} />

      {/* Faint grid */}
      <div className="absolute inset-0" style={{
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)
        `,
        backgroundSize: '80px 80px',
      }} />

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0" style={{
        height: '25%',
        background: 'linear-gradient(to bottom, transparent, rgba(2,2,10,0.85))',
      }} />
    </div>
  );
}
