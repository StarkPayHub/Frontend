"use client";
import { useState, useEffect } from "react";
import { RpcProvider, hash } from "starknet";
import { STARKPAY_ADDRESS } from "@/lib/contracts";
import { STARKNET_RPC } from "@/lib/constants";

// Block where the current StarkPay contract was deployed
const DEPLOY_BLOCK = 8_803_950;

export interface SubscriptionEvent {
  user: string;
  planId: number;
  amount: bigint;
  periodEnd: number;
  txHash: string;
  blockNumber: number;
}

export interface RenewalEvent {
  user: string;
  planId: number;
  amount: bigint;
  newPeriodEnd: number;
  txHash: string;
  blockNumber: number;
}

export interface WithdrawalEvent {
  merchant: string;
  amount: bigint;
  txHash: string;
  blockNumber: number;
}

function u256From(low: any, high: any): bigint {
  return BigInt(low ?? 0) + BigInt(high ?? 0) * (2n ** 128n);
}

function addrHex(key: any): string {
  return "0x" + BigInt(key ?? 0).toString(16);
}

// Fetch all pages of events following continuation_token
async function fetchAllEvents(
  provider: RpcProvider,
  params: { address: string; keys?: string[][]; from_block: object; chunk_size: number }
) {
  const all: any[] = [];
  let continuationToken: string | undefined;
  do {
    const filter: any = {
      ...params,
      to_block: "latest",
      ...(continuationToken ? { continuation_token: continuationToken } : {}),
    };
    const res: any = await provider.getEvents(filter);
    all.push(...(res.events ?? []));
    continuationToken = res.continuation_token;
  } while (continuationToken);
  return all;
}

// All SubscriptionCreated events from the contract
export function useSubscriptionEvents() {
  const [events, setEvents] = useState<SubscriptionEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const provider = new RpcProvider({ nodeUrl: STARKNET_RPC });
    const key = hash.getSelectorFromName("SubscriptionCreated");

    (async () => {
      try {
        const rawEvents = await fetchAllEvents(provider, {
          address: STARKPAY_ADDRESS,
          keys: [[key]],
          from_block: { block_number: DEPLOY_BLOCK },
          chunk_size: 100,
        });
        setEvents(rawEvents.map(e => ({
          user: addrHex(e.keys[1]),
          planId: Number(e.data[0] ?? 0),
          amount: u256From(e.data[1], e.data[2]),
          periodEnd: Number(e.data[3] ?? 0),
          txHash: e.transaction_hash,
          blockNumber: Number(e.block_number ?? 0),
        })));
      } catch (err) {
        console.error("SubscriptionCreated events error:", err);
      }
      setIsLoading(false);
    })();
  }, []);

  return { events, isLoading };
}

// RenewalExecuted events
export function useRenewalEvents() {
  const [events, setEvents] = useState<RenewalEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const provider = new RpcProvider({ nodeUrl: STARKNET_RPC });
    const key = hash.getSelectorFromName("RenewalExecuted");

    (async () => {
      try {
        const rawEvents = await fetchAllEvents(provider, {
          address: STARKPAY_ADDRESS,
          keys: [[key]],
          from_block: { block_number: DEPLOY_BLOCK },
          chunk_size: 100,
        });
        setEvents(rawEvents.map(e => ({
          user: addrHex(e.keys[1]),
          planId: Number(e.data[0] ?? 0),
          amount: u256From(e.data[1], e.data[2]),
          newPeriodEnd: Number(e.data[3] ?? 0),
          txHash: e.transaction_hash,
          blockNumber: Number(e.block_number ?? 0),
        })));
      } catch (err) {
        console.error("RenewalExecuted events error:", err);
      }
      setIsLoading(false);
    })();
  }, []);

  return { events, isLoading };
}

// WithdrawalMade events filtered by merchant
export function useWithdrawalEvents(merchant?: string) {
  const [events, setEvents] = useState<WithdrawalEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!merchant) { setIsLoading(false); return; }

    const provider = new RpcProvider({ nodeUrl: STARKNET_RPC });
    const key = hash.getSelectorFromName("WithdrawalMade");
    const merchantNorm = "0x" + BigInt(merchant).toString(16);

    (async () => {
      try {
        const rawEvents = await fetchAllEvents(provider, {
          address: STARKPAY_ADDRESS,
          keys: [[key]],
          from_block: { block_number: DEPLOY_BLOCK },
          chunk_size: 100,
        });
        const filtered = rawEvents
          .filter(e => addrHex(e.keys[1]) === merchantNorm)
          .map(e => ({
            merchant: merchantNorm,
            amount: u256From(e.data[0], e.data[1]),
            txHash: e.transaction_hash,
            blockNumber: Number(e.block_number ?? 0),
          }));
        setEvents(filtered);
      } catch (err) {
        console.error("WithdrawalMade events error:", err);
      }
      setIsLoading(false);
    })();
  }, [merchant]);

  return { events, isLoading };
}
