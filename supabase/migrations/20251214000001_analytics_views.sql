-- Analytics Views Migration
-- Creates database views for analytics dashboard

-- Daily revenue view
CREATE OR REPLACE VIEW daily_revenue AS
SELECT
  merchant_id,
  DATE(confirmed_at) as date,
  currency,
  COUNT(*) as transaction_count,
  SUM(CAST(amount AS DECIMAL)) as total_amount,
  AVG(CAST(amount AS DECIMAL)) as avg_amount,
  MIN(CAST(amount AS DECIMAL)) as min_amount,
  MAX(CAST(amount AS DECIMAL)) as max_amount
FROM payment_intents
WHERE status = 'succeeded'
  AND confirmed_at IS NOT NULL
GROUP BY merchant_id, DATE(confirmed_at), currency
ORDER BY date DESC;

-- Monthly revenue view
CREATE OR REPLACE VIEW monthly_revenue AS
SELECT
  merchant_id,
  DATE_TRUNC('month', confirmed_at) as month,
  currency,
  COUNT(*) as transaction_count,
  SUM(CAST(amount AS DECIMAL)) as total_amount,
  AVG(CAST(amount AS DECIMAL)) as avg_amount
FROM payment_intents
WHERE status = 'succeeded'
  AND confirmed_at IS NOT NULL
GROUP BY merchant_id, DATE_TRUNC('month', confirmed_at), currency
ORDER BY month DESC;

-- Payment success rate view
CREATE OR REPLACE VIEW payment_success_rate AS
SELECT
  merchant_id,
  DATE(created_at) as date,
  COUNT(*) as total_payments,
  COUNT(*) FILTER (WHERE status = 'succeeded') as successful_payments,
  COUNT(*) FILTER (WHERE status = 'failed') as failed_payments,
  COUNT(*) FILTER (WHERE status = 'expired') as expired_payments,
  ROUND(
    (COUNT(*) FILTER (WHERE status = 'succeeded')::DECIMAL / NULLIF(COUNT(*), 0)) * 100,
    2
  ) as success_rate_percent
FROM payment_intents
GROUP BY merchant_id, DATE(created_at)
ORDER BY date DESC;

-- Top customers view (by payment volume)
CREATE OR REPLACE VIEW top_customers AS
SELECT
  merchant_id,
  customer_email,
  currency,
  COUNT(*) as payment_count,
  SUM(CAST(amount AS DECIMAL)) as total_spent,
  AVG(CAST(amount AS DECIMAL)) as avg_payment,
  MAX(confirmed_at) as last_payment_at
FROM payment_intents
WHERE status = 'succeeded'
  AND customer_email IS NOT NULL
  AND confirmed_at IS NOT NULL
GROUP BY merchant_id, customer_email, currency
ORDER BY total_spent DESC;

-- Chain usage breakdown
CREATE OR REPLACE VIEW chain_usage AS
SELECT
  merchant_id,
  chain,
  COUNT(*) as payment_count,
  SUM(CAST(amount AS DECIMAL)) as total_volume,
  AVG(CAST(amount AS DECIMAL)) as avg_amount
FROM payment_intents
WHERE status = 'succeeded'
GROUP BY merchant_id, chain
ORDER BY total_volume DESC;

-- Currency breakdown
CREATE OR REPLACE VIEW currency_breakdown AS
SELECT
  merchant_id,
  currency,
  COUNT(*) as payment_count,
  SUM(CAST(amount AS DECIMAL)) as total_volume,
  AVG(CAST(amount AS DECIMAL)) as avg_amount,
  MIN(confirmed_at) as first_payment_at,
  MAX(confirmed_at) as last_payment_at
FROM payment_intents
WHERE status = 'succeeded'
  AND confirmed_at IS NOT NULL
GROUP BY merchant_id, currency
ORDER BY total_volume DESC;

-- Recent transactions view (last 100 per merchant)
CREATE OR REPLACE VIEW recent_transactions AS
SELECT
  t.*,
  ROW_NUMBER() OVER (PARTITION BY merchant_id ORDER BY created_at DESC) as row_num
FROM transactions t
WHERE status IN ('settled_onchain', 'settled_offchain', 'pending');

-- Merchant overview stats
CREATE OR REPLACE VIEW merchant_stats AS
SELECT
  m.id as merchant_id,
  m.business_name,
  -- Payment stats
  COUNT(DISTINCT pi.id) as total_payments,
  COUNT(DISTINCT pi.id) FILTER (WHERE pi.status = 'succeeded') as successful_payments,
  COUNT(DISTINCT pi.id) FILTER (WHERE pi.created_at >= NOW() - INTERVAL '30 days') as payments_last_30_days,
  -- Revenue stats
  COALESCE(SUM(CAST(pi.amount AS DECIMAL)) FILTER (WHERE pi.status = 'succeeded'), 0) as total_revenue,
  COALESCE(SUM(CAST(pi.amount AS DECIMAL)) FILTER (WHERE pi.status = 'succeeded' AND pi.confirmed_at >= NOW() - INTERVAL '30 days'), 0) as revenue_last_30_days,
  -- Customer stats
  COUNT(DISTINCT pi.customer_email) FILTER (WHERE pi.customer_email IS NOT NULL) as unique_customers,
  -- Payout stats
  COUNT(DISTINCT p.id) as total_payouts,
  COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'completed') as completed_payouts,
  COALESCE(SUM(CAST(p.amount AS DECIMAL)) FILTER (WHERE p.status = 'completed'), 0) as total_payout_amount,
  -- Dates
  MIN(pi.created_at) as first_payment_at,
  MAX(pi.confirmed_at) as last_payment_at
FROM merchants m
LEFT JOIN payment_intents pi ON pi.merchant_id = m.id
LEFT JOIN payouts p ON p.merchant_id = m.id
GROUP BY m.id, m.business_name;

-- Grant permissions to views
GRANT SELECT ON daily_revenue TO authenticated;
GRANT SELECT ON monthly_revenue TO authenticated;
GRANT SELECT ON payment_success_rate TO authenticated;
GRANT SELECT ON top_customers TO authenticated;
GRANT SELECT ON chain_usage TO authenticated;
GRANT SELECT ON currency_breakdown TO authenticated;
GRANT SELECT ON recent_transactions TO authenticated;
GRANT SELECT ON merchant_stats TO authenticated;

-- Add comments
COMMENT ON VIEW daily_revenue IS 'Daily revenue aggregated by merchant and currency';
COMMENT ON VIEW monthly_revenue IS 'Monthly revenue aggregated by merchant and currency';
COMMENT ON VIEW payment_success_rate IS 'Payment success rate by merchant and date';
COMMENT ON VIEW top_customers IS 'Top customers by payment volume';
COMMENT ON VIEW chain_usage IS 'Blockchain usage breakdown by merchant';
COMMENT ON VIEW currency_breakdown IS 'Currency usage breakdown by merchant';
COMMENT ON VIEW merchant_stats IS 'Overall merchant statistics and KPIs';

