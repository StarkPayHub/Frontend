"use client";
import { useReadContract, useAccount } from "@starknet-react/core";
import { STARKPAY_ADDRESS, starkpayAbi } from "@/lib/contracts";

function u256ToBigint(val: any): bigint {
  if (!val) return 0n;
  if (typeof val === "bigint") return val;
  if (typeof val === "number") return BigInt(val);
  if (typeof val === "string") return BigInt(val);
  if (val.low !== undefined) {
    const low = typeof val.low === "bigint" ? val.low : BigInt(val.low ?? 0);
    const high = typeof val.high === "bigint" ? val.high : BigInt(val.high ?? 0);
    return low + high * (2n ** 128n);
  }
  return 0n;
}

export function usdcDisplay(raw: bigint): string {
  if (raw === 0n) return "$0.00";
  const dollars = Number(raw) / 1_000_000;
  return `$${dollars.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function useMerchantStats() {
  const { address } = useAccount();

  const { data, isLoading, refetch } = useReadContract({
    address: STARKPAY_ADDRESS as `0x${string}`,
    abi: starkpayAbi,
    functionName: "get_merchant_stats",
    args: address ? [address] : undefined,
    enabled: !!address,
  });

  const stats = data as any;
  const totalRevenue = u256ToBigint(stats?.total_revenue);
  const withdrawable = u256ToBigint(stats?.withdrawable);
  const activeSubs   = stats ? Number(stats.active_subs ?? 0) : 0;
  const txCount      = stats ? Number(stats.tx_count ?? 0) : 0;

  return {
    totalRevenue,
    withdrawable,
    activeSubs,
    txCount,
    totalRevenueDisplay: usdcDisplay(totalRevenue),
    withdrawableDisplay: usdcDisplay(withdrawable),
    isLoading,
    refetch,
  };
}
