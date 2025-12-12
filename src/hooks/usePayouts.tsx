import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMerchant } from '@/hooks/useMerchant';
import { useToast } from '@/hooks/use-toast';

export interface Payout {
  id: string;
  merchant_id: string;
  status: 'pending' | 'approved' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'rejected';
  amount: number;
  currency: string;
  destination_address: string;
  destination_type: 'wallet' | 'bank';
  fee_amount: number;
  net_amount: number;
  tx_signature?: string;
  chain?: string;
  requires_approval: boolean;
  approved_by?: string;
  approved_at?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
  // Legacy fields for backward compatibility
  destination?: string;
  fee?: number;
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

  const approvePayout = async (payoutId: string, notes?: string) => {
    if (!merchant?.id) throw new Error('No merchant');

    try {
      const { data, error } = await supabase.functions.invoke('approve-payout', {
        body: { payout_id: payoutId, notes },
      });

      if (error) throw error;

      await fetchPayouts();

      toast({
        title: 'Payout approved',
        description: 'The payout has been approved and will be processed shortly'
      });

      return data;
    } catch (error: any) {
      toast({
        title: 'Error approving payout',
        description: error.message,
        variant: 'destructive'
      });
      throw error;
    }
  };

  const rejectPayout = async (payoutId: string, reason: string) => {
    if (!merchant?.id) throw new Error('No merchant');

    try {
      const { data, error } = await supabase.functions.invoke('reject-payout', {
        body: { payout_id: payoutId, reason },
      });

      if (error) throw error;

      await fetchPayouts();

      toast({
        title: 'Payout rejected',
        description: 'The payout request has been rejected'
      });

      return data;
    } catch (error: any) {
      toast({
        title: 'Error rejecting payout',
        description: error.message,
        variant: 'destructive'
      });
      throw error;
    }
  };

  const cancelPayout = async (payoutId: string) => {
    if (!merchant?.id) throw new Error('No merchant');

    try {
      const { error } = await supabase
        .from('payouts')
        .update({ status: 'cancelled' })
        .eq('id', payoutId)
        .eq('merchant_id', merchant.id)
        .in('status', ['pending', 'approved']);

      if (error) throw error;

      await fetchPayouts();

      toast({
        title: 'Payout cancelled',
        description: 'The payout has been cancelled'
      });
    } catch (error: any) {
      toast({
        title: 'Error cancelling payout',
        description: error.message,
        variant: 'destructive'
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchPayouts();
  }, [fetchPayouts]);

  return {
    payouts,
    loading,
    createPayout,
    approvePayout,
    rejectPayout,
    cancelPayout,
    refetch: fetchPayouts
  };
}
