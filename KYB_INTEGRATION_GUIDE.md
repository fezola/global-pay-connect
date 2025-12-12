# 🔐 Persona KYB Integration Guide

Step-by-step guide to integrate Persona for automated business verification.

---

## 📋 Overview

We'll integrate Persona to automate:
- ✅ Business registration verification
- ✅ Beneficial owner (UBO) identification
- ✅ Document verification
- ✅ AML/sanctions screening
- ✅ Ongoing monitoring

---

## 🚀 Quick Start

### Step 1: Sign Up for Persona (5 min)

1. Go to: https://withpersona.com
2. Click "Get Started" or "Request Demo"
3. Fill out the form:
   - Company: Klyr
   - Use case: Business verification (KYB)
   - Industry: Crypto/Payments
4. You'll get sandbox API keys immediately

### Step 2: Get API Keys

After signup, you'll receive:
- **Sandbox API Key:** `persona_sandbox_...`
- **Production API Key:** `persona_live_...` (after approval)

---

## 🔧 Implementation Steps

### 1. Add Environment Variables

```bash
# In Supabase Edge Functions
npx supabase secrets set PERSONA_API_KEY="persona_sandbox_..."
npx supabase secrets set PERSONA_ENVIRONMENT="sandbox"  # or "production"
npx supabase secrets set PERSONA_TEMPLATE_ID="itmpl_..."  # Get from Persona dashboard
```

### 2. Install Persona SDK (Frontend)

```bash
npm install persona
```

### 3. Update Database Schema

Add Persona-specific fields to track inquiries:

```sql
-- Add to businesses table
ALTER TABLE businesses ADD COLUMN persona_inquiry_id TEXT;
ALTER TABLE businesses ADD COLUMN persona_report_id TEXT;

-- Add to kyb_jobs table  
ALTER TABLE kyb_jobs ADD COLUMN persona_inquiry_id TEXT;
ALTER TABLE kyb_jobs ADD COLUMN persona_report_id TEXT;
```

---

## 📝 Integration Flow

### Flow Diagram

```
1. Merchant fills business info
   ↓
2. Click "Submit for Verification"
   ↓
3. Create Persona Inquiry (Edge Function)
   ↓
4. Redirect to Persona hosted flow
   ↓
5. Merchant uploads documents
   ↓
6. Persona verifies automatically
   ↓
7. Webhook: inquiry.completed
   ↓
8. Fetch verification report
   ↓
9. Update merchant status
   ↓
10. Enable production mode
```

---

## 🔨 Code Implementation

### Edge Function: Create Persona Inquiry

```typescript
// supabase/functions/create-persona-inquiry/index.ts

const PERSONA_API_KEY = Deno.env.get('PERSONA_API_KEY');
const PERSONA_TEMPLATE_ID = Deno.env.get('PERSONA_TEMPLATE_ID');

// Create inquiry
const response = await fetch('https://withpersona.com/api/v1/inquiries', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${PERSONA_API_KEY}`,
    'Content-Type': 'application/json',
    'Persona-Version': '2023-01-05'
  },
  body: JSON.stringify({
    data: {
      type: 'inquiry',
      attributes: {
        'inquiry-template-id': PERSONA_TEMPLATE_ID,
        'reference-id': businessId,
        'redirect-uri': `${frontendUrl}/compliance?status=complete`
      }
    }
  })
});

const data = await response.json();
const inquiryId = data.data.id;
const sessionToken = data.data.attributes['session-token'];

// Return session token to frontend
return { inquiryId, sessionToken };
```

### Frontend: Launch Persona Flow

```typescript
// src/components/PersonaVerification.tsx

import { Client } from 'persona';

const PersonaVerification = ({ sessionToken, onComplete }) => {
  useEffect(() => {
    const client = new Client({
      templateId: 'itmpl_...', // From Persona dashboard
      environmentId: 'env_...', // From Persona dashboard
      sessionToken: sessionToken,
      onComplete: ({ inquiryId, status }) => {
        console.log('Verification complete:', inquiryId, status);
        onComplete(inquiryId, status);
      },
      onCancel: () => {
        console.log('Verification cancelled');
      },
      onError: (error) => {
        console.error('Verification error:', error);
      }
    });

    client.open();
  }, [sessionToken]);

  return <div id="persona-container" />;
};
```

### Webhook Handler: Process Results

```typescript
// supabase/functions/persona-webhook/index.ts

