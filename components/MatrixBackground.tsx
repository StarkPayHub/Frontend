'use client';
import { useEffect, useRef } from 'react';

const CHARS = '0123456789ABCDEFabcdef→←↑↓×+−=><{}[]|/\\:;.,*#?~^&%$01xX∑∆∇◈⊕≡≠';
const FS = 13;

export function MatrixBackground() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext('2d')!;
    let W = 0, H = 0, id: number;

    type Column = {
      x: number;
      y: number;
      speed: number;
      length: number;
      chars: string[];
      opacity: number;
    };

    let cols: Column[] = [];

    function randChar() {
      return CHARS[Math.floor(Math.random() * CHARS.length)];
    }

    function makeCol(x: number, startY?: number): Column {
      const length = 10 + Math.floor(Math.random() * 22);
      return {
        x,
        y: startY ?? Math.random() * -H,
        speed: 0.4 + Math.random() * 1.2,
        length,
        chars: Array.from({ length }, randChar),
        opacity: 0.3 + Math.random() * 0.7,
      };
    }

    function build() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
      const colCount = Math.floor(W / FS);
      cols = Array.from({ length: colCount }, (_, i) =>
        makeCol(i * FS + FS / 2, Math.random() * H)
      );
    }

    let t = 0;
    let frameCount = 0;

    function frame() {
      id = requestAnimationFrame(frame);
      frameCount++;
      if (frameCount % 2 !== 0) return; // throttle to ~30 fps

      // Deep black fade — creates trail
      ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
      ctx.fillRect(0, 0, W, H);

      ctx.font = `${FS}px "Geist Mono", monospace`;

      for (const col of cols) {
        // Mutate chars randomly
        if (Math.random() < 0.08) {
          const idx = Math.floor(Math.random() * col.chars.length);
          col.chars[idx] = randChar();
        }

        // Draw trail chars
        for (let j = 0; j < col.chars.length; j++) {
          const cy = col.y - j * FS;
          if (cy < 0 || cy > H) continue;

          const frac = 1 - j / col.chars.length; // 1 at head, 0 at tail
          let r: number, g: number, bv: number, a: number;

          if (j === 0) {
            // Head: near white with violet tint
            r = 230; g = 210; bv = 255; a = col.opacity;
          } else {
            // Trail: fade from violet-300 to violet-900
            r = Math.round(100 + frac * 100);
            g = Math.round(20 + frac * 60);
            bv = Math.round(180 + frac * 60);
            a = frac * frac * col.opacity * 0.9;
          }

          ctx.fillStyle = `rgba(${r},${g},${bv},${a.toFixed(3)})`;
          ctx.fillText(col.chars[j], col.x, cy);
        }

        // Move column down
        col.y += col.speed;

        // Reset when fully off screen
        if (col.y - col.length * FS > H) {
          const newCol = makeCol(col.x);
          col.y = newCol.y;
          col.speed = newCol.speed;
          col.length = newCol.length;
          col.chars = newCol.chars;
          col.opacity = newCol.opacity;
        }
      }

      t++;
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
