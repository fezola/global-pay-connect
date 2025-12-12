# 🚀 Klyr Production Deployment Checklist

This is your step-by-step guide to deploying Klyr to production.

---

## ✅ Pre-Deployment Checklist

### 1. Environment Variables Required

#### **Supabase (Backend)**
- [ ] `SUPABASE_URL` - Your Supabase project URL
- [ ] `SUPABASE_ANON_KEY` - Public anon key (auto-set)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Service role key (auto-set)
- [ ] `HOT_WALLET_PRIVATE_KEY` - Solana wallet private key for processing payouts
- [ ] `SOLANA_RPC_URL` - Mainnet RPC URL (e.g., https://api.mainnet-beta.solana.com)

#### **Frontend (Vercel/Netlify)**
- [ ] `VITE_SUPABASE_URL` - Your Supabase project URL
- [ ] `VITE_SUPABASE_PUBLISHABLE_KEY` - Your Supabase anon key

#### **Cron Worker (Render/Railway)**
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Service role key
- [ ] `PORT` - Port for health check server (default: 3000)

---

## 📋 Deployment Steps

### **Step 1: Database Setup** ✅ (Already Done)

Your database migrations are already in place. Verify tables exist:

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref crkhkzcscgoeyspaczux

# Verify migrations (should already be applied)
supabase db push
```

**Tables to verify:**
- ✅ merchants
- ✅ businesses
- ✅ payment_intents
- ✅ transactions
- ✅ balances
- ✅ webhook_events
- ✅ webhook_endpoints
- ✅ payouts
- ✅ payout_destinations
- ✅ payout_approvals

---

### **Step 2: Generate Hot Wallet** 🔑

Generate a Solana wallet for processing payouts:

```bash
npm run generate:wallet
```

This will output:
- Public Key (save this)
- Private Key (save this securely - you'll need it for env vars)

**⚠️ IMPORTANT:** 
- Fund this wallet with SOL for transaction fees
- Keep the private key secure - never commit to git
- For production, use mainnet. For testing, use devnet.

---

### **Step 3: Deploy Edge Functions** 🔧

Deploy all 13 Edge Functions to Supabase:

```bash
# Option 1: Use the deployment script (Windows)
npm run deploy:functions

# Option 2: Deploy manually
supabase functions deploy create-payment-intent
supabase functions deploy monitor-blockchain
supabase functions deploy settle-payment
supabase functions deploy deliver-webhooks
supabase functions deploy wallet-nonce
supabase functions deploy prove-control
supabase functions deploy submit-kyb
supabase functions deploy api-v1
supabase functions deploy create-payout
supabase functions deploy process-payout
supabase functions deploy approve-payout
supabase functions deploy reject-payout
```

**Verify deployment:**
```bash
supabase functions list
```

You should see all 12 functions listed.

---

### **Step 4: Set Supabase Secrets** 🔐

Set environment variables for Edge Functions:

```bash
# Set hot wallet private key
supabase secrets set HOT_WALLET_PRIVATE_KEY="your_private_key_here"

# Set Solana RPC URL (mainnet)
supabase secrets set SOLANA_RPC_URL="https://api.mainnet-beta.solana.com"

# Or use a premium RPC for better performance
supabase secrets set SOLANA_RPC_URL="https://your-quicknode-url.com"
```

**Verify secrets:**
```bash
supabase secrets list
```

---

### **Step 5: Deploy Frontend** 🌐

#### **Option A: Deploy to Vercel (Recommended)**

```bash
# Install Vercel CLI
npm install -g vercel

# Build the app
npm run build

# Deploy to production
vercel --prod
```

**Set environment variables in Vercel dashboard:**
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add:
   - `VITE_SUPABASE_URL` = `https://crkhkzcscgoeyspaczux.supabase.co`
   - `VITE_SUPABASE_PUBLISHABLE_KEY` = Your anon key

#### **Option B: Deploy to Netlify**

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build the app
npm run build

# Deploy to production
netlify deploy --prod --dir=dist
```

**Set environment variables in Netlify dashboard:**
Same as Vercel above.

---

### **Step 6: Deploy Cron Worker** ⏰

The cron worker runs automated jobs:
- Monitor blockchain (every 30 seconds)
- Settle payments (every 1 minute)
- Deliver webhooks (every 1 minute)
- Process payouts (every 5 minutes)

#### **Option A: Deploy to Render (Recommended - Free Tier)**

1. Create account at https://render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repo
4. Use these settings:
   - **Name:** klyr-cron-jobs
   - **Environment:** Node
   - **Build Command:** `npm install --legacy-peer-deps`
   - **Start Command:** `npm run cron`
   - **Plan:** Free
5. Add environment variable:
   - `SUPABASE_SERVICE_ROLE_KEY` = Your service role key

The `render.yaml` file is already configured!

#### **Option B: Deploy to Railway**

1. Create account at https://railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repo
4. Add environment variable:
   - `SUPABASE_SERVICE_ROLE_KEY` = Your service role key
5. Railway will auto-detect and deploy

---

### **Step 7: Enable Realtime** 📡

Enable Realtime for live updates:

1. Go to: https://supabase.com/dashboard/project/crkhkzcscgoeyspaczux/database/replication
2. Enable replication for these tables:
   - `payment_intents`
   - `transactions`
   - `balances`
   - `webhook_events`
   - `payouts`

---

### **Step 8: Configure Custom Domain** 🌍

#### **For Frontend (Vercel/Netlify)**

1. Go to your project settings
2. Navigate to "Domains"
3. Add your custom domain (e.g., `app.klyr.io`)
4. Follow DNS configuration instructions
5. SSL certificate will be auto-provisioned

#### **For Supabase (Optional)**

You can use Supabase's default domain or configure a custom domain in project settings.

---

## 🧪 Post-Deployment Testing

### Test Checklist

- [ ] **Sign up flow** - Create a new merchant account
- [ ] **Business onboarding** - Complete business information
- [ ] **Wallet verification** - Add and verify Solana wallet
- [ ] **API key generation** - Generate test and production keys
- [ ] **Payment creation** - Create a payment intent
- [ ] **Payment processing** - Send crypto and verify settlement
- [ ] **Webhook delivery** - Verify webhooks are sent
- [ ] **Payout request** - Request a payout
- [ ] **Payout approval** - Approve and process payout
- [ ] **Dashboard updates** - Verify real-time updates work

---

## 📊 Monitoring & Alerts

### Set Up Monitoring

1. **Supabase Logs**
   - Go to: https://supabase.com/dashboard/project/crkhkzcscgoeyspaczux/logs
   - Monitor Edge Function logs
   - Set up log alerts for errors

2. **Vercel/Netlify Analytics**
   - Enable analytics in your hosting dashboard
   - Monitor page load times and errors

3. **Uptime Monitoring** (Optional)
   - Use UptimeRobot or Pingdom
   - Monitor your frontend URL
   - Monitor cron worker health endpoint

4. **Error Tracking** (Optional)
   - Integrate Sentry for error tracking
   - Add to both frontend and Edge Functions

---

## 🔒 Security Checklist

- [ ] All secrets stored in environment variables (not in code)
- [ ] Row Level Security (RLS) enabled on all tables
- [ ] API keys use proper prefixes (`sk_test_`, `sk_live_`)
- [ ] Hot wallet private key never exposed
- [ ] CORS configured correctly
- [ ] Rate limiting enabled on API endpoints
- [ ] Webhook signatures verified
- [ ] HTTPS enforced on all endpoints

---

## 🎉 You're Live!

Once all steps are complete, your crypto payment gateway is live in production!

**Next Steps:**
1. Create your first production merchant account
2. Generate production API keys
3. Test with real (small) transactions
4. Share with beta users
5. Monitor logs and performance

---

## 📞 Support

If you encounter issues:
1. Check Supabase logs for Edge Function errors
2. Check browser console for frontend errors
3. Verify all environment variables are set correctly
4. Ensure cron worker is running (check health endpoint)

