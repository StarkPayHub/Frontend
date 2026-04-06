"use client";

/**
 * PrivySocialButton
 *
 * Safe wrapper around Privy social auth.
 * Renders a functional Google / Email login button when Privy is available,
 * or a graceful disabled state when NEXT_PUBLIC_PRIVY_APP_ID is not set.
 *
 * Two-layer pattern:
 *   PrivySocialButton  — checks privyReady via StarkzapContext (no usePrivy call)
 *   PrivySocialInner   — calls usePrivy() safely inside PrivyProvider
 */

import { useStarkzap } from "./StarkzapProvider";
import { usePrivy } from "@privy-io/react-auth";

/* ── Google SVG logo ─────────────────────────────────────────────────────── */
const GoogleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

/* ── Spinner ─────────────────────────────────────────────────────────────── */
const Spinner = () => (
  <span className="w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full animate-spin flex-shrink-0" />
);

/* ── Props ───────────────────────────────────────────────────────────────── */
interface Props {
  /** "hero" = ghost pill for landing; "card" = full-width for pricing card */
  variant?: "hero" | "card";
  label?: string;
  /** Called after successful login */
  onAuthenticated?: (email: string) => void;
}

/* ── Inner (only rendered inside PrivyProvider) ─────────────────────────── */
function PrivySocialInner({ variant = "card", label = "Continue with Google", onAuthenticated }: Props) {
  const { ready, authenticated, user, login, logout } = usePrivy();

  const email =
    user?.google?.email ??
    user?.email?.address ??
    user?.twitter?.username ??
    null;

  /* loading */
  if (!ready) {
    return (
      <BaseButton variant={variant} disabled>
        <Spinner />
        Loading…
      </BaseButton>
    );
  }

  /* authenticated */
  if (authenticated && email) {
    if (onAuthenticated) onAuthenticated(email);

    if (variant === "hero") {
      // In hero: just show green checkmark badge — sign out is handled in Navbar
      return (
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 7,
          padding: "7px 16px",
          borderRadius: 999,
          background: "rgba(52,211,153,0.08)",
          border: "1px solid rgba(52,211,153,0.2)",
          fontSize: 13,
          color: "#34d399",
          fontFamily: "ui-monospace,'SF Mono',monospace",
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {email}
        </div>
      );
    }

    /* card variant — authenticated: compact single line */
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "9px 12px",
        borderRadius: 10,
        background: "rgba(52,211,153,0.06)",
        border: "1px solid rgba(52,211,153,0.18)",
      }}>
        <GoogleIcon />
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "ui-monospace,'SF Mono',monospace" }}>
          {email}
        </span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
    );
  }

  /* not authenticated */
  return (
    <BaseButton
      variant={variant}
      onClick={() => login({ loginMethods: ["google", "email"] } as Parameters<typeof login>[0])}
    >
      <GoogleIcon />
      {label}
    </BaseButton>
  );
}

/* ── Base button styles ──────────────────────────────────────────────────── */
function BaseButton({
  variant,
  disabled,
  onClick,
  children,
}: {
  variant?: "hero" | "card";
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  if (variant === "hero") {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "9px 22px",
          borderRadius: 999,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.1)",
          color: "rgba(255,255,255,0.65)",
          fontSize: 14,
          fontFamily: "'Syne', sans-serif",
          fontWeight: 500,
          cursor: disabled ? "default" : "pointer",
          transition: "all 0.2s",
          opacity: disabled ? 0.5 : 1,
        }}
        onMouseEnter={e => {
          if (!disabled) {
            const el = e.currentTarget;
            el.style.background = "rgba(255,255,255,0.08)";
            el.style.borderColor = "rgba(255,255,255,0.18)";
            el.style.color = "rgba(255,255,255,0.9)";
          }
        }}
        onMouseLeave={e => {
          const el = e.currentTarget;
          el.style.background = "rgba(255,255,255,0.04)";
          el.style.borderColor = "rgba(255,255,255,0.1)";
          el.style.color = "rgba(255,255,255,0.65)";
        }}
      >
        {children}
      </button>
    );
  }

  /* card variant */
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full h-11 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.1)",
        color: "rgba(255,255,255,0.7)",
        cursor: disabled ? "default" : "pointer",
      }}
      onMouseEnter={e => {
        if (!disabled) {
          const el = e.currentTarget;
          el.style.background = "rgba(255,255,255,0.07)";
          el.style.borderColor = "rgba(255,255,255,0.18)";
          el.style.color = "rgba(255,255,255,0.9)";
        }
      }}
      onMouseLeave={e => {
        const el = e.currentTarget;
        el.style.background = "rgba(255,255,255,0.03)";
        el.style.borderColor = "rgba(255,255,255,0.1)";
        el.style.color = "rgba(255,255,255,0.7)";
      }}
    >
      {children}
    </button>
  );
}

/* ── Public component — safe outer wrapper ────────────────────────────────── */
export function PrivySocialButton(props: Props) {
  const { privyReady } = useStarkzap();

  if (!privyReady) {
    /* Privy not configured — show placeholder */
    return (
      <BaseButton variant={props.variant} disabled>
        <GoogleIcon />
        {props.label ?? "Continue with Google"}
      </BaseButton>
    );
  }

  return <PrivySocialInner {...props} />;
}
