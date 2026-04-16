# Keeper Deployment Guide

The keeper bot needs to run 24/7. Deploy it on one of these platforms:

---

## Option 1 — Railway (Recommended)

Railway gives **$5 free credit/month** — enough for the keeper (estimated < $1/month).

### Steps

**1. Push your repo to GitHub**

Make sure the `keepers/` folder is in your GitHub repo.

**2. Create a Railway account**

Sign up at [railway.app](https://railway.app) → login with GitHub.

**3. New Project → Deploy from GitHub repo**

Select your StarkPay repo.

**4. Set Root Directory**

- Go to your service → **Settings** tab
- Set **Root Directory** to `keepers`
- Save

**5. Set Environment Variables**

Go to the **Variables** tab and add:

| Variable | Value |
|---|---|
| `KEEPER_PRIVATE_KEY` | `0x...` private key of your keeper wallet |
| `KEEPER_ADDRESS` | `0x...` address of your keeper wallet |
| `STARKPAY_ADDRESS` | `0x058a1e8058620d285047c7ee3df15804898070e6788fbffe004a29ffa554aa2c` |
| `STARKNET_RPC` | `https://starknet-sepolia.g.alchemy.com/starknet/version/rpc/v0_8/demo` |
| `DEPLOY_BLOCK` | `8540000` |
| `MODE` | `loop` |

**6. Deploy**

Go to **Deploy** tab → click **Deploy Now**. Wait 1–2 minutes for build.

Check the **Logs** tab. You should see:

```
🔁 Starting keeper in loop mode (every 1 hour)
🔄 Keeper running at 2026-04-16T...
📡 Fetching SubscriptionCreated events...
📊 Done: 0 renewed, 0 skipped, 0 failed
```

The keeper will run automatically every hour.

---

## Option 2 — Render

Render's free tier does **not** support background workers (they require $7/month Starter plan).

If you use Render:
- **New → Background Worker**
- Root Directory: `keepers`
- Build Command: `npm install`
- Start Command: `npm run start:loop`
- Add the same environment variables as above

---

## Option 3 — VPS (Cheapest Long-Term)

Good options: Hetzner (€4.5/mo), DigitalOcean ($6/mo), Contabo (€5/mo).

```bash
# SSH into your VPS (Ubuntu)
git clone https://github.com/<you>/StarkPay.git
cd StarkPay/keepers

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Setup
npm install
cp .env.example .env
nano .env   # fill in KEEPER_PRIVATE_KEY, KEEPER_ADDRESS, etc.

# Run with PM2 (auto-restart on crash + VPS reboot)
npm install -g pm2
pm2 start "npm run start:loop" --name keeper
pm2 save
pm2 startup   # auto-start after VPS reboot
```

---

## Keeper Wallet Setup

The keeper needs a dedicated wallet with gas tokens.

1. Create a new Argent X or Braavos wallet (don't reuse your main wallet)
2. Note its private key and address
3. Fund it with Sepolia ETH/STRK from [faucet.starknet.io](https://faucet.starknet.io)
4. Set `KEEPER_PRIVATE_KEY` and `KEEPER_ADDRESS` in your deployment

Each renewal costs < 0.001 STRK. Even 1 STRK should last thousands of renewals.

---

## Troubleshooting

**`❌ Set KEEPER_PRIVATE_KEY and KEEPER_ADDRESS env vars`**

Environment variables not set. Check the Variables tab in Railway.

**`Found 0 unique subscriptions`**

Either no one has subscribed yet, or `DEPLOY_BLOCK` is too high. Try `DEPLOY_BLOCK=0` to scan from genesis (slower).

**`Failed user=... Insufficient balance`**

User doesn't have enough USDC for renewal. This is expected — the keeper logs it and moves on.

**Keeper stops on Railway**

Check Logs for errors (usually RPC timeout). Railway auto-restarts the process — check if it came back up after a few minutes.

**Check keeper wallet balance**

Visit [sepolia.starkscan.co](https://sepolia.starkscan.co) and paste your keeper address. Add more gas from the faucet if needed.
