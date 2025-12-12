/**
 * Step 3: Amount Review
 * Shows payment breakdown with NGN conversion and fees
 */

import { Receipt, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TokenType, ChainType } from "@/lib/walletProviders";

interface AmountReviewProps {
  currency: TokenType;
  network: ChainType;
  amountUSD: number;
  amountLocal: number;
  localCurrency: string;
  localCurrencySymbol: string;
  exchangeRate: number;
  networkFee: number;
  tax: number;
  totalUSD: number;
  totalLocal: number;
  totalCrypto: number;
  theme?: "light" | "dark" | "auto";
}

export function AmountReview({
  currency,
  network,
  amountUSD,
  amountLocal,
  localCurrency,
  localCurrencySymbol,
  exchangeRate,
  networkFee,
  tax,
  totalUSD,
  totalLocal,
  totalCrypto,
  theme = "light",
}: AmountReviewProps) {
  const isDark = theme === "dark" || (theme === "auto" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  const formatLocal = (amount: number) => {
    const decimals = ['JPY', 'KRW'].includes(localCurrency) ? 0 : 2;
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(amount);
  };

  const formatUSD = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
          <Receipt className="h-8 w-8 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Review Payment</h2>
        <p className={cn("text-sm", isDark ? "text-slate-400" : "text-slate-600")}>
          Confirm the amount and fees before proceeding
        </p>
      </div>

      {/* Payment Summary Card */}
      <div className={cn(
        "p-6 rounded-xl border-2",
        isDark ? "bg-slate-800/50 border-slate-700" : "bg-white border-slate-200"
      )}>
        {/* Amount */}
        <div className="mb-6">
          <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">Payment Amount</div>
          <div className="flex items-baseline gap-3">
            <div className="text-4xl font-bold">{formatUSD(amountUSD)}</div>
            <div className={cn("text-xl", isDark ? "text-slate-400" : "text-slate-600")}>
              ≈ {localCurrencySymbol}{formatLocal(amountLocal)}
            </div>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Exchange rate: 1 USD = {localCurrencySymbol}{formatLocal(exchangeRate)} {localCurrency}
          </div>
        </div>

        {/* Breakdown */}
        <div className="space-y-3 py-4 border-t border-b border-slate-200 dark:border-slate-700">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">Base Amount</span>
            <div className="text-right">
              <div className="font-medium">{formatUSD(amountUSD)}</div>
              <div className="text-xs text-slate-500">{localCurrencySymbol}{formatLocal(amountLocal)}</div>
            </div>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
              Network Fee ({network})
              <Info className="h-3 w-3" />
            </span>
            <div className="text-right">
              <div className="font-medium">{formatUSD(networkFee)}</div>
              <div className="text-xs text-slate-500">{localCurrencySymbol}{formatLocal(networkFee * exchangeRate)}</div>
            </div>
          </div>

          {tax > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">Tax</span>
              <div className="text-right">
                <div className="font-medium">{formatUSD(tax)}</div>
                <div className="text-xs text-slate-500">{localCurrencySymbol}{formatLocal(tax * exchangeRate)}</div>
              </div>
            </div>
          )}
        </div>

        {/* Total */}
        <div className="mt-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Total</span>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatUSD(totalUSD)}
              </div>
              <div className="text-sm text-slate-500">{localCurrencySymbol}{formatLocal(totalLocal)}</div>
            </div>
          </div>
        </div>

        {/* Crypto Amount */}
        <div className={cn(
          "mt-4 p-3 rounded-lg",
          isDark ? "bg-slate-700/50" : "bg-slate-100"
        )}>
          <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">You will pay</div>
          <div className="text-xl font-bold">
            {totalCrypto.toFixed(6)} {currency}
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className={cn(
        "p-4 rounded-lg border",
        isDark ? "bg-blue-900/20 border-blue-800" : "bg-blue-50 border-blue-200"
      )}>
        <div className="flex gap-3">
          <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-slate-600 dark:text-slate-400">
            <p className="font-medium mb-1">Exchange Rate Information</p>
            <p>1 USD = {localCurrencySymbol}{formatLocal(exchangeRate)} {localCurrency}</p>
            <p className="text-xs mt-2 text-slate-500">
              Exchange rates are updated in real-time. Network fees may vary based on blockchain congestion.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

