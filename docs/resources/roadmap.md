# Roadmap

StarkPay is currently live on **Starknet Sepolia Testnet**. This page outlines the path from our current state to a full mainnet launch.

---

## Current Status — Sepolia Testnet ✅

Everything listed below is **already shipped** and live on Sepolia:

| Item | Status |
|---|---|
| StarkPay smart contract (Cairo) | ✅ Live |
| MockUSDC for testnet | ✅ Live |
| Subscriber flow (connect → claim USDC → subscribe) | ✅ Live |
| Merchant flow (create plan → dashboard → withdraw) | ✅ Live |
| Keeper bot (auto-renewal via Vercel Cron) | ✅ Live |
| `@starkpay/sdk` npm package | ✅ Published (v0.3.x) |
| SDK MCP server (AI assistant integration) | ✅ Live |
| Gasless subscribe via AVNU Paymaster (Sepolia) | ✅ Live |
| Tier-based plan limits (Free / Starter / Pro / Enterprise) | ✅ Live |
| Flexible intervals (daily / weekly / monthly / yearly) | ✅ Live |
| GitBook documentation | ✅ Live |

---

## Phase 1 — Testnet Hardening (April – May 2026)

Focus: battle-test the protocol before audit, fix edge cases.

- [ ] **Subscription event indexer** — build a lightweight indexer so the keeper can query subscribers without scanning from block 0 every run
- [ ] **Keeper reliability improvements** — retry logic, alerting on consecutive failures, health endpoint
- [ ] **Plan deactivation** — let merchants deactivate a plan (stop new subscriptions while keeping existing ones alive)
- [ ] **Proration support** — calculate partial refund when user cancels mid-period
- [ ] **SDK v1.0** — stabilize all hook APIs, deprecate any experimental APIs before mainnet
- [ ] **End-to-end test suite** — automated tests against Sepolia using a real funded wallet
- [ ] **Load test** — simulate 100+ active subscriptions, measure keeper throughput

---

## Phase 2 — Security Audit (June 2026)

A contract audit is mandatory before any mainnet deployment. Funds on mainnet are real — an unaudited contract is not safe to use.

- [ ] Select audit firm (target: Nethermind, Trail of Bits, or Cairo-specialized firm)
- [ ] Freeze contract code — no changes during audit window
- [ ] Respond to all critical and high findings
- [ ] Publish audit report publicly
- [ ] Bug bounty program (optional, post-audit)

> **Note:** During the audit window, the SDK and frontend can continue to ship updates. Only the Cairo contract is frozen.

---

## Phase 3 — Mainnet Preparation (July 2026)

- [ ] **Deploy to Starknet Mainnet** — deploy StarkPay + real USDC integration
- [ ] **Swap MockUSDC → real USDC** — use the official USDC contract on mainnet (`0x053c91...`)
- [ ] **AVNU Paymaster mainnet whitelisting** — contact AVNU to enable gasless on mainnet
- [ ] **Update SDK defaults** — `network: 'mainnet'` as new default, Sepolia remains supported via config
- [ ] **Update keeper** — point to mainnet RPC, real USDC address
- [ ] **Verify contracts on Voyager / Starkscan** — verify source code for transparency

---

## Phase 4 — Mainnet Launch (August 2026)

- [ ] **Public launch** — announce on Twitter/X, Starknet Discord, Developer Telegram
- [ ] **Merchant onboarding** — invite first 10 merchants to create real plans
- [ ] **SDK v1.0 stable release** — matching mainnet contract addresses out of the box
- [ ] **Live documentation** — migrate docs from testnet examples to mainnet
- [ ] **Usage dashboard** — public stats page showing total subscriptions, volume, active plans

---

## Phase 5 — Post-Launch (Q4 2026+)

Long-term features under consideration. Not committed to a date.

| Feature | Notes |
|---|---|
| **Multi-token support** | Accept STRK, ETH, or other ERC-20s alongside USDC |
| **Session key renewals** | Auto-approve renewals without any user interaction (true auto-pay) |
| **Merchant analytics** | MRR, churn rate, LTV dashboard |
| **Webhook notifications** | HTTP POST to merchant server on subscription events |
| **Vue / Svelte SDK** | Extend SDK beyond React |
| **Protocol fees** | Optional platform fee for sustainability |
| **DAO governance** | On-chain governance for protocol parameters |

---

## Mainnet vs Sepolia — What Changes

| | Sepolia (now) | Mainnet (target) |
|---|---|---|
| USDC | MockUSDC (free mint) | Real USDC (Bridged via Starkscan) |
| Gas | Free from faucet | Real STRK/ETH |
| Gasless | Free (AVNU Sepolia) | AVNU whitelisting required |
| Audit | Not required | Mandatory |
| Users | Developers / testers | Real users with real funds |

---

## Contract Addresses (Current — Sepolia)

| Contract | Address |
|---|---|
| StarkPay | `0x04cf20808f1a9db9a4da75eb59566416bba3f2db14821cdeb0e8d4852f31aa14` |
| MockUSDC | `0x029b1a04e2ceb7ef124e0af044d3576b8c6210b8bc437e907b69d983d6ea87a9` |

Mainnet addresses will be added here after deployment.

---

> Have a feature request? Open an issue on [GitHub](https://github.com/StarkPayHub/Frontend/issues).
