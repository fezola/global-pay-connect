import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMerchant } from '@/hooks/useMerchant';
import { useToast } from '@/hooks/use-toast';

export interface Customer {
  id: string;
  merchant_id: string;
  email: string;
  name: string | null;
  phone: string | null;
  billing_address: Record<string, any> | null;
  metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export function useCustomers() {
  const { merchant } = useMerchant();
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomers = useCallback(async () => {
    if (!merchant?.id) {
      setCustomers([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('merchant_id', merchant.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCustomers((data as Customer[]) || []);
    } catch (error: any) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  }, [merchant?.id]);

  const addCustomer = async (customer: { email: string; name?: string; phone?: string }) => {
    if (!merchant?.id) return { error: new Error('No merchant') };

    try {
      const { data, error } = await supabase
        .from('customers')
        .insert({
          merchant_id: merchant.id,
          email: customer.email,
          name: customer.name || null,
          phone: customer.phone || null
        })
        .select()
        .single();

      if (error) throw error;
      setCustomers(prev => [data as Customer, ...prev]);
      toast({ title: 'Customer added successfully' });
      return { data, error: null };
    } catch (error: any) {
      toast({ title: 'Error adding customer', description: error.message, variant: 'destructive' });
      return { error };
    }
  };

  const removeCustomer = async (id: string) => {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setCustomers(prev => prev.filter(c => c.id !== id));
      toast({ title: 'Customer removed' });
      return { error: null };
    } catch (error: any) {
      toast({ title: 'Error removing customer', description: error.message, variant: 'destructive' });
      return { error };
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return { customers, loading, addCustomer, removeCustomer, refetch: fetchCustomers };
}
