-- Setup Automated Jobs using Supabase pg_net extension
-- This allows calling edge functions from database triggers and scheduled jobs

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a function to call edge functions
CREATE OR REPLACE FUNCTION call_edge_function(function_name TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  service_role_key TEXT;
  project_url TEXT;
BEGIN
  -- Get service role key from vault (you'll need to set this)
  service_role_key := current_setting('app.settings.service_role_key', true);
  project_url := 'https://crkhkzcscgoeyspaczux.supabase.co';
  
  -- Make HTTP POST request to edge function
  PERFORM net.http_post(
    url := project_url || '/functions/v1/' || function_name,
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || service_role_key,
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  );
END;
$$;

-- Create a table to track job executions
CREATE TABLE IF NOT EXISTS public.job_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name TEXT NOT NULL,
  status TEXT NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  error_message TEXT
);

-- Create index
CREATE INDEX idx_job_executions_job_name ON public.job_executions(job_name);
CREATE INDEX idx_job_executions_started_at ON public.job_executions(started_at DESC);

-- Function to process pending payments (combines monitor + settle)
CREATE OR REPLACE FUNCTION process_pending_payments()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  job_id UUID;
BEGIN
  -- Log job start
  INSERT INTO public.job_executions (job_name, status)
  VALUES ('process_pending_payments', 'running')
  RETURNING id INTO job_id;

  -- Call monitor-blockchain
  PERFORM call_edge_function('monitor-blockchain');
  
  -- Wait a bit
  PERFORM pg_sleep(2);
  
  -- Call settle-payment
  PERFORM call_edge_function('settle-payment');
  
  -- Call deliver-webhooks
  PERFORM call_edge_function('deliver-webhooks');

  -- Update job status
  UPDATE public.job_executions
  SET status = 'completed', completed_at = NOW()
  WHERE id = job_id;

EXCEPTION WHEN OTHERS THEN
  -- Log error
  UPDATE public.job_executions
  SET status = 'failed', completed_at = NOW(), error_message = SQLERRM
  WHERE id = job_id;
END;
$$;

-- Function to process pending payouts
CREATE OR REPLACE FUNCTION process_pending_payouts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  job_id UUID;
BEGIN
  -- Log job start
  INSERT INTO public.job_executions (job_name, status)
  VALUES ('process_pending_payouts', 'running')
  RETURNING id INTO job_id;

  -- Call process-payout
  PERFORM call_edge_function('process-payout');

  -- Update job status
  UPDATE public.job_executions
  SET status = 'completed', completed_at = NOW()
  WHERE id = job_id;

EXCEPTION WHEN OTHERS THEN
  -- Log error
  UPDATE public.job_executions
  SET status = 'failed', completed_at = NOW(), error_message = SQLERRM
  WHERE id = job_id;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION call_edge_function TO postgres;
GRANT EXECUTE ON FUNCTION process_pending_payments TO postgres;
GRANT EXECUTE ON FUNCTION process_pending_payouts TO postgres;

-- Instructions:
-- To manually trigger jobs, run:
-- SELECT process_pending_payments();
-- SELECT process_pending_payouts();

-- To view job history:
-- SELECT * FROM job_executions ORDER BY started_at DESC LIMIT 10;

