# Components

All components are `'use client'` — they require React 18+ and must run in the browser.

---

## StarkPayButton

The all-in-one subscribe/cancel button. Automatically fetches plan price from the contract and detects the user's subscription status.

```tsx
import { StarkPayButton } from '@starkpay/sdk'

// Basic
<StarkPayButton planId={1} />

// With callbacks
<StarkPayButton
  planId={1}
  onSuccess={(txHash) => router.push('/dashboard')}
  onError={(err) => toast.error(err.message)}
/>

// Cancel mode
<StarkPayButton planId={1} mode="cancel" />

// Custom label and styling
<StarkPayButton
  planId={2}
  label="Upgrade to Pro"
  className="bg-violet-600 text-white rounded-lg px-6 py-3"
/>
```

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `planId` | `number` | required | The plan ID to subscribe to |
| `mode` | `'subscribe' \| 'cancel'` | `'subscribe'` | Button mode |
| `label` | `string` | Auto-generated | Override button text |
| `onSuccess` | `(txHash: string) => void` | — | Called on successful transaction |
| `onError` | `(error: Error) => void` | — | Called on transaction failure |
| `className` | `string` | — | CSS class for the button |
| `style` | `React.CSSProperties` | — | Inline styles |

### Button States (Subscribe mode)

| State | Text |
|---|---|
| Wallet not connected | `Connect Wallet` (disabled) |
| Loading plan data | spinner (disabled) |
| Already subscribed | Shows renewal date (no button) |
| Ready | `Subscribe $15.00/mo` |
| Processing | `Processing...` (disabled) |

### Button States (Cancel mode)

| State | Text |
|---|---|
| Wallet not connected | `Connect Wallet` (disabled) |
| No active subscription | `No active subscription` (disabled) |
| Ready | `Cancel Subscription` |
| Processing | `Processing...` (disabled) |
| Success | `✓ Subscription cancelled` |

---

## PricingTable

Fetches all active plans from the contract and renders them as a pricing grid.

```tsx
import { PricingTable } from '@starkpay/sdk'

<PricingTable
  onSuccess={(txHash) => console.log('Subscribed:', txHash)}
  className="grid grid-cols-1 md:grid-cols-3 gap-6"
/>
```

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `onSuccess` | `(txHash: string) => void` | — | Called after any successful subscription |
| `className` | `string` | — | CSS class for the container div |

> `PricingTable` is **unstyled by default**. It renders a `<div>` with your `className` containing one child per plan. Style the container and plan cards with your own CSS or Tailwind classes.

---

## SubscriptionStatus

Shows the subscription status for the connected user on a specific plan.

```tsx
import { SubscriptionStatus } from '@starkpay/sdk'

<SubscriptionStatus planId={1} />
// Renders: "Active — renews 5/1/2026" or "Inactive"

<SubscriptionStatus planId={1} className="text-sm text-green-600" />
```

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `planId` | `number` | required | Plan ID to check |
| `className` | `string` | — | CSS class for the `<span>` |

### Output Text

| State | Text |
|---|---|
| Active subscription | `Active — renews 5/1/2026` |
| No subscription | `Inactive` |
| Loading | `Loading...` |
| Wallet not connected | `Not connected` |

---

## MerchantDashboard

Full revenue dashboard for merchants. Renders stats, withdrawal button, and plan list.

```tsx
import { MerchantDashboard } from '@starkpay/sdk'

<MerchantDashboard merchantAddress="0x..." />
```

### Props

| Prop | Type | Description |
|---|---|---|
| `merchantAddress` | `string` | The merchant's wallet address |
