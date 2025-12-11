export interface Transaction {
  id: string;
  status: 'pending' | 'settled_onchain' | 'settled_offchain' | 'failed';
  type: 'deposit' | 'payout' | 'transfer';
  amount: string;
  currency: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  txHash?: string;
  auditLogs: AuditLog[];
}

export interface AuditLog {
  timestamp: string;
  event: string;
  details: string;
}

export interface Payout {
  id: string;
  status: 'pending' | 'processing' | 'paid' | 'failed';
  amount: string;
  currency: string;
  destination: string;
  destinationType: 'onchain' | 'bank';
  createdAt: string;
  fee: string;
}

export interface Balance {
  currency: string;
  total: string;
  onchain: string;
  offchain: string;
}

export interface Merchant {
  id: string;
  name: string;
  email: string;
  country: string;
  businessType: string;
  website?: string;
  apiKey: string;
  apiKeyLive?: string;
  webhookUrl?: string;
  webhookSecret?: string;
  productionEnabled?: boolean;
  kybStatus?: 'pending' | 'queued' | 'in_progress' | 'verified' | 'rejected';
  twoFactorEnabled?: boolean;
  createdAt: string;
}

export const mockTransactions: Transaction[] = [
  {
    id: 'tx_1a2b3c4d5e6f',
    status: 'settled_onchain',
    type: 'deposit',
    amount: '250.00',
    currency: 'USDC',
    description: 'Customer payment',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:32:00Z',
    txHash: '0x7f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e',
    auditLogs: [
      { timestamp: '2024-01-15T10:30:00Z', event: 'charge_created', details: 'Payment intent created' },
      { timestamp: '2024-01-15T10:30:15Z', event: 'payment_received', details: 'On-chain payment detected' },
      { timestamp: '2024-01-15T10:32:00Z', event: 'settled', details: 'Transaction confirmed' },
    ],
  },
  {
    id: 'tx_2b3c4d5e6f7g',
    status: 'pending',
    type: 'deposit',
    amount: '100.00',
    currency: 'USDC',
    description: 'Test payment',
    createdAt: '2024-01-15T11:00:00Z',
    updatedAt: '2024-01-15T11:00:00Z',
    auditLogs: [
      { timestamp: '2024-01-15T11:00:00Z', event: 'charge_created', details: 'Payment intent created' },
    ],
  },
  {
    id: 'tx_3c4d5e6f7g8h',
    status: 'settled_offchain',
    type: 'transfer',
    amount: '500.00',
    currency: 'USDC',
    description: 'Internal transfer',
    createdAt: '2024-01-14T15:45:00Z',
    updatedAt: '2024-01-14T15:45:30Z',
    auditLogs: [
      { timestamp: '2024-01-14T15:45:00Z', event: 'transfer_initiated', details: 'Off-chain transfer started' },
      { timestamp: '2024-01-14T15:45:30Z', event: 'settled', details: 'Transfer completed' },
    ],
  },
  {
    id: 'tx_4d5e6f7g8h9i',
    status: 'failed',
    type: 'payout',
    amount: '1000.00',
    currency: 'USDC',
    description: 'Payout request',
    createdAt: '2024-01-13T09:00:00Z',
    updatedAt: '2024-01-13T09:05:00Z',
    auditLogs: [
      { timestamp: '2024-01-13T09:00:00Z', event: 'payout_requested', details: 'Payout initiated' },
      { timestamp: '2024-01-13T09:05:00Z', event: 'failed', details: 'Insufficient balance' },
    ],
  },
];

export const mockPayouts: Payout[] = [
  {
    id: 'po_1a2b3c4d',
    status: 'paid',
    amount: '500.00',
    currency: 'USDC',
    destination: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD81',
    destinationType: 'onchain',
    createdAt: '2024-01-14T12:00:00Z',
    fee: '0.50',
  },
  {
    id: 'po_2b3c4d5e',
    status: 'processing',
    amount: '1000.00',
    currency: 'USDC',
    destination: 'DE89370400440532013000',
    destinationType: 'bank',
    createdAt: '2024-01-15T09:30:00Z',
    fee: '5.00',
  },
];

export const mockBalances: Balance[] = [
  { currency: 'USDC', total: '2,450.00', onchain: '1,950.00', offchain: '500.00' },
  { currency: 'USDT', total: '500.00', onchain: '500.00', offchain: '0.00' },
];

export const mockMerchant: Merchant = {
  id: 'merchant_test_1',
  name: 'Acme Corp',
  email: 'dev@acme.com',
  country: 'US',
  businessType: 'software',
  website: 'https://acme.com',
  apiKey: 'sk_test_klyr_1a2b3c4d5e6f7g8h9i0j',
  webhookUrl: 'https://acme.com/webhooks/klyr',
  webhookSecret: 'whsec_1a2b3c4d5e6f',
  createdAt: '2024-01-01T00:00:00Z',
};

export const mockCustomers = [
  { id: 'cus_001', email: 'alice@email.com', name: 'Alice Johnson', phone: '+1 555-0101', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString() },
  { id: 'cus_002', email: 'bob@company.io', name: 'Bob Smith', phone: '+1 555-0102', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 25).toISOString() },
  { id: 'cus_003', email: 'carol@startup.co', name: 'Carol Williams', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString() },
  { id: 'cus_004', email: 'dan@enterprise.com', name: 'Dan Brown', phone: '+1 555-0104', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString() },
  { id: 'cus_005', email: 'eve@web3.xyz', name: 'Eve Davis', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString() },
];
