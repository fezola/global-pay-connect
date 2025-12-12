# Cron Worker Fix for Render Deployment

## Problem

Render was timing out with error:
```
==> Timed out: Port scan timeout reached, no open ports detected. 
Bind your service to at least one port. If you don't need to receive traffic on any port, create a background worker instead.
```

**Root Cause:** Render's free tier doesn't support background workers. The cron worker wasn't binding to any HTTP port, so Render couldn't verify it was running.

## Solution

Converted the cron worker to a **web service** that:
1. ✅ Binds to an HTTP port (required by Render)
2. ✅ Exposes health check endpoints
3. ✅ Continues running all cron jobs in the background
4. ✅ Tracks job statistics
5. ✅ Works on Render's free tier

## Changes Made

### 1. **cron-worker.js**
- Added `import http from 'http'` for ES modules
- Created `createHealthServer()` function that:
  - Listens on `PORT` environment variable
  - Responds to `/health` endpoint with job status
  - Responds to `/status` endpoint with detailed statistics
  - Responds to `/` with health status
- Added job status tracking object
- Updated `callEdgeFunction()` to track job statistics

### 2. **render.yaml**
- Changed `type: worker` → `type: web` (required for HTTP port)
- Added `healthCheckPath: /health` (Render uses this to verify service is alive)
- Added `PORT: 10000` environment variable

### 3. **Documentation**
- Created `DEPLOY_CRON_RENDER.md` with deployment instructions
- Created `CRON_WORKER_FIX.md` (this file)

## How It Works Now

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

## Deployment Steps

1. **Push to GitHub**
   ```bash
   git add cron-worker.js render.yaml DEPLOY_CRON_RENDER.md
   git commit -m "Fix cron worker for Render free tier"
   git push origin main
   ```

2. **Deploy on Render**
   - Go to https://dashboard.render.com
   - Create new Web Service from GitHub
   - Set `SUPABASE_SERVICE_ROLE_KEY` environment variable
   - Deploy!

3. **Verify**
   - Visit `https://your-service.onrender.com/health`
   - Should see job status JSON

## Testing Locally

```bash
# Set environment variable
export SUPABASE_SERVICE_ROLE_KEY="your-key-here"

# Run cron worker
node cron-worker.js

# In another terminal, test health endpoint
curl http://localhost:3000/health
curl http://localhost:3000/status
```

## Free Tier Limitations

⚠️ **Important:** Render's free tier has these limitations:
- Service sleeps after 15 minutes of inactivity
- Wakes up automatically when accessed
- Health checks keep it alive
- 7-day log retention

**Recommendation:** Upgrade to paid tier ($7/month) for 24/7 uptime if you need guaranteed job execution.

## Monitoring

Check job execution via:
1. **Render Dashboard** → Logs tab
2. **Health Endpoint** → `/status` shows last run times
3. **Supabase** → Check if edge functions are being called

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Service keeps restarting | Check `SUPABASE_SERVICE_ROLE_KEY` is set |
| Jobs not running | Visit `/status` to see last execution times |
| Port binding error | Render sets PORT automatically, should work |
| Service sleeping | Upgrade to paid tier or add external health check |

## Files Modified

- ✅ `cron-worker.js` - Added HTTP server and job tracking
- ✅ `render.yaml` - Changed to web service with health check
- ✅ `DEPLOY_CRON_RENDER.md` - Deployment guide
- ✅ `CRON_WORKER_FIX.md` - This documentation

