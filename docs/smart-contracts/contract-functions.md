# Contract Functions

Full reference for all read and write functions in the StarkPay contract.

**Contract address (Sepolia):** `0x0156aa73efd3389c5552be7c61e07faa7bdefca67af1f0e604c77ed3c1fd86ad`

---

## Write Functions

### create_plan

Create a new subscription plan.

```rust
fn create_plan(
    ref self: TContractState,
    name: felt252,     // short string encoded as felt252
    price: u256,       // USDC micro-units (e.g. 15_000_000 for $15)
    interval: u64,     // seconds (e.g. 2592000 for 30 days)
) -> u64               // returns the new plan_id
```

**Via starkli:**
```bash
starkli invoke <STARKPAY> create_plan 0x50726f u256:15000000 2592000
```

**Reverts if:**
- Merchant has reached their plan limit for their tier

---

### subscribe

Subscribe the caller to a plan. Pulls USDC from the caller's wallet.

```rust
fn subscribe(ref self: TContractState, plan_id: u64)
```

**Requires prior approval:** The caller must have approved the StarkPay contract to spend at least `plan.price` USDC. The SDK handles this automatically with a multicall.

**Reverts if:**
- Plan does not exist or is inactive
- Caller already has an active subscription to this plan
- Caller has insufficient USDC or insufficient approval

---

### execute_renewal

Renew a subscription for a given user. Can be called by anyone (permissionless).

```rust
fn execute_renewal(
    ref self: TContractState,
    user: ContractAddress,
    plan_id: u64,
)
```

**Does NOT revert** on payment failure. Emits `PaymentFailed` instead.

**Emits:**
- `SubscriptionRenewed` on success
- `PaymentFailed` on insufficient USDC

---

### cancel_subscription

Cancel the caller's subscription to a plan.

```rust
fn cancel_subscription(ref self: TContractState, plan_id: u64)
```

Sets `subscription.active = false`. The keeper bot will stop renewing it. No refund is issued.

**Reverts if:**
- Caller has no active subscription to this plan

---

### withdraw

Withdraw all accumulated USDC to the caller's (merchant's) wallet.

```rust
fn withdraw(ref self: TContractState)
```

Transfers the full `withdrawable` balance (after protocol fee deduction). Uses check-before-transfer to prevent reentrancy.

**Reverts if:**
- Caller has no withdrawable balance
- Caller's StarkPay tier subscription has expired and they have more plans than the free tier allows

---

### set_protocol_fee _(owner only)_

Update the protocol fee rate.

```rust
fn set_protocol_fee(ref self: TContractState, new_bps: u256)
```

`new_bps` is in basis points — `200` = 2%, `500` = 5%. Maximum allowed: `1000` (10%).

**Reverts if:**
- Caller is not the contract owner
- `new_bps > 1000`

---

### withdraw_protocol_fee _(owner only)_

Withdraw all accumulated protocol fees to the owner's wallet.

```rust
fn withdraw_protocol_fee(ref self: TContractState)
```

**Reverts if:**
- Caller is not the contract owner
- Protocol balance is zero

---

## Read Functions

### get_plan

```rust
fn get_plan(self: @TContractState, plan_id: u64) -> Plan
```

Returns the full `Plan` struct for a given plan ID.

---

### get_subscription

```rust
fn get_subscription(
    self: @TContractState,
    user: ContractAddress,
    plan_id: u64,
) -> Subscription
```

Returns the `Subscription` struct for a user + plan combination.

---

### is_subscription_active

```rust
fn is_subscription_active(
    self: @TContractState,
    user: ContractAddress,
    plan_id: u64,
) -> bool
```

Returns `true` if `subscription.active == true` AND `current_period_end > block_timestamp`.

---

### get_merchant_stats

```rust
fn get_merchant_stats(
    self: @TContractState,
    merchant: ContractAddress,
) -> MerchantStats
```

Returns `MerchantStats { total_revenue, withdrawable, active_subs, tx_count }`.

---

### get_plan_count

```rust
fn get_plan_count(self: @TContractState) -> u64
```

Returns the total number of plans ever created (including inactive ones).

---

### get_protocol_fee_bps

```rust
fn get_protocol_fee_bps(self: @TContractState) -> u256
```

Returns the current protocol fee in basis points (e.g. `200` = 2%).

---

### get_protocol_balance

```rust
fn get_protocol_balance(self: @TContractState) -> u256
```

Returns the total accumulated protocol fees not yet withdrawn by the owner.

---

## MockUSDC Functions

**Contract address (Sepolia):** `0x03f2e44f91a2994b1748473aebe2512a280a4ada60df57d31886d3faf95a0776`

Implements standard ERC-20 plus:

### mint (testnet only)

```rust
fn mint(
    ref self: TContractState,
    to: ContractAddress,
    amount: u256,
)
```

Permissionless — anyone can mint any amount. Testnet only.

```bash
starkli invoke <MOCKUSDC> mint <YOUR_ADDRESS> u256:100000000
# Mints 100 USDC
```
