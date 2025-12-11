import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Solana RPC endpoints
const SOLANA_RPC_MAINNET = 'https://api.mainnet-beta.solana.com';
const SOLANA_RPC_DEVNET = 'https://api.devnet.solana.com';

interface SolanaTransaction {
  signature: string;
  slot: number;
  blockTime: number | null;
  confirmationStatus: string;
}

interface TokenTransfer {
  signature: string;
  amount: number;
  decimals: number;
  from: string;
  to: string;
  mint: string;
  blockTime: number;
}

/**
 * Fetch recent transactions for a wallet address
 */
async function getRecentTransactions(
  walletAddress: string,
  rpcUrl: string,
  limit = 10
): Promise<SolanaTransaction[]> {
  const response = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'getSignaturesForAddress',
      params: [
        walletAddress,
        { limit, commitment: 'confirmed' }
      ],
    }),
  });

  const data = await response.json();
  return data.result || [];
}

/**
 * Get transaction details including token transfers
 */
async function getTransactionDetails(
  signature: string,
  rpcUrl: string
): Promise<TokenTransfer | null> {
  const response = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'getTransaction',
      params: [
        signature,
        { encoding: 'jsonParsed', maxSupportedTransactionVersion: 0 }
      ],
    }),
  });

  const data = await response.json();
  const tx = data.result;

  if (!tx || !tx.meta || tx.meta.err) {
    return null;
  }

  // Parse token transfers from transaction
  const instructions = tx.transaction.message.instructions;
  
  for (const instruction of instructions) {
    if (instruction.program === 'spl-token' && instruction.parsed?.type === 'transfer') {
      const info = instruction.parsed.info;
      return {
        signature,
        amount: parseFloat(info.amount),
        decimals: info.decimals || 6, // USDC/USDT use 6 decimals
        from: info.source,
        to: info.destination,
        mint: info.mint,
        blockTime: tx.blockTime || Date.now() / 1000,
      };
    }
  }

  return null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // This function should be called periodically (e.g., via cron)
    // Get all pending payment intents that haven't expired
    const { data: pendingIntents, error: fetchError } = await supabase
      .from('payment_intents')
      .select('*')
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .is('tx_signature', null);

    if (fetchError) {
      throw fetchError;
    }

    console.log(`Monitoring ${pendingIntents?.length || 0} pending payment intents`);

    const results = [];

    for (const intent of pendingIntents || []) {
      try {
        // Determine RPC endpoint based on merchant's production status
        const { data: merchant } = await supabase
          .from('merchants')
          .select('production_enabled')
          .eq('id', intent.merchant_id)
          .single();

        const rpcUrl = merchant?.production_enabled ? SOLANA_RPC_MAINNET : SOLANA_RPC_DEVNET;

        // Get recent transactions for the payment address
        const recentTxs = await getRecentTransactions(intent.payment_address, rpcUrl, 20);

        // Check each transaction for matching token transfer
        for (const tx of recentTxs) {
          const transfer = await getTransactionDetails(tx.signature, rpcUrl);

          if (!transfer) continue;

          // Check if this transfer matches our payment intent
          const expectedAmount = intent.amount * Math.pow(10, transfer.decimals);
          const isMatch = 
            transfer.to === intent.payment_address &&
            transfer.mint === intent.expected_token_mint &&
            transfer.amount >= expectedAmount * 0.99 && // Allow 1% tolerance
            transfer.amount <= expectedAmount * 1.01;

          if (isMatch) {
            console.log(`Found matching payment for intent ${intent.id}: ${tx.signature}`);

            // Update payment intent
            await supabase
              .from('payment_intents')
              .update({
                status: 'processing',
                tx_signature: tx.signature,
                confirmations: 1,
                updated_at: new Date().toISOString(),
              })
              .eq('id', intent.id);

            results.push({
              intent_id: intent.id,
              signature: tx.signature,
              status: 'found',
            });

            break; // Found the payment, move to next intent
          }
        }
      } catch (error) {
        console.error(`Error monitoring intent ${intent.id}:`, error);
        results.push({
          intent_id: intent.id,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return new Response(JSON.stringify({
      monitored: pendingIntents?.length || 0,
      results,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Monitor blockchain error:', error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

