/**
 * Payment Details Component
 * Shows payment breakdown and confirms transaction
 */

import { useState, useEffect } from "react";
import { Loader2, AlertCircle, CheckCircle2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { WalletConnection, TokenType } from "@/lib/walletProviders";
import { getSolanaTokenBalance, getEVMTokenBalance, TOKEN_ADDRESSES, TOKEN_DECIMALS } from "@/lib/walletProviders";
import type { PaymentIntent } from "./CheckoutWidget";

interface PaymentDetailsProps {
  paymentIntent: PaymentIntent;
  wallet: WalletConnection;
  onSubmit: () => void;
  onBack: () => void;
  theme?: "light" | "dark" | "auto";
}

export function PaymentDetails({
  paymentIntent,
  wallet,
  onSubmit,
  onBack,
  theme = "light",
}: PaymentDetailsProps) {
  const [balance, setBalance] = useState<number | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [copied, setCopied] = useState(false);

  const isDark = theme === "dark" || (theme === "auto" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  // Calculate fees and total
  const amount = paymentIntent.amount;
  const networkFee = 0.01; // Example fee
  const total = amount + networkFee;

  // Get token and network logos
  const getTokenLogo = (currency: string) => {
    if (currency === 'USDC') return '/usd-coin-usdc-logo.svg';
    if (currency === 'USDT') return '/tether-usdt-logo.svg';
    if (currency === 'SOL') return '/solana-sol-logo.svg';
    if (currency === 'ETH') return '/ethereum-eth-logo.svg';
    return '/usd-coin-usdc-logo.svg';
  };

  const getNetworkLogo = (chain: string) => {
    if (chain === 'solana') return '/solana-sol-logo.svg';
    if (chain === 'base') return '/base.png';
    return '/solana-sol-logo.svg';
  };

  const tokenLogo = getTokenLogo(paymentIntent.currency);
  const networkLogo = getNetworkLogo(wallet.chain);

  // Check wallet balance
  useEffect(() => {
    async function checkBalance() {
      setLoadingBalance(true);
      try {
        console.log('Checking balance for wallet:', wallet.address);

        let balance = 0;
        const token = paymentIntent.currency as TokenType;

        if (wallet.chain === 'solana') {
          const tokenMint = TOKEN_ADDRESSES.solana[token];
          if (tokenMint) {
            balance = await getSolanaTokenBalance(
              wallet.address,
              tokenMint,
              false // Use devnet for testing
            );
          }
        } else if (wallet.chain === 'base') {
          const tokenAddress = TOKEN_ADDRESSES.base[token];
          const decimals = TOKEN_DECIMALS[token];
          if (tokenAddress) {
            balance = await getEVMTokenBalance(
              wallet.address,
              tokenAddress,
              wallet.provider,
              decimals
            );
          }
        }

        console.log('Balance fetched:', balance, token);
        setBalance(balance);
      } catch (error) {
        console.error('Failed to check balance:', error);
        setBalance(null);
      } finally {
        setLoadingBalance(false);
      }
    }

    checkBalance();
  }, [wallet, paymentIntent]);

  const hasInsufficientBalance = balance !== null && balance < total;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Payment Method */}
      <div className={cn(
        "p-4 rounded-lg border",
        isDark ? "bg-slate-800/50 border-slate-700" : "bg-slate-50 border-slate-200"
      )}>
        <div className="flex items-center gap-3">
          {/* Token and Network Logos */}
          <div className="relative w-12 h-12 flex-shrink-0">
            {/* Network logo (background) */}
            <div className="absolute inset-0 rounded-full bg-white dark:bg-slate-800 p-1.5 shadow-sm">
              <img
                src={networkLogo}
                alt={wallet.chain}
                className="w-full h-full object-contain"
              />
            </div>
            {/* Token logo (foreground, bottom-right) */}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white dark:bg-slate-800 p-0.5 shadow-md border-2 border-white dark:border-slate-900">
              <img
                src={tokenLogo}
                alt={paymentIntent.currency}
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          <div className="flex-1">
            <div className="font-semibold">
              {paymentIntent.currency} on {wallet.chain === 'solana' ? 'Solana' : 'Base'}
            </div>
            <div className={cn("text-sm", isDark ? "text-slate-400" : "text-slate-600")}>
              {paymentIntent.description || 'Payment'}
            </div>
          </div>
        </div>
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
            onClick={() => handleCopy(wallet.address)}
            className={cn("text-xs hover:underline", isDark ? "text-blue-400" : "text-blue-600")}
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          </button>
        </div>
        <div className="mt-2 text-xs">
          {loadingBalance ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span className={isDark ? "text-slate-400" : "text-slate-600"}>Checking balance...</span>
            </div>
          ) : (
            <div className={cn(
              "flex items-center justify-between",
              hasInsufficientBalance ? "text-red-500" : isDark ? "text-slate-400" : "text-slate-600"
            )}>
              <span>Balance:</span>
              <span className="font-semibold">
                {balance?.toFixed(2)} {paymentIntent.currency}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Payment Breakdown */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Payment Summary</h3>
        <div className={cn(
          "p-4 rounded-lg space-y-3",
          isDark ? "bg-slate-800/50" : "bg-slate-50"
        )}>
          <div className="flex justify-between text-sm">
            <span className={isDark ? "text-slate-400" : "text-slate-600"}>Amount</span>
            <span className="font-semibold">{amount.toFixed(2)} {paymentIntent.currency}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className={isDark ? "text-slate-400" : "text-slate-600"}>Network Fee</span>
            <span className="font-semibold">{networkFee.toFixed(2)} {paymentIntent.currency}</span>
          </div>
          <div className={cn("pt-3 border-t", isDark ? "border-slate-700" : "border-slate-200")}>
            <div className="flex justify-between">
              <span className="font-semibold">Total</span>
              <span className="text-lg font-bold">{total.toFixed(2)} {paymentIntent.currency}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Insufficient Balance Warning */}
      {hasInsufficientBalance && (
        <div className={cn(
          "p-4 rounded-lg border flex items-start gap-3",
          "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
        )}>
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-red-700 dark:text-red-400 mb-1">
              Insufficient Balance
            </p>
            <p className="text-red-600 dark:text-red-300">
              You need at least {total.toFixed(2)} {paymentIntent.currency} to complete this payment.
              Your current balance is {balance?.toFixed(2)} {paymentIntent.currency}.
            </p>
          </div>
        </div>
      )}

      {/* Payment Info */}
      <div className={cn(
        "p-4 rounded-lg text-sm",
        isDark ? "bg-blue-900/20 text-blue-300" : "bg-blue-50 text-blue-700"
      )}>
        <p className="font-semibold mb-2">Payment will be sent to:</p>
        <code className="text-xs break-all block p-2 rounded bg-black/10">
          {paymentIntent.payment_address}
        </code>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex-1"
        >
          Back
        </Button>
        <Button
          onClick={onSubmit}
          disabled={hasInsufficientBalance || loadingBalance}
          className="flex-1"
        >
          {loadingBalance ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Checking...
            </>
          ) : (
            `Pay ${total.toFixed(2)} ${paymentIntent.currency}`
          )}
        </Button>
      </div>
    </div>
  );
}

