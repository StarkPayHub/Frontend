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
      {/* ── Logo mark ── */}
      <div style={{ position: "relative", width: 72, height: 48 }}>
        {/* Left wing */}
        <svg
          viewBox="0 0 34 48"
          width={34}
          height={48}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            animation: "wing-left 2.4s ease-in-out infinite",
            willChange: "transform",
          }}
        >
          <path d="M30 2 L2 24 L30 46 L34 46 L34 2 Z" fill="#7c3aed" />
          <path d="M30 2 L34 2 L34 46 L30 46 Z" fill="#5b21b6" />
        </svg>

        {/* Right wing */}
        <svg
          viewBox="0 0 34 48"
          width={34}
          height={48}
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            transform: "scaleX(-1)",
            animation: "wing-right 2.4s ease-in-out infinite",
            willChange: "transform",
          }}
        >
          <path d="M30 2 L2 24 L30 46 L34 46 L34 2 Z" fill="#c4b5fd" />
          <path d="M30 2 L34 2 L34 46 L30 46 Z" fill="#a78bfa" />
        </svg>

        {/* center glow dot */}
        <div style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: "#e9d5ff",
          boxShadow: "0 0 16px 4px rgba(196,181,253,0.6)",
          animation: "center-pulse 2.4s ease-in-out infinite",
          willChange: "transform, opacity",
        }} />
      </div>

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

      {/* ── Brand ── */}
      <span style={{
        fontFamily: "monospace",
        fontSize: 10,
        letterSpacing: "0.28em",
        textTransform: "uppercase",
        color: "rgba(139,92,246,0.5)",
        animation: "label-pulse 2.4s ease-in-out infinite",
      }}>
        StarkPayHub
      </span>

      <style>{`
        @keyframes wing-left {
          0%,100% { transform: translateX(0) rotate(0deg); opacity:0.9; }
          50%      { transform: translateX(-3px) rotate(-2deg); opacity:1; }
        }
        @keyframes wing-right {
          0%,100% { transform: scaleX(-1) translateX(0) rotate(0deg); opacity:0.9; }
          50%      { transform: scaleX(-1) translateX(-3px) rotate(-2deg); opacity:1; }
        }
        @keyframes center-pulse {
          0%,100% { transform: translate(-50%,-50%) scale(1);   opacity:0.8; }
          50%      { transform: translate(-50%,-50%) scale(1.8); opacity:1; }
        }
        @keyframes shimmer-bar {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes label-pulse {
          0%,100% { opacity:0.4; }
          50%      { opacity:0.8; }
        }
      `}</style>
    </div>
  );
}
