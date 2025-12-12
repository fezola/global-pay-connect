import axios, { AxiosInstance, AxiosError } from 'axios';

// Export checkout functionality
export { default as KlyrCheckout, checkout } from './checkout';
export type { CheckoutOptions, CheckoutSession } from './checkout';

export interface KlyrConfig {
  apiKey: string;
  baseUrl?: string;
}

export interface Payment {
  id: string;
  merchant_id: string;
  customer_id?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'cancelled' | 'expired';
  payment_address: string;
  expected_token_mint: string;
  chain: string;
  tx_signature?: string;
  confirmations: number;
  customer_email?: string;
  description?: string;
  metadata?: Record<string, any>;
  expires_at: string;
  created_at: string;
  updated_at: string;
  confirmed_at?: string;
}

export interface CreatePaymentParams {
  amount: string | number;
  currency?: string;
  customer_id?: string;
  customer_email?: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface Balance {
  id: string;
  merchant_id: string;
  currency: string;
  total: number;
  onchain: number;
  offchain: number;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  merchant_id: string;
  email: string;
  name?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface WebhookEvent {
  id: string;
  merchant_id: string;
  event_type: string;
  resource_type: string;
  resource_id: string;
  payload: Record<string, any>;
  status: 'pending' | 'delivered' | 'failed' | 'retrying';
  attempts: number;
  created_at: string;
  delivered_at?: string;
}

export interface ListResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

export class KlyrError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'KlyrError';
  }
}

export class Klyr {
  private client: AxiosInstance;

  constructor(config: KlyrConfig) {
    if (!config.apiKey) {
      throw new KlyrError('API key is required');
    }

    const baseUrl = config.baseUrl || 'https://crkhkzcscgoeyspaczux.supabase.co/functions/v1';

    this.client = axios.create({
      baseURL: baseUrl,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey,
      },
    });

    // Error interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response) {
          const data = error.response.data as any;
          throw new KlyrError(
            data.error || 'An error occurred',
            error.response.status,
            data.code
          );
        }
        throw new KlyrError(error.message);
      }
    );
  }

  /**
   * Payments API
   */
  payments = {
    /**
     * Create a new payment
     */
    create: async (params: CreatePaymentParams): Promise<Payment> => {
      const response = await this.client.post('/api-v1/payments', params);
      return response.data;
    },

    /**
     * Retrieve a payment by ID
     */
    retrieve: async (paymentId: string): Promise<Payment> => {
      const response = await this.client.get(`/api-v1/payments/${paymentId}`);
      return response.data;
    },

    /**
     * List all payments
     */
    list: async (params?: {
      limit?: number;
      offset?: number;
      status?: string;
    }): Promise<ListResponse<Payment>> => {
      const response = await this.client.get('/api-v1/payments', { params });
      return response.data;
    },
  };

  /**
   * Balances API
   */
  balances = {
    /**
     * List all balances
     */
    list: async (): Promise<{ data: Balance[] }> => {
      const response = await this.client.get('/api-v1/balances');
      return response.data;
    },
  };

  /**
   * Customers API
   */
  customers = {
    /**
     * Create a new customer
     */
    create: async (params: {
      email: string;
      name?: string;
      metadata?: Record<string, any>;
    }): Promise<Customer> => {
      const response = await this.client.post('/api-v1/customers', params);
      return response.data;
    },

    /**
     * List all customers
     */
    list: async (params?: {
      limit?: number;
      offset?: number;
    }): Promise<ListResponse<Customer>> => {
      const response = await this.client.get('/api-v1/customers', { params });
      return response.data;
    },
  };

  /**
   * Webhooks API
   */
  webhooks = {
    /**
     * List webhook events
     */
    list: async (params?: {
      limit?: number;
      offset?: number;
    }): Promise<ListResponse<WebhookEvent>> => {
      const response = await this.client.get('/api-v1/webhooks', { params });
      return response.data;
    },
  };
}

export default Klyr;

