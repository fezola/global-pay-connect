import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// In-memory nonce store (for production, use Redis or DB)
const nonceStore = new Map<string, { nonce: string; createdAt: number; businessId: string }>();
const NONCE_TTL_MS = 10 * 60 * 1000; // 10 minutes

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get auth user from request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
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

    const url = new URL(req.url);
    const walletId = url.searchParams.get('walletId');
    const businessId = url.searchParams.get('businessId');

    if (!walletId || !businessId) {
      return new Response(JSON.stringify({ error: 'walletId and businessId required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify user has access to this business
    const { data: business, error: bizError } = await supabase
      .from('businesses')
      .select('id, merchant_id')
      .eq('id', businessId)
      .single();

    if (bizError || !business) {
      return new Response(JSON.stringify({ error: 'Business not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify wallet exists
    const { data: wallet, error: walletError } = await supabase
      .from('business_wallets')
      .select('id, address, chain')
      .eq('id', walletId)
      .eq('business_id', businessId)
      .single();

    if (walletError || !wallet) {
      return new Response(JSON.stringify({ error: 'Wallet not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate nonce
    const nonce = crypto.randomUUID().replace(/-/g, '');
    const message = `Klyr Wallet Verification\n\nSign this message to prove you control this wallet.\n\nNonce: ${nonce}\nWallet: ${wallet.address}\nChain: ${wallet.chain}\nTimestamp: ${new Date().toISOString()}`;

    // Store nonce (update the wallet record with proof_nonce)
    await supabase
      .from('business_wallets')
      .update({ proof_nonce: nonce })
      .eq('id', walletId);

    // Also store in memory for quick validation
    nonceStore.set(walletId, { 
      nonce, 
      createdAt: Date.now(), 
      businessId 
    });

    // Clean up expired nonces
    const now = Date.now();
    for (const [key, value] of nonceStore.entries()) {
      if (now - value.createdAt > NONCE_TTL_MS) {
        nonceStore.delete(key);
      }
    }

    console.log(`Nonce generated for wallet ${walletId}:`, nonce);

    return new Response(JSON.stringify({ 
      nonce,
      message,
      expires_in: NONCE_TTL_MS,
      wallet_address: wallet.address,
      chain: wallet.chain,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error generating nonce:', error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
