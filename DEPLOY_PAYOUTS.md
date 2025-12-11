# Deploy Payout System - Quick Guide

## 🚀 Step-by-Step Deployment

### Step 1: Deploy Edge Functions (5 min)

Go to: https://supabase.com/dashboard/project/crkhkzcscgoeyspaczux/functions

**Deploy `create-payout`**:
1. Click "Deploy new function"
2. Upload `supabase/functions/create-payout` folder
3. Set "Verify JWT" to **YES** ✅
4. Click Deploy

**Deploy `process-payout`**:
1. Click "Deploy new function"
2. Upload `supabase/functions/process-payout` folder
3. Set "Verify JWT" to **NO** ❌
4. Click Deploy

---

### Step 2: Generate Hot Wallet (2 min)

You need a Solana wallet to send payouts from.

**Option A: Use Phantom/Solflare**
1. Create a new wallet in Phantom
2. Export private key (Settings → Export Private Key)
3. Convert to base58 format

**Option B: Use Solana CLI**
```bash
# Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Generate new wallet
solana-keygen new --outfile hot-wallet.json

# Get the address
solana-keygen pubkey hot-wallet.json

# Get private key in base58 (for env var)
# You'll need to manually convert the JSON array to base58
```

**Save these**:
- Wallet Address: `_______________`
- Private Key (base58): `_______________`

---

### Step 3: Add Environment Variables (2 min)

Go to: https://supabase.com/dashboard/project/crkhkzcscgoeyspaczux/settings/functions

Click "Add secret" and add:

```
HOT_WALLET_PRIVATE_KEY=<your_base58_private_key>
SOLANA_RPC_ENDPOINT=https://api.devnet.solana.com
```

**For mainnet**, use:
```
SOLANA_RPC_ENDPOINT=https://api.mainnet-beta.solana.com
```

Or use a paid RPC like Helius/QuickNode for better reliability.

---

### Step 4: Fund Hot Wallet (3 min)

**For Devnet Testing**:

1. **Get SOL** (for transaction fees):
```bash
solana airdrop 2 <YOUR_HOT_WALLET_ADDRESS> --url devnet
```

2. **Get USDC** (for payouts):
   - Visit: https://spl-token-faucet.com/
   - Select "USDC-Dev"
   - Enter your hot wallet address
   - Click "Airdrop"

**For Mainnet**:
- Transfer SOL for fees (~0.01 SOL per transaction)
- Transfer USDC/USDT from your main wallet

---

### Step 5: Setup Cron Job (5 min)

Go to: https://cron-job.org (or use any cron service)

**Create Job**:
- **Title**: Process Payouts
- **URL**: `https://crkhkzcscgoeyspaczux.supabase.co/functions/v1/process-payout`
- **Method**: POST
- **Schedule**: Every 5 minutes (`*/5 * * * *`)
- **Headers**:
  ```
  Authorization: Bearer <YOUR_SERVICE_ROLE_KEY>
  Content-Type: application/json
  ```

**Get Service Role Key**:
https://supabase.com/dashboard/project/crkhkzcscgoeyspaczux/settings/api

---

### Step 6: Test It! (5 min)

1. **Go to your app**: http://localhost:8080/payouts

2. **Request a payout**:
   - Amount: $50
   - Destination: Your test wallet address
   - Click "Request Payout"

3. **Check status**:
   - Should show "approved" (since < $1000)
   - Wait 5 minutes for cron job
   - Status should change to "processing" → "completed"

4. **Verify on blockchain**:
   - Click the transaction link
   - Should open Solscan showing the transfer

---

## 🧪 Testing Checklist

- [ ] Edge functions deployed
- [ ] Hot wallet generated
- [ ] Environment variables set
- [ ] Hot wallet funded (SOL + USDC)
- [ ] Cron job configured
- [ ] Test payout created
- [ ] Payout processed successfully
- [ ] Transaction visible on Solscan
- [ ] Balance updated correctly

---

## 🔍 Troubleshooting

### "Hot wallet private key not configured"
- Make sure you added `HOT_WALLET_PRIVATE_KEY` to edge function secrets
- Redeploy the `process-payout` function after adding secrets

### "Insufficient funds"
- Check hot wallet has enough SOL for fees
- Check hot wallet has enough USDC/USDT for payouts

### "Transaction failed"
- Check RPC endpoint is working
- Verify destination address is valid
- Check hot wallet has enough balance

### Payout stuck in "approved" status
- Check cron job is running
- Manually trigger: `curl -X POST <process-payout-url> -H "Authorization: Bearer <service-key>"`
- Check edge function logs

---

## 📊 Monitoring

**Check Hot Wallet Balance**:
```bash
solana balance <HOT_WALLET_ADDRESS> --url devnet
```

**Check USDC Balance**:
```bash
spl-token balance EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v --owner <HOT_WALLET_ADDRESS> --url devnet
```

**View Edge Function Logs**:
https://supabase.com/dashboard/project/crkhkzcscgoeyspaczux/functions

---

## 🎯 Quick Links

- **Functions Dashboard**: https://supabase.com/dashboard/project/crkhkzcscgoeyspaczux/functions
- **Function Secrets**: https://supabase.com/dashboard/project/crkhkzcscgoeyspaczux/settings/functions
- **API Keys**: https://supabase.com/dashboard/project/crkhkzcscgoeyspaczux/settings/api
- **Cron Job**: https://cron-job.org
- **Solscan (Devnet)**: https://solscan.io/?cluster=devnet
- **SPL Token Faucet**: https://spl-token-faucet.com/

---

## ⚠️ Security Reminders

1. **Never commit** hot wallet private key to git
2. **Use environment variables** for all secrets
3. **Monitor** hot wallet balance regularly
4. **Start with devnet** before going to mainnet
5. **Keep hot wallet balance low** - only what's needed for payouts
6. **Enable 2FA** on Supabase account
7. **Rotate keys** periodically

---

**Total Time**: ~20 minutes
**Difficulty**: Medium
**Status**: Ready to deploy! 🚀

