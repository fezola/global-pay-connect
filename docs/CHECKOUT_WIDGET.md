# Klyr Checkout Widget Documentation

Complete guide for integrating Klyr's crypto payment checkout into your application.

## Table of Contents

1. [Overview](#overview)
2. [Integration Methods](#integration-methods)
3. [JavaScript SDK](#javascript-sdk)
4. [React Components](#react-components)
5. [Hosted Checkout](#hosted-checkout)
6. [Payment Flow](#payment-flow)
7. [Customization](#customization)
8. [Examples](#examples)

---

## Overview

Klyr Checkout provides a complete payment experience for accepting crypto payments. Similar to Stripe Checkout, it handles:

- ✅ Wallet selection (Solana USDC/USDT, Base USDC/USDT)
- ✅ Wallet connection (Phantom, MetaMask, Coinbase Wallet)
- ✅ Balance checking
- ✅ Payment processing
- ✅ Transaction confirmation
- ✅ Receipt generation
- ✅ Email notifications

---

## Integration Methods

### 1. JavaScript SDK (Recommended)
Embed checkout with a simple script tag - works with any website.

### 2. React Components
Native React components for React/Next.js applications.

### 3. Hosted Checkout Page
Redirect users to a Klyr-hosted checkout page.

### 4. Embedded Widget
Embed the checkout directly in your page.

---

## JavaScript SDK

### Installation

```html
<!-- Add to your HTML -->
<script src="https://js.klyr.io/v1/checkout.js"></script>
```

### Basic Usage

```html
<button id="pay-button">Pay with Klyr</button>

<script>
  document.getElementById('pay-button').addEventListener('click', function() {
    Klyr.checkout.open({
      merchantId: 'your_merchant_id',
      amount: '100.00',
      currency: 'USD',
      description: 'Premium Plan - Monthly',
      customerEmail: 'customer@example.com',
      onSuccess: function(paymentId, txHash) {
        console.log('Payment successful!', paymentId, txHash);
        // Redirect to success page or show confirmation
        window.location.href = '/success?payment_id=' + paymentId;
      },
      onClose: function() {
        console.log('Checkout closed');
      },
      onError: function(error) {
        console.error('Payment failed:', error);
      }
    });
  });
</script>
```

### Configuration Options

```javascript
{
  // Required
  merchantId: 'mer_abc123',        // Your merchant ID
  amount: '100.00',                // Payment amount
  
  // Optional
  currency: 'USD',                 // Display currency (default: USD)
  description: 'Order #12345',     // Payment description
  customerEmail: 'user@example.com', // Customer email for receipt
  metadata: {                      // Custom metadata
    orderId: '12345',
    customerId: 'cus_xyz'
  },
  
  // UI Customization
  theme: 'auto',                   // 'light', 'dark', or 'auto'
  primaryColor: '#0066FF',         // Brand color
  showBranding: true,              // Show "Powered by Klyr"
  
  // Behavior
  mode: 'modal',                   // 'modal', 'redirect', or 'embedded'
  
  // Callbacks
  onSuccess: (paymentId, txHash) => {},
  onClose: () => {},
  onError: (error) => {}
}
```

---

## React Components

### Installation

```bash
npm install @klyr/sdk
# or
yarn add @klyr/sdk
```

### Checkout Button

```tsx
import { KlyrCheckoutButton } from '@klyr/sdk/react';

function App() {
  return (
    <KlyrCheckoutButton
      merchantId="your_merchant_id"
      amount="100.00"
      currency="USD"
      description="Premium Plan"
      onSuccess={(paymentId, txHash) => {
        console.log('Payment successful!', paymentId);
      }}
    >
      Pay with Crypto
    </KlyrCheckoutButton>
  );
}
```

### Embedded Checkout

```tsx
import { KlyrEmbeddedCheckout } from '@klyr/sdk/react';

function CheckoutPage() {
  return (
    <div className="checkout-container">
      <h1>Complete Your Payment</h1>
      <KlyrEmbeddedCheckout
        merchantId="your_merchant_id"
        amount="100.00"
        currency="USD"
        onSuccess={(paymentId, txHash) => {
          // Handle success
        }}
      />
    </div>
  );
}
```

### useKlyrCheckout Hook

```tsx
import { useKlyrCheckout } from '@klyr/sdk/react';

function ProductPage() {
  const { openCheckout } = useKlyrCheckout();

  const handlePurchase = () => {
    openCheckout({
      merchantId: 'your_merchant_id',
      amount: '99.99',
      description: 'Product Purchase',
      onSuccess: (paymentId, txHash) => {
        console.log('Payment complete!');
      }
    });
  };

  return (
    <button onClick={handlePurchase}>
      Buy Now
    </button>
  );
}
```

---

## Hosted Checkout

Redirect users to a Klyr-hosted checkout page.

### Create Checkout URL

```javascript
const checkoutUrl = `https://checkout.klyr.io?` + new URLSearchParams({
  merchant_id: 'your_merchant_id',
  amount: '100.00',
  currency: 'USD',
  description: 'Order #12345',
  customer_email: 'customer@example.com',
  return_url: 'https://yoursite.com/success',
  cancel_url: 'https://yoursite.com/cancel'
});

// Redirect user
window.location.href = checkoutUrl;
```

### Handle Return

```javascript
// On your success page
const urlParams = new URLSearchParams(window.location.search);
const paymentId = urlParams.get('payment_id');
const txHash = urlParams.get('tx_hash');
const status = urlParams.get('status');

if (status === 'success') {
  // Payment successful
  console.log('Payment ID:', paymentId);
  console.log('Transaction Hash:', txHash);
}
```

---

## Payment Flow

1. **User clicks "Pay with Klyr"**
2. **Checkout modal opens**
3. **User selects payment method** (Solana USDC, Base USDC, etc.)
4. **User connects wallet** (Phantom, MetaMask, etc.)
5. **System checks wallet balance**
6. **User reviews payment details** (amount, fees, total)
7. **User approves transaction** in wallet
8. **Transaction submitted** to blockchain
9. **Confirmation tracking** (real-time status updates)
10. **Receipt displayed** with transaction details
11. **Webhook sent** to merchant
12. **User redirected** back to merchant site

---

## Customization

### Theme

```javascript
{
  theme: 'dark',  // 'light', 'dark', or 'auto'
}
```

### Brand Colors

```javascript
{
  primaryColor: '#FF6B6B',  // Your brand color
}
```

### Custom Styling (React)

```tsx
<KlyrCheckoutButton
  className="custom-button-class"
  merchantId="..."
  amount="100.00"
>
  <span>🚀 Pay Now</span>
</KlyrCheckoutButton>
```

---

## Examples

See the [examples directory](../sdk/examples/) for complete integration examples:

- `basic-checkout.html` - Vanilla JavaScript
- `react-checkout.tsx` - React component
- `nextjs-checkout.tsx` - Next.js integration
- `embedded-checkout.html` - Embedded widget

---

## Support

- **Documentation**: https://docs.klyr.io
- **API Reference**: https://docs.klyr.io/api
- **Support**: support@klyr.io
- **Discord**: https://discord.gg/klyr

