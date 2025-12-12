# Native Token Support - Complete ✅

Support for native blockchain tokens (SOL and ETH) has been added to the checkout widget.

## 🪙 Supported Tokens

### Solana Network
1. **USDC** - USD Coin (SPL Token) - 6 decimals
2. **USDT** - Tether (SPL Token) - 6 decimals
3. **SOL** - Solana (Native Token) - 9 decimals ⭐ NEW

### Base Network
1. **USDC** - USD Coin (ERC-20) - 6 decimals
2. **USDT** - Tether (ERC-20) - 6 decimals
3. **ETH** - Ethereum (Native Token) - 18 decimals ⭐ NEW

---

## ✅ What Was Implemented

### 1. Type Definitions Updated
**File**: `src/lib/walletProviders.ts`

```typescript
export type TokenType = 'USDC' | 'USDT' | 'SOL' | 'ETH';

export const TOKEN_ADDRESSES = {
  solana: {
    USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    USDT: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    SOL: 'native', // Native SOL
  },
  base: {
    USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    USDT: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2',
    ETH: 'native', // Native ETH
  },
};

export const TOKEN_DECIMALS: Record<TokenType, number> = {
  USDC: 6,
  USDT: 6,
  SOL: 9,
  ETH: 18,
};
```

### 2. Payment Options Updated
**File**: `src/components/checkout/WalletSelector.tsx`

Added new payment options:
- ✅ Solana SOL (marked as popular)
- ✅ Base ETH (marked as popular)

### 3. Transaction Handling
**File**: `src/lib/blockchainTransactions.ts`

#### Solana Transactions
- **SPL Tokens** (USDC, USDT): Uses `createTransferInstruction`
- **Native SOL**: Uses `SystemProgram.transfer`

```typescript
// Native SOL transfer
const lamports = Math.floor(amount * LAMPORTS_PER_SOL);
const transferInstruction = SystemProgram.transfer({
  fromPubkey,
  toPubkey,
  lamports,
});
```

#### EVM Transactions
- **ERC-20 Tokens** (USDC, USDT): Uses contract call
- **Native ETH**: Uses `eth_sendTransaction` with value

```typescript
// Native ETH transfer
const weiAmount = Math.floor(amount * Math.pow(10, 18));
const valueHex = '0x' + weiAmount.toString(16);

await provider.request({
  method: 'eth_sendTransaction',
  params: [{
    from: wallet.address,
    to: recipientAddress,
    value: valueHex,
  }]
});
```

### 4. Balance Checking
**File**: `src/lib/walletProviders.ts`

#### Solana Balance
- **SPL Tokens**: Uses `getTokenAccountsByOwner`
- **Native SOL**: Uses `getBalance` (returns lamports)

```typescript
// Native SOL balance
const response = await fetch(rpcUrl, {
  method: 'POST',
  body: JSON.stringify({
    method: 'getBalance',
    params: [walletAddress],
  }),
});
const balance = data.result.value / 1_000_000_000; // lamports to SOL
```

#### EVM Balance
- **ERC-20 Tokens**: Uses `eth_call` with balanceOf
- **Native ETH**: Uses `eth_getBalance`

```typescript
// Native ETH balance
const balance = await provider.request({
  method: 'eth_getBalance',
  params: [walletAddress, 'latest'],
});
const balanceNum = parseInt(balance, 16) / Math.pow(10, 18); // wei to ETH
```

### 5. Logo Integration
**Files**: `PaymentDetails.tsx`, `PaymentReceipt.tsx`

Added logo mappings:
- SOL: `/solana-sol-logo.svg`
- ETH: `/ethereum-eth-logo.svg`

---

## 🔧 Technical Details

### Decimal Handling

| Token | Decimals | Conversion |
|-------|----------|------------|
| USDC  | 6        | amount × 10^6 |
| USDT  | 6        | amount × 10^6 |
| SOL   | 9        | amount × 10^9 (lamports) |
| ETH   | 18       | amount × 10^18 (wei) |

### Native vs Token Transfers

**Native Tokens** (SOL, ETH):
- Direct transfer to recipient address
- No token contract involved
- Simpler transaction structure
- Lower gas fees

