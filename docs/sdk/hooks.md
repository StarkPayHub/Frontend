# Hooks

All hooks are `'use client'` and must be used inside `<StarkPayProvider>`.

---

## useStarkPay

Low-level hook for write operations: subscribe, cancel, withdraw.

```tsx
import { useStarkPay } from '@starkpay/sdk'

function CustomButton({ planId, price }: { planId: number; price: bigint }) {
  const { subscribe, cancel, withdraw, loading, error } = useStarkPay()

  return (
    <div>
      <button onClick={() => subscribe(planId, price)} disabled={loading}>
        {loading ? 'Processing...' : 'Subscribe'}
      </button>
      {error && <p className="text-red-500">{error.message}</p>}
    </div>
  )
}
```

### Return Value

| Field | Type | Description |
|---|---|---|
| `subscribe(planId, price)` | `async (number, bigint) => {transaction_hash: string}` | Approve USDC + subscribe in one multicall |
| `cancel(planId)` | `async (number) => {transaction_hash: string}` | Cancel an active subscription |
| `withdraw()` | `async () => {transaction_hash: string}` | Withdraw merchant revenue |
| `loading` | `boolean` | `true` while a transaction is in progress |
| `error` | `Error \| null` | Last error, `null` if none |

> `price` is in USDC micro-units: `$15 = 15_000_000n`

---

## useSubscription

Read subscription status for a user + plan. Polls the chain for updates.

```tsx
import { useSubscription } from '@starkpay/sdk'
import { useAccount } from '@starknet-react/core'

function StatusBadge() {
  const { address } = useAccount()
  const { isActive, periodEnd, isLoading } = useSubscription(address, 1)

  if (isLoading) return <span>Loading...</span>

  const renewDate = periodEnd
    ? new Date(Number(periodEnd) * 1000).toLocaleDateString()
    : null

  return (
    <span>
      {isActive ? `Active — renews ${renewDate}` : 'Inactive'}
    </span>
  )
}
```

### Parameters

| Parameter | Type | Description |
|---|---|---|
| `userAddress` | `string \| undefined` | User's wallet address. If `undefined`, no fetch occurs |
| `planId` | `number` | Plan ID to check |

### Return Value

| Field | Type | Description |
|---|---|---|
| `isActive` | `boolean` | `true` if subscription is active and not expired |
| `periodEnd` | `bigint \| undefined` | Unix timestamp (seconds) when current period ends |
| `subscription` | `Subscription \| undefined` | Raw subscription struct from contract |
| `isLoading` | `boolean` | `true` while fetching |
| `error` | `Error \| undefined` | Fetch error if any |

---

## usePlan / usePlanCount

Fetch plan data from the contract.

```tsx
import { usePlan, usePlanCount } from '@starkpay/sdk'

// Get a specific plan
function PlanCard({ planId }: { planId: number }) {
  const { plan, isLoading } = usePlan(planId)

  if (isLoading || !plan) return null

  const price = (Number(plan.price) / 1_000_000).toFixed(2)
  const days = Math.round(Number(plan.interval) / 86400)

  return (
    <div>
      <h3>{plan.name as string}</h3>
      <p>${price} / {days} days</p>
    </div>
  )
}

// Get total plan count
function TotalPlans() {
  const { data: count } = usePlanCount()
  return <p>Total plans: {Number(count)}</p>
}
```

### `usePlan(planId)` Return Value

| Field | Type | Description |
|---|---|---|
| `plan` | `Plan \| undefined` | Plan data from contract |
| `plan.name` | `string` | Plan name (decoded from felt252) |
| `plan.price` | `bigint` | Price in USDC micro-units |
| `plan.interval` | `bigint` | Billing interval in seconds |
| `plan.merchant` | `string` | Merchant wallet address |
| `plan.active` | `boolean` | Whether the plan is accepting new subscribers |
| `isLoading` | `boolean` | `true` while fetching |
| `error` | `Error \| undefined` | Fetch error if any |

---

## useMerchantStats

Read revenue and subscriber stats for a merchant address.

```tsx
import { useMerchantStats } from '@starkpay/sdk'
import { useAccount } from '@starknet-react/core'

function RevenuePanel() {
  const { address } = useAccount()
  const { stats, isLoading } = useMerchantStats(address)

  if (isLoading || !stats) return <p>Loading...</p>

  const fmt = (n: bigint) => `$${(Number(n) / 1_000_000).toFixed(2)}`

  return (
    <div>
      <p>Total Revenue: {fmt(stats.totalRevenue)}</p>
      <p>Withdrawable: {fmt(stats.withdrawable)}</p>
      <p>Active Subscribers: {Number(stats.activeSubs)}</p>
      <p>Total Transactions: {Number(stats.txCount)}</p>
    </div>
  )
}
```

### Parameters

| Parameter | Type | Description |
|---|---|---|
| `merchantAddress` | `string \| undefined` | Merchant wallet address. If `undefined`, no fetch |

### Return Value

| Field | Type | Description |
|---|---|---|
| `stats.totalRevenue` | `bigint` | Lifetime USDC received |
| `stats.withdrawable` | `bigint` | USDC available to withdraw |
| `stats.activeSubs` | `bigint` | Current active subscriber count |
| `stats.txCount` | `bigint` | Total payment transactions |
| `isLoading` | `boolean` | — |
| `error` | `Error \| undefined` | — |

---

## useMerchantTier

Determines merchant tier and plan creation limits.

```tsx
import { useMerchantTier } from '@starkpay/sdk'
import { useAccount } from '@starknet-react/core'

function TierIndicator() {
  const { address } = useAccount()
  const { tier, planCount, planLimit, canCreatePlan } = useMerchantTier(address)

  return (
    <div>
      <span>Tier: {tier}</span>
      <span>{planCount} / {planLimit === Infinity ? '∞' : planLimit} plans</span>
      {!canCreatePlan && <p>Upgrade tier to create more plans</p>}
    </div>
  )
}
```

### Return Value (`MerchantTierInfo`)

| Field | Type | Description |
|---|---|---|
| `tier` | `'free' \| 'starter' \| 'pro' \| 'enterprise'` | Current merchant tier |
| `planCount` | `number` | Plans created so far |
| `planLimit` | `number` | Max plans allowed |
| `canCreatePlan` | `boolean` | `planCount < planLimit` |
| `isLoading` | `boolean` | — |
