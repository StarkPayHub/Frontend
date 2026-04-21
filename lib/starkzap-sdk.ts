/**
 * StarkZap SDK singleton + helpers.
 *
 * Keeps a single StarkZap instance for the lifetime of the browser session.
 * All gasless executions use feeMode: "sponsored" — AVNU pays gas.
 */

import { StarkZap, StarkSigner } from "starkzap";
import { STARKPAY_ADDRESS, MOCK_USDC_ADDRESS } from "./contracts";

// Cartridge policies — whitelist every StarkPay contract method
export const STARKPAY_POLICIES = [
  { target: MOCK_USDC_ADDRESS as `0x${string}`,  method: "approve"           },
  { target: STARKPAY_ADDRESS  as `0x${string}`,  method: "subscribe"         },
  { target: STARKPAY_ADDRESS  as `0x${string}`,  method: "cancel_subscription" },
  { target: STARKPAY_ADDRESS  as `0x${string}`,  method: "create_plan"       },
  { target: STARKPAY_ADDRESS  as `0x${string}`,  method: "withdraw"          },
  { target: STARKPAY_ADDRESS  as `0x${string}`,  method: "execute_renewal"   },
];

let _sdk: StarkZap | null = null;

export function getStarkZapSDK(): StarkZap {
  if (!_sdk) {
    _sdk = new StarkZap({ network: "sepolia" });
  }
  return _sdk;
}

// ── Keeper wallet (server-side / Node.js) ────────────────────────────────────
export async function createKeeperWallet(privateKey: string) {
  const sdk = new StarkZap({ network: "sepolia" });
  const wallet = await sdk.connectWallet({
    account: { signer: new StarkSigner(privateKey) },
    feeMode: "sponsored",
  });
  await wallet.ensureReady({ deploy: "if_needed" });
  return wallet;
}

// ── Gasless execute wrapper ──────────────────────────────────────────────────
export interface StarkZapCall {
  contractAddress: string;
  entrypoint: string;
  calldata: string[];
}

export async function executeGaslessStarkZap(
  wallet: Awaited<ReturnType<typeof createKeeperWallet>>,
  calls: StarkZapCall[]
): Promise<{ transaction_hash: string }> {
  const tx = await wallet.execute(calls as any[], { feeMode: "sponsored" });
  await tx.wait();
  return { transaction_hash: (tx as any).hash ?? "" };
}
