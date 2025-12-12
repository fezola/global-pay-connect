# Klyr - Blockchain Payment Gateway

A developer-first payment platform for accepting USDC/USDT on Solana blockchain.

## 🚀 Features

- ✅ **Checkout Widget/SDK** - Embeddable payment UI like Stripe Checkout
- ✅ **Multi-Chain Support** - Solana & Base networks (USDC/USDT)
- ✅ **Wallet Integration** - Phantom, MetaMask, Coinbase Wallet
- ✅ **Real Blockchain Payments** - Accept USDC/USDT on Solana mainnet/devnet
- ✅ **Payment Intents API** - Create and track payment requests
- ✅ **Automatic Settlement** - Blockchain monitoring and auto-settlement
- ✅ **Webhook System** - Real-time payment notifications with retry logic
- ✅ **Recurring Payments** - Subscription and auto-renew support
- ✅ **QR Code Payments** - Solana Pay compatible QR codes
- ✅ **Merchant Dashboard** - Complete payment management UI
- ✅ **KYB Verification** - Business verification and compliance
- ✅ **Real-time Updates** - Live payment status via Supabase subscriptions

## 📚 Documentation

### 🚀 Quick Start
- **[FINAL_SUMMARY.md](./FINAL_SUMMARY.md)** - ⭐ Start here! Complete overview
- **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** - How to test with real wallets
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Common issues & solutions

### Checkout Widget
- [Checkout Widget README](./CHECKOUT_WIDGET_README.md) - Quick start guide
- [Integration Guide](./docs/INTEGRATION_GUIDE.md) - Complete integration instructions
- [Checkout Widget Docs](./docs/CHECKOUT_WIDGET.md) - Full widget documentation
- [Blockchain Integration](./BLOCKCHAIN_INTEGRATION_COMPLETE.md) - Technical implementation
- [Recurring Payments](./docs/RECURRING_PAYMENTS.md) - Subscription implementation
- [Quick Reference](./QUICK_REFERENCE.md) - Developer cheat sheet
- [Access Guide](./CHECKOUT_ACCESS_GUIDE.md) - How to access and test

### Platform
- [Payment Flow](./PAYMENT_FLOW.md) - Complete payment flow documentation
- [Deployment Guide](./DEPLOYMENT.md) - Step-by-step deployment instructions
- [Cron Setup](./supabase/functions/_cron/README.md) - Background job configuration

## 🏗️ Architecture

```
Frontend (React + TypeScript)
    ↓
Supabase Edge Functions
    ↓
Solana Blockchain (RPC)
    ↓
Database (PostgreSQL)
    ↓
Webhooks (Merchant Servers)
```

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Vite, shadcn/ui, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Blockchain**: Solana Web3.js, SPL Token
- **State**: Zustand
- **Auth**: Supabase Auth

## 🚦 Quick Start

### Try the Checkout Widget Demo

```bash
npm install
npm run dev
```

Then navigate to: `http://localhost:5173/checkout-demo`

Or login and click **"Checkout Demo"** in the sidebar.

### Integrate Checkout Widget

**JavaScript (Any Website):**
```html
<script src="https://js.klyr.io/v1/checkout.js"></script>
<button onclick="Klyr.checkout.open({
  merchantId: 'your_merchant_id',
  amount: '100.00',
  onSuccess: (id) => console.log('Success!', id)
})">Pay with Crypto</button>
```

**React:**
```bash
npm install @klyr/sdk
```
```tsx
import { KlyrCheckoutButton } from '@klyr/sdk/react';

<KlyrCheckoutButton
  merchantId="your_merchant_id"
  amount="100.00"
  onSuccess={(id) => console.log('Success!', id)}
>
  Pay with Crypto
</KlyrCheckoutButton>
```

See [Integration Guide](./docs/INTEGRATION_GUIDE.md) for more options.

### Development Setup

#### Prerequisites

- Node.js 18+
- Supabase account
- Supabase CLI: `npm install -g supabase`

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/klyr.git
cd klyr

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Start development server
npm run dev
```

### Database Setup

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_ID

# Run migrations
supabase db push
```

### Deploy Edge Functions

```bash
# Deploy all payment functions
supabase functions deploy create-payment-intent
supabase functions deploy monitor-blockchain
supabase functions deploy settle-payment
supabase functions deploy deliver-webhooks
```

### Setup Cron Jobs

See [Cron Setup Guide](./supabase/functions/_cron/README.md) for configuring background jobs.

## 💳 Payment Flow

1. **Create Payment Intent** - Merchant creates payment request via API
2. **Customer Pays** - Customer sends USDC to payment address
3. **Blockchain Monitor** - System detects incoming transaction (30s polling)
4. **Settlement** - Transaction confirmed and balance updated (1min polling)
5. **Webhook Delivery** - Merchant notified via webhook (1min polling)

See [PAYMENT_FLOW.md](./PAYMENT_FLOW.md) for detailed documentation.

## 🧪 Testing

### Run Test Script

```bash
npm install -g tsx
tsx scripts/test-payment-flow.ts
```

### Manual Testing

1. Get devnet USDC: https://spl-token-faucet.com/
2. Create payment intent in dashboard
3. Send USDC to payment address
4. Wait for confirmation (~30 seconds)
5. Verify balance update

## 📦 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment instructions.

**Quick Deploy**:
```bash
# Build frontend
npm run build

# Deploy to Vercel
vercel --prod
```

## 🔑 Environment Variables

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
```

## 📖 API Reference

### Create Payment Intent

```typescript
POST /functions/v1/create-payment-intent
Authorization: Bearer <user_token>

{
  "amount": "100.00",
  "currency": "USDC",
  "customer_email": "customer@example.com",
  "description": "Product purchase"
}
```

### Response

```json
{
  "id": "pi_abc123",
  "amount": "100.00",
  "currency": "USDC",
  "status": "pending",
  "payment_address": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
  "expires_at": "2024-01-01T12:30:00Z"
}
```

## 🔐 Security

- ✅ Row Level Security (RLS) enabled on all tables
- ✅ HMAC webhook signature verification
- ✅ JWT authentication for API endpoints
- ✅ Wallet ownership verification
- ✅ KYB compliance checks

## 🤝 Contributing

Contributions welcome! Please read our contributing guidelines first.

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- Documentation: See docs in this repo
- Issues: Create a GitHub issue
- Email: support@klyr.io
