-- Scheduled/Recurring Payouts Feature
-- Allows merchants to set up automatic withdrawals

-- =====================================================
-- PAYOUT SCHEDULES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.payout_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
  
  -- Schedule configuration
  label TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  
  -- Destination
  destination_id UUID NOT NULL REFERENCES public.payout_destinations(id) ON DELETE CASCADE,
  
  -- Amount settings
  currency TEXT NOT NULL DEFAULT 'USDC',
  minimum_balance DECIMAL(20, 8) NOT NULL CHECK (minimum_balance > 0),
  payout_amount_type TEXT NOT NULL CHECK (payout_amount_type IN ('all', 'fixed', 'percentage')),
  payout_amount DECIMAL(20, 8), -- For 'fixed' or 'percentage' types
  
  -- Frequency settings
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6), -- 0 = Sunday, for weekly
  day_of_month INTEGER CHECK (day_of_month BETWEEN 1 AND 31), -- For monthly
  time_of_day TIME DEFAULT '00:00:00', -- UTC time
  
  -- Tracking
  last_executed_at TIMESTAMPTZ,
  next_execution_at TIMESTAMPTZ,
  total_payouts_created INTEGER DEFAULT 0,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_weekly_schedule CHECK (
    frequency != 'weekly' OR day_of_week IS NOT NULL
  ),
  CONSTRAINT valid_monthly_schedule CHECK (
    frequency != 'monthly' OR day_of_month IS NOT NULL
  ),
  CONSTRAINT valid_fixed_amount CHECK (
    payout_amount_type != 'fixed' OR (payout_amount IS NOT NULL AND payout_amount > 0)
  ),
  CONSTRAINT valid_percentage CHECK (
    payout_amount_type != 'percentage' OR (payout_amount IS NOT NULL AND payout_amount > 0 AND payout_amount <= 100)
  )
);

-- Indexes
CREATE INDEX idx_payout_schedules_merchant ON public.payout_schedules(merchant_id);
CREATE INDEX idx_payout_schedules_active ON public.payout_schedules(is_active) WHERE is_active = true;
CREATE INDEX idx_payout_schedules_next_execution ON public.payout_schedules(next_execution_at) WHERE is_active = true;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE public.payout_schedules ENABLE ROW LEVEL SECURITY;

-- Users can view their merchant's schedules
CREATE POLICY "Users can view their merchant's payout schedules"
  ON public.payout_schedules FOR SELECT
  USING (
    merchant_id IN (
      SELECT id FROM public.merchants WHERE user_id = auth.uid()
    )
  );

-- Users can create schedules for their merchant
CREATE POLICY "Users can create payout schedules for their merchant"
  ON public.payout_schedules FOR INSERT
  WITH CHECK (
    merchant_id IN (
      SELECT id FROM public.merchants WHERE user_id = auth.uid()
    )
  );

-- Users can update their merchant's schedules
CREATE POLICY "Users can update their merchant's payout schedules"
  ON public.payout_schedules FOR UPDATE
  USING (
    merchant_id IN (
      SELECT id FROM public.merchants WHERE user_id = auth.uid()
    )
  );

-- Users can delete their merchant's schedules
CREATE POLICY "Users can delete their merchant's payout schedules"
  ON public.payout_schedules FOR DELETE
  USING (
    merchant_id IN (
      SELECT id FROM public.merchants WHERE user_id = auth.uid()
    )
  );

-- =====================================================
-- UPDATED_AT TRIGGER
-- =====================================================

CREATE TRIGGER update_payout_schedules_updated_at
  BEFORE UPDATE ON public.payout_schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- HELPER FUNCTION: Calculate Next Execution Time
-- =====================================================

CREATE OR REPLACE FUNCTION calculate_next_execution(
  p_frequency TEXT,
  p_day_of_week INTEGER,
  p_day_of_month INTEGER,
  p_time_of_day TIME,
  p_from_time TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TIMESTAMPTZ
LANGUAGE plpgsql
AS $$
DECLARE
  v_next_execution TIMESTAMPTZ;
  v_base_date DATE;
  v_base_time TIMESTAMPTZ;
BEGIN
  v_base_date := p_from_time::DATE;
  v_base_time := (v_base_date || ' ' || p_time_of_day)::TIMESTAMPTZ;
  
  -- If the time today has passed, start from tomorrow
  IF v_base_time <= p_from_time THEN
    v_base_date := v_base_date + INTERVAL '1 day';
  END IF;
  
  CASE p_frequency
    WHEN 'daily' THEN
      v_next_execution := (v_base_date || ' ' || p_time_of_day)::TIMESTAMPTZ;
      
    WHEN 'weekly' THEN
      -- Find next occurrence of the specified day of week
      v_next_execution := (v_base_date || ' ' || p_time_of_day)::TIMESTAMPTZ;
      WHILE EXTRACT(DOW FROM v_next_execution) != p_day_of_week LOOP
        v_next_execution := v_next_execution + INTERVAL '1 day';
      END LOOP;
      
    WHEN 'monthly' THEN
      -- Find next occurrence of the specified day of month
      v_next_execution := (v_base_date || ' ' || p_time_of_day)::TIMESTAMPTZ;
      WHILE EXTRACT(DAY FROM v_next_execution) != p_day_of_month LOOP
        v_next_execution := v_next_execution + INTERVAL '1 day';
        -- Handle months with fewer days
        IF EXTRACT(DAY FROM v_next_execution) < p_day_of_month 
           AND EXTRACT(DAY FROM v_next_execution + INTERVAL '1 day') = 1 THEN
          EXIT; -- Use last day of month
        END IF;
      END LOOP;
  END CASE;
  
  RETURN v_next_execution;
END;
$$;

