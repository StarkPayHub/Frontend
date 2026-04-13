"use client";

import { useState } from "react";
import { useAccount, useProvider } from "@starknet-react/core";
import { MOCK_USDC_ADDRESS } from "@/lib/contracts";
import { Toast } from "@/components/Toast";

export function ClaimUSDC() {
  const [loading, setLoading] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const { account, address } = useAccount();
  const { provider } = useProvider();

  async function handleClaim() {
    if (!account || !address) return;
    setLoading(true);
    setToast({ message: "Transaction submitted — waiting for confirmation...", type: "info" });
    try {
      const result = await account.execute([
        {
          contractAddress: MOCK_USDC_ADDRESS,
          entrypoint: "mint",
          calldata: [address, "100000000", "0"], // 100 USDC (6 decimals)
        },
      ]);

      // Wait for tx confirmed on-chain
      await provider.waitForTransaction(result.transaction_hash);

      setClaimed(true);
      setToast({ message: "100 USDC has been added to your wallet ✓", type: "success" });
    } catch (err: any) {
      console.error("Claim failed:", err);
      setToast({ message: err?.message?.slice(0, 80) ?? "Claim failed. Please try again.", type: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      )}

      {claimed ? (
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-sm">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          100 USDC claimed to your wallet
        </div>
      ) : (
        <button
          onClick={handleClaim}
          disabled={loading || !account}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-sm hover:bg-cyan-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="w-2 h-2 rounded-full bg-cyan-400" style={{ flexShrink: 0 }} />
          {loading ? "Confirming on-chain..." : "Testnet: Claim 100 Free USDC →"}
        </button>
      )}
    </>
  );
}
