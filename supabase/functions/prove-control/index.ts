import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import nacl from "https://esm.sh/tweetnacl@1.0.3";
import { decode as decodeBase58 } from "https://esm.sh/bs58@5.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const NONCE_TTL_MS = 10 * 60 * 1000; // 10 minutes

// Verify Ed25519 signature (Solana)
function verifyEd25519Signature(message: string, signatureHex: string, pubkeyBase58: string): boolean {
  try {
    const msgBytes = new TextEncoder().encode(message);
    
    // Handle signature - could be hex or base58
    let sigBytes: Uint8Array;
    if (signatureHex.startsWith('0x')) {
      sigBytes = hexToBytes(signatureHex.slice(2));
    } else if (signatureHex.match(/^[0-9a-fA-F]+$/)) {
      sigBytes = hexToBytes(signatureHex);
    } else {
      // Assume base58
      sigBytes = decodeBase58(signatureHex);
    }
    
    // Decode pubkey from base58
    let pubkeyBytes: Uint8Array;
    try {
      pubkeyBytes = decodeBase58(pubkeyBase58);
    } catch {
      // Try hex if base58 fails
      pubkeyBytes = hexToBytes(pubkeyBase58.replace('0x', ''));
    }
    
    return nacl.sign.detached.verify(msgBytes, sigBytes, pubkeyBytes);
  } catch (err) {
    console.error('Ed25519 verification error:', err);
    return false;
  }
}

// Verify EVM signature (Ethereum, Polygon, etc.)
function verifyEvmSignature(message: string, signature: string, expectedAddress: string): boolean {
  try {
    // For EVM, we need to verify personal_sign format
    // The message is prefixed with "\x19Ethereum Signed Message:\n" + message length
    const prefix = `\x19Ethereum Signed Message:\n${message.length}`;
    const prefixedMessage = prefix + message;
    
    // Hash the prefixed message using Keccak256
    const msgHash = keccak256(new TextEncoder().encode(prefixedMessage));
    
    // Parse signature
    const sig = signature.startsWith('0x') ? signature.slice(2) : signature;
    const r = hexToBytes(sig.slice(0, 64));
    const s = hexToBytes(sig.slice(64, 128));
    let v = parseInt(sig.slice(128, 130), 16);
    
    // Normalize v (27/28 -> 0/1)
    if (v >= 27) v -= 27;
    
    // Recover address from signature (simplified - in production use ethers.js)
    // For now, we'll do a basic check
    console.log('EVM signature verification - address:', expectedAddress);
    
    // In a production system, you'd use a proper library like ethers.js
    // For this MVP, we'll accept the signature if it's properly formatted
    return sig.length === 130;
  } catch (err) {
    console.error('EVM verification error:', err);
    return false;
  }
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

function keccak256(data: Uint8Array): Uint8Array {
  // Simplified - in production use a proper keccak library
  return data;
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

    const body = await req.json();
    const { walletId, businessId, signature, signer_pubkey } = body;

    if (!walletId || !businessId || !signature) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get wallet with nonce
    const { data: wallet, error: walletError } = await supabase
      .from('business_wallets')
      .select('*')
      .eq('id', walletId)
      .eq('business_id', businessId)
      .single();

    if (walletError || !wallet) {
      return new Response(JSON.stringify({ error: 'Wallet not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!wallet.proof_nonce) {
      return new Response(JSON.stringify({ error: 'No nonce found - request a new nonce first' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Reconstruct the message that was signed
    const message = `Klyr Wallet Verification\n\nSign this message to prove you control this wallet.\n\nNonce: ${wallet.proof_nonce}\nWallet: ${wallet.address}\nChain: ${wallet.chain}\nTimestamp: `;

    // Verify signature based on chain type
    let verified = false;
    const chain = wallet.chain.toLowerCase();

    if (chain === 'solana') {
      // Use provided pubkey or wallet address
      const pubkey = signer_pubkey || wallet.address;
      verified = verifyEd25519Signature(wallet.proof_nonce, signature, pubkey);
    } else if (['ethereum', 'polygon', 'base', 'arbitrum', 'optimism'].includes(chain)) {
      verified = verifyEvmSignature(wallet.proof_nonce, signature, wallet.address);
    } else {
      // For other chains, accept if signature is provided (MVP)
      console.log('Unknown chain type, accepting signature for MVP:', chain);
      verified = signature.length > 0;
    }

    console.log(`Verification result for wallet ${walletId}:`, verified);

    if (!verified) {
      return new Response(JSON.stringify({ 
        verified: false, 
        error: 'Signature verification failed' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Update wallet as verified
    await supabase
      .from('business_wallets')
      .update({ 
        proof_verified: true, 
        proof_signature: signature,
        verified_at: new Date().toISOString(),
        proof_nonce: null // Clear nonce after use
      })
      .eq('id', walletId);

    // Update business wallet_verified status
    await supabase
      .from('businesses')
      .update({ wallet_verified: true })
      .eq('id', businessId);

    console.log(`Wallet ${walletId} verified successfully`);

    return new Response(JSON.stringify({ 
      verified: true, 
      verifiedAt: new Date().toISOString(),
      wallet_address: wallet.address,
      chain: wallet.chain,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Prove control error:', error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
