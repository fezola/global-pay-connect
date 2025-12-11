import Klyr from '../src/index';

// Initialize Klyr client
const klyr = new Klyr({
  apiKey: process.env.KLYR_API_KEY || 'sk_test_your_key_here',
});

async function main() {
  try {
    console.log('🚀 Klyr SDK Example\n');

    // 1. Create a payment
    console.log('1. Creating payment...');
    const payment = await klyr.payments.create({
      amount: '10.00',
      currency: 'USDC',
      customer_email: 'customer@example.com',
      description: 'Test payment',
      metadata: {
        order_id: '12345',
        product: 'Test Product',
      },
    });

    console.log('✅ Payment created:');
    console.log('   ID:', payment.id);
    console.log('   Amount:', payment.amount, payment.currency);
    console.log('   Status:', payment.status);
    console.log('   Payment Address:', payment.payment_address);
    console.log('   Expires:', new Date(payment.expires_at).toLocaleString());
    console.log('');

    // 2. Retrieve the payment
    console.log('2. Retrieving payment...');
    const retrieved = await klyr.payments.retrieve(payment.id);
    console.log('✅ Payment retrieved:', retrieved.status);
    console.log('');

    // 3. List all payments
    console.log('3. Listing payments...');
    const payments = await klyr.payments.list({ limit: 5 });
    console.log(`✅ Found ${payments.total} payments (showing ${payments.data.length})`);
    payments.data.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.id} - ${p.amount} ${p.currency} - ${p.status}`);
    });
    console.log('');

    // 4. Get balances
    console.log('4. Getting balances...');
    const balances = await klyr.balances.list();
    console.log('✅ Balances:');
    balances.data.forEach(balance => {
      console.log(`   ${balance.currency}: ${balance.total} (on-chain: ${balance.onchain})`);
    });
    console.log('');

    // 5. Create a customer
    console.log('5. Creating customer...');
    const customer = await klyr.customers.create({
      email: 'newcustomer@example.com',
      name: 'John Doe',
      metadata: {
        user_id: '67890',
      },
    });
    console.log('✅ Customer created:', customer.id);
    console.log('');

    // 6. List customers
    console.log('6. Listing customers...');
    const customers = await klyr.customers.list({ limit: 5 });
    console.log(`✅ Found ${customers.total} customers`);
    console.log('');

    // 7. List webhook events
    console.log('7. Listing webhook events...');
    const webhooks = await klyr.webhooks.list({ limit: 5 });
    console.log(`✅ Found ${webhooks.total} webhook events`);
    webhooks.data.forEach((event, i) => {
      console.log(`   ${i + 1}. ${event.event_type} - ${event.status}`);
    });
    console.log('');

    console.log('🎉 All operations completed successfully!');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

main();

