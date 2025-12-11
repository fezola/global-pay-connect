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

  const createPayout = async (payout: Omit<Payout, 'id' | 'merchant_id' | 'created_at' | 'updated_at'>) => {
    if (!merchant?.id) return { error: new Error('No merchant') };

    try {
      const { data, error } = await supabase
        .from('payouts')
        .insert({
          merchant_id: merchant.id,
          ...payout
        })
        .select()
        .single();

      if (error) throw error;
      setPayouts(prev => [data as Payout, ...prev]);
      toast({ title: 'Payout requested successfully' });
      return { data, error: null };
    } catch (error: any) {
      toast({ title: 'Error creating payout', description: error.message, variant: 'destructive' });
      return { error };
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
