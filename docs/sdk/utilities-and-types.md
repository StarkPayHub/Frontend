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

## downloadRevenueReport

Generates and downloads a PDF revenue report.

```tsx
import { downloadRevenueReport } from '@starkpay/sdk'

await downloadRevenueReport({
  merchantAddress: '0x...',
  stats: {
    totalRevenue: 50_000_000n,  // 50 USDC
    withdrawable: 10_000_000n,
    activeSubs: 5n,
    txCount: 12n,
  },
  filename: 'revenue-jan-2026.pdf',  // optional
})
```

### PDFReportOptions

| Field | Type | Required | Description |
|---|---|---|---|
| `merchantAddress` | `string` | Yes | Shown in the PDF header |
| `stats` | `MerchantStats` | Yes | Revenue data |
| `filename` | `string` | No | PDF filename (default: `starkpay-report.pdf`) |

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
