# @klyr/sdk

Official Klyr SDK for accepting crypto payments on Solana.

## Installation

```bash
npm install @klyr/sdk
# or
yarn add @klyr/sdk
# or
pnpm add @klyr/sdk
```

## Quick Start

```typescript
import Klyr from '@klyr/sdk';

// Initialize with your API key
const klyr = new Klyr({
  apiKey: 'sk_test_your_api_key_here',
});

// Create a payment
const payment = await klyr.payments.create({
  amount: '100.00',
  currency: 'USDC',
  customer_email: 'customer@example.com',
  description: 'Product purchase',
});

console.log('Payment address:', payment.payment_address);
console.log('Payment status:', payment.status);
```

## API Reference

### Initialize Client

```typescript
const klyr = new Klyr({
  apiKey: 'sk_test_...',  // Required: Your API key
  baseUrl: 'https://...',  // Optional: Custom API base URL
});
```

### Payments

#### Create Payment

```typescript
const payment = await klyr.payments.create({
  amount: '100.00',           // Required: Amount in currency units
  currency: 'USDC',           // Optional: Default 'USDC'
  customer_id: 'cus_123',     // Optional: Customer ID
  customer_email: 'user@example.com',  // Optional: Customer email
  description: 'Order #1234', // Optional: Payment description
  metadata: {                 // Optional: Custom metadata
    order_id: '1234',
    product: 'Premium Plan',
  },
});
```

#### Retrieve Payment

```typescript
const payment = await klyr.payments.retrieve('pi_abc123');
```

#### List Payments

```typescript
const payments = await klyr.payments.list({
  limit: 10,              // Optional: Number of results (default: 10)
  offset: 0,              // Optional: Pagination offset (default: 0)
  status: 'succeeded',    // Optional: Filter by status
});

console.log(payments.data);      // Array of payments
console.log(payments.total);     // Total count
```

### Balances

#### List Balances

```typescript
const balances = await klyr.balances.list();

balances.data.forEach(balance => {
  console.log(`${balance.currency}: ${balance.total}`);
});
```

### Customers

#### Create Customer

```typescript
const customer = await klyr.customers.create({
  email: 'customer@example.com',  // Required
  name: 'John Doe',               // Optional
  metadata: {                     // Optional
    user_id: '12345',
  },
});
```

#### List Customers

```typescript
const customers = await klyr.customers.list({
  limit: 10,
  offset: 0,
});
```

### Webhooks

#### List Webhook Events

```typescript
const events = await klyr.webhooks.list({
  limit: 10,
  offset: 0,
});

events.data.forEach(event => {
  console.log(`${event.event_type}: ${event.status}`);
});
```

## Error Handling

```typescript
import { KlyrError } from '@klyr/sdk';

try {
  const payment = await klyr.payments.create({
    amount: '100.00',
    currency: 'USDC',
  });
} catch (error) {
  if (error instanceof KlyrError) {
    console.error('Klyr Error:', error.message);
    console.error('Status Code:', error.statusCode);
    console.error('Error Code:', error.code);
  } else {
    console.error('Unknown error:', error);
  }
}
```

## TypeScript Support

The SDK is written in TypeScript and includes full type definitions.

```typescript
import Klyr, { Payment, Balance, Customer } from '@klyr/sdk';

const klyr = new Klyr({ apiKey: 'sk_test_...' });

// Full type safety
const payment: Payment = await klyr.payments.create({
  amount: '100.00',
  currency: 'USDC',
});
```

## Examples

### E-commerce Checkout

```typescript
// Create payment for checkout
const payment = await klyr.payments.create({
  amount: cart.total.toString(),
  currency: 'USDC',
  customer_email: user.email,
  description: `Order #${order.id}`,
  metadata: {
    order_id: order.id,
    items: cart.items.map(i => i.id),
  },
});

// Show payment address to customer
displayQRCode(payment.payment_address);

// Poll for payment status
const checkPayment = setInterval(async () => {
  const updated = await klyr.payments.retrieve(payment.id);
  
  if (updated.status === 'succeeded') {
    clearInterval(checkPayment);
    fulfillOrder(order.id);
  }
}, 5000);
```

### Subscription Billing

```typescript
// Create customer
const customer = await klyr.customers.create({
  email: user.email,
  name: user.name,
  metadata: { user_id: user.id },
});

// Create monthly payment
const payment = await klyr.payments.create({
  amount: '29.99',
  currency: 'USDC',
  customer_id: customer.id,
  description: 'Monthly subscription',
});
```

## Support

- Documentation: https://docs.klyr.io
- GitHub: https://github.com/klyr/sdk
- Email: support@klyr.io

## License

MIT

