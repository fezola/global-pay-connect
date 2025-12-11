# Setup Cron Jobs - Complete Guide

## ⚠️ **Important: You Need Cron Jobs!**

Without cron jobs, these features **won't work**:
- ❌ Payments won't be detected on blockchain
- ❌ Payments won't be settled
- ❌ Webhooks won't be sent
- ❌ Payouts won't be processed

---

## 🚀 **Quick Setup (5 minutes)**

### **Step 1: Go to cron-job.org**

Visit: https://cron-job.org/

1. Click **"Sign up"** (free account)
2. Verify your email
3. Sign in

---

### **Step 2: Get Your Service Role Key**

1. Go to: https://supabase.com/dashboard/project/crkhkzcscgoeyspaczux/settings/api
2. Find **"service_role"** key
3. Click **"Copy"**
4. Save it somewhere (you'll need it 4 times)

---

### **Step 3: Create 4 Cron Jobs**

Click **"Create cronjob"** and create each of these:

---

#### **Job 1: Monitor Blockchain** ⭐ (Most Important)

**Basic Settings:**
- Title: `Monitor Blockchain`
- URL: `https://crkhkzcscgoeyspaczux.supabase.co/functions/v1/monitor-blockchain`

**Schedule:**
- Every: `30 seconds`
- Or use pattern: `*/30 * * * * *`

**Advanced:**
- Request method: `POST`
- Request headers: Click "Add header"
  - Name: `Authorization`
  - Value: `Bearer <YOUR_SERVICE_ROLE_KEY>`

Click **"Create cronjob"**

---

#### **Job 2: Settle Payments**

**Basic Settings:**
- Title: `Settle Payments`
- URL: `https://crkhkzcscgoeyspaczux.supabase.co/functions/v1/settle-payment`

**Schedule:**
- Every: `1 minute`
- Or use pattern: `* * * * *`

**Advanced:**
- Request method: `POST`
- Request headers:
  - Name: `Authorization`
  - Value: `Bearer <YOUR_SERVICE_ROLE_KEY>`

Click **"Create cronjob"**

---

#### **Job 3: Deliver Webhooks**

**Basic Settings:**
- Title: `Deliver Webhooks`
- URL: `https://crkhkzcscgoeyspaczux.supabase.co/functions/v1/deliver-webhooks`

**Schedule:**
- Every: `1 minute`
- Or use pattern: `* * * * *`

**Advanced:**
- Request method: `POST`
- Request headers:
  - Name: `Authorization`
  - Value: `Bearer <YOUR_SERVICE_ROLE_KEY>`

Click **"Create cronjob"**

---

#### **Job 4: Process Payouts** ⭐ (New!)

**Basic Settings:**
- Title: `Process Payouts`
- URL: `https://crkhkzcscgoeyspaczux.supabase.co/functions/v1/process-payout`

**Schedule:**
- Every: `5 minutes`
- Or use pattern: `*/5 * * * *`

**Advanced:**
- Request method: `POST`
- Request headers:
  - Name: `Authorization`
  - Value: `Bearer <YOUR_SERVICE_ROLE_KEY>`

Click **"Create cronjob"**

---

## ✅ **Verify Setup**

After creating all 4 jobs, you should see them in your dashboard:

```
✅ Monitor Blockchain    - Every 30 seconds
✅ Settle Payments       - Every 1 minute
✅ Deliver Webhooks      - Every 1 minute
✅ Process Payouts       - Every 5 minutes
```

---

## 🧪 **Test the Cron Jobs**

### **Test Monitor Blockchain:**

1. Create a payment in your app
2. Send USDC to the payment address
3. Wait 30 seconds
4. Check if payment status changed to "processing"

### **Test Settle Payment:**

1. Wait for payment to have confirmations
2. Wait 1 minute
3. Check if payment status changed to "succeeded"
4. Check if balance was updated

### **Test Deliver Webhooks:**

1. After payment settles
2. Wait 1 minute
3. Check webhook_events table
4. Should see status "delivered"

### **Test Process Payouts:**

1. Request a payout in your app
2. Wait 5 minutes
3. Check if payout status changed to "completed"
4. Check transaction on Solscan

---

## 📊 **Monitor Cron Jobs**

In cron-job.org dashboard, you can see:
- ✅ Last execution time
- ✅ Success/failure status
- ✅ Response codes
- ✅ Execution history

---

## 🔧 **Troubleshooting**

### **Cron job shows "Failed"**

Check the response:
- 401 = Wrong service role key
- 404 = Function not deployed
- 500 = Function error (check logs)

### **Payments not being detected**

- Make sure "Monitor Blockchain" is running every 30s
- Check edge function logs
- Verify RPC endpoint is working

### **Payouts stuck in "approved"**

- Make sure "Process Payouts" is running every 5 min
- Check hot wallet has enough SOL & USDC
- Check edge function logs

---

## 💡 **Alternative: GitHub Actions (Free)**

If you don't want to use cron-job.org, you can use GitHub Actions:

Create `.github/workflows/cron-jobs.yml`:

```yaml
name: Cron Jobs

on:
  schedule:
    - cron: '*/30 * * * *'  # Every 30 seconds (not supported, use 1 min)
    - cron: '* * * * *'     # Every 1 minute
    - cron: '*/5 * * * *'   # Every 5 minutes

jobs:
  monitor-blockchain:
    runs-on: ubuntu-latest
    steps:
      - name: Call monitor-blockchain
        run: |
          curl -X POST https://crkhkzcscgoeyspaczux.supabase.co/functions/v1/monitor-blockchain \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}"
  
  # ... add other jobs
```

**Note**: GitHub Actions minimum is 5 minutes, so not ideal for monitoring.

---

## 📋 **Checklist**

- [ ] Signed up for cron-job.org
- [ ] Got service role key from Supabase
- [ ] Created "Monitor Blockchain" job (30s)
- [ ] Created "Settle Payments" job (1min)
- [ ] Created "Deliver Webhooks" job (1min)
- [ ] Created "Process Payouts" job (5min)
- [ ] Tested each job
- [ ] Verified jobs are running

---

## 🎯 **Why Each Job is Needed**

| Job | Purpose | Frequency | Critical? |
|-----|---------|-----------|-----------|
| Monitor Blockchain | Detect incoming payments | 30s | ⭐⭐⭐ YES |
| Settle Payments | Confirm & settle payments | 1min | ⭐⭐⭐ YES |
| Deliver Webhooks | Notify merchants | 1min | ⭐⭐ Important |
| Process Payouts | Send withdrawals | 5min | ⭐⭐⭐ YES |

---

**Ready to setup?** Go to https://cron-job.org/ and create the 4 jobs! 🚀

**Total time: ~5 minutes**

