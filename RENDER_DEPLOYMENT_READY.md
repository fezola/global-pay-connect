# ✅ Cron Worker Ready for Render Deployment

## Status: READY TO DEPLOY

Your cron worker has been successfully configured for Render's free tier!

## What Was Fixed

### Problem
```
==> Timed out: Port scan timeout reached, no open ports detected.
```

### Solution
✅ Added HTTP server to cron worker
✅ Configured health check endpoints
✅ Added dotenv support for environment variables
✅ Updated render.yaml for web service deployment

## Files Modified

1. **cron-worker.js**
   - Added `import dotenv from 'dotenv'` and `dotenv.config()`
   - Added HTTP server with `/health` and `/status` endpoints
   - Job status tracking
   - ES module compatible

2. **render.yaml**
   - Changed `type: worker` → `type: web`
   - Added `healthCheckPath: /health`
   - Added `PORT: 10000` environment variable

3. **package.json**
   - Added `dotenv` dependency (installed)

## How to Deploy

### Step 1: Commit Changes
```bash
git add cron-worker.js render.yaml package.json package-lock.json
git commit -m "Fix cron worker for Render free tier deployment"
git push origin main
```

### Step 2: Deploy on Render
1. Go to https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Render will auto-detect `render.yaml`
5. Set environment variable:
   - Key: `SUPABASE_SERVICE_ROLE_KEY`
   - Value: (from your .env file)
6. Click "Create Web Service"

### Step 3: Verify Deployment
Once deployed, visit:
- `https://your-service.onrender.com/health` - Should return JSON with job status
- `https://your-service.onrender.com/status` - Detailed job statistics

## What Happens on Render

```
┌─────────────────────────────────────────┐
│     Render Web Service (Free Tier)      │
├─────────────────────────────────────────┤
│                                         │
│  HTTP Server (Port 10000)               │
│  ├─ GET /health → Job status            │
│  ├─ GET /status → Detailed stats        │
│  └─ GET / → Health check                │
│                                         │
│  Background Cron Jobs (Running)         │
│  ├─ Monitor Blockchain (30s)            │
│  ├─ Settle Payments (1min)              │
│  ├─ Deliver Webhooks (1min)             │
│  └─ Process Payouts (5min)              │
│                                         │
└─────────────────────────────────────────┘
```

## Testing Locally

```bash
# Run the cron worker
node cron-worker.js

# In another terminal, test endpoints
curl http://localhost:3000/health
curl http://localhost:3000/status
```

## Free Tier Limitations

⚠️ **Important:**
- Service sleeps after 15 minutes of inactivity
- Wakes up automatically when accessed
- Health checks keep it alive
- 7-day log retention

**Recommendation:** Upgrade to paid tier ($7/month) for 24/7 uptime

## Monitoring

Check job execution:
1. **Render Dashboard** → Logs tab
2. **Health Endpoint** → `/status` shows last run times
3. **Supabase** → Check edge functions are being called

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Service keeps restarting | Check `SUPABASE_SERVICE_ROLE_KEY` is set correctly |
| Jobs not running | Visit `/status` endpoint to see last execution times |
| Port binding error | Render sets PORT automatically, should work |
| Service sleeping | Upgrade to paid tier or add external health check |

## Next Steps

1. ✅ Commit and push to GitHub
2. ✅ Deploy on Render
3. ✅ Monitor logs and health endpoint
4. ✅ Consider upgrading to paid tier for 24/7 uptime

## Support

For issues:
- Check Render logs: Dashboard → Logs
- Check health endpoint: `/status`
- Check Supabase edge functions are deployed
- Verify `SUPABASE_SERVICE_ROLE_KEY` is correct

---

**Status:** ✅ Ready for production deployment
**Last Updated:** 2025-12-12

