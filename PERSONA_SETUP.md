# 🔐 Persona KYB Setup Guide

Complete guide to set up Persona for automated business verification.

---

## 📋 Prerequisites

- [ ] Klyr deployment complete (Edge Functions, Frontend, Database)
- [ ] Business email address
- [ ] Company information ready

---

## ✅ Prerequisites Complete

- ✅ Edge Functions deployed (via migrations)
- ✅ Database schema updated
- ✅ Frontend components ready

---

## 🚀 Step 1: Sign Up for Persona (10 min)

### 1.1 Create Account

1. Go to: **https://withpersona.com**
2. Click **"Get Started"** or **"Request Demo"**
3. Fill out the signup form:
   - **Company Name:** Klyr
   - **Email:** your-business-email@klyr.io
   - **Use Case:** Business Verification (KYB)
   - **Industry:** Crypto/Payments or Fintech
   - **Expected Volume:** Start with 10-100/month

### 1.2 Verify Email

1. Check your email for verification link
2. Click link to verify account
3. Complete onboarding questionnaire

### 1.3 Access Dashboard

1. Log in to: **https://dashboard.withpersona.com**
2. You'll see the Persona dashboard
3. Navigate to **Settings → API Keys**

---

## 🔑 Step 2: Get API Keys (5 min)

### 2.1 Sandbox API Key

1. In Persona Dashboard, go to **Settings → API Keys**
2. Find **Sandbox API Key** section
3. Click **"Reveal"** to see the key
4. Copy the key (starts with `persona_sandbox_...`)
5. Save it securely

### 2.2 Create Inquiry Template

1. Go to **Inquiries → Templates**
2. Click **"Create Template"**
3. Select **"Business Verification"** template
4. Configure the template:
   - **Name:** "Klyr Business Verification"
   - **Type:** Business (KYB)
   - **Checks to include:**
     - ✅ Business registration lookup
     - ✅ Tax ID verification
     - ✅ Address verification
     - ✅ Document verification
     - ✅ Beneficial owner identification
     - ✅ AML/sanctions screening
5. Click **"Save Template"**
6. Copy the **Template ID** (starts with `itmpl_...`)

### 2.3 Get Environment ID

1. In Persona Dashboard, go to **Settings → Environments**
2. Find **Sandbox Environment**
3. Copy the **Environment ID** (starts with `env_...`)

---

## ⚙️ Step 3: Configure Supabase (10 min)

### 3.1 Set Supabase Secrets

```bash
# Navigate to your project
cd c:\Users\Hp\global-pay-connect

# Login to Supabase
npx supabase login

# Link to your project
npx supabase link --project-ref crkhkzcscgoeyspaczux

# Set Persona API key
npx supabase secrets set PERSONA_API_KEY="persona_sandbox_YOUR_KEY_HERE"

# Set Persona template ID
npx supabase secrets set PERSONA_TEMPLATE_ID="itmpl_YOUR_TEMPLATE_ID_HERE"

# Set Persona environment (sandbox or production)
npx supabase secrets set PERSONA_ENVIRONMENT="sandbox"

# Set frontend URL for redirects
npx supabase secrets set FRONTEND_URL="http://localhost:8080"
```

### 3.2 Verify Secrets

```bash
# List all secrets
npx supabase secrets list
```

You should see:
- `PERSONA_API_KEY`
- `PERSONA_TEMPLATE_ID`
- `PERSONA_ENVIRONMENT`
- `FRONTEND_URL`

---

## 📡 Step 4: Set Up Webhooks (5 min)

### 4.1 Get Webhook URL

**Note:** Edge Functions are deployed automatically via `npx supabase db push` (no manual deployment needed).

Your webhook URL will be:
```
https://crkhkzcscgoeyspaczux.supabase.co/functions/v1/persona-webhook
```

### 4.3 Configure Webhook in Persona

1. In Persona Dashboard, go to **Settings → Webhooks**
2. Click **"Add Webhook"**
3. Enter webhook URL (from above)
4. Select events to receive:
   - ✅ `inquiry.started`
   - ✅ `inquiry.completed`
   - ✅ `inquiry.failed`
   - ✅ `inquiry.expired`
   - ✅ `report.ready`
5. Click **"Create Webhook"**
6. Copy the **Webhook Secret** (starts with `whsec_...`)

### 4.4 Set Webhook Secret

```bash
npx supabase secrets set PERSONA_WEBHOOK_SECRET="whsec_YOUR_SECRET_HERE"
```

---

## 🗄️ Step 5: Run Database Migration (2 min)

```bash
# Apply the Persona integration migration
npx supabase db push
```

This adds Persona-specific fields to your database.

---

## 📦 Step 6: Install Frontend Dependencies (3 min)

