# Deployment Checklist - Simple Version

## ✅ Already Done

- [x] Database schema created
- [x] payment_intents table created
- [x] webhook_events table created
- [x] All code written

## 📋 To Do Now (30 minutes total)

### 1. Deploy Functions via Dashboard (15 min)

Go to: https://supabase.com/dashboard/project/crkhkzcscgoeyspaczux/functions

Upload these folders (just drag & drop):

- [ ] `supabase/functions/api-v1` (Verify JWT: NO) ⭐ **START HERE**
- [ ] `supabase/functions/create-payment-intent` (Verify JWT: YES)
- [ ] `supabase/functions/monitor-blockchain` (Verify JWT: NO)
- [ ] `supabase/functions/settle-payment` (Verify JWT: NO)
- [ ] `supabase/functions/deliver-webhooks` (Verify JWT: NO)

### 2. Enable Realtime (2 min)

Go to: https://supabase.com/dashboard/project/crkhkzcscgoeyspaczux/database/replication

Enable these tables:
- [ ] payment_intents
- [ ] webhook_events

### 3. Get API Key (1 min)

Go to: https://supabase.com/dashboard/project/crkhkzcscgoeyspaczux/settings/api

Copy:
- [ ] Service Role Key (for testing)

### 4. Test API (2 min)

```powershell
curl -X POST https://crkhkzcscgoeyspaczux.supabase.co/functions/v1/api-v1/payments `
  -H "x-api-key: YOUR_SERVICE_ROLE_KEY" `
  -H "Content-Type: application/json" `
  -d '{\"amount\": \"10.00\", \"currency\": \"USDC\"}'
```

- [ ] API test successful

### 5. Setup Cron Jobs (10 min)

Go to: https://cron-job.org

Create 3 jobs:
- [ ] Monitor blockchain (every 30s)
- [ ] Settle payments (every 1min)
- [ ] Deliver webhooks (every 1min)

See `DEPLOY_SIMPLE.md` for exact URLs and headers.

## 🎉 Done!

Once all checkboxes are checked, your payment gateway is live!

---

## Quick Links

- Functions: https://supabase.com/dashboard/project/crkhkzcscgoeyspaczux/functions
- API Keys: https://supabase.com/dashboard/project/crkhkzcscgoeyspaczux/settings/api
- Replication: https://supabase.com/dashboard/project/crkhkzcscgoeyspaczux/database/replication
- Cron Jobs: https://cron-job.org

---

## Need Help?

See `DEPLOY_SIMPLE.md` for detailed instructions.

