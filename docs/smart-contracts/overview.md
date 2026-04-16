# Smart Contract Architecture

StarkPayHub is built on two Cairo contracts deployed to Starknet Sepolia.

---

## Contracts

| Contract | File | Purpose |
|---|---|---|
| `StarkPay` | `src/starkpay.cairo` | Core subscription protocol |
| `MockUSDC` | `src/mock_usdc.cairo` | Testnet USDC with public mint |

---

## Data Structures

```rust
// A subscription plan created by a merchant
struct Plan {
    name: felt252,        // short string (max 31 chars)
    price: u256,          // USDC amount in micro-units (6 decimals)
    interval: u64,        // billing interval in seconds
    merchant: ContractAddress,
    active: bool,
}

// A user's subscription to a plan
struct Subscription {
    plan_id: u64,
    start: u64,               // unix timestamp
    current_period_end: u64,  // unix timestamp
    active: bool,
}

// Merchant revenue stats
struct MerchantStats {
    total_revenue: u256,
    withdrawable: u256,
    active_subs: u64,
    tx_count: u64,
}
```

---

## Storage Layout

```
plan_count: u64                                    — auto-incrementing plan ID counter
plans: Map<u64, Plan>                              — plan_id → Plan
subscriptions: Map<(ContractAddress, u64), Subscription>  — (user, plan_id) → Subscription
merchant_balance: Map<ContractAddress, u256>       — withdrawable USDC per merchant
merchant_revenue: Map<ContractAddress, u256>       — lifetime revenue per merchant
merchant_tx_count: Map<ContractAddress, u64>       — total transactions per merchant
merchant_sub_count: Map<ContractAddress, u64>      — active subscriber count per merchant
```

---

## Three Actors

```
Merchant ─────→ create_plan()
                withdraw()

User ──────────→ subscribe()
                 cancel_subscription()

Keeper ────────→ execute_renewal(user, plan_id)
(anyone)
```

---

## Events

| Event | Fields | Emitted When |
|---|---|---|
| `PlanCreated` | `plan_id, merchant, price, interval` | New plan created |
| `SubscriptionCreated` | `user, plan_id, start, period_end` | User subscribes |
| `SubscriptionRenewed` | `user, plan_id, new_period_end` | Keeper renews successfully |
| `PaymentFailed` | `user, plan_id` | Renewal fails (insufficient USDC) |
| `SubscriptionCancelled` | `user, plan_id` | User cancels |
| `Withdrawn` | `merchant, amount` | Merchant withdraws |

---

## Key Design Decisions

### execute_renewal Does Not Revert

If a user has insufficient USDC for renewal, `execute_renewal` emits `PaymentFailed` and continues — it does not `panic!`. This allows the keeper to batch renewals for many users without a single failed payment halting the entire batch.

### Check-Before-Transfer Reentrancy Guard

`withdraw()` sets the merchant's withdrawable balance to zero **before** calling `IERC20Dispatcher.transfer`. This prevents reentrancy attacks.

### Tuple Key for Subscriptions

Subscriptions are stored at `Map<(ContractAddress, u64), Subscription>` using a composite key of `(user_address, plan_id)`. Each user can have at most one active subscription per plan.

### MockUSDC Public Mint

`MockUSDC` inherits OpenZeppelin's `ERC20Component` and adds a permissionless `mint()` function for testnet use. This is intentionally not access-controlled — it's testnet only.
