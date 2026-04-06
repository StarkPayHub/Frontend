"use client";

/**
 * SocialLoginButton
 *
 * "Continue with Google / Email" flow:
 *   1. Privy.login() — opens Privy modal (Google, email, Twitter)
 *   2. Gets access token from Privy
 *   3. POSTs to /api/signer-context → verifies token server-side
 *   4. Calls sdk.onboard() → Starkzap auto-deploys an Argent X AA wallet
 *   5. Returns wallet ready for gasless execute() calls
 *
 * The `onWalletReady` callback receives the live Starkzap wallet so
 * the parent (e.g. SubscribeButton) can trigger the subscription tx.
 */

import { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useStarkzap } from "./StarkzapProvider";

interface SocialLoginButtonProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onWalletReady?: (wallet: any) => void;
  label?: string;
  className?: string;
}

export function SocialLoginButton({
  onWalletReady,
  label = "Continue with Email / Google",
  className = "",
}: SocialLoginButtonProps) {
  const { login, authenticated, getAccessToken } = usePrivy();
  const { sdk } = useStarkzap();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sdkAvailable = sdk !== null;

  async function handleSocialLogin() {
    setError(null);

    if (!authenticated) {
      // Opens Privy modal; after login the user must click again to onboard.
      login();
      return;
    }

    if (!sdkAvailable) {
      setError("Starkzap SDK not available. Run: pnpm add starkzap");
      return;
    }

    setLoading(true);
    try {
      const accessToken = await getAccessToken();

      const wallet = await sdk.onboard({
        // Starkzap strategy enum — replace with import once package is installed:
        // strategy: OnboardStrategy.Privy,
        strategy: "privy",
        privy: {
          resolve: async () => {
            const res = await fetch("/api/signer-context", {
              method: "POST",
              headers: { Authorization: `Bearer ${accessToken}` },
            });
            if (!res.ok) throw new Error("Failed to get signer context");
            return res.json();
          },
        },
        // accountPreset: accountPresets.argentXV050,
        accountPreset: "argent_x_v050",
        feeMode: "sponsored",
        deploy: "if_needed",
      });

      onWalletReady?.(wallet);
    } catch (err) {
      console.error("Starkzap onboard failed:", err);
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full space-y-2">
      <button
        onClick={handleSocialLogin}
        disabled={loading}
        className={`w-full h-11 rounded-lg font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${className}`}
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Connecting…
          </>
        ) : authenticated ? (
          "Onboard Starknet Wallet"
        ) : (
          <>
            {/* Google icon */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {label}
          </>
        )}
      </button>

      {error && (
        <p className="text-xs text-red-400 text-center font-mono">{error}</p>
      )}
    </div>
  );
}
