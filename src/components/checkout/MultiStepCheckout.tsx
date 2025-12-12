/**
 * Multi-Step Checkout Widget
 * Main component that orchestrates the checkout flow
 */

import { useState, useEffect } from "react";
import { ArrowLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCheckoutStore } from "@/store/checkoutStore";
import { ProgressIndicator } from "./ProgressIndicator";
import { CurrencySelection } from "./steps/CurrencySelection";
import { NetworkSelection } from "./steps/NetworkSelection";
import { AmountReview } from "./steps/AmountReview";
import { WalletConnect } from "./WalletConnect";
import { PaymentConfirmation } from "./steps/PaymentConfirmation";
import { PaymentSuccess } from "./steps/PaymentSuccess";
import type { PaymentIntent } from "./CheckoutWidget";

interface MultiStepCheckoutProps {
  paymentIntent: PaymentIntent;
  onClose?: () => void;
  onSuccess?: (txHash: string) => void;
  theme?: "light" | "dark" | "auto";
}

export function MultiStepCheckout({
  paymentIntent,
  onClose,
  onSuccess,
  theme = "light",
}: MultiStepCheckoutProps) {
  const isDark = theme === "dark" || (theme === "auto" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [txHash, setTxHash] = useState<string>("");

  const {
    currentStep,
    selectedCurrency,
    selectedNetwork,
    wallet,
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
    setSelectedCurrency,
    setSelectedNetwork,
    setAmount,
    setWallet,
    initializeCurrency,
    nextStep,
    prevStep,
    reset,
  } = useCheckoutStore();

  // Initialize currency and set amount
  useEffect(() => {
    const init = async () => {
      await initializeCurrency();
      setAmount(paymentIntent.amount);
    };
    init();
  }, [paymentIntent.amount]);

  const handleCurrencySelect = (currency: any) => {
    setSelectedCurrency(currency);
    nextStep();
  };

  const handleNetworkSelect = (network: any) => {
    setSelectedNetwork(network);
    nextStep();
  };

  const handleWalletConnect = (connection: any) => {
    setWallet(connection);
    nextStep();
  };

  const handlePaymentSuccess = (hash: string) => {
    setTxHash(hash);
    setPaymentComplete(true);
    onSuccess?.(hash);
  };

  const handleClose = () => {
    reset();
    setPaymentComplete(false);
    setTxHash("");
    onClose?.();
  };

  const handleBack = () => {
    if (currentStep === 1) {
      reset();
      onClose?.();
    } else {
      prevStep();
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return selectedCurrency !== null;
      case 2:
        return selectedNetwork !== null;
      case 3:
        return true;
      case 4:
        return wallet !== null;
      case 5:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className={cn(
      "min-h-screen flex items-center justify-center p-4",
      isDark ? "bg-slate-900" : "bg-slate-50"
    )}>
      <div className={cn(
        "w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden",
        isDark ? "bg-slate-800" : "bg-white"
      )}>
        {/* Header */}
        <div className={cn(
          "p-6 border-b flex items-center justify-between",
          isDark ? "border-slate-700" : "border-slate-200"
        )}>
          <div className="flex items-center gap-3">
            {currentStep > 1 && (
              <button
                onClick={handleBack}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  isDark ? "hover:bg-slate-700" : "hover:bg-slate-100"
                )}
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <div>
              <h1 className="text-xl font-bold">Klyr Checkout</h1>
              <p className={cn("text-sm", isDark ? "text-slate-400" : "text-slate-600")}>
                {paymentIntent.merchantName}
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={() => {
                reset();
                onClose();
              }}
              className={cn(
                "p-2 rounded-lg transition-colors",
                isDark ? "hover:bg-slate-700" : "hover:bg-slate-100"
              )}
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Progress Indicator */}
        {!paymentComplete && (
          <div className="px-6">
            <ProgressIndicator currentStep={currentStep} theme={theme} />
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {paymentComplete ? (
            <PaymentSuccess
              txHash={txHash}
              currency={selectedCurrency!}
              network={selectedNetwork!}
              amount={totalCrypto}
              merchantName={paymentIntent.merchantName}
              onClose={handleClose}
              theme={theme}
            />
          ) : (
            <>
              {currentStep === 1 && (
                <CurrencySelection
                  onSelect={handleCurrencySelect}
                  selected={selectedCurrency}
                  theme={theme}
                />
              )}

              {currentStep === 2 && selectedCurrency && (
                <NetworkSelection
                  currency={selectedCurrency}
                  onSelect={handleNetworkSelect}
                  selected={selectedNetwork}
                  theme={theme}
                />
              )}

              {currentStep === 3 && selectedCurrency && selectedNetwork && (
                <AmountReview
                  currency={selectedCurrency}
                  network={selectedNetwork}
                  amountUSD={amountUSD}
                  amountLocal={amountLocal}
                  localCurrency={localCurrency}
                  localCurrencySymbol={localCurrencySymbol}
                  exchangeRate={exchangeRate}
                  networkFee={networkFee}
                  tax={tax}
                  totalUSD={totalUSD}
                  totalLocal={totalLocal}
                  totalCrypto={totalCrypto}
                  theme={theme}
                />
              )}

              {currentStep === 4 && selectedNetwork && (
                <WalletConnect
                  chain={selectedNetwork}
                  onConnect={handleWalletConnect}
                  onBack={prevStep}
                  theme={theme}
                />
              )}

              {currentStep === 5 && wallet && selectedCurrency && selectedNetwork && (
                <PaymentConfirmation
                  wallet={wallet}
                  currency={selectedCurrency}
                  network={selectedNetwork}
                  amount={amountUSD}
                  totalCrypto={totalCrypto}
                  merchantName={paymentIntent.merchantName}
                  onSuccess={handlePaymentSuccess}
                  onBack={prevStep}
                  theme={theme}
                />
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!paymentComplete && currentStep !== 4 && currentStep !== 5 && (
          <div className={cn(
            "p-6 border-t",
            isDark ? "border-slate-700" : "border-slate-200"
          )}>
            <Button
              onClick={nextStep}
              disabled={!canProceed()}
              className="w-full"
              size="lg"
            >
              Continue
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

