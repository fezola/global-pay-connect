# Klyr API Reference

Complete API reference for the Klyr payment gateway.

## Base URL

```
Production: https://crkhkzcscgoeyspaczux.supabase.co/functions/v1/api-v1
Local: http://localhost:54321/functions/v1/api-v1
```

## Authentication

All API requests must include your API key in the `x-api-key` header:

```bash
curl https://crkhkzcscgoeyspaczux.supabase.co/functions/v1/api-v1/payments \
  -H "x-api-key: sk_test_your_api_key_here"
```

### API Keys

- **Test mode**: `sk_test_...` - Use for development and testing
- **Live mode**: `sk_live_...` - Use for production payments

Get your API keys from the Klyr dashboard: Settings → API Keys

## Rate Limiting

- **Limit**: 100 requests per minute per API key
- **Headers**: Rate limit info included in response headers
- **429 Error**: Returned when limit exceeded

## Errors

Klyr uses conventional HTTP response codes:

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Invalid API key |
| 404 | Not Found - Resource doesn't exist |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Server Error - Something went wrong |

Error response format:

```json
{
  "error": "Invalid API key",
  "code": "invalid_api_key"
}
```

---

## Payments

### Create Payment

Creates a new payment intent.

**Endpoint**: `POST /payments`

**Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| amount | string | Yes | Payment amount (e.g., "100.00") |
| currency | string | No | Currency code (default: "USDC") |
| customer_id | string | No | Customer ID |
| customer_email | string | No | Customer email |
| description | string | No | Payment description |
| metadata | object | No | Custom metadata |

**Example Request**:

```bash
curl -X POST https://crkhkzcscgoeyspaczux.supabase.co/functions/v1/api-v1/payments \
  -H "x-api-key: sk_test_..." \
  -H "Content-Type: application/json" \
  -d '{
    "amount": "100.00",
    "currency": "USDC",
    "customer_email": "customer@example.com",
    "description": "Order #1234",
    "metadata": {
      "order_id": "1234"
    }
  }'
```

**Example Response**:

```json
{
  "id": "pi_abc123",
  "merchant_id": "mer_xyz789",
  "amount": 100.00,
  "currency": "USDC",
  "status": "pending",
  "payment_address": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
  "expected_token_mint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  "chain": "solana",
  "tx_signature": null,
  "confirmations": 0,
  "customer_email": "customer@example.com",
  "description": "Order #1234",
  "metadata": {
    "order_id": "1234"
  },
  "expires_at": "2024-01-01T12:30:00Z",
  "created_at": "2024-01-01T12:00:00Z",
  "updated_at": "2024-01-01T12:00:00Z",
  "confirmed_at": null
}
```

### Retrieve Payment

Retrieves a payment by ID.

**Endpoint**: `GET /payments/{id}`

**Example Request**:

```bash
curl https://crkhkzcscgoeyspaczux.supabase.co/functions/v1/api-v1/payments/pi_abc123 \
  -H "x-api-key: sk_test_..."
```

### List Payments

Returns a list of payments.

**Endpoint**: `GET /payments`

**Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| limit | integer | Number of results (default: 10, max: 100) |
| offset | integer | Pagination offset (default: 0) |
| status | string | Filter by status (pending, processing, succeeded, etc.) |

**Example Request**:

```bash
curl "https://crkhkzcscgoeyspaczux.supabase.co/functions/v1/api-v1/payments?limit=10&status=succeeded" \
  -H "x-api-key: sk_test_..."
```

**Example Response**:

```json
{
  "data": [
    {
      "id": "pi_abc123",
      "amount": 100.00,
      "currency": "USDC",
      "status": "succeeded",
      ...
    }
  ],
  "total": 42,
  "limit": 10,
  "offset": 0
}
```

---

## Balances

### List Balances

Returns all account balances.

**Endpoint**: `GET /balances`

**Example Request**:

```bash
curl https://crkhkzcscgoeyspaczux.supabase.co/functions/v1/api-v1/balances \
  -H "x-api-key: sk_test_..."
```

**Example Response**:

```json
{
  "data": [
    {
      "id": "bal_abc123",
      "merchant_id": "mer_xyz789",
      "currency": "USDC",
      "total": 1000.00,
      "onchain": 1000.00,
      "offchain": 0.00,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T12:00:00Z"
    }
  ]
}
```

---

## Customers

### Create Customer

Creates a new customer record.

**Endpoint**: `POST /customers`

**Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| email | string | Yes | Customer email |
| name | string | No | Customer name |
| metadata | object | No | Custom metadata |

**Example Request**:

```bash
curl -X POST https://crkhkzcscgoeyspaczux.supabase.co/functions/v1/api-v1/customers \
  -H "x-api-key: sk_test_..." \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@example.com",
    "name": "John Doe",
    "metadata": {
      "user_id": "12345"
    }
  }'
```

### List Customers

Returns a list of customers.

**Endpoint**: `GET /customers`

**Parameters**: Same as List Payments (limit, offset)

---

## Webhooks

### List Webhook Events

Returns webhook event history.

**Endpoint**: `GET /webhooks`

**Example Response**:

```json
{
  "data": [
    {
      "id": "evt_abc123",
      "event_type": "payment.succeeded",
      "resource_type": "payment_intent",
      "resource_id": "pi_abc123",
      "status": "delivered",
      "attempts": 1,
      "created_at": "2024-01-01T12:00:00Z",
      "delivered_at": "2024-01-01T12:01:00Z"
    }
  ],
  "total": 10,
  "limit": 10,
  "offset": 0
}
```

---

## Pagination

All list endpoints support pagination:

```bash
# First page
GET /payments?limit=10&offset=0

# Second page
GET /payments?limit=10&offset=10

# Third page
GET /payments?limit=10&offset=20
```

---

## Idempotency

To safely retry requests, include an `Idempotency-Key` header:

```bash
curl -X POST https://crkhkzcscgoeyspaczux.supabase.co/functions/v1/api-v1/payments \
  -H "x-api-key: sk_test_..." \
  -H "Idempotency-Key: unique-key-123" \
  -d '{"amount": "100.00"}'
```

---

## Webhooks

Configure webhook endpoints in your dashboard to receive real-time notifications.

### Event Types

- `payment.succeeded` - Payment confirmed
- `payment.failed` - Payment failed
- `payment.expired` - Payment expired

### Webhook Payload

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

### Verifying Webhooks

Verify webhook signatures using HMAC-SHA256:

```javascript
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(JSON.stringify(payload));
  const expectedSignature = hmac.digest('hex');
  return signature === expectedSignature;
}
```

---

## SDKs

Official SDKs available:

- **Node.js**: `npm install @klyr/sdk`
- **Python**: Coming soon
- **PHP**: Coming soon
- **Ruby**: Coming soon

---

## Support

- **Documentation**: https://docs.klyr.io
- **API Status**: https://status.klyr.io
- **Support**: support@klyr.io

