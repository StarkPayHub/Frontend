# Merchant Tier System

StarkPayHub uses its own subscription protocol to gate merchant features. To create more than one plan, you need to subscribe to a StarkPayHub plan yourself — the protocol eats its own dog food.

---

## Tier Overview

| Tier | How to Unlock | Max Plans You Can Create |
|---|---|---|
| **Free** | Default (no subscription needed) | 1 plan |
| **Starter** | Subscribe to Plan ID 1 | 3 plans |
| **Pro** | Subscribe to Plan ID 2 | 10 plans |
| **Enterprise** | Subscribe to Plan ID 3 | Unlimited |

---

## Tier Progression

```mermaid
flowchart LR
    F["Free<br/><br/>1 plan<br/>(default)"]
    S["Starter<br/><br/>3 plans"]
    P["Pro<br/><br/>10 plans"]
    E["Enterprise<br/><br/>Unlimited"]

    F -->|"Subscribe to Plan 1"| S
    S -->|"Subscribe to Plan 2"| P
    P -->|"Subscribe to Plan 3"| E

    style F fill:#3f3f46,color:#d4d4d8,stroke:#52525b
    style S fill:#1e3a5f,color:#93c5fd,stroke:#3b82f6
    style P fill:#3b0764,color:#e9d5ff,stroke:#7c3aed
    style E fill:#701a75,color:#f0abfc,stroke:#c026d3
```

---

## How It's Enforced

```mermaid
flowchart TD
    A([Merchant calls create_plan]) --> B{Plan limit reached?}
    B -->|No| C[Plan created ✓]
    B -->|Yes| D{Has active subscription?}
    D -->|No| E[Revert: limit reached]
    D -->|Yes — Plan 1| F{Starter limit reached?}
    D -->|Yes — Plan 2| G{Pro limit reached?}
    D -->|Yes — Plan 3| H[Plan created ✓ Enterprise]
    F -->|No| I[Plan created ✓ Starter]
    F -->|Yes| E
    G -->|No| J[Plan created ✓ Pro]
    G -->|Yes| E
```

This check happens **on-chain** — it cannot be bypassed.

---

## Read Your Current Tier

### Via SDK

```tsx
import { useMerchantTier } from '@starkpay/sdk'
import { useAccount } from '@starknet-react/core'

function TierBadge() {
  const { address } = useAccount()
  const { tier, planCount, planLimit, canCreatePlan } = useMerchantTier(address)

  return (
    <div>
      <p>Tier: {tier}</p>
      <p>Plans: {planCount} / {planLimit === Infinity ? '∞' : planLimit}</p>
      {!canCreatePlan && (
        <p>⚠️ Plan limit reached. Upgrade your tier to create more plans.</p>
      )}
    </div>
  )
}
```

### Return values

| Field | Type | Description |
|---|---|---|
| `tier` | `'free' \| 'starter' \| 'pro' \| 'enterprise'` | Current merchant tier |
| `planCount` | `number` | Plans created so far |
| `planLimit` | `number` | Max plans for this tier |
| `canCreatePlan` | `boolean` | `planCount < planLimit` |

---

## Upgrade Your Tier

To move from Free → Starter, subscribe to **Plan ID 1** on the pricing page. The tier upgrade takes effect immediately after your subscription is confirmed on-chain.

This creates a recursive use of the protocol: merchants pay StarkPayHub in USDC to unlock higher plan limits, just like their own users pay them.
