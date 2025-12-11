import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMerchant } from '@/hooks/useMerchant';
import { useToast } from '@/hooks/use-toast';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export interface PaymentIntent {
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
  tx_hash?: string;
  confirmations: number;
  customer_email?: string;
  customer_metadata?: Record<string, any>;
  description?: string;
  metadata?: Record<string, any>;
  expires_at: string;
  created_at: string;
  updated_at: string;
  confirmed_at?: string;
}

interface CreatePaymentIntentParams {
  amount: string | number;
  currency?: string;
  customer_email?: string;
  customer_id?: string;
  description?: string;
  metadata?: Record<string, any>;
  expires_in_minutes?: number;
}

export function usePaymentIntents() {
  const { merchant } = useMerchant();
  const { toast } = useToast();
  const [paymentIntents, setPaymentIntents] = useState<PaymentIntent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPaymentIntents = useCallback(async () => {
    if (!merchant?.id) {
      setPaymentIntents([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('payment_intents')
        .select('*')
        .eq('merchant_id', merchant.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPaymentIntents((data as PaymentIntent[]) || []);
    } catch (error: any) {
      console.error('Error fetching payment intents:', error);
    } finally {
      setLoading(false);
    }
  }, [merchant?.id]);

  const createPaymentIntent = async (params: CreatePaymentIntentParams) => {
    if (!merchant?.id) return { error: new Error('No merchant') };

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(`${SUPABASE_URL}/functions/v1/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment intent');
      }

      toast({ title: 'Payment intent created successfully' });
      await fetchPaymentIntents(); // Refresh list
      return { data, error: null };
    } catch (error: any) {
      toast({ 
        title: 'Error creating payment intent', 
        description: error.message, 
        variant: 'destructive' 
      });
      return { error };
    }
  };

  const cancelPaymentIntent = async (intentId: string) => {
    if (!merchant?.id) return { error: new Error('No merchant') };

    try {
      const { error } = await supabase
        .from('payment_intents')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', intentId)
        .eq('merchant_id', merchant.id);

      if (error) throw error;
      
      toast({ title: 'Payment intent cancelled' });
      await fetchPaymentIntents();
      return { error: null };
    } catch (error: any) {
      toast({ 
        title: 'Error cancelling payment intent', 
        description: error.message, 
        variant: 'destructive' 
      });
      return { error };
    }
  };

  // Real-time subscription
  useEffect(() => {
    if (!merchant?.id) return;

    fetchPaymentIntents();

    const channel = supabase
      .channel('payment-intents-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payment_intents',
          filter: `merchant_id=eq.${merchant.id}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setPaymentIntents(prev => [payload.new as PaymentIntent, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setPaymentIntents(prev => 
              prev.map(pi => pi.id === (payload.new as PaymentIntent).id ? payload.new as PaymentIntent : pi)
            );
          } else if (payload.eventType === 'DELETE') {
            setPaymentIntents(prev => prev.filter(pi => pi.id !== (payload.old as PaymentIntent).id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [merchant?.id, fetchPaymentIntents]);

  return {
    paymentIntents,
    loading,
    createPaymentIntent,
    cancelPaymentIntent,
    refetch: fetchPaymentIntents,
  };
}