```bash
# Install Persona SDK
npm install persona

# Install dependencies
npm install
```

---

## 🧪 Step 7: Test Integration (15 min)

### 7.1 Start Development Server

```bash
npm run dev
```

### 7.2 Test Verification Flow

1. Open browser: **http://localhost:8080**
2. Log in to your merchant account
3. Go to **Compliance** page
4. Click **"Start Verification"** button
5. Persona modal should open
6. Use test data:
   - **Business Name:** Test Business Inc
   - **Tax ID:** 12-3456789
   - **Country:** United States
   - **Address:** 123 Test St, San Francisco, CA 94105

### 7.3 Test Outcomes

Persona provides test scenarios in sandbox:

**To test PASS:**
- Use business name containing "PASS"
- Example: "PASS Test Business Inc"

**To test FAIL:**
- Use business name containing "FAIL"
- Example: "FAIL Test Business Inc"

**To test REVIEW:**
- Use business name containing "REVIEW"
- Example: "REVIEW Test Business Inc"

### 7.4 Verify Webhook

1. Complete a test verification
2. Check Supabase logs:
   ```bash
   npx supabase functions logs persona-webhook
   ```
3. You should see webhook events being received
4. Check database to verify status updates

---

## 🚀 Step 8: Deploy to Production (When Ready)

### 8.1 Apply for Production Access

1. In Persona Dashboard, click **"Go Live"**
2. Complete production application:
   - Business details
   - Use case description
   - Expected volume
   - Compliance requirements
3. Wait for approval (usually 1-3 business days)

### 8.2 Get Production API Keys

1. Once approved, go to **Settings → API Keys**
2. Find **Production API Key** section
3. Copy production API key
4. Copy production template ID
5. Copy production environment ID

### 8.3 Update Production Secrets

```bash
# Set production API key
npx supabase secrets set PERSONA_API_KEY="persona_live_YOUR_PRODUCTION_KEY"

# Set production template ID
npx supabase secrets set PERSONA_TEMPLATE_ID="itmpl_YOUR_PRODUCTION_TEMPLATE"

# Set production environment
npx supabase secrets set PERSONA_ENVIRONMENT="production"

# Set production frontend URL
npx supabase secrets set FRONTEND_URL="https://app.klyr.io"
```

### 8.4 Update Production Webhook

1. In Persona Dashboard (Production), go to **Settings → Webhooks**
2. Add production webhook URL:
   ```
   https://crkhkzcscgoeyspaczux.supabase.co/functions/v1/persona-webhook
   ```
3. Copy production webhook secret
4. Set in Supabase:
   ```bash
   npx supabase secrets set PERSONA_WEBHOOK_SECRET="whsec_YOUR_PRODUCTION_SECRET"
   ```

---

## ✅ Verification Checklist

- [ ] Persona account created
- [ ] Sandbox API key obtained
- [ ] Inquiry template created
- [ ] Supabase secrets configured
- [ ] Webhook handler deployed
- [ ] Webhook configured in Persona
- [ ] Database migration applied
- [ ] Frontend dependencies installed
- [ ] Test verification completed successfully
- [ ] Webhook events received and processed
- [ ] Database updated correctly

---

## 🔍 Troubleshooting

### Issue: "Persona API key not configured"

**Solution:**
```bash
npx supabase secrets set PERSONA_API_KEY="your_key_here"
npx supabase functions deploy create-persona-inquiry
```

### Issue: "Failed to load Persona SDK"

**Solution:**
- Check browser console for errors
- Verify internet connection
- Try clearing browser cache

### Issue: "Webhook not receiving events"

**Solution:**
1. Verify webhook URL is correct
2. Check Persona Dashboard → Webhooks → Event Log
3. Check Supabase function logs:
   ```bash
   npx supabase functions logs persona-webhook
   ```

### Issue: "Invalid webhook signature"

**Solution:**
```bash
npx supabase secrets set PERSONA_WEBHOOK_SECRET="whsec_correct_secret"
npx supabase functions deploy persona-webhook
```

---

## 📞 Support

### Persona Support
- **Email:** support@withpersona.com
- **Docs:** https://docs.withpersona.com
- **Dashboard:** https://dashboard.withpersona.com
- **Status:** https://status.withpersona.com

### Klyr Support
- Check `KYB_INTEGRATION_GUIDE.md` for implementation details
- Check `KYB_PROVIDER_COMPARISON.md` for provider info

---

## 💰 Pricing Reminder

### Sandbox (Free)
- Unlimited test verifications
- All features available
- No credit card required

### Production
- ~$5-15 per business verification
- ~$1-3 per AML screening
- Volume discounts available
- Pay as you go

---

**You're all set! 🎉**

Your Klyr platform now has automated business verification powered by Persona!

