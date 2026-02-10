# 🔐 Persona Configuration - Quick Setup

## ✅ What You Have

- **API Key**: `<your-persona-api-key>`
- **Template ID**: `<your-persona-template-id>` (Government ID + Selfie verification)
- **Template Type**: Individual KYC (Government ID + Selfie)
- **Use Case**: This template will verify beneficial owners and business representatives

> **Note**: Your template verifies individuals (Government ID + Selfie), which is perfect for KYC verification of business owners and representatives as part of the overall KYB (Know Your Business) process!

---

## 🚀 Step 1: Configure Secrets in Supabase Dashboard

### Option A: Using Supabase Dashboard (EASIEST - NO LOGIN NEEDED!)

1. **Go to Supabase Dashboard**:
   - Visit: https://supabase.com/dashboard/project/crkhkzcscgoeyspaczux/settings/functions

2. **Navigate to Edge Functions Secrets**:
   - Click on "Edge Functions" in the left sidebar
   - Click on "Manage secrets" or go to Settings → Functions

3. **Add the following secrets** (click "Add new secret" for each):

   | Secret Name | Secret Value |
   |------------|--------------|
   | `PERSONA_API_KEY` | `<your-persona-api-key>` |
   | `PERSONA_TEMPLATE_ID` | `<your-persona-template-id>` |
   | `PERSONA_ENVIRONMENT` | `sandbox` |
   | `FRONTEND_URL` | `http://localhost:8080` |

4. **Click "Save"** after adding each secret

---

## 📡 Step 2: Configure Webhook in Persona Dashboard

1. **Go to Persona Dashboard**:
   - Visit: https://dashboard.withpersona.com

2. **Navigate to Webhooks**:
   - Click on "Settings" → "Webhooks" (or "Developers" → "Webhooks")

3. **Add New Webhook**:
   - Click "Add Webhook" or "Create Webhook"

4. **Configure Webhook**:
   - **URL**: `https://crkhkzcscgoeyspaczux.supabase.co/functions/v1/persona-webhook`
   - **Events to subscribe** (select these):
     - ✅ `inquiry.started`
     - ✅ `inquiry.completed`
     - ✅ `inquiry.failed`
     - ✅ `inquiry.expired`
     - ✅ `report.ready`

5. **Save the Webhook**

6. **Copy the Webhook Secret**:
   - After saving, Persona will show you a webhook secret (starts with `whsec_...`)
   - Copy this secret

7. **Add Webhook Secret to Supabase**:
   - Go back to: https://supabase.com/dashboard/project/crkhkzcscgoeyspaczux/settings/functions
   - Add one more secret:
     - **Name**: `PERSONA_WEBHOOK_SECRET`
     - **Value**: `whsec_YOUR_SECRET_HERE` (paste the secret from Persona)
   - Click "Save"

---

## ✅ Step 3: Verify Configuration

### Check that all secrets are set:

Go to: https://supabase.com/dashboard/project/crkhkzcscgoeyspaczux/settings/functions

You should see these 5 secrets:
- ✅ `PERSONA_API_KEY`
- ✅ `PERSONA_TEMPLATE_ID`
- ✅ `PERSONA_ENVIRONMENT`
- ✅ `FRONTEND_URL`
- ✅ `PERSONA_WEBHOOK_SECRET`

---

## 🧪 Step 4: Test the Integration

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Open your app**:
   - Go to: http://localhost:8080

3. **Login and navigate to Compliance page**:
   - Login to your merchant account
   - Go to the "Compliance" page

4. **Click "Start Verification"**:
   - The Persona modal should open
   - You can use test data to complete verification

### Test Data for Sandbox:

Since your template is for **Individual KYC (Government ID + Selfie)**, use these test scenarios:

**To test APPROVED verification:**
- First Name: `PASS`
- Last Name: `Test`
- Date of Birth: `01/01/1990`
- Government ID: Upload any test image (Persona will auto-approve in sandbox)
- Selfie: Upload any test image

**To test DECLINED verification:**
- First Name: `FAIL`
- Last Name: `Test`
- (Use same other details)

**To test REVIEW verification:**
- First Name: `REVIEW`
- Last Name: `Test`
- (Use same other details)

> **Tip**: In Persona sandbox, using "PASS", "FAIL", or "REVIEW" in the first name will trigger those specific outcomes!

---

## 🎉 You're Done!

Once you complete these steps:
- ✅ Persona integration is fully configured
- ✅ Your app can verify businesses automatically
- ✅ Webhooks will update verification status in real-time
- ✅ You can test with sandbox data

---

## 🔍 Troubleshooting

### Issue: "Persona API key not configured"
**Solution**: Make sure you added `PERSONA_API_KEY` in Supabase dashboard and saved it.

### Issue: "Failed to load Persona SDK"
**Solution**: 
- Check browser console for errors
- Make sure you have internet connection
- Try clearing browser cache

### Issue: "Webhook not receiving events"
**Solution**:
1. Verify webhook URL is correct in Persona dashboard
2. Check that you selected the right events
3. Make sure `PERSONA_WEBHOOK_SECRET` is set in Supabase

---

## 📞 Need Help?

- **Persona Docs**: https://docs.withpersona.com
- **Persona Dashboard**: https://dashboard.withpersona.com
- **Supabase Dashboard**: https://supabase.com/dashboard/project/crkhkzcscgoeyspaczux

---

**Next Steps**: After configuration, test the verification flow to make sure everything works!

