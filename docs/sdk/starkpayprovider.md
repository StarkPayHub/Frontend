# StarkPayProvider

The root provider that configures Starknet connection and StarkPay contract addresses. Must wrap your entire app (or the parts that use SDK components/hooks).

---

## Usage

```tsx
import { StarkPayProvider } from '@starkpay/sdk'

// Minimal — uses deployed Sepolia defaults
<StarkPayProvider>
  <App />
</StarkPayProvider>

// Full configuration
<StarkPayProvider
  contractAddress="0x..."
  usdcAddress="0x..."
  rpcUrl="https://starknet-sepolia.g.alchemy.com/starknet/..."
  network="sepolia"
  gasless={false}
>
  <App />
</StarkPayProvider>
```

---

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `contractAddress` | `string` | Deployed Sepolia address | StarkPay contract address |
| `usdcAddress` | `string` | Deployed Sepolia MockUSDC | USDC token contract address |
| `rpcUrl` | `string` | Public Sepolia RPC | Starknet RPC endpoint |
| `network` | `'sepolia' \| 'mainnet'` | `'sepolia'` | Network to connect to |
| `gasless` | `boolean` | `false` | Sponsor gas via AVNU Paymaster |
| `children` | `ReactNode` | required | — |

---

## Default Addresses (Sepolia)

```
StarkPay: 0x058a1e8058620d285047c7ee3df15804898070e6788fbffe004a29ffa554aa2c
MockUSDC: 0x03f2e44f91a2994b1748473aebe2512a280a4ada60df57d31886d3faf95a0776
```

You don't need to pass these during development — the provider is pre-configured for Sepolia.

---

## Gasless Transactions

When `gasless={true}`, the SDK routes transactions through [AVNU Paymaster](https://docs.avnu.fi/), which pays gas on the user's behalf.

```tsx
<StarkPayProvider gasless={true}>
  <App />
</StarkPayProvider>
```

> **Note**: Gasless requires contract whitelisting by AVNU. On Sepolia testnet, gasless may not work for custom contract deployments. For local development, use `gasless={false}` and fund users via the [Starknet Faucet](https://faucet.starknet.io).

---

## Error: "useStarkPayConfig must be used inside StarkPayProvider"

This error means a component or hook from the SDK was rendered outside of `<StarkPayProvider>`. Make sure the provider wraps all pages/components that use the SDK.

```tsx
// ✅ Correct — provider at root
<StarkPayProvider>
  <Header />      {/* can use SDK hooks */}
  <PricingPage /> {/* can use SDK hooks */}
  <Footer />
</StarkPayProvider>

// ❌ Wrong — component outside provider
<Header />
<StarkPayProvider>
  <PricingPage />
</StarkPayProvider>
```
