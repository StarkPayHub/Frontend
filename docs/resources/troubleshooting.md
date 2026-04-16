# Troubleshooting

---

## SDK Errors

### "useStarkPayConfig must be used inside StarkPayProvider"

A component or hook from `@starkpay/sdk` was rendered outside `<StarkPayProvider>`.

**Fix:** Wrap your app (or the relevant section) with `<StarkPayProvider>`:

```tsx
// app/layout.tsx or main.tsx
<StarkPayProvider>
  <App />  {/* ← all SDK usage must be inside here */}
</StarkPayProvider>
```

---

### "Module not found: @starkpay/sdk"

The package isn't installed or the workspace link is broken.

**Fix:**
```bash
npm install @starkpay/sdk
# or if using pnpm:
pnpm add @starkpay/sdk
```

If you're using the SDK from a local monorepo build:
```bash
cd packages/sdk && pnpm build
cd ../.. && pnpm install  # re-link workspace
```

---

### Build fails in Next.js

**Fix:** Add `transpilePackages` to `next.config.js`:

```js
const nextConfig = {
  transpilePackages: ['@starkpay/sdk'],
}
module.exports = nextConfig
```

---

### `isActive` always returns `false`

Make sure you're using SDK version `0.3.0` or later. Earlier versions had a bug reading `current_period_end`.

```bash
npm install @starkpay/sdk@latest
```

---

### Subscription status doesn't update after subscribing

Hooks poll the RPC every ~10 seconds. If the status doesn't update:
1. Hard-refresh the page
2. Verify the transaction confirmed on [Voyager](https://sepolia.voyager.online)
3. Check that the contract address in your provider matches the deployed address

---

## Wallet / Transaction Errors

### "Connect Wallet" button does nothing

Make sure Argent X or Braavos is installed and unlocked in your browser.

---

### Transaction fails immediately

Common causes:
- **Insufficient USDC** — claim test USDC from the pricing page
- **Insufficient gas** — claim STRK/ETH from [faucet.starknet.io](https://faucet.starknet.io)
- **Wrong network** — switch your wallet to Starknet Sepolia

---

### Wallet popup doesn't appear

Your popup blocker may be blocking it. Allow popups for the site in your browser settings.

---

## Merchant Dashboard Errors

### Revenue shows $0.00 but I have subscribers

Make sure you're connected with the **same wallet address** that created the plans. Stats are per-merchant address.

---

### "Plan limit reached" when creating a plan

You've hit the plan creation limit for your tier. Subscribe to a higher StarkPayHub plan to increase your limit. See [Tier System](../for-merchants/tier-system.md).

---

## Keeper Bot Errors

### Found 0 unique subscriptions

- Nobody has subscribed yet, OR
- `DEPLOY_BLOCK` is set too high and events aren't being read. Try `DEPLOY_BLOCK=0`.

### Failed: Insufficient balance

A subscriber's wallet didn't have enough USDC for renewal. This is expected behavior — the keeper logs it and continues. The subscription becomes inactive.

### Keeper wallet out of gas

Check the keeper wallet balance on [sepolia.starkscan.co](https://sepolia.starkscan.co). Fund from [faucet.starknet.io](https://faucet.starknet.io).

---

## USDC Amount Issues

All USDC values use **6 decimal places**:

```ts
// ✅ Correct
const price = 15_000_000n  // $15.00

// ❌ Wrong — this is $0.000015
const price = 15n
```

The SDK handles this conversion automatically via `buildSubscribeCalls`. Only set raw values manually if using the low-level call builders.
