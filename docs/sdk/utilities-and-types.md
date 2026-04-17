# Utilities & Types

---

## Interval Utilities

```tsx
import { INTERVALS, intervalToSeconds, secondsToLabel } from '@starkpay/sdk'
```

### INTERVALS

Pre-defined billing interval constants in seconds:

```ts
INTERVALS.DAILY    // 86400
INTERVALS.WEEKLY   // 604800
INTERVALS.MONTHLY  // 2592000
INTERVALS.YEARLY   // 31536000
```

### intervalToSeconds(preset)

```ts
intervalToSeconds('DAILY')    // → 86400
intervalToSeconds('MONTHLY')  // → 2592000
```

### secondsToLabel(seconds)

Convert any number of seconds to a human-readable label:

| Input | Output |
|---|---|
| `86400` | `'Daily'` |
| `604800` | `'Weekly'` |
| `2592000` | `'Monthly'` |
| `31536000` | `'Yearly'` |
| Custom | `'N days'` |

---

## Revenue Export (PDF & Excel)

The SDK provides three export functions for merchant revenue data.

### downloadRevenueReport

Quick PDF report with KPIs summary.

```tsx
import { downloadRevenueReport } from '@starkpay/sdk'

await downloadRevenueReport({
  merchantAddress: '0x...',
  stats: {
    totalRevenue: 50_000_000n,
    withdrawable: 10_000_000n,
    activeSubs: 5n,
    txCount: 12n,
  },
  filename: 'revenue-jan-2026.pdf',
})
```

| Field | Type | Required | Description |
|---|---|---|---|
| `merchantAddress` | `string` | Yes | Shown in the PDF header |
| `stats` | `MerchantStats` | Yes | Revenue data |
| `filename` | `string` | No | PDF filename (default: `starkpay-report.pdf`) |

---

### exportPdf

Full revenue report as styled PDF with KPIs, revenue breakdown, and subscriber list.

```tsx
import { exportPdf } from '@starkpay/sdk'

await exportPdf({
  merchantAddress: '0x...',
  subEvents,          // SubscriptionEvent[]
  renewalEvents,      // RenewalEvent[]
  plans,              // PlanInfo[] (optional)
  myPlanIds,          // Set<number> (optional — filter to your plans)
  totalRevenue: 50_000_000n,
  withdrawable: 10_000_000n,
  activeSubs: 5,
  groupBy: 'month',   // 'day' | 'week' | 'month'
})
```

**PDF includes:**
- Dark header with StarkPay branding
- 4 KPI boxes (Total Revenue, Withdrawable, Active Subs, Total Tx)
- Revenue breakdown table grouped by day/week/month
- Subscriber summary table
- Generated timestamp and wallet address

**Output filename:** `starkpay-revenue-[address]-YYYY-MM-DD.pdf`

---

### exportExcel

Multi-sheet Excel workbook with full revenue data.

```tsx
import { exportExcel } from '@starkpay/sdk'

await exportExcel({
  merchantAddress: '0x...',
  subEvents,
  renewalEvents,
  plans,
  myPlanIds,
  totalRevenue: 50_000_000n,
  withdrawable: 10_000_000n,
  activeSubs: 5,
  groupBy: 'month',
})
```

**Excel sheets:**
1. **Summary** — Revenue per period (day/week/month) with tx count and unique wallets
2. **All Transactions** — Detailed list: date, type (Subscribe/Renewal), wallet, plan, amount, tx hash
3. **Subscriber List** — Per-wallet summary: plans subscribed, total paid, last activity

**Output filename:** `starkpay-revenue-[address]-YYYY-MM-DD.xlsx`

---

### ExportOptions (shared by exportPdf & exportExcel)

| Field | Type | Required | Description |
|---|---|---|---|
| `merchantAddress` | `string` | Yes | Merchant wallet address |
| `subEvents` | `SubscriptionEvent[]` | Yes | Subscription events from chain |
| `renewalEvents` | `RenewalEvent[]` | Yes | Renewal events from chain |
| `plans` | `PlanInfo[]` | No | Plan metadata for names |
| `myPlanIds` | `Set<number>` | No | Filter to specific plan IDs |
| `totalRevenue` | `bigint` | Yes | Total USDC revenue |
| `withdrawable` | `bigint` | Yes | Available to withdraw |
| `activeSubs` | `number` | Yes | Active subscriber count |
| `groupBy` | `'day' \| 'week' \| 'month'` | No | Grouping period (default: `'month'`) |

