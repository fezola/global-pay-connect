# Wallet Connection Guide

Complete guide for connecting wallets to the Klyr Checkout Widget.

## 🔌 Supported Wallets

### Solana Wallets
- **Phantom** (Recommended) - https://phantom.app/
- **Solflare** - https://solflare.com/
- **Backpack** - https://backpack.app/

### EVM Wallets (Base)
- **MetaMask** (Recommended) - https://metamask.io/
- **Coinbase Wallet** - https://www.coinbase.com/wallet
- **WalletConnect** - Various wallets

---

## 📱 Installing Wallets

### Phantom (Solana)

1. **Visit** https://phantom.app/
2. **Click** "Download"
3. **Select** your browser (Chrome, Firefox, Brave, Edge)
4. **Install** the extension
5. **Create** a new wallet or import existing
6. **Save** your seed phrase securely!

### MetaMask (EVM/Base)

1. **Visit** https://metamask.io/
2. **Click** "Download"
3. **Select** your browser
4. **Install** the extension
5. **Create** a new wallet or import existing
6. **Save** your seed phrase securely!

---

## 🔗 Connecting Wallets

### Step-by-Step Connection

1. **Open the checkout widget**
   - Click "Pay with Klyr" button
   - Select payment method (Solana USDC, Base USDC, etc.)

2. **Choose your wallet**
   - Click on the wallet you want to use
   - If not installed, you'll be redirected to download

3. **Approve connection**
   - Wallet popup will appear
   - Review the connection request
   - Click "Approve" or "Connect"

4. **Wait for confirmation**
   - Widget will show "Connected" status
   - Your wallet address will be displayed

---

## ⚠️ Common Connection Issues

### Issue 1: "Unexpected error"

**Cause:** Pending connection request in wallet

**Solution:**
1. Open your wallet extension
2. Look for pending requests
3. Approve or reject them
4. Try connecting again

---

### Issue 2: "Wallet not detected"

**Cause:** Wallet extension not installed or disabled

**Solution:**
1. Install the wallet extension
2. Refresh the page (Ctrl+R or Cmd+R)
3. Make sure extension is enabled
4. Try again

---

### Issue 3: "Connection already pending"

**Cause:** Previous connection request not completed

**Solution:**
1. Open wallet extension
2. Find the pending request
3. Approve or reject it
4. Close and reopen the checkout
5. Try connecting again

---

### Issue 4: "User rejected request"

**Cause:** You clicked "Reject" in the wallet popup

**Solution:**
1. Click the wallet button again
2. This time click "Approve" in the popup
3. Connection should succeed

---

### Issue 5: Wallet popup doesn't appear

**Cause:** Popup blocker or wallet not responding

**Solution:**
1. Check if popup blocker is enabled
2. Allow popups for this site
3. Click the wallet extension icon manually
4. Look for pending requests there
5. Approve the connection

---

## 🔧 Troubleshooting Steps

### Quick Fixes

1. **Refresh the page**
   ```
   Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   ```

2. **Clear browser cache**
   - Chrome: Settings → Privacy → Clear browsing data
   - Firefox: Settings → Privacy → Clear Data

3. **Restart wallet extension**
   - Disable the extension
   - Re-enable it
   - Refresh the page

4. **Try incognito mode**
   - Open browser in private/incognito mode
   - Install wallet extension
   - Test connection

5. **Check wallet is unlocked**
   - Open wallet extension
   - Enter password if locked
   - Try connecting again

---

## 🌐 Network Configuration

### Phantom (Solana)

**For Testing:**
1. Open Phantom
2. Click Settings (gear icon)
3. Go to "Developer Settings"
4. Change Network to **"Devnet"**

**For Production:**
- Use "Mainnet Beta"

---

### MetaMask (Base)

**Add Base Network:**

1. Open MetaMask
2. Click network dropdown
3. Click "Add Network"
4. Enter these details:

**Base Mainnet:**
- Network Name: `Base`
- RPC URL: `https://mainnet.base.org`
- Chain ID: `8453`
- Currency Symbol: `ETH`
- Block Explorer: `https://basescan.org`

**Base Testnet (for testing):**
- Network Name: `Base Goerli`
- RPC URL: `https://goerli.base.org`
- Chain ID: `84531`
- Currency Symbol: `ETH`
- Block Explorer: `https://goerli.basescan.org`

---

## 🔐 Security Tips

1. **Never share your seed phrase**
   - Klyr will never ask for it
   - No legitimate service will

2. **Verify the URL**
   - Make sure you're on the correct site
   - Check for HTTPS

3. **Review permissions**
   - Check what the site is requesting
   - Only approve what's necessary

4. **Use hardware wallets**
   - For large amounts
   - Ledger, Trezor supported

5. **Keep wallet updated**
   - Update extensions regularly
   - Check for security updates

---

## 📊 Connection Status

### What You'll See

**Connecting:**
- Loading spinner
- "Connecting to [Wallet]..."

**Connected:**
- Green checkmark
- Wallet address displayed
- Balance shown

**Failed:**
- Red error icon
- Error message
- "Try Again" button

---

## 🧪 Testing Connection

### Test Checklist

- [ ] Wallet extension installed
- [ ] Wallet unlocked
- [ ] On correct network (Devnet/Testnet)
- [ ] No pending requests
- [ ] Popup blocker disabled
- [ ] Page refreshed
- [ ] Extension enabled

### Test Steps

1. **Install wallet** (Phantom or MetaMask)
2. **Create/import wallet**
3. **Switch to testnet**
4. **Open checkout demo** (`/checkout-demo`)
5. **Select payment method**
6. **Click wallet button**
7. **Approve connection**
8. **Verify connection** (address shown)

---

## 💡 Pro Tips

1. **Keep wallet open**
   - Pin the extension to toolbar
   - Easier to see requests

2. **Check console**
   - Press F12 for DevTools
   - Look for connection logs
   - Helpful for debugging

3. **One wallet at a time**
   - Disable other wallet extensions
   - Prevents conflicts

4. **Use recommended wallets**
   - Phantom for Solana
   - MetaMask for Base
   - Best compatibility

5. **Test on testnet first**
   - Use Devnet/Testnet
   - No real money at risk
   - Free test tokens

---

## 🆘 Still Having Issues?

1. **Check browser console** (F12)
   - Look for error messages
   - Copy full error text

2. **Try different browser**
   - Chrome recommended
   - Brave also works well

3. **Disable other extensions**
   - Some extensions conflict
   - Try with minimal extensions

4. **Check wallet status**
   - Visit wallet's status page
   - Check for known issues

5. **Review documentation**
   - TROUBLESHOOTING.md
   - TESTING_GUIDE.md

---

## 📞 Getting Help

If connection still fails:

1. Note the exact error message
2. Check which wallet you're using
3. Note your browser and version
4. Check browser console for errors
5. Try the troubleshooting steps above

---

**Most connection issues are resolved by refreshing the page and checking for pending requests in the wallet!**

