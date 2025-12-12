# Klyr Checkout Components

React components for the Klyr crypto payment checkout widget.

## Components

### CheckoutWidget
Main orchestrator component that manages the entire checkout flow.

**Props:**
```typescript
{
  merchantId: string;
  merchantName: string;
  amount: string;
  currency: string;
  description?: string;
  metadata?: Record<string, any>;
  theme?: "light" | "dark" | "auto";
  primaryColor?: string;
  showBranding?: boolean;
  onSuccess?: (paymentId: string, txHash: string) => void;
  onClose?: () => void;
  onError?: (error: Error) => void;
  embedded?: boolean;
  apiKey?: string;
  baseUrl?: string;
}
```

**Usage:**
```tsx
import { CheckoutWidget } from '@/components/checkout/CheckoutWidget';

<CheckoutWidget
  merchantId="mer_123"
  merchantName="My Store"
  amount="100.00"
  currency="USD"
  onSuccess={(paymentId, txHash) => {
    console.log('Payment successful!', paymentId);
  }}
  onClose={() => console.log('Checkout closed')}
/>
```

### WalletSelector
Payment method selection component.

**Features:**
- Displays available payment options (Solana USDC/USDT, Base USDC/USDT)
- Shows popular payment methods
- Network information
- Benefits of crypto payments

### WalletConnect
Wallet connection interface.

**Features:**
- Automatic wallet detection
- Support for Phantom, MetaMask, Coinbase Wallet
- Download links for missing wallets
- Connection error handling

### PaymentDetails
Payment review and confirmation screen.

**Features:**
- Connected wallet display
- Balance checking
- Payment breakdown (amount, fees, total)
- Insufficient balance warnings
- Payment address display

### PaymentStatus
Real-time transaction status tracking.

**Features:**
- Processing animation
- Confirmation progress
- Transaction hash display
- Explorer links
- Progress steps visualization

### PaymentReceipt
Success receipt display.

**Features:**
- Payment confirmation
- Detailed receipt information
- Transaction hash with explorer link
- Download/email receipt options
- Merchant details

## Flow

```
WalletSelector → WalletConnect → PaymentDetails → PaymentStatus → PaymentReceipt
```

## Supported Wallets

### Solana
- Phantom
- Solflare
- Backpack

### EVM (Base)
- MetaMask
- Coinbase Wallet
- WalletConnect

## Supported Tokens

- Solana USDC
- Solana USDT
- Base USDC
- Base USDT

## Theming

All components support light/dark themes:

```tsx
<CheckoutWidget theme="dark" />  // Dark theme
<CheckoutWidget theme="light" /> // Light theme
<CheckoutWidget theme="auto" />  // System preference
```

## Customization

```tsx
<CheckoutWidget
  theme="dark"
  primaryColor="#0066FF"
  showBranding={false}
/>
```

## Error Handling

```tsx
<CheckoutWidget
  onError={(error) => {
    console.error('Payment error:', error);
    // Handle error (show notification, log, etc.)
  }}
/>
```

## Testing

1. Install a wallet (Phantom for Solana, MetaMask for Base)
2. Switch to testnet/devnet
3. Get test tokens from faucet
4. Test the checkout flow

## Development

```bash
# Run dev server
npm run dev

# Navigate to checkout demo
http://localhost:5173/checkout-demo
```

## Notes

- Components are mobile-responsive
- All wallet interactions are non-custodial
- No private keys are stored
- Transactions are submitted directly to blockchain
- Real-time status updates via polling

