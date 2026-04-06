# Next Plan: Starkzap + Privy Integration

## Goal
Add social login / email auth to StarkPayHub using Starkzap SDK + Privy.
Target: Starkzap Developer Bounty Program (Builder Track, $3,000 total).

## What This Enables
User can subscribe to a plan using only their Gmail/Twitter/email — no wallet install needed.
Flow: Login with Google → Starkzap auto-deploys Starknet wallet → approve USDC + subscribe (gasless, sponsored) → done.
This is the "Web2 UX → onchain UX" the bounty specifically asks for.

---

## Step-by-Step Integration Plan

### 1. Install dependencies
```bash
pnpm add starkzap @privy-io/react-auth
```

### 2. Get credentials
- **Privy App ID**: Sign up at https://privy.io → create app → copy App ID
- **AVNU Paymaster API Key**: Sign up at https://portal.avnu.fi → copy API key

### 3. Create backend signer-context route
File: `app/api/signer-context/route.ts`
- Receives Privy access token from client
- Verifies token with Privy server SDK
- Returns signer context (wallet key material) for Starkzap to use
- Keeps private key server-side, never exposed to client

```typescript
// app/api/signer-context/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  const accessToken = authHeader?.replace("Bearer ", "");
  // verify with Privy, return signer context
  // see Privy server SDK docs
}
```

### 4. Create StarkzapProvider client component
File: `components/StarkzapProvider.tsx`
- Wraps app with `PrivyProvider`
- Initializes `new StarkZap({ network: "sepolia", paymaster: { ... } })`
- Exposes SDK via React context

### 5. Add SocialLoginButton component
File: `components/SocialLoginButton.tsx`
- "Continue with Google / Email" button
- Calls `privy.login()` → gets access token → calls `sdk.onboard()` with Privy strategy
- On success: wallet ready, redirect to subscribe flow

```typescript
const { wallet } = await sdk.onboard({
  strategy: OnboardStrategy.Privy,
  privy: {
    resolve: async () => {
      const accessToken = await privy.getAccessToken();
      return fetch("/api/signer-context", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
      }).then(r => r.json());
    },
  },
  accountPreset: accountPresets.argentXV050,
  feeMode: "sponsored",
  deploy: "if_needed",
});
```

### 6. Wire up to subscribe flow
In `components/SubscribeButton.tsx`:
- Check if user has Starkzap wallet (Privy path) OR starknet-react wallet (Argent/Braavos path)
- If Starkzap wallet: use `wallet.execute([approveCall, subscribeCall], { feeMode: "sponsored" })`
- If starknet-react wallet: use existing `account.execute(calls)` logic

### 7. Update Pricing page
Add "Subscribe with Email" option alongside existing "Connect Wallet" flow.
Two paths:
- Web3 user: Connect Argent X / Braavos → subscribe (existing flow)
- Web2 user: Login with Google/Email → subscribe (new Starkzap flow)

---

## Architecture Overview

```
Pricing Page
├── [Existing] ConnectWallet → starknet-react → account.execute()
└── [New] SocialLoginButton → Privy → Starkzap.onboard() → wallet.execute()
                                         ↓
                              /api/signer-context (server-side)
                                         ↓
                              AVNU Paymaster (gasless, sponsored)
```

---

## Key Files to Create/Modify

| File | Action |
|------|--------|
| `components/StarkzapProvider.tsx` | Create — wraps PrivyProvider + StarkZap init |
| `components/SocialLoginButton.tsx` | Create — Google/Email login button |
| `app/api/signer-context/route.ts` | Create — server-side Privy verification |
| `app/layout.tsx` | Modify — wrap with StarkzapProvider |
| `components/SubscribeButton.tsx` | Modify — support both wallet paths |
| `app/pricing/page.tsx` | Modify — add social login option |

---

## Environment Variables Needed
```env
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
PRIVY_APP_SECRET=your_privy_secret          # server-side only
AVNU_PAYMASTER_API_KEY=your_avnu_key        # server-side only
```

---

## Bounty Submission Notes
- Deploy to Vercel (sepolia first, mainnet preferred for judging)
- Tweet: show the "subscribe with email, zero ETH" flow as a screen recording
- Tag @Starknet, include working app URL
- Submission deadline: Fridays (Apr 3, 10, 17) — target Apr 17