---

### buildRevenueGroups

Group subscription + renewal events by time period. Used internally by export functions, but also available for custom charts.

```tsx
import { buildRevenueGroups } from '@starkpay/sdk'

const groups = buildRevenueGroups(subEvents, renewalEvents, myPlanIds, 'month')

groups.forEach(g => {
  console.log(g.label)         // "Apr 2026"
  console.log(g.revenue)      // 15000000n (bigint USDC)
  console.log(g.txCount)      // 3
  console.log(g.subscribers)  // ["0xabc...", "0xdef..."]
})
```

**Returns:** `RevenueGroup[]`

| Field | Type | Description |
|---|---|---|
| `label` | `string` | Human-readable: `"Apr 12"`, `"Week 15"`, `"Apr 2026"` |
| `key` | `string` | Machine key: `"2026-04-12"`, `"2026-W15"`, `"2026-04"` |
| `revenue` | `bigint` | Total USDC for the period |
| `txCount` | `number` | Number of transactions |
| `subscribers` | `string[]` | Unique subscriber addresses |

> Automatically fills gaps — all periods from first event to today are included, even with zero revenue.

---

## Low-Level Call Builders

For custom transaction flows without using hooks:

```tsx
import { buildSubscribeCalls, buildCancelCall, buildWithdrawCall } from '@starkpay/sdk'

// Subscribe: builds [approve, subscribe] multicall array
const calls = buildSubscribeCalls(
  usdcAddress,       // string
  contractAddress,   // string
  planId,            // number
  price              // bigint — in USDC micro-units
)
await account.execute(calls)

// Cancel
const cancelCall = buildCancelCall(contractAddress, planId)
await account.execute([cancelCall])

// Withdraw
const withdrawCall = buildWithdrawCall(contractAddress)
await account.execute([withdrawCall])
```

### Call Format

```ts
interface Call {
  contractAddress: string  // target contract address
  entrypoint: string       // function name
  calldata: string[]       // arguments as string array
}
```

---

## TypeScript Types

```ts
import type {
  StarkPayConfig,
  Plan,
  Subscription,
  MerchantStats,
  Call,
  TierName,
  IntervalPreset,
} from '@starkpay/sdk'

interface StarkPayConfig {
  contractAddress: string
  usdcAddress: string
  rpcUrl?: string
  network?: 'sepolia' | 'mainnet'
  gasless?: boolean
}

interface Plan {
  id: bigint
  name: string          // decoded from felt252
  price: bigint         // USDC micro-units (6 decimals). $15 = 15_000_000n
  interval: bigint      // billing interval in seconds
  merchant: string      // merchant wallet address
  active: boolean
}

interface Subscription {
  planId: bigint
  start: bigint              // unix timestamp of subscription start
  currentPeriodEnd: bigint   // unix timestamp when current period expires
  active: boolean
}

interface MerchantStats {
  totalRevenue: bigint   // total lifetime revenue
  withdrawable: bigint   // unclaimed balance
  activeSubs: bigint     // active subscriber count
  txCount: bigint        // total payment transactions
}

type TierName = 'free' | 'starter' | 'pro' | 'enterprise'
type IntervalPreset = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'

// Export-related types
interface SubscriptionEvent {
  user: string
  planId: number
  amount: bigint        // USDC (6 decimals)
  periodEnd: number     // Unix timestamp
  txHash: string
}

interface RenewalEvent {
  user: string
  planId: number
  amount: bigint
  newPeriodEnd: number
  txHash: string
}

interface PlanInfo {
  id: number
  name: string
}

interface RevenueGroup {
  label: string         // "Apr 12" | "Week 15" | "Apr 2026"
  key: string           // "2026-04-12" | "2026-W15" | "2026-04"
  revenue: bigint
  txCount: number
  subscribers: string[]
}

type GroupBy = 'day' | 'week' | 'month'
```

---

## BigInt Conversions

All on-chain numeric values are returned as `bigint`. Common conversions:

```ts
// USDC micro-units → dollars
const dollars = Number(plan.price) / 1_000_000

// Unix timestamp → Date
const date = new Date(Number(subscription.currentPeriodEnd) * 1000)

// bigint → number (safe for small values)
const count = Number(stats.activeSubs)

// bigint → string (safe for large values)
const revenue = stats.totalRevenue.toString()
```
