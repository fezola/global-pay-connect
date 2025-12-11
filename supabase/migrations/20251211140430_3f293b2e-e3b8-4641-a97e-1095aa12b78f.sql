-- Create app role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'finance', 'developer', 'viewer');

-- Create business status enum
CREATE TYPE public.business_status AS ENUM ('draft', 'submitted', 'under_review', 'verified', 'rejected');

-- Create wallet type enum  
CREATE TYPE public.wallet_type AS ENUM ('hot', 'multisig', 'custodial');

-- Create document type enum
CREATE TYPE public.document_type AS ENUM ('incorporation', 'articles', 'proof_of_address', 'tax_doc', 'id_document', 'selfie');

-- Create document status enum
CREATE TYPE public.document_status AS ENUM ('uploaded', 'verified', 'rejected');

-- Create kyb status enum
CREATE TYPE public.kyb_status AS ENUM ('pending', 'queued', 'in_progress', 'verified', 'rejected');

-- Create subscription status enum
CREATE TYPE public.subscription_status AS ENUM ('active', 'cancelled', 'past_due', 'trialing');

-- Create team member status enum
CREATE TYPE public.team_member_status AS ENUM ('invited', 'active', 'disabled');

-- Create merchants table
CREATE TABLE public.merchants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'US',
  business_type TEXT,
  website TEXT,
  api_key_sandbox TEXT,
  api_key_live TEXT,
  webhook_url TEXT,
  webhook_secret TEXT,
  production_enabled BOOLEAN DEFAULT FALSE,
  kyb_status public.kyb_status DEFAULT 'pending',
  business_id UUID,
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create businesses table
CREATE TABLE public.businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID REFERENCES public.merchants(id) ON DELETE CASCADE NOT NULL,
  legal_name TEXT NOT NULL,
  trade_name TEXT,
  entity_type TEXT NOT NULL,
  registration_number TEXT,
  tax_id TEXT,
  country TEXT NOT NULL,
  address JSONB,
  status public.business_status DEFAULT 'draft',
  submitted_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,
  production_restrictions JSONB DEFAULT '{}',
  wallet_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create business_owners table (UBOs)
CREATE TABLE public.business_owners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  dob DATE,
  nationality TEXT,
  id_number TEXT,
  id_type TEXT,
  ownership_percentage DECIMAL(5,2),
  role TEXT,
  selfie_url TEXT,
  doc_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create business_wallets table
CREATE TABLE public.business_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  address TEXT NOT NULL,
  chain TEXT NOT NULL,
  type public.wallet_type NOT NULL,
  details JSONB DEFAULT '{}',
  proof_verified BOOLEAN DEFAULT FALSE,
  proof_signature TEXT,
  proof_nonce TEXT,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create business_documents table
CREATE TABLE public.business_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  doc_type public.document_type NOT NULL,
  filename TEXT NOT NULL,
  s3_key TEXT,
  mime_type TEXT,
  status public.document_status DEFAULT 'uploaded',
  uploaded_by UUID,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create kyb_jobs table
