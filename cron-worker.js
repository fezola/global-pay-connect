/**
 * Klyr Cron Worker
 * Runs automated jobs for payment processing and payouts
 */

const SUPABASE_URL = 'https://crkhkzcscgoeyspaczux.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY environment variable not set');
  process.exit(1);
}

// Call an edge function
async function callEdgeFunction(functionName) {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/${functionName}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    const data = await response.json();
    const timestamp = new Date().toLocaleTimeString();
    
    if (response.ok) {
      console.log(`✅ [${timestamp}] ${functionName}: Success`);
      return { success: true, data };
    } else {
      console.log(`❌ [${timestamp}] ${functionName}: Failed - ${data.error || 'Unknown error'}`);
      return { success: false, error: data.error };
    }
  } catch (error) {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`❌ [${timestamp}] ${functionName}: Error - ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Monitor blockchain (every 30 seconds)
async function monitorBlockchain() {
  await callEdgeFunction('monitor-blockchain');
}

// Settle payments (every 1 minute)
async function settlePayments() {
  await callEdgeFunction('settle-payment');
}

// Deliver webhooks (every 1 minute)
async function deliverWebhooks() {
  await callEdgeFunction('deliver-webhooks');
}

// Process payouts (every 5 minutes)
async function processPayouts() {
  await callEdgeFunction('process-payout');
}

// Main function
async function main() {
  console.log('🚀 Klyr Cron Worker Started\n');
  console.log('📍 Supabase URL:', SUPABASE_URL);
  console.log('🔑 Service Role Key:', SERVICE_ROLE_KEY.slice(0, 20) + '...\n');
  console.log('Jobs running:');
  console.log('  - Monitor Blockchain: Every 30 seconds');
  console.log('  - Settle Payments: Every 1 minute');
  console.log('  - Deliver Webhooks: Every 1 minute');
  console.log('  - Process Payouts: Every 5 minutes\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Run immediately on start
  console.log('Running initial jobs...\n');
  await monitorBlockchain();
  await settlePayments();
  await deliverWebhooks();
  await processPayouts();

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('Scheduled jobs started. Running continuously...\n');

  // Schedule jobs
  let counter = 0;

  setInterval(async () => {
    counter++;

    // Monitor blockchain every 30 seconds
    if (counter % 1 === 0) {
      await monitorBlockchain();
    }

    // Settle payments every 1 minute (60 seconds / 30 = 2)
    if (counter % 2 === 0) {
      await settlePayments();
    }

    // Deliver webhooks every 1 minute
    if (counter % 2 === 0) {
      await deliverWebhooks();
    }

    // Process payouts every 5 minutes (300 seconds / 30 = 10)
    if (counter % 10 === 0) {
      await processPayouts();
    }
  }, 30000); // Run every 30 seconds
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Stopping cron worker...');
  console.log('✅ Goodbye!\n');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n🛑 Stopping cron worker...');
  console.log('✅ Goodbye!\n');
  process.exit(0);
});

// Start
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

