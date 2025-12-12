/**
 * Payment Success Screen
 * Shows after successful payment
 */

import { CheckCircle2, ExternalLink, Download, Copy, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ChainType, TokenType } from "@/lib/walletProviders";

interface PaymentSuccessProps {
  txHash: string;
  currency: TokenType;
  network: ChainType;
  amount: number;
  merchantName: string;
  onClose: () => void;
  theme?: "light" | "dark" | "auto";
}

export function PaymentSuccess({
  txHash,
  currency,
  network,
  amount,
  merchantName,
  onClose,
  theme = "light",
}: PaymentSuccessProps) {
  const [copied, setCopied] = useState(false);

  const isDark = theme === "dark" || (theme === "auto" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  const getExplorerUrl = () => {
    if (network === "solana") {
      return `https://explorer.solana.com/tx/${txHash}?cluster=devnet`;
    } else if (network === "base") {
      return `https://basescan.org/tx/${txHash}`;
    } else if (network === "polygon") {
      return `https://polygonscan.com/tx/${txHash}`;
    } else if (network === "arbitrum") {
      return `https://arbiscan.io/tx/${txHash}`;
    } else if (network === "optimism") {
      return `https://optimistic.etherscan.io/tx/${txHash}`;
    }
    return `https://etherscan.io/tx/${txHash}`;
  };

  const handleCopyTxHash = () => {
    navigator.clipboard.writeText(txHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Success Icon */}
      <div className="text-center py-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 mb-4 animate-bounce">
          <CheckCircle2 className="h-12 w-12 text-green-500" />
        </div>
        <h2 className="text-3xl font-bold mb-2 text-green-600 dark:text-green-400">
          Payment Successful!
        </h2>
        <p className={cn("text-sm", isDark ? "text-slate-400" : "text-slate-600")}>
          Your payment has been confirmed on the blockchain
        </p>
      </div>

      {/* Payment Details */}
      <div className={cn(
        "p-6 rounded-xl border-2",
        isDark ? "bg-slate-800/50 border-slate-700" : "bg-white border-slate-200"
      )}>
        <h3 className="font-semibold mb-4">Payment Receipt</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">Merchant</span>
            <span className="font-medium">{merchantName}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">Amount Paid</span>
            <span className="font-medium">{amount.toFixed(6)} {currency}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">Network</span>
            <span className="font-medium capitalize">{network}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">Status</span>
            <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
              <CheckCircle2 className="h-4 w-4" />
              Confirmed
            </span>
          </div>
        </div>
      </div>

      {/* Transaction Hash */}
      <div className={cn(
        "p-4 rounded-lg border",
        isDark ? "bg-slate-800/50 border-slate-700" : "bg-slate-50 border-slate-200"
      )}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Transaction Hash</span>
          <button
            onClick={handleCopyTxHash}
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
        <code className="text-xs font-mono break-all text-slate-600 dark:text-slate-400">
          {txHash}
        </code>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <Button
          onClick={() => window.open(getExplorerUrl(), "_blank")}
          variant="outline"
          className="w-full"
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          View on Block Explorer
        </Button>
        
        <Button
          onClick={onClose}
          className="w-full"
          size="lg"
        >
          Done
        </Button>
      </div>

      {/* Info */}
      <div className={cn(
        "p-4 rounded-lg border text-sm text-center",
        isDark ? "bg-blue-900/20 border-blue-800" : "bg-blue-50 border-blue-200"
      )}>
        <p className="text-slate-600 dark:text-slate-400">
          🎉 Thank you for your payment! A confirmation email has been sent to your inbox.
        </p>
      </div>
    </div>
  );
}

