# Klyr Payment Flow Documentation

## Overview

Klyr is a blockchain payment gateway that enables merchants to accept USDC/USDT payments on Solana. This document describes the complete payment flow from creation to settlement.

## Architecture

```
Customer → Payment Intent → Blockchain Monitor → Settlement → Webhook
     ↓            ↓                ↓                  ↓           ↓
  Checkout    Database         Solana RPC        Balance      Merchant
```

## Payment Flow Steps

### 1. Create Payment Intent

**Endpoint**: `POST /functions/v1/create-payment-intent`

**Request**:
```json
{
  "amount": "100.00",
  "currency": "USDC",
  "customer_email": "customer@example.com",
  "description": "Product purchase",
  "metadata": {
    "order_id": "12345"
  }
}
```

**Response**:
```json
{
  "id": "pi_abc123",
  "amount": "100.00",
  "currency": "USDC",
  "status": "pending",
  "payment_address": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
  "token_mint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  "chain": "solana",
  "expires_at": "2024-01-01T12:30:00Z",
  "created_at": "2024-01-01T12:00:00Z"
}
```

### 2. Customer Sends Payment

Customer sends USDC to the `payment_address` using:
- Phantom Wallet
- Solflare
- Any Solana wallet
- QR code scan

### 3. Blockchain Monitoring

**Function**: `monitor-blockchain`
**Schedule**: Every 30 seconds (cron)

**Process**:
1. Fetches all pending payment intents
2. Queries Solana RPC for recent transactions
3. Matches transactions to payment intents
4. Updates status to `processing` when found

**Solana RPC Calls**:
```javascript
// Get recent transactions
getSignaturesForAddress(walletAddress, { limit: 20 })

// Get transaction details
getTransaction(signature, { encoding: 'jsonParsed' })
```

### 4. Payment Settlement

**Function**: `settle-payment`
**Schedule**: Every 1 minute (cron)

**Process**:
1. Fetches all `processing` payment intents
2. Verifies transaction confirmations (32+ confirmations)
3. Updates payment intent to `succeeded`
4. Updates merchant balance
5. Creates transaction record
6. Queues webhook event

**Confirmation Requirements**:
- Mainnet: 32 confirmations (~15 seconds)
- Devnet: 32 confirmations (~15 seconds)

### 5. Webhook Delivery

**Function**: `deliver-webhooks`
**Schedule**: Every 1 minute (cron)

**Process**:
1. Fetches pending webhook events
2. Sends POST request to merchant's webhook URL
3. Includes HMAC signature for verification
4. Retries on failure with exponential backoff

**Webhook Payload**:
```json
{
  "id": "evt_abc123",
  "type": "payment.succeeded",
  "data": {
    "id": "pi_abc123",
    "amount": "100.00",
    "currency": "USDC",
    "status": "succeeded",
    "tx_signature": "5j7s...",
    "confirmed_at": "2024-01-01T12:01:00Z"
  }
}
```

**Headers**:
```
X-Klyr-Signature: <hmac-sha256>
X-Klyr-Timestamp: <unix-timestamp>
X-Klyr-Event-Id: <event-id>
```

## Database Schema

### payment_intents
- `id`: UUID
- `merchant_id`: UUID (FK)
- `amount`: NUMERIC
- `currency`: TEXT
- `status`: ENUM (pending, processing, succeeded, failed, cancelled, expired)
- `payment_address`: TEXT (merchant's Solana wallet)
- `expected_token_mint`: TEXT (USDC/USDT mint address)
- `tx_signature`: TEXT (Solana transaction signature)
- `confirmations`: INTEGER
- `expires_at`: TIMESTAMPTZ

### webhook_events
- `id`: UUID
- `merchant_id`: UUID (FK)
- `event_type`: TEXT
- `payload`: JSONB
- `status`: ENUM (pending, delivered, failed, retrying)
- `attempts`: INTEGER
- `next_retry_at`: TIMESTAMPTZ

## Token Addresses

### Solana Mainnet
- **USDC**: `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`
- **USDT**: `Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB`

### Solana Devnet
- **USDC**: `4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU`

## Error Handling

### Payment Expiration
- Payment intents expire after 30 minutes
- Expired intents are marked as `expired` by cron job
- No balance update occurs for expired payments

### Failed Transactions
- Transactions with errors are marked as `failed`
- Customer is notified to retry
- No balance update occurs

### Webhook Failures
- Retries: 5 attempts with exponential backoff
- Delays: 1min, 5min, 15min, 1hr, 6hr
- After 5 failures, marked as `failed`
- Merchants can view failed webhooks in dashboard

## Testing

### Devnet Testing
1. Get devnet USDC from faucet
2. Create payment intent
3. Send USDC to payment address
4. Wait for confirmation (~30 seconds)
5. Check webhook delivery

### Mainnet Testing
1. Use small amounts (0.01 USDC)
2. Verify wallet addresses
3. Monitor transaction on Solscan
4. Confirm webhook delivery

## Security

### Webhook Signature Verification
```javascript
import crypto from 'crypto';

function verifyWebhook(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(JSON.stringify(payload));
  const expectedSignature = hmac.digest('hex');
  return signature === expectedSignature;
}
```

### Best Practices
1. Always verify webhook signatures
2. Use HTTPS for webhook endpoints
3. Implement idempotency for webhook handlers
4. Store webhook events for audit trail
5. Monitor for duplicate payments

## Monitoring

### Key Metrics
- Payment success rate
- Average confirmation time
- Webhook delivery rate
- Failed payment reasons

### Alerts
- Payment intent expiration rate > 10%
- Webhook failure rate > 5%
- Blockchain monitoring lag > 2 minutes
- Settlement processing lag > 5 minutes

