# How It Works

## System Overview

```mermaid
flowchart TD
    M([Merchant]) -->|create_plan| SP[StarkPay Contract]
    U([User]) -->|multicall: approve + subscribe| SP
    SP -->|transferFrom| USDC[MockUSDC / USDC]
    SP -->|record Subscription| DB[(On-chain Storage)]
    K([Keeper Bot]) -->|execute_renewal every hour| SP
    SP -->|SubscriptionRenewed or PaymentFailed| EV[Events]
    M -->|withdraw| SP
    SP -->|transfer USDC| M

    style SP fill:#7c3aed,color:#fff,stroke:#a78bfa
    style USDC fill:#1e1b4b,color:#c4b5fd,stroke:#7c3aed
    style DB fill:#1e1b4b,color:#c4b5fd,stroke:#7c3aed
    style EV fill:#1e1b4b,color:#c4b5fd,stroke:#7c3aed
```

---

## Three Actors

### 1. Merchant
Creates subscription plans via the dashboard or CLI. Plans have a name, price (in USDC), and billing interval (daily / weekly / monthly / yearly).

Once subscribers start paying, the merchant can withdraw their accumulated USDC balance at any time.

### 2. User (Subscriber)
Connects their Argent X or Braavos wallet. Subscribes to a plan with a single multicall transaction. Can cancel at any time — no lock-in.

### 3. Keeper Bot
A permissionless bot that anyone can run. It reads `SubscriptionCreated` events from the chain, finds subscriptions where `current_period_end < now`, and calls `execute_renewal(user, plan_id)` to charge the next period.

Crucially, `execute_renewal` **does not revert on failure** — if a user has insufficient USDC, it emits a `PaymentFailed` event and moves on. This lets the keeper batch renewals for hundreds of users in one run.

---

## Subscribe Flow

```mermaid
sequenceDiagram
    actor User
    participant Wallet as Argent X / Braavos
    participant SDK as @starkpay/sdk
    participant USDC as MockUSDC Contract
    participant SP as StarkPay Contract

    User->>Wallet: click Subscribe
    Wallet->>SDK: buildSubscribeCalls(plan_id)
    SDK-->>Wallet: [approve call, subscribe call]
    Wallet->>User: popup — 1 signature
    User->>Wallet: sign
    Wallet->>USDC: approve(starkpay, price)
    Wallet->>SP: subscribe(plan_id)
    SP->>USDC: transferFrom(user, self, price)
    SP-->>SP: Subscription { active: true, period_end: now + interval }
    SP-->>Wallet: emit SubscriptionCreated
    Wallet-->>User: confirmed ✓
```

---

## Renewal Flow

```mermaid
sequenceDiagram
    actor Keeper
    participant SP as StarkPay Contract
    participant USDC as MockUSDC Contract

    loop Every hour
        Keeper->>SP: fetch SubscriptionCreated events
        Keeper->>Keeper: filter: current_period_end < now

        alt User has enough USDC
            Keeper->>SP: execute_renewal(user, plan_id)
            SP->>USDC: transferFrom(user, self, price)
            SP-->>SP: update current_period_end += interval
            SP-->>Keeper: emit SubscriptionRenewed ✓
        else Insufficient USDC
            Keeper->>SP: execute_renewal(user, plan_id)
            SP-->>SP: active = false
            SP-->>Keeper: emit PaymentFailed ✗
        end
    end
```

---

## Multicall = One Signature

The key UX feature: approve + subscribe happen in a single Starknet multicall transaction. The user is shown one popup and signs once. Under the hood, the contract receives the approval and the subscription call atomically.

This is possible because Starknet's account model supports multicall natively — all accounts on Starknet can batch calls.

---

## USDC Denomination

All prices use **6 decimal places**, same as standard USDC:

| Display | On-chain value |
|---|---|
| $1.00 | `1_000_000` |
| $5.00 | `5_000_000` |
| $15.00 | `15_000_000` |
| $50.00 | `50_000_000` |
