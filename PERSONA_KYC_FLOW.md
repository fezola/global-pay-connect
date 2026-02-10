# 🎯 How Persona KYC Works in Your Platform

## 📋 Overview

Your Persona template (Government ID + Selfie) is used for **individual identity verification** as part of your **KYB (Know Your Business)** process.

---

## 🔄 Complete Verification Flow

### **1. Business Registration** (Manual)
- Merchant fills out business information
- Company name, tax ID, address, etc.
- Stored in your database

### **2. Individual KYC Verification** (Persona - What you set up!)
This is where Persona comes in:

```
Merchant clicks "Start Verification"
         ↓
Frontend calls create-persona-inquiry Edge Function
         ↓
Edge Function creates Persona inquiry with template ID
         ↓
Returns session token
         ↓
Frontend loads Persona SDK
         ↓
Persona modal opens (embedded in your app)
         ↓
User completes verification:
  - Uploads Government ID (Driver's License, Passport, etc.)
  - Takes Selfie
  - Persona verifies ID is real
  - Persona matches selfie to ID photo
         ↓
Persona processes verification (5-30 seconds in sandbox)
         ↓
Persona sends webhook to your backend
         ↓
persona-webhook Edge Function receives event
         ↓
Updates database with verification status
         ↓
User sees "Verified" status in dashboard
```

---

## 👥 Who Gets Verified?

Your Persona template can verify:

1. **Business Representative** - The person submitting the KYB application
2. **Beneficial Owners (UBOs)** - Individuals who own 25%+ of the business
3. **Directors/Officers** - Key people in the company

---

## 🎨 What the User Sees

### Step 1: Compliance Dashboard
- User sees their verification status
- Clicks "Start Verification" button

### Step 2: Persona Modal Opens
- Embedded directly in your app (no redirect!)
- Clean, professional UI
- Mobile-friendly

### Step 3: ID Upload
- User uploads photo of government ID
- Front and back (if applicable)
- Persona auto-detects ID type

### Step 4: Selfie
- User takes a selfie
- Persona uses liveness detection
- Ensures it's a real person (not a photo of a photo)

### Step 5: Processing
- Persona verifies ID is authentic
- Matches selfie to ID photo
- Checks for fraud signals
- Usually takes 5-30 seconds in sandbox

### Step 6: Result
- User sees success message
- Dashboard updates to "Verified"
- They can now use production features

---

## 🔐 What Persona Checks

Your template (Government ID + Selfie) verifies:

✅ **ID Authenticity**
- Is the ID real or fake?
- Has it been tampered with?
- Is it expired?

✅ **Identity Match**
- Does the selfie match the ID photo?
- Is it the same person?

✅ **Liveness Detection**
- Is this a real person or a photo/video?
- Prevents spoofing attacks

✅ **Data Extraction**
- Extracts name, DOB, address from ID
- Validates format and checksums

---

## 📊 Verification Statuses

| Status | Meaning | What Happens |
|--------|---------|--------------|
| `created` | Inquiry created | User hasn't started yet |
| `started` | User opened modal | In progress |
| `completed` | User submitted | Persona is processing |
| `approved` | ✅ Verified | User can use platform |
| `declined` | ❌ Failed | User needs to retry or contact support |
| `expired` | ⏰ Timeout | User took too long, needs to restart |

---

## 🧪 Testing in Sandbox

### Automatic Approval (Easy Testing)
Use first name `PASS`:
- First Name: `PASS`
- Last Name: `Test`
- Upload any image for ID and selfie
- **Result**: Auto-approved in ~5 seconds

### Automatic Decline (Test Failure Flow)
Use first name `FAIL`:
- First Name: `FAIL`
- Last Name: `Test`
- **Result**: Auto-declined

### Manual Review (Test Review Flow)
Use first name `REVIEW`:
- First Name: `REVIEW`
- Last Name: `Test`
- **Result**: Marked for manual review

---

## 🚀 Production vs Sandbox

### **Sandbox** (What you have now)
- Free unlimited verifications
- Instant results with test data
- No real ID verification
- Perfect for development

### **Production** (When you go live)
- Real ID verification
- Real liveness detection
- Costs ~$1-3 per verification
- Takes 5-30 seconds for most IDs
- Some may require manual review (1-24 hours)

---

## 💡 Next Steps After Setup

Once Persona is configured:

1. **Test the flow** with sandbox data
2. **Customize the UI** (optional - Persona provides good defaults)
3. **Add beneficial owner verification** (verify multiple people per business)
4. **Apply for production access** when ready to go live
5. **Set up monitoring** to track verification success rates

---

## 🎉 Summary

Your Persona template is **perfectly configured** for individual KYC verification!

- ✅ Government ID verification
- ✅ Selfie + liveness detection
- ✅ Fraud prevention
- ✅ Fast results (5-30 seconds)
- ✅ Embedded in your app (no redirects)
- ✅ Mobile-friendly

This is a **critical part** of your KYB process and helps you:
- Comply with regulations
- Prevent fraud
- Build trust with users
- Enable production features safely

---

**Ready to configure?** Follow the steps in `PERSONA_CONFIGURATION.md`!

