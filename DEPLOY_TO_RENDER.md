# Deploy Cron Jobs to Render - Step by Step

## 🚀 **Deploy in 5 Minutes (Free Tier)**

---

## **Step 1: Push Code to GitHub**

First, make sure your code is on GitHub:

```powershell
# If you haven't initialized git yet
git init
git add .
git commit -m "Add cron worker for automated jobs"

# Create a new repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

**Important**: Make sure `.env` is in your `.gitignore` (it should be already)

---

## **Step 2: Sign Up for Render**

1. Go to: https://render.com/
2. Click **"Get Started"**
3. Sign up with **GitHub** (easiest)
4. Authorize Render to access your repositories

---

## **Step 3: Create a New Background Worker**

1. Click **"New +"** button
2. Select **"Background Worker"**
3. Connect your GitHub repository
4. Select your `global-pay-connect` repo

---

## **Step 4: Configure the Worker**

Fill in these settings:

### **Basic Settings:**
- **Name**: `klyr-cron-jobs`
- **Region**: Choose closest to you (e.g., Oregon, Frankfurt)
- **Branch**: `main`
- **Root Directory**: Leave empty

### **Build & Deploy:**
- **Build Command**: `npm install`
- **Start Command**: `npm run cron`

### **Instance Type:**
- **Plan**: Select **"Free"** (0.1 CPU, 512 MB RAM)

---

## **Step 5: Add Environment Variable**

Scroll down to **"Environment Variables"**

Click **"Add Environment Variable"**:
- **Key**: `SUPABASE_SERVICE_ROLE_KEY`
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNya2hremNzY2dvZXlzcGFjenV4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTQ1ODI3MSwiZXhwIjoyMDgxMDM0MjcxfQ.9F2Zte6-xSPIinbWEUgc7pnlHmpaN3rCpFzl13zb2N4`

---

## **Step 6: Deploy!**

1. Click **"Create Background Worker"**
2. Render will start building and deploying
3. Wait 2-3 minutes for deployment to complete

---

## **Step 7: Verify It's Working**

1. Go to your worker's **"Logs"** tab
2. You should see:

```
🚀 Klyr Cron Worker Started

📍 Supabase URL: https://crkhkzcscgoeyspaczux.supabase.co
🔑 Service Role Key: eyJhbGciOiJIUzI1NiI...

Jobs running:
  - Monitor Blockchain: Every 30 seconds
  - Settle Payments: Every 1 minute
  - Deliver Webhooks: Every 1 minute
  - Process Payouts: Every 5 minutes

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Running initial jobs...

✅ [10:30:00] monitor-blockchain: Success
✅ [10:30:00] settle-payment: Success
✅ [10:30:00] deliver-webhooks: Success
✅ [10:30:00] process-payout: Success
```

---

## ✅ **That's It!**

Your cron jobs are now running 24/7 on Render's free tier!

---

## 📊 **What You Get (Free Tier)**

- ✅ 750 hours/month (enough for 24/7)
- ✅ 512 MB RAM
- ✅ 0.1 CPU
- ✅ Automatic restarts if it crashes
- ✅ Logs and monitoring
- ✅ No credit card required

---

## 🔍 **Monitor Your Worker**

### **View Logs:**
1. Go to your worker dashboard
2. Click **"Logs"** tab
3. See real-time output

### **Check Status:**
- Green dot = Running ✅
- Red dot = Stopped ❌

### **Restart Worker:**
1. Click **"Manual Deploy"** → **"Clear build cache & deploy"**

---

## 🛠️ **Troubleshooting**

### **Worker keeps crashing**

Check logs for errors:
- Missing environment variable?
- Edge functions not deployed?
- Service role key incorrect?

### **Jobs not running**

1. Check logs show "Success" messages
2. Verify edge functions are deployed
3. Check Supabase function logs

### **Need to update code**

Just push to GitHub:
```bash
git add .
git commit -m "Update cron worker"
git push
```

Render will auto-deploy!

---

## 🔄 **Auto-Deploy on Push**

Render automatically deploys when you push to GitHub!

To disable:
1. Go to worker settings
2. Scroll to **"Auto-Deploy"**
3. Toggle off

---

## 💰 **Upgrade to Paid (Optional)**

If you need more resources:
- **Starter**: $7/month (0.5 CPU, 512 MB RAM)
- **Standard**: $25/month (1 CPU, 2 GB RAM)

But free tier is enough for most use cases!

---

## 📋 **Deployment Checklist**

- [ ] Code pushed to GitHub
- [ ] Signed up for Render
- [ ] Created Background Worker
- [ ] Set build command: `npm install`
- [ ] Set start command: `npm run cron`
- [ ] Added `SUPABASE_SERVICE_ROLE_KEY` env var
- [ ] Deployed successfully
- [ ] Verified logs show success messages
- [ ] Tested payment flow end-to-end

---

## 🎯 **Alternative: Use Render Blueprint**

Even easier! Just click this button:

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

Then:
1. Connect your GitHub repo
2. Add `SUPABASE_SERVICE_ROLE_KEY` env var
3. Click "Apply"

Done! 🎉

---

## 📞 **Need Help?**

- **Render Docs**: https://render.com/docs
- **Render Community**: https://community.render.com/
- **Status**: https://status.render.com/

---

**Ready to deploy?** Go to https://render.com/ and follow the steps! 🚀

**Total time: ~5 minutes**

