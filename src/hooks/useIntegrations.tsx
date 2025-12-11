import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMerchant } from '@/hooks/useMerchant';
import { useToast } from '@/hooks/use-toast';

export interface Integration {
  id: string;
  merchant_id: string;
  type: string;
  provider: string;
  name: string | null;
  is_connected: boolean;
  is_production: boolean;
  config: Record<string, any> | null;
  credentials: Record<string, any> | null;
  last_test_at: string | null;
  last_test_result: string | null;
  created_at: string;
}

export function useIntegrations() {
  const { merchant } = useMerchant();
  const { toast } = useToast();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchIntegrations = useCallback(async () => {
    if (!merchant?.id) {
      setIntegrations([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('integrations')
        .select('*')
        .eq('merchant_id', merchant.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIntegrations((data as Integration[]) || []);
    } catch (error: any) {
      console.error('Error fetching integrations:', error);
    } finally {
      setLoading(false);
    }
  }, [merchant?.id]);

  const addIntegration = async (integration: { type: string; provider: string; name?: string }) => {
    if (!merchant?.id) return { error: new Error('No merchant') };

    try {
      const { data, error } = await supabase
        .from('integrations')
        .insert({
          merchant_id: merchant.id,
          type: integration.type,
          provider: integration.provider,
          name: integration.name || null
        })
        .select()
        .single();

      if (error) throw error;
      setIntegrations(prev => [data as Integration, ...prev]);
      toast({ title: 'Integration added' });
      return { data, error: null };
    } catch (error: any) {
      toast({ title: 'Error adding integration', description: error.message, variant: 'destructive' });
      return { error };
    }
  };

  const updateIntegration = async (id: string, updates: Partial<Integration>) => {
    try {
      const { error } = await supabase
        .from('integrations')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      setIntegrations(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
      return { error: null };
    } catch (error: any) {
      toast({ title: 'Error updating integration', description: error.message, variant: 'destructive' });
      return { error };
    }
  };

  const removeIntegration = async (id: string) => {
    try {
      const { error } = await supabase
        .from('integrations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setIntegrations(prev => prev.filter(i => i.id !== id));
      toast({ title: 'Integration removed' });
      return { error: null };
    } catch (error: any) {
      toast({ title: 'Error removing integration', description: error.message, variant: 'destructive' });
      return { error };
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, [fetchIntegrations]);

  return { integrations, loading, addIntegration, updateIntegration, removeIntegration, refetch: fetchIntegrations };
}
