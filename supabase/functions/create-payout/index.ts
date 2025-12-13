import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PayoutRequest {
  amount: string;
  currency?: string;
  destination_id?: string;
  destination_address?: string;
  notes?: string;
  chain?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: { Authorization: req.headers.get('Authorization')! },
      },
    });

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get merchant
    const { data: merchant, error: merchantError } = await supabase
      .from('merchants')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (merchantError || !merchant) {
      return new Response(JSON.stringify({ error: 'Merchant not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body: PayoutRequest = await req.json();
    const amount = parseFloat(body.amount);
    const currency = body.currency || 'USDC';
    const requestedChain = body.chain;

    // Validate chain if provided
    const supportedChains = ['solana', 'ethereum', 'base', 'polygon'];
    if (requestedChain && !supportedChains.includes(requestedChain)) {
      return new Response(JSON.stringify({ error: 'Unsupported chain' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate amount
    if (isNaN(amount) || amount <= 0) {
      return new Response(JSON.stringify({ error: 'Invalid amount' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check minimum withdrawal (e.g., $10)
    if (amount < 10) {
      return new Response(JSON.stringify({ error: 'Minimum withdrawal is $10' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get merchant balance
    const { data: balance, error: balanceError } = await supabase
      .from('balances')
      .select('total, onchain, offchain')
      .eq('merchant_id', merchant.id)
      .eq('currency', currency)
      .single();

    if (balanceError || !balance) {
      return new Response(JSON.stringify({ error: 'Balance not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check sufficient balance
    if (balance.total < amount) {
      return new Response(JSON.stringify({ 
        error: 'Insufficient balance',
        available: balance.total,
        requested: amount
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Calculate fee (0.5% or minimum $1)
    const feePercent = 0.005; // 0.5%
    const calculatedFee = amount * feePercent;
    const feeAmount = Math.max(calculatedFee, 1.0);
    const netAmount = amount - feeAmount;

    // Determine if approval is required (amounts > $1000)
    const requiresApproval = amount > 1000;

    // Get or validate destination
    let destinationId = body.destination_id;
    let destinationAddress = body.destination_address;
    let destinationType = 'wallet';
    let payoutChain = requestedChain || 'solana'; // Default to solana

    if (destinationId) {
      // Validate destination exists and belongs to merchant
      const { data: destination, error: destError } = await supabase
        .from('payout_destinations')
        .select('*')
        .eq('id', destinationId)
        .eq('merchant_id', merchant.id)
        .single();

      if (destError || !destination) {
        return new Response(JSON.stringify({ error: 'Invalid destination' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      destinationAddress = destination.address;
      destinationType = destination.type;
      payoutChain = destination.chain || payoutChain; // Use destination's chain
    } else if (!destinationAddress) {
      return new Response(JSON.stringify({ error: 'Destination address or destination_id required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create payout record
    const { data: payout, error: payoutError } = await supabase
      .from('payouts')
      .insert({
        merchant_id: merchant.id,
        amount,
        currency,
        fee_amount: feeAmount,
        net_amount: netAmount,
        destination_type: destinationType,
        destination_id: destinationId,
        destination_address: destinationAddress,
        status: requiresApproval ? 'pending' : 'approved',
        requires_approval: requiresApproval,
        approved_by: requiresApproval ? null : user.id,
        approved_at: requiresApproval ? null : new Date().toISOString(),
        notes: body.notes,
        chain: payoutChain,
      })
      .select()
      .single();

    if (payoutError) {
      console.error('Payout creation error:', payoutError);
      return new Response(JSON.stringify({ error: 'Failed to create payout' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // If auto-approved, generate unsigned transaction immediately
    if (!requiresApproval) {
      try {
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabaseService = createClient(supabaseUrl, serviceRoleKey);

        // Call generate-payout-transaction function
        const { data: txData, error: txError } = await supabaseService.functions.invoke(
          'generate-payout-transaction',
          { body: { payout_id: payout.id } }
        );

        if (txError) {
          console.error('Failed to generate transaction:', txError);
        }
      } catch (error) {
        console.error('Error generating transaction:', error);
      }
    }

    return new Response(JSON.stringify({
      ...payout,
      message: requiresApproval
        ? 'Payout created and pending approval'
        : 'Payout created. Please sign the transaction to complete.'
    }), {
      status: 201,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

