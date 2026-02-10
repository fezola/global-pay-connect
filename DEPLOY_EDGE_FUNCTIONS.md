# 🚀 Edge Functions Deployment Guide

## Prerequisites

1. **Install Supabase CLI** (if not already installed):
```bash
npm install -g supabase
```

2. **Login to Supabase**:
```bash
npx supabase login
```

---

## 📦 Edge Functions to Deploy

You have **8 new Edge Functions** that need to be deployed:

### **Email System (3 functions)**
1. `send-email` - Core email sending function
2. `process-email-queue` - Processes email queue
3. `get-analytics` - Analytics data API

### **Refund System (3 functions)**
4. `create-refund` - Create refund requests
5. `approve-refund` - Approve refunds
6. `reject-refund` - Reject refunds

### **2FA System (3 functions)**
7. `setup-2fa` - Setup two-factor authentication
8. `verify-2fa` - Verify 2FA codes
9. `disable-2fa` - Disable 2FA

---

## 🔧 Deployment Commands

Run these commands one by one:

```bash
# Email System
npx supabase functions deploy send-email --project-ref crkhkzcscgoeyspaczux
npx supabase functions deploy process-email-queue --project-ref crkhkzcscgoeyspaczux
npx supabase functions deploy get-analytics --project-ref crkhkzcscgoeyspaczux

# Refund System
npx supabase functions deploy create-refund --project-ref crkhkzcscgoeyspaczux
npx supabase functions deploy approve-refund --project-ref crkhkzcscgoeyspaczux
npx supabase functions deploy reject-refund --project-ref crkhkzcscgoeyspaczux

# 2FA System
npx supabase functions deploy setup-2fa --project-ref crkhkzcscgoeyspaczux
npx supabase functions deploy verify-2fa --project-ref crkhkzcscgoeyspaczux
npx supabase functions deploy disable-2fa --project-ref crkhkzcscgoeyspaczux
```

---

## 🔑 Environment Variables

After deploying, add these secrets to Supabase:

### **1. Resend API Key** (for email notifications)

1. Sign up at https://resend.com (free tier available)
2. Get your API key
3. Add to Supabase:
   - Go to: https://supabase.com/dashboard/project/crkhkzcscgoeyspaczux/settings/functions
   - Click "Add new secret"
   - Name: `RESEND_API_KEY`
   - Value: `re_...` (your API key)

---

## ✅ Verification

After deployment, verify each function:

### **Test Analytics**
```bash
curl -X GET "https://crkhkzcscgoeyspaczux.supabase.co/functions/v1/get-analytics?type=overview&days=30" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### **Test Email**
```bash
curl -X POST "https://crkhkzcscgoeyspaczux.supabase.co/functions/v1/send-email" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"to":"test@example.com","subject":"Test","html":"<p>Test email</p>"}'
```

### **Test 2FA Setup**
```bash
curl -X POST "https://crkhkzcscgoeyspaczux.supabase.co/functions/v1/setup-2fa" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

---

## 🎯 What Happens After Deployment

### **✅ Email Notifications**
- Automatic welcome emails when merchants sign up
- Payment received notifications
- Payout approval notifications
- Email queue processing

### **✅ Analytics Dashboard**
- Real-time analytics data
- Revenue charts
- Customer insights
- CSV export

### **✅ Refund System**
- Create refund requests
- Approve/reject refunds
- Refund history tracking
- Webhook notifications

### **✅ 2FA Security**
- QR code generation for authenticator apps
- Backup codes
- Verification flow
- Audit logging

---

## 🐛 Troubleshooting

### **Error: "Access token not provided"**
- Make sure you ran `npx supabase login` first
- Try logging out and back in: `npx supabase logout` then `npx supabase login`

### **Error: "Project not found"**
- Verify project ref is correct: `crkhkzcscgoeyspaczux`
- Check you have access to the project

### **Function deployed but not working**
- Check function logs in Supabase Dashboard
- Verify environment variables are set
- Check CORS headers are correct

---

## 📊 Deployment Status Checklist

- [ ] Logged into Supabase CLI
- [ ] Deployed send-email function
- [ ] Deployed process-email-queue function
- [ ] Deployed get-analytics function
- [ ] Deployed create-refund function
- [ ] Deployed approve-refund function
- [ ] Deployed reject-refund function
- [ ] Deployed setup-2fa function
- [ ] Deployed verify-2fa function
- [ ] Deployed disable-2fa function
- [ ] Added RESEND_API_KEY secret
- [ ] Tested analytics endpoint
- [ ] Tested 2FA setup

---

## 🎉 Next Steps After Deployment

1. **Test the Analytics Dashboard**
   - Run `npm run dev`
   - Visit http://localhost:8080/analytics
   - Verify charts load (may be empty if no data)

2. **Test Refund System**
   - Visit http://localhost:8080/refunds
   - Try creating a refund from a payment

3. **Test 2FA**
   - Visit http://localhost:8080/security
   - Click "Enable 2FA"
   - Scan QR code with authenticator app

4. **Send Test Email**
   - Create a test payment
   - Verify email is sent

---

**Need help?** Check the Supabase Edge Functions docs: https://supabase.com/docs/guides/functions

