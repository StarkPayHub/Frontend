# What is StarkPayHub?

StarkPayHub is an **on-chain subscription payment protocol** built on Starknet. It enables SaaS products to accept recurring USDC payments directly on-chain — no payment processors, no custodians, no lock-in.

![StarkPayHub — The Subscription Protocol for Web3](../images/landing-hero.png)

---

## Core Problem

Traditional subscription billing (Stripe, Paddle, etc.) requires:
- A centralized entity to process and hold funds
- KYC/AML verification for merchants
- Chargeback risk and platform dependency
- Fiat off-ramps and settlement delays

StarkPayHub removes all of this. Payments go directly from subscriber wallet → merchant wallet, enforced by an immutable smart contract.

---

## What Makes It Different

### Native Account Abstraction
Starknet's Account Abstraction allows users to sign a subscription once and have renewals execute automatically — without pre-approving unlimited spending or trusting a third party.

### One Transaction for Subscribe
The SDK bundles USDC approval + subscription into a single multicall transaction. Users click once, sign once, done.

### Non-Custodial
Merchant funds sit in the smart contract until the merchant withdraws. No one else can touch them. The contract has no admin key.

### Auto-Renewal via Keeper
A keeper bot monitors all active subscriptions and calls `execute_renewal` when a period ends. If the user has insufficient USDC, the renewal fails gracefully — it does not revert, does not block other renewals.

---

## Who Is It For?

| Audience | Use Case |
|---|---|
| **SaaS Developers** | Integrate crypto subscription payments into any React/Next.js app with 3 lines of code |
| **Merchants** | Create plans, manage subscribers, withdraw revenue — all from a dashboard |
| **Users** | Subscribe to SaaS products using USDC on Starknet; cancel anytime |
| **Protocol Builders** | Fork or extend the Cairo contracts for your own use case |

---

## What's Included

| Component | Description |
|---|---|
| **Smart Contracts** (Cairo) | `StarkPay.cairo` — the subscription protocol; `MockUSDC.cairo` — testnet token |
| **`@starkpay/sdk`** | React SDK — components, hooks, call builders |
| **Frontend** (Next.js) | Live demo at [starkpayhub.vercel.app](https://starkpayhub.vercel.app) |
| **Keeper Bot** (Node.js) | Auto-renewal daemon deployed on Railway |

---

## Network

Currently live on **Starknet Sepolia Testnet**. Mainnet deployment after audit.
