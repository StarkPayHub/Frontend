/**
 * Tier-gated gasless endpoint.
 *
 * Purpose: SDK consumers call this URL for paymaster ops. Server validates
 * that (a) the tx is a StarkPay subscribe, and (b) the target plan's merchant
 * is on the Enterprise tier. Only Enterprise merchants' subscribers get their
 * gas sponsored by StarkPayHub — everyone else falls back to paying gas.
 *
 * Flow:
 *   paymaster_buildTransaction → validate calls → enterprise tier check → forward AVNU
 *   paymaster_executeTransaction → forward AVNU (already gated at build step)
 */

import { RpcProvider, Contract, hash } from "starknet";
import { STARKPAY_ADDRESS, starkpayAbi } from "@/lib/contracts";

const AVNU_PAYMASTER = "https://sepolia.paymaster.avnu.fi";
const RPC_URL =
  process.env.STARKNET_RPC ??
  "https://starknet-sepolia.public.blastapi.io/rpc/v0_7";

const ENTERPRISE_LIMIT = BigInt("0xFFFFFFFFFFFFFFFF");
const SUBSCRIBE_SELECTOR = BigInt(hash.getSelectorFromName("subscribe"));
const STARKPAY_ADDR_BI = BigInt(STARKPAY_ADDRESS);

type JsonRpcError = { code: number; message: string };

function rpcError(id: unknown, error: JsonRpcError, status = 200) {
  return Response.json({ jsonrpc: "2.0", id: id ?? null, error }, { status });
}

function findSubscribeCall(calls: any[]): { planId: bigint } | null {
  if (!Array.isArray(calls)) return null;
  for (const c of calls) {
    try {
      if (
        BigInt(c.to) === STARKPAY_ADDR_BI &&
        BigInt(c.selector) === SUBSCRIBE_SELECTOR
      ) {
        const planId = BigInt(c.calldata?.[0] ?? "0");
        return { planId };
      }
    } catch {
      // ignore malformed entry
    }
  }
  return null;
}

async function isEnterpriseMerchant(planId: bigint): Promise<boolean> {
  const provider = new RpcProvider({ nodeUrl: RPC_URL });
  const contract = new Contract(starkpayAbi as any, STARKPAY_ADDRESS, provider);

  const plan: any = await contract.get_plan(planId);
  const merchant = plan.merchant;
  if (!merchant) return false;

  const merchantHex = "0x" + BigInt(merchant).toString(16);
  const limit: any = await contract.get_merchant_plan_limit(merchantHex);
  return BigInt(limit) >= ENTERPRISE_LIMIT;
}

export async function POST(request: Request) {
  const apiKey = process.env.AVNU_API_KEY;
  if (!apiKey) {
    return rpcError(null, { code: -32000, message: "AVNU_API_KEY not configured" }, 500);
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return rpcError(null, { code: -32700, message: "Invalid JSON" }, 400);
  }

  const { id, method, params } = body as any;

  if (method === "paymaster_buildTransaction") {
    const calls = params?.transaction?.invoke?.calls;
    const subscribe = findSubscribeCall(calls);
    if (!subscribe) {
      return rpcError(id, {
        code: -32000,
        message:
          "Gasless sponsorship only available for StarkPay subscribe calls",
      });
    }

    try {
      const ok = await isEnterpriseMerchant(subscribe.planId);
      if (!ok) {
        return rpcError(id, {
          code: -32001,
          message:
            "Merchant is not on Enterprise tier — gasless sponsorship unavailable",
        });
      }
    } catch (err: any) {
      return rpcError(id, {
        code: -32002,
        message: `Tier check failed: ${err?.message ?? String(err)}`,
      });
    }

    if (params?.parameters?.fee_mode?.mode !== "sponsored") {
      return rpcError(id, {
        code: -32003,
        message: "Only sponsored fee_mode is accepted on this endpoint",
      });
    }
  }

  const res = await fetch(AVNU_PAYMASTER, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-paymaster-api-key": apiKey,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return Response.json(data, { status: res.status });
}
