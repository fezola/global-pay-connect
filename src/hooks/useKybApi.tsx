import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const SUPABASE_URL = 'https://crkhkzcscgoeyspaczux.supabase.co';

interface NonceResponse {
  nonce: string;
  message: string;
  expires_in: number;
  wallet_address: string;
  chain: string;
}

interface ProveControlResponse {
  verified: boolean;
  verifiedAt?: string;
  wallet_address?: string;
  chain?: string;
  error?: string;
}

interface SubmitKybResponse {
  status: string;
  kyb_job_id?: string;
  message?: string;
  error?: string;
  validation_errors?: string[];
}

export function useKybApi() {
  
  const getAuthHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      throw new Error('Not authenticated');
    }
    return {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    };
  };

  const requestWalletNonce = async (businessId: string, walletId: string): Promise<NonceResponse> => {
    try {
      const headers = await getAuthHeaders();
      const url = `${SUPABASE_URL}/functions/v1/wallet-nonce?businessId=${businessId}&walletId=${walletId}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get nonce');
      }

      return data;
    } catch (error: any) {
      console.error('Request nonce error:', error);
      toast.error('Failed to request nonce', { description: error.message });
      throw error;
    }
  };

  const proveWalletControl = async (
    businessId: string, 
    walletId: string, 
    signature: string, 
    signerPubkey?: string
  ): Promise<ProveControlResponse> => {
    try {
      const headers = await getAuthHeaders();
      const url = `${SUPABASE_URL}/functions/v1/prove-control`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          businessId,
          walletId,
          signature,
          signer_pubkey: signerPubkey,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      if (data.verified) {
        toast.success('Wallet verified!', { 
          description: 'Your wallet ownership has been confirmed.' 
        });
      }

      return data;
    } catch (error: any) {
      console.error('Prove control error:', error);
      toast.error('Wallet verification failed', { description: error.message });
      throw error;
    }
  };

  const submitForKyb = async (businessId: string): Promise<SubmitKybResponse> => {
    try {
      const headers = await getAuthHeaders();
      const url = `${SUPABASE_URL}/functions/v1/submit-kyb`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({ businessId }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        if (data.validation_errors) {
          toast.error('Validation failed', { 
            description: data.validation_errors.join(', ') 
          });
        } else {
          toast.error('Submission failed', { description: data.error });
        }
        throw new Error(data.error || 'Submission failed');
      }

      toast.success('Submitted for review!', { 
        description: data.message || 'Your business is now under KYB review.' 
      });

      return data;
    } catch (error: any) {
      console.error('Submit KYB error:', error);
      throw error;
    }
  };

  return {
    requestWalletNonce,
    proveWalletControl,
    submitForKyb,
  };
}
