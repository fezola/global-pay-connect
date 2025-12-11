# Phase 3: Payout Processing - Implementation Plan

## Overview

Build a complete payout system that allows merchants to withdraw their crypto balances to their wallets or optionally convert to fiat via bank integration.

---

## 🎯 Core Features

### 1. **On-Chain Crypto Withdrawals** (Primary) ⭐
Merchants can withdraw their balance directly to any Solana wallet.

**Features:**
- Withdraw USDC/USDT to any Solana address
- Minimum withdrawal amount (e.g., $10)
- Transaction fee calculation
- Withdrawal limits (daily/monthly)
- Multi-signature support (optional)
- Withdrawal history

**Flow:**
```
Merchant Balance → Withdrawal Request → Approval (if needed) → On-chain Transfer → Confirmation
```

---

### 2. **Bank Integration** (Optional - Fiat Off-ramp)
For merchants who want to convert crypto to fiat and receive bank transfers.

**Options:**
- **Circle API** - Direct USDC → Bank transfer
- **Stripe Connect** - Crypto → Fiat conversion
- **Manual** - Merchant sells crypto themselves

**Features:**
- Link bank account
- Convert crypto to fiat
- Automatic or manual payouts
- Payout schedules (daily, weekly, monthly)

---

### 3. **Approval Workflow**
For security and compliance, large withdrawals require approval.

**Features:**
- Auto-approve small amounts (< $1,000)
- Manual approval for large amounts
- Multi-user approval (2FA)
- Approval notifications
- Audit trail

---

## 📋 Implementation Tasks

### Task 1: Database Schema for Payouts

Create tables:
- `payouts` - Withdrawal requests
- `payout_destinations` - Saved wallet addresses / bank accounts
- `payout_approvals` - Approval workflow

