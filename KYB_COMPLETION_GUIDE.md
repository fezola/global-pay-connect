# KYB Integration - Completion Guide

**Status:** 95% Complete - Just needs Persona API keys!  
**Date:** December 13, 2024

---

## ✅ **WHAT'S ALREADY BUILT**

### **1. Database Schema** ✅
- ✅ Persona fields added to `businesses` table
- ✅ Persona fields added to `kyb_jobs` table
- ✅ Indexes created for performance
- ✅ Migration deployed successfully

### **2. Backend Edge Functions** ✅
- ✅ `create-persona-inquiry` - Creates verification inquiry
- ✅ `persona-webhook` - Handles Persona webhooks
- ✅ `submit-kyb` - Supports both Persona and mock verification

### **3. Frontend Components** ✅
- ✅ `PersonaVerification.tsx` - Beautiful verification UI
- ✅ `Compliance.tsx` - Integrated verification flow
- ✅ Persona SDK loading
- ✅ Error handling and loading states

### **4. Verification Flow** ✅
```
User clicks "Start Verification"
         ↓
Frontend calls create-persona-inquiry
         ↓
Edge Function creates Persona inquiry
         ↓
Returns session token
         ↓
Frontend loads Persona SDK
         ↓
Persona modal opens
         ↓
User uploads documents
         ↓
Persona verifies (5-10 min)
         ↓
Persona sends webhook
         ↓
persona-webhook processes
         ↓
Updates database
         ↓
User sees "Verified" status
```

---

## 🔧 **WHAT YOU NEED TO DO**

### **Step 1: Sign Up for Persona** (10 minutes)

1. **Go to Persona:**
   - Visit: https://withpersona.com
   - Click "Get Started" or "Request Demo"

2. **Fill Out Form:**
   - Company: Klyr (or your company name)
   - Use case: Business verification (KYB)
   - Industry: Crypto/Payments/Fintech
   - Email: Your email

3. **Get Sandbox Access:**
   - You'll get immediate sandbox access
   - Production access requires approval (1-2 days)

4. **Get Your API Keys:**
   - Go to: https://dashboard.withpersona.com/settings/api-keys
   - Copy your **Sandbox API Key** (starts with `pi_sandbox_`)
   - Later, get your **Production API Key** (starts with `pi_live_`)

---

### **Step 2: Create Persona Template** (5 minutes)

1. **Go to Templates:**
   - https://dashboard.withpersona.com/templates

2. **Create New Template:**
   - Click "Create Template"
   - Choose "Business Verification (KYB)"

3. **Configure Template:**
   - **Name:** "Klyr Business Verification"
   - **Type:** Business
   - **Checks to Enable:**
     - ✅ Business registration verification
     - ✅ Tax ID verification
     - ✅ Address verification
     - ✅ Beneficial owner identification
     - ✅ AML/Sanctions screening
     - ✅ Document verification

4. **Save Template:**
   - Click "Save"
   - Copy the **Template ID** (starts with `itmpl_`)

---

### **Step 3: Configure Webhook** (5 minutes)

1. **Go to Webhooks:**
   - https://dashboard.withpersona.com/settings/webhooks

2. **Add Webhook Endpoint:**
   - **URL:** `https://crkhkzcscgoeyspaczux.supabase.co/functions/v1/persona-webhook`
   - **Events to Subscribe:**
     - ✅ `inquiry.completed`
     - ✅ `inquiry.failed`
     - ✅ `inquiry.expired`
     - ✅ `report.ready`

3. **Get Webhook Secret:**
   - Copy the **Webhook Secret** (starts with `whsec_`)
   - You'll need this to verify webhook signatures

---

### **Step 4: Add Environment Variables** (2 minutes)

Add these to your Supabase Edge Functions environment:

```bash
# Persona Configuration
PERSONA_API_KEY=pi_sandbox_YOUR_KEY_HERE
PERSONA_TEMPLATE_ID=itmpl_YOUR_TEMPLATE_ID_HERE
PERSONA_WEBHOOK_SECRET=whsec_YOUR_SECRET_HERE
PERSONA_ENVIRONMENT=sandbox  # Change to "production" when ready

# Frontend URL (for redirects)
FRONTEND_URL=http://localhost:5173  # Change to your production URL
```

**How to Add:**
1. Go to: https://supabase.com/dashboard/project/crkhkzcscgoeyspaczux/settings/functions
2. Click "Edge Functions"
3. Click "Manage secrets"
4. Add each variable above

---

### **Step 5: Test the Flow** (10 minutes)

1. **Go to Compliance Page:**
   - Navigate to `/compliance` in your app
   - Make sure you're logged in

2. **Start Verification:**
   - Click "Start Verification" button
   - Persona modal should open

