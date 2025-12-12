# Troubleshooting Guide

Common issues and solutions for the Klyr Checkout Widget.

## Buffer is not defined

**Error:**
```
Uncaught ReferenceError: Buffer is not defined
```

**Cause:**
Solana libraries (@solana/web3.js, @solana/spl-token) require Node.js Buffer which isn't available in browsers.

**Solution:**
Already fixed! The project includes:

1. **Polyfills** (`src/polyfills.ts`)
   - Imports Buffer from 'buffer' package
   - Makes it globally available

2. **Vite Configuration** (`vite.config.ts`)
   - Uses vite-plugin-node-polyfills
   - Defines global variables
   - Configures optimizeDeps

3. **Main Entry** (`src/main.tsx`)
   - Imports polyfills first

**If you still see this error:**
1. Clear browser cache
2. Restart dev server: `npm run dev`
3. Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)

---

## Wallet Not Detected

**Error:**
"Phantom wallet is not installed" or "MetaMask is not installed"

**Solutions:**

1. **Install the wallet extension**
   - Phantom: https://phantom.app/
   - MetaMask: https://metamask.io/

2. **Refresh the page** after installation

3. **Check if wallet is unlocked**
   - Open wallet extension
   - Enter password if locked

4. **Try a different browser**
   - Chrome/Brave recommended
   - Some browsers block extensions

---

## Connection Failed

**Error:**
"Failed to connect to wallet" or "Unexpected error"

**Solutions:**

1. **Check for pending requests**
   - Open your wallet extension
   - Look for pending connection requests
   - Approve or reject them
   - Try connecting again

2. **Unlock your wallet**
   - Open wallet extension
   - Enter password if locked

3. **Refresh the page**
   - Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
   - Clear browser cache
   - Try again

4. **Check permissions**
   - Wallet may have blocked the site
   - Go to wallet settings → Connected Sites
   - Remove this site and reconnect

5. **Restart wallet extension**
   - Disable the extension
   - Re-enable it
   - Refresh the page

6. **Check network**
   - Ensure you're on correct network
   - Solana: Devnet for testing
   - Base: Base Testnet for testing

7. **Try incognito mode**
   - Open browser in incognito/private mode
   - Install wallet extension
   - Test connection

---

## Transaction Failed

**Error:**
"Transaction failed" or "Insufficient funds"

**Solutions:**

1. **Check gas balance**
   - Solana: Need SOL for transaction fees
   - Base: Need ETH for gas fees
   - Get from faucets (see TESTING_GUIDE.md)

2. **Check token balance**
   - Ensure you have enough USDC/USDT
   - Check you're on correct network

3. **Network congestion**
   - Wait a few minutes
   - Try again with higher gas

4. **Check wallet approval**
   - Don't reject the transaction
   - Approve in wallet popup

---

## Balance Shows Zero

**Error:**
Balance shows 0 even though you have tokens

**Solutions:**

1. **Wrong network**
   - Solana: Switch to Devnet (for testing)
   - Base: Switch to Base Testnet
   - Check wallet network settings

2. **Wrong token**
   - Ensure you have USDC or USDT
   - Not just SOL or ETH

3. **Token account doesn't exist**
   - Solana: Need to create token account first
   - Send yourself some USDC to create account

4. **Wait for sync**
   - Blockchain may be syncing
   - Wait 10-30 seconds
   - Refresh the page

---

## Transaction Stuck

**Error:**
Transaction stuck in "Confirming" state

**Solutions:**

1. **Wait longer**
   - Solana: Usually 15-30 seconds
   - Base: Usually 30-60 seconds
   - Can take up to 2 minutes

2. **Check on explorer**
   - Copy transaction hash
   - View on Solscan (Solana) or Basescan (Base)
   - Check if confirmed on-chain

3. **Network issues**
   - Check if blockchain is operational
   - Check your internet connection

4. **Timeout**
   - Widget times out after 1 minute
   - Transaction may still succeed on-chain
   - Check explorer with tx hash

---

## Module Not Found

**Error:**
"Cannot find module '@solana/web3.js'" or similar

**Solution:**
```bash
npm install
```

If that doesn't work:
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## TypeScript Errors

**Error:**
TypeScript compilation errors

**Solutions:**

1. **Restart TypeScript server**
   - VS Code: Ctrl+Shift+P → "TypeScript: Restart TS Server"

2. **Check types are installed**
   ```bash
   npm install --save-dev @types/node
   ```

3. **Clear cache**
   ```bash
   rm -rf node_modules/.vite
   npm run dev
   ```

---

## Vite Build Errors

**Error:**
Build fails with dependency errors

**Solutions:**

1. **Use legacy peer deps**
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Clear cache**
   ```bash
   rm -rf node_modules/.vite dist
   npm run build
   ```

3. **Check Node version**
   - Requires Node.js 18+
   - Update if needed

---

## CORS Errors

**Error:**
"CORS policy: No 'Access-Control-Allow-Origin' header"

**Solutions:**

1. **Using local dev server**
   - Should work automatically
   - Check vite.config.ts

2. **Production deployment**
   - Configure CORS on backend
   - Add allowed origins

---

## Wallet Popup Blocked

**Error:**
Wallet popup doesn't appear

**Solutions:**

1. **Allow popups**
   - Browser may be blocking popups
   - Click "Always allow" for the site

2. **Click wallet extension**
   - Manually open wallet extension
   - Approve pending request

3. **Disable popup blockers**
   - Check browser extensions
   - Temporarily disable ad blockers

---

## Performance Issues

**Error:**
Slow loading or laggy UI

**Solutions:**

1. **Clear browser cache**
   - Hard refresh
   - Clear site data

2. **Disable browser extensions**
   - Some extensions slow down dApps
   - Try incognito mode

3. **Use faster RPC**
   - Configure custom RPC endpoint
   - Use paid RPC for production

---

## Getting Help

If you're still having issues:

1. **Check browser console**
   - Press F12
   - Look for error messages
   - Copy full error text

2. **Check network tab**
   - See which requests are failing
   - Check response codes

3. **Review documentation**
   - TESTING_GUIDE.md
   - BLOCKCHAIN_INTEGRATION_COMPLETE.md
   - CHECKOUT_ACCESS_GUIDE.md

4. **Test with different wallet**
   - Try Phantom vs MetaMask
   - Try different browser

5. **Check blockchain status**
   - Solana: https://status.solana.com/
   - Base: https://status.base.org/

---

## Debug Mode

Enable detailed logging:

1. **Open browser console** (F12)

2. **Look for logs:**
   - Wallet connection logs
   - Balance check results
   - Transaction details
   - Error messages

3. **All operations log to console**
   - Connection attempts
   - RPC calls
   - Transaction submissions
   - Confirmation polling

---

## Common Fixes Checklist

- [ ] Wallet extension installed
- [ ] Wallet unlocked
- [ ] On correct network (Devnet/Testnet)
- [ ] Have gas tokens (SOL/ETH)
- [ ] Have test tokens (USDC/USDT)
- [ ] Browser cache cleared
- [ ] Page hard refreshed
- [ ] Popup blocker disabled
- [ ] Console checked for errors
- [ ] Dev server restarted

---

**Still stuck? Check the console logs and review the error messages carefully!**

