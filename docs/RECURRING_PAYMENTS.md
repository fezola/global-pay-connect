# Recurring Payments & Subscriptions

Guide for implementing subscription-based payments with Klyr.

## Overview

Klyr supports recurring payments for subscription-based businesses. Unlike traditional payment processors, crypto subscriptions work through:

1. **Payment Authorization** - Customer authorizes recurring charges
2. **Scheduled Charges** - Automatic charges at specified intervals
3. **Wallet Monitoring** - Check balance before charging
4. **Flexible Cancellation** - Customer can cancel anytime

---

## Implementation Methods

### Method 1: Checkout with Subscription Flag

```javascript
Klyr.checkout.open({
  merchantId: 'your_merchant_id',
  amount: '29.99',
  currency: 'USD',
  description: 'Premium Plan - Monthly',
  
  // Subscription settings
  subscription: {
    enabled: true,
    interval: 'month',        // 'day', 'week', 'month', 'year'
    intervalCount: 1,         // Charge every 1 month
    trialDays: 7,            // Optional: 7-day free trial
  },
  
  onSuccess: (paymentId, subscriptionId) => {
    console.log('Subscription created:', subscriptionId);
  }
});
```

### Method 2: API-based Subscriptions

```javascript
import Klyr from '@klyr/sdk';

const klyr = new Klyr({ apiKey: 'sk_test_...' });

// Create subscription
const subscription = await klyr.subscriptions.create({
  customerId: 'cus_123',
  amount: '29.99',
  currency: 'USDC',
  interval: 'month',
  description: 'Premium Plan',
  metadata: {
    plan: 'premium'
  }
});

console.log('Subscription ID:', subscription.id);
```

---

## Subscription Flow

### 1. Initial Setup

```javascript
// Customer authorizes subscription
const subscription = await klyr.subscriptions.create({
  customerId: customer.id,
  amount: '29.99',
  currency: 'USDC',
  interval: 'month',
  paymentMethod: {
    type: 'crypto_wallet',
    walletAddress: '0x...',
    chain: 'solana',
    token: 'USDC'
  }
});
```

### 2. Automatic Billing

Klyr automatically:
- Checks wallet balance before charging
- Initiates payment on billing date
- Retries failed payments (3 attempts)
- Sends notifications to customer
- Triggers webhooks to merchant

### 3. Handling Failed Payments

```javascript
// Listen for webhook events
app.post('/webhooks/klyr', (req, res) => {
  const event = req.body;
  
  switch (event.type) {
    case 'subscription.payment_failed':
      // Notify customer of failed payment
      sendEmail(event.data.customer_email, {
        subject: 'Payment Failed',
        message: 'Please update your payment method'
      });
      break;
      
    case 'subscription.cancelled':
      // Downgrade customer access
      revokeAccess(event.data.customer_id);
      break;
  }
  
  res.json({ received: true });
});
```

---

## Subscription Management

### Retrieve Subscription

```javascript
const subscription = await klyr.subscriptions.retrieve('sub_123');

console.log(subscription.status);  // 'active', 'past_due', 'cancelled'
console.log(subscription.currentPeriodEnd);
console.log(subscription.cancelAtPeriodEnd);
```

### Update Subscription

```javascript
// Change plan
await klyr.subscriptions.update('sub_123', {
  amount: '49.99',  // Upgrade to higher tier
  metadata: {
    plan: 'enterprise'
  }
});

// Update payment method
await klyr.subscriptions.update('sub_123', {
  paymentMethod: {
    walletAddress: 'new_wallet_address'
  }
});
```

### Cancel Subscription

```javascript
// Cancel immediately
await klyr.subscriptions.cancel('sub_123');

// Cancel at period end
await klyr.subscriptions.update('sub_123', {
  cancelAtPeriodEnd: true
});
```

### Pause Subscription

```javascript
// Pause subscription
await klyr.subscriptions.pause('sub_123');

// Resume subscription
await klyr.subscriptions.resume('sub_123');
```

---

## Customer Portal

Provide customers with a self-service portal to manage subscriptions:

```javascript
// Generate customer portal session
const session = await klyr.customerPortal.createSession({
  customerId: 'cus_123',
  returnUrl: 'https://yoursite.com/account'
});

// Redirect customer to portal
window.location.href = session.url;
```

The portal allows customers to:
- View subscription details
- Update payment method
- Change plan
- Cancel subscription
- View payment history

---

## Webhook Events

Subscribe to these events for subscription management:

```javascript
{
  "subscription.created": "New subscription created",
  "subscription.updated": "Subscription details changed",
  "subscription.payment_succeeded": "Recurring payment successful",
  "subscription.payment_failed": "Recurring payment failed",
  "subscription.cancelled": "Subscription cancelled",
  "subscription.paused": "Subscription paused",
  "subscription.resumed": "Subscription resumed",
  "subscription.trial_ending": "Trial period ending soon (3 days)"
}
```

---

## Best Practices

### 1. Balance Monitoring

Always check wallet balance before charging:

```javascript
const balance = await klyr.wallets.getBalance({
  address: subscription.walletAddress,
  token: subscription.currency
});

if (balance < subscription.amount) {
  // Notify customer
  await sendLowBalanceNotification(subscription.customerId);
}
```

### 2. Grace Period

Implement a grace period for failed payments:

```javascript
const subscription = await klyr.subscriptions.create({
  // ... other options
  gracePeriodDays: 3,  // 3 days to resolve payment issues
});
```

### 3. Prorated Charges

Handle plan changes with proration:

```javascript
await klyr.subscriptions.update('sub_123', {
  amount: '49.99',
  prorationBehavior: 'create_prorations'  // Charge/credit difference
});
```

### 4. Trial Periods

Offer free trials to increase conversions:

```javascript
const subscription = await klyr.subscriptions.create({
  // ... other options
  trialDays: 14,  // 14-day free trial
  trialEnd: new Date('2024-01-01'),  // Or specific end date
});
```

---

## Example: Complete Subscription Flow

```javascript
// 1. Create customer
const customer = await klyr.customers.create({
  email: 'user@example.com',
  name: 'John Doe'
});

// 2. Create subscription with checkout
Klyr.checkout.open({
  merchantId: 'your_merchant_id',
  customerId: customer.id,
  amount: '29.99',
  currency: 'USD',
  description: 'Premium Plan',
  subscription: {
    enabled: true,
    interval: 'month',
    trialDays: 7
  },
  onSuccess: async (paymentId, subscriptionId) => {
    // 3. Activate subscription in your system
    await activateSubscription(customer.id, subscriptionId);
    
    // 4. Grant access
    await grantPremiumAccess(customer.id);
    
    // 5. Send confirmation email
    await sendEmail(customer.email, {
      subject: 'Welcome to Premium!',
      template: 'subscription_activated'
    });
  }
});
```

---

## Support

For questions about recurring payments:
- **Documentation**: https://docs.klyr.io/subscriptions
- **Support**: support@klyr.io

