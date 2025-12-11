import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SOLANA_RPC_MAINNET = 'https://api.mainnet-beta.solana.com';
const SOLANA_RPC_DEVNET = 'https://api.devnet.solana.com';

/**
 * Verify transaction confirmation status
 */
async function verifyTransactionConfirmation(
  signature: string,
  rpcUrl: string,
  requiredConfirmations = 32
): Promise<{ confirmed: boolean; confirmations: number }> {
  const response = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'getSignatureStatuses',
      params: [[signature], { searchTransactionHistory: true }],
    }),
  });

  const data = await response.json();
  const status = data.result?.value?.[0];

  if (!status) {
    return { confirmed: false, confirmations: 0 };
  }

  const confirmations = status.confirmations || 0;
  const confirmed = status.confirmationStatus === 'finalized' || confirmations >= requiredConfirmations;

  return { confirmed, confirmations };
}

/**
 * Create or update merchant balance
 */
async function updateMerchantBalance(
  supabase: any,
  merchantId: string,
  currency: string,
  amount: number
) {
  // Try to get existing balance
  const { data: existingBalance } = await supabase
    .from('balances')
    .select('*')
    .eq('merchant_id', merchantId)
    .eq('currency', currency)
    .single();

  if (existingBalance) {
    // Update existing balance
    const newTotal = parseFloat(existingBalance.total) + amount;
    const newOnchain = parseFloat(existingBalance.onchain) + amount;

    await supabase
      .from('balances')
      .update({
        total: newTotal,
        onchain: newOnchain,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingBalance.id);
  } else {
    // Create new balance
    await supabase
      .from('balances')
      .insert({
        merchant_id: merchantId,
        currency,
        total: amount,
        onchain: amount,
        offchain: 0,
      });
  }
}

/**
 * Create transaction record
 */
async function createTransactionRecord(
  supabase: any,
  merchantId: string,
  paymentIntent: any
) {
  await supabase
    .from('transactions')
    .insert({
      merchant_id: merchantId,
      status: 'settled_onchain',
      type: 'deposit',
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      description: paymentIntent.description || `Payment ${paymentIntent.id}`,
      tx_hash: paymentIntent.tx_signature,
    });
}

/**
 * Queue webhook event
 */
async function queueWebhookEvent(
  supabase: any,
  merchantId: string,
  eventType: string,
  resourceType: string,
  resourceId: string,
  payload: any
) {
  await supabase
    .from('webhook_events')
    .insert({
      merchant_id: merchantId,
      event_type: eventType,
      resource_type: resourceType,
      resource_id: resourceId,
      payload,
      status: 'pending',
      attempts: 0,
      next_retry_at: new Date().toISOString(),
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

    // Get all processing payment intents
    const { data: processingIntents, error: fetchError } = await supabase
      .from('payment_intents')
      .select('*')
      .eq('status', 'processing')
      .not('tx_signature', 'is', null);

    if (fetchError) {
      throw fetchError;
    }

    console.log(`Settling ${processingIntents?.length || 0} processing payments`);

    const results = [];

    for (const intent of processingIntents || []) {
      try {
        // Get merchant to determine RPC endpoint
        const { data: merchant } = await supabase
          .from('merchants')
          .select('production_enabled')
          .eq('id', intent.merchant_id)
          .single();

        const rpcUrl = merchant?.production_enabled ? SOLANA_RPC_MAINNET : SOLANA_RPC_DEVNET;

        // Verify transaction confirmation
        const { confirmed, confirmations } = await verifyTransactionConfirmation(
          intent.tx_signature,
          rpcUrl
        );

        if (confirmed) {
          console.log(`Settling payment intent ${intent.id}`);

          // Update payment intent to succeeded
          await supabase
            .from('payment_intents')
            .update({
              status: 'succeeded',
              confirmations,
              confirmed_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', intent.id);

          // Update merchant balance
          await updateMerchantBalance(
            supabase,
            intent.merchant_id,
            intent.currency,
            parseFloat(intent.amount)
          );

          // Create transaction record
          await createTransactionRecord(supabase, intent.merchant_id, intent);

          // Queue webhook event
          await queueWebhookEvent(
            supabase,
            intent.merchant_id,
            'payment.succeeded',
            'payment_intent',
            intent.id,
            {
              id: intent.id,
              amount: intent.amount,
              currency: intent.currency,
              status: 'succeeded',
              tx_signature: intent.tx_signature,
              confirmed_at: new Date().toISOString(),
            }
          );

          results.push({
            intent_id: intent.id,
            status: 'settled',
            confirmations,
          });
        } else {
          // Update confirmation count
          await supabase
            .from('payment_intents')
            .update({
              confirmations,
              updated_at: new Date().toISOString(),
            })
            .eq('id', intent.id);

          results.push({
            intent_id: intent.id,
            status: 'pending_confirmation',
            confirmations,
          });
        }
      } catch (error) {
        console.error(`Error settling intent ${intent.id}:`, error);
        results.push({
          intent_id: intent.id,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return new Response(JSON.stringify({
      processed: processingIntents?.length || 0,
      results,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Settle payment error:', error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

