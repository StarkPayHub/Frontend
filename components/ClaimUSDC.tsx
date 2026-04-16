"use client";

import { useState, useEffect } from "react";
import { useAccount, useProvider } from "@starknet-react/core";
import { hash } from "starknet";
import { Toast } from "@/components/Toast";
import { MOCK_USDC_ADDRESS } from "@/lib/contracts";

export function ClaimUSDC() {
  const [loading, setLoading] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [alreadyClaimed, setAlreadyClaimed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const { address, account } = useAccount();
  const { provider } = useProvider();

  // Check on-chain whether this wallet has already claimed
  useEffect(() => {
    if (!address) { setChecking(false); return; }

    const selector = hash.getSelectorFromName("has_claimed");
    provider.callContract({
      contractAddress: MOCK_USDC_ADDRESS,
      entrypoint: "has_claimed",
      calldata: [address],
    }).then((res: any) => {
      // Cairo bool: result[0] = 0x0 (false) or 0x1 (true)
      const val = Array.isArray(res) ? res[0] : res?.result?.[0] ?? res?.[0];
      setAlreadyClaimed(BigInt(val ?? 0) === 1n);
    }).catch(() => {
      // ignore read errors — just show the button
    }).finally(() => setChecking(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  async function handleClaim() {
    if (!address || !account) return;

    if (alreadyClaimed) {
      setToast({ message: "You've already claimed your 100 USDC for this wallet.", type: "error" });
      return;
    }

    setLoading(true);
    setToast({ message: "Claiming 100 USDC — please confirm in your wallet...", type: "info" });
    try {
      // claim_faucet() — no args, mints exactly 100 USDC, blocked after first claim
      const result = await account.execute([
        {
          contractAddress: MOCK_USDC_ADDRESS,
          entrypoint: "claim_faucet",
          calldata: [],
        },
      ]);

      await provider.waitForTransaction(result.transaction_hash);

      setClaimed(true);
      setAlreadyClaimed(true);
      setToast({ message: "100 USDC has been added to your wallet ✓", type: "success" });
    } catch (err: any) {
      console.error("Claim failed:", err);
      const msg: string = err?.message ?? String(err) ?? "";
      if (msg.toLowerCase().includes("already claimed")) {
        setAlreadyClaimed(true);
        setToast({ message: "You've already claimed your 100 USDC for this wallet.", type: "error" });
      } else {
        setToast({ message: msg || "Claim failed. Please try again.", type: "error" });
      }
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
      ) : alreadyClaimed ? (
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800/60 border border-zinc-700/50 text-zinc-500 text-sm cursor-default select-none">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          Already claimed (100 USDC)
        </div>
      ) : (
        <button
          onClick={handleClaim}
          disabled={loading || checking || !address}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-sm hover:bg-cyan-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="w-2 h-2 rounded-full bg-cyan-400" style={{ flexShrink: 0 }} />
          {loading ? "Confirming on-chain..." : checking ? "Checking..." : "Testnet: Claim 100 Free USDC →"}
        </button>
      )}
    </>
  );
}
