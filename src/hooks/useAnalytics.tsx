import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';

export interface MerchantStats {
  merchant_id: string;
  business_name: string;
  total_payments: number;
  successful_payments: number;
  payments_last_30_days: number;
  total_revenue: number;
  revenue_last_30_days: number;
  unique_customers: number;
  total_payouts: number;
  completed_payouts: number;
  total_payout_amount: number;
  first_payment_at: string | null;
  last_payment_at: string | null;
}

export interface DailyRevenue {
  date: string;
  currency: string;
  transaction_count: number;
  total_amount: number;
  avg_amount: number;
  min_amount: number;
  max_amount: number;
}

export interface TopCustomer {
  customer_email: string;
  currency: string;
  payment_count: number;
  total_spent: number;
  avg_payment: number;
  last_payment_at: string;
}

export interface ChainUsage {
  chain: string;
  payment_count: number;
  total_volume: number;
  avg_amount: number;
}

export interface CurrencyBreakdown {
  currency: string;
  payment_count: number;
  total_volume: number;
  avg_amount: number;
  first_payment_at: string;
  last_payment_at: string;
}

type AnalyticsType = 
  | 'overview'
  | 'daily_revenue'
  | 'monthly_revenue'
  | 'success_rate'
  | 'top_customers'
  | 'chain_usage'
  | 'currency_breakdown'
  | 'recent_transactions';

interface UseAnalyticsOptions {
  type: AnalyticsType;
  days?: number;
  currency?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useAnalytics<T = any>({
  type,
  days = 30,
  currency,
  autoRefresh = false,
  refreshInterval = 60000, // 1 minute
}: UseAnalyticsOptions) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      // Build query string
      const params = new URLSearchParams({
        type,
        days: days.toString(),
      });

      if (currency) {
        params.append('currency', currency);
      }

      // Get Supabase URL from environment
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const functionUrl = `${supabaseUrl}/functions/v1/get-analytics?${params.toString()}`;

      const response = await fetch(functionUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();

      // Handle the response - it should have a 'data' property
      const analyticsData = result?.data || result;

      // Ensure arrays are actually arrays
      if (Array.isArray(analyticsData)) {
        setData(analyticsData as T);
      } else if (analyticsData && typeof analyticsData === 'object') {
        setData(analyticsData as T);
      } else {
        setData([] as T);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
      setData([] as T); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();

    if (autoRefresh) {
      const interval = setInterval(fetchAnalytics, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [type, days, currency, autoRefresh, refreshInterval]);

  return {
    data,
    loading,
    error,
    refetch: fetchAnalytics,
  };
}

// Convenience hooks for specific analytics types
export function useMerchantStats() {
  return useAnalytics<MerchantStats>({ type: 'overview' });
}

export function useDailyRevenue(days = 30, currency?: string) {
  return useAnalytics<DailyRevenue[]>({ type: 'daily_revenue', days, currency });
}

export function useTopCustomers(currency?: string) {
  return useAnalytics<TopCustomer[]>({ type: 'top_customers', currency });
}

export function useChainUsage() {
  return useAnalytics<ChainUsage[]>({ type: 'chain_usage' });
}

export function useCurrencyBreakdown() {
  return useAnalytics<CurrencyBreakdown[]>({ type: 'currency_breakdown' });
}

