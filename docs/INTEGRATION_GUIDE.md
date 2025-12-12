# Klyr Checkout Integration Guide

Complete step-by-step guide to integrate Klyr crypto payments into your application.

## Quick Start (5 minutes)

### 1. Get Your API Keys

1. Sign up at [dashboard.klyr.io](https://dashboard.klyr.io)
2. Navigate to **Settings** → **API Keys**
3. Copy your **Merchant ID** and **API Key**

### 2. Choose Integration Method

| Method | Best For | Setup Time |
|--------|----------|------------|
| JavaScript SDK | Any website | 5 min |
| React Components | React/Next.js apps | 5 min |
| Hosted Checkout | Quick integration | 2 min |
| API Integration | Custom flows | 15 min |

### 3. Install & Integrate

#### Option A: JavaScript SDK (Recommended)

```html
<!-- Add to your HTML -->
<script src="https://js.klyr.io/v1/checkout.js"></script>

<button id="pay-button">Pay with Crypto</button>

<script>
  document.getElementById('pay-button').addEventListener('click', () => {
    Klyr.checkout.open({
      merchantId: 'YOUR_MERCHANT_ID',
      amount: '100.00',
      currency: 'USD',
      onSuccess: (paymentId, txHash) => {
        console.log('Payment successful!', paymentId);
      }
    });
  });
</script>
```

#### Option B: React Components

```bash
npm install @klyr/sdk
```

```tsx
import { KlyrCheckoutButton } from '@klyr/sdk/react';

function App() {
  return (
    <KlyrCheckoutButton
      merchantId="YOUR_MERCHANT_ID"
      amount="100.00"
      currency="USD"
      onSuccess={(paymentId) => {
        console.log('Payment successful!', paymentId);
      }}
    >
      Pay with Crypto
    </KlyrCheckoutButton>
  );
}
```

#### Option C: Hosted Checkout

```javascript
// Redirect to hosted checkout page
const checkoutUrl = `https://checkout.klyr.io?${new URLSearchParams({
  merchant_id: 'YOUR_MERCHANT_ID',
  amount: '100.00',
  currency: 'USD',
  return_url: 'https://yoursite.com/success',
  cancel_url: 'https://yoursite.com/cancel'
})}`;

window.location.href = checkoutUrl;
```

---

## Detailed Integration

### Step 1: Create Payment Intent (Backend)

```javascript
// Node.js example
const Klyr = require('@klyr/sdk');
const klyr = new Klyr({ apiKey: process.env.KLYR_API_KEY });

app.post('/create-payment', async (req, res) => {
  const { amount, customerId } = req.body;
  
  const payment = await klyr.payments.create({
    amount: amount,
    currency: 'USDC',
    customerId: customerId,
    description: 'Product purchase',
    metadata: {
      orderId: req.body.orderId
    }
  });
  
  res.json({ paymentId: payment.id });
});
```

### Step 2: Display Checkout (Frontend)

```javascript
// Fetch payment intent from your backend
const response = await fetch('/create-payment', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ amount: '100.00', customerId: 'cus_123' })
});

const { paymentId } = await response.json();

// Open checkout
Klyr.checkout.open({
  merchantId: 'YOUR_MERCHANT_ID',
  paymentId: paymentId,
  onSuccess: (paymentId, txHash) => {
    // Verify payment on your backend
    verifyPayment(paymentId);
  }
});
```

### Step 3: Handle Webhooks (Backend)

```javascript
const crypto = require('crypto');

app.post('/webhooks/klyr', (req, res) => {
  // Verify webhook signature
  const signature = req.headers['x-klyr-signature'];
  const payload = JSON.stringify(req.body);
  
  const expectedSignature = crypto
    .createHmac('sha256', process.env.KLYR_WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');
  
  if (signature !== expectedSignature) {
    return res.status(401).send('Invalid signature');
  }
  
  const event = req.body;
  
  // Handle event
  switch (event.type) {
    case 'payment.succeeded':
      // Fulfill order
      fulfillOrder(event.data.metadata.orderId);
      break;
      
    case 'payment.failed':
      // Notify customer
      notifyPaymentFailed(event.data.customer_email);
      break;
  }
  
  res.json({ received: true });
});
```

