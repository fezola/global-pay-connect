-- Setup Cron Jobs for Automated Processing
-- Uses pg_cron extension to call edge functions automatically

-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Grant permissions
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;

-- Job 1: Monitor Blockchain (every 30 seconds)
-- Checks Solana blockchain for incoming payments
SELECT cron.schedule(
  'monitor-blockchain',
  '30 seconds',
  $$
  SELECT net.http_post(
    url := 'https://crkhkzcscgoeyspaczux.supabase.co/functions/v1/monitor-blockchain',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true),
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  );
  $$
);

-- Job 2: Settle Payments (every 1 minute)
-- Settles confirmed payments and updates balances
SELECT cron.schedule(
  'settle-payments',
  '1 minute',
  $$
  SELECT net.http_post(
    url := 'https://crkhkzcscgoeyspaczux.supabase.co/functions/v1/settle-payment',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true),
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  );
  $$
);

-- Job 3: Deliver Webhooks (every 1 minute)
-- Sends pending webhook events to merchants
SELECT cron.schedule(
  'deliver-webhooks',
  '1 minute',
  $$
  SELECT net.http_post(
    url := 'https://crkhkzcscgoeyspaczux.supabase.co/functions/v1/deliver-webhooks',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true),
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  );
  $$
);

-- Job 4: Process Payouts (every 5 minutes)
-- Processes approved payout requests
SELECT cron.schedule(
  'process-payouts',
  '5 minutes',
  $$
  SELECT net.http_post(
    url := 'https://crkhkzcscgoeyspaczux.supabase.co/functions/v1/process-payout',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true),
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  );
  $$
);

-- View all cron jobs
-- SELECT * FROM cron.job;

-- To unschedule a job (if needed):
-- SELECT cron.unschedule('job-name');