serve(async (req) => {
  const signature = req.headers.get('persona-signature');
  const body = await req.text();
  
  // Verify webhook signature
  const isValid = verifyWebhookSignature(body, signature);
  if (!isValid) {
    return new Response('Invalid signature', { status: 401 });
  }

  const event = JSON.parse(body);
  
  if (event.data.type === 'inquiry.completed') {
    const inquiryId = event.data.id;
    const status = event.data.attributes.status;
    
    // Fetch full report
    const report = await fetchPersonaReport(inquiryId);
    
    // Update business status
    await updateBusinessStatus(inquiryId, status, report);
  }
  
  return new Response('OK', { status: 200 });
});
```

---

## 🎨 UI Components

### Compliance Page Updates

```typescript
// Add "Start Verification" button
<Button onClick={handleStartVerification}>
  Start Persona Verification
</Button>

// Handle verification start
const handleStartVerification = async () => {
  // Call Edge Function to create inquiry
  const { inquiryId, sessionToken } = await createPersonaInquiry(businessId);
  
  // Launch Persona flow
  setPersonaSession(sessionToken);
  setShowPersonaModal(true);
};
```

---

## 📊 Verification Checks

### What Persona Verifies

1. **Business Identity**
   - Legal name matches registration
   - Tax ID is valid
   - Business exists in registry

2. **Business Address**
   - Address is real
   - Matches registration documents
   - Not a PO box (if required)

3. **Beneficial Owners**
   - Identify all owners >25%
   - Verify owner identities
   - Check owner backgrounds

4. **Documents**
   - Certificate of incorporation
   - Tax registration
   - Proof of address
   - Bank statements

5. **AML Screening**
   - OFAC sanctions
   - UN sanctions
   - EU sanctions
   - PEP lists
   - Adverse media

---

## 🔔 Webhook Events

### Events to Handle

```typescript
// inquiry.created - Inquiry started
// inquiry.started - User began verification
// inquiry.completed - Verification finished
// inquiry.failed - Verification failed
// inquiry.expired - Session expired
// report.ready - Full report available
```

### Webhook Setup

1. Go to Persona Dashboard → Webhooks
2. Add webhook URL: `https://your-project.supabase.co/functions/v1/persona-webhook`
3. Select events to receive
4. Copy webhook secret
5. Add to Supabase secrets:
   ```bash
   npx supabase secrets set PERSONA_WEBHOOK_SECRET="whsec_..."
   ```

---

## 🧪 Testing

### Sandbox Mode

Persona provides test data for sandbox:

```typescript
// Test business data
{
  "legal_name": "Test Business Inc",
  "tax_id": "12-3456789",
  "country": "US",
  "address": "123 Test St, San Francisco, CA 94105"
}

// Test outcomes
- Use "PASS" in business name → Verification passes
- Use "FAIL" in business name → Verification fails
- Use "REVIEW" in business name → Manual review required
```

---

## 💰 Pricing

### Sandbox
- **Free:** Unlimited test verifications
- **No credit card:** Required for sandbox

### Production
- **Business Verification:** ~$5-15 per verification
- **AML Screening:** ~$1-3 per check
- **Volume Discounts:** Available
- **Pay as you go:** No monthly minimums

---

## 📈 Migration Plan

### Phase 1: Sandbox Integration (Week 1)
- [ ] Sign up for Persona
- [ ] Get sandbox API keys
- [ ] Create Edge Functions
- [ ] Build UI components
- [ ] Test end-to-end

### Phase 2: Production Setup (Week 2)
- [ ] Apply for production access
- [ ] Get production API keys
- [ ] Configure compliance settings
- [ ] Set up webhooks
- [ ] Test with real data

### Phase 3: Go Live (Week 3)
- [ ] Switch to production keys
- [ ] Monitor first verifications
- [ ] Gather feedback
- [ ] Optimize flow

---

## 🔐 Security

### Best Practices

1. **API Keys**
   - Store in Supabase secrets
   - Never expose in frontend
   - Rotate periodically

2. **Webhook Signatures**
   - Always verify signatures
   - Use constant-time comparison
   - Log failed verifications

3. **Data Privacy**
   - Store minimal PII
   - Encrypt sensitive data
   - Follow GDPR/CCPA

---

## 📞 Support

### Persona Support
- **Email:** support@withpersona.com
- **Docs:** https://docs.withpersona.com
- **Slack:** Community available
- **Response Time:** Usually < 24 hours

---

**Ready to implement? Let's build it!** 🚀

