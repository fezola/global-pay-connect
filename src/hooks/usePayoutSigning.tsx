import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Transaction } from '@solana/web3.js';
import { useToast } from '@/hooks/use-toast';

declare global {
  interface Window {
    solana?: any;
    ethereum?: any;
  }
}

export interface PayoutSigningData {
  payout_id: string;
  chain: string;
  unsigned_transaction: string;
  source_wallet: string;
  destination: string;
  amount: number;
  currency: string;
  expires_at: string;
}

export function usePayoutSigning() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateTransaction = async (payoutId: string): Promise<PayoutSigningData | null> => {
    try {
      setLoading(true);

      const { data, error } = await supabase.functions.invoke('generate-payout-transaction', {
        body: { payout_id: payoutId },
      });

      if (error) throw error;

      return data;
    } catch (error: any) {
      console.error('Error generating transaction:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate transaction',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const signAndSubmitSolana = async (signingData: PayoutSigningData): Promise<boolean> => {
    try {
      setLoading(true);

      // Check if Phantom wallet is installed
      if (!window.solana || !window.solana.isPhantom) {
        toast({
          title: 'Wallet Not Found',
          description: 'Please install Phantom wallet to sign Solana transactions',
          variant: 'destructive',
        });
        return false;
      }

      // Connect wallet
      await window.solana.connect();
      const walletPublicKey = window.solana.publicKey.toString();

      // Verify wallet matches source wallet
      if (walletPublicKey !== signingData.source_wallet) {
        toast({
          title: 'Wrong Wallet',
          description: `Please connect with wallet: ${signingData.source_wallet}`,
          variant: 'destructive',
        });
        return false;
      }

      // Deserialize transaction
      const transactionBuffer = Buffer.from(signingData.unsigned_transaction, 'base64');
      const transaction = Transaction.from(transactionBuffer);

      // Sign transaction
      const signedTransaction = await window.solana.signTransaction(transaction);
      const signedTxBase64 = Buffer.from(signedTransaction.serialize()).toString('base64');

      // Submit signed transaction
      const { data, error } = await supabase.functions.invoke('submit-signed-payout', {
        body: {
          payout_id: signingData.payout_id,
          signed_transaction: signedTxBase64,
        },
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Payout completed! TX: ${data.tx_signature.substring(0, 8)}...`,
      });

      return true;
    } catch (error: any) {
      console.error('Error signing Solana transaction:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to sign transaction',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signAndSubmitEVM = async (signingData: PayoutSigningData): Promise<boolean> => {
    try {
      setLoading(true);

      // Check if MetaMask is installed
      if (!window.ethereum) {
        toast({
          title: 'Wallet Not Found',
          description: 'Please install MetaMask to sign EVM transactions',
          variant: 'destructive',
        });
        return false;
      }

      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const connectedAddress = accounts[0].toLowerCase();

      // Verify wallet matches source wallet
      if (connectedAddress !== signingData.source_wallet.toLowerCase()) {
        toast({
          title: 'Wrong Wallet',
          description: `Please connect with wallet: ${signingData.source_wallet}`,
          variant: 'destructive',
        });
        return false;
      }

      // Parse transaction parameters
      const txParams = JSON.parse(signingData.unsigned_transaction);

      // Send transaction
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [txParams],
      });

      // Submit transaction hash
      const { data, error } = await supabase.functions.invoke('submit-signed-payout', {
        body: {
          payout_id: signingData.payout_id,
          signed_transaction: txHash,
        },
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Payout completed! TX: ${txHash.substring(0, 10)}...`,
      });

      return true;
    } catch (error: any) {
      console.error('Error signing EVM transaction:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to sign transaction',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signAndSubmit = async (signingData: PayoutSigningData): Promise<boolean> => {
    if (signingData.chain === 'solana') {
      return await signAndSubmitSolana(signingData);
    } else if (['ethereum', 'base', 'polygon'].includes(signingData.chain)) {
      return await signAndSubmitEVM(signingData);
    } else {
      toast({
        title: 'Error',
        description: `Unsupported chain: ${signingData.chain}`,
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    loading,
    generateTransaction,
    signAndSubmit,
  };
}

