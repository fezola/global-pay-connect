# 🔐 Environment Variables Configuration

Complete guide to all environment variables needed for Klyr deployment.

---

## 📋 Quick Reference

| Variable | Where Used | Required | Secret? |
|----------|-----------|----------|---------|
| `VITE_SUPABASE_URL` | Frontend | ✅ Yes | ❌ No |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Frontend | ✅ Yes | ❌ No |
| `SUPABASE_URL` | Edge Functions | ✅ Auto-set | ❌ No |
| `SUPABASE_ANON_KEY` | Edge Functions | ✅ Auto-set | ❌ No |
| `SUPABASE_SERVICE_ROLE_KEY` | Edge Functions, Cron Worker | ✅ Auto-set | ✅ Yes |
| `HOT_WALLET_PRIVATE_KEY` | Edge Functions | ✅ Yes | ✅ Yes |
| `SOLANA_RPC_URL` | Edge Functions | ✅ Yes | ❌ No |
| `PORT` | Cron Worker | ⚠️ Optional | ❌ No |

---

## 🌐 Frontend Environment Variables

### Where to Set
- **Vercel:** Project Settings → Environment Variables
- **Netlify:** Site Settings → Build & Deploy → Environment

### Variables

#### `VITE_SUPABASE_URL`
- **Description:** Your Supabase project URL
- **Value:** `https://crkhkzcscgoeyspaczux.supabase.co`
- **How to get:** Supabase Dashboard → Settings → API → Project URL

#### `VITE_SUPABASE_PUBLISHABLE_KEY`
- **Description:** Supabase anon/public key (safe to expose)
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **How to get:** Supabase Dashboard → Settings → API → Project API keys → `anon` `public`

---

## 🔧 Edge Functions Environment Variables

### Where to Set
Use Supabase CLI to set secrets:

```bash
npx supabase secrets set VARIABLE_NAME="value"
```

Or via Supabase Dashboard:
- Go to: https://supabase.com/dashboard/project/crkhkzcscgoeyspaczux/settings/functions
- Click "Manage secrets"

### Variables

#### `SUPABASE_URL` (Auto-set)
- **Description:** Your Supabase project URL
- **Value:** Automatically set by Supabase
- **Action:** ✅ No action needed

#### `SUPABASE_ANON_KEY` (Auto-set)
- **Description:** Supabase anon key
- **Value:** Automatically set by Supabase
- **Action:** ✅ No action needed

#### `SUPABASE_SERVICE_ROLE_KEY` (Auto-set)
- **Description:** Supabase service role key (full database access)
- **Value:** Automatically set by Supabase
- **Action:** ✅ No action needed
- **⚠️ WARNING:** Never expose this key in frontend code!

#### `HOT_WALLET_PRIVATE_KEY` ⚠️ CRITICAL
- **Description:** Solana wallet private key for processing payouts
- **Value:** `[1,2,3,4,...]` (array of numbers) or base58 string
- **How to get:** Run `npm run generate:wallet`
- **Set via CLI:**
  ```bash
  npx supabase secrets set HOT_WALLET_PRIVATE_KEY="your_private_key_here"
  ```
- **⚠️ SECURITY:**
  - Never commit to git
  - Never share publicly
  - Keep backup in secure location
  - Fund with SOL for transaction fees

#### `SOLANA_RPC_URL`
- **Description:** Solana RPC endpoint URL
- **Production value:** `https://api.mainnet-beta.solana.com`
- **Test value:** `https://api.devnet.solana.com`
- **Premium options:**
  - QuickNode: `https://your-endpoint.quiknode.pro/...`
  - Alchemy: `https://solana-mainnet.g.alchemy.com/v2/...`
  - Helius: `https://mainnet.helius-rpc.com/?api-key=...`
- **Set via CLI:**
  ```bash
  npx supabase secrets set SOLANA_RPC_URL="https://api.mainnet-beta.solana.com"
  ```
- **💡 Tip:** Use premium RPC for better reliability and rate limits

---

## ⏰ Cron Worker Environment Variables

### Where to Set
- **Render:** Dashboard → Your Service → Environment → Add Environment Variable
- **Railway:** Dashboard → Your Project → Variables
- **Heroku:** Dashboard → Your App → Settings → Config Vars

### Variables

#### `SUPABASE_SERVICE_ROLE_KEY` ⚠️ CRITICAL
- **Description:** Service role key for calling Edge Functions
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **How to get:** Supabase Dashboard → Settings → API → Project API keys → `service_role` `secret`
- **⚠️ WARNING:** This key has full database access - keep it secret!

#### `PORT` (Optional)
- **Description:** Port for health check HTTP server
- **Default:** `3000`
- **Render:** Auto-set to `10000`
- **Railway:** Auto-set
- **Action:** Usually no action needed

---

## 🔍 How to Get Supabase Keys

### Step 1: Go to Supabase Dashboard
https://supabase.com/dashboard/project/crkhkzcscgoeyspaczux/settings/api

### Step 2: Copy Keys

You'll see:
- **Project URL:** `https://crkhkzcscgoeyspaczux.supabase.co`
- **anon public:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (safe to expose)
- **service_role secret:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (⚠️ keep secret!)

---

## 🔐 Security Best Practices

### ✅ DO:
- Store secrets in environment variables
- Use different keys for test/production
- Rotate keys periodically
- Keep service role key server-side only
- Use premium RPC endpoints for production
- Back up hot wallet private key securely

### ❌ DON'T:
- Commit secrets to git
- Share service role key publicly
- Use service role key in frontend
- Expose hot wallet private key
- Use same keys for test and production

---

## 📝 .env.example Template

Create a `.env.example` file (without actual values):

```env
# Frontend (Vercel/Netlify)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key_here

# Cron Worker (Render/Railway)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
PORT=3000

# Edge Functions (set via Supabase CLI)
# HOT_WALLET_PRIVATE_KEY=your_hot_wallet_private_key
# SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

---

## ✅ Verification Checklist

After setting all variables:

- [ ] Frontend builds successfully
- [ ] Frontend can connect to Supabase
- [ ] Edge Functions can access database
- [ ] Hot wallet is funded with SOL
- [ ] Cron worker can call Edge Functions
- [ ] Test payment flow works end-to-end

---

## 🧪 Testing Environment Variables

### Test Frontend Variables
```bash
npm run build
```
Should complete without errors.

### Test Edge Function Secrets
```bash
npx supabase secrets list
```
Should show your secrets (values hidden).

### Test Cron Worker
Visit: `https://your-worker.onrender.com/health`

Should return healthy status.

---

## 🔄 Updating Variables

### Frontend (Vercel/Netlify)
1. Update in dashboard
2. Redeploy (automatic or manual)

### Edge Functions
```bash
npx supabase secrets set VARIABLE_NAME="new_value"
```
Functions automatically use new value.

### Cron Worker (Render/Railway)
1. Update in dashboard
2. Service automatically restarts

---

## 📞 Troubleshooting

### "Unauthorized" errors
- Check `SUPABASE_SERVICE_ROLE_KEY` is set correctly
- Verify key hasn't expired

### "RPC request failed"
- Check `SOLANA_RPC_URL` is correct
- Verify RPC endpoint is accessible
- Consider using premium RPC

### "Insufficient funds"
- Check hot wallet has SOL for fees
- Fund the wallet address

---

**All environment variables configured? ✅ You're ready to deploy!**

