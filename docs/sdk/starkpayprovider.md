# StarkPayProvider

The root provider that configures the Starknet connection and StarkPay contract addresses. Must wrap your entire app (or any parts that use SDK hooks/components).

---

## Usage

```tsx
import { StarkPayProvider } from '@starkpay/sdk'

// Minimal — uses deployed Sepolia defaults, no config needed
<StarkPayProvider>
  <App />
</StarkPayProvider>

// With gasless (users pay zero gas — Enterprise tier merchants only)
<StarkPayProvider gasless>
  <App />
</StarkPayProvider>

// Full custom config
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
| `gasless` | `boolean` | `false` | Enable tier-gated gasless subscriptions |
| `gaslessEndpoint` | `string` | StarkPayHub hosted endpoint | Override gasless sponsorship URL (for self-hosted) |
| `children` | `ReactNode` | required | — |

---

## Default Addresses (Sepolia Testnet)

These are pre-configured — you don't need to pass them during development:

| Contract | Address |
|---|---|
| StarkPay v9 | `0x0156aa73efd3389c5552be7c61e07faa7bdefca67af1f0e604c77ed3c1fd86ad` |
| MockUSDC | `0x021ab8a417e9cb94bf02ff0595bca7506d1237ffed6b5f80ad39460368955891` |

---

## Gasless Subscriptions (Tier-Gated)

When `gasless={true}`, the SDK attempts to sponsor gas for subscribe transactions via StarkPayHub's paymaster. **No API key needed from the developer** — the SDK calls StarkPayHub's hosted endpoint automatically.

```tsx
<StarkPayProvider gasless>
  <App />
</StarkPayProvider>
```

### How it works

1. User clicks subscribe
2. SDK sends the transaction to StarkPayHub's gasless endpoint
3. Server checks if the plan's **merchant is on Enterprise tier**
4. If Enterprise → AVNU Paymaster sponsors the gas → user signs once (0 gas)
5. If not Enterprise → SDK automatically falls back to normal execution (user pays gas)
6. Subscription is activated — Enterprise subscribers paid only USDC, no ETH

### Tier requirement

| Merchant Tier | Gasless Available? |
|---|---|
| Free | No — user pays gas |
| Starter | No — user pays gas |
| Pro | No — user pays gas |
| **Enterprise** | **Yes — gas is sponsored** |

> Merchants must subscribe to the Enterprise plan ($99/mo) on [starkpayhub.vercel.app/pricing](https://starkpayhub.vercel.app/pricing) to unlock gasless for their subscribers.

### Automatic fallback

If gasless is rejected (non-Enterprise merchant, AVNU down, etc.), the SDK silently falls back to `account.execute()` — user pays gas normally. No error shown to the user.

### Self-hosted endpoint

If you host your own StarkPayHub instance, override the endpoint:

```tsx
<StarkPayProvider gasless gaslessEndpoint="https://your-domain.com/api/gasless-subscribe">
  <App />
</StarkPayProvider>
```

---

## Common Errors

### "useStarkPayConfig must be used inside StarkPayProvider"

A hook or component from the SDK was rendered outside of `<StarkPayProvider>`. Make sure the provider wraps all pages that use the SDK:

```tsx
// Correct
<StarkPayProvider>
  <Header />
  <PricingPage />
</StarkPayProvider>

// Wrong — component is outside the provider
<Header />
<StarkPayProvider>
  <PricingPage />
</StarkPayProvider>
```

### "Contract not found" when using Argent Web Wallet

Argent Web Wallet only works on **Mainnet**. For Sepolia testing, use **Argent X extension** or **Braavos extension** instead. See [Connect Your Wallet](../for-users/connect-wallet.md).
