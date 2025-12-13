import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Connection, PublicKey, Transaction, SystemProgram, Keypair } from "https://esm.sh/@solana/web3.js@1.87.6";
import { getAssociatedTokenAddress, createTransferInstruction } from "https://esm.sh/@solana/spl-token@0.3.9";
import bs58 from "https://esm.sh/bs58@5.0.0";
import { processEVMPayout } from "./evm-processor.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Token mint addresses
const USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'); // USDC on mainnet
const USDT_MINT = new PublicKey('Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'); // USDT on mainnet

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get RPC endpoint
    const rpcEndpoint = Deno.env.get('SOLANA_RPC_ENDPOINT') || 'https://api.devnet.solana.com';
    const connection = new Connection(rpcEndpoint, 'confirmed');

    // Get hot wallet private key from environment
    const hotWalletPrivateKey = Deno.env.get('HOT_WALLET_PRIVATE_KEY');
    if (!hotWalletPrivateKey) {
      throw new Error('Hot wallet private key not configured');
    }

    const hotWallet = Keypair.fromSecretKey(bs58.decode(hotWalletPrivateKey));

    // Get approved payouts that need processing
    const { data: payouts, error: payoutsError } = await supabase
      .from('payouts')
      .select('*')
      .eq('status', 'approved')
      .eq('destination_type', 'wallet')
      .limit(10);

    if (payoutsError) {
      throw payoutsError;
    }

    if (!payouts || payouts.length === 0) {
      return new Response(JSON.stringify({ 
        message: 'No payouts to process',
        processed: 0
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const results = [];

    for (const payout of payouts) {
      try {
        // Update status to processing
        await supabase
          .from('payouts')
          .update({
            status: 'processing',
            processed_at: new Date().toISOString()
          })
          .eq('id', payout.id);

        let signature: string;
        const chain = payout.chain || 'solana';

        // Process based on chain
        if (chain === 'solana') {
          // Solana processing
          const tokenMint = payout.currency === 'USDT' ? USDT_MINT : USDC_MINT;

          const sourceTokenAccount = await getAssociatedTokenAddress(
            tokenMint,
            hotWallet.publicKey
          );

          const destinationPubkey = new PublicKey(payout.destination_address);
          const destinationTokenAccount = await getAssociatedTokenAddress(
            tokenMint,
            destinationPubkey
          );

          const amountInTokens = Math.floor(payout.net_amount * 1_000_000);

          const transferInstruction = createTransferInstruction(
            sourceTokenAccount,
            destinationTokenAccount,
            hotWallet.publicKey,
            amountInTokens
          );

          const transaction = new Transaction().add(transferInstruction);
          const { blockhash } = await connection.getLatestBlockhash();
          transaction.recentBlockhash = blockhash;
          transaction.feePayer = hotWallet.publicKey;

          transaction.sign(hotWallet);
          signature = await connection.sendRawTransaction(transaction.serialize());

          const confirmation = await connection.confirmTransaction(signature, 'confirmed');

          if (confirmation.value.err) {
            throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
          }
        } else if (['ethereum', 'base', 'polygon'].includes(chain)) {
          // EVM chain processing
          const evmPrivateKey = Deno.env.get('EVM_HOT_WALLET_PRIVATE_KEY');
          if (!evmPrivateKey) {
            throw new Error('EVM hot wallet private key not configured');
          }

          const result = await processEVMPayout({
            chain: chain as 'ethereum' | 'base' | 'polygon',
            currency: payout.currency as 'USDC' | 'USDT',
            toAddress: payout.destination_address,
            amount: payout.net_amount,
            privateKey: evmPrivateKey,
          });

          if (!result.success) {
            throw new Error(result.error || 'EVM payout failed');
          }

          signature = result.txHash!;
        } else {
          throw new Error(`Unsupported chain: ${chain}`);
        }

        // Update payout as completed
        await supabase
          .from('payouts')
          .update({
            status: 'completed',
            tx_signature: signature,
            confirmations: 1,
            completed_at: new Date().toISOString(),
          })
          .eq('id', payout.id);

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
            tx_signature: signature,
            chain: 'solana',
            from_address: hotWallet.publicKey.toBase58(),
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
              tx_signature: signature,
              completed_at: new Date().toISOString(),
            },
          });

        results.push({
          payout_id: payout.id,
          status: 'success',
          tx_signature: signature,
        });

      } catch (error: any) {
        console.error(`Error processing payout ${payout.id}:`, error);

        // Update payout as failed
        await supabase
          .from('payouts')
          .update({
            status: 'failed',
            error_message: error.message,
            failed_at: new Date().toISOString(),
            retry_count: (payout.retry_count || 0) + 1,
          })
          .eq('id', payout.id);

        results.push({
          payout_id: payout.id,
          status: 'failed',
          error: error.message,
        });
      }
    }

    return new Response(JSON.stringify({
      message: 'Payout processing completed',
      processed: results.length,
      results,
    }), {
      status: 200,
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

