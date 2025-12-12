# 🔍 KYB Provider Comparison & Selection

Comprehensive comparison of KYB (Know Your Business) providers for Klyr.

---

## 📊 Provider Comparison

| Feature | Persona | Trulioo | Stripe Identity | Onfido (Entrust) |
|---------|---------|---------|-----------------|------------------|
| **Business Verification** | ✅ Yes | ✅ Yes | ⚠️ Limited | ❌ No (KYC only) |
| **Global Coverage** | 🌍 200+ countries | 🌍 195+ countries | 🌍 40+ countries | 🌍 190+ countries |
| **AML Screening** | ✅ Yes | ✅ Yes | ❌ No | ✅ Yes |
| **Document Verification** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **UBO Verification** | ✅ Yes | ✅ Yes | ❌ No | ❌ No |
| **API Quality** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Developer Experience** | Excellent | Good | Excellent | Good |
| **Pricing Model** | Per verification | Per verification | Per verification | Per verification |
| **Free Trial** | ✅ Sandbox | ✅ Test mode | ✅ Test mode | ✅ Sandbox |
| **Setup Complexity** | Low | Medium | Low | Medium |
| **Best For** | Crypto/Fintech | Global businesses | Stripe users | Identity-focused |

---

## 💰 Pricing Estimates

### Persona
- **Business Verification:** ~$5-15 per verification
- **AML Screening:** ~$1-3 per check
- **Document Verification:** ~$2-5 per document
- **Volume Discounts:** Available
- **Free Tier:** Sandbox mode (unlimited testing)

### Trulioo
- **Business Verification:** ~$3-10 per verification
- **AML Screening:** Included
- **Global Coverage:** Premium pricing for some countries
- **Volume Discounts:** Available
- **Free Tier:** Test mode (limited)

### Stripe Identity
- **Identity Verification:** $1.50-3.00 per verification
- **Business Verification:** Not primary focus
- **AML Screening:** Not included
- **Best if:** Already using Stripe
- **Free Tier:** Test mode

### Onfido (Entrust)
- **Identity Verification:** ~$2-8 per check
- **Business Verification:** Not available
- **Focus:** Individual KYC, not KYB
- **Not Recommended:** For business verification

---

## 🏆 Recommendation: Persona

**Why Persona?**

1. ✅ **Best for Crypto/Fintech**
   - Built specifically for crypto and fintech companies
   - Understands regulatory requirements
   - Used by Coinbase, Kraken, etc.

2. ✅ **Complete KYB Solution**
   - Business verification
   - UBO (Ultimate Beneficial Owner) checks
   - AML/sanctions screening
   - Document verification
   - Ongoing monitoring

3. ✅ **Excellent Developer Experience**
   - Clean, well-documented API
   - React SDK available
   - Webhook support
   - Sandbox environment
   - Great documentation

4. ✅ **Global Coverage**
   - 200+ countries supported
   - Multiple data sources
   - High success rates

5. ✅ **Flexible Integration**
   - Hosted flow (easiest)
   - Embedded SDK (custom UI)
   - API-only (full control)

---

## 🚀 Implementation Plan

### Phase 1: Setup (Week 1)
- [ ] Sign up for Persona account
- [ ] Get API keys (sandbox)
- [ ] Review documentation
- [ ] Test in sandbox mode

### Phase 2: Integration (Week 2)
- [ ] Install Persona SDK
- [ ] Create verification flow
- [ ] Implement webhook handlers
- [ ] Add UI components
- [ ] Test end-to-end

### Phase 3: Production (Week 3)
- [ ] Get production API keys
- [ ] Configure compliance settings
- [ ] Set up monitoring
- [ ] Go live
- [ ] Monitor first verifications

---

## 📋 Persona Features We'll Use

### 1. Business Verification
- Company registration lookup
- Business address verification
- Tax ID verification
- Business license checks

### 2. UBO Verification
- Identify beneficial owners (>25% ownership)
- Verify owner identities
- Check against sanctions lists

### 3. AML Screening
- Sanctions screening (OFAC, UN, EU)
- PEP (Politically Exposed Persons) checks
- Adverse media screening
- Ongoing monitoring

### 4. Document Verification
- Business registration documents
- Tax documents
- Bank statements
- Proof of address

---

## 🔧 Technical Integration

### API Endpoints We'll Use

```
POST /api/v1/inquiries          # Create verification inquiry
GET  /api/v1/inquiries/:id      # Get inquiry status
POST /api/v1/webhooks           # Receive status updates
GET  /api/v1/reports/:id        # Get verification report
```

### Webhook Events

```
inquiry.created
inquiry.started
inquiry.completed
inquiry.failed
inquiry.expired
report.ready
```

### Data Flow

```
1. Merchant submits business info
   ↓
2. Create Persona inquiry
   ↓
3. Redirect to Persona hosted flow
   ↓
4. Merchant uploads documents
   ↓
5. Persona verifies automatically
   ↓
6. Webhook notification
   ↓
7. Update merchant status
   ↓
8. Enable production mode
```

---

## 🔐 Compliance Requirements

### What Persona Checks

1. **Business Identity**
   - Legal business name
   - Registration number
   - Tax ID (EIN, VAT, etc.)
   - Business type/structure

2. **Business Address**
   - Physical address verification
   - Proof of address documents
   - Address matching

3. **Beneficial Owners**
   - Identify all owners >25%
   - Verify owner identities
   - Check owner backgrounds

4. **AML/Sanctions**
   - OFAC sanctions list
   - UN sanctions list
   - EU sanctions list
   - PEP lists
   - Adverse media

5. **Documents**
   - Certificate of incorporation
   - Tax registration
   - Bank statements
   - Business licenses

---

## 💡 Alternative: Trulioo (Backup Option)

If Persona doesn't work out, Trulioo is a solid alternative:

**Pros:**
- Lower cost per verification
- Excellent global coverage
- Good API documentation
- Strong AML capabilities

**Cons:**
- Less crypto-focused
- Slightly more complex integration
- Fewer fintech-specific features

---

## 🎯 Next Steps

1. **Sign up for Persona**
   - Go to: https://withpersona.com
   - Create account
   - Get sandbox API keys

2. **Review Documentation**
   - API Reference: https://docs.withpersona.com
   - Integration guides
   - Best practices

3. **Start Integration**
   - Install SDK
   - Create test inquiry
   - Test verification flow
   - Implement webhooks

---

## 📞 Support Resources

### Persona
- **Docs:** https://docs.withpersona.com
- **API Reference:** https://docs.withpersona.com/reference
- **Support:** support@withpersona.com
- **Slack Community:** Available

### Trulioo (Backup)
- **Docs:** https://developer.trulioo.com
- **API Reference:** https://developer.trulioo.com/reference
- **Support:** support@trulioo.com

---

**Decision: We'll use Persona for KYB integration!**

Ready to start implementation? Let's build it! 🚀

