/**
 * Klyr Checkout Widget
 * Complete payment checkout experience with wallet integration
 */

import { useState, useEffect } from "react";
import { X, Loader2, CheckCircle2, AlertCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { WalletSelector } from "./WalletSelector";
import { WalletConnect } from "./WalletConnect";
import { PaymentDetails } from "./PaymentDetails";
import { PaymentStatus } from "./PaymentStatus";
import { PaymentReceipt } from "./PaymentReceipt";
import type { WalletConnection, ChainType, TokenType } from "@/lib/walletProviders";
import {
  sendSolanaTokenTransfer,
  sendEVMTokenTransfer,
  checkSolanaTransactionStatus,
  checkEVMTransactionStatus
} from "@/lib/blockchainTransactions";

export interface CheckoutConfig {
  merchantId: string;
  merchantName: string;
  amount: string;
  currency: string;
  description?: string;
  metadata?: Record<string, any>;
  theme?: "light" | "dark" | "auto";
  primaryColor?: string;
  showBranding?: boolean;
  onSuccess?: (paymentId: string, txHash: string) => void;
  onClose?: () => void;
  onError?: (error: Error) => void;
  embedded?: boolean;
  apiKey?: string;
  baseUrl?: string;
}

export type CheckoutStep = 
  | "payment-method"
  | "wallet-connect"
  | "payment-details"
  | "processing"
  | "confirming"
  | "success"
  | "error";

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  payment_address: string;
  expected_token_mint: string;
  chain: ChainType;
  status: string;
  expires_at: string;
}

