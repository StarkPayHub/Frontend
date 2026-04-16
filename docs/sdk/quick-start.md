# Quick Start

Add on-chain subscriptions to your SaaS in 3 steps.

---

## Step 1 — Wrap your app with StarkPayProvider

**Next.js App Router** (`app/providers.tsx`):

```tsx
'use client'
import { StarkPayProvider } from '@starkpay/sdk'

export function Providers({ children }: { children: React.ReactNode }) {
  return <StarkPayProvider>{children}</StarkPayProvider>
}
```

```tsx
// app/layout.tsx
import { Providers } from './providers'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

**React + Vite** (`main.tsx`):

```tsx
import { createRoot } from 'react-dom/client'
import { StarkPayProvider } from '@starkpay/sdk'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StarkPayProvider>
    <App />
  </StarkPayProvider>
)
```

---

## Step 2 — Create a subscription plan

Use the [Merchant Dashboard](https://starkpayhub.vercel.app/merchant) to create plans visually, or via CLI:

```bash
# Create "Pro" plan: $15/month
starkli invoke <STARKPAY_ADDRESS> create_plan 0x50726f u256:15000000 2592000
```

---

## Step 3 — Add a Subscribe button

```tsx
'use client'
import { StarkPayButton } from '@starkpay/sdk'

export default function PricingPage() {
  return (
    <StarkPayButton
      planId={1}
      onSuccess={(txHash) => console.log('Subscribed!', txHash)}
    />
  )
}
```

That's it. Users can now subscribe to your SaaS with USDC on Starknet.

---

## Gate Content Behind Subscription

```tsx
'use client'
import { useSubscription } from '@starkpay/sdk'
import { useAccount } from '@starknet-react/core'
import { StarkPayButton } from '@starkpay/sdk'

export default function PremiumContent() {
  const { address } = useAccount()
  const { isActive, isLoading } = useSubscription(address, 1)

  if (isLoading) return <p>Checking subscription...</p>

  if (!isActive) {
    return (
      <div>
        <p>This content requires a Pro subscription.</p>
        <StarkPayButton planId={1} />
      </div>
    )
  }

  return <div>Premium content — visible to subscribers only.</div>
}
```

---

## Full Example: Pricing Page with Auto-Loaded Plans

```tsx
'use client'
import { PricingTable } from '@starkpay/sdk'
import { useRouter } from 'next/navigation'

export default function PricingPage() {
  const router = useRouter()

  return (
    <div>
      <h1>Choose Your Plan</h1>
      <PricingTable
        onSuccess={() => router.push('/dashboard')}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      />
    </div>
  )
}
```

`PricingTable` automatically fetches all active plans from the contract and renders them.
