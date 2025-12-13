import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Connection, PublicKey, Transaction } from "https://esm.sh/@solana/web3.js@1.87.6";
import { getAssociatedTokenAddress, createTransferInstruction } from "https://esm.sh/@solana/spl-token@0.3.9";
import { ethers } from "https://esm.sh/ethers@6.9.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Token mint addresses
const USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
const USDT_MINT = new PublicKey('Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB');

// ERC-20 token addresses
const ERC20_TOKENS: Record<string, { USDC: string; USDT: string }> = {
  ethereum: {
    USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  },
  base: {
    USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    USDT: '0x0000000000000000000000000000000000000000',
  },
  polygon: {
    USDC: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    USDT: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
  },
};

const ERC20_ABI = [
  'function transfer(address to, uint256 amount) returns (bool)',
  'function balanceOf(address account) view returns (uint256)',
  'function decimals() view returns (uint8)',
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { payout_id } = await req.json();

    if (!payout_id) {
      return new Response(JSON.stringify({ error: 'payout_id is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get payout details
    const { data: payout, error: payoutError } = await supabase
      .from('payouts')
      .select('*, payout_destinations(*)')
      .eq('id', payout_id)
      .single();

    if (payoutError || !payout) {
      return new Response(JSON.stringify({ error: 'Payout not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get merchant's payment wallet (source of funds)
    const { data: merchant } = await supabase
      .from('merchants')
      .select('id, business_id')
      .eq('id', payout.merchant_id)
      .single();

    const { data: business } = await supabase
      .from('businesses')
      .select('id')
      .eq('id', merchant?.business_id)
      .single();

    const { data: sourceWallet } = await supabase
      .from('business_wallets')
      .select('address, chain')
      .eq('business_id', business?.id)
      .eq('chain', payout.chain || 'solana')
      .eq('proof_verified', true)
      .single();

    if (!sourceWallet) {
      return new Response(JSON.stringify({ 
        error: 'No verified payment wallet found for this chain' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const chain = payout.chain || 'solana';
    let unsignedTransaction: string;
    let expiresAt: string;

    if (chain === 'solana') {
      // Generate Solana transaction
      const rpcEndpoint = Deno.env.get('SOLANA_RPC_ENDPOINT') || 'https://api.devnet.solana.com';
      const connection = new Connection(rpcEndpoint, 'confirmed');

      const tokenMint = payout.currency === 'USDT' ? USDT_MINT : USDC_MINT;
      const sourcePubkey = new PublicKey(sourceWallet.address);
      const destinationPubkey = new PublicKey(payout.destination_address);

      const sourceTokenAccount = await getAssociatedTokenAddress(tokenMint, sourcePubkey);
      const destinationTokenAccount = await getAssociatedTokenAddress(tokenMint, destinationPubkey);

      const amountInTokens = Math.floor(payout.net_amount * 1_000_000);

      const transferInstruction = createTransferInstruction(
        sourceTokenAccount,
        destinationTokenAccount,
        sourcePubkey,
        amountInTokens
      );

      const transaction = new Transaction().add(transferInstruction);
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = sourcePubkey;

      // Serialize unsigned transaction
      unsignedTransaction = Buffer.from(transaction.serialize({ requireAllSignatures: false })).toString('base64');
      
      // Solana transactions expire after ~2 minutes
      expiresAt = new Date(Date.now() + 2 * 60 * 1000).toISOString();

    } else if (['ethereum', 'base', 'polygon'].includes(chain)) {
      // Generate EVM transaction
      const tokenAddress = ERC20_TOKENS[chain][payout.currency as 'USDC' | 'USDT'];
      
      if (!tokenAddress || tokenAddress === '0x0000000000000000000000000000000000000000') {
        return new Response(JSON.stringify({ 
          error: `${payout.currency} not supported on ${chain}` 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Create unsigned transaction data
      const iface = new ethers.Interface(ERC20_ABI);
      const decimals = payout.currency === 'USDC' ? 6 : 6;
      const amount = ethers.parseUnits(payout.net_amount.toString(), decimals);
      
      const data = iface.encodeFunctionData('transfer', [payout.destination_address, amount]);

      // Return transaction parameters for frontend to sign
      unsignedTransaction = JSON.stringify({
        to: tokenAddress,
        data: data,
        from: sourceWallet.address,
      });

      // EVM transactions don't expire, but we'll set a reasonable timeout
      expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    } else {
      return new Response(JSON.stringify({ error: `Unsupported chain: ${chain}` }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Update payout with unsigned transaction
    await supabase
      .from('payouts')
      .update({
        status: 'awaiting_signature',
        unsigned_transaction: unsignedTransaction,
        source_wallet_address: sourceWallet.address,
        transaction_expires_at: expiresAt,
        updated_at: new Date().toISOString(),
      })
      .eq('id', payout_id);

    return new Response(JSON.stringify({
      success: true,
      payout_id,
      chain,
      unsigned_transaction: unsignedTransaction,
      source_wallet: sourceWallet.address,
      destination: payout.destination_address,
      amount: payout.net_amount,
      currency: payout.currency,
      expires_at: expiresAt,
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

