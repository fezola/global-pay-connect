# 🚀 Deploy Edge Functions - Quick Guide

## ✅ Database Already Deployed!

Your database tables are ready:
- ✅ `payment_intents` table created
- ✅ `webhook_events` table created
- ✅ RLS policies enabled
- ✅ Indexes created
- ✅ Triggers configured

---

## 📦 Deploy Edge Functions (Choose One Method)

### **Method 1: One Command (Recommended for Windows)**

```powershell
npm run deploy:functions
```

This will deploy all 7 edge functions automatically.

---

### **Method 2: Manual Deployment**

#### Step 1: Install Supabase CLI (if not installed)

```powershell
npm install -g supabase
```

#### Step 2: Login to Supabase

```powershell
supabase login
```

This will open your browser for authentication.

#### Step 3: Deploy Functions One by One

```powershell
# Payment functions
supabase functions deploy create-payment-intent --project-ref crkhkzcscgoeyspaczux
supabase functions deploy monitor-blockchain --project-ref crkhkzcscgoeyspaczux --no-verify-jwt
supabase functions deploy settle-payment --project-ref crkhkzcscgoeyspaczux --no-verify-jwt
supabase functions deploy deliver-webhooks --project-ref crkhkzcscgoeyspaczux --no-verify-jwt

# KYB functions
supabase functions deploy wallet-nonce --project-ref crkhkzcscgoeyspaczux --no-verify-jwt
supabase functions deploy prove-control --project-ref crkhkzcscgoeyspaczux --no-verify-jwt
supabase functions deploy submit-kyb --project-ref crkhkzcscgoeyspaczux --no-verify-jwt
```

---

### **Method 3: Via Supabase Dashboard**

1. Go to: https://supabase.com/dashboard/project/crkhkzcscgoeyspaczux/functions
2. Click "Deploy new function"
3. Upload each function folder from `supabase/functions/`

---

## ✅ Verify Deployment

After deployment, verify functions are live:

```powershell
# List all deployed functions
supabase functions list --project-ref crkhkzcscgoeyspaczux
```

Or visit: https://supabase.com/dashboard/project/crkhkzcscgoeyspaczux/functions

You should see:
- ✅ create-payment-intent
- ✅ monitor-blockchain
- ✅ settle-payment
- ✅ deliver-webhooks
- ✅ wallet-nonce
- ✅ prove-control
- ✅ submit-kyb

---

## 🧪 Test a Function

Test the create-payment-intent function:

```powershell
# Get your user token from the browser (after logging in)
# Then run:
curl -X POST https://crkhkzcscgoeyspaczux.supabase.co/functions/v1/create-payment-intent `
  -H "Authorization: Bearer YOUR_USER_TOKEN" `
  -H "Content-Type: application/json" `
  -d '{\"amount\": \"1.00\", \"currency\": \"USDC\"}'
```

---

## ⏰ Setup Cron Jobs (Required for Automation)

After deploying functions, you need to set up cron jobs to run them automatically.

### **Option A: Using cron-job.org (Easiest)**

1. Go to https://cron-job.org and create a free account
2. Create 3 cron jobs:

**Job 1: Monitor Blockchain (Every 30 seconds)**
- URL: `https://crkhkzcscgoeyspaczux.supabase.co/functions/v1/monitor-blockchain`
- Method: POST
- Schedule: `*/30 * * * * *` (every 30 seconds)
- Headers: `Authorization: Bearer YOUR_SERVICE_ROLE_KEY`

**Job 2: Settle Payments (Every 1 minute)**
- URL: `https://crkhkzcscgoeyspaczux.supabase.co/functions/v1/settle-payment`
- Method: POST
- Schedule: `* * * * *` (every minute)
- Headers: `Authorization: Bearer YOUR_SERVICE_ROLE_KEY`

**Job 3: Deliver Webhooks (Every 1 minute)**
- URL: `https://crkhkzcscgoeyspaczux.supabase.co/functions/v1/deliver-webhooks`
- Method: POST
- Schedule: `* * * * *` (every minute)
- Headers: `Authorization: Bearer YOUR_SERVICE_ROLE_KEY`

**Get your Service Role Key:**
1. Go to: https://supabase.com/dashboard/project/crkhkzcscgoeyspaczux/settings/api
2. Copy the `service_role` key (keep it secret!)

### **Option B: Manual Testing (For Development)**

Run functions manually when testing:

```powershell
# Monitor blockchain
curl -X POST https://crkhkzcscgoeyspaczux.supabase.co/functions/v1/monitor-blockchain `
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY"

# Settle payments
curl -X POST https://crkhkzcscgoeyspaczux.supabase.co/functions/v1/settle-payment `
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY"

# Deliver webhooks
curl -X POST https://crkhkzcscgoeyspaczux.supabase.co/functions/v1/deliver-webhooks `
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY"
```

---

## 🎯 Next Steps After Deployment

1. **Enable Realtime** (Manual step):
   - Go to: https://supabase.com/dashboard/project/crkhkzcscgoeyspaczux/database/replication
   - Enable for: `payment_intents` and `webhook_events`

2. **Test Payment Flow**:
   ```powershell
   npm run test:payment
   ```

3. **Start Development Server**:
   ```powershell
   npm run dev
   ```

4. **Create Your First Payment**:
   - Sign up in the app
   - Click "Receive Test USDC"
   - Get devnet USDC from: https://spl-token-faucet.com/
   - Send to payment address
   - Watch it settle automatically!

---

## 🆘 Troubleshooting

### "supabase: command not found"
```powershell
npm install -g supabase
```

### "Not logged in"
```powershell
supabase login
```

### "Function deployment failed"
- Check you're in the project root directory
- Verify the function folder exists in `supabase/functions/`
- Check function logs: `supabase functions logs FUNCTION_NAME`

### "Cron jobs not working"
- Verify service role key is correct
- Check function URLs are accessible
- View function logs in Supabase dashboard

---

## 📚 Documentation

- [Payment Flow](./PAYMENT_FLOW.md)
- [Quick Start](./QUICK_START.md)
- [Cron Setup](./supabase/functions/_cron/README.md)
- [Full Deployment Guide](./DEPLOYMENT.md)

---

**Ready to deploy? Run:** `npm run deploy:functions` 🚀

