-- Phase 3: Payout System
-- Tables for managing crypto withdrawals and optional bank payouts

-- =====================================================
-- PAYOUT DESTINATIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.payout_destinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('wallet', 'bank')),
  label TEXT NOT NULL,
  
  -- For wallet destinations
  chain TEXT, -- 'solana', 'ethereum', etc.
  address TEXT,
  
  -- For bank destinations (future)
  bank_name TEXT,
  account_holder TEXT,
  account_number_last4 TEXT,
  routing_number TEXT,
  
  is_verified BOOLEAN DEFAULT false,
  is_default BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_wallet CHECK (
    type != 'wallet' OR (chain IS NOT NULL AND address IS NOT NULL)
  ),
  CONSTRAINT valid_bank CHECK (
    type != 'bank' OR (bank_name IS NOT NULL AND account_holder IS NOT NULL)
  )
);

-- Indexes
CREATE INDEX idx_payout_destinations_merchant ON public.payout_destinations(merchant_id);
CREATE INDEX idx_payout_destinations_type ON public.payout_destinations(type);
CREATE INDEX idx_payout_destinations_default ON public.payout_destinations(merchant_id, is_default) WHERE is_default = true;

-- =====================================================
-- PAYOUTS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
  
  -- Amount details
  amount DECIMAL(20, 8) NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'USDC',
  fee_amount DECIMAL(20, 8) DEFAULT 0,
  net_amount DECIMAL(20, 8) NOT NULL,
  
  -- Destination
  destination_type TEXT NOT NULL CHECK (destination_type IN ('wallet', 'bank')),
  destination_id UUID REFERENCES public.payout_destinations(id),
  destination_address TEXT, -- Cached for reference
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'approved', 'processing', 'completed', 'failed', 'cancelled', 'rejected'
  )),
  
  -- Blockchain details (for wallet payouts)
  chain TEXT DEFAULT 'solana',
  tx_signature TEXT,
  confirmations INTEGER DEFAULT 0,
  
  -- Approval workflow
  requires_approval BOOLEAN DEFAULT false,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  
  -- Processing timestamps
  processed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  
  -- Error handling
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  
  -- Additional data
  metadata JSONB DEFAULT '{}'::jsonb,
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_payouts_merchant ON public.payouts(merchant_id);
CREATE INDEX idx_payouts_status ON public.payouts(status);
CREATE INDEX idx_payouts_created ON public.payouts(created_at DESC);
CREATE INDEX idx_payouts_pending_approval ON public.payouts(status) WHERE status = 'pending' AND requires_approval = true;
CREATE INDEX idx_payouts_tx_signature ON public.payouts(tx_signature) WHERE tx_signature IS NOT NULL;

-- =====================================================
-- PAYOUT APPROVALS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.payout_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payout_id UUID NOT NULL REFERENCES public.payouts(id) ON DELETE CASCADE,
  approver_id UUID NOT NULL REFERENCES auth.users(id),
  
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_payout_approvals_payout ON public.payout_approvals(payout_id);
CREATE INDEX idx_payout_approvals_approver ON public.payout_approvals(approver_id);
CREATE INDEX idx_payout_approvals_status ON public.payout_approvals(status);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE public.payout_destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_approvals ENABLE ROW LEVEL SECURITY;

-- Payout Destinations Policies
CREATE POLICY "Users can view their merchant's payout destinations"
  ON public.payout_destinations FOR SELECT
  USING (
    merchant_id IN (
      SELECT id FROM public.merchants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create payout destinations for their merchant"
  ON public.payout_destinations FOR INSERT
  WITH CHECK (
    merchant_id IN (
      SELECT id FROM public.merchants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their merchant's payout destinations"
  ON public.payout_destinations FOR UPDATE
  USING (
    merchant_id IN (
      SELECT id FROM public.merchants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their merchant's payout destinations"
  ON public.payout_destinations FOR DELETE
  USING (
    merchant_id IN (
      SELECT id FROM public.merchants WHERE user_id = auth.uid()
    )
  );

-- Payouts Policies
CREATE POLICY "Users can view their merchant's payouts"
  ON public.payouts FOR SELECT
  USING (
    merchant_id IN (
      SELECT id FROM public.merchants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create payouts for their merchant"
  ON public.payouts FOR INSERT
  WITH CHECK (
    merchant_id IN (
      SELECT id FROM public.merchants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their merchant's payouts"
  ON public.payouts FOR UPDATE
  USING (
    merchant_id IN (
      SELECT id FROM public.merchants WHERE user_id = auth.uid()
    )
  );

-- Payout Approvals Policies
CREATE POLICY "Users can view payout approvals for their merchant"
  ON public.payout_approvals FOR SELECT
  USING (
    payout_id IN (
      SELECT id FROM public.payouts WHERE merchant_id IN (
        SELECT id FROM public.merchants WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create payout approvals"
  ON public.payout_approvals FOR INSERT
  WITH CHECK (
    payout_id IN (
      SELECT id FROM public.payouts WHERE merchant_id IN (
        SELECT id FROM public.merchants WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update payout approvals"
  ON public.payout_approvals FOR UPDATE
  USING (
    payout_id IN (
      SELECT id FROM public.payouts WHERE merchant_id IN (
        SELECT id FROM public.merchants WHERE user_id = auth.uid()
      )
    )
  );

-- =====================================================
-- UPDATED_AT TRIGGERS
-- =====================================================

CREATE TRIGGER update_payout_destinations_updated_at
  BEFORE UPDATE ON public.payout_destinations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payouts_updated_at
  BEFORE UPDATE ON public.payouts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payout_approvals_updated_at
  BEFORE UPDATE ON public.payout_approvals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

