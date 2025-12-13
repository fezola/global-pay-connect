# Non-Custodial Payout System

## Overview

Global Pay Connect (Klyr) uses a **non-custodial payout model** where merchants control their own funds and sign their own withdrawal transactions. This eliminates the need for hot wallets funded by the platform and provides better security and regulatory compliance.

---

## How It Works

### **Traditional (Custodial) Model** ❌
```
Customer pays → Platform's hot wallet → Platform sends to merchant
                     ↓
              Platform needs capital
              Platform holds funds
              Regulatory issues
```

### **Our (Non-Custodial) Model** ✅
```
Customer pays → Merchant's wallet → Merchant signs payout → Funds sent
                     ↓
              Merchant controls funds
              No platform capital needed
              No custody = No regulatory issues
```

---

## Payment Flow

### 1. **Customer Payment**
```typescript
// When customer pays
payment_address = merchant.business_wallets.address  // Merchant's wallet!
```

- Customer sends USDC/USDT directly to **merchant's verified wallet**
- Platform monitors the blockchain for the payment
- Platform updates merchant's balance in database
- **Funds never touch platform wallets**

### 2. **Merchant Requests Payout**
```typescript
POST /functions/v1/create-payout
{
  "amount": "100.00",
  "currency": "USDC",
  "destination_id": "dest_123",  // Merchant's payout destination
  "chain": "solana"
}
```

**What happens:**
- Platform checks merchant's balance
- Calculates fees (0.5% or $1 minimum)
- Creates payout record with status:
  - `pending` if amount > $1,000 (requires approval)
  - `awaiting_signature` if amount ≤ $1,000 (auto-approved)
- Generates unsigned transaction

### 3. **Transaction Generation**
```typescript
POST /functions/v1/generate-payout-transaction
{
  "payout_id": "payout_123"
}
```

**Backend generates:**
- **Solana**: Unsigned SPL token transfer transaction
- **EVM**: Unsigned ERC-20 transfer transaction parameters

**Transaction includes:**
- Source: Merchant's payment wallet (where customer funds are)
- Destination: Merchant's payout destination
- Amount: Net amount after fees
- Expiry: 2 minutes (Solana) or 30 minutes (EVM)

### 4. **Merchant Signs Transaction**

**Frontend (React):**
```typescript
// User clicks "Sign" button
const { signAndSubmit } = usePayoutSigning();
await signAndSubmit(signingData);
```

**For Solana (Phantom Wallet):**
```typescript
// Connect Phantom
await window.solana.connect();

// Verify correct wallet
if (walletAddress !== sourceWallet) {
  throw new Error('Wrong wallet connected');
}

// Sign transaction
const signedTx = await window.solana.signTransaction(transaction);
```

**For EVM (MetaMask):**
```typescript
// Request accounts
const accounts = await window.ethereum.request({ 
  method: 'eth_requestAccounts' 
});

// Verify correct wallet
if (accounts[0] !== sourceWallet) {
  throw new Error('Wrong wallet connected');
}

// Send transaction
const txHash = await window.ethereum.request({
  method: 'eth_sendTransaction',
  params: [txParams]
});
```

### 5. **Transaction Submission**
```typescript
POST /functions/v1/submit-signed-payout
{
  "payout_id": "payout_123",
  "signed_transaction": "base64_or_hex_signed_tx"
}
```

**Backend:**
- Broadcasts signed transaction to blockchain
- Waits for confirmation
- Updates payout status to `completed`
- Deducts from merchant balance
- Creates transaction record
- Triggers webhook

---

## Database Schema

### New Fields in `payouts` Table

```sql
ALTER TABLE payouts ADD COLUMN:
  unsigned_transaction TEXT,           -- Serialized unsigned transaction
  source_wallet_address TEXT,          -- Merchant's payment wallet
  signing_required BOOLEAN DEFAULT true,
  signed_at TIMESTAMPTZ,
  transaction_expires_at TIMESTAMPTZ;
```

### New Status Values

```sql
status IN (
  'pending',              -- Awaiting approval
  'approved',             -- Approved, generating transaction
  'awaiting_signature',   -- Ready for merchant to sign
  'processing',           -- Transaction submitted to blockchain
  'completed',            -- Transaction confirmed
  'failed',               -- Transaction failed
  'cancelled',            -- Cancelled by merchant
  'rejected',             -- Rejected by admin
  'expired'               -- Unsigned transaction expired
)
```

