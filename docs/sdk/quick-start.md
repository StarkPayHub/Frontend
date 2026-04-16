# Quick Start

Add on-chain subscriptions to your SaaS in minutes.

---

## Option A — Scaffold a New Project (Recommended)

```bash
npx starkpay init
```

Creates a complete Next.js starter with everything pre-wired. Then:

```bash
npm install
# Edit lib/starkpay.ts → set your PLAN_ID
npm run dev
```

Done. Your app has a pricing page, subscribe button, and subscription-gated dashboard.

---

## Option B — Add to Existing Project

### Step 1 — Install

```bash
npm install @starkpay/sdk
```

### Step 2 — Wrap your app

```tsx
// app/layout.tsx
import { StarkPayProvider } from '@starkpay/sdk'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <StarkPayProvider>{children}</StarkPayProvider>
      </body>
    </html>
  )
}
```

### Step 3 — Get your Plan ID

Go to the [Merchant Dashboard](https://starkpayhub.vercel.app/merchant), create a plan, and copy the **Plan ID** shown after creation (e.g. `4`).

### Step 4 — Add a subscribe button

```tsx
'use client'
import { StarkPayButton } from '@starkpay/sdk'

export default function PricingPage() {
  return (
    <StarkPayButton
      planId={4}
      onSuccess={(txHash) => console.log('Subscribed!', txHash)}
    />
  )
}
```

That's it. Users can now subscribe with USDC on Starknet.

---

## Gate Content Behind Subscription

Protect any page — redirect users to pricing if they're not subscribed:

```tsx
'use client'
import { useSubscription } from '@starkpay/sdk'
import { useAccount } from '@starknet-react/core'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardPage() {
  const { address } = useAccount()
  const { isActive, isLoading } = useSubscription(address, 4) // your plan ID
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isActive) {
      router.replace('/') // redirect to pricing
    }
  }, [isLoading, isActive, router])

  if (isLoading) return <p>Checking subscription...</p>

  return <div>Premium content — visible to subscribers only.</div>
}
```

---

## Gasless Subscriptions

Enable AVNU Paymaster so users pay **zero gas** — they only sign the USDC payment:

```tsx
<StarkPayProvider gasless>
  <App />
</StarkPayProvider>
```

With `gasless` enabled:
- User opens wallet → signs once → done
- No ETH needed for gas — AVNU sponsors it
- Works on Sepolia testnet out of the box

---

## Show a Full Pricing Table

Fetch all active plans from the contract and render them automatically:

```tsx
'use client'
import { PricingTable } from '@starkpay/sdk'
import { useRouter } from 'next/navigation'

export default function PricingPage() {
  const router = useRouter()

  return (
    <PricingTable
      onSuccess={() => router.push('/dashboard')}
      className="grid grid-cols-1 md:grid-cols-3 gap-6"
    />
  )
}
```

---

## Check Subscription Status

```tsx
'use client'
import { useSubscription } from '@starkpay/sdk'
import { useAccount } from '@starknet-react/core'

export function StatusBadge({ planId }: { planId: number }) {
  const { address } = useAccount()
  const { isActive, periodEnd, isLoading } = useSubscription(address, planId)

  if (isLoading) return null

  const renewDate = periodEnd
    ? new Date(Number(periodEnd) * 1000).toLocaleDateString()
    : null

  return (
    <span>
      {isActive ? `Active — renews ${renewDate}` : 'No subscription'}
    </span>
  )
}
```

---

## AI-Assisted Development

The SDK includes a built-in MCP server so you can ask AI assistants about integration without leaving your editor:

```bash
claude mcp add starkpay -- npx starkpay mcp
```

→ See [MCP Server](mcp-server.md) for full setup.
