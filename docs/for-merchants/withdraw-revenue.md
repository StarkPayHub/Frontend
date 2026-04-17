# Withdraw Revenue

Merchant funds accumulate in the StarkPay contract as subscribers pay. You can withdraw your balance to your wallet at any time.

---

## Via Dashboard

1. Go to [starkpayhub.vercel.app/merchant](https://starkpayhub.vercel.app/merchant)
2. Connect the merchant wallet
3. Click **Withdraw**
4. Confirm the transaction

The full withdrawable balance is sent to your wallet in one transaction.

---

## Via starkli CLI

```bash
starkli invoke \
  0x0156aa73efd3389c5552be7c61e07faa7bdefca67af1f0e604c77ed3c1fd86ad \
  withdraw
```

---

## Via SDK

```tsx
import { useStarkPay } from '@starkpay/sdk'

function WithdrawButton() {
  const { withdraw, loading } = useStarkPay()

  return (
    <button onClick={() => withdraw()} disabled={loading}>
      {loading ? 'Withdrawing...' : 'Withdraw Revenue'}
    </button>
  )
}
```

---

## How It Works

The contract uses a **check-before-transfer** pattern as a reentrancy guard:

1. Reads your `withdrawable` balance
2. Sets it to `0` in storage
3. Transfers USDC to your wallet

If the transfer fails for any reason, the transaction reverts and your balance is unchanged.

---

## Important Notes

- Only the address that created the plans (the merchant) can withdraw
- Withdrawals transfer the entire `withdrawable` balance — partial withdrawals are not supported
- USDC lands in your wallet within the same block as the withdrawal transaction

---

## Protocol Fee

StarkPay charges a **2% protocol fee** on every subscription payment (new subscriptions and renewals).

The fee is deducted automatically — you receive **98% of each payment**. You do not need to do anything; the contract handles this transparently.

**Example:** If your plan costs $15 USDC, you receive $14.70 per subscriber per billing period.

The fee percentage can be adjusted by the StarkPay owner (max 10%). The current rate is always readable on-chain:

```bash
starkli call <STARKPAY> get_protocol_fee_bps
# Returns basis points — 200 = 2%
```
