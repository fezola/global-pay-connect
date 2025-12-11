import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMerchant } from '@/hooks/useMerchant';
import { useToast } from '@/hooks/use-toast';

export interface Transaction {
  id: string;
  merchant_id: string;
  status: 'pending' | 'settled_onchain' | 'settled_offchain' | 'failed';
  type: 'deposit' | 'payout' | 'transfer';
  amount: number;
  currency: string;
  description: string | null;
  tx_hash: string | null;
  created_at: string;
  updated_at: string;
}

export function useTransactions() {
  const { merchant } = useMerchant();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = useCallback(async () => {
    if (!merchant?.id) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('merchant_id', merchant.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions((data as Transaction[]) || []);
    } catch (error: any) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  }, [merchant?.id]);

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'merchant_id' | 'created_at' | 'updated_at'>) => {
    if (!merchant?.id) return { error: new Error('No merchant') };

    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          merchant_id: merchant.id,
          ...transaction
        })
        .select()
        .single();

      if (error) throw error;
      setTransactions(prev => [data as Transaction, ...prev]);
      return { data, error: null };
    } catch (error: any) {
      toast({ title: 'Error creating transaction', description: error.message, variant: 'destructive' });
      return { error };
    }
  };

  // Real-time subscription
  useEffect(() => {
    if (!merchant?.id) return;

    const channel = supabase
      .channel('transactions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `merchant_id=eq.${merchant.id}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setTransactions(prev => [payload.new as Transaction, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setTransactions(prev => 
              prev.map(t => t.id === (payload.new as Transaction).id ? payload.new as Transaction : t)
            );
          } else if (payload.eventType === 'DELETE') {
            setTransactions(prev => prev.filter(t => t.id !== (payload.old as Transaction).id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [merchant?.id]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return { transactions, loading, addTransaction, refetch: fetchTransactions };
}
