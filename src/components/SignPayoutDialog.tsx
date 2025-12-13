import { useState, useEffect } from "react";
import { Wallet, AlertCircle, Clock, ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { usePayoutSigning, PayoutSigningData } from "@/hooks/usePayoutSigning";
import { formatCurrency } from "@/lib/utils";

interface SignPayoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payoutId: string;
  onSuccess?: () => void;
}

export function SignPayoutDialog({ 
  open, 
  onOpenChange, 
  payoutId,
  onSuccess 
}: SignPayoutDialogProps) {
  const [signingData, setSigningData] = useState<PayoutSigningData | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const { loading, generateTransaction, signAndSubmit } = usePayoutSigning();

  useEffect(() => {
    if (open && payoutId) {
      loadTransaction();
    }
  }, [open, payoutId]);

  useEffect(() => {
    if (!signingData?.expires_at) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const expiry = new Date(signingData.expires_at).getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeRemaining('Expired');
        clearInterval(interval);
      } else {
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [signingData]);

  const loadTransaction = async () => {
    const data = await generateTransaction(payoutId);
    if (data) {
      setSigningData(data);
    }
  };

  const handleSign = async () => {
    if (!signingData) return;

    const success = await signAndSubmit(signingData);
    if (success) {
      onOpenChange(false);
      onSuccess?.();
    }
  };

  const getWalletName = (chain: string) => {
    if (chain === 'solana') return 'Phantom';
    return 'MetaMask';
  };

  const getExplorerUrl = (chain: string, address: string) => {
    const explorers: Record<string, string> = {
      solana: `https://solscan.io/account/${address}`,
      ethereum: `https://etherscan.io/address/${address}`,
      base: `https://basescan.org/address/${address}`,
      polygon: `https://polygonscan.com/address/${address}`,
    };
    return explorers[chain] || '#';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Sign Payout Transaction
          </DialogTitle>
          <DialogDescription>
            Connect your wallet to sign and complete this payout
          </DialogDescription>
        </DialogHeader>

        {loading && !signingData ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : signingData ? (
          <div className="space-y-4">
            {/* Transaction Details */}
            <div className="bg-muted rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Amount</span>
                <span className="font-semibold">
                  {formatCurrency(signingData.amount, signingData.currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Chain</span>
                <span className="font-medium capitalize">{signingData.chain}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">From</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs">
                    {signingData.source_wallet.substring(0, 6)}...
                    {signingData.source_wallet.substring(signingData.source_wallet.length - 4)}
                  </span>
                  <a
                    href={getExplorerUrl(signingData.chain, signingData.source_wallet)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">To</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs">
                    {signingData.destination.substring(0, 6)}...
                    {signingData.destination.substring(signingData.destination.length - 4)}
                  </span>
                  <a
                    href={getExplorerUrl(signingData.chain, signingData.destination)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* Expiry Warning */}
            {timeRemaining && timeRemaining !== 'Expired' && (
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  Transaction expires in: <strong>{timeRemaining}</strong>
                </AlertDescription>
              </Alert>
            )}

            {timeRemaining === 'Expired' && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This transaction has expired. Please close and try again.
                </AlertDescription>
              </Alert>
            )}

            {/* Instructions */}
            <Alert className="bg-primary/5 border-primary/20">
              <Wallet className="h-4 w-4 text-primary" />
              <AlertDescription>
                Click the button below to open {getWalletName(signingData.chain)} and sign the transaction.
                Make sure you're connected with the correct wallet address.
              </AlertDescription>
            </Alert>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSign}
                disabled={loading || timeRemaining === 'Expired'}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing...
                  </>
                ) : (
                  <>
                    <Wallet className="h-4 w-4 mr-2" />
                    Sign with {getWalletName(signingData.chain)}
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load transaction. Please try again.
            </AlertDescription>
          </Alert>
        )}
      </DialogContent>
    </Dialog>
  );
}

