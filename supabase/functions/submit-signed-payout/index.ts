import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Connection } from "https://esm.sh/@solana/web3.js@1.87.6";
import { ethers } from "https://esm.sh/ethers@6.9.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RPC_ENDPOINTS: Record<string, string> = {
  ethereum: Deno.env.get('ETHEREUM_RPC_ENDPOINT') || 'https://eth.llamarpc.com',
  base: Deno.env.get('BASE_RPC_ENDPOINT') || 'https://mainnet.base.org',
  polygon: Deno.env.get('POLYGON_RPC_ENDPOINT') || 'https://polygon-rpc.com',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { payout_id, signed_transaction } = await req.json();

    if (!payout_id || !signed_transaction) {
      return new Response(JSON.stringify({ 
        error: 'payout_id and signed_transaction are required' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get payout details
    const { data: payout, error: payoutError } = await supabase
      .from('payouts')
      .select('*')
      .eq('id', payout_id)
      .single();

    if (payoutError || !payout) {
      return new Response(JSON.stringify({ error: 'Payout not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if transaction expired
    if (payout.transaction_expires_at && new Date(payout.transaction_expires_at) < new Date()) {
      await supabase
        .from('payouts')
        .update({ status: 'expired' })
        .eq('id', payout_id);

      return new Response(JSON.stringify({ 
        error: 'Transaction has expired. Please generate a new one.' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Update status to processing
    await supabase
      .from('payouts')
      .update({
        status: 'processing',
        signed_at: new Date().toISOString(),
        processed_at: new Date().toISOString(),
      })
      .eq('id', payout_id);

    const chain = payout.chain || 'solana';
    let txSignature: string;

    if (chain === 'solana') {
      // Submit Solana transaction
      const rpcEndpoint = Deno.env.get('SOLANA_RPC_ENDPOINT') || 'https://api.devnet.solana.com';
      const connection = new Connection(rpcEndpoint, 'confirmed');

      // signed_transaction is base64 encoded signed transaction
      const signedTxBuffer = Buffer.from(signed_transaction, 'base64');
      txSignature = await connection.sendRawTransaction(signedTxBuffer);

      // Wait for confirmation
      const confirmation = await connection.confirmTransaction(txSignature, 'confirmed');

      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
      }

    } else if (['ethereum', 'base', 'polygon'].includes(chain)) {
      // Submit EVM transaction
      const rpcUrl = RPC_ENDPOINTS[chain];
      const provider = new ethers.JsonRpcProvider(rpcUrl);

      // signed_transaction is the raw signed transaction hex
      const tx = await provider.broadcastTransaction(signed_transaction);
      txSignature = tx.hash;

      // Wait for confirmation (1 block)
      await tx.wait(1);

    } else {
      throw new Error(`Unsupported chain: ${chain}`);
    }

    // Update payout as completed
    await supabase
      .from('payouts')
      .update({
        status: 'completed',
        tx_signature: txSignature,
        confirmations: 1,
        completed_at: new Date().toISOString(),
      })
      .eq('id', payout_id);

    // Update merchant balance
    await supabase.rpc('update_balance', {
      p_merchant_id: payout.merchant_id,
      p_currency: payout.currency,
      p_amount: -payout.amount, // Deduct the full amount (including fee)
    });

    // Create transaction record
    await supabase
      .from('transactions')
      .insert({
        merchant_id: payout.merchant_id,
        type: 'payout',
        amount: payout.net_amount,
        currency: payout.currency,
        status: 'completed',
        tx_signature: txSignature,
        chain: chain,
        from_address: payout.source_wallet_address,
        to_address: payout.destination_address,
        metadata: {
          payout_id: payout.id,
          fee_amount: payout.fee_amount,
        },
      });

    // Create webhook event
    await supabase
      .from('webhook_events')
      .insert({
        merchant_id: payout.merchant_id,
        event_type: 'payout.completed',
        resource_type: 'payout',
        resource_id: payout.id,
        payload: {
          id: payout.id,
          amount: payout.amount,
          net_amount: payout.net_amount,
          currency: payout.currency,
          destination_address: payout.destination_address,
          tx_signature: txSignature,
          completed_at: new Date().toISOString(),
        },
      });

    return new Response(JSON.stringify({
      success: true,
      payout_id,
      tx_signature: txSignature,
      status: 'completed',
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error:', error);

    // Update payout as failed
    if (req.json) {
      const { payout_id } = await req.json();
      if (payout_id) {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        await supabase
          .from('payouts')
          .update({
            status: 'failed',
            error_message: error.message,
            failed_at: new Date().toISOString(),
          })
          .eq('id', payout_id);
      }
    }

    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

