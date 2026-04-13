"use client";

import { useEffect, useState } from "react";

interface Props {
  /** if true, renders the overlay; if false, fades out then unmounts */
  visible: boolean;
}

export function LoadingScreen({ visible }: Props) {
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    if (!visible) {
      // keep in DOM long enough for fade-out
      const t = setTimeout(() => setMounted(false), 700);
      return () => clearTimeout(t);
    }
    setMounted(true);
  }, [visible]);

  if (!mounted) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "radial-gradient(ellipse at 50% 40%, rgba(60,20,120,0.35) 0%, rgba(4,2,18,1) 65%)",
        backgroundColor: "#04020f",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 28,
        opacity: visible ? 1 : 0,
        transition: "opacity 0.6s cubic-bezier(.4,0,.2,1)",
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      {/* ── Logo ── */}
      <div style={{
        animation: "sph-logo-breathe 2.8s ease-in-out infinite",
        willChange: "opacity, transform",
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png"
          alt="StarkPayHub"
          width={140}
          height={140}
          style={{ display: "block", objectFit: "contain" }}
        />
      </div>

      {/* ── Brand name ── */}
      <p style={{
        fontFamily: "ui-monospace,'SF Mono',monospace",
        fontSize: 13,
        fontWeight: 700,
        letterSpacing: "0.28em",
        textTransform: "uppercase",
        color: "rgba(196,181,253,0.75)",
        marginTop: -16,
      }}>
        StarkPayHub
      </p>

      {/* ── Progress bar ── */}
      <div style={{
        width: 120,
        height: 2,
        borderRadius: 2,
        background: "rgba(109,40,217,0.2)",
        overflow: "hidden",
        position: "relative",
      }}>
        <div style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(90deg, #7c3aed, #c4b5fd, #7c3aed)",
          backgroundSize: "200% 100%",
          animation: "shimmer-bar 1.6s ease-in-out infinite",
          willChange: "background-position",
        }} />
      </div>

      <style>{`
        @keyframes sph-logo-breathe {
          0%, 100% { opacity: 0.85; transform: scale(1);    }
          50%       { opacity: 1;    transform: scale(1.04); }
        }
        @keyframes shimmer-bar {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
