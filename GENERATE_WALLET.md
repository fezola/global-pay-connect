# Generate Hot Wallet for Payouts

## 🚀 Quick Start

Run this command to generate a new Solana hot wallet:

```powershell
npm run generate:wallet
```

This will:
1. ✅ Generate a new Solana keypair
2. ✅ Display the wallet address (public key)
3. ✅ Display the private key in base58 format
4. ✅ Save a backup to `hot-wallet-backup.json`
5. ✅ Show you the next steps

---

## 📋 What You'll Get

After running the script, you'll see:

```
🔐 Generating Solana Hot Wallet...

✅ Hot Wallet Generated!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 WALLET ADDRESS (Public Key):
7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU

🔑 PRIVATE KEY (Base58) - Use this for HOT_WALLET_PRIVATE_KEY:
5J7s8kd9Hf3Ks9dKf8sKd9fKs8dKf9sKd8fKs9dKf8sKd9fKs8dKf9sKd8f

💾 PRIVATE KEY (JSON Array) - For backup:
[123,45,67,89,...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🔐 Next Steps

### Step 1: Add to Supabase Secrets

1. Go to: https://supabase.com/dashboard/project/crkhkzcscgoeyspaczux/settings/functions
2. Click **"Add secret"**
3. Add these two secrets:

**Secret 1:**
- Name: `HOT_WALLET_PRIVATE_KEY`
- Value: `<the base58 private key from the script>`

**Secret 2:**
- Name: `SOLANA_RPC_ENDPOINT`
- Value: `https://api.devnet.solana.com`

### Step 2: Fund the Wallet

**Get SOL (for transaction fees):**
1. Go to: https://faucet.solana.com/
2. Paste your wallet address
3. Click "Airdrop 2 SOL"

**Get USDC (for payouts):**
1. Go to: https://spl-token-faucet.com/
2. Paste your wallet address
3. Select "USDC-Dev"
4. Click "Airdrop"

### Step 3: Verify Balance

Check your wallet on Solana Explorer:
```
https://explorer.solana.com/address/<YOUR_WALLET_ADDRESS>?cluster=devnet
```

---

## ⚠️ Security Warnings

### DO NOT:
- ❌ Commit `hot-wallet-backup.json` to git
- ❌ Share the private key with anyone
- ❌ Use this wallet for personal funds
- ❌ Keep large amounts in this wallet

### DO:
- ✅ Delete `hot-wallet-backup.json` after copying keys
- ✅ Store backup in a secure password manager
- ✅ Use only for payouts
- ✅ Keep balance low (only what's needed)
- ✅ Start with devnet before mainnet
- ✅ Monitor balance regularly

---

## 🔍 Check Wallet Balance

**Via Solana CLI:**
```bash
# Check SOL balance
solana balance <WALLET_ADDRESS> --url devnet

# Check USDC balance
spl-token balance EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v --owner <WALLET_ADDRESS> --url devnet
```

**Via Explorer:**
```
https://explorer.solana.com/address/<WALLET_ADDRESS>?cluster=devnet
```

---

## 🛠️ Troubleshooting

### "Cannot find module '@solana/web3.js'"

Install dependencies:
```bash
npm install
```

### "hot-wallet-backup.json already exists"

Delete the old file first:
```bash
rm hot-wallet-backup.json
npm run generate:wallet
```

### Need to generate a new wallet?

Just run the script again:
```bash
npm run generate:wallet
```

Each run generates a completely new wallet.

---

## 📊 What This Wallet Is For

This hot wallet is used by the `process-payout` edge function to:
1. Send USDC/USDT to merchants who request payouts
2. Pay transaction fees on Solana
3. Execute on-chain transfers automatically

**Flow:**
```
Merchant requests payout
        ↓
Approved (auto or manual)
        ↓
Cron job triggers process-payout
        ↓
Hot wallet sends USDC to merchant
        ↓
Transaction confirmed
        ↓
Payout marked as complete
```

---

## 🔄 For Mainnet

When ready for production:

1. Generate a new wallet (don't reuse devnet wallet)
2. Change RPC endpoint to mainnet:
   ```
   SOLANA_RPC_ENDPOINT=https://api.mainnet-beta.solana.com
   ```
3. Or use a paid RPC for better reliability:
   - Helius: https://helius.dev/
   - QuickNode: https://quicknode.com/
   - Alchemy: https://alchemy.com/

4. Fund with real SOL and USDC
5. Start with small amounts
6. Monitor closely

---

## 📞 Need Help?

- **Solana Docs**: https://docs.solana.com/
- **Solana Explorer**: https://explorer.solana.com/
- **Faucet**: https://faucet.solana.com/
- **USDC Faucet**: https://spl-token-faucet.com/

---

**Ready?** Run: `npm run generate:wallet` 🚀

