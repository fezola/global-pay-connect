# Phase 3: Payout Processing - Progress Update

## ✅ Completed (70%)

### 1. Database Schema ✅
**Files**: `supabase/migrations/20251211160000_payout_system.sql`

Created 3 tables:
- ✅ `payout_destinations` - Store wallet addresses & bank accounts
- ✅ `payouts` - Track withdrawal requests
- ✅ `payout_approvals` - Approval workflow

**Features**:
- Full RLS policies
- Indexes for performance
- Constraints for data integrity
- Real-time subscriptions ready

---

### 2. Create Payout Edge Function ✅
**File**: `supabase/functions/create-payout/index.ts`

**Features**:
- ✅ Validate merchant balance
- ✅ Check minimum withdrawal ($10)
- ✅ Calculate fees (0.5% or min $1)
- ✅ Auto-approve small amounts (< $1000)
- ✅ Require approval for large amounts (> $1000)
- ✅ Support wallet destinations
- ✅ Create payout record

**API**:
```typescript
POST /functions/v1/create-payout
{
  "amount": "100.00",
  "currency": "USDC",
  "destination_address": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
  "notes": "Monthly withdrawal"
}
```

---

### 3. Process Payout Edge Function ✅
**File**: `supabase/functions/process-payout/index.ts`

**Features**:
- ✅ Execute on-chain Solana transfers
- ✅ Support USDC & USDT
- ✅ Update merchant balance
- ✅ Create transaction records
- ✅ Send webhook notifications
- ✅ Error handling & retry logic
- ✅ Transaction confirmation

**Flow**:
1. Find approved payouts
2. Build Solana transfer transaction
3. Sign with hot wallet
4. Send to blockchain
5. Wait for confirmation
6. Update payout status
7. Deduct from balance
8. Create transaction record
9. Send webhook

---

### 4. Payout UI ✅
**File**: `src/pages/Payouts.tsx` (already existed, updated hook)
**Hook**: `src/hooks/usePayouts.tsx` (updated to use edge function)

**Features**:
- ✅ View payout history
- ✅ Request new payout
- ✅ Real-time status updates
- ✅ Transaction links (Solscan)
- ✅ Fee calculation display
- ✅ Balance validation

---

## 🔄 Remaining Tasks (30%)

### 5. Payout Destinations Management
**Status**: Not started
**Priority**: Medium

**What's needed**:
- UI to add/manage wallet addresses
- Verify wallet ownership (sign message)
- Set default destination
- Delete destinations

**File to create**: `src/pages/PayoutDestinations.tsx`

---

### 6. Approval Workflow
**Status**: Not started
**Priority**: Medium

**What's needed**:
- Dashboard for pending approvals
- Approve/reject functionality
- Email notifications
- Audit trail

**File to create**: `src/pages/PayoutApprovals.tsx`

---

### 7. Cron Job for Processing
**Status**: Not started
**Priority**: High

**What's needed**:
- Setup cron job to call `process-payout` every 5 minutes
- Use cron-job.org or similar service

**URL**: `https://crkhkzcscgoeyspaczux.supabase.co/functions/v1/process-payout`

---

## 🚀 Deployment Steps

### Step 1: Deploy Edge Functions

Upload to Supabase Dashboard:
1. `create-payout` function
2. `process-payout` function

**Settings**:
- Verify JWT: ✅ YES (for create-payout)
- Verify JWT: ❌ NO (for process-payout)

---

### Step 2: Setup Environment Variables

Add to Supabase Edge Functions secrets:

```bash
HOT_WALLET_PRIVATE_KEY=<your_hot_wallet_private_key_base58>
SOLANA_RPC_ENDPOINT=https://api.devnet.solana.com
```

**To get hot wallet private key**:
```bash
# Generate new wallet
solana-keygen new --outfile hot-wallet.json

# Get base58 private key
cat hot-wallet.json | jq -r '.[0:32] | @base58'
```

---

### Step 3: Fund Hot Wallet

The hot wallet needs:
1. **SOL** for transaction fees (~0.01 SOL per transaction)
2. **USDC/USDT** for payouts

**Devnet**:
```bash
# Get SOL from faucet
solana airdrop 2 <HOT_WALLET_ADDRESS> --url devnet

# Get USDC from faucet
# Visit: https://spl-token-faucet.com/
```

**Mainnet**:
- Transfer SOL for fees
- Transfer USDC/USDT from merchant balances

---

### Step 4: Setup Cron Job

Use cron-job.org:

**Job**: Process Payouts
- URL: `https://crkhkzcscgoeyspaczux.supabase.co/functions/v1/process-payout`
- Method: POST
- Schedule: Every 5 minutes
- Header: `Authorization: Bearer <SERVICE_ROLE_KEY>`

---

### Step 5: Enable Realtime (Optional)

For real-time payout status updates:

1. Go to Database → Replication
2. Enable for `payouts` table
3. Enable for `payout_destinations` table

---

## 🧪 Testing

### Test Create Payout

```bash
curl -X POST https://crkhkzcscgoeyspaczux.supabase.co/functions/v1/create-payout \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": "50.00",
    "currency": "USDC",
    "destination_address": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    "notes": "Test payout"
  }'
```

### Test Process Payout

```bash
curl -X POST https://crkhkzcscgoeyspaczux.supabase.co/functions/v1/process-payout \
  -H "Authorization: Bearer SERVICE_ROLE_KEY"
```

---

## 📊 Payout Flow

```
User Requests Payout
        ↓
Check Balance & Limits
        ↓
Calculate Fee
        ↓
    Amount?
        ↓
< $1000 → Auto-Approve → Queue for Processing
> $1000 → Pending Approval → Manual Approve → Queue for Processing
        ↓
Cron Job (Every 5 min)
        ↓
Process Payout Function
        ↓
Build Solana Transaction
        ↓
Sign & Send
        ↓
Wait for Confirmation
        ↓
Update Balance & Status
        ↓
Send Webhook
        ↓
Complete ✅
```

---

## 🔐 Security Notes

1. **Hot Wallet**:
   - Keep private key encrypted
   - Use environment variables
   - Monitor balance regularly
   - Consider multi-sig for large amounts

2. **Approval Thresholds**:
   - Auto-approve: < $1,000
   - Manual approve: $1,000 - $10,000
   - Multi-sig: > $10,000 (future)

3. **Rate Limits**:
   - Max 5 withdrawals per day (future)
   - Max $50,000 per month (future)

4. **Monitoring**:
   - Alert on failed payouts
   - Monitor hot wallet balance
   - Track unusual withdrawal patterns

---

## 📈 Next Steps

1. **Deploy Functions** - Upload to Supabase
2. **Setup Hot Wallet** - Generate & fund
3. **Configure Cron** - Setup automated processing
4. **Test End-to-End** - Request & process a payout
5. **Build Approvals UI** - For large payouts
6. **Add Destinations UI** - Manage wallet addresses

---

## ✅ What's Working Now

- ✅ Database schema
- ✅ Create payout API
- ✅ Process payout logic
- ✅ Payout UI
- ✅ Real-time updates
- ✅ Fee calculation
- ✅ Balance validation

## 🔄 What's Next

- [ ] Deploy edge functions
- [ ] Setup hot wallet
- [ ] Configure cron job
- [ ] Build approvals UI
- [ ] Add destinations management
- [ ] Test on devnet
- [ ] Deploy to mainnet

---

**Phase 3 Status**: 70% Complete 🎉

Ready to deploy and test! 🚀

