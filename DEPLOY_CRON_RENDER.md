# Deploy Cron Jobs to Render (Free Tier)

## What Changed

Since Render's free tier doesn't support background workers, we've converted the cron worker to a **web service** with health check endpoints.

## Features

✅ Runs all cron jobs (monitor-blockchain, settle-payment, deliver-webhooks, process-payout)
✅ Exposes health check endpoints for Render
✅ Tracks job status and statistics
✅ Free tier compatible

## Health Check Endpoints

- `GET /health` - Health status with job statistics
- `GET /status` - Detailed job status
- `GET /` - Same as /health

## Deploy to Render

### Option 1: Using render.yaml (Recommended)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Add cron worker with health checks"
   git push origin main
   ```

2. **Create a new Web Service on Render**
   - Go to https://dashboard.render.com
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Render will automatically detect `render.yaml`

3. **Set Environment Variable**
   - In the Render dashboard, go to your service
   - Navigate to "Environment" tab
   - Add: `SUPABASE_SERVICE_ROLE_KEY` = `your-service-role-key`

4. **Deploy**
   - Click "Create Web Service"
   - Render will build and deploy automatically

### Option 2: Manual Setup

1. **Create Web Service**
   - Name: `klyr-cron-jobs`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm run cron`

2. **Set Environment Variables**
   - `SUPABASE_SERVICE_ROLE_KEY` = your service role key
   - `PORT` = 10000 (Render sets this automatically)

3. **Advanced Settings**
   - Health Check Path: `/health`
   - Plan: Free

## Verify Deployment

Once deployed, visit your service URL:
- `https://your-service.onrender.com/health` - Should show job status
- `https://your-service.onrender.com/status` - Detailed statistics

## Logs

Check the logs in Render dashboard to see:
- ✅ Successful job runs
- ❌ Failed job runs
- Job execution timestamps

## How It Works

The cron worker:
1. Starts an HTTP server on the PORT provided by Render
2. Runs cron jobs on schedule (30s, 1min, 5min intervals)
3. Responds to health checks so Render knows it's alive
4. Tracks job statistics accessible via `/status` endpoint

## Troubleshooting

**Service keeps restarting:**
- Check that `SUPABASE_SERVICE_ROLE_KEY` is set correctly
- View logs for error messages

**Jobs not running:**
- Visit `/status` endpoint to see last run times
- Check Supabase Edge Functions are deployed

**Port binding errors:**
- Render automatically sets PORT environment variable
- The worker uses `process.env.PORT || 3000`

## Cost

✅ **100% FREE** on Render's free tier
- Web services on free tier sleep after 15 minutes of inactivity
- They wake up automatically when accessed
- Health checks keep the service alive

## Notes

- The service will sleep after 15 minutes of no HTTP requests on free tier
- Consider upgrading to paid tier ($7/month) for 24/7 uptime
- Logs are retained for 7 days on free tier

