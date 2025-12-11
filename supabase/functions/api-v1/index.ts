import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

// Rate limiting store (in-memory, use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

/**
 * Authenticate API request using API key or user token
 */
async function authenticateApiKey(apiKey: string, supabase: any) {
  if (!apiKey) {
    return { error: 'Missing API key', status: 401 };
  }

  // Check if it's a sandbox or production key
  const isSandbox = apiKey.startsWith('sk_test_');
  const isProduction = apiKey.startsWith('sk_live_');

  // If it's a proper API key format
  if (isSandbox || isProduction) {
    // Find merchant by API key
    const { data: merchant, error } = await supabase
      .from('merchants')
      .select('id, production_enabled, api_key_sandbox, api_key_production')
      .or(`api_key_sandbox.eq.${apiKey},api_key_production.eq.${apiKey}`)
      .single();

    if (error || !merchant) {
      return { error: 'Invalid API key', status: 401 };
    }

    // Verify key type matches merchant mode
    if (isProduction && !merchant.production_enabled) {
      return { error: 'Production mode not enabled', status: 403 };
    }

    return { merchant, error: null };
  }

  // Otherwise, treat it as a user JWT token
  const { data: { user }, error: authError } = await supabase.auth.getUser(apiKey);

  if (authError || !user) {
    return { error: 'Invalid authentication token', status: 401 };
  }

  // Get merchant for this user
  const { data: merchant, error: merchantError } = await supabase
    .from('merchants')
    .select('id, production_enabled')
    .eq('user_id', user.id)
    .single();

  if (merchantError || !merchant) {
    return { error: 'Merchant not found for user', status: 404 };
  }

  return { merchant, error: null };
}

/**
 * Rate limiting middleware
 */
function checkRateLimit(apiKey: string, limit = 100, windowMs = 60000): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(apiKey);

  if (!record || now > record.resetAt) {
    rateLimitStore.set(apiKey, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count++;
  return true;
}

/**
 * Route handler
 */
async function handleRequest(req: Request, supabase: any) {
  const url = new URL(req.url);
  const path = url.pathname.replace('/api-v1', '');
  const method = req.method;

  // Extract API key
  const apiKey = req.headers.get('x-api-key') || req.headers.get('authorization')?.replace('Bearer ', '');

  // Authenticate
  const { merchant, error: authError } = await authenticateApiKey(apiKey || '', supabase);
  if (authError) {
    return new Response(JSON.stringify({ error: authError }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Rate limiting
  if (!checkRateLimit(apiKey || '')) {
    return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
      status: 429,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Route to appropriate handler
  if (path.startsWith('/payments') && method === 'POST') {
    return await createPayment(req, merchant, supabase);
  } else if (path.startsWith('/payments/') && method === 'GET') {
    return await getPayment(path, merchant, supabase);
  } else if (path.startsWith('/payments') && method === 'GET') {
    return await listPayments(url, merchant, supabase);
  } else if (path.startsWith('/balances') && method === 'GET') {
    return await getBalances(merchant, supabase);
  } else if (path.startsWith('/customers') && method === 'POST') {
    return await createCustomer(req, merchant, supabase);
  } else if (path.startsWith('/customers') && method === 'GET') {
    return await listCustomers(url, merchant, supabase);
  } else if (path.startsWith('/webhooks') && method === 'GET') {
    return await listWebhookEvents(url, merchant, supabase);
  } else {
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

/**
 * Create payment
 */
async function createPayment(req: Request, merchant: any, supabase: any) {
  const body = await req.json();
  const { amount, currency = 'USDC', customer_id, customer_email, description, metadata } = body;

  if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
    return new Response(JSON.stringify({ error: 'Invalid amount' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Get merchant's wallet
  const { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('merchant_id', merchant.id)
    .single();

  let paymentAddress = 'DEMO_WALLET';
  if (business) {
    const { data: wallet } = await supabase
      .from('business_wallets')
      .select('address')
      .eq('business_id', business.id)
      .eq('chain', 'solana')
      .eq('proof_verified', true)
      .limit(1)
      .single();
    
    if (wallet) paymentAddress = wallet.address;
  }

  const tokenMint = merchant.production_enabled 
    ? 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' // USDC mainnet
    : '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU'; // USDC devnet

  const { data: payment, error } = await supabase
    .from('payment_intents')
    .insert({
      merchant_id: merchant.id,
      customer_id,
      amount: parseFloat(amount),
      currency,
      payment_address: paymentAddress,
      expected_token_mint: tokenMint,
      chain: 'solana',
      customer_email,
      description,
      metadata: metadata || {},
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    })
    .select()
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: 'Failed to create payment' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify(payment), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

/**
 * Get payment by ID
 */
async function getPayment(path: string, merchant: any, supabase: any) {
  const paymentId = path.split('/').pop();

  const { data: payment, error } = await supabase
    .from('payment_intents')
    .select('*')
    .eq('id', paymentId)
    .eq('merchant_id', merchant.id)
    .single();

  if (error || !payment) {
    return new Response(JSON.stringify({ error: 'Payment not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify(payment), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

/**
 * List payments
 */
async function listPayments(url: URL, merchant: any, supabase: any) {
  const limit = parseInt(url.searchParams.get('limit') || '10');
  const offset = parseInt(url.searchParams.get('offset') || '0');
  const status = url.searchParams.get('status');

  let query = supabase
    .from('payment_intents')
    .select('*', { count: 'exact' })
    .eq('merchant_id', merchant.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) {
    query = query.eq('status', status);
  }

  const { data: payments, error, count } = await query;

  if (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch payments' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({
    data: payments,
    total: count,
    limit,
    offset,
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

/**
 * Get balances
 */
async function getBalances(merchant: any, supabase: any) {
  const { data: balances, error } = await supabase
    .from('balances')
    .select('*')
    .eq('merchant_id', merchant.id);

  if (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch balances' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ data: balances || [] }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

/**
 * Create customer
 */
async function createCustomer(req: Request, merchant: any, supabase: any) {
  const body = await req.json();
  const { email, name, metadata } = body;

  if (!email) {
    return new Response(JSON.stringify({ error: 'Email is required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const { data: customer, error } = await supabase
    .from('customers')
    .insert({
      merchant_id: merchant.id,
      email,
      name,
      metadata: metadata || {},
    })
    .select()
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: 'Failed to create customer' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify(customer), {
    status: 201,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

/**
 * List customers
 */
async function listCustomers(url: URL, merchant: any, supabase: any) {
  const limit = parseInt(url.searchParams.get('limit') || '10');
  const offset = parseInt(url.searchParams.get('offset') || '0');

  const { data: customers, error, count } = await supabase
    .from('customers')
    .select('*', { count: 'exact' })
    .eq('merchant_id', merchant.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch customers' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({
    data: customers,
    total: count,
    limit,
    offset,
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

/**
 * List webhook events
 */
async function listWebhookEvents(url: URL, merchant: any, supabase: any) {
  const limit = parseInt(url.searchParams.get('limit') || '10');
  const offset = parseInt(url.searchParams.get('offset') || '0');

  const { data: events, error, count } = await supabase
    .from('webhook_events')
    .select('*', { count: 'exact' })
    .eq('merchant_id', merchant.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch webhook events' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({
    data: events,
    total: count,
    limit,
    offset,
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    return await handleRequest(req, supabase);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('API error:', error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

