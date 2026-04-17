/**
 * Gasless execution via AVNU Paymaster (starknet.js 6.x manual flow).
 *
 * Flow:
 *   1. POST /api/paymaster → paymaster_buildTransaction → typed_data + parameters
 *   2. account.signMessage(typed_data) → user signs (no gas popup)
 *   3. POST /api/paymaster → paymaster_executeTransaction → AVNU relays tx
 *
 * Fallback: if paymaster fails → account.execute() biasa (user bayar gas)
 */

import { hash } from "starknet";

export interface GaslessCall {
  contractAddress: string;
  entrypoint: string;
  calldata: string[];
}

async function paymasterRpc(method: string, params: unknown) {
  const res = await fetch("/api/paymaster", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  const json = await res.json();
  if (json.error) {
    const msg = json.error.message ?? JSON.stringify(json.error);
    const data = json.error.data ? ` | detail: ${JSON.stringify(json.error.data)}` : "";
    throw new Error(`${msg}${data}`);
  }
  return json.result;
}

function toHex(value: string): string {
  if (value.startsWith("0x") || value.startsWith("0X")) return value;
  try { return "0x" + BigInt(value).toString(16); } catch { return value; }
}

function toAvnuCalls(calls: GaslessCall[]) {
  return calls.map(c => ({
    to:       c.contractAddress,
    selector: hash.getSelectorFromName(c.entrypoint),
    calldata: c.calldata.map(toHex),
  }));
}

export async function executeGasless(
  account: any,
  calls: GaslessCall[]
): Promise<{ transaction_hash: string; gasless: boolean }> {
  try {
    const avnuCalls = toAvnuCalls(calls);

    // 1. Build — paymaster kasih typed_data untuk di-sign user
    const buildResult = await paymasterRpc("paymaster_buildTransaction", {
      transaction: {
        type: "invoke",
        invoke: {
          user_address: account.address,
          calls: avnuCalls,
        },
      },
      parameters: {
        version: "0x1",
        fee_mode: { mode: "sponsored" },
      },
    });

    const { typed_data, parameters } = buildResult;

    // 2. User sign — wallet popup, tidak ada gas
    const signature = await account.signMessage(typed_data);

    // Normalize signature ke array of hex strings (handle berbagai format starknet.js)
    const sigArray: string[] = Array.isArray(signature)
      ? signature.map((s: any) => toHex(s.toString()))
      : [toHex(signature.r.toString()), toHex(signature.s.toString())];

    // 3. Execute — AVNU relay tx, bayar gas sendiri
    const execResult = await paymasterRpc("paymaster_executeTransaction", {
      transaction: {
        type: "invoke",
        invoke: {
          user_address: account.address,
          typed_data,
          signature: sigArray,
        },
      },
      parameters,
    });

    const txHash = execResult.transaction_hash ?? execResult.transactionHash;
    return { transaction_hash: txHash, gasless: true };
  } catch (err) {
    console.warn("⚡ Gasless failed (reason below) — fallback to normal execute:", err);
    const result = await account.execute(calls);
    return { transaction_hash: result.transaction_hash, gasless: false };
  }
}
