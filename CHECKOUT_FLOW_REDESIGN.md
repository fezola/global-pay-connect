# Checkout Flow Redesign Plan

## 🎯 New Multi-Step Flow

### Current Flow (Single Page)
```
┌─────────────────────────────────┐
│  Select Currency + Network      │
│  Connect Wallet                 │
│  Review & Pay                   │
│  All on one page ❌             │
└─────────────────────────────────┘
```

### New Flow (Multi-Step)
```
Step 1: Select Currency
┌─────────────────────────────────┐
│  💰 Choose Currency             │
│  ○ USDC                         │
│  ○ USDT                         │
│  ○ SOL                          │
│  ○ ETH                          │
│  ○ MATIC                        │
└─────────────────────────────────┘
         ↓
Step 2: Select Network
┌─────────────────────────────────┐
│  🌐 Choose Network for USDC     │
│  ○ Solana (Fast, Low fees)     │
│  ○ Base (L2, Low fees)          │
│  ○ Ethereum (Most secure)       │
│  ○ Polygon (Very low fees)      │
└─────────────────────────────────┘
         ↓
Step 3: Review Amount & Fees
┌─────────────────────────────────┐
│  📊 Payment Summary             │
│  Amount: $100.00 USD            │
│  = ₦155,000 NGN                 │
│                                 │
│  Network Fee: ~$0.50            │
│  Tax (if applicable): $5.00     │
│  Total: $105.50 = ₦163,525      │
└─────────────────────────────────┘
         ↓
Step 4: Connect Wallet
┌─────────────────────────────────┐
│  👛 Connect Your Wallet         │
│  [Phantom] [MetaMask] [Coinbase]│
└─────────────────────────────────┘
         ↓
Step 5: Confirm & Pay
┌─────────────────────────────────┐
│  ✅ Confirm Payment             │
│  You will pay: 100.50 USDC      │
│  From: 0x1234...                │
│  Balance: 500.00 USDC           │
│  [Approve Transaction]          │
└─────────────────────────────────┘
```

---

## 🔧 Required Changes

### 1. Install Wallet Adapters (Proper Integration)

**For Solana:**
```bash
npm install @solana/wallet-adapter-react @solana/wallet-adapter-react-ui @solana/wallet-adapter-wallets @solana/wallet-adapter-base
```

**For EVM (Ethereum, Base, Polygon):**
```bash
npm install wagmi viem @rainbow-me/rainbowkit
```

### 2. Create Step Components

**Files to Create:**
- `src/components/checkout/steps/CurrencySelection.tsx`
- `src/components/checkout/steps/NetworkSelection.tsx`
- `src/components/checkout/steps/AmountReview.tsx`
- `src/components/checkout/steps/WalletConnection.tsx`
- `src/components/checkout/steps/PaymentConfirmation.tsx`

### 3. Add Currency Conversion

**Install:**
```bash
npm install axios
```

**Create:**
- `src/lib/currencyConversion.ts` - USD to NGN conversion
- `src/lib/taxCalculation.ts` - Tax calculation for Nigeria

### 4. State Management

**Install:**
```bash
npm install zustand
```

**Create:**
- `src/store/checkoutStore.ts` - Manage checkout state across steps

---

## 📋 Implementation Plan

### Phase 1: Install Dependencies ✅
- [ ] Install Solana wallet adapters
- [ ] Install Wagmi/RainbowKit for EVM
- [ ] Install currency conversion library
- [ ] Install state management (Zustand)

### Phase 2: Create Step Components
- [ ] CurrencySelection component
- [ ] NetworkSelection component
- [ ] AmountReview component (with NGN conversion)
- [ ] WalletConnection component (proper adapters)
- [ ] PaymentConfirmation component

### Phase 3: Add Business Logic
- [ ] Currency conversion (USD → NGN)
- [ ] Tax calculation (Nigeria-specific)
- [ ] Network fee estimation
- [ ] Total calculation

### Phase 4: State Management
- [ ] Create checkout store
- [ ] Step navigation
- [ ] Data persistence across steps

### Phase 5: Integration
- [ ] Update CheckoutWidget to use steps
- [ ] Add progress indicator
- [ ] Add back navigation
- [ ] Add step validation

---

## 💰 Currency Conversion & Fees

### Example Calculation (Nigeria)

```typescript
// Input
const amount = 100; // USD
const currency = 'USDC';
const network = 'Polygon';

// Conversion
const exchangeRate = 1550; // 1 USD = 1550 NGN
const amountNGN = amount * exchangeRate; // 155,000 NGN

// Fees
const networkFee = 0.50; // USD (varies by network)
const taxRate = 0.05; // 5% (if applicable)
const tax = amount * taxRate; // 5.00 USD

// Total
const totalUSD = amount + networkFee + tax; // 105.50 USD
const totalNGN = totalUSD * exchangeRate; // 163,525 NGN
const totalCrypto = totalUSD; // 105.50 USDC

// Display
"You will pay: 105.50 USDC (₦163,525)"
```

---

## 🎨 UI/UX Improvements

### Progress Indicator
```
[1] Currency → [2] Network → [3] Review → [4] Wallet → [5] Pay
 ✓              ✓             ●            ○            ○
```

### Step Navigation
```
[← Back]                    [Continue →]
```

### Amount Display
```
┌─────────────────────────────────┐
│  Amount: $100.00 USD            │
│  ≈ ₦155,000 NGN                 │
│                                 │
│  Network Fee: $0.50             │
│  Tax: $5.00                     │
│  ─────────────────────          │
│  Total: $105.50                 │
│  ≈ ₦163,525 NGN                 │
│                                 │
│  You will pay: 105.50 USDC      │
└─────────────────────────────────┘
```

---

## 🔌 Proper Wallet Integration

### Solana Wallet Adapter

```tsx
import { WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';

const wallets = [new PhantomWalletAdapter()];

<WalletProvider wallets={wallets}>
  <WalletModalProvider>
    <YourApp />
  </WalletModalProvider>
</WalletProvider>
```

### Wagmi (EVM) Integration

```tsx
import { WagmiConfig, createConfig } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';

const config = createConfig({
  // ... configuration
});

<WagmiConfig config={config}>
  <RainbowKitProvider>
    <YourApp />
  </RainbowKitProvider>
</WagmiConfig>
```

---

## 📊 Data Flow

```typescript
// Checkout Store
interface CheckoutState {
  // Step 1
  selectedCurrency: TokenType | null;
  
  // Step 2
  selectedNetwork: ChainType | null;
  
  // Step 3
  amount: number;
  amountNGN: number;
  networkFee: number;
  tax: number;
  total: number;
  
  // Step 4
  wallet: WalletConnection | null;
  
  // Step 5
  confirmed: boolean;
  
  // Navigation
  currentStep: number;
  goToStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
}
```

---

## ✅ Benefits of New Flow

1. **Clearer UX** - One decision at a time
2. **Better Mobile** - Less scrolling, focused steps
3. **Proper Wallets** - Real wallet adapters, not mocks
4. **Local Currency** - Show amounts in NGN
5. **Tax Transparency** - Clear fee breakdown
6. **Professional** - Matches payment gateway standards

---

Ready to implement this redesign?

