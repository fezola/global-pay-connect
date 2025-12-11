/**
 * Generate a Solana hot wallet for payouts
 * Run: node scripts/generate-hot-wallet.js
 */

import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';
import fs from 'fs';

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
console.log('   Click "Add secret"');
console.log('   - Name: HOT_WALLET_PRIVATE_KEY');
console.log(`   - Value: ${secretKeyBase58}`);
console.log('\n');

console.log('2. Add RPC endpoint secret:');
console.log('   - Name: SOLANA_RPC_ENDPOINT');
console.log('   - Value: https://api.devnet.solana.com');
console.log('\n');

console.log('3. Fund the wallet with SOL (for transaction fees):');
console.log('   Devnet Faucet: https://faucet.solana.com/');
console.log(`   Paste this address: ${publicKey}`);
console.log('\n');

console.log('4. Fund the wallet with USDC (for payouts):');
console.log('   USDC Faucet: https://spl-token-faucet.com/');
console.log(`   Paste this address: ${publicKey}`);
console.log('   Select: USDC-Dev');
console.log('\n');

console.log('5. Check balance:');
console.log(`   Visit: https://explorer.solana.com/address/${publicKey}?cluster=devnet`);
console.log('\n');

console.log('⚠️  SECURITY WARNINGS:\n');
console.log('❌ NEVER commit this private key to git');
console.log('❌ NEVER share this private key with anyone');
console.log('❌ NEVER use this wallet for personal funds');
console.log('✅ Store the backup JSON in a secure password manager');
console.log('✅ Use this wallet ONLY for payouts');
console.log('✅ Keep balance low (only what\'s needed)');
console.log('✅ Start with devnet before mainnet');
console.log('\n');

// Save to file
const walletData = {
  publicKey,
  secretKeyBase58,
  secretKeyArray,
  createdAt: new Date().toISOString(),
  network: 'devnet',
  purpose: 'hot-wallet-for-payouts',
  instructions: {
    step1: 'Add HOT_WALLET_PRIVATE_KEY to Supabase secrets',
    step2: 'Fund with SOL from https://faucet.solana.com/',
    step3: 'Fund with USDC from https://spl-token-faucet.com/',
    step4: 'DELETE this file after copying keys',
  }
};

fs.writeFileSync(
  'hot-wallet-backup.json',
  JSON.stringify(walletData, null, 2)
);

console.log('💾 Wallet data saved to: hot-wallet-backup.json');
console.log('⚠️  Remember to DELETE this file after copying the keys!\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('✅ Done! Your hot wallet is ready to use.\n');

