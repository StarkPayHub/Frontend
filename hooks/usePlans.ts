"use client";
import { useState, useEffect } from "react";
import { useReadContract } from "@starknet-react/core";
import { RpcProvider, Contract } from "starknet";
import { STARKPAY_ADDRESS, starkpayAbi } from "@/lib/contracts";
import { STARKNET_RPC } from "@/lib/constants";

export interface OnChainPlan {
  id: number;
  name: string;
  price: bigint;      // USDC base units (6 decimals)
  interval: number;   // seconds
  merchant: string;
  active: boolean;
}

function feltToStr(felt: any): string {
  try {
    const n = typeof felt === "bigint" ? felt : BigInt(felt ?? 0);
    if (n === 0n) return "";
    const hex = n.toString(16);
    const padded = hex.length % 2 === 0 ? hex : "0" + hex;
    let result = "";
    for (let i = 0; i < padded.length; i += 2) {
      const code = parseInt(padded.slice(i, i + 2), 16);
      if (code > 0) result += String.fromCharCode(code);
    }
    return result;
  } catch {
    return "";
  }
}

function u256ToBigint(val: any): bigint {
  if (!val) return 0n;
  if (typeof val === "bigint") return val;
  if (val.low !== undefined) {
    return BigInt(val.low ?? 0) + BigInt(val.high ?? 0) * (2n ** 128n);
  }
  return 0n;
}

function parseBool(val: any): boolean {
  if (val === true || val === 1n) return true;
  if (val === false || val === 0n) return false;
  if (val?.variant === "True") return true;
  return false;
}

export function usePlans() {
  const [plans, setPlans] = useState<OnChainPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { data: countData } = useReadContract({
    address: STARKPAY_ADDRESS as `0x${string}`,
    abi: starkpayAbi,
    functionName: "get_plan_count",
    args: [],
  });

  useEffect(() => {
    if (countData === undefined) return;
    const count = Number(countData);

    if (count === 0) {
      setPlans([]);
      setIsLoading(false);
      return;
    }

    const provider = new RpcProvider({ nodeUrl: STARKNET_RPC });
    const contract = new Contract(starkpayAbi as any, STARKPAY_ADDRESS, provider);

    (async () => {
      const results: OnChainPlan[] = [];
      for (let i = 1; i <= count; i++) {
        try {
          const p = await contract.get_plan(i);
          results.push({
            id: i,
            name: feltToStr(p.name),
            price: u256ToBigint(p.price),
            interval: Number(p.interval ?? 0),
            merchant: "0x" + BigInt(p.merchant ?? 0).toString(16),
            active: parseBool(p.active),
          });
        } catch (err) {
          console.error(`Error fetching plan ${i}:`, err);
        }
      }
      setPlans(results);
      setIsLoading(false);
    })();
  }, [countData]);

  return { plans, isLoading };
}
