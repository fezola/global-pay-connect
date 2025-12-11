/**
 * Test script for payment flow
 * 
 * This script tests the complete payment flow:
 * 1. Create payment intent
 * 2. Simulate payment (devnet)
 * 3. Monitor for confirmation
 * 4. Verify settlement
 * 
 * Usage:
 *   npm install -g tsx
 *   tsx scripts/test-payment-flow.ts
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://crkhkzcscgoeyspaczux.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

async function testPaymentFlow() {
  console.log('🚀 Starting payment flow test...\n');

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // Step 1: Sign in (you'll need to create a test user first)
  console.log('📝 Step 1: Authenticating...');
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'test@example.com',
    password: 'testpassword123',
  });

  if (authError) {
    console.error('❌ Authentication failed:', authError.message);
    console.log('\n💡 Create a test user first:');
    console.log('   1. Go to your Supabase dashboard');
    console.log('   2. Navigate to Authentication > Users');
    console.log('   3. Create a user with email: test@example.com');
    return;
  }

  console.log('✅ Authenticated as:', authData.user?.email);

  // Step 2: Create payment intent
  console.log('\n💰 Step 2: Creating payment intent...');
  const response = await fetch(`${SUPABASE_URL}/functions/v1/create-payment-intent`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authData.session?.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: '1.00',
      currency: 'USDC',
      description: 'Test payment',
      customer_email: 'customer@example.com',
    }),
  });

  const paymentIntent = await response.json();

  if (!response.ok) {
    console.error('❌ Failed to create payment intent:', paymentIntent.error);
    return;
  }

  console.log('✅ Payment intent created:');
  console.log('   ID:', paymentIntent.id);
  console.log('   Amount:', paymentIntent.amount, paymentIntent.currency);
  console.log('   Status:', paymentIntent.status);
  console.log('   Payment Address:', paymentIntent.payment_address);
  console.log('   Token Mint:', paymentIntent.token_mint);
  console.log('   Expires:', new Date(paymentIntent.expires_at).toLocaleString());

  // Step 3: Instructions for manual testing
  console.log('\n📱 Step 3: Send payment manually');
  console.log('   To complete this test:');
  console.log('   1. Get devnet USDC from: https://spl-token-faucet.com/');
  console.log('   2. Send', paymentIntent.amount, 'USDC to:', paymentIntent.payment_address);
  console.log('   3. Wait for blockchain confirmation (~30 seconds)');
  console.log('   4. The monitoring service will detect and settle the payment');

  // Step 4: Monitor payment status
  console.log('\n👀 Step 4: Monitoring payment status...');
  console.log('   Checking every 5 seconds for 2 minutes...\n');

  let attempts = 0;
  const maxAttempts = 24; // 2 minutes

  const checkStatus = async () => {
    attempts++;
    
    const { data, error } = await supabase
      .from('payment_intents')
      .select('*')
      .eq('id', paymentIntent.id)
      .single();

    if (error) {
      console.error('❌ Error checking status:', error.message);
      return;
    }

    console.log(`   [${attempts}/${maxAttempts}] Status: ${data.status} | Confirmations: ${data.confirmations || 0}`);

    if (data.status === 'succeeded') {
      console.log('\n🎉 Payment succeeded!');
      console.log('   Transaction:', data.tx_signature);
      console.log('   Confirmed at:', new Date(data.confirmed_at).toLocaleString());
      
      // Check balance update
      const { data: balances } = await supabase
        .from('balances')
        .select('*')
        .eq('currency', paymentIntent.currency);
      
      if (balances && balances.length > 0) {
        console.log('\n💵 Balance updated:');
        console.log('   Total:', balances[0].total, paymentIntent.currency);
        console.log('   On-chain:', balances[0].onchain, paymentIntent.currency);
      }

      // Check webhook events
      const { data: webhooks } = await supabase
        .from('webhook_events')
        .select('*')
        .eq('resource_id', paymentIntent.id);
      
      if (webhooks && webhooks.length > 0) {
        console.log('\n📨 Webhook events:');
        webhooks.forEach(wh => {
          console.log(`   - ${wh.event_type}: ${wh.status} (${wh.attempts} attempts)`);
        });
      }

      return true;
    }

    if (data.status === 'failed' || data.status === 'expired') {
      console.log(`\n❌ Payment ${data.status}`);
      return true;
    }

    if (attempts >= maxAttempts) {
      console.log('\n⏱️  Timeout reached. Payment still pending.');
      console.log('   The payment may still complete. Check the dashboard.');
      return true;
    }

    return false;
  };

  // Poll for status
  const interval = setInterval(async () => {
    const done = await checkStatus();
    if (done) {
      clearInterval(interval);
      console.log('\n✨ Test complete!\n');
    }
  }, 5000);
}

// Run the test
testPaymentFlow().catch(console.error);

