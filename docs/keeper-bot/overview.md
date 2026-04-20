# Keeper Bot Overview

The keeper bot is a Node.js process that runs continuously and triggers subscription renewals on-chain.

---

## What It Does

```mermaid
flowchart TD
    A([Start — every 1 hour]) --> B[Fetch SubscriptionCreated events<br/>from DEPLOY_BLOCK to latest]
    B --> C[Deduplicate by user + plan_id]
    C --> D{For each subscription}

    D --> E{active AND\ncurrent_period_end < now?}
    E -- No --> F([Skip])
    E -- Yes --> G[Read user USDC balance\noff-chain view call — no gas]

    G --> H{balance >= plan price?}
    H -- Yes --> I[Call execute_renewal\nuser, plan_id]
    H -- No --> J[Log: Insufficient balance\nno on-chain tx — gas saved]

    I --> K([SubscriptionRenewed ✓\ncurrent_period_end updated])
    J --> L([Subscription skipped\nwill retry next run])

    F & K & L --> D
    D -->|all done| M([Summary: N renewed · M skipped · P failed])
```

Sample output:

```
🔁 Starting keeper in loop mode (every 1 hour)
🔄 Keeper running at 2026-04-16T10:00:00Z
   StarkPay: 0x058a1e...
   Keeper:   0x...
📡 Fetching SubscriptionCreated events...
   Found 5 unique subscriptions
✅ Renewed user=0xabc plan=1 tx=0x...
⏭️  Skipped user=0xdef plan=1 (not expired)
❌ Failed user=0x123 plan=2 (Insufficient balance)
📊 Done: 1 renewed, 3 skipped, 1 failed
```

---

## Why Permissionless?

`execute_renewal` can be called by **anyone** — there's no whitelist. This means:
- Anyone can run a keeper for the protocol (decentralized)
- If the official keeper goes down, users or third parties can step in
- The keeper wallet only needs gas (ETH/STRK), not special permissions

---

## What Happens on Renewal Failure?

```mermaid
flowchart LR
    A([Keeper reads USDC balance\noff-chain view — free]) --> B{balance >= plan price?}
    B -- Yes --> C[Call execute_renewal\non-chain tx]
    B -- No --> D[Log: Insufficient balance\nno tx sent — gas saved]
    C --> E[Emit SubscriptionRenewed\nperiod_end updated]
    D --> F[Subscription skipped\nwill retry next run]
    E --> G([Next subscription])
    F --> G
```

The keeper pre-checks USDC balance with a free off-chain `balanceOf` view call before submitting any transaction. If a user's balance is insufficient, no on-chain call is made — gas is saved, and the failure is logged server-side. The subscription is skipped until the user tops up their balance.

---

## Running the Keeper

### One-time run (for Vercel Cron)

```bash
pnpm start
```

### Loop mode (for Railway / VPS)

```bash
pnpm start:loop
# Runs every hour indefinitely
```

---

## Environment Variables

| Variable | Description |
|---|---|
| `KEEPER_PRIVATE_KEY` | Private key of the keeper wallet |
| `KEEPER_ADDRESS` | Address of the keeper wallet |
| `STARKPAY_ADDRESS` | StarkPay contract address |
| `STARKNET_RPC` | Starknet RPC endpoint URL |
| `DEPLOY_BLOCK` | Block number to start scanning events from |
| `MODE` | `loop` for continuous, omit for single run |

---

## Gas Costs

Each `execute_renewal` call costs less than **0.001 STRK** on Sepolia. The keeper wallet needs a small STRK/ETH balance to cover gas.

Claim Sepolia gas at [faucet.starknet.io](https://faucet.starknet.io).

---

## Vercel Cron Integration

The keeper is also available as a Vercel Cron route at `/api/keeper`, scheduled to run daily:

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/keeper",
      "schedule": "0 0 * * *"
    }
  ]
}
```

> Note: Vercel Hobby plan supports daily cron only. For hourly renewals, deploy the keeper bot on Railway (see [Deployment Guide](deployment.md)).
