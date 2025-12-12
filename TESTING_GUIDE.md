# Klyr Checkout Widget - Testing Guide

Complete guide for testing the checkout widget with real blockchain transactions.

## 🚀 Quick Start

### 1. Start the Application

```bash
npm install
npm run dev
```

Navigate to: `http://localhost:5173/checkout-demo`

---

## 🔧 Setup for Testing

### Option A: Solana (Recommended for Testing)

#### Step 1: Install Phantom Wallet
1. Visit https://phantom.app/
2. Install the browser extension
3. Create a new wallet or import existing
4. **Save your seed phrase securely!**

#### Step 2: Switch to Devnet
1. Open Phantom wallet
2. Click Settings (gear icon)
3. Go to "Developer Settings"
4. Change Network to **"Devnet"**

#### Step 3: Get Test SOL
1. Visit https://solfaucet.com/
2. Enter your Phantom wallet address
3. Request SOL (you'll need this for transaction fees)

#### Step 4: Get Test USDC (Optional)
For testing with actual USDC transfers:
1. You'll need devnet USDC tokens
2. Use Solana devnet faucets or create test tokens
3. For demo purposes, the widget will work even without tokens

---

### Option B: Base Network (EVM)

#### Step 1: Install MetaMask
1. Visit https://metamask.io/
2. Install the browser extension
3. Create a new wallet or import existing
4. **Save your seed phrase securely!**

#### Step 2: Add Base Testnet
1. Open MetaMask
2. Click network dropdown
3. Click "Add Network"
4. Enter Base Testnet details:
   - **Network Name**: Base Testnet
   - **RPC URL**: https://goerli.base.org
   - **Chain ID**: 84531
   - **Currency Symbol**: ETH
   - **Block Explorer**: https://goerli.basescan.org

#### Step 3: Get Test ETH
1. Visit https://faucet.quicknode.com/base/testnet
2. Enter your MetaMask address
3. Request test ETH (for gas fees)

#### Step 4: Get Test USDC
1. You'll need testnet USDC tokens
2. Use Base testnet faucets
3. Or deploy test ERC-20 tokens

---

## 🧪 Testing the Checkout Flow

### Test 1: Basic Payment Flow

1. **Open Checkout Demo**
   - Navigate to `/checkout-demo`
   - Configure amount (e.g., `0.01`)
   - Select currency (USD)
   - Click "Launch Checkout Demo"

2. **Select Payment Method**
   - Choose "Solana USDC" (recommended for testing)
   - Or choose "Base USDC" if using MetaMask

3. **Connect Wallet**
   - Click on your wallet (Phantom or MetaMask)
   - Approve the connection request
   - Wallet should show as connected

4. **Review Payment**
   - Check wallet balance (should show your devnet balance)
   - Review payment details
   - Verify recipient address
   - Click "Pay" button

5. **Approve Transaction**
   - Wallet popup will appear
   - Review transaction details
   - Click "Approve" in wallet

6. **Watch Confirmation**
   - Transaction status shows "Processing"
   - Then "Confirming"
   - Finally "Success" with receipt

7. **Verify on Blockchain**
   - Copy transaction hash from receipt
   - View on explorer:
     - Solana: https://solscan.io/ (switch to Devnet)
     - Base: https://goerli.basescan.org/

---

### Test 2: Insufficient Balance

1. Configure amount higher than your balance
2. Connect wallet
3. Should show "Insufficient Balance" warning
4. Pay button should be disabled

---

### Test 3: User Rejection

1. Start payment flow
2. When wallet popup appears, click "Reject"
3. Should show error message
4. Should allow retry

---

### Test 4: Network Switching

1. Test with Solana USDC
2. Close checkout
3. Test with Base USDC
4. Verify wallet switches networks correctly

---

## 🐛 Troubleshooting

### Wallet Not Detected

**Problem**: "Wallet not installed" message

**Solution**:
- Ensure wallet extension is installed
- Refresh the page after installation
- Check if wallet is unlocked
- Try a different browser

---

### Connection Failed

**Problem**: Wallet connection fails

**Solution**:
- Check if wallet is on correct network (Devnet for Solana)
- Unlock your wallet
- Clear browser cache
- Try disconnecting and reconnecting

---

### Transaction Failed

**Problem**: Transaction fails after approval

**Solution**:
- Check if you have enough SOL/ETH for gas fees
- Verify you're on the correct network
- Check wallet balance
- Look at browser console for error details

---

### Balance Shows Zero

**Problem**: Balance shows 0 even with tokens

**Solution**:
- Verify you're on the correct network (Devnet/Testnet)
- Check if you have the correct token (USDC/USDT)
- Wait a few seconds and refresh
- Check token account exists

---

### Transaction Stuck

**Problem**: Transaction stuck in "Confirming" state

**Solution**:
- Wait up to 1 minute for confirmation
- Check transaction on blockchain explorer
- Verify network isn't congested
- Check browser console for errors

---

## 📊 Expected Behavior

### Successful Flow
```
1. Click "Pay with Klyr" ✓
2. Select payment method ✓
3. Connect wallet ✓
4. Balance checked automatically ✓
5. Review payment details ✓
6. Approve in wallet ✓
7. Transaction submitted ✓
8. Real-time status updates ✓
9. Confirmation (15-30 seconds) ✓
10. Receipt displayed ✓
```

### Transaction Times
- **Solana**: 15-30 seconds for confirmation
- **Base**: 30-60 seconds for confirmation

---

## 🔍 Debugging

### Enable Console Logging

Open browser DevTools (F12) and check Console tab for:
- Wallet connection logs
- Balance check results
- Transaction submission
- Confirmation polling
- Error messages

### Check Network Tab

Monitor network requests:
- Payment intent creation
- Balance queries
- Transaction submission
- Status polling

---

## 📝 Test Checklist

- [ ] Phantom wallet installed and on Devnet
- [ ] MetaMask installed with Base Testnet
- [ ] Test SOL/ETH in wallet for gas
- [ ] Can connect wallet successfully
- [ ] Balance displays correctly
- [ ] Can submit transaction
- [ ] Transaction confirms on blockchain
- [ ] Receipt displays with tx hash
- [ ] Can view transaction on explorer
- [ ] Error handling works (rejection, insufficient balance)

---

## 🎯 Production Testing

Before going live:

1. **Switch to Mainnet**
   - Update RPC URLs in code
   - Use mainnet token addresses
   - Test with small amounts first

2. **Real Tokens**
   - Use actual USDC/USDT
   - Verify token contract addresses
   - Test with real merchant wallet

3. **Security**
   - Never expose private keys
   - Use environment variables for API keys
   - Implement rate limiting
   - Add transaction amount limits

---

## 💡 Tips

- Start with small amounts (0.01 USDC)
- Use Solana Devnet for faster testing
- Keep browser console open for debugging
- Test on different browsers
- Try mobile wallets (Phantom mobile, MetaMask mobile)
- Test error scenarios (rejection, timeout, etc.)

---

## 🆘 Need Help?

If you encounter issues:

1. Check browser console for errors
2. Verify wallet is on correct network
3. Ensure you have gas tokens (SOL/ETH)
4. Review the troubleshooting section above
5. Check transaction on blockchain explorer

---

**Happy Testing!** 🚀

