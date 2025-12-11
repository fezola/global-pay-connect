-- Create payment_intents table for tracking payment requests
CREATE TABLE public.payment_intents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  
  -- Payment details
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USDC',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'succeeded', 'failed', 'cancelled', 'expired')),
  
  -- Blockchain details
  payment_address TEXT NOT NULL, -- Merchant's wallet address to receive payment
  expected_token_mint TEXT NOT NULL, -- SPL token mint address (USDC/USDT)
  chain TEXT NOT NULL DEFAULT 'solana',
  
  -- Transaction tracking
  tx_signature TEXT, -- Solana transaction signature
  tx_hash TEXT, -- Alternative for other chains
  confirmations INTEGER DEFAULT 0,
  
  -- Customer info
  customer_email TEXT,
  customer_metadata JSONB DEFAULT '{}',
  
  -- Payment metadata
  description TEXT,
  metadata JSONB DEFAULT '{}',
  
  -- Expiration
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 minutes'),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  
  -- Indexes
  CONSTRAINT valid_amount CHECK (amount > 0)
);

-- Create index for faster lookups
CREATE INDEX idx_payment_intents_merchant ON public.payment_intents(merchant_id);
CREATE INDEX idx_payment_intents_status ON public.payment_intents(status);
CREATE INDEX idx_payment_intents_tx_signature ON public.payment_intents(tx_signature) WHERE tx_signature IS NOT NULL;
CREATE INDEX idx_payment_intents_expires_at ON public.payment_intents(expires_at) WHERE status = 'pending';

-- Enable RLS
ALTER TABLE public.payment_intents ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their payment intents"
  ON public.payment_intents FOR SELECT
  USING (has_merchant_access(auth.uid(), merchant_id));

CREATE POLICY "Users can create payment intents"
  ON public.payment_intents FOR INSERT
  WITH CHECK (has_merchant_access(auth.uid(), merchant_id));

CREATE POLICY "Users can update their payment intents"
  ON public.payment_intents FOR UPDATE
  USING (has_merchant_access(auth.uid(), merchant_id));

-- Create webhook_events table for tracking webhook deliveries
CREATE TABLE public.webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
  endpoint_id UUID REFERENCES public.webhook_endpoints(id) ON DELETE SET NULL,
  
  -- Event details
  event_type TEXT NOT NULL, -- e.g., 'payment.succeeded', 'payment.failed'
  resource_type TEXT NOT NULL, -- e.g., 'payment_intent', 'payout'
  resource_id UUID NOT NULL,
  
  -- Payload
  payload JSONB NOT NULL,
  
  -- Delivery tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'delivered', 'failed', 'retrying')),
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 5,
  next_retry_at TIMESTAMPTZ,
  last_attempt_at TIMESTAMPTZ,
  
  -- Response tracking
  response_status_code INTEGER,
  response_body TEXT,
  error_message TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  delivered_at TIMESTAMPTZ
);

-- Create indexes
CREATE INDEX idx_webhook_events_merchant ON public.webhook_events(merchant_id);
CREATE INDEX idx_webhook_events_status ON public.webhook_events(status);
CREATE INDEX idx_webhook_events_next_retry ON public.webhook_events(next_retry_at) WHERE status = 'retrying';
CREATE INDEX idx_webhook_events_resource ON public.webhook_events(resource_type, resource_id);

-- Enable RLS
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their webhook events"
  ON public.webhook_events FOR SELECT
  USING (has_merchant_access(auth.uid(), merchant_id));

-- Add triggers
CREATE TRIGGER update_payment_intents_updated_at
  BEFORE UPDATE ON public.payment_intents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER TABLE public.payment_intents REPLICA IDENTITY FULL;
ALTER TABLE public.webhook_events REPLICA IDENTITY FULL;

-- Function to expire old payment intents
CREATE OR REPLACE FUNCTION expire_payment_intents()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.payment_intents
  SET status = 'expired', updated_at = NOW()
  WHERE status = 'pending' 
    AND expires_at < NOW();
END;
$$;

-- Add USDC/USDT token mint addresses as constants (Solana mainnet)
COMMENT ON TABLE public.payment_intents IS 'USDC Mint: EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v, USDT Mint: Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB';

