"use client";

import { useEffect } from "react";

type ToastProps = {
  message: string;
  type?: "success" | "error" | "info";
  onDismiss: () => void;
};

const IcoCheck = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IcoX = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const IcoInfo = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

export function Toast({ message, type = "info", onDismiss }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4500);
    return () => clearTimeout(t);
  }, [onDismiss]);

  const styles = {
    success: { bg: "rgba(16,30,22,0.95)", border: "rgba(52,211,153,0.35)", text: "#34d399", icon: IcoCheck },
    error:   { bg: "rgba(30,12,12,0.95)", border: "rgba(239,68,68,0.35)",  text: "#f87171", icon: IcoX    },
    info:    { bg: "rgba(14,10,30,0.95)", border: "rgba(139,92,246,0.35)", text: "#c4b5fd", icon: IcoInfo  },
  };
  const s = styles[type];

  return (
    <div style={{
      position: "fixed",
      bottom: 28,
      right: 28,
      zIndex: 9999,
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "13px 16px",
      borderRadius: 12,
      background: s.bg,
      border: `1px solid ${s.border}`,
      color: s.text,
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
      fontFamily: "ui-monospace, 'SF Mono', monospace",
      fontSize: 13,
      maxWidth: 360,
      animation: "toast-in 0.25s cubic-bezier(.16,1,.3,1)",
    }}>
      <span style={{ flexShrink: 0 }}>{s.icon}</span>
      <span style={{ color: "rgba(255,255,255,0.88)", fontFamily: "inherit", fontSize: 13 }}>{message}</span>
      <button
        onClick={onDismiss}
        style={{
          marginLeft: 6,
          flexShrink: 0,
          color: "rgba(255,255,255,0.3)",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
          display: "flex",
          alignItems: "center",
          fontSize: 16,
          lineHeight: 1,
        }}
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}
