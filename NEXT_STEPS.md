# Next Steps - Deploy & Test API

Follow these steps to deploy and test your API.

## Step 1: Deploy the API Function

### Option A: Using npm script (Recommended)

```powershell
npm run deploy:api
```

This will deploy the `api-v1` edge function to Supabase.

### Option B: Manual deployment

```powershell
npx supabase functions deploy api-v1 --project-ref crkhkzcscgoeyspaczux --no-verify-jwt
```

### Option C: Via Supabase Dashboard

1. Go to: https://supabase.com/dashboard/project/crkhkzcscgoeyspaczux/functions
2. Click "Deploy new function"
3. Upload the `supabase/functions/api-v1` folder
4. Set "Verify JWT" to **No**
5. Click "Deploy"

---

## Step 2: Get Your API Key

You need an API key to test the API. Here's how to get it:

### Method 1: From Dashboard (Temporary)

1. Go to: https://supabase.com/dashboard/project/crkhkzcscgoeyspaczux/settings/api
2. Copy the **anon key** (this is temporary for testing)
3. Use it as: `sk_test_YOUR_ANON_KEY`

### Method 2: Generate Proper API Key

We need to add API key generation to the merchant dashboard. For now, you can:

1. Sign in to your app
2. Go to Settings → API Keys
3. Copy your test API key (starts with `sk_test_`)

**For quick testing**, use the service role key:
1. Go to: https://supabase.com/dashboard/project/crkhkzcscgoeyspaczux/settings/api
2. Copy the **service_role** key
3. ⚠️ **Keep this secret!** Don't share or commit it

---

## Step 3: Test the API

### Quick Test (PowerShell)

```powershell
# Replace YOUR_API_KEY with your actual key
.\test-api.ps1 -ApiKey "YOUR_API_KEY"
```

This will run all API tests automatically.

### Manual Test (curl)

**Test 1: Create Payment**

```powershell
curl -X POST https://crkhkzcscgoeyspaczux.supabase.co/functions/v1/api-v1/payments `
  -H "x-api-key: YOUR_API_KEY" `
  -H "Content-Type: application/json" `
  -d '{\"amount\": \"10.00\", \"currency\": \"USDC\", \"customer_email\": \"test@example.com\"}'
```

**Test 2: List Payments**

```powershell
curl https://crkhkzcscgoeyspaczux.supabase.co/functions/v1/api-v1/payments?limit=5 `
  -H "x-api-key: YOUR_API_KEY"
```

**Test 3: Get Balances**

```powershell
curl https://crkhkzcscgoeyspaczux.supabase.co/functions/v1/api-v1/balances `
  -H "x-api-key: YOUR_API_KEY"
```

---

## Step 4: Test the SDK

### Install SDK Dependencies

```powershell
cd sdk
npm install
```

### Run Example

```powershell
# Set your API key
$env:KLYR_API_KEY="YOUR_API_KEY"

# Run example
npx tsx examples/basic-usage.ts
```

---

## Step 5: Integrate into Your App

### Option 1: Use REST API Directly

```typescript
const response = await fetch('https://crkhkzcscgoeyspaczux.supabase.co/functions/v1/api-v1/payments', {
  method: 'POST',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    amount: '100.00',
    currency: 'USDC',
    customer_email: 'customer@example.com',
  }),
});

const payment = await response.json();
```

### Option 2: Use SDK (Recommended)

```typescript
import Klyr from '@klyr/sdk';

const klyr = new Klyr({
  apiKey: process.env.KLYR_API_KEY,
});

const payment = await klyr.payments.create({
  amount: '100.00',
  currency: 'USDC',
  customer_email: 'customer@example.com',
});
```

---

## Troubleshooting

### "Function not found"

The API function hasn't been deployed yet. Run:
```powershell
npm run deploy:api
```

### "Invalid API key"

Make sure you're using the correct API key format:
- Test mode: `sk_test_...`
- Live mode: `sk_live_...`

For testing, you can use the service role key from Supabase dashboard.

### "Rate limit exceeded"

You've made more than 100 requests in 1 minute. Wait a minute and try again.

### "CORS error"

The API includes CORS headers. If you're getting CORS errors:
1. Make sure you're calling the correct URL
2. Check that the function is deployed
3. Verify the request headers are correct

---

## What's Working Now

After completing these steps, you'll have:

✅ **REST API** - Fully functional API for payments, balances, customers
✅ **SDK** - TypeScript SDK ready to use
✅ **Authentication** - API key authentication working
✅ **Rate Limiting** - 100 req/min protection
✅ **Documentation** - Complete API reference

---

## Next Phase: Payout Processing

Once the API is tested and working, we can move to Phase 3:

1. **On-chain Withdrawals** - Send crypto from balance to external wallets
2. **Bank Integration** - Off-ramp to fiat via Stripe Connect
3. **Approval Workflow** - Multi-user approval for payouts
4. **Payout Scheduling** - Automated payout schedules

---

## Quick Reference

**API Base URL**: 
```
https://crkhkzcscgoeyspaczux.supabase.co/functions/v1/api-v1
```

**Endpoints**:
- `POST /payments` - Create payment
- `GET /payments/{id}` - Get payment
- `GET /payments` - List payments
- `GET /balances` - Get balances
- `POST /customers` - Create customer
- `GET /customers` - List customers
- `GET /webhooks` - List webhook events

**Authentication Header**:
```
x-api-key: YOUR_API_KEY
```

**Documentation**:
- API Reference: `docs/API_REFERENCE.md`
- OpenAPI Spec: `docs/openapi.yaml`
- SDK Guide: `sdk/README.md`

---

## Support

Need help? Check:
- `PHASE_2_COMPLETE.md` - Phase 2 summary
- `docs/API_REFERENCE.md` - Complete API docs
- `DEPLOYMENT.md` - Deployment guide
- `TROUBLESHOOTING.md` - Common issues

---

**Ready to deploy?** Run: `npm run deploy:api` 🚀

