# Klyr Quick Start Guide

Get your payment gateway running in 10 minutes!

## Prerequisites

- Node.js 18+ installed
- Supabase account (free tier works)
- Basic knowledge of React and TypeScript

## Step 1: Clone & Install (2 minutes)

```bash
# Clone the repository
git clone https://github.com/yourusername/klyr.git
cd klyr

# Install dependencies
npm install
```

## Step 2: Supabase Setup (3 minutes)

### 2.1 Create Supabase Project
1. Go to https://supabase.com
2. Create a new project
3. Wait for database to initialize (~2 minutes)

### 2.2 Get Your Credentials
1. Go to Project Settings > API
2. Copy your project URL and anon key
3. Create `.env` file:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key_here
```

### 2.3 Run Migrations

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Run migrations
supabase db push
```

## Step 3: Deploy Edge Functions (3 minutes)

```bash
# Deploy all payment functions
supabase functions deploy create-payment-intent
supabase functions deploy monitor-blockchain
supabase functions deploy settle-payment
supabase functions deploy deliver-webhooks

# Deploy KYB functions
supabase functions deploy wallet-nonce
supabase functions deploy prove-control
supabase functions deploy submit-kyb
```

## Step 4: Start Development Server (1 minute)

```bash
npm run dev
```

Visit http://localhost:8080

## Step 5: Create Your First Payment (1 minute)

### 5.1 Sign Up
1. Click "Sign Up" in the app
2. Create an account
3. Complete onboarding

### 5.2 Create Payment Intent

**Option A: Via Dashboard**
1. Click "Receive Test USDC"
2. Enter amount
3. Click "Create Payment Intent"
4. Copy payment address

**Option B: Via API**
```bash
curl -X POST https://your-project.supabase.co/functions/v1/create-payment-intent \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": "1.00",
    "currency": "USDC",
    "description": "Test payment"
  }'
```

### 5.3 Send Test Payment

**Get Devnet USDC**:
1. Go to https://spl-token-faucet.com/
2. Connect your Solana wallet (Phantom/Solflare)
3. Request devnet USDC
4. Send to the payment address from step 5.2

**Wait for Confirmation**:
- Payment detected: ~30 seconds
- Settlement: ~1 minute
- Total time: ~2 minutes

## Step 6: Setup Cron Jobs (Optional but Recommended)

### Option A: Using cron-job.org (Free)

1. Go to https://cron-job.org
2. Create account
3. Add these jobs:

**Monitor Blockchain** (Every 30 seconds):
- URL: `https://your-project.supabase.co/functions/v1/monitor-blockchain`
- Method: POST
- Header: `Authorization: Bearer YOUR_SERVICE_ROLE_KEY`

**Settle Payments** (Every 1 minute):
- URL: `https://your-project.supabase.co/functions/v1/settle-payment`
- Method: POST
- Header: `Authorization: Bearer YOUR_SERVICE_ROLE_KEY`

**Deliver Webhooks** (Every 1 minute):
- URL: `https://your-project.supabase.co/functions/v1/deliver-webhooks`
- Method: POST
- Header: `Authorization: Bearer YOUR_SERVICE_ROLE_KEY`

### Option B: Manual Testing

Run functions manually for testing:

```bash
# Monitor blockchain
curl -X POST https://your-project.supabase.co/functions/v1/monitor-blockchain \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY"

# Settle payments
curl -X POST https://your-project.supabase.co/functions/v1/settle-payment \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY"

# Deliver webhooks
curl -X POST https://your-project.supabase.co/functions/v1/deliver-webhooks \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY"
```

## Troubleshooting

### "Failed to create payment intent"
- Check your Supabase credentials in `.env`
- Verify edge functions are deployed
- Check browser console for errors

### "Payment not detected"
- Ensure cron jobs are running
- Manually trigger `monitor-blockchain` function
- Check you sent to correct address
- Verify you're using devnet USDC

### "Database connection error"
- Verify migrations ran successfully: `supabase db status`
- Check RLS policies are enabled
- Ensure you're authenticated

### Edge function errors
```bash
# View function logs
supabase functions logs monitor-blockchain --tail

# Redeploy if needed
supabase functions deploy monitor-blockchain
```

## Next Steps

1. **Test Webhooks**: Set webhook URL in settings
2. **Add Business Info**: Complete KYB verification
3. **Verify Wallet**: Add and verify your Solana wallet
4. **Go to Production**: Switch to mainnet in settings

## Resources

- 📖 [Payment Flow Documentation](./PAYMENT_FLOW.md)
- 🚀 [Deployment Guide](./DEPLOYMENT.md)
- 🧪 [Test Script](./scripts/test-payment-flow.ts)
- ⏰ [Cron Setup](./supabase/functions/_cron/README.md)

## Support

- **Issues**: Create a GitHub issue
- **Email**: support@klyr.io
- **Docs**: See documentation files in this repo

---

**Congratulations!** 🎉 You now have a working blockchain payment gateway!

