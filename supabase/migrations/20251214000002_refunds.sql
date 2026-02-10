-- Refunds Migration
-- Adds refund functionality to the platform

-- Create refunds table
CREATE TABLE IF NOT EXISTS refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  payment_intent_id UUID NOT NULL REFERENCES payment_intents(id) ON DELETE CASCADE,
  
  -- Refund details
  amount DECIMAL(20, 6) NOT NULL,
  currency TEXT NOT NULL,
  reason TEXT,
  notes TEXT,
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending',
  
  -- Approval workflow
  requested_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  rejected_by UUID REFERENCES auth.users(id),
  rejected_at TIMESTAMPTZ,
  rejection_reason TEXT,
  
  -- Blockchain transaction
  destination_address TEXT,
  chain TEXT,
  tx_hash TEXT,
  tx_signature TEXT,
  unsigned_transaction TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT refunds_status_check CHECK (status IN ('pending', 'approved', 'rejected', 'processing', 'completed', 'failed')),
  CONSTRAINT refunds_amount_positive CHECK (amount > 0)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_refunds_merchant_id ON refunds(merchant_id);
CREATE INDEX IF NOT EXISTS idx_refunds_payment_intent_id ON refunds(payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_refunds_status ON refunds(status);
CREATE INDEX IF NOT EXISTS idx_refunds_created_at ON refunds(created_at DESC);

-- Add refund tracking to payment_intents
ALTER TABLE payment_intents
ADD COLUMN IF NOT EXISTS refunded_amount DECIMAL(20, 6) DEFAULT 0,
ADD COLUMN IF NOT EXISTS refund_status TEXT DEFAULT 'none',
ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMPTZ;

-- Add constraint for refund status
ALTER TABLE payment_intents
DROP CONSTRAINT IF EXISTS payment_intents_refund_status_check;

ALTER TABLE payment_intents
ADD CONSTRAINT payment_intents_refund_status_check 
CHECK (refund_status IN ('none', 'partial', 'full'));

-- Function to update payment intent refund status
CREATE OR REPLACE FUNCTION update_payment_refund_status()
RETURNS TRIGGER AS $$
DECLARE
  payment_amount DECIMAL;
  total_refunded DECIMAL;
BEGIN
  -- Get payment amount
  SELECT CAST(amount AS DECIMAL) INTO payment_amount
  FROM payment_intents
  WHERE id = NEW.payment_intent_id;

  -- Calculate total refunded amount
  SELECT COALESCE(SUM(amount), 0) INTO total_refunded
  FROM refunds
  WHERE payment_intent_id = NEW.payment_intent_id
    AND status = 'completed';

  -- Update payment intent
  UPDATE payment_intents
  SET 
    refunded_amount = total_refunded,
    refund_status = CASE
      WHEN total_refunded = 0 THEN 'none'
      WHEN total_refunded >= payment_amount THEN 'full'
      ELSE 'partial'
    END,
    refunded_at = CASE
      WHEN total_refunded > 0 THEN NOW()
      ELSE NULL
    END,
    updated_at = NOW()
  WHERE id = NEW.payment_intent_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update payment refund status
DROP TRIGGER IF EXISTS trigger_update_payment_refund_status ON refunds;
CREATE TRIGGER trigger_update_payment_refund_status
  AFTER INSERT OR UPDATE OF status ON refunds
  FOR EACH ROW
  WHEN (NEW.status = 'completed')
  EXECUTE FUNCTION update_payment_refund_status();

-- Function to validate refund amount
CREATE OR REPLACE FUNCTION validate_refund_amount()
RETURNS TRIGGER AS $$
DECLARE
  payment_amount DECIMAL;
  already_refunded DECIMAL;
  max_refundable DECIMAL;
BEGIN
  -- Get payment amount
  SELECT CAST(amount AS DECIMAL) INTO payment_amount
  FROM payment_intents
  WHERE id = NEW.payment_intent_id;

  -- Get already refunded amount
  SELECT COALESCE(SUM(amount), 0) INTO already_refunded
  FROM refunds
  WHERE payment_intent_id = NEW.payment_intent_id
    AND status IN ('completed', 'processing', 'approved')
    AND id != NEW.id;

  -- Calculate max refundable
  max_refundable := payment_amount - already_refunded;

  -- Validate
  IF NEW.amount > max_refundable THEN
    RAISE EXCEPTION 'Refund amount (%) exceeds maximum refundable amount (%)', NEW.amount, max_refundable;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to validate refund amount
DROP TRIGGER IF EXISTS trigger_validate_refund_amount ON refunds;
CREATE TRIGGER trigger_validate_refund_amount
  BEFORE INSERT OR UPDATE OF amount ON refunds
  FOR EACH ROW
  EXECUTE FUNCTION validate_refund_amount();

-- Enable RLS
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Merchants can view their own refunds"
  ON refunds FOR SELECT
  USING (merchant_id IN (
    SELECT id FROM merchants WHERE user_id = auth.uid()
  ));

CREATE POLICY "Merchants can create refunds"
  ON refunds FOR INSERT
  WITH CHECK (merchant_id IN (
    SELECT id FROM merchants WHERE user_id = auth.uid()
  ));

CREATE POLICY "Merchants can update their own refunds"
  ON refunds FOR UPDATE
  USING (merchant_id IN (
    SELECT id FROM merchants WHERE user_id = auth.uid()
  ));

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON refunds TO authenticated;
GRANT SELECT, INSERT, UPDATE ON refunds TO service_role;

-- Add comment
COMMENT ON TABLE refunds IS 'Refund requests and transactions';

