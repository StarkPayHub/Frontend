"use client";

/**
 * useStarkZapWallet — Cartridge wallet via StarkZap SDK.
 *
 * Provides connect/disconnect + gasless execute for subscribe, create plan, withdraw.
 * Works alongside the existing starknet-react wallet (Argent/Braavos).
 * Uses feeMode: "sponsored" — AVNU pays gas.
 *
 * Exposed via StarkZapWalletProvider so every component sees the same wallet state.
 */

import { createContext, useContext, useState, useCallback, useRef, ReactNode } from "react";
import { getStarkZapSDK, STARKPAY_POLICIES } from "@/lib/starkzap-sdk";

export interface StarkZapWallet {
  address: string;
  execute: (calls: { contractAddress: string; entrypoint: string; calldata: string[] }[]) => Promise<{ transaction_hash: string }>;
  disconnect: () => Promise<void>;
}

export interface UseStarkZapWalletReturn {
  wallet: StarkZapWallet | null;
  address: string | null;
  connected: boolean;
  connecting: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  execute: (calls: { contractAddress: string; entrypoint: string; calldata: string[] }[]) => Promise<{ transaction_hash: string }>;
}

const StarkZapWalletContext = createContext<UseStarkZapWalletReturn | null>(null);

export function StarkZapWalletProvider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<StarkZapWallet | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cartridgeRef = useRef<any>(null);

  const connect = useCallback(async () => {
    setConnecting(true);
    setError(null);
    try {
      const sdk = getStarkZapSDK();
      const cartridge = await sdk.connectCartridge({
        policies: STARKPAY_POLICIES,
      });
      cartridgeRef.current = cartridge;

      const addr = cartridge.address;

      const walletObj: StarkZapWallet = {
        address: addr,
        execute: async (calls) => {
          // Cartridge controller handles gasless via session keys internally on
          // Sepolia; passing feeMode:"sponsored" forces the AVNU SNIP-9 path
          // which the Cartridge session account does not implement.
          const tx = await cartridge.execute(calls as any[]);
          const hash = (tx as any).hash ?? "";
          // Fire-and-forget wait — don't block UI redirect if polling times out
          try { await (tx as any).wait?.(); } catch (e) { console.warn("tx.wait failed:", e); }
          return { transaction_hash: hash };
        },
        disconnect: async () => {
          await cartridge.disconnect();
        },
      };

      setWallet(walletObj);
    } catch (err: any) {
      setError(err?.message ?? "Connection failed");
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    if (cartridgeRef.current) {
      try { await cartridgeRef.current.disconnect(); } catch {}
    }
    setWallet(null);
    cartridgeRef.current = null;
  }, []);

  const execute = useCallback(async (
    calls: { contractAddress: string; entrypoint: string; calldata: string[] }[]
  ): Promise<{ transaction_hash: string }> => {
    if (!wallet) throw new Error("StarkZap wallet not connected");
    return wallet.execute(calls);
  }, [wallet]);

  const value: UseStarkZapWalletReturn = {
    wallet,
    address: wallet?.address ?? null,
    connected: !!wallet,
    connecting,
    error,
    connect,
    disconnect,
    execute,
  };

  return (
    <StarkZapWalletContext.Provider value={value}>
      {children}
    </StarkZapWalletContext.Provider>
  );
}

export function useStarkZapWallet(): UseStarkZapWalletReturn {
  const ctx = useContext(StarkZapWalletContext);
  if (!ctx) {
    throw new Error("useStarkZapWallet must be used inside <StarkZapWalletProvider>");
  }
  return ctx;
}