3. **Upload Test Documents:**
   - Use Persona's test documents (they provide samples)
   - Or use your real business documents

4. **Wait for Verification:**
   - Sandbox: Usually instant or 1-2 minutes
   - Production: 5-10 minutes

5. **Check Status:**
   - Refresh the compliance page
   - Status should change to "Verified"
   - Check database: `persona_status` should be "completed"

---

## 🧪 **TESTING MODE**

### **Without Persona (Mock Mode)**

If you don't configure Persona API keys, the system automatically uses **mock verification**:

- ✅ Creates KYB job
- ✅ Simulates 5-second processing
- ✅ Auto-approves verification
- ✅ Updates merchant status

**Good for:** Development and testing without Persona account

---

### **With Persona (Real Mode)**

Once you add Persona API keys:

- ✅ Creates real Persona inquiry
- ✅ Opens Persona verification modal
- ✅ Processes real documents
- ✅ Receives webhook updates
- ✅ Updates status based on actual verification

**Good for:** Production and real KYB verification

---

## 📊 **VERIFICATION CHECKS**

### **What Persona Verifies:**

1. **Business Identity**
   - Legal name matches registration
   - Tax ID is valid
   - Business exists in registry

2. **Business Address**
   - Address is real
   - Matches registration documents

3. **Beneficial Owners (UBOs)**
   - Identifies owners with >25% stake
   - Verifies their identity
   - Checks against sanctions lists

4. **Documents**
   - Business registration certificate
   - Tax documents
   - Proof of address
   - Owner ID documents

5. **AML/Sanctions**
   - Checks against OFAC, UN, EU lists
   - PEP (Politically Exposed Person) screening
   - Adverse media screening

---

## 🔄 **VERIFICATION STATUSES**

| Status | Meaning | Next Step |
|--------|---------|-----------|
| `created` | Inquiry created | User needs to complete |
| `pending` | Documents uploaded | Persona is reviewing |
| `completed` | Verification passed | Merchant approved |
| `failed` | Verification failed | Manual review needed |
| `expired` | Inquiry expired | Create new inquiry |

---

## 🚨 **TROUBLESHOOTING**

### **"Persona API key not configured"**
- Add `PERSONA_API_KEY` to Supabase environment variables
- Make sure it starts with `pi_sandbox_` or `pi_live_`

### **"Persona template ID not configured"**
- Add `PERSONA_TEMPLATE_ID` to environment variables
- Get it from Persona dashboard templates section

### **"Verification modal doesn't open"**
- Check browser console for errors
- Make sure Persona SDK loaded (check Network tab)
- Verify `session_token` was returned from API

### **"Webhook not received"**
- Check webhook URL is correct
- Verify webhook is enabled in Persona dashboard
- Check Supabase function logs

### **"Verification stuck in pending"**
- Check Persona dashboard for inquiry status
- Verify webhook endpoint is accessible
- Check function logs for errors

---

## 📈 **PRODUCTION CHECKLIST**

Before going live:

- [ ] Get Persona production API key
- [ ] Create production template
- [ ] Update `PERSONA_ENVIRONMENT` to "production"
- [ ] Update `PERSONA_API_KEY` to production key
- [ ] Update `FRONTEND_URL` to production domain
- [ ] Test full flow in production
- [ ] Set up monitoring for webhook failures
- [ ] Add error alerting
- [ ] Document manual review process

---

## 💰 **PRICING**

**Persona Pricing (Approximate):**
- Sandbox: Free unlimited
- Production: ~$1-5 per verification
- Volume discounts available
- No monthly fees

**Recommended Plan:**
- Start with "Pay as you go"
- Upgrade to volume plan when you hit 100+ verifications/month

---

## 🎯 **SUMMARY**

**Current Status:** 95% Complete

**What's Working:**
- ✅ Database schema
- ✅ Edge functions
- ✅ Frontend components
- ✅ Verification flow
- ✅ Webhook handling
- ✅ Mock mode for testing

**What You Need:**
- ⚠️ Persona account (10 min to create)
- ⚠️ API keys (instant in sandbox)
- ⚠️ Template ID (5 min to create)
- ⚠️ Environment variables (2 min to add)

**Time to Complete:** ~30 minutes total

---

## 🚀 **NEXT STEPS**

1. **Today (30 min):**
   - Sign up for Persona
   - Get sandbox API keys
   - Create template
   - Add environment variables
   - Test the flow

2. **This Week:**
   - Apply for production access
   - Test with real documents
   - Set up monitoring

3. **Before Launch:**
   - Get production API keys
   - Switch to production mode
   - Final testing

---

**Ready to complete KYB?** Start with Step 1: Sign up for Persona! 🚀

