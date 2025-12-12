# 🚀 Automatic Deployment via Migrations

Klyr uses Supabase's automatic deployment system. All Edge Functions and database changes are deployed together with a single command.

---

## 📋 How It Works

### **Single Command Deployment**

```bash
npx supabase db push
```

This single command:
1. ✅ Applies all database migrations
2. ✅ Deploys all Edge Functions automatically
3. ✅ Updates function configurations
4. ✅ Syncs everything to production

---

## ⚙️ Configuration

All Edge Functions are configured in `supabase/config.toml`:

```toml
project_id = "crkhkzcscgoeyspaczux"

# Payment Processing Functions
[functions.create-payment-intent]
verify_jwt = true

[functions.monitor-blockchain]
verify_jwt = false

# ... and 10 more functions
```

### **Function Settings**

- **`verify_jwt = true`**: Requires authentication (user must be logged in)
- **`verify_jwt = false`**: Public endpoint (webhooks, blockchain monitoring)

---

## 🗄️ Database Migrations

All migrations are in `supabase/migrations/`:

1. **`20251211140430_*.sql`** - Initial schema
2. **`20251211142756_*.sql`** - Merchants and businesses
3. **`20251211143357_*.sql`** - API keys and webhooks
4. **`20251211144623_*.sql`** - Payments and transactions
5. **`20251211150000_payment_intents_and_webhooks.sql`** - Payment intents
6. **`20251211160000_payout_system.sql`** - Payout system
7. **`20251211170000_setup_cron_jobs.sql`** - Cron jobs
8. **`20251211180000_setup_automated_jobs.sql`** - Automated jobs
9. **`20251212000000_persona_integration.sql`** - Persona KYB

---

## 📦 Edge Functions (14 Total)

All functions are in `supabase/functions/`:

### **Payment Processing (4 functions)**
- `create-payment-intent` - Create new payment
- `monitor-blockchain` - Monitor blockchain for payments
- `settle-payment` - Settle completed payments
- `deliver-webhooks` - Send webhook notifications

### **KYB Verification (5 functions)**
- `wallet-nonce` - Generate wallet verification nonce
- `prove-control` - Verify wallet ownership
- `submit-kyb` - Submit KYB application
- `create-persona-inquiry` - Create Persona verification
- `persona-webhook` - Handle Persona webhooks

### **Payout System (4 functions)**
- `create-payout` - Create payout request
- `process-payout` - Process approved payouts
- `approve-payout` - Approve payout request
- `reject-payout` - Reject payout request

### **REST API (1 function)**
- `api-v1` - Public REST API endpoint

---

## 🚀 Deployment Steps

### **Step 1: Configure Secrets** (One-time setup)

```bash
# Blockchain Configuration
npx supabase secrets set SOLANA_RPC_URL="https://api.mainnet-beta.solana.com"
npx supabase secrets set HOT_WALLET_PRIVATE_KEY="your_private_key"

# Persona KYB
npx supabase secrets set PERSONA_API_KEY="persona_sandbox_..."
npx supabase secrets set PERSONA_TEMPLATE_ID="itmpl_..."
npx supabase secrets set PERSONA_ENVIRONMENT="sandbox"
npx supabase secrets set PERSONA_WEBHOOK_SECRET="whsec_..."

# Application URLs
npx supabase secrets set FRONTEND_URL="http://localhost:8080"
```

### **Step 2: Deploy Everything**

```bash
# Single command to deploy everything
npx supabase db push
```

That's it! This command:
- ✅ Applies all 9 database migrations
- ✅ Deploys all 14 Edge Functions
- ✅ Updates function configurations
- ✅ Syncs to production

### **Step 3: Verify Deployment**

```bash
# Check deployment status
npm run deploy:verify
```

---

## 🔄 Making Changes

### **Adding a New Edge Function**

1. Create function in `supabase/functions/my-function/index.ts`
2. Add configuration to `supabase/config.toml`:
   ```toml
   [functions.my-function]
   verify_jwt = true  # or false
   ```
3. Deploy:
   ```bash
   npx supabase db push
   ```

### **Adding a Database Migration**

1. Create migration file:
   ```bash
   npx supabase migration new my_feature
   ```
2. Edit the generated SQL file
3. Deploy:
   ```bash
   npx supabase db push
   ```

### **Updating an Edge Function**

1. Edit the function code in `supabase/functions/`
2. Deploy:
   ```bash
   npx supabase db push
   ```

---

## 🧪 Testing Locally

### **Start Local Supabase**

```bash
npx supabase start
```

This starts:
- PostgreSQL database
- Edge Functions runtime
- Auth server
- Storage server
- Realtime server

### **Test Edge Functions Locally**

```bash
# Test a specific function
npx supabase functions serve create-payment-intent

# Or serve all functions
npx supabase functions serve
```

### **Apply Migrations Locally**

```bash
npx supabase db reset
```

---

## 📊 Deployment Workflow

```
┌─────────────────────────────────────────┐
│  Developer makes changes                │
│  - Edit Edge Function code              │
│  - Create database migration            │
│  - Update config.toml                   │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  Run: npx supabase db push              │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  Supabase automatically:                │
│  1. Applies database migrations         │
│  2. Deploys Edge Functions              │
│  3. Updates configurations              │
│  4. Syncs to production                 │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  Deployment complete! ✅                │
│  - Database updated                     │
│  - Functions deployed                   │
│  - Ready to use                         │
└─────────────────────────────────────────┘
```

---

## ✅ Benefits

### **Single Command Deployment**
- No manual function deployment
- No separate migration steps
- Everything synced automatically

### **Version Control**
- All changes tracked in Git
- Migrations are versioned
- Easy rollback if needed

### **Consistency**
- Database and functions always in sync
- No deployment drift
- Reproducible deployments

### **Speed**
- One command deploys everything
- No manual steps
- Fast iteration

---

## 🔍 Troubleshooting

### **Issue: Functions not deploying**

**Check config.toml:**
```bash
cat supabase/config.toml
```

Make sure all functions are listed.

### **Issue: Migration fails**

**Check migration syntax:**
```bash
npx supabase db lint
```

**Reset local database:**
```bash
npx supabase db reset
```

### **Issue: Secrets not set**

**List all secrets:**
```bash
npx supabase secrets list
```

**Set missing secrets:**
```bash
npx supabase secrets set SECRET_NAME="value"
```

---

## 📚 Related Documentation

- `PERSONA_SETUP.md` - Persona KYB setup
- `DEPLOY_TO_PRODUCTION.md` - Production deployment
- `ENVIRONMENT_VARIABLES.md` - All environment variables
- `KYB_IMPLEMENTATION_COMPLETE.md` - KYB implementation

---

## 🎯 Quick Reference

### **Deploy Everything**
```bash
npx supabase db push
```

### **Verify Deployment**
```bash
npm run deploy:verify
```

### **View Logs**
```bash
npx supabase functions logs function-name
```

### **List Secrets**
```bash
npx supabase secrets list
```

### **Set Secret**
```bash
npx supabase secrets set NAME="value"
```

---

**That's it! One command deploys everything.** 🚀

