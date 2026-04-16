# Installation

## Requirements

| Dependency | Version |
|---|---|
| React | >= 18 |
| starknet | >= 6 |
| @starknet-react/core | >= 3 |
| Node.js | >= 18 |

> React 19 is not yet supported. If you have React 19, downgrade: `npm install react@18 react-dom@18`

---

## Install

```bash
npm install @starkpay/sdk @starknet-react/core starknet get-starknet-core
```

```bash
# pnpm
pnpm add @starkpay/sdk @starknet-react/core starknet get-starknet-core

# yarn
yarn add @starkpay/sdk @starknet-react/core starknet get-starknet-core
```

---

## Next.js — Required Config

Add this to your `next.config.js` to handle ESM packages:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@starkpay/sdk'],
}
module.exports = nextConfig
```

---

## Vite — Prevent Duplicate React

If you're using Vite, add `resolve.dedupe` to avoid React version conflicts:

```js
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom', 'starknet', '@starknet-react/core'],
  },
})
```

---

## Verify Installation

```tsx
import { StarkPayProvider } from '@starkpay/sdk'
// If this imports without error, the package is installed correctly
```
