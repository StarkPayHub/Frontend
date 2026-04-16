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
  0x058a1e8058620d285047c7ee3df15804898070e6788fbffe004a29ffa554aa2c \
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
- There is no withdrawal fee
- USDC lands in your wallet within the same block as the withdrawal transaction
