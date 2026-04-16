"use client";

import { sepolia } from "@starknet-react/chains";
import {
  StarknetConfig,
  jsonRpcProvider,
  argent,
  braavos,
} from "@starknet-react/core";
import { WebWalletConnector } from "@starkpay/sdk";
import { STARKNET_RPC } from "@/lib/constants";

export function StarknetProvider({ children }: { children: React.ReactNode }) {
  return (
    <StarknetConfig
      chains={[sepolia]}
      provider={jsonRpcProvider({ rpc: () => ({ nodeUrl: STARKNET_RPC }) })}
      connectors={[
        argent(),
        braavos(),
        new WebWalletConnector({ url: "https://web.argent.xyz" }),
      ]}
    >
      {children}
    </StarknetConfig>
  );
}
