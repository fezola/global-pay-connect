# Deploy Edge Functions - Super Simple Way

Forget the CLI stress! Just use the Supabase Dashboard.

## Step 1: Go to Functions Page

Click this link: https://supabase.com/dashboard/project/crkhkzcscgoeyspaczux/functions

## Step 2: Deploy Each Function

For each function folder in `supabase/functions/`, click "Deploy new function" and upload it.

### Functions to Deploy:

1. **api-v1** ⭐ (NEW - Phase 2)
   - Folder: `supabase/functions/api-v1`
   - Verify JWT: ❌ **NO**
   - This is your REST API

2. **create-payment-intent** (Phase 1)
   - Folder: `supabase/functions/create-payment-intent`
   - Verify JWT: ✅ **YES**

3. **monitor-blockchain** (Phase 1)
   - Folder: `supabase/functions/monitor-blockchain`
   - Verify JWT: ❌ **NO**

4. **settle-payment** (Phase 1)
   - Folder: `supabase/functions/settle-payment`
   - Verify JWT: ❌ **NO**

5. **deliver-webhooks** (Phase 1)
   - Folder: `supabase/functions/deliver-webhooks`
   - Verify JWT: ❌ **NO**

6. **wallet-nonce** (Already deployed?)
   - Folder: `supabase/functions/wallet-nonce`
   - Verify JWT: ❌ **NO**

7. **prove-control** (Already deployed?)
   - Folder: `supabase/functions/prove-control`
   - Verify JWT: ❌ **NO**

8. **submit-kyb** (Already deployed?)
   - Folder: `supabase/functions/submit-kyb`
   - Verify JWT: ❌ **NO**

## Step 3: Test the API

Once `api-v1` is deployed, test it:

```powershell
# Get your service role key from:
# https://supabase.com/dashboard/project/crkhkzcscgoeyspaczux/settings/api

# Test create payment
curl -X POST https://crkhkzcscgoeyspaczux.supabase.co/functions/v1/api-v1/payments `
  -H "x-api-key: YOUR_SERVICE_ROLE_KEY" `
  -H "Content-Type: application/json" `
  -d '{\"amount\": \"10.00\", \"currency\": \"USDC\"}'
```

## Step 4: Setup Cron Jobs

Go to https://cron-job.org and create 3 jobs:

**Job 1: Monitor Blockchain** (every 30 seconds)
```
URL: https://crkhkzcscgoeyspaczux.supabase.co/functions/v1/monitor-blockchain
Method: POST
Header: Authorization: Bearer YOUR_SERVICE_ROLE_KEY
```

**Job 2: Settle Payments** (every 1 minute)
```
URL: https://crkhkzcscgoeyspaczux.supabase.co/functions/v1/settle-payment
Method: POST
Header: Authorization: Bearer YOUR_SERVICE_ROLE_KEY
```

**Job 3: Deliver Webhooks** (every 1 minute)
```
URL: https://crkhkzcscgoeyspaczux.supabase.co/functions/v1/deliver-webhooks
Method: POST
Header: Authorization: Bearer YOUR_SERVICE_ROLE_KEY
```

## Done! 🎉

That's it. No CLI, no stress. Just upload via dashboard.

---

## Quick Links

- **Functions Dashboard**: https://supabase.com/dashboard/project/crkhkzcscgoeyspaczux/functions
- **API Keys**: https://supabase.com/dashboard/project/crkhkzcscgoeyspaczux/settings/api
- **Database Replication**: https://supabase.com/dashboard/project/crkhkzcscgoeyspaczux/database/replication
- **Cron Jobs**: https://cron-job.org

---

## What Each Function Does

- **api-v1**: REST API for payments, balances, customers
- **create-payment-intent**: Creates new payment requests
- **monitor-blockchain**: Watches Solana for incoming payments
- **settle-payment**: Confirms and settles payments
- **deliver-webhooks**: Sends webhooks to merchants
- **wallet-nonce**: Generates nonce for wallet verification
- **prove-control**: Verifies wallet ownership
- **submit-kyb**: Handles KYB submissions

---

**Priority**: Deploy `api-v1` first to test the REST API!