**Schema:**
```sql
CREATE TABLE payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID REFERENCES merchants(id),
  amount DECIMAL(20, 8) NOT NULL,
  currency TEXT NOT NULL,
  destination_type TEXT NOT NULL, -- 'wallet' or 'bank'
  destination_id UUID REFERENCES payout_destinations(id),
  destination_address TEXT, -- Wallet address or bank account
  status TEXT NOT NULL, -- 'pending', 'approved', 'processing', 'completed', 'failed', 'cancelled'
  tx_signature TEXT, -- Blockchain transaction signature
  fee_amount DECIMAL(20, 8),
  net_amount DECIMAL(20, 8),
  requires_approval BOOLEAN DEFAULT false,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  processed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE payout_destinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID REFERENCES merchants(id),
  type TEXT NOT NULL, -- 'wallet' or 'bank'
  label TEXT NOT NULL, -- e.g., "Main Wallet", "Business Account"
  
  -- For wallet destinations
  chain TEXT, -- 'solana', 'ethereum', etc.
  address TEXT,
  
  -- For bank destinations
  bank_name TEXT,
  account_holder TEXT,
  account_number_last4 TEXT,
  routing_number TEXT,
  
  is_verified BOOLEAN DEFAULT false,
  is_default BOOLEAN DEFAULT false,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE payout_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payout_id UUID REFERENCES payouts(id),
  approver_id UUID REFERENCES auth.users(id),
  status TEXT NOT NULL, -- 'pending', 'approved', 'rejected'
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### Task 2: Payout Request Edge Function

**File:** `supabase/functions/create-payout/index.ts`

**Features:**
- Validate merchant balance
- Check withdrawal limits
- Calculate fees
- Determine if approval needed
- Create payout record
- Send notifications

**Logic:**
```typescript
1. Check merchant balance >= amount
2. Calculate fee (e.g., 0.5% or flat $1)
3. Check daily/monthly limits
4. If amount > $1000, require approval
5. Create payout record with status 'pending' or 'approved'
6. If auto-approved, trigger processing
7. Return payout details
```

---

### Task 3: Process Payout Edge Function

**File:** `supabase/functions/process-payout/index.ts`

**Features:**
- Execute on-chain transfer
- Update merchant balance
- Record transaction
- Send confirmation

**For Wallet Payouts:**
```typescript
1. Get merchant's hot wallet private key (encrypted)
2. Build Solana transfer transaction
3. Sign and send transaction
4. Wait for confirmation
5. Update payout status to 'completed'
6. Deduct from merchant balance
7. Create transaction record
8. Send webhook notification
```

**For Bank Payouts:**
```typescript
1. Call Circle API or Stripe Connect
2. Initiate bank transfer
3. Update payout status
4. Monitor transfer status
5. Complete when confirmed
```

---

### Task 4: Payout Destinations Management

**Features:**
- Add wallet address
- Verify wallet ownership (sign message)
- Add bank account (via Stripe/Circle)
- Set default destination
- Delete destinations

**UI Pages:**
- `/payouts` - Payout history and request new payout
- `/payouts/destinations` - Manage withdrawal destinations
- `/payouts/settings` - Payout settings and limits

---

### Task 5: Approval Workflow

**Features:**
- Dashboard for pending approvals
- Email notifications
- Approve/reject with notes
- Multi-user approval (optional)

**UI:**
- `/payouts/approvals` - Pending approvals list
- Approval modal with details
- Audit log

---

### Task 6: Payout Monitoring & Cron

**Cron Job:** Process approved payouts every 5 minutes

**Features:**
- Find approved payouts
- Process in batches
- Retry failed payouts
- Update statuses
- Send notifications

---

## 🔐 Security Considerations

1. **Hot Wallet Security**
   - Encrypt private keys in database
   - Use environment variables for encryption key
   - Consider multi-sig for large amounts
   - Implement withdrawal limits

2. **Approval Thresholds**
   - Auto-approve: < $1,000
   - Manual approval: $1,000 - $10,000
   - Multi-sig: > $10,000

3. **Rate Limiting**
   - Max 5 withdrawals per day
   - Max $50,000 per month
   - Configurable per merchant

4. **Verification**
   - Verify wallet ownership before first payout
   - 2FA for payout requests
   - Email confirmation for new destinations

---

## 📊 Payout Flow Diagram

```
┌─────────────────┐
│ Merchant Balance│
│   $10,000 USDC  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Request Payout  │
│   $5,000 USDC   │
└────────┬────────┘
         │
         ▼
    ┌────────┐
    │Amount? │
    └───┬────┘
        │
    < $1,000 ──────► Auto-Approve ──┐
        │                            │
    > $1,000 ──────► Manual Approve ─┤
        │                            │
        ▼                            ▼
┌─────────────────┐         ┌──────────────┐
│ Process Payout  │         │ Send to      │
│ (Edge Function) │────────►│ Blockchain   │
└─────────────────┘         └──────┬───────┘
                                   │
                                   ▼
                            ┌──────────────┐
                            │ Confirmation │
                            │ (15-30 secs) │
                            └──────┬───────┘
                                   │
                                   ▼
                            ┌──────────────┐
                            │ Update       │
                            │ Balance      │
                            └──────┬───────┘
                                   │
                                   ▼
                            ┌──────────────┐
                            │ Send Webhook │
                            │ & Email      │
                            └──────────────┘
```

---

## 🎯 Phase 3 Deliverables

1. ✅ Database schema for payouts
2. ✅ Create payout edge function
3. ✅ Process payout edge function
4. ✅ Payout destinations management
5. ✅ Approval workflow
6. ✅ Payout history UI
7. ✅ Withdrawal limits & security
8. ✅ Cron job for processing
9. ✅ Webhook notifications
10. ✅ Documentation

---

## 🚀 Getting Started

Let's start with:
1. **Database schema** - Create payout tables
2. **Basic payout request** - Simple withdrawal to wallet
3. **Process payout** - Execute on-chain transfer
4. **UI for payouts** - Request and view payouts

Sound good? Let's build it! 🔥

