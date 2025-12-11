# Klyr Deployment Guide

## Prerequisites

- Node.js 18+ installed
- Supabase account
- Supabase CLI installed: `npm install -g supabase`
- Git installed

## Step 1: Database Setup

### 1.1 Run Migrations

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref crkhkzcscgoeyspaczux

# Run migrations
supabase db push
```

### 1.2 Verify Tables

Check that these tables exist:
- `merchants`
- `businesses`
- `payment_intents`
- `transactions`
- `balances`
- `webhook_events`
- `webhook_endpoints`

## Step 2: Deploy Edge Functions

### 2.1 Deploy All Functions

```bash
# Deploy create-payment-intent
supabase functions deploy create-payment-intent

# Deploy monitor-blockchain
supabase functions deploy monitor-blockchain

# Deploy settle-payment
supabase functions deploy settle-payment

# Deploy deliver-webhooks
supabase functions deploy deliver-webhooks

# Deploy existing KYB functions
supabase functions deploy wallet-nonce
supabase functions deploy prove-control
supabase functions deploy submit-kyb
```

### 2.2 Set Environment Variables

```bash
# Set Supabase URL and keys (already set by default)
# These are automatically available in edge functions
```

### 2.3 Verify Deployment

```bash
# List deployed functions
supabase functions list

# Test a function
curl -X POST https://crkhkzcscgoeyspaczux.supabase.co/functions/v1/monitor-blockchain \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY"
```

## Step 3: Setup Cron Jobs

### Option A: Using External Cron Service (Recommended)

Use **cron-job.org** or **EasyCron**:

1. **Monitor Blockchain** (Every 30 seconds)
   - URL: `https://crkhkzcscgoeyspaczux.supabase.co/functions/v1/monitor-blockchain`
   - Method: POST
   - Headers: `Authorization: Bearer YOUR_SERVICE_ROLE_KEY`

2. **Settle Payments** (Every 1 minute)
   - URL: `https://crkhkzcscgoeyspaczux.supabase.co/functions/v1/settle-payment`
   - Method: POST
   - Headers: `Authorization: Bearer YOUR_SERVICE_ROLE_KEY`

3. **Deliver Webhooks** (Every 1 minute)
   - URL: `https://crkhkzcscgoeyspaczux.supabase.co/functions/v1/deliver-webhooks`
   - Method: POST
   - Headers: `Authorization: Bearer YOUR_SERVICE_ROLE_KEY`

### Option B: Using GitHub Actions

Create `.github/workflows/payment-cron.yml` (see `supabase/functions/_cron/README.md`)

### Option C: Using Supabase pg_cron

```sql
-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule jobs (requires Supabase Pro plan)
SELECT cron.schedule(
  'monitor-blockchain',
  '*/1 * * * *',  -- Every minute (GitHub Actions limitation)
  $$SELECT net.http_post(
    url := 'https://crkhkzcscgoeyspaczux.supabase.co/functions/v1/monitor-blockchain',
    headers := '{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
  )$$
);
```

## Step 4: Frontend Deployment

### 4.1 Build Frontend

```bash
# Install dependencies
npm install

# Build for production
npm run build
```

### 4.2 Deploy to Vercel/Netlify

**Vercel**:
```bash
npm install -g vercel
vercel --prod
```

**Netlify**:
```bash
npm install -g netlify-cli
netlify deploy --prod
```

### 4.3 Set Environment Variables

Add these to your hosting platform:
```
VITE_SUPABASE_URL=https://crkhkzcscgoeyspaczux.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
```

## Step 5: Testing

### 5.1 Create Test Merchant

1. Sign up at your deployed URL
2. Complete onboarding
3. Add a Solana wallet address
4. Verify wallet ownership

### 5.2 Test Payment Flow

```bash
# Run test script
npm install -g tsx
tsx scripts/test-payment-flow.ts
```

Or manually:
1. Create payment intent via dashboard
2. Get devnet USDC from https://spl-token-faucet.com/
3. Send USDC to payment address
4. Wait for confirmation
5. Verify balance update

### 5.3 Test Webhook Delivery

1. Set webhook URL in settings
2. Use webhook.site for testing
3. Create a payment
4. Verify webhook received

## Step 6: Production Checklist

### Security
- [ ] Enable RLS on all tables
- [ ] Rotate API keys
- [ ] Set up 2FA for admin accounts
- [ ] Configure CORS properly
- [ ] Use HTTPS for all endpoints

### Monitoring
- [ ] Set up error tracking (Sentry)
- [ ] Configure uptime monitoring
- [ ] Set up alerts for failed payments
- [ ] Monitor cron job execution
- [ ] Track webhook delivery rates

### Performance
- [ ] Enable database indexes
- [ ] Configure connection pooling
- [ ] Set up CDN for static assets
- [ ] Optimize edge function cold starts

### Compliance
- [ ] Implement KYB verification
- [ ] Set up AML screening
- [ ] Configure transaction limits
- [ ] Enable audit logging
- [ ] Set up data retention policies

## Troubleshooting

### Edge Functions Not Working
```bash
# Check function logs
supabase functions logs monitor-blockchain --tail

# Redeploy function
supabase functions deploy monitor-blockchain --no-verify-jwt
```

### Database Connection Issues
```bash
# Check database status
supabase db status

# Reset database (CAUTION: deletes all data)
supabase db reset
```

### Cron Jobs Not Running
- Verify cron service is active
- Check service role key is correct
- Verify function URLs are accessible
- Check function logs for errors

## Support

- Documentation: See `PAYMENT_FLOW.md`
- Issues: Create GitHub issue
- Email: support@klyr.io

