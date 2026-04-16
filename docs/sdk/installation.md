# Installation

## Requirements

| Dependency | Version |
|---|---|
| React | >= 18 |
| Node.js | >= 18 |

---

## Fastest Way — Auto Scaffold

If you're starting a new project, run this one command — no manual setup needed:

```bash
npx starkpay init
```

This will automatically create:

| File | Description |
|---|---|
| `app/layout.tsx` | Root layout with `StarkPayProvider` already wired up |
| `app/page.tsx` | Landing page with pricing card |
| `app/dashboard/page.tsx` | Subscription-gated dashboard page |
| `components/PricingCard.tsx` | Ready-to-use pricing card component |
| `lib/starkpay.ts` | Your config file — set your `PLAN_ID` here |
| `.env.example` | Environment variable template |
| `.mcp.json` | AI assistant config (Claude Code, Cursor, Windsurf) |

After scaffolding:

```bash
npm install

# Open lib/starkpay.ts and change PLAN_ID to your plan
npm run dev
```

> **Already have a Next.js project?** You can still run `npx starkpay init` — existing files will be skipped automatically. Use `--force` to overwrite.

---

## Manual Install

Add the SDK to an existing project:

```bash
# npm
npm install @starkpay/sdk

# pnpm
pnpm add @starkpay/sdk

# yarn
yarn add @starkpay/sdk
```

Current version: **`0.3.21`**

---

## Next.js — Required Config

Add this to `next.config.js` or `next.config.ts`:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@starkpay/sdk'],
}
module.exports = nextConfig
```

---

## Verify Installation

```tsx
import { StarkPayProvider } from '@starkpay/sdk'
// No error = installed correctly
```

---

## AI Assistant — MCP Server

The SDK ships with a built-in MCP server. Once installed, you can ask AI assistants questions about SDK integration directly from your editor — with live on-chain data.

```bash
# Add to Claude Code
claude mcp add starkpay -- npx starkpay mcp
```

If you used `npx starkpay init`, the `.mcp.json` config is already generated. Just open the project in Claude Code, Cursor, or Windsurf and start asking:

- *"How do I gate a page behind a subscription?"*
- *"Show me the useSubscription hook example"*
- *"What's in plan ID 2?"* — fetches live from Starknet

→ See [MCP Server](mcp-server.md) for full setup guide.