**SPL/ERC-20 Tokens** (USDC, USDT):
- Transfer through token contract
- Requires token account (Solana)
- Contract interaction (EVM)
- Slightly higher gas fees

---

## 🎨 UI Updates

### Payment Method Selection

Now shows 6 options (was 4):

**Solana:**
1. USDC (Popular)
2. SOL (Popular) ⭐ NEW
3. USDT

**Base:**
1. USDC (Popular)
2. ETH (Popular) ⭐ NEW
3. USDT

### Logo Display

Each option shows:
- Network logo (background)
- Token logo (badge)
- "Popular" badge for recommended options

---

## 🧪 Testing

### Test Native SOL Transfer

1. **Install Phantom wallet**
2. **Switch to Devnet**
3. **Get test SOL** from https://solfaucet.com/
4. **Open checkout demo**
5. **Select "SOL on Solana"**
6. **Connect Phantom**
7. **Complete payment**

### Test Native ETH Transfer

1. **Install MetaMask**
2. **Add Base Testnet**
3. **Get test ETH** from Base faucet
4. **Open checkout demo**
5. **Select "ETH on Base"**
6. **Connect MetaMask**
7. **Complete payment**

---

## 📊 Comparison

### Before
- ✅ USDC on Solana
- ✅ USDT on Solana
- ✅ USDC on Base
- ✅ USDT on Base

### After
- ✅ USDC on Solana
- ✅ **SOL on Solana** ⭐ NEW
- ✅ USDT on Solana
- ✅ USDC on Base
- ✅ **ETH on Base** ⭐ NEW
- ✅ USDT on Base

---

## 💡 Benefits

### For Users
- ✅ More payment options
- ✅ Can pay with native tokens
- ✅ Lower fees (native transfers)
- ✅ Familiar tokens (SOL, ETH)

### For Merchants
- ✅ Accept popular cryptocurrencies
- ✅ Broader customer base
- ✅ Flexible payment options
- ✅ Competitive advantage

---

## 🔍 Code Changes Summary

### Files Modified
1. `src/lib/walletProviders.ts` - Added SOL/ETH types and addresses
2. `src/lib/blockchainTransactions.ts` - Native token transfer logic
3. `src/components/checkout/WalletSelector.tsx` - Added SOL/ETH options
4. `src/components/checkout/PaymentDetails.tsx` - Logo and balance updates
5. `src/components/checkout/PaymentReceipt.tsx` - Logo updates

### Lines of Code
- **Added**: ~150 lines
- **Modified**: ~50 lines
- **Total Impact**: ~200 lines

---

## ⚠️ Important Notes

### Gas Fees
- **SOL transfers**: Require SOL for gas (~0.000005 SOL)
- **ETH transfers**: Require ETH for gas (~0.0001 ETH)
- Users must have native tokens for gas even when paying with stablecoins

### Minimum Balances
- **Solana**: Rent-exempt minimum (~0.002 SOL)
- **Base**: No minimum (but need gas)

### Testnet vs Mainnet
- Currently configured for **testnet/devnet**
- Switch RPC URLs for mainnet
- Update token addresses if needed

---

## 🚀 Next Steps

To enable mainnet:

1. **Update RPC URLs**
   ```typescript
   const SOLANA_RPC_MAINNET = 'https://api.mainnet-beta.solana.com';
   const BASE_RPC_MAINNET = 'https://mainnet.base.org';
   ```

2. **Verify token addresses**
   - SOL: Always 'native'
   - ETH: Always 'native'
   - USDC/USDT: Verify contract addresses

3. **Test with small amounts**
   - Start with 0.01 SOL or 0.001 ETH
   - Verify transactions on explorer

4. **Update documentation**
   - Add mainnet instructions
   - Update testing guide

---

## ✨ Summary

**Status**: ✅ **NATIVE TOKEN SUPPORT COMPLETE**

The checkout widget now supports:
- ✅ 6 payment options (was 4)
- ✅ Native tokens (SOL, ETH)
- ✅ Stablecoins (USDC, USDT)
- ✅ 2 networks (Solana, Base)
- ✅ Proper decimal handling
- ✅ Balance checking
- ✅ Transaction creation
- ✅ Logo integration

**Users can now pay with SOL and ETH in addition to stablecoins!** 🎉

