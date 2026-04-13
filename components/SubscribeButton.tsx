"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "@starknet-react/core";
import { STARKPAY_ADDRESS, MOCK_USDC_ADDRESS } from "@/lib/contracts";

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
  const [txHash, setTxHash] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const { account, status } = useAccount();
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
    if (!account) return;
    setLoading(true);
    try {
      const result = await account.execute(calls);
      setTxHash(result.transaction_hash);
      setCountdown(3);
    } catch (err) {
      console.error("Subscribe failed:", err);
    } finally {
      setLoading(false);
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
          <span>Subscribed! Redirecting to dashboard in {countdown}s…</span>
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
      <div className="w-full">
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
          <p style={{ fontSize: 11, textAlign: "center", marginTop: 6, color: "rgba(161,161,170,0.45)", fontFamily: "ui-monospace,'SF Mono',monospace" }}>
            Renews {renewDate}
          </p>
        )}
      </div>
    );
  }

  const isConnected = status === "connected";

  return (
    <button
      onClick={handleSubscribe}
      disabled={loading || !isConnected}
      className={`w-full h-11 rounded-lg font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {loading
        ? "Processing..."
        : !isConnected
        ? "Connect Wallet to Subscribe"
        : `Subscribe ${priceDisplay}/mo`}
    </button>
  );
}
