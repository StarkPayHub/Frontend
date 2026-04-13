'use client';
import { useEffect, useRef } from 'react';

const CHARS = '0123456789ABCDEFabcdef→←↑↓×+−=><{}[]|/\\:;.,*#?~^&%$01xX∑∆∇◈⊕≡≠';
const FS           = 13;
const CURSOR_RADIUS = 150;   // px — slow-mo zone radius
const PARALLAX_STR  = 10;    // max parallax px

type Column = { x: number; y: number; speed: number; baseSpeed: number; length: number; chars: string[]; opacity: number; };
type Ember  = { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; };

export function MatrixBackground() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx    = canvas.getContext('2d')!;
    let W = 0, H = 0, rafId: number;

    let cols:   Column[] = [];
    let embers: Ember[]  = [];

    // ── cursor state ──
    let mouseX = window.innerWidth  / 2;
    let mouseY = window.innerHeight / 2;
    let lerpX  = mouseX, lerpY = mouseY;
    let prevLerpX = lerpX, prevLerpY = lerpY;
    let isMouseOnPage = false;

    const onMouseMove  = (e: MouseEvent) => { mouseX = e.clientX; mouseY = e.clientY; isMouseOnPage = true; };
    const onMouseLeave = () => { isMouseOnPage = false; };
    window.addEventListener('mousemove',  onMouseMove);
    document.addEventListener('mouseleave', onMouseLeave);

    function randChar() { return CHARS[Math.floor(Math.random() * CHARS.length)]; }

    function makeCol(x: number, startY?: number): Column {
      const length = 12 + Math.floor(Math.random() * 22);
      const speed  = 0.5 + Math.random() * 1.1;
      return { x, y: startY ?? Math.random() * -H, speed, baseSpeed: speed,
               length, chars: Array.from({ length }, randChar), opacity: 0.35 + Math.random() * 0.65 };
    }

    function build() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
      cols   = Array.from({ length: Math.floor(W / FS) }, (_, i) => makeCol(i * FS + FS / 2, Math.random() * H));
      embers = [];
    }

    let ringT = 0;

    // ── spawn drifting ember sparks near cursor ──
    function spawnEmbers(cx: number, cy: number) {
      if (!isMouseOnPage || embers.length >= 10) return;
      if (Math.random() > 0.18) return;
      const angle = Math.random() * Math.PI * 2;
      const r = 15 + Math.random() * 80;
      embers.push({
        x: cx + Math.cos(angle) * r,
        y: cy + Math.sin(angle) * r,
        vx: (Math.random() - 0.5) * 0.6,
        vy: -0.4 - Math.random() * 1.0,   // drift upward = fire
        life: 0, maxLife: 55 + Math.random() * 45,
      });
    }

    function frame() {
      rafId = requestAnimationFrame(frame);

      prevLerpX = lerpX; prevLerpY = lerpY;
      lerpX += (mouseX - lerpX) * 0.055;
      lerpY += (mouseY - lerpY) * 0.055;
      ringT += 0.022;

      // How fast cursor moved this frame → amplifies the fire intensity
      const velX  = lerpX - prevLerpX;
      const velY  = lerpY - prevLerpY;
      const speed = Math.sqrt(velX * velX + velY * velY);
      const boost = Math.min(speed * 0.18, 0.5); // 0→0.5 intensity boost on fast move

      const pxRaw = ((lerpX / W) - 0.5) * -PARALLAX_STR;
      const pyRaw = ((lerpY / H) - 0.5) * -PARALLAX_STR * 0.4;

      // ── trail fade ──
      ctx.fillStyle = 'rgba(0,0,0,0.068)';
      ctx.fillRect(0, 0, W, H);

      spawnEmbers(lerpX, lerpY);

      // ─────────────────────────────────────────
      // DRAW COLUMNS (with parallax)
      // ─────────────────────────────────────────
      ctx.save();
      ctx.translate(pxRaw, pyRaw);
      ctx.font = `${FS}px "Geist Mono",monospace`;

      for (const col of cols) {
        const dx   = col.x - (lerpX - pxRaw);
        const dy   = col.y - (lerpY - pyRaw);
        const dist = Math.sqrt(dx * dx + dy * dy);

        const tProx = Math.max(0, 1 - dist / CURSOR_RADIUS);
        // Quartic ease: even more dramatic falloff
        const eased = tProx * tProx * tProx * tProx;
        // Per-column flicker to simulate flame turbulence
        const flicker = 0.06 * Math.sin(ringT * 6.7 + col.x * 0.017);
        const fire    = Math.min(1, Math.max(0, eased + flicker + boost * tProx));

        // Speed: near-zero inside fire zone
        col.speed = col.baseSpeed * (1 - fire * 0.975);

        // Chars mutate slower when suspended in fire
        if (Math.random() < 0.08 * (1 - fire * 0.88)) {
          col.chars[Math.floor(Math.random() * col.chars.length)] = randChar();
        }

        for (let j = 0; j < col.chars.length; j++) {
          const cy = col.y - j * FS;
          if (cy < -FS || cy > H + FS) continue;

          const frac = 1 - j / col.chars.length;   // 1=head, 0=tail

          let r: number, g: number, bv: number, a: number;

          // ── Purple fire palette ──
          // Normal:      violet rain (100–200, 20–80, 180–240)
          // Mid-fire:    vivid violet → bright purple (160, 70, 255)
          // Hot-fire:    lavender-white (235, 180, 255)
          // Core-white:  (255, 240, 255)

          if (j === 0) {
            // Head char — subtle shift toward bright violet near cursor
            r  = Math.round(180 + fire * 50);
            g  = Math.round(160 + fire * 50);
            bv = 255;
            a  = Math.min(1, col.opacity + fire * 0.25);
          } else {
            // Trail — gentle purple tint near cursor
            const nr = 100 + frac * 100;
            const ng = 20  + frac *  60;
            const nb = 180 + frac *  60;

            const fr = 160 + frac * 60;
            const fg = 80  + frac * 80;
            const fb = 255;

            r  = Math.round(nr * (1 - fire) + fr * fire);
            g  = Math.round(ng * (1 - fire) + fg * fire);
            bv = Math.round(nb * (1 - fire) + fb * fire);
            a  = frac * frac * Math.min(1, col.opacity * 0.85 + fire * 0.2);
          }

          ctx.fillStyle = `rgba(${r},${g},${bv},${a.toFixed(3)})`;
          ctx.fillText(col.chars[j], col.x, cy);
        }

        col.y += col.speed;
        if (col.y - col.length * FS > H) {
          const n = makeCol(col.x);
          Object.assign(col, { y: n.y, baseSpeed: n.baseSpeed, speed: n.speed,
                                length: n.length, chars: n.chars, opacity: n.opacity });
        }
      }
      ctx.restore();

      // ─────────────────────────────────────────
      // CURSOR GLOW — subtle additive
      // ─────────────────────────────────────────
      if (isMouseOnPage) {
        const cx = lerpX, cy = lerpY;
        const pulse = Math.sin(ringT * 2.1) * 0.5 + 0.5;

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';

        // Outer soft aura
        const aura = ctx.createRadialGradient(cx, cy, 0, cx, cy, CURSOR_RADIUS * 0.6);
        aura.addColorStop(0,   `rgba(109, 40, 217, ${(0.04 + boost * 0.02).toFixed(3)})`);
        aura.addColorStop(0.6, 'rgba( 88, 28, 189, 0.01)');
        aura.addColorStop(1,   'rgba(0,0,0,0)');
        ctx.fillStyle = aura;
        ctx.fillRect(0, 0, W, H);

        // Inner violet core
        const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, 50 + pulse * 8);
        core.addColorStop(0,   `rgba(160, 90, 255, ${(0.07 + pulse * 0.02).toFixed(3)})`);
        core.addColorStop(0.6, 'rgba(120, 60, 220, 0.02)');
        core.addColorStop(1,   'rgba(0,0,0,0)');
        ctx.fillStyle = core;
        ctx.fillRect(0, 0, W, H);

        // Ember sparks
        for (let i = embers.length - 1; i >= 0; i--) {
          const e = embers[i];
          e.x += e.vx; e.y += e.vy;
          e.life++;
          if (e.life >= e.maxLife) { embers.splice(i, 1); continue; }
          const et = e.life / e.maxLife;
          const ea = Math.sin(et * Math.PI) * 0.35;
          ctx.beginPath();
          ctx.arc(e.x, e.y, 1 + Math.sin(et * Math.PI), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(196, 148, 255, ${ea.toFixed(3)})`;
          ctx.fill();
        }

        // Single pulsing ring
        const rA = 35 + Math.sin(ringT * 2.2) * 8;
        const aA = (0.07 + Math.sin(ringT * 2.2) * 0.03).toFixed(3);
        ctx.beginPath();
        ctx.arc(cx, cy, rA, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(196, 170, 255, ${aA})`;
        ctx.lineWidth = 0.6;
        ctx.stroke();

        ctx.restore();
      }
    }

    build();
    window.addEventListener('resize', build);
    frame();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', build);
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