---

## Platform-Specific Guides

### Next.js Integration

```tsx
// pages/checkout.tsx
import { KlyrEmbeddedCheckout } from '@klyr/sdk/react';
import { useRouter } from 'next/router';

export default function CheckoutPage() {
  const router = useRouter();
  
  return (
    <div className="container mx-auto py-12">
      <KlyrEmbeddedCheckout
        merchantId={process.env.NEXT_PUBLIC_KLYR_MERCHANT_ID!}
        amount="100.00"
        currency="USD"
        onSuccess={(paymentId) => {
          router.push(`/success?payment_id=${paymentId}`);
        }}
      />
    </div>
  );
}
```

### WordPress Integration

```php
<?php
// Add to functions.php

function klyr_checkout_button($atts) {
    $atts = shortcode_atts([
        'amount' => '100.00',
        'description' => 'Purchase',
    ], $atts);
    
    return sprintf(
        '<button onclick="openKlyrCheckout(\'%s\', \'%s\')">Pay with Crypto</button>',
        esc_js($atts['amount']),
        esc_js($atts['description'])
    );
}
add_shortcode('klyr_checkout', 'klyr_checkout_button');

// Add to footer
function klyr_checkout_script() {
    ?>
    <script src="https://js.klyr.io/v1/checkout.js"></script>
    <script>
    function openKlyrCheckout(amount, description) {
        Klyr.checkout.open({
            merchantId: '<?php echo get_option('klyr_merchant_id'); ?>',
            amount: amount,
            currency: 'USD',
            description: description,
            onSuccess: function(paymentId) {
                window.location.href = '/success?payment_id=' + paymentId;
            }
        });
    }
    </script>
    <?php
}
add_action('wp_footer', 'klyr_checkout_script');
?>
```

Usage: `[klyr_checkout amount="50.00" description="Donation"]`

### Shopify Integration

```liquid
<!-- Add to product page template -->
<button id="klyr-pay-button" class="btn">Pay with Crypto</button>

<script src="https://js.klyr.io/v1/checkout.js"></script>
<script>
document.getElementById('klyr-pay-button').addEventListener('click', function() {
    Klyr.checkout.open({
        merchantId: '{{ settings.klyr_merchant_id }}',
        amount: '{{ product.price | money_without_currency }}',
        currency: '{{ shop.currency }}',
        description: '{{ product.title }}',
        metadata: {
            product_id: '{{ product.id }}',
            variant_id: '{{ product.selected_or_first_available_variant.id }}'
        },
        onSuccess: function(paymentId, txHash) {
            // Create order via Shopify API
            fetch('/cart/add.js', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: [{
                        id: {{ product.selected_or_first_available_variant.id }},
                        quantity: 1
                    }],
                    attributes: {
                        klyr_payment_id: paymentId,
                        klyr_tx_hash: txHash
                    }
                })
            }).then(() => {
                window.location.href = '/checkout';
            });
        }
    });
});
</script>
```

---

## Testing

### Test Mode

Use test API keys for development:
- Merchant ID: `test_mer_...`
- API Key: `sk_test_...`

### Test Wallets

Use these test wallet addresses:
- Solana: `DevnetWallet...` (Devnet)
- Base: `0xTest...` (Testnet)

### Test Cards

No test cards needed - use actual crypto wallets on testnets!

---

## Go Live Checklist

- [ ] Switch to production API keys
- [ ] Configure webhook endpoint
- [ ] Test payment flow end-to-end
- [ ] Set up error monitoring
- [ ] Configure email notifications
- [ ] Add terms of service link
- [ ] Test on mobile devices
- [ ] Review security settings

---

## Support

- **Documentation**: https://docs.klyr.io
- **API Reference**: https://docs.klyr.io/api
- **Discord**: https://discord.gg/klyr
- **Email**: support@klyr.io

