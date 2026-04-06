"use client";

/**
 * StarkzapProvider
 *
 * Wraps the app with PrivyProvider and initialises the StarkZap SDK.
 * Exposes the SDK instance via StarkzapContext so any child component
 * can call sdk.onboard() for gasless social-login subscriptions.
 *
 * Setup:
 *   1. pnpm add @privy-io/react-auth  (done)
 *   2. pnpm add starkzap              (when package is published)
 *   3. Fill NEXT_PUBLIC_PRIVY_APP_ID in .env.local
 *   4. Uncomment the StarkZap init block below
 */

import { createContext, useContext, useRef, useEffect, useState, ReactNode } from "react";
import { PrivyProvider, usePrivy } from "@privy-io/react-auth";

// ── types ─────────────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type StarkZapSDK = any;

interface StarkzapContextValue {
  sdk: StarkZapSDK | null;
  privyReady: boolean;
  /** true when user is logged in via Privy (Google/Email) */
  privyAuthenticated: boolean;
  /** email/google address of the Privy user, or null */
  privyEmail: string | null;
  /** call to log out of Privy */
  privyLogout: (() => Promise<void>) | null;
}

const StarkzapContext = createContext<StarkzapContextValue>({
  sdk: null,
  privyReady: false,
  privyAuthenticated: false,
  privyEmail: null,
  privyLogout: null,
});

export function useStarkzap() {
  return useContext(StarkzapContext);
}

// ── Inner wrapper (client-only, inside PrivyProvider) ─────────────────────────
function StarkzapInner({ children }: { children: ReactNode }) {
  const sdkRef = useRef<StarkZapSDK | null>(null);
  const { authenticated, user, logout } = usePrivy();

  const privyEmail =
    user?.google?.email ??
    user?.email?.address ??
    null;

  // When starkzap is published:
  //   pnpm add starkzap → uncomment below
  //
  // if (sdkRef.current === null) {
  //   const { StarkZap } = require("starkzap");
  //   sdkRef.current = new StarkZap({
  //     network: "sepolia",
  //     paymaster: { apiKey: process.env.NEXT_PUBLIC_AVNU_PAYMASTER_API_KEY ?? "" },
  //   });
  // }

  return (
    <StarkzapContext.Provider value={{
      sdk: sdkRef.current,
      privyReady: true,
      privyAuthenticated: authenticated,
      privyEmail,
      privyLogout: logout,
    }}>
      {children}
    </StarkzapContext.Provider>
  );
}

// ── Provider ──────────────────────────────────────────────────────────────────
export function StarkzapProvider({ children }: { children: ReactNode }) {
  // Defer PrivyProvider to client-only to avoid SSR prerender crash
  // when NEXT_PUBLIC_PRIVY_APP_ID is not yet set.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID ?? "";
  const hasValidAppId = privyAppId.length > 0 && privyAppId !== "your_privy_app_id";

  // SSR / no appId: render children without Privy (social login disabled)
  if (!mounted || !hasValidAppId) {
    return (
      <StarkzapContext.Provider value={{ sdk: null, privyReady: false, privyAuthenticated: false, privyEmail: null, privyLogout: null }}>
        {children}
      </StarkzapContext.Provider>
    );
  }

  return (
    <PrivyProvider
      appId={privyAppId}
      config={{
        loginMethods: ["google", "email"],
        appearance: {
          theme: "dark",
          accentColor: "#7c3aed",
          logo: "/logo-sm.png",
          landingHeader: "Sign in to StarkPayHub",
          loginMessage: "Connect with Google or Email to access gasless subscriptions on Starknet.",
        },
        embeddedWallets: {
          ethereum: { createOnLogin: "users-without-wallets" },
        },
      }}
    >
      <StarkzapInner>{children}</StarkzapInner>
    </PrivyProvider>
  );
}
