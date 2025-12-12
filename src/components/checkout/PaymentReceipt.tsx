/**
 * Payment Receipt Component
 * Shows detailed receipt after successful payment
 */

import { CheckCircle2, Download, ExternalLink, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ChainType } from "@/lib/walletProviders";
import type { PaymentIntent } from "./CheckoutWidget";

interface PaymentReceiptProps {
  paymentIntent: PaymentIntent;
  txHash: string;
  chain: ChainType;
  merchantName: string;
  onClose?: () => void;
  theme?: "light" | "dark" | "auto";
}

export function PaymentReceipt({
  paymentIntent,
  txHash,
  chain,
  merchantName,
  onClose,
  theme = "light",
}: PaymentReceiptProps) {
  const isDark = theme === "dark" || (theme === "auto" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  const getExplorerUrl = (hash: string) => {
    if (chain === "solana") {
      return `https://solscan.io/tx/${hash}`;
    } else if (chain === "base") {
      return `https://basescan.org/tx/${hash}`;
    }
    return "#";
  };

  const handleDownloadReceipt = () => {
    // In production, generate PDF receipt
    console.log("Download receipt");
  };

  const handleEmailReceipt = () => {
    // In production, send email receipt
    console.log("Email receipt");
  };

  // Get token and network logos
  const getTokenLogo = (currency: string) => {
    if (currency === 'USDC') return '/usd-coin-usdc-logo.svg';
    if (currency === 'USDT') return '/tether-usdt-logo.svg';
    if (currency === 'SOL') return '/solana-sol-logo.svg';
    if (currency === 'ETH') return '/ethereum-eth-logo.svg';
    return '/usd-coin-usdc-logo.svg';
  };

  const getNetworkLogo = (chainType: ChainType) => {
    if (chainType === 'solana') return '/solana-sol-logo.svg';
    if (chainType === 'base') return '/base.png';
    return '/solana-sol-logo.svg';
  };

  const tokenLogo = getTokenLogo(paymentIntent.currency);
  const networkLogo = getNetworkLogo(chain);

  return (
    <div className="space-y-6">
      {/* Success Icon with Token Logo */}
      <div className="text-center py-6">
        <div className="relative inline-block mb-4">
          {/* Success checkmark */}
          <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
          </div>
          {/* Token logo badge */}
          <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-white dark:bg-slate-800 p-1.5 shadow-lg border-2 border-white dark:border-slate-900">
            <img
              src={tokenLogo}
              alt={paymentIntent.currency}
              className="w-full h-full object-contain"
            />
          </div>
        </div>
        <h3 className="text-2xl font-bold mb-2">Payment Successful!</h3>
        <p className={cn("text-sm", isDark ? "text-slate-400" : "text-slate-600")}>
          Your payment has been confirmed on the blockchain
        </p>
      </div>

      {/* Receipt Details */}
      <div className={cn(
        "p-4 rounded-lg space-y-3",
        isDark ? "bg-slate-800/50" : "bg-slate-50"
      )}>
        <div className="flex justify-between text-sm">
          <span className={isDark ? "text-slate-400" : "text-slate-600"}>Merchant</span>
          <span className="font-semibold">{merchantName}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className={isDark ? "text-slate-400" : "text-slate-600"}>Amount Paid</span>
          <span className="font-semibold">{paymentIntent.amount} {paymentIntent.currency}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className={isDark ? "text-slate-400" : "text-slate-600"}>Network</span>
          <span className="font-semibold capitalize">{chain}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className={isDark ? "text-slate-400" : "text-slate-600"}>Payment ID</span>
          <code className="text-xs font-mono">{paymentIntent.id}</code>
        </div>
        <div className="flex justify-between text-sm">
          <span className={isDark ? "text-slate-400" : "text-slate-600"}>Date</span>
          <span className="font-semibold">{new Date().toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className={isDark ? "text-slate-400" : "text-slate-600"}>Time</span>
          <span className="font-semibold">{new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Transaction Hash */}
      <div className={cn(
        "p-4 rounded-lg",
        isDark ? "bg-slate-800/50" : "bg-slate-50"
      )}>
        <p className={cn("text-xs mb-2", isDark ? "text-slate-400" : "text-slate-600")}>
          Transaction Hash
        </p>
        <code className="text-xs font-mono break-all block mb-3">
          {txHash}
        </code>
        <a
          href={getExplorerUrl(txHash)}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "text-sm inline-flex items-center gap-2 hover:underline",
            isDark ? "text-blue-400" : "text-blue-600"
          )}
        >
          View on Block Explorer
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>

      {/* Receipt Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          onClick={handleDownloadReceipt}
          className="w-full"
        >
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
        <Button
          variant="outline"
          onClick={handleEmailReceipt}
          className="w-full"
        >
          <Mail className="h-4 w-4 mr-2" />
          Email
        </Button>
      </div>

      {/* Close Button */}
      {onClose && (
        <Button onClick={onClose} className="w-full">
          Done
        </Button>
      )}

      {/* Footer Note */}
      <div className={cn(
        "p-4 rounded-lg text-xs text-center",
        isDark ? "bg-blue-900/20 text-blue-300" : "bg-blue-50 text-blue-700"
      )}>
        <p>
          A confirmation email has been sent to your registered email address.
          Keep this receipt for your records.
        </p>
      </div>
    </div>
  );
}

