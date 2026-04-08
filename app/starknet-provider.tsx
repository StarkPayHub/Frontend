"use client";

import { sepolia } from "@starknet-react/chains";
import {
  StarknetConfig,
  jsonRpcProvider,
  argent,
  braavos,
} from "@starknet-react/core";
import { STARKNET_RPC } from "@/lib/constants";

export function StarknetProvider({ children }: { children: React.ReactNode }) {
  return (
    <StarknetConfig
      chains={[sepolia]}
      provider={jsonRpcProvider({ rpc: () => ({ nodeUrl: STARKNET_RPC }) })}
      connectors={[argent(), braavos()]}
    >
      {children}
    </StarknetConfig>
  );
}
