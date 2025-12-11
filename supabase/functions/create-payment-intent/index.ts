import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Solana token mint addresses
const TOKEN_MINTS = {
  'USDC': 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // Mainnet
  'USDT': 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', // Mainnet
  'USDC_DEVNET': '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU', // Devnet
};

interface CreatePaymentIntentRequest {
  amount: string | number;
  currency?: string;
  customer_email?: string;
  customer_id?: string;
  description?: string;
  metadata?: Record<string, any>;
  expires_in_minutes?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get merchant
    const { data: merchant, error: merchantError } = await supabase
      .from('merchants')
      .select('id, api_key_sandbox, production_enabled')
      .eq('user_id', user.id)
      .single();

    if (merchantError || !merchant) {
      return new Response(JSON.stringify({ error: 'Merchant not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse request body
    const body: CreatePaymentIntentRequest = await req.json();
    const { 
      amount, 
      currency = 'USDC', 
      customer_email,
      customer_id,
      description,
      metadata = {},
      expires_in_minutes = 30
    } = body;

    // Validate amount
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount) || numAmount <= 0) {
      return new Response(JSON.stringify({ error: 'Invalid amount' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate currency
    if (!['USDC', 'USDT'].includes(currency)) {
      return new Response(JSON.stringify({ error: 'Unsupported currency. Use USDC or USDT' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get merchant's settlement wallet
    const { data: business } = await supabase
      .from('businesses')
      .select('id')
      .eq('merchant_id', merchant.id)
      .single();

    let paymentAddress = null;
    if (business) {
      const { data: wallet } = await supabase
        .from('business_wallets')
        .select('address, chain')
        .eq('business_id', business.id)
        .eq('chain', 'solana')
        .eq('proof_verified', true)
        .limit(1)
        .single();
      
      if (wallet) {
        paymentAddress = wallet.address;
      }
    }

    // If no verified wallet, use a placeholder (in production, this should fail)
    if (!paymentAddress) {
      paymentAddress = 'DEMO_WALLET_' + merchant.id.substring(0, 8);
      console.warn('No verified Solana wallet found for merchant', merchant.id);
    }

    // Determine token mint (use devnet for sandbox)
    const tokenMint = merchant.production_enabled 
      ? TOKEN_MINTS[currency as keyof typeof TOKEN_MINTS]
      : TOKEN_MINTS.USDC_DEVNET;

    // Calculate expiration
    const expiresAt = new Date(Date.now() + expires_in_minutes * 60 * 1000);

    // Create payment intent
    const { data: paymentIntent, error: createError } = await supabase
      .from('payment_intents')
      .insert({
        merchant_id: merchant.id,
        customer_id,
        amount: numAmount,
        currency,
        payment_address: paymentAddress,
        expected_token_mint: tokenMint,
        chain: 'solana',
        customer_email,
        description,
        metadata,
        expires_at: expiresAt.toISOString(),
        status: 'pending',
      })
      .select()
      .single();

    if (createError) {
      console.error('Failed to create payment intent:', createError);
      return new Response(JSON.stringify({ error: 'Failed to create payment intent' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Payment intent created: ${paymentIntent.id}`);

    return new Response(JSON.stringify({
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      payment_address: paymentIntent.payment_address,
      token_mint: paymentIntent.expected_token_mint,
      chain: paymentIntent.chain,
      expires_at: paymentIntent.expires_at,
      created_at: paymentIntent.created_at,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Create payment intent error:', error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

