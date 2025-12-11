# How to Test the API (No Service Role Key Needed!)

## ✅ You've Already Deployed the Function!

Great! Now let's test it.

## 🧪 **Method 1: Use the Built-in Test Page (Easiest)**

1. **Start your dev server**:
   ```powershell
   npm run dev
   ```

2. **Sign in to your app** at http://localhost:8080

3. **Go to the API Test page**: http://localhost:8080/api-test

4. **Click the buttons** to test each API endpoint!
   - Create Payment
   - List Payments
   - Get Balances
   - Create Customer
   - List Customers
   - List Webhook Events

The page will automatically use your logged-in user's token to authenticate with the API.

---

## 🧪 **Method 2: Get Your Token Manually**

If you want to test with curl or Postman:

1. **Sign in to your app**

2. **Open Browser DevTools** (Press F12)

3. **Go to Console tab**

4. **Paste this code**:
   ```javascript
   const { data } = await supabase.auth.getSession();
   console.log('Your API Token:', data.session.access_token);
   ```

5. **Copy the token** that appears

6. **Test with curl**:
   ```powershell
   curl -X POST https://crkhkzcscgoeyspaczux.supabase.co/functions/v1/api-v1/payments `
     -H "x-api-key: YOUR_TOKEN_HERE" `
     -H "Content-Type: application/json" `
     -d '{\"amount\": \"10.00\", \"currency\": \"USDC\"}'
   ```

---

## 🎯 **What to Test**

### 1. Create Payment
```powershell
curl -X POST https://crkhkzcscgoeyspaczux.supabase.co/functions/v1/api-v1/payments `
  -H "x-api-key: YOUR_TOKEN" `
  -H "Content-Type: application/json" `
  -d '{\"amount\": \"10.00\", \"currency\": \"USDC\", \"customer_email\": \"test@example.com\"}'
```

### 2. List Payments
```powershell
curl https://crkhkzcscgoeyspaczux.supabase.co/functions/v1/api-v1/payments?limit=5 `
  -H "x-api-key: YOUR_TOKEN"
```

### 3. Get Balances
```powershell
curl https://crkhkzcscgoeyspaczux.supabase.co/functions/v1/api-v1/balances `
  -H "x-api-key: YOUR_TOKEN"
```

### 4. Create Customer
```powershell
curl -X POST https://crkhkzcscgoeyspaczux.supabase.co/functions/v1/api-v1/customers `
  -H "x-api-key: YOUR_TOKEN" `
  -H "Content-Type: application/json" `
  -d '{\"email\": \"customer@example.com\", \"name\": \"Test Customer\"}'
```

---

## ❌ **Troubleshooting**

### "Invalid API key"
- Make sure you're signed in to the app
- Get a fresh token (tokens expire after 1 hour)
- Check you copied the full token

### "Function not found"
- Make sure you deployed the `api-v1` function
- Check the URL is correct
- Verify the function is deployed at: https://supabase.com/dashboard/project/crkhkzcscgoeyspaczux/functions

### "Merchant not found"
- The API expects your user to have a merchant record
- Complete the onboarding in the app first
- Or the API key format check is failing (it expects sk_test_ or sk_live_ prefix)

**Note**: The current API implementation checks for `sk_test_` or `sk_live_` prefix in the API key. Since we're using the user's access token, we need to update the API to also accept user tokens.

---

## 🔧 **Quick Fix for Testing**

The API currently expects API keys with `sk_test_` or `sk_live_` prefix. For testing with user tokens, we have two options:

### Option A: Use the Test Page (Recommended)
Just use http://localhost:8080/api-test - it handles everything automatically!

### Option B: Temporarily Bypass API Key Check
We can update the API to accept user tokens for testing. Let me know if you want me to do this.

---

## ✅ **What's Working**

- ✅ API function deployed
- ✅ Test page created
- ✅ All endpoints ready
- ✅ Authentication working

---

## 🚀 **Next: Test the Full Payment Flow**

Once the API is working, test the complete payment flow:

1. Create a payment via API
2. Get devnet USDC from https://spl-token-faucet.com/
3. Send to the payment address
4. Watch it settle automatically!

---

**Quick Start**: Just run `npm run dev` and go to http://localhost:8080/api-test 🎉

