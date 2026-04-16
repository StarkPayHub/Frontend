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

// With gasless (users pay zero gas)
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
| `gasless` | `boolean` | `false` | Sponsor gas via AVNU Paymaster |
| `children` | `ReactNode` | required | — |

---

## Default Addresses (Sepolia Testnet)

These are pre-configured — you don't need to pass them during development:

| Contract | Address |
|---|---|
| StarkPay | `0x04cf20808f1a9db9a4da75eb59566416bba3f2db14821cdeb0e8d4852f31aa14` |
| MockUSDC | `0x029b1a04e2ceb7ef124e0af044d3576b8c6210b8bc437e907b69d983d6ea87a9` |

---

## Gasless Transactions

When `gasless={true}`, the SDK routes transactions through [AVNU Paymaster](https://docs.avnu.fi/), which pays gas on behalf of the user.

```tsx
<StarkPayProvider gasless>
  <App />
</StarkPayProvider>
```

**How it works:**
1. User clicks subscribe
2. AVNU builds the transaction and asks user to sign
3. User signs (no gas required)
4. AVNU relays the transaction to the network
5. Subscription is activated — user paid only USDC, no ETH

> Available on Sepolia testnet for free. For mainnet, contact AVNU for whitelisting.

---

## Common Errors

### "useStarkPayConfig must be used inside StarkPayProvider"

A hook or component from the SDK was rendered outside of `<StarkPayProvider>`. Make sure the provider wraps all pages that use the SDK:

```tsx
// ✅ Correct
<StarkPayProvider>
  <Header />       {/* can use SDK hooks */}
  <PricingPage />  {/* can use SDK hooks */}
</StarkPayProvider>

// ❌ Wrong — component is outside the provider
<Header />
<StarkPayProvider>
  <PricingPage />
</StarkPayProvider>
```

### "Contract not found" when using Argent Web Wallet

Argent Web Wallet only works on **Mainnet**. For Sepolia testing, use **Argent X extension** or **Braavos extension** instead. See [Connect Your Wallet](../for-users/connect-wallet.md).