---

## API Endpoints

### 1. Create Payout
```
POST /functions/v1/create-payout
Authorization: Bearer <user_token>

Body:
{
  "amount": "100.00",
  "currency": "USDC",
  "destination_id": "uuid",
  "chain": "solana"
}

Response:
{
  "id": "payout_123",
  "status": "awaiting_signature",
  "message": "Payout created. Please sign the transaction to complete."
}
```

### 2. Generate Transaction
```
POST /functions/v1/generate-payout-transaction
Authorization: Service Role Key

Body:
{
  "payout_id": "payout_123"
}

Response:
{
  "unsigned_transaction": "base64_encoded_tx",
  "source_wallet": "merchant_wallet_address",
  "destination": "payout_destination_address",
  "amount": 99.50,
  "currency": "USDC",
  "chain": "solana",
  "expires_at": "2024-12-13T10:32:00Z"
}
```

### 3. Submit Signed Transaction
```
POST /functions/v1/submit-signed-payout
Authorization: Bearer <user_token>

Body:
{
  "payout_id": "payout_123",
  "signed_transaction": "base64_or_hex_signed_tx"
}

Response:
{
  "success": true,
  "tx_signature": "5xKXtg2...",
  "status": "completed"
}
```

---

## Frontend Components

### 1. **SignPayoutDialog**
- Modal dialog for signing payouts
- Shows transaction details
- Countdown timer for expiry
- Wallet connection buttons
- Chain-specific signing logic

### 2. **usePayoutSigning Hook**
```typescript
const { 
  loading,
  generateTransaction,
  signAndSubmit 
} = usePayoutSigning();

// Generate unsigned transaction
const signingData = await generateTransaction(payoutId);

// Sign and submit
const success = await signAndSubmit(signingData);
```

---

## Security Benefits

### ✅ **No Hot Wallet Risk**
- Platform doesn't hold any private keys
- No risk of platform wallet being hacked
- Merchants control their own funds

### ✅ **No Capital Requirements**
- Platform doesn't need to fund hot wallets
- No liquidity risk
- Scales infinitely without capital

### ✅ **Regulatory Compliance**
- Not a custodian (no money transmitter license needed)
- Merchants are responsible for their own funds
- Platform is just a payment processor

### ✅ **Merchant Control**
- Merchants can verify transaction before signing
- Can reject suspicious transactions
- Full transparency

---

## Comparison

| Feature | Custodial (Old) | Non-Custodial (New) |
|---------|----------------|---------------------|
| **Platform holds funds** | ✅ Yes | ❌ No |
| **Capital required** | 💰 High | 💰 None |
| **Hot wallet risk** | 🔴 High | 🟢 None |
| **Regulatory burden** | 🔴 High | 🟢 Low |
| **Merchant control** | ❌ Limited | ✅ Full |
| **Payout speed** | ⚡ Instant | ⏱️ Manual sign |
| **Automation** | ✅ Full | ⚠️ Requires signing |

---

## Future Enhancements

1. **Scheduled Payouts with Pre-Approval**
   - Merchant pre-signs multiple transactions
   - Platform executes on schedule
   - Combines automation with non-custodial model

2. **Multi-Sig Support**
   - Require 2-3 signatures for large payouts
   - Enhanced security for businesses

3. **Gasless Transactions**
   - Platform pays gas fees
   - Merchant only signs, doesn't need native tokens

---

## Migration Notes

**No migration needed!** The system is designed to work with existing data:
- Existing `business_wallets` are used as source wallets
- Existing `payout_destinations` work as-is
- Old `process-payout` function is deprecated but not removed

**Environment Variables:**
- ❌ `HOT_WALLET_PRIVATE_KEY` - No longer needed
- ❌ `EVM_HOT_WALLET_PRIVATE_KEY` - No longer needed
- ✅ RPC endpoints still needed for transaction generation

---

## Summary

The non-custodial payout system provides:
- ✅ **Zero capital requirements** for the platform
- ✅ **Maximum security** (no hot wallet risk)
- ✅ **Regulatory simplicity** (not a custodian)
- ✅ **Merchant control** (they sign their own transactions)
- ✅ **Full transparency** (merchants see exactly what they're signing)

This is the **correct architecture** for a blockchain payment gateway! 🚀

