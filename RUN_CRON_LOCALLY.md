# Run Automated Jobs Locally - No External Service Needed!

## 🎯 **Simple Solution: Run on Your Computer**

Instead of using cron-job.org, just run a Node.js script on your computer!

---

## 🚀 **Quick Start (2 minutes)**

### **Step 1: Add Service Role Key to .env**

1. Go to: https://supabase.com/dashboard/project/crkhkzcscgoeyspaczux/settings/api
2. Copy the **service_role** key
3. Open your `.env` file
4. Add this line:
   ```
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

### **Step 2: Run the Script**

```powershell
npm run cron
```

That's it! The script will:
- ✅ Monitor blockchain every 30 seconds
- ✅ Settle payments every 1 minute
- ✅ Deliver webhooks every 1 minute
- ✅ Process payouts every 5 minutes

---

## 📊 **What You'll See**

```
🚀 Starting automated jobs...

📍 Supabase URL: https://crkhkzcscgoeyspaczux.supabase.co
🔑 Service Role Key: eyJhbGciOiJIUzI1NiI...

Jobs running:
  - Monitor Blockchain: Every 30 seconds
  - Settle Payments: Every 1 minute
  - Deliver Webhooks: Every 1 minute
  - Process Payouts: Every 5 minutes

Press Ctrl+C to stop

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ [10:30:00] monitor-blockchain: Success
✅ [10:30:00] settle-payment: Success
✅ [10:30:00] deliver-webhooks: Success
✅ [10:30:00] process-payout: Success
✅ [10:30:30] monitor-blockchain: Success
✅ [10:31:00] monitor-blockchain: Success
✅ [10:31:00] settle-payment: Success
✅ [10:31:00] deliver-webhooks: Success
...
```

---

## ⚙️ **How It Works**

The script calls your Supabase edge functions automatically:

```
Every 30 seconds → monitor-blockchain
Every 1 minute  → settle-payment
Every 1 minute  → deliver-webhooks
Every 5 minutes → process-payout
```

---

## 🔄 **Keep It Running**

### **Option A: Keep Terminal Open**

Just leave the terminal window open with `npm run cron` running.

### **Option B: Run in Background (Windows)**

Create a file `start-cron.bat`:
```batch
@echo off
start /min cmd /c "npm run cron"
```

Double-click to run in background.

### **Option C: Run on Startup (Windows)**

1. Press `Win + R`
2. Type `shell:startup`
3. Create a shortcut to `start-cron.bat`
4. Jobs will run automatically when you start your computer

### **Option D: Deploy to a Server**

Deploy the script to:
- **Heroku** (free tier)
- **Railway** (free tier)
- **Render** (free tier)
- **Your own VPS**

---

## 🛑 **Stop the Jobs**

Press `Ctrl + C` in the terminal

---

## 🔍 **Troubleshooting**

### **"SUPABASE_SERVICE_ROLE_KEY not found"**

Add it to your `.env` file:
```
SUPABASE_SERVICE_ROLE_KEY=your_key_here
```

### **"Failed - Function not found"**

Make sure you've deployed all the edge functions:
- monitor-blockchain
- settle-payment
- deliver-webhooks
- process-payout

### **"Failed - Unauthorized"**

Check your service role key is correct.

---

## 📋 **Comparison: Local vs External Cron**

| Feature | Local Script | cron-job.org |
|---------|-------------|--------------|
| Setup | 2 minutes | 5 minutes |
| Cost | Free | Free |
| Reliability | Requires computer on | Always running |
| Control | Full control | Limited |
| Logs | See in terminal | Web dashboard |

---

## 🌐 **For Production: Deploy the Script**

When ready for production, deploy to a cloud service:

### **Deploy to Railway (Easiest)**

1. Go to: https://railway.app/
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repo
5. Add environment variable:
   - `SUPABASE_SERVICE_ROLE_KEY=your_key`
6. Set start command: `npm run cron`
7. Deploy!

**Cost**: Free tier includes 500 hours/month

### **Deploy to Render**

1. Go to: https://render.com/
2. Sign up
3. New → Background Worker
4. Connect your repo
5. Build command: `npm install`
6. Start command: `npm run cron`
7. Add env var: `SUPABASE_SERVICE_ROLE_KEY`
8. Deploy!

**Cost**: Free tier available

---

## ✅ **Recommended Approach**

**For Development:**
- ✅ Run locally with `npm run cron`
- Keep terminal open while testing

**For Production:**
- ✅ Deploy to Railway or Render
- Set and forget!

---

## 🎯 **Quick Commands**

```powershell
# Start cron jobs
npm run cron

# Stop cron jobs
Ctrl + C

# Check if it's working
# Watch the terminal for success messages
```

---

**Ready?** Just run: `npm run cron` 🚀

No external services needed!

