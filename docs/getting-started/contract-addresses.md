# Contract Addresses

## Starknet Sepolia Testnet

| Contract | Address |
|---|---|
| **StarkPay** | `0x058a1e8058620d285047c7ee3df15804898070e6788fbffe004a29ffa554aa2c` |
| **MockUSDC** | `0x03f2e44f91a2994b1748473aebe2512a280a4ada60df57d31886d3faf95a0776` |

View on Voyager Explorer:
- [StarkPay contract →](https://sepolia.voyager.online/contract/0x058a1e8058620d285047c7ee3df15804898070e6788fbffe004a29ffa554aa2c)
- [MockUSDC contract →](https://sepolia.voyager.online/contract/0x03f2e44f91a2994b1748473aebe2512a280a4ada60df57d31886d3faf95a0776)

---

## SDK Defaults

The `@starkpay/sdk` is pre-configured with the Sepolia addresses above. You do **not** need to pass them manually during development:

```tsx
// This works out of the box on Sepolia:
<StarkPayProvider>
  <App />
</StarkPayProvider>

// Only pass addresses if deploying your own instance:
<StarkPayProvider
  contractAddress="0x<YOUR_STARKPAY>"
  usdcAddress="0x<YOUR_USDC>"
>
  <App />
</StarkPayProvider>
```

---

## Mainnet

StarkPayHub is currently **Sepolia testnet only**. Mainnet deployment is planned after a security audit. This page will be updated when mainnet addresses are available.

---

## Get Testnet USDC

MockUSDC can be minted freely on Sepolia for testing. Use the "Claim 100 Free USDC" button in the frontend, or call directly via starkli:

```bash
starkli invoke \
  0x03f2e44f91a2994b1748473aebe2512a280a4ada60df57d31886d3faf95a0776 \
  mint \
  <YOUR_WALLET_ADDRESS> \
  u256:100000000

# This mints 100 USDC (100_000_000 in 6-decimal micro-units)
```

Need Sepolia ETH/STRK for gas? → [faucet.starknet.io](https://faucet.starknet.io)
