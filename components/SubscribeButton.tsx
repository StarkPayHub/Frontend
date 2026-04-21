"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "@starknet-react/core";
import { STARKPAY_ADDRESS, MOCK_USDC_ADDRESS } from "@/lib/contracts";
import { executeGasless } from "@/lib/gasless";
import { useStarkZapWallet } from "@/hooks/useStarkZapWallet";

interface SubscribeButtonProps {
  planId: number;
  price: bigint;
  priceDisplay: string;
  isSubscribed?: boolean;
  periodEnd?: number;      // unix timestamp
  className?: string;
}

export function SubscribeButton({
  planId,
  price,
  priceDisplay,
  isSubscribed = false,
  periodEnd,
  className = "",
}: SubscribeButtonProps) {
  const [loading, setLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [gasless, setGasless] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const { account, status } = useAccount();
  const szWallet = useStarkZapWallet();
  const router = useRouter();

  const calls = [
    {
      contractAddress: MOCK_USDC_ADDRESS,
      entrypoint: "approve",
      calldata: [STARKPAY_ADDRESS, price.toString(), "0"],
    },
    {
      contractAddress: STARKPAY_ADDRESS,
      entrypoint: "subscribe",
      calldata: [planId.toString()],
    },
  ];

  async function handleSubscribe() {
    setLoading(true);
    try {
      let txResult: { transaction_hash: string; gasless?: boolean };

      if (szWallet.connected) {
        // StarkZap Cartridge — fully gasless via AVNU paymaster
        const result = await szWallet.execute(calls);
        txResult = { transaction_hash: result.transaction_hash, gasless: true };
      } else if (account) {
        // Existing wallet (Argent/Braavos) — gasless via AVNU proxy
        txResult = await executeGasless(account, calls);
      } else {
        return;
      }

      setGasless(!!txResult.gasless);
      setTxHash(txResult.transaction_hash);
      setCountdown(3);
    } catch (err) {
      console.error("Subscribe failed:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel() {
    if (!account && !szWallet.connected) return;
    setCancelling(true);
    try {
      const call = {
        contractAddress: STARKPAY_ADDRESS,
        entrypoint: "cancel_subscription",
        calldata: [planId.toString()],
      };
      if (szWallet.connected) await szWallet.execute([call]);
      else await account!.execute([call]);
      setConfirmCancel(false);
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      console.error("Cancel failed:", err);
    } finally {
      setCancelling(false);
    }
  }

  // Countdown → redirect to dashboard
  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) { router.push("/dashboard"); return; }
    const t = setTimeout(() => setCountdown(c => (c ?? 1) - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, router]);

  // Just subscribed via this session
  if (txHash) {
    return (
      <div className="w-full text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-emerald-400 font-medium text-sm">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>Subscribed{gasless ? " ⚡ gasless" : ""}! Redirecting in {countdown}s…</span>
        </div>
        <a
          href={`https://sepolia.voyager.online/tx/${txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-zinc-500 hover:text-zinc-300 font-mono"
        >
          {txHash.slice(0, 10)}... View on Voyager ↗
        </a>
      </div>
    );
  }

  // Already subscribed on-chain
  if (isSubscribed) {
    const renewDate = periodEnd
      ? new Date(periodEnd * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : null;
    return (
      <div className="w-full space-y-2">
        <div
          className="w-full h-11 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold"
          style={{
            background: "rgba(52,211,153,0.08)",
            border: "1px solid rgba(52,211,153,0.25)",
            color: "#34d399",
            cursor: "default",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Active Plan
        </div>
        {renewDate && (
          <p style={{ fontSize: 11, textAlign: "center", color: "rgba(161,161,170,0.45)", fontFamily: "ui-monospace,'SF Mono',monospace" }}>
            Renews {renewDate}
          </p>
        )}
        {!confirmCancel ? (
          <button
            onClick={() => setConfirmCancel(true)}
            className="w-full h-9 rounded-lg text-xs font-medium transition-all"
            style={{
              background: "rgba(239,68,68,0.05)",
              border: "1px solid rgba(239,68,68,0.15)",
              color: "rgba(248,113,113,0.85)",
            }}
          >
            Cancel subscription
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => setConfirmCancel(false)}
              disabled={cancelling}
              className="flex-1 h-9 rounded-lg text-xs font-medium transition-all disabled:opacity-50"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.7)",
              }}
            >
              Keep
            </button>
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="flex-1 h-9 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
              style={{
                background: "rgba(239,68,68,0.12)",
                border: "1px solid rgba(239,68,68,0.3)",
                color: "#f87171",
              }}
            >
              {cancelling ? "Cancelling..." : "Confirm cancel"}
            </button>
          </div>
        )}
      </div>
    );
  }

  const isConnected = status === "connected" || szWallet.connected;

  return (
    <button
      onClick={handleSubscribe}
      disabled={loading || !isConnected}
      className={`w-full h-11 rounded-lg font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {loading
        ? "Processing…"
        : !isConnected
        ? "Connect Wallet to Subscribe"
        : szWallet.connected
        ? `⚡ Subscribe ${priceDisplay}/mo — Gasless`
        : `Subscribe ${priceDisplay}/mo`}
    </button>
  );
}
