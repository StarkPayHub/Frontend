'use client';
import { useEffect, useRef } from 'react';

const GAP = 11;
const MAX_R = 4;

function hash(x: number, y: number) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

function getIntensity(px: number, py: number, W: number, H: number): number {
  const U = Math.min(W, H) * 0.2;
  const sx = (px - W * 0.5) / U;
  const sy = (py - H * 0.38) / U;

  let b = 0;

  function box(x1: number, x2: number, y1: number, y2: number, soft = 0.28): number {
    if (sx < x1 || sx > x2 || sy < y1 || sy > y2) return 0;
    return (
      Math.min((sx - x1) / soft, (x2 - sx) / soft, 1) *
      Math.min((sy - y1) / soft, (y2 - sy) / soft, 1)
    );
  }

  // pillars
  b = Math.max(b, box(-3.6, -1.0, -2.3, 3.6) * 0.92);
  b = Math.max(b, box(1.0, 3.6, -2.3, 3.6) * 0.92);
  // top bar
  b = Math.max(b, box(-3.6, 3.6, -2.3, -1.45) * 0.85);
  // keystone bridge
  b = Math.max(b, box(-1.0, 1.0, -1.45, -0.3) * 0.52);

  // arch rim
  const acy = -0.3;
  const ar = 1.0;
  const dist = Math.sqrt(sx * sx + (sy - acy) ** 2);
  if (sy < acy + 0.12)
    b = Math.max(b, Math.max(0, 1 - Math.abs(dist - ar) / 0.14) * 0.8);

  // arch void
  const vr = ar - 0.14;
  if ((dist < vr && sy < acy) || (Math.abs(sx) < vr && sy >= acy && sy < 3.6)) b = 0;

  // ambient base layer — dots fill the whole canvas
  const seed = hash(Math.round(px / GAP), Math.round(py / GAP));
  const ambient = seed * 0.18; // sparse dim dots everywhere
  b = Math.max(b, ambient);

  // subtle horizontal vignette only (no vertical kill)
  const vx = Math.pow(Math.max(0, Math.sin((px / W) * Math.PI)), 0.3);
  b *= vx;

  return Math.max(0, Math.min(1, b));
}

function dotColor(b: number, a: number): string {
  const r = Math.round(80 + b * 175);
  const g = Math.round(40 + b * 155);
  const bv = Math.round(180 + b * 75);
  return `rgba(${r},${g},${bv},${a.toFixed(2)})`;
}

export function HalftoneBackground() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext('2d')!;
    let W = 0, H = 0, id: number, t = 0;
    let dots: { x: number; y: number; b: number }[] = [];

    function build() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
      dots = [];
      for (let x = GAP / 2; x < W; x += GAP) {
        for (let y = GAP / 2; y < H; y += GAP) {
          const b = getIntensity(x, y, W, H);
          if (b > 0.01) dots.push({ x, y, b });
        }
      }
    }

    function frame() {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, W, H);
      for (const d of dots) {
        const pulse = 1 + Math.sin(t * 0.35 + d.x * 0.042 + d.y * 0.042) * 0.1;
        const r = Math.max(0.3, d.b * MAX_R * pulse);
        const a = Math.min(1, d.b * 1.3);
        ctx.beginPath();
        ctx.arc(d.x, d.y, r, 0, Math.PI * 2);
        ctx.fillStyle = dotColor(d.b, a);
        ctx.fill();
      }
      t += 0.011;
      id = requestAnimationFrame(frame);
    }

    build();
    window.addEventListener('resize', build);
    frame();
    return () => { cancelAnimationFrame(id); window.removeEventListener('resize', build); };
  }, []);

  return (
    <canvas
      ref={ref}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
