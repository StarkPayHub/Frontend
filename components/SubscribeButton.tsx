"use client";

import { useState } from "react";
import { useAccount } from "@starknet-react/core";
import { STARKPAY_ADDRESS, MOCK_USDC_ADDRESS } from "@/lib/contracts";

interface SubscribeButtonProps {
  planId: number;
  price: bigint;
  priceDisplay: string;
  className?: string;
}

export function SubscribeButton({
  planId,
  price,
  priceDisplay,
  className = "",
}: SubscribeButtonProps) {
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const { account, status } = useAccount();

  async function handleSubscribe() {
    if (!account) return;
    setLoading(true);
    try {
      // Multicall: approve USDC + subscribe in 1 transaction
      const result = await account.execute([
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
      ]);
      setTxHash(result.transaction_hash);
    } catch (err) {
      console.error("Subscribe failed:", err);
    } finally {
      setLoading(false);
    }
  }

  if (txHash) {
    return (
      <div className="w-full text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-emerald-400 font-medium">
          <span>✓</span>
          <span>Subscribed!</span>
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
