/**
 * Step 5: Payment Confirmation
 * Final step - review and submit payment
 */

import { useState } from "react";
import { CheckCircle2, Loader2, AlertCircle, ExternalLink, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { WalletConnection, TokenType, ChainType } from "@/lib/walletProviders";
import { sendSolanaTokenTransfer, sendEVMTokenTransfer } from "@/lib/blockchainTransactions";

interface PaymentConfirmationProps {
  wallet: WalletConnection;
  currency: TokenType;
  network: ChainType;
  amount: number;
  totalCrypto: number;
  merchantName: string;
  onSuccess: (txHash: string) => void;
  onBack: () => void;
  theme?: "light" | "dark" | "auto";
}

export function PaymentConfirmation({
  wallet,
  currency,
  network,
  amount,
  totalCrypto,
  merchantName,
  onSuccess,
  onBack,
  theme = "light",
}: PaymentConfirmationProps) {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const isDark = theme === "dark" || (theme === "auto" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(wallet.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async () => {
    setProcessing(true);
    setError(null);

    try {
      console.log("Submitting payment...", {
        wallet: wallet.address,
        currency,
        network,
        amount: totalCrypto,
      });

      // Valid demo merchant addresses for testing
      // In production, these would come from the payment intent
      const merchantAddress = network === "solana"
        ? "9B5XszUGdMaxCZ7uSQhPzdks5ZQSmWxrmzCSvtJ6Ns6g" // Valid Solana devnet address
        : "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"; // Valid Ethereum address

      // For demo purposes, simulate successful payment
      // In production, this would actually send the transaction
      console.log("Demo mode: Simulating payment to", merchantAddress);

      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate mock transaction hash
      const mockTxHash = network === "solana"
        ? `${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}` // Solana-style
        : `0x${Math.random().toString(16).substring(2, 15)}${Math.random().toString(16).substring(2, 15)}`; // EVM-style

      console.log("Demo payment successful:", mockTxHash);
      onSuccess(mockTxHash);

      /*
      // Uncomment for real blockchain transactions:
      let result;

      if (network === "solana") {
        result = await sendSolanaTokenTransfer(
          wallet,
          merchantAddress,
          totalCrypto,
          currency,
          false // Use devnet for testing
        );
      } else {
        result = await sendEVMTokenTransfer(
          wallet,
          merchantAddress,
          totalCrypto,
          currency
        );
      }

      if (result.success && result.signature) {
        console.log("Payment successful:", result.signature);
        onSuccess(result.signature);
      } else {
        throw new Error(result.error || "Transaction failed");
      }
      */
    } catch (err: any) {
      console.error("Payment error:", err);
      setError(err.message || "Failed to process payment");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
          <CheckCircle2 className="h-8 w-8 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Confirm Payment</h2>
        <p className={cn("text-sm", isDark ? "text-slate-400" : "text-slate-600")}>
          Review the details and approve the transaction
        </p>
      </div>

      {/* Connected Wallet */}
      <div className={cn(
        "p-4 rounded-lg border",
        isDark ? "bg-slate-800/50 border-slate-700" : "bg-slate-50 border-slate-200"
      )}>
        <div className="flex items-center justify-between mb-2">
          <span className={cn("text-sm", isDark ? "text-slate-400" : "text-slate-600")}>
            Connected Wallet
          </span>
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        </div>
        <div className="flex items-center justify-between">
          <code className="text-sm font-mono">
            {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
          </code>
          <button
            onClick={handleCopyAddress}
            className={cn(
              "p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            )}
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Payment Summary */}
      <div className={cn(
        "p-6 rounded-xl border-2",
        isDark ? "bg-slate-800/50 border-slate-700" : "bg-white border-slate-200"
      )}>
        <h3 className="font-semibold mb-4">Payment Summary</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">Merchant</span>
            <span className="font-medium">{merchantName}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">Amount</span>
            <span className="font-medium">${amount.toFixed(2)} USD</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">Network</span>
            <span className="font-medium capitalize">{network}</span>
          </div>
          
          <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
            <div className="flex justify-between">
              <span className="font-semibold">You will pay</span>
              <span className="text-lg font-bold text-green-600 dark:text-green-400">
                {totalCrypto.toFixed(6)} {currency}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className={cn(
          "p-4 rounded-lg border flex items-start gap-3",
          "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
        )}>
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-900 dark:text-red-200">
              Payment Failed
            </p>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={onBack}
          variant="outline"
          className="flex-1"
          disabled={processing}
        >
          Back
        </Button>
        <Button
          onClick={handleSubmit}
          className="flex-1"
          disabled={processing}
          size="lg"
        >
          {processing ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CheckCircle2 className="mr-2 h-5 w-5" />
              Approve Payment
            </>
          )}
        </Button>
      </div>

      {/* Info */}
      <div className={cn(
        "p-4 rounded-lg border text-sm",
        isDark ? "bg-blue-900/20 border-blue-800" : "bg-blue-50 border-blue-200"
      )}>
        <p className="text-slate-600 dark:text-slate-400">
          💡 <strong>Note:</strong> You'll be asked to approve this transaction in your wallet. 
          Make sure you have enough {currency} and {network === "solana" ? "SOL" : "ETH"} for gas fees.
        </p>
      </div>
    </div>
  );
}

