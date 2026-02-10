# 🚀 Deployment Guide - Critical Features

## ✅ WHAT'S BEEN DEPLOYED

### **Database Migrations** - ALL DEPLOYED ✅
All 3 migrations have been successfully deployed to your Supabase database:

1. ✅ **Email Notifications** (`20251214000000_email_notifications.sql`)
2. ✅ **Analytics Views** (`20251214000001_analytics_views.sql`)
3. ✅ **Refunds System** (`20251214000002_refunds.sql`)

---

## ⏳ WHAT NEEDS TO BE DEPLOYED

### **Edge Functions** - NEED DEPLOYMENT

The following Edge Functions have been created but need to be deployed:

#### **Email System:**
- `send-email` - Sends emails via Resend.com
- `process-email-queue` - Processes queued emails

#### **Analytics:**
- `get-analytics` - Fetches analytics data

#### **Refunds:**
- `create-refund` - Creates refund requests
- `approve-refund` - Approves refund requests

---

## 📝 HOW TO DEPLOY EDGE FUNCTIONS

### **Option 1: Using Supabase CLI (Recommended)**

```bash
# Login to Supabase
npx supabase login

# Deploy all functions
npx supabase functions deploy get-analytics --project-ref crkhkzcscgoeyspaczux
npx supabase functions deploy send-email --project-ref crkhkzcscgoeyspaczux
npx supabase functions deploy process-email-queue --project-ref crkhkzcscgoeyspaczux
npx supabase functions deploy create-refund --project-ref crkhkzcscgoeyspaczux
npx supabase functions deploy approve-refund --project-ref crkhkzcscgoeyspaczux
```

### **Option 2: Using Supabase Dashboard**

1. Go to: https://supabase.com/dashboard/project/crkhkzcscgoeyspaczux/functions
2. Click "Deploy new function"
3. Upload each function folder
4. Deploy

---

## 🔑 REQUIRED ENVIRONMENT VARIABLES

After deploying Edge Functions, add these secrets in Supabase Dashboard:

**Go to:** https://supabase.com/dashboard/project/crkhkzcscgoeyspaczux/settings/functions

### **For Email System:**
```
Name: RESEND_API_KEY
Value: <Get from https://resend.com/api-keys>
```

### **For Frontend URLs:**
```
Name: FRONTEND_URL
Value: http://localhost:8080 (or your production URL)
```

### **For Persona (if not already added):**
```
Name: PERSONA_API_KEY
Value: <your-persona-api-key>

Name: PERSONA_TEMPLATE_ID
Value: <your-persona-template-id>

Name: PERSONA_ENVIRONMENT
Value: sandbox
```

---

## 🧪 TESTING AFTER DEPLOYMENT

### **1. Test Analytics Dashboard**
```bash
npm run dev
```
Then visit: http://localhost:8080/analytics

**Expected Result:**
- Should see analytics dashboard
- Charts should load (may be empty if no data)
- No errors in console

### **2. Test Email System**
1. Create a test payment
2. Check `email_queue` table in Supabase
3. Manually trigger `process-email-queue` function
4. Check if email was sent

### **3. Test Refund System**
1. Create a successful payment
2. Go to transaction details
3. Click "Refund" button (once UI is built)
4. Check `refunds` table in Supabase

---

## 📊 CURRENT STATUS

| Component | Status | Action Needed |
|-----------|--------|---------------|
| Database Migrations | ✅ Deployed | None |
| Analytics Views | ✅ Live | None |
| Email Queue Table | ✅ Live | None |
| Refunds Table | ✅ Live | None |
| Edge Functions | ⏳ Not Deployed | Deploy via CLI or Dashboard |
| Frontend Code | ✅ Ready | None |
| Environment Variables | ⏳ Not Set | Add to Supabase |

---

## 🎯 NEXT STEPS (In Order)

### **Step 1: Deploy Edge Functions** (10 minutes)
Use Supabase CLI or Dashboard to deploy the 5 new Edge Functions

### **Step 2: Add Environment Variables** (5 minutes)
Add `RESEND_API_KEY` and `FRONTEND_URL` to Supabase secrets

### **Step 3: Test Analytics** (5 minutes)
Visit `/analytics` page and verify it loads without errors

### **Step 4: Test Email System** (10 minutes)
Create a test payment and verify email is queued

### **Step 5: Continue Building** (2-4 hours)
- Complete Refund UI
- Build 2FA system
- Final testing

---

## 🚨 TROUBLESHOOTING

### **Analytics page shows errors:**
- Check if `get-analytics` Edge Function is deployed
- Check browser console for specific error
- Verify database views exist (they do ✅)

### **Emails not sending:**
- Check if `RESEND_API_KEY` is set in Supabase
- Check if `send-email` Edge Function is deployed
- Check `email_queue` table for pending emails

### **Refunds not working:**
- Check if refund Edge Functions are deployed
- Verify `refunds` table exists (it does ✅)
- Check browser console for errors

---

## 📞 SUPPORT

If you encounter issues:
1. Check browser console for errors
2. Check Supabase logs: https://supabase.com/dashboard/project/crkhkzcscgoeyspaczux/logs/edge-functions
3. Check database tables in Supabase Table Editor
4. Ask me for help!

---

**Status**: 🟡 Ready for Deployment  
**Blocking**: Edge Functions need to be deployed  
**ETA**: 10-15 minutes to deploy everything

