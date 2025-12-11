import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMerchant } from '@/hooks/useMerchant';
import { useToast } from '@/hooks/use-toast';

export interface Payout {
  id: string;
  merchant_id: string;
  status: 'pending' | 'processing' | 'paid' | 'failed';
  amount: number;
  currency: string;
  destination: string;
  destination_type: 'onchain' | 'bank';
  fee: number;
  created_at: string;
  updated_at: string;
}

export function usePayouts() {
  const { merchant } = useMerchant();
  const { toast } = useToast();
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPayouts = useCallback(async () => {
    if (!merchant?.id) {
      setPayouts([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('payouts')
        .select('*')
        .eq('merchant_id', merchant.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPayouts((data as Payout[]) || []);
    } catch (error: any) {
      console.error('Error fetching payouts:', error);
    } finally {
      setLoading(false);
    }
  }, [merchant?.id]);

  const createPayout = async (payoutData: {
    amount: string;
    currency?: string;
    destination_address?: string;
    destination_id?: string;
    notes?: string;
  }) => {
    if (!merchant?.id) throw new Error('No merchant');

    try {
      const { data, error } = await supabase.functions.invoke('create-payout', {
        body: payoutData,
      });

      if (error) throw error;

      // Refresh payouts list
      await fetchPayouts();

      toast({
        title: 'Payout requested successfully',
        description: data.message || 'Your withdrawal request has been created'
      });

      return data;
    } catch (error: any) {
      toast({
        title: 'Error creating payout',
        description: error.message,
        variant: 'destructive'
      });
      throw error;
    }
  };

  // Real-time subscription
  useEffect(() => {
    if (!merchant?.id) return;

    const channel = supabase
      .channel('payouts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payouts',
          filter: `merchant_id=eq.${merchant.id}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setPayouts(prev => [payload.new as Payout, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setPayouts(prev => 
              prev.map(p => p.id === (payload.new as Payout).id ? payload.new as Payout : p)
            );
          } else if (payload.eventType === 'DELETE') {
            setPayouts(prev => prev.filter(p => p.id !== (payload.old as Payout).id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [merchant?.id]);

  useEffect(() => {
    fetchPayouts();
  }, [fetchPayouts]);

  return { payouts, loading, createPayout, refetch: fetchPayouts };
}
