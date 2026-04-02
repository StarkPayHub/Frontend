"use client";

import { useState } from "react";
import { useAccount } from "@starknet-react/core";
import { MOCK_USDC_ADDRESS } from "@/lib/contracts";

export function ClaimUSDC() {
  const [loading, setLoading] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const { account, address } = useAccount();

  async function handleClaim() {
    if (!account || !address) return;
    setLoading(true);
    try {
      await account.execute([
        {
          contractAddress: MOCK_USDC_ADDRESS,
          entrypoint: "mint",
          calldata: [address, "100000000", "0"], // 100 USDC (6 decimals)
        },
      ]);
      setClaimed(true);
    } catch (err) {
      console.error("Claim failed:", err);
    } finally {
      setLoading(false);
    }
  }

  if (claimed) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-sm">
        <span className="w-2 h-2 rounded-full bg-cyan-400" />
        100 USDC claimed to your wallet ✓
      </div>
    );
  }

  return (
    <button
      onClick={handleClaim}
      disabled={loading || !account}
      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-sm hover:bg-cyan-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <span className="w-2 h-2 rounded-full bg-cyan-400" />
      {loading ? "Claiming..." : "Testnet: Claim 100 Free USDC →"}
    </button>
  );
}
