import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAppStore } from '@/lib/store';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';

type BusinessRow = Tables<'businesses'>;
type MerchantRow = Tables<'merchants'>;

export function useRealtimeKYB() {
  const { user } = useAuth();
  const { merchant, setMerchantFromDb, updateBusiness } = useAppStore();

  const handleMerchantUpdate = useCallback((payload: { new: MerchantRow; old: MerchantRow }) => {
    const newData = payload.new;
    const oldData = payload.old;
    
    // Only process if kyb_status changed
    if (newData.kyb_status !== oldData.kyb_status) {
      setMerchantFromDb(newData);
      
      // Show toast notification based on status
      switch (newData.kyb_status) {
        case 'verified':
          toast.success('KYB Verified!', {
            description: 'Your business has been verified. You can now enable production payments.',
          });
          break;
        case 'rejected':
          toast.error('KYB Rejected', {
            description: 'Your business verification was rejected. Please review and resubmit.',
          });
          break;
        case 'in_progress':
          toast.info('KYB Under Review', {
            description: 'Your business is being reviewed. This typically takes 1-2 business days.',
          });
          break;
      }
    }
  }, [setMerchantFromDb]);

  const handleBusinessUpdate = useCallback((payload: { new: BusinessRow; old: BusinessRow }) => {
    const newData = payload.new;
    const oldData = payload.old;
    
    // Only process if status changed
    if (newData.status !== oldData.status) {
      updateBusiness({
        status: newData.status as any,
        verifiedAt: newData.verified_at || undefined,
        walletVerified: newData.wallet_verified || false,
      });
      
      // Show toast notification based on status
      switch (newData.status) {
        case 'verified':
          toast.success('Business Verified!', {
            description: 'Your business registration has been approved.',
          });
          break;
        case 'rejected':
          toast.error('Business Rejected', {
            description: 'Your business registration was rejected. Please review the requirements.',
          });
          break;
        case 'under_review':
          toast.info('Under Review', {
            description: 'Your business is now under review.',
          });
          break;
      }
    }
  }, [updateBusiness]);

  useEffect(() => {
    if (!user || !merchant) return;

    // Subscribe to merchant updates
    const merchantChannel = supabase
      .channel('merchant-kyb-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'merchants',
          filter: `id=eq.${merchant.id}`,
        },
        (payload) => handleMerchantUpdate(payload as any)
      )
      .subscribe();

    // Subscribe to business updates
    const businessChannel = supabase
      .channel('business-kyb-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'businesses',
        },
        (payload) => handleBusinessUpdate(payload as any)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(merchantChannel);
      supabase.removeChannel(businessChannel);
    };
  }, [user, merchant?.id, handleMerchantUpdate, handleBusinessUpdate]);
}
