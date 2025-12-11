import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMerchant } from '@/hooks/useMerchant';
import { useToast } from '@/hooks/use-toast';

export interface ApiKey {
  id: string;
  merchant_id: string;
  name: string | null;
  type: string;
  key_last4: string;
  key_hash: string;
  permissions: string[] | null;
  is_active: boolean;
  expires_at: string | null;
  last_used_at: string | null;
  created_at: string;
}

export function useApiKeys() {
  const { merchant } = useMerchant();
  const { toast } = useToast();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApiKeys = useCallback(async () => {
    if (!merchant?.id) {
      setApiKeys([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('merchant_id', merchant.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApiKeys((data as ApiKey[]) || []);
    } catch (error: any) {
      console.error('Error fetching API keys:', error);
    } finally {
      setLoading(false);
    }
  }, [merchant?.id]);

  const createApiKey = async (name: string, type: 'sandbox' | 'live') => {
    if (!merchant?.id) return { error: new Error('No merchant'), key: null };

    try {
      // Generate a new API key
      const keyPrefix = type === 'live' ? 'sk_live_klyr_' : 'sk_test_klyr_';
      const keyBody = Array.from({ length: 24 }, () => 
        'abcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 36)]
      ).join('');
      const fullKey = `${keyPrefix}${keyBody}`;
      const last4 = fullKey.slice(-4);
      
      // Simple hash for demo (in production use proper hashing)
      const keyHash = btoa(fullKey);

      const { data, error } = await supabase
        .from('api_keys')
        .insert({
          merchant_id: merchant.id,
          name,
          type,
          key_last4: last4,
          key_hash: keyHash,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;
      setApiKeys(prev => [data as ApiKey, ...prev]);
      toast({ title: 'API key created', description: 'Make sure to copy your key now. You won\'t see it again!' });
      return { data, key: fullKey, error: null };
    } catch (error: any) {
      toast({ title: 'Error creating API key', description: error.message, variant: 'destructive' });
      return { error, key: null };
    }
  };

  const revokeApiKey = async (id: string) => {
    try {
      const { error } = await supabase
        .from('api_keys')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
      setApiKeys(prev => prev.map(k => k.id === id ? { ...k, is_active: false } : k));
      toast({ title: 'API key revoked' });
      return { error: null };
    } catch (error: any) {
      toast({ title: 'Error revoking API key', description: error.message, variant: 'destructive' });
      return { error };
    }
  };

  const deleteApiKey = async (id: string) => {
    try {
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setApiKeys(prev => prev.filter(k => k.id !== id));
      toast({ title: 'API key deleted' });
      return { error: null };
    } catch (error: any) {
      toast({ title: 'Error deleting API key', description: error.message, variant: 'destructive' });
      return { error };
    }
  };

  useEffect(() => {
    fetchApiKeys();
  }, [fetchApiKeys]);

  return { apiKeys, loading, createApiKey, revokeApiKey, deleteApiKey, refetch: fetchApiKeys };
}
