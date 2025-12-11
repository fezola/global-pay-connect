import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useAppStore } from '@/lib/store';
import type { Tables } from '@/integrations/supabase/types';

type MerchantRow = Tables<'merchants'>;

export function useMerchant() {
  const { user } = useAuth();
  const { merchant: localMerchant, setMerchantFromDb } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMerchant = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return null;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('merchants')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError) throw fetchError;
      
      if (data) {
        setMerchantFromDb(data);
      }
      
      setLoading(false);
      return data;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      return null;
    }
  }, [user, setMerchantFromDb]);

  const createMerchant = async (merchantData: {
    name: string;
    email: string;
    country: string;
    businessType?: string;
    website?: string;
  }) => {
    if (!user) throw new Error('User not authenticated');

    const apiKeySandbox = `sk_test_klyr_${crypto.randomUUID().replace(/-/g, '').substring(0, 24)}`;
    
    const { data, error: insertError } = await supabase
      .from('merchants')
      .insert({
        user_id: user.id,
        name: merchantData.name,
        email: merchantData.email,
        country: merchantData.country,
        business_type: merchantData.businessType,
        website: merchantData.website,
        api_key_sandbox: apiKeySandbox,
        kyb_status: 'pending',
        production_enabled: false,
        two_factor_enabled: false,
      })
      .select()
      .single();

    if (insertError) throw insertError;
    
    setMerchantFromDb(data);
    return apiKeySandbox;
  };

  const updateMerchant = async (updates: Partial<MerchantRow>) => {
    if (!user || !localMerchant) throw new Error('No merchant to update');

    const { data, error: updateError } = await supabase
      .from('merchants')
      .update(updates)
      .eq('id', localMerchant.id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) throw updateError;
    
    setMerchantFromDb(data);
    return data;
  };

  const regenerateApiKey = async (type: 'sandbox' | 'live' = 'sandbox') => {
    const newKey = type === 'live' 
      ? `sk_live_klyr_${crypto.randomUUID().replace(/-/g, '').substring(0, 24)}`
      : `sk_test_klyr_${crypto.randomUUID().replace(/-/g, '').substring(0, 24)}`;
    
    const update = type === 'live' 
      ? { api_key_live: newKey }
      : { api_key_sandbox: newKey };
    
    await updateMerchant(update);
    return newKey;
  };

  useEffect(() => {
    fetchMerchant();
  }, [fetchMerchant]);

  return {
    merchant: localMerchant,
    loading,
    error,
    createMerchant,
    updateMerchant,
    regenerateApiKey,
    refetch: fetchMerchant,
  };
}
