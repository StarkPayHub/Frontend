"use client";
import { useState, useEffect, useCallback } from "react";
import { useAccount } from "@starknet-react/core";
import { RpcProvider, Contract } from "starknet";
import { STARKPAY_ADDRESS, starkpayAbi } from "@/lib/contracts";
import { STARKNET_RPC, PLANS } from "@/lib/constants";
import { useStarkZapWallet } from "@/hooks/useStarkZapWallet";

export interface MySubscription {
  planId: number;
  planName: string;
  priceDisplay: string;
  price: bigint;
  start: number;
  currentPeriodEnd: number;
  active: boolean;
  isExpired: boolean;
}

function parseBool(val: any): boolean {
  if (val === true || val === 1n) return true;
  if (val === false || val === 0n) return false;
  if (val?.variant === "True") return true;
  return false;
}

export function useMySubscriptions() {
  const { address: snAddr } = useAccount();
  const { address: szAddr } = useStarkZapWallet();
  const address = snAddr ?? szAddr ?? undefined;
  const [subscriptions, setSubscriptions] = useState<MySubscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!address) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const provider = new RpcProvider({ nodeUrl: STARKNET_RPC });
    const contract = new Contract(starkpayAbi as any, STARKPAY_ADDRESS, provider);
    const now = Math.floor(Date.now() / 1000);

    const results: MySubscription[] = [];
    for (const plan of PLANS.filter(p => p.price > 0n)) {
      try {
        const sub = await contract.get_subscription(address, plan.id);
        const active = parseBool(sub.active);
        if (!active) continue;
        results.push({
          planId: plan.id,
          planName: plan.name,
          priceDisplay: plan.priceDisplay,
          price: plan.price,
          start: Number(sub.start ?? 0),
          currentPeriodEnd: Number(sub.current_period_end ?? 0),
          active,
          isExpired: Number(sub.current_period_end ?? 0) < now,
        });
      } catch { /* plan not subscribed */ }
    }
    setSubscriptions(results);
    setIsLoading(false);
  }, [address]);

  useEffect(() => { fetch(); }, [fetch]);

  return { subscriptions, isLoading, refetch: fetch };
}
