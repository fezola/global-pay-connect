import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMerchant } from '@/hooks/useMerchant';

export interface Balance {
  id: string;
  merchant_id: string;
  currency: string;
  total: number;
  onchain: number;
  offchain: number;
  updated_at: string;
}

export function useBalances() {
  const { merchant } = useMerchant();
  const [balances, setBalances] = useState<Balance[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBalances = useCallback(async () => {
    if (!merchant?.id) {
      setBalances([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('balances')
        .select('*')
        .eq('merchant_id', merchant.id);

      if (error) throw error;
      
      // If no balances exist, create default ones
      if (!data || data.length === 0) {
        const defaultBalances = [
          { merchant_id: merchant.id, currency: 'USDC', total: 0, onchain: 0, offchain: 0 },
          { merchant_id: merchant.id, currency: 'USDT', total: 0, onchain: 0, offchain: 0 }
        ];
        
        const { data: newBalances, error: insertError } = await supabase
          .from('balances')
          .insert(defaultBalances)
          .select();
        
        if (insertError) throw insertError;
        setBalances((newBalances as Balance[]) || []);
      } else {
        setBalances((data as Balance[]) || []);
      }
    } catch (error: any) {
      console.error('Error fetching balances:', error);
    } finally {
      setLoading(false);
    }
  }, [merchant?.id]);

  // Real-time subscription
  useEffect(() => {
    if (!merchant?.id) return;

    const channel = supabase
      .channel('balances-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'balances',
          filter: `merchant_id=eq.${merchant.id}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setBalances(prev => [...prev, payload.new as Balance]);
          } else if (payload.eventType === 'UPDATE') {
            setBalances(prev => 
              prev.map(b => b.id === (payload.new as Balance).id ? payload.new as Balance : b)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [merchant?.id]);

  useEffect(() => {
    fetchBalances();
  }, [fetchBalances]);

  // Format balance for display
  const formatBalance = (balance: Balance) => ({
    currency: balance.currency,
    total: balance.total.toLocaleString('en-US', { minimumFractionDigits: 2 }),
    onchain: balance.onchain.toLocaleString('en-US', { minimumFractionDigits: 2 }),
    offchain: balance.offchain.toLocaleString('en-US', { minimumFractionDigits: 2 })
  });

  return { balances, loading, formatBalance, refetch: fetchBalances };
}
