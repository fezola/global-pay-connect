# Klyr Checkout - Quick Reference Card

## 🚀 Quick Start (Copy & Paste)

### JavaScript (Any Website)
```html
<script src="https://js.klyr.io/v1/checkout.js"></script>
<button onclick="Klyr.checkout.open({
  merchantId: 'YOUR_MERCHANT_ID',
  amount: '100.00',
  onSuccess: (id, tx) => console.log('Success!', id)
})">Pay with Crypto</button>
```

### React
```bash
npm install @klyr/sdk
```
```tsx
import { KlyrCheckoutButton } from '@klyr/sdk/react';

<KlyrCheckoutButton
  merchantId="YOUR_MERCHANT_ID"
  amount="100.00"
  onSuccess={(id) => console.log('Success!', id)}
>
  Pay with Crypto
</KlyrCheckoutButton>
```

### Redirect
```javascript
window.location.href = 'https://checkout.klyr.io?' + new URLSearchParams({
  merchant_id: 'YOUR_MERCHANT_ID',
  amount: '100.00',
  return_url: 'https://yoursite.com/success'
});
```

---

## 📋 Configuration Options

```javascript
{
  // Required
  merchantId: 'mer_xxx',
  amount: '100.00',
  
  // Optional
  currency: 'USD',
  description: 'Product purchase',
  customerEmail: 'user@example.com',
  metadata: { orderId: '123' },
  
  // UI
  theme: 'auto',              // 'light' | 'dark' | 'auto'
  primaryColor: '#0066FF',
  showBranding: true,
  
  // Mode
  mode: 'modal',              // 'modal' | 'redirect' | 'embedded'
  
  // Callbacks
  onSuccess: (paymentId, txHash) => {},
  onClose: () => {},
  onError: (error) => {}
}
```

---

## 🔗 Supported Payment Methods

| Network | Token | Wallet |
|---------|-------|--------|
| Solana | USDC | Phantom, Solflare |
| Solana | USDT | Phantom, Solflare |
| Base | USDC | MetaMask, Coinbase Wallet |
| Base | USDT | MetaMask, Coinbase Wallet |

---

## 🔄 Subscriptions

```javascript
Klyr.checkout.open({
  merchantId: 'YOUR_MERCHANT_ID',
  amount: '29.99',
  subscription: {
    enabled: true,
    interval: 'month',        // 'day' | 'week' | 'month' | 'year'
    intervalCount: 1,
    trialDays: 7              // Optional
  }
});
```

---

## 🪝 Webhook Events

```javascript
// POST to your webhook URL
{
  "type": "payment.succeeded",
  "data": {
    "id": "pi_xxx",
    "amount": 100.00,
    "currency": "USDC",
    "tx_hash": "xxx",
    "metadata": { ... }
  }
}
```

**Event Types:**
- `payment.created`
- `payment.processing`
- `payment.succeeded`
- `payment.failed`
- `subscription.created`
- `subscription.payment_succeeded`
- `subscription.cancelled`

---

## 🎨 React Components

### Checkout Button
```tsx
import { KlyrCheckoutButton } from '@klyr/sdk/react';

<KlyrCheckoutButton
  merchantId="mer_xxx"
  amount="100.00"
  className="custom-class"
>
  Custom Button Text
</KlyrCheckoutButton>
```

### Embedded Checkout
```tsx
import { KlyrEmbeddedCheckout } from '@klyr/sdk/react';

<KlyrEmbeddedCheckout
  merchantId="mer_xxx"
  amount="100.00"
  style={{ minHeight: '600px' }}
/>
```

### useKlyrCheckout Hook
```tsx
import { useKlyrCheckout } from '@klyr/sdk/react';

function MyComponent() {
  const { openCheckout } = useKlyrCheckout();
  
  return (
    <button onClick={() => openCheckout({
      merchantId: 'mer_xxx',
      amount: '100.00'
    })}>
      Pay Now
    </button>
  );
}
```

---

## 🔐 Backend Integration

### Node.js
```javascript
const Klyr = require('@klyr/sdk');
const klyr = new Klyr({ apiKey: process.env.KLYR_API_KEY });

// Create payment
const payment = await klyr.payments.create({
  amount: '100.00',
  currency: 'USDC',
  description: 'Order #123'
});

// Retrieve payment
const payment = await klyr.payments.retrieve('pi_xxx');

// List payments
const payments = await klyr.payments.list({ limit: 10 });
```

### Verify Webhook
```javascript
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return signature === expected;
}
```

---

## 🌐 Platform Examples

### Next.js
```tsx
// pages/checkout.tsx
import { KlyrEmbeddedCheckout } from '@klyr/sdk/react';

export default function Checkout() {
  return <KlyrEmbeddedCheckout merchantId="..." amount="100.00" />;
}
```

### WordPress
```php
[klyr_checkout amount="50.00" description="Donation"]
```

### Shopify
```liquid
<button onclick="Klyr.checkout.open({
  merchantId: '{{ settings.klyr_merchant_id }}',
  amount: '{{ product.price | money_without_currency }}'
})">Pay with Crypto</button>
```

---

## 📱 Mobile Support

✅ iOS Safari  
✅ Chrome Mobile  
✅ In-app browsers  
✅ Responsive design  
✅ Touch-optimized  

---

## 🐛 Debugging

### Enable Debug Mode
```javascript
Klyr.checkout.open({
  merchantId: 'mer_xxx',
  amount: '100.00',
  debug: true  // Logs to console
});
```

### Common Issues

**Wallet not detected:**
```javascript
// Check if wallet is installed
if (!window.phantom?.solana) {
  alert('Please install Phantom wallet');
}
```

**Insufficient balance:**
```javascript
onError: (error) => {
  if (error.code === 'INSUFFICIENT_BALANCE') {
    alert('Please add funds to your wallet');
  }
}
```

---

## 📚 Resources

- **Docs**: https://docs.klyr.io
- **Examples**: `sdk/examples/`
- **Demo**: `/checkout-demo` page
- **Support**: support@klyr.io

---

## ⚡ Performance Tips

1. **Preload SDK**
   ```html
   <link rel="preload" href="https://js.klyr.io/v1/checkout.js" as="script">
   ```

2. **Lazy Load**
   ```javascript
   // Load SDK only when needed
   const loadKlyr = () => {
     const script = document.createElement('script');
     script.src = 'https://js.klyr.io/v1/checkout.js';
     document.head.appendChild(script);
   };
   ```

3. **Cache API Responses**
   ```javascript
   // Cache payment intents
   const cachedIntent = localStorage.getItem('payment_intent');
   ```

---

## 🔒 Security Checklist

- [ ] Use HTTPS only
- [ ] Verify webhook signatures
- [ ] Never expose API keys client-side
- [ ] Validate amounts server-side
- [ ] Implement rate limiting
- [ ] Log all transactions
- [ ] Monitor for fraud

---

**Need help? Check the full docs or contact support@klyr.io**