CREATE TABLE public.kyb_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  vendor TEXT,
  status public.kyb_status DEFAULT 'queued',
  vendor_payload JSONB,
  result_payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create customers table (merchant's customers)
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID REFERENCES public.merchants(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  phone TEXT,
  billing_address JSONB,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create plans table
CREATE TABLE public.plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID REFERENCES public.merchants(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(18,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  interval TEXT DEFAULT 'month',
  seat_limit INTEGER,
  features JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create subscriptions table
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID REFERENCES public.merchants(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES public.plans(id) ON DELETE SET NULL,
  status public.subscription_status DEFAULT 'active',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create team_members table
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID REFERENCES public.merchants(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role public.app_role DEFAULT 'viewer',
  status public.team_member_status DEFAULT 'invited',
  invited_by UUID,
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  joined_at TIMESTAMPTZ
);

-- Create user_roles table for RBAC
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE(user_id, role)
);

-- Create integrations table
CREATE TABLE public.integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID REFERENCES public.merchants(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  name TEXT,
  config JSONB DEFAULT '{}',
  credentials JSONB DEFAULT '{}',
  is_connected BOOLEAN DEFAULT FALSE,
  is_production BOOLEAN DEFAULT FALSE,
  last_test_at TIMESTAMPTZ,
  last_test_result TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create webhook_endpoints table
CREATE TABLE public.webhook_endpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID REFERENCES public.merchants(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  secret TEXT NOT NULL,
  events TEXT[] DEFAULT '{}',
  is_enabled BOOLEAN DEFAULT TRUE,
  last_triggered_at TIMESTAMPTZ,
  last_status_code INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create audit_logs table
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID REFERENCES public.merchants(id) ON DELETE CASCADE,
  user_id UUID,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create api_keys table
CREATE TABLE public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID REFERENCES public.merchants(id) ON DELETE CASCADE NOT NULL,
  name TEXT,
  key_hash TEXT NOT NULL,
  key_last4 TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('sandbox', 'live')),
  permissions TEXT[] DEFAULT '{}',
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyb_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to check merchant access
CREATE OR REPLACE FUNCTION public.has_merchant_access(_user_id UUID, _merchant_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.merchants WHERE id = _merchant_id AND user_id = _user_id
  ) OR EXISTS (
    SELECT 1 FROM public.team_members 
    WHERE merchant_id = _merchant_id 
      AND user_id = _user_id 
      AND status = 'active'
  )
$$;

-- RLS Policies for merchants
CREATE POLICY "Users can view their own merchants"
  ON public.merchants FOR SELECT
  USING (auth.uid() = user_id OR public.has_merchant_access(auth.uid(), id));

CREATE POLICY "Users can create merchants"
  ON public.merchants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own merchants"
  ON public.merchants FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for businesses
CREATE POLICY "Users can view businesses they have access to"
  ON public.businesses FOR SELECT
  USING (public.has_merchant_access(auth.uid(), merchant_id));

CREATE POLICY "Users can create businesses for their merchants"
  ON public.businesses FOR INSERT
  WITH CHECK (public.has_merchant_access(auth.uid(), merchant_id));

CREATE POLICY "Users can update businesses they have access to"
  ON public.businesses FOR UPDATE
  USING (public.has_merchant_access(auth.uid(), merchant_id));

-- RLS Policies for business_owners
CREATE POLICY "Users can manage business owners"
  ON public.business_owners FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.businesses b
    WHERE b.id = business_id AND public.has_merchant_access(auth.uid(), b.merchant_id)
  ));

-- RLS Policies for business_wallets
CREATE POLICY "Users can manage business wallets"
  ON public.business_wallets FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.businesses b
    WHERE b.id = business_id AND public.has_merchant_access(auth.uid(), b.merchant_id)
  ));

-- RLS Policies for business_documents
CREATE POLICY "Users can manage business documents"
  ON public.business_documents FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.businesses b
    WHERE b.id = business_id AND public.has_merchant_access(auth.uid(), b.merchant_id)
  ));

-- RLS Policies for kyb_jobs
CREATE POLICY "Users can view KYB jobs"
  ON public.kyb_jobs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.businesses b
    WHERE b.id = business_id AND public.has_merchant_access(auth.uid(), b.merchant_id)
  ));

-- RLS Policies for customers
CREATE POLICY "Users can manage customers"
  ON public.customers FOR ALL
  USING (public.has_merchant_access(auth.uid(), merchant_id));

-- RLS Policies for plans
CREATE POLICY "Users can manage plans"
  ON public.plans FOR ALL
  USING (public.has_merchant_access(auth.uid(), merchant_id));

-- RLS Policies for subscriptions
CREATE POLICY "Users can manage subscriptions"
  ON public.subscriptions FOR ALL
  USING (public.has_merchant_access(auth.uid(), merchant_id));

-- RLS Policies for team_members
CREATE POLICY "Users can view team members"
  ON public.team_members FOR SELECT
  USING (public.has_merchant_access(auth.uid(), merchant_id));

CREATE POLICY "Admins can manage team members"
  ON public.team_members FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.merchants m
    WHERE m.id = merchant_id AND m.user_id = auth.uid()
  ));

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policies for integrations
CREATE POLICY "Users can manage integrations"
  ON public.integrations FOR ALL
  USING (public.has_merchant_access(auth.uid(), merchant_id));

-- RLS Policies for webhook_endpoints
CREATE POLICY "Users can manage webhooks"
  ON public.webhook_endpoints FOR ALL
  USING (public.has_merchant_access(auth.uid(), merchant_id));

-- RLS Policies for audit_logs
CREATE POLICY "Users can view audit logs"
  ON public.audit_logs FOR SELECT
  USING (public.has_merchant_access(auth.uid(), merchant_id));

CREATE POLICY "System can insert audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (true);

-- RLS Policies for api_keys
CREATE POLICY "Users can manage API keys"
  ON public.api_keys FOR ALL
  USING (public.has_merchant_access(auth.uid(), merchant_id));

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply updated_at triggers
CREATE TRIGGER update_merchants_updated_at
  BEFORE UPDATE ON public.merchants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_businesses_updated_at
  BEFORE UPDATE ON public.businesses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_kyb_jobs_updated_at
  BEFORE UPDATE ON public.kyb_jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();