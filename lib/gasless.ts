/**
 * Gasless execution via AVNU Paymaster.
 * API key disimpan di server (AVNU_API_KEY env var), frontend hanya hit /api/paymaster proxy.
 *
 * Flow:
 *   1. POST /api/paymaster → paymaster_buildTransaction → dapat typed_data + parameters
 *   2. account.signMessage(typed_data) → user sign di wallet (0 gas)
 *   3. POST /api/paymaster → paymaster_executeTransaction → AVNU relay tx
 *
 * Fallback: kalau paymaster gagal → account.execute() biasa (user bayar gas).
 *
 * Format AVNU JSON-RPC yang benar (probed dari API):
 * - transaction.type: "invoke" (lowercase)
 * - transaction.invoke.user_address, transaction.invoke.calls
 * - calls: { to, selector (hex hash of entrypoint), calldata }
 * - parameters.version: "0x1"
 * - parameters.fee_mode: { mode: "sponsored" }  (snake_case)
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
  if (json.error) throw new Error(json.error.message ?? JSON.stringify(json.error));
  return json.result;
}

/** Normalize felt value to 0x hex string — AVNU requires hex, not decimal */
function toHex(value: string): string {
  if (value.startsWith("0x") || value.startsWith("0X")) return value;
  try { return "0x" + BigInt(value).toString(16); } catch { return value; }
}

/** Convert GaslessCall[] to AVNU call format: { to, selector, calldata[] } */
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

    // 1. Build — paymaster kasih typed_data untuk di-sign
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

    // 2. User sign typed data — wallet popup, tanpa gas
    const signature = await account.signMessage(typed_data);
    const sigArray = (
      Array.isArray(signature)
        ? signature.map(String)
        : [String(signature.r), String(signature.s)]
    ).map(toHex); // AVNU requires hex strings, not decimal

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
