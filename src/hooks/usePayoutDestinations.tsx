import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMerchant } from '@/hooks/useMerchant';
import { useToast } from '@/hooks/use-toast';

export interface PayoutDestination {
  id: string;
  merchant_id: string;
  type: 'wallet' | 'bank';
  label: string;
  chain?: string;
  address?: string;
  bank_name?: string;
  account_holder?: string;
  account_number_last4?: string;
  routing_number?: string;
  is_verified: boolean;
  is_default: boolean;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export function usePayoutDestinations() {
  const { merchant } = useMerchant();
  const [destinations, setDestinations] = useState<PayoutDestination[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchDestinations = useCallback(async () => {
    if (!merchant?.id) {
      setDestinations([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('payout_destinations')
        .select('*')
        .eq('merchant_id', merchant.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDestinations((data as PayoutDestination[]) || []);
    } catch (error: any) {
      console.error('Error fetching payout destinations:', error);
      toast({
        title: 'Error loading destinations',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [merchant?.id, toast]);

  useEffect(() => {
    fetchDestinations();
  }, [fetchDestinations]);

  const createDestination = async (destinationData: {
    type: 'wallet' | 'bank';
    label: string;
    chain?: string;
    address?: string;
    bank_name?: string;
    account_holder?: string;
    account_number_last4?: string;
    routing_number?: string;
    is_default?: boolean;
  }) => {
    if (!merchant?.id) throw new Error('No merchant');

    try {
      // If setting as default, unset other defaults first
      if (destinationData.is_default) {
        await supabase
          .from('payout_destinations')
          .update({ is_default: false })
          .eq('merchant_id', merchant.id)
          .eq('type', destinationData.type);
      }

      const { data, error } = await supabase
        .from('payout_destinations')
        .insert({
          merchant_id: merchant.id,
          ...destinationData,
          is_verified: false, // Will be verified later
        })
        .select()
        .single();

      if (error) throw error;

      await fetchDestinations();

      toast({
        title: 'Destination added',
        description: `${destinationData.label} has been added successfully`
      });

      return data;
    } catch (error: any) {
      toast({
        title: 'Error adding destination',
        description: error.message,
        variant: 'destructive'
      });
      throw error;
    }
  };

  const updateDestination = async (id: string, updates: Partial<PayoutDestination>) => {
    if (!merchant?.id) throw new Error('No merchant');

    try {
      // If setting as default, unset other defaults first
      if (updates.is_default) {
        const destination = destinations.find(d => d.id === id);
        if (destination) {
          await supabase
            .from('payout_destinations')
            .update({ is_default: false })
            .eq('merchant_id', merchant.id)
            .eq('type', destination.type);
        }
      }

      const { error } = await supabase
        .from('payout_destinations')
        .update(updates)
        .eq('id', id)
        .eq('merchant_id', merchant.id);

      if (error) throw error;

      await fetchDestinations();

      toast({
        title: 'Destination updated',
        description: 'Changes saved successfully'
      });
    } catch (error: any) {
      toast({
        title: 'Error updating destination',
        description: error.message,
        variant: 'destructive'
      });
      throw error;
    }
  };

  const deleteDestination = async (id: string) => {
    if (!merchant?.id) throw new Error('No merchant');

    try {
      const { error } = await supabase
        .from('payout_destinations')
        .delete()
        .eq('id', id)
        .eq('merchant_id', merchant.id);

      if (error) throw error;

      await fetchDestinations();

      toast({
        title: 'Destination removed',
        description: 'Payout destination has been deleted'
      });
    } catch (error: any) {
      toast({
        title: 'Error deleting destination',
        description: error.message,
        variant: 'destructive'
      });
      throw error;
    }
  };

  return {
    destinations,
    loading,
    createDestination,
    updateDestination,
    deleteDestination,
    refetch: fetchDestinations,
  };
}

