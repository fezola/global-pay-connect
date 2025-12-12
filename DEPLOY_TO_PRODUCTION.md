# 🚀 Deploy Klyr to Production - Quick Start

This guide will get you from zero to production in ~30 minutes.

---

## 🎯 Overview

You'll deploy 3 components:
1. **Edge Functions** → Supabase (backend API)
2. **Frontend** → Vercel (web app)
3. **Cron Worker** → Render (automated jobs)

---

## ⚡ Quick Deploy (30 minutes)

### **Step 1: Verify Readiness** (2 min)

```bash
npm run deploy:verify
```

This checks if everything is ready for deployment.

---

### **Step 2: Generate Hot Wallet** (3 min)

```bash
npm run generate:wallet
```

**Save the output:**
- ✅ Public Key: `[Save this]`
- ✅ Private Key: `[Save this - KEEP SECRET]`

**Fund the wallet:**
- For **production**: Send SOL to this address on mainnet (for transaction fees)
- For **testing**: Use devnet faucet

---

### **Step 3: Deploy Edge Functions** (5 min)

```bash
# Login to Supabase (first time only)
npx supabase login

# Link to your project (first time only)
npx supabase link --project-ref crkhkzcscgoeyspaczux

# Deploy all functions
npm run deploy:functions
```

**Set secrets:**
```bash
# Set hot wallet private key
npx supabase secrets set HOT_WALLET_PRIVATE_KEY="your_private_key_from_step_2"

# Set Solana RPC URL
npx supabase secrets set SOLANA_RPC_URL="https://api.mainnet-beta.solana.com"
```

**Verify:**
```bash
npx supabase functions list
```

You should see 12 functions deployed.

---

### **Step 4: Deploy Frontend to Vercel** (10 min)

#### **Option A: Deploy via Vercel Dashboard (Easiest)**

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add environment variables:
   - `VITE_SUPABASE_URL` = `https://crkhkzcscgoeyspaczux.supabase.co`
   - `VITE_SUPABASE_PUBLISHABLE_KEY` = `[Get from Supabase dashboard]`
5. Click "Deploy"

#### **Option B: Deploy via CLI**

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

When prompted, add environment variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

---

### **Step 5: Deploy Cron Worker to Render** (10 min)

#### **Option A: Deploy via Render Dashboard (Easiest)**

1. Go to https://render.com/
2. Sign up / Login
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name:** `klyr-cron-jobs`
   - **Environment:** `Node`
   - **Build Command:** `npm install --legacy-peer-deps`
   - **Start Command:** `npm run cron`
   - **Plan:** Free
6. Add environment variable:
   - Key: `SUPABASE_SERVICE_ROLE_KEY`
   - Value: `[Get from Supabase dashboard → Settings → API]`
7. Click "Create Web Service"

The `render.yaml` file will auto-configure everything!

#### **Option B: Deploy via Render Blueprint**

```bash
# Just push to GitHub, then:
# 1. Go to Render dashboard
# 2. Click "New +" → "Blueprint"
# 3. Connect your repo
# 4. Render will auto-detect render.yaml
```

---

### **Step 6: Enable Realtime** (2 min)

1. Go to: https://supabase.com/dashboard/project/crkhkzcscgoeyspaczux/database/replication
2. Enable replication for:
   - ✅ `payment_intents`
   - ✅ `transactions`
   - ✅ `balances`
   - ✅ `webhook_events`
   - ✅ `payouts`

---

## 🧪 Test Your Deployment

### 1. Test Frontend
Visit your Vercel URL (e.g., `https://your-app.vercel.app`)

### 2. Test Cron Worker
Visit your Render URL + `/health` (e.g., `https://klyr-cron-jobs.onrender.com/health`)

Should return:
```json
{
  "status": "healthy",
  "uptime": "...",
  "jobs": {...}
}
```

### 3. Test Payment Flow
1. Sign up on your deployed app
2. Complete business onboarding
3. Generate API keys
4. Create a payment intent
5. Send crypto to the payment address
6. Verify payment is detected and settled

---

## 🎉 You're Live!

Your crypto payment gateway is now live in production!

**URLs:**
- 🌐 Frontend: `https://your-app.vercel.app`
- 🔧 Edge Functions: `https://crkhkzcscgoeyspaczux.supabase.co/functions/v1/`
- ⏰ Cron Worker: `https://klyr-cron-jobs.onrender.com`

---

## 📊 Monitor Your Deployment

### Supabase Logs
https://supabase.com/dashboard/project/crkhkzcscgoeyspaczux/logs

### Vercel Logs
https://vercel.com/dashboard → Your Project → Logs

### Render Logs
https://dashboard.render.com → Your Service → Logs

---

## 🔧 Troubleshooting

### Edge Functions Not Working
- Check Supabase logs for errors
- Verify secrets are set: `npx supabase secrets list`
- Redeploy: `npm run deploy:functions`

### Frontend Not Loading
- Check Vercel build logs
- Verify environment variables are set
- Check browser console for errors

### Cron Worker Not Running
- Check Render logs
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set
- Check health endpoint: `https://your-worker.onrender.com/health`

### Payments Not Processing
- Verify cron worker is running
- Check hot wallet has SOL for fees
- Check Supabase logs for `monitor-blockchain` function

---

## 🔐 Security Checklist

- [ ] Hot wallet private key is in secrets (not in code)
- [ ] Service role key is only in cron worker (not in frontend)
- [ ] All environment variables are set correctly
- [ ] RLS is enabled on all database tables
- [ ] HTTPS is enforced on all endpoints

---

## 📞 Need Help?

Check the detailed guide: `PRODUCTION_DEPLOYMENT_CHECKLIST.md`

---

**Congratulations! 🎉 Your crypto payment gateway is live!**

