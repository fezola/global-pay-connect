# Klyr Checkout Widget - Access Guide

Quick guide to access and test the checkout widget.

## 🚀 How to Access

### 1. Start the Development Server

```bash
npm run dev
```

The app will start at `http://localhost:5173`

### 2. Login to Dashboard

1. Navigate to `http://localhost:5173`
2. Login or create an account
3. Complete onboarding if needed

### 3. Access Checkout Demo

**Option A: Via Navigation**
- Click on **"Checkout Demo"** in the left sidebar (under Developer section)
- Look for the "New" badge

**Option B: Via Developer Page**
- Go to **Developer** page
- Click the **"Try Checkout Demo"** button in the top-right

**Option C: Direct URL**
- Navigate to: `http://localhost:5173/checkout-demo`

---

## 📍 Available Routes

### Main Application Routes

| Route | Description | Access |
|-------|-------------|--------|
| `/checkout-demo` | Interactive checkout demo | Protected (requires login) |
| `/checkout` | Hosted checkout page | Public |
| `/dev` | Developer documentation | Protected |
| `/dashboard` | Main dashboard | Protected |

### Checkout Demo Features

The demo page includes:
- ✅ Live configuration panel
- ✅ Real-time preview
- ✅ Code generation (JavaScript & React)
- ✅ Copy-paste integration code
- ✅ Interactive widget testing

---

## 🎮 Testing the Checkout Widget

### Step 1: Configure Payment
1. Enter amount (e.g., `100.00`)
2. Select currency (USD, EUR, GBP)
3. Add description
4. Choose theme (light, dark, auto)
5. Toggle branding

### Step 2: Launch Checkout
1. Click **"Launch Checkout Demo"** button
2. Checkout modal will open

### Step 3: Select Payment Method
Choose from:
- Solana USDC (Popular)
- Solana USDT
- Base USDC (Popular)
- Base USDT

### Step 4: Connect Wallet
- **For Solana**: Install Phantom wallet
- **For Base**: Install MetaMask

If wallet not installed, click to download.

### Step 5: Review & Pay
1. Review payment details
2. Check wallet balance
3. Confirm payment
4. Approve in wallet

### Step 6: View Receipt
- Transaction hash
- Payment details
- Download/email options

---

## 🔧 Development Testing

### Test Without Real Wallets

The demo currently uses mock transactions for testing. To test with real wallets:

1. **Install Wallets**
   - Phantom: https://phantom.app/
   - MetaMask: https://metamask.io/

2. **Switch to Testnet**
   - Solana: Devnet
   - Base: Testnet

3. **Get Test Tokens**
   - Solana: https://solfaucet.com/
   - Base: https://faucet.quicknode.com/base/testnet

4. **Update Configuration**
   - Set `baseUrl` to your API endpoint
   - Add real `apiKey`

---

## 📝 Integration Code

### JavaScript (Copy from Demo)

```html
<script src="https://js.klyr.io/v1/checkout.js"></script>
<button onclick="Klyr.checkout.open({...})">Pay</button>
```

### React (Copy from Demo)

```tsx
import { KlyrCheckoutButton } from '@klyr/sdk/react';
<KlyrCheckoutButton merchantId="..." amount="100.00" />
```

---

## 🎨 Customization Options

Available in the demo configuration panel:

- **Amount**: Any decimal value
- **Currency**: USD, EUR, GBP
- **Description**: Payment description
- **Theme**: Light, Dark, Auto
- **Branding**: Show/hide "Powered by Klyr"

---

## 📱 Mobile Testing

1. Start dev server: `npm run dev`
2. Find your local IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
3. Access from mobile: `http://YOUR_IP:5173/checkout-demo`
4. Test wallet connections on mobile

---

## 🐛 Troubleshooting

### "Checkout Demo" not showing in sidebar
- Make sure you're logged in
- Refresh the page
- Check the Developer section in the sidebar

### Checkout modal not opening
- Check browser console for errors
- Ensure you clicked "Launch Checkout Demo"
- Try refreshing the page

### Wallet not detected
- Install the wallet extension
- Refresh the page after installation
- Check if wallet is unlocked

### Balance check failing
- Ensure you're on the correct network (Devnet for Solana, Testnet for Base)
- Check if you have the token in your wallet
- Real balance checking is now implemented
- Check browser console for error details

---

## 📚 Documentation

- **Quick Start**: `CHECKOUT_WIDGET_README.md`
- **Integration Guide**: `docs/INTEGRATION_GUIDE.md`
- **Widget Docs**: `docs/CHECKOUT_WIDGET.md`
- **Component Docs**: `src/components/checkout/README.md`
- **Quick Reference**: `QUICK_REFERENCE.md`

---

## 🎯 Next Steps

1. **Test the Demo**: Try different configurations
2. **Copy Integration Code**: Use the generated code
3. **Read Documentation**: Check the guides
4. **Customize**: Adjust theme and branding
5. **Deploy**: Follow deployment guide

---

## 💡 Tips

- Use the **code generation** feature to get copy-paste ready code
- Test with different **themes** to match your brand
- Try **mobile view** for responsive testing
- Check the **Developer page** for more examples
- Use **Quick Reference** for common patterns

---

## 🆘 Need Help?

- Check the documentation files
- Review the examples in `sdk/examples/`
- Look at component source in `src/components/checkout/`
- Test with the interactive demo

---

**Ready to test? Navigate to `/checkout-demo` and start exploring!** 🚀

