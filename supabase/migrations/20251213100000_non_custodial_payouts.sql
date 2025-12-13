-- Migration: Non-Custodial Payout System
-- Add fields to support merchant-signed transactions

-- Add new columns to payouts table
ALTER TABLE public.payouts
  ADD COLUMN IF NOT EXISTS unsigned_transaction TEXT, -- Serialized transaction for merchant to sign
  ADD COLUMN IF NOT EXISTS source_wallet_address TEXT, -- Merchant's payment wallet (where funds come from)
  ADD COLUMN IF NOT EXISTS signing_required BOOLEAN DEFAULT true, -- Whether merchant needs to sign
  ADD COLUMN IF NOT EXISTS signed_at TIMESTAMPTZ, -- When merchant signed the transaction
  ADD COLUMN IF NOT EXISTS transaction_expires_at TIMESTAMPTZ; -- When unsigned transaction expires

-- Add new status for awaiting signature
ALTER TABLE public.payouts
  DROP CONSTRAINT IF EXISTS payouts_status_check;

ALTER TABLE public.payouts
  ADD CONSTRAINT payouts_status_check CHECK (status IN (
    'pending', 
    'approved', 
    'awaiting_signature', -- New: waiting for merchant to sign
    'processing', 
    'completed', 
    'failed', 
    'cancelled', 
    'rejected',
    'expired' -- New: unsigned transaction expired
  ));

-- Create index for payouts awaiting signature
CREATE INDEX IF NOT EXISTS idx_payouts_awaiting_signature 
  ON public.payouts(merchant_id, status) 
  WHERE status = 'awaiting_signature';

-- Create index for source wallet
CREATE INDEX IF NOT EXISTS idx_payouts_source_wallet 
  ON public.payouts(source_wallet_address) 
  WHERE source_wallet_address IS NOT NULL;

-- Add comment
COMMENT ON COLUMN public.payouts.unsigned_transaction IS 'Base64 encoded unsigned transaction for merchant to sign with their wallet';
COMMENT ON COLUMN public.payouts.source_wallet_address IS 'Merchant payment wallet address where funds are held (business_wallets.address)';
COMMENT ON COLUMN public.payouts.signing_required IS 'Whether this payout requires merchant signature (non-custodial model)';

