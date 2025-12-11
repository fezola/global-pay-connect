# Manual Edge Function Deployment Guide

Since automated deployment had issues, here's how to deploy manually.

## Option 1: Deploy via Supabase Dashboard (Easiest)

### Step 1: Login to Supabase Dashboard
Go to: https://supabase.com/dashboard/project/crkhkzcscgoeyspaczux/functions

### Step 2: Deploy Each Function

For each function, click "Deploy new function" and upload the folder:

1. **create-payment-intent**
   - Upload: `supabase/functions/create-payment-intent`
   - Verify JWT: ✅ Yes

2. **monitor-blockchain**
   - Upload: `supabase/functions/monitor-blockchain`
   - Verify JWT: ❌ No

3. **settle-payment**
   - Upload: `supabase/functions/settle-payment`
   - Verify JWT: ❌ No

4. **deliver-webhooks**
   - Upload: `supabase/functions/deliver-webhooks`
   - Verify JWT: ❌ No

5. **wallet-nonce**
   - Upload: `supabase/functions/wallet-nonce`
   - Verify JWT: ❌ No

6. **prove-control**
   - Upload: `supabase/functions/prove-control`
   - Verify JWT: ❌ No

7. **submit-kyb**
   - Upload: `supabase/functions/submit-kyb`
   - Verify JWT: ❌ No

---

## Option 2: Deploy via Command Line

### Step 1: Install Supabase CLI

**Using Scoop (Recommended for Windows):**
```powershell
# Install Scoop if you don't have it
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex

# Add Supabase bucket
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git

# Install Supabase CLI
scoop install supabase
```

**Or download binary directly:**
https://github.com/supabase/cli/releases

### Step 2: Login
```powershell
supabase login
```

### Step 3: Deploy Functions
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

## Option 3: Deploy One Function at a Time (Testing)

Let's start with just the payment intent function:

```powershell
npx supabase login
npx supabase functions deploy create-payment-intent --project-ref crkhkzcscgoeyspaczux
```

If that works, continue with the others.

---

## Verify Deployment

After deploying, verify at:
https://supabase.com/dashboard/project/crkhkzcscgoeyspaczux/functions

You should see all 7 functions listed.

---

## Test a Function

Test the create-payment-intent function:

```powershell
# First, get your access token by logging into the app
# Then run:
curl -X POST https://crkhkzcscgoeyspaczux.supabase.co/functions/v1/create-payment-intent `
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" `
  -H "Content-Type: application/json" `
  -d '{\"amount\": \"1.00\", \"currency\": \"USDC\"}'
```

---

## Next Steps After Deployment

1. **Enable Realtime**
   - Go to: https://supabase.com/dashboard/project/crkhkzcscgoeyspaczux/database/replication
   - Enable for: `payment_intents` and `webhook_events`

2. **Setup Cron Jobs**
   - See: `supabase/functions/_cron/README.md`
   - Use cron-job.org or similar service

3. **Test Payment Flow**
   - Run: `npm run dev`
   - Create a payment in the app
   - Get devnet USDC from: https://spl-token-faucet.com/

---

## Troubleshooting

### "Function not found"
- Make sure you're in the project root directory
- Check the function folder exists in `supabase/functions/`

### "Unauthorized"
- Run `supabase login` again
- Check you're using the correct project ref

### "Deployment failed"
- Check function logs in Supabase dashboard
- Verify the function code has no syntax errors

---

## Quick Reference

**Project Ref:** `crkhkzcscgoeyspaczux`

**Dashboard:** https://supabase.com/dashboard/project/crkhkzcscgoeyspaczux

**Functions to Deploy:**
1. create-payment-intent (JWT: Yes)
2. monitor-blockchain (JWT: No)
3. settle-payment (JWT: No)
4. deliver-webhooks (JWT: No)
5. wallet-nonce (JWT: No)
6. prove-control (JWT: No)
7. submit-kyb (JWT: No)

