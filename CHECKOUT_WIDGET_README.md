# Klyr Checkout Widget 🚀

A complete, embeddable crypto payment checkout widget for accepting USDC/USDT payments on Solana and Base networks.

## Features

✅ **Multi-Chain Support**
- Solana (USDC, USDT)
- Base (USDC, USDT)
- More chains coming soon

✅ **Wallet Integration**
- Phantom (Solana)
- Solflare (Solana)
- MetaMask (EVM)
- Coinbase Wallet (EVM)
- WalletConnect support

✅ **Complete Payment Flow**
- Payment method selection
- Wallet connection
- Balance checking
- Transaction submission
- Real-time confirmation tracking
- Receipt generation

✅ **Developer Friendly**
- JavaScript SDK (works anywhere)
- React components
- Hosted checkout page
- Embedded widget option
- TypeScript support

✅ **Customizable**
- Light/dark themes
- Custom branding colors
- Configurable UI elements
- Metadata support

✅ **Production Ready**
- Webhook notifications
- Error handling
- Mobile responsive
- Security best practices

---

## Quick Start

### 1. JavaScript SDK (Any Website)

```html
<script src="https://js.klyr.io/v1/checkout.js"></script>

<button onclick="openCheckout()">Pay with Crypto</button>

<script>
function openCheckout() {
  Klyr.checkout.open({
    merchantId: 'your_merchant_id',
    amount: '100.00',
    currency: 'USD',
    onSuccess: (paymentId, txHash) => {
      console.log('Payment successful!', paymentId);
    }
  });
}
</script>
```

### 2. React Component

```bash
npm install @klyr/sdk
```

```tsx
import { KlyrCheckoutButton } from '@klyr/sdk/react';

function App() {
  return (
    <KlyrCheckoutButton
      merchantId="your_merchant_id"
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

### 3. Hosted Checkout

```javascript
window.location.href = `https://checkout.klyr.io?merchant_id=YOUR_ID&amount=100.00`;
```

---

## Documentation

- **[Integration Guide](docs/INTEGRATION_GUIDE.md)** - Complete setup instructions
- **[Checkout Widget Docs](docs/CHECKOUT_WIDGET.md)** - Widget configuration & customization
- **[Recurring Payments](docs/RECURRING_PAYMENTS.md)** - Subscription implementation
- **[API Reference](docs/API_REFERENCE.md)** - Complete API documentation

---

## Examples

Check out the [examples directory](sdk/examples/) for complete integration examples:

- `basic-checkout.html` - Vanilla JavaScript integration
- `react-checkout.tsx` - React component examples
- `nextjs-checkout.tsx` - Next.js integration
- `embedded-checkout.html` - Embedded widget

---

## File Structure

```
├── src/
│   ├── components/
│   │   └── checkout/
│   │       ├── CheckoutWidget.tsx      # Main widget component
│   │       ├── WalletSelector.tsx      # Payment method selection
│   │       ├── WalletConnect.tsx       # Wallet connection
│   │       ├── PaymentDetails.tsx      # Payment review
│   │       ├── PaymentStatus.tsx       # Transaction status
│   │       └── PaymentReceipt.tsx      # Success receipt
│   ├── lib/
│   │   └── walletProviders.ts          # Wallet integration utilities
│   └── pages/
│       └── Checkout.tsx                # Hosted checkout page
├── sdk/
│   ├── src/
│   │   ├── checkout.ts                 # JavaScript SDK
│   │   ├── react.tsx                   # React components
│   │   └── index.ts                    # Main SDK export
│   └── examples/                       # Integration examples
└── docs/                               # Documentation
```

---

## Configuration Options

```typescript
{
  // Required
  merchantId: string;              // Your merchant ID
  amount: string;                  // Payment amount
  
  // Optional
  currency?: string;               // Display currency (default: 'USD')
  description?: string;            // Payment description
  customerEmail?: string;          // Customer email for receipt
  metadata?: Record<string, any>;  // Custom metadata
  
  // UI Customization
  theme?: 'light' | 'dark' | 'auto';
  primaryColor?: string;           // Brand color
  showBranding?: boolean;          // Show "Powered by Klyr"
  
  // Behavior
  mode?: 'modal' | 'redirect' | 'embedded';
  
  // Callbacks
  onSuccess?: (paymentId: string, txHash: string) => void;
  onClose?: () => void;
  onError?: (error: Error) => void;
  
  // Subscriptions
  subscription?: {
    enabled: boolean;
    interval: 'day' | 'week' | 'month' | 'year';
    intervalCount: number;
    trialDays?: number;
  };
}
```

---

## Payment Flow

```
1. User clicks "Pay with Klyr"
   ↓
2. Checkout modal opens
   ↓
3. User selects payment method
   (Solana USDC, Base USDC, etc.)
   ↓
4. User connects wallet
   (Phantom, MetaMask, etc.)
   ↓
5. System checks wallet balance
   ↓
6. User reviews payment details
   (amount, fees, total)
   ↓
7. User approves transaction in wallet
   ↓
8. Transaction submitted to blockchain
   ↓
9. Real-time confirmation tracking
   ↓
10. Receipt displayed
    ↓
11. Webhook sent to merchant
    ↓
12. User redirected to success page
```

---

## Supported Wallets

### Solana
- ✅ Phantom
- ✅ Solflare
- ✅ Backpack
- 🔜 Ledger

### EVM (Base, Ethereum)
- ✅ MetaMask
- ✅ Coinbase Wallet
- ✅ WalletConnect
- 🔜 Ledger

---

## Webhook Events

```javascript
{
  "payment.created": "Payment intent created",
  "payment.processing": "Payment submitted to blockchain",
  "payment.succeeded": "Payment confirmed",
  "payment.failed": "Payment failed",
  "subscription.created": "Subscription created",
  "subscription.payment_succeeded": "Recurring payment successful",
  "subscription.cancelled": "Subscription cancelled"
}
```

---

## Security

- ✅ Client-side encryption
- ✅ Webhook signature verification
- ✅ Rate limiting
- ✅ CORS protection
- ✅ No private keys stored
- ✅ Non-custodial (user controls funds)

---

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## Support

- **Documentation**: https://docs.klyr.io
- **Discord**: https://discord.gg/klyr
- **Email**: support@klyr.io
- **GitHub**: https://github.com/klyr/sdk

---

## License

MIT License - see [LICENSE](LICENSE) for details

---

Built with ❤️ by the Klyr team

