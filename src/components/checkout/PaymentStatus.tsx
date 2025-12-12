/**
 * Payment Status Component
 * Shows real-time payment processing status
 */

import { Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChainType } from "@/lib/walletProviders";
import type { CheckoutStep } from "./CheckoutWidget";

interface PaymentStatusProps {
  step: CheckoutStep;
  txHash: string | null;
  chain: ChainType;
  theme?: "light" | "dark" | "auto";
}

export function PaymentStatus({ step, txHash, chain, theme = "light" }: PaymentStatusProps) {
  const isDark = theme === "dark" || (theme === "auto" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  const getExplorerUrl = (hash: string) => {
    if (chain === "solana") {
      return `https://solscan.io/tx/${hash}`;
    } else if (chain === "base") {
      return `https://basescan.org/tx/${hash}`;
    }
    return "#";
  };

  return (
    <div className="py-8 text-center space-y-6">
      {/* Status Icon */}
      <div className="flex justify-center">
        {step === "processing" && (
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
            </div>
            <div className="absolute inset-0 rounded-full border-4 border-blue-500/20 animate-pulse" />
          </div>
        )}
        {step === "confirming" && (
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
              <Loader2 className="h-10 w-10 text-yellow-500 animate-spin" />
            </div>
            <div className="absolute inset-0 rounded-full border-4 border-yellow-500/20 animate-pulse" />
          </div>
        )}
      </div>

      {/* Status Text */}
      <div>
        <h3 className="text-xl font-semibold mb-2">
          {step === "processing" && "Processing Payment..."}
          {step === "confirming" && "Confirming Transaction..."}
        </h3>
        <p className={cn("text-sm", isDark ? "text-slate-400" : "text-slate-600")}>
          {step === "processing" && "Please approve the transaction in your wallet"}
          {step === "confirming" && "Waiting for blockchain confirmation"}
        </p>
      </div>

      {/* Transaction Hash */}
      {txHash && (
        <div className={cn(
          "p-4 rounded-lg",
          isDark ? "bg-slate-800/50" : "bg-slate-50"
        )}>
          <p className={cn("text-xs mb-2", isDark ? "text-slate-400" : "text-slate-600")}>
            Transaction Hash
          </p>
          <code className="text-xs font-mono break-all">
            {txHash}
          </code>
          <a
            href={getExplorerUrl(txHash)}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "text-xs mt-2 inline-block hover:underline",
              isDark ? "text-blue-400" : "text-blue-600"
            )}
          >
            View on Explorer →
          </a>
        </div>
      )}

      {/* Progress Steps */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center",
            "bg-green-100 dark:bg-green-900/30"
          )}>
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          </div>
          <div className="text-left flex-1">
            <p className="text-sm font-semibold">Payment Initiated</p>
            <p className={cn("text-xs", isDark ? "text-slate-400" : "text-slate-600")}>
              Transaction submitted to blockchain
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center",
            step === "confirming" || step === "success"
              ? "bg-green-100 dark:bg-green-900/30"
              : "bg-slate-100 dark:bg-slate-800"
          )}>
            {step === "confirming" || step === "success" ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <Loader2 className="h-5 w-5 text-slate-400 animate-spin" />
            )}
          </div>
          <div className="text-left flex-1">
            <p className="text-sm font-semibold">Blockchain Confirmation</p>
            <p className={cn("text-xs", isDark ? "text-slate-400" : "text-slate-600")}>
              {step === "confirming" ? "Confirming..." : "Waiting for confirmation"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center",
            step === "success"
              ? "bg-green-100 dark:bg-green-900/30"
              : "bg-slate-100 dark:bg-slate-800"
          )}>
            {step === "success" ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <div className="w-2 h-2 rounded-full bg-slate-400" />
            )}
          </div>
          <div className="text-left flex-1">
            <p className="text-sm font-semibold">Payment Complete</p>
            <p className={cn("text-xs", isDark ? "text-slate-400" : "text-slate-600")}>
              Funds will be credited to merchant
            </p>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className={cn(
        "p-4 rounded-lg text-xs text-left",
        isDark ? "bg-slate-800/50 text-slate-400" : "bg-slate-50 text-slate-600"
      )}>
        <p className="mb-2">⏱️ <strong>Estimated time:</strong> 30-60 seconds</p>
        <p>🔒 <strong>Security:</strong> Your transaction is secured by blockchain technology</p>
      </div>
    </div>
  );
}

