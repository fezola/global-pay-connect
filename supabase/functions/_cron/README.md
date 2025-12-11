# Cron Jobs for Payment Processing

This directory contains documentation for setting up cron jobs to run the payment processing edge functions.

## Required Cron Jobs

### 1. Monitor Blockchain (Every 30 seconds)
Monitors pending payment intents for incoming transactions.

```bash
# Using Supabase CLI
supabase functions schedule monitor-blockchain --cron "*/30 * * * * *"
```

Or use an external cron service like:
- **Cron-job.org**: https://cron-job.org
- **EasyCron**: https://www.easycron.com
- **GitHub Actions**: See `.github/workflows/cron-monitor.yml`

**Endpoint**: `https://crkhkzcscgoeyspaczux.supabase.co/functions/v1/monitor-blockchain`
**Method**: POST
**Schedule**: Every 30 seconds

### 2. Settle Payments (Every 1 minute)
Verifies transaction confirmations and settles payments.

```bash
supabase functions schedule settle-payment --cron "* * * * *"
```

**Endpoint**: `https://crkhkzcscgoeyspaczux.supabase.co/functions/v1/settle-payment`
**Method**: POST
**Schedule**: Every 1 minute

### 3. Deliver Webhooks (Every 1 minute)
Delivers pending webhook events to merchant endpoints.

```bash
supabase functions schedule deliver-webhooks --cron "* * * * *"
```

**Endpoint**: `https://crkhkzcscgoeyspaczux.supabase.co/functions/v1/deliver-webhooks`
**Method**: POST
**Schedule**: Every 1 minute

### 4. Expire Payment Intents (Every 5 minutes)
Marks expired payment intents as expired.

```sql
-- Run this SQL function via cron
SELECT expire_payment_intents();
```

**Schedule**: Every 5 minutes

## Setup with GitHub Actions

Create `.github/workflows/payment-cron.yml`:

```yaml
name: Payment Processing Cron

on:
  schedule:
    # Monitor blockchain every 30 seconds (GitHub Actions minimum is 5 minutes, use external service)
    - cron: '*/5 * * * *'  # Every 5 minutes
  workflow_dispatch:

jobs:
  process-payments:
    runs-on: ubuntu-latest
    steps:
      - name: Monitor Blockchain
        run: |
          curl -X POST https://crkhkzcscgoeyspaczux.supabase.co/functions/v1/monitor-blockchain \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}"
      
      - name: Settle Payments
        run: |
          curl -X POST https://crkhkzcscgoeyspaczux.supabase.co/functions/v1/settle-payment \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}"
      
      - name: Deliver Webhooks
        run: |
          curl -X POST https://crkhkzcscgoeyspaczux.supabase.co/functions/v1/deliver-webhooks \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}"
```

## Alternative: Use Supabase pg_cron

For database-level cron jobs:

```sql
-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule expire payment intents
SELECT cron.schedule(
  'expire-payment-intents',
  '*/5 * * * *',  -- Every 5 minutes
  $$SELECT expire_payment_intents()$$
);

-- Schedule webhook delivery via HTTP
SELECT cron.schedule(
  'deliver-webhooks',
  '* * * * *',  -- Every minute
  $$SELECT net.http_post(
    url := 'https://crkhkzcscgoeyspaczux.supabase.co/functions/v1/deliver-webhooks',
    headers := '{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
  )$$
);
```

## Monitoring

Check cron job execution:

```sql
-- View cron job history
SELECT * FROM cron.job_run_details 
ORDER BY start_time DESC 
LIMIT 10;

-- View active jobs
SELECT * FROM cron.job;
```

## Production Recommendations

1. **Use a dedicated cron service** for sub-minute intervals
2. **Monitor job execution** with logging and alerts
3. **Set up dead letter queues** for failed webhook deliveries
4. **Implement circuit breakers** for external API calls
5. **Add retry logic** with exponential backoff

