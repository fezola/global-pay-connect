/**
 * Generate a Solana hot wallet for payouts
 * 
 * This script generates a new Solana keypair and outputs:
 * - Public key (wallet address)
 * - Private key in base58 format (for HOT_WALLET_PRIVATE_KEY env var)
 * - Private key as JSON array (for backup)
 */

import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';

console.log('🔐 Generating Solana Hot Wallet...\n');

// Generate new keypair
const keypair = Keypair.generate();

// Get public key (wallet address)
const publicKey = keypair.publicKey.toBase58();

// Get private key in different formats
const secretKeyArray = Array.from(keypair.secretKey);
const secretKeyBase58 = bs58.encode(keypair.secretKey);

console.log('✅ Hot Wallet Generated!\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('📍 WALLET ADDRESS (Public Key):');
console.log(publicKey);
console.log('\n');

console.log('🔑 PRIVATE KEY (Base58) - Use this for HOT_WALLET_PRIVATE_KEY:');
console.log(secretKeyBase58);
console.log('\n');

console.log('💾 PRIVATE KEY (JSON Array) - For backup:');
console.log(JSON.stringify(secretKeyArray));
console.log('\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('📋 NEXT STEPS:\n');
console.log('1. Add to Supabase Edge Function Secrets:');
console.log('   Go to: https://supabase.com/dashboard/project/crkhkzcscgoeyspaczux/settings/functions');
console.log('   Add secret:');
console.log('   - Name: HOT_WALLET_PRIVATE_KEY');
console.log(`   - Value: ${secretKeyBase58}`);
console.log('\n');

console.log('2. Fund the wallet with SOL (for transaction fees):');
console.log('   Devnet: https://faucet.solana.com/');
console.log(`   Address: ${publicKey}`);
console.log('\n');

console.log('3. Fund the wallet with USDC (for payouts):');
console.log('   Devnet: https://spl-token-faucet.com/');
console.log(`   Address: ${publicKey}`);
console.log('\n');

console.log('4. Check balance:');
console.log(`   solana balance ${publicKey} --url devnet`);
console.log('\n');

console.log('⚠️  SECURITY WARNINGS:\n');
console.log('- NEVER commit this private key to git');
console.log('- NEVER share this private key with anyone');
console.log('- Store the backup JSON array in a secure location');
console.log('- Use this wallet ONLY for payouts (keep balance low)');
console.log('- Start with devnet before using mainnet');
console.log('\n');

// Save to file (optional)
const walletData = {
  publicKey,
  secretKeyBase58,
  secretKeyArray,
  createdAt: new Date().toISOString(),
  network: 'devnet',
  purpose: 'hot-wallet-for-payouts',
};

console.log('💾 Wallet data saved to: hot-wallet-backup.json');
console.log('⚠️  Remember to DELETE this file after copying the keys!\n');

// Write to file
await Deno.writeTextFile(
  'hot-wallet-backup.json',
  JSON.stringify(walletData, null, 2)
);

console.log('✅ Done! Your hot wallet is ready to use.\n');