export function CheckoutWidget(config: CheckoutConfig) {
  const [step, setStep] = useState<CheckoutStep>("payment-method");
  const [selectedChain, setSelectedChain] = useState<ChainType | null>(null);
  const [selectedToken, setSelectedToken] = useState<TokenType | null>(null);
  const [wallet, setWallet] = useState<WalletConnection | null>(null);
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntent | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    merchantName,
    amount,
    currency,
    description,
    theme = "light",
    showBranding = true,
    onSuccess,
    onClose,
    onError,
    embedded = false,
  } = config;

  // Theme classes
  const isDark = theme === "dark" || (theme === "auto" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  const bgClass = isDark ? "bg-slate-900" : "bg-white";
  const textClass = isDark ? "text-white" : "text-slate-900";
  const borderClass = isDark ? "border-slate-800" : "border-slate-200";

  const containerClass = cn(
    "w-full max-w-md rounded-xl shadow-2xl overflow-hidden",
    bgClass,
    textClass,
    !embedded && "fixed inset-0 m-auto h-fit z-50"
  );

  // Handle wallet connection
  const handleWalletConnected = async (connection: WalletConnection) => {
    console.log('Wallet connected:', connection);
    setWallet(connection);

    // Create payment intent after wallet connection
    if (!paymentIntent) {
      await createPaymentIntent();
    }

    setStep("payment-details");
  };

  // Handle payment method selection
  const handlePaymentMethodSelected = (chain: ChainType, token: TokenType) => {
    setSelectedChain(chain);
    setSelectedToken(token);
    setStep("wallet-connect");
  };

  // Create payment intent
  const createPaymentIntent = async () => {
    if (!selectedChain || !selectedToken) return;

    setLoading(true);
    setError(null);

    try {
      // Use Supabase function URL
      const baseUrl = config.baseUrl || 'https://crkhkzcscgoeyspaczux.supabase.co';
      const url = `${baseUrl}/functions/v1/create-payment-intent`;

      console.log('Creating payment intent...', {
        url,
        amount: config.amount,
        currency: selectedToken,
        chain: selectedChain
      });

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey || ''}`,
        },
        body: JSON.stringify({
          amount: config.amount,
          currency: selectedToken,
          description: config.description,
          metadata: {
            ...config.metadata,
            chain: selectedChain,
            token: selectedToken,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Payment intent creation failed:', errorData);
        throw new Error(errorData.error || 'Failed to create payment intent');
      }

      const data = await response.json();
      console.log('Payment intent created:', data);

      setPaymentIntent(data);
      // Don't auto-advance - wait for wallet connection
    } catch (err) {
      const error = err as Error;
      console.error('Payment intent error:', error);
      setError(error.message);
      setStep("error");
      onError?.(error);
    } finally {
      setLoading(false);
    }
  };

  // Handle payment submission
  const handlePaymentSubmit = async () => {
    if (!wallet || !paymentIntent || !selectedChain || !selectedToken) return;

    setStep("processing");
    setLoading(true);

    try {
      console.log('Submitting payment...', {
        wallet: wallet.address,
        paymentIntent: paymentIntent.id,
        chain: selectedChain,
        token: selectedToken,
        amount: paymentIntent.amount
      });

      let result;

      // Execute blockchain transaction based on chain
      if (selectedChain === 'solana') {
        result = await sendSolanaTokenTransfer(
          wallet,
          paymentIntent.payment_address,
          paymentIntent.amount,
          selectedToken,
          false // Use devnet for testing, change to true for mainnet
        );
      } else if (selectedChain === 'base') {
        result = await sendEVMTokenTransfer(
          wallet,
          paymentIntent.payment_address,
          paymentIntent.amount,
          selectedToken,
          '0x2105' // Base mainnet chain ID
        );
      } else {
        throw new Error('Unsupported chain');
      }

      if (!result.success) {
        throw new Error(result.error || 'Transaction failed');
      }

      console.log('Transaction successful:', result.signature);
      setTxHash(result.signature);
      setStep("confirming");

      // Poll for transaction confirmation
      let confirmed = false;
      let attempts = 0;
      const maxAttempts = 30; // 30 attempts = ~1 minute

      while (!confirmed && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds

        let status;
        if (selectedChain === 'solana') {
          status = await checkSolanaTransactionStatus(result.signature, false);
        } else {
          status = await checkEVMTransactionStatus(result.signature, wallet.provider);
        }

        console.log('Transaction status:', status);

        if (status.confirmed) {
          confirmed = true;
          console.log('Transaction confirmed!');
        } else if (status.error) {
          throw new Error(status.error);
        }

        attempts++;
      }

      if (!confirmed) {
        throw new Error('Transaction confirmation timeout');
      }

      setStep("success");
      onSuccess?.(paymentIntent.id, result.signature);
    } catch (err) {
      const error = err as Error;
      console.error('Payment submission error:', error);
      setError(error.message);
      setStep("error");
      onError?.(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!embedded && <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={onClose} />}
      
      <div className={containerClass}>
        {/* Header */}
        <div className={cn("px-6 py-5 border-b flex items-center justify-between", borderClass)}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">K</span>
            </div>
            <div>
              <p className="font-semibold">{merchantName}</p>
              <p className={cn("text-xs", isDark ? "text-slate-400" : "text-slate-500")}>
                Secure Crypto Payment
              </p>
            </div>
          </div>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {step === "payment-method" && (
            <WalletSelector
              amount={amount}
              currency={currency}
              onSelect={handlePaymentMethodSelected}
              theme={theme}
            />
          )}

          {step === "wallet-connect" && selectedChain && (
            <WalletConnect
              chain={selectedChain}
              onConnect={handleWalletConnected}
              onBack={() => setStep("payment-method")}
              theme={theme}
            />
          )}

          {step === "payment-details" && paymentIntent && wallet && (
            <PaymentDetails
              paymentIntent={paymentIntent}
              wallet={wallet}
              onSubmit={handlePaymentSubmit}
              onBack={() => setStep("wallet-connect")}
              theme={theme}
            />
          )}

          {(step === "processing" || step === "confirming") && (
            <PaymentStatus
              step={step}
              txHash={txHash}
              chain={selectedChain || 'solana'}
              theme={theme}
            />
          )}

          {step === "success" && paymentIntent && txHash && (
            <PaymentReceipt
              paymentIntent={paymentIntent}
              txHash={txHash}
              chain={selectedChain || 'solana'}
              merchantName={merchantName}
              onClose={onClose}
              theme={theme}
            />
          )}

          {step === "error" && (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Payment Failed</h3>
              <p className={cn("text-sm mb-4", isDark ? "text-slate-400" : "text-slate-600")}>
                {error || "An error occurred while processing your payment"}
              </p>
              <Button onClick={() => setStep("payment-method")} className="w-full">
                Try Again
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        {showBranding && (
          <div className={cn("px-6 py-3 border-t text-center", borderClass)}>
            <p className={cn("text-xs", isDark ? "text-slate-500" : "text-slate-400")}>
              Powered by <span className="font-semibold">Klyr</span>
            </p>
          </div>
        )}
      </div>
    </>
  );
}

