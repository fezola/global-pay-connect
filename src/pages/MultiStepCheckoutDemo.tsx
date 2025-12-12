/**
 * Multi-Step Checkout Demo Page
 * Professional demo of the new checkout flow
 */

import { useState } from "react";
import { MultiStepCheckout } from "@/components/checkout/MultiStepCheckout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShoppingCart, CreditCard, Zap } from "lucide-react";

export default function MultiStepCheckoutDemo() {
  const [showCheckout, setShowCheckout] = useState(false);
  const [amount, setAmount] = useState(100);

  const handleSuccess = (txHash: string) => {
    console.log("Payment successful:", txHash);
    alert(`Payment successful! Transaction: ${txHash}`);
    setShowCheckout(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="border-b bg-white dark:bg-slate-900 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Klyr Checkout</h1>
                <p className="text-xs text-slate-500">Professional Crypto Payments</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">Demo Mode</span>
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              Accept Crypto Payments
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">
                The Professional Way
              </span>
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Multi-step checkout flow with 5 low-fee blockchain networks, NGN currency conversion, and seamless wallet integration.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="p-6">
              <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="font-semibold mb-2">5 Networks</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Solana, Base, Polygon, Arbitrum, Optimism
              </p>
            </Card>

            <Card className="p-6">
              <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4">
                <CreditCard className="h-6 w-6 text-purple-500" />
              </div>
              <h3 className="font-semibold mb-2">9+ Tokens</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                USDC, USDT, SOL, ETH, MATIC, DAI, and more
              </p>
            </Card>

            <Card className="p-6">
              <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                <ShoppingCart className="h-6 w-6 text-green-500" />
              </div>
              <h3 className="font-semibold mb-2">NGN Conversion</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Real-time USD to Naira conversion with fees
              </p>
            </Card>
          </div>

          {/* Demo Product */}
          <Card className="p-8 mb-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold mb-2">Premium Subscription</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Annual access to all premium features
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">${amount}.00</div>
                <div className="text-sm text-slate-500">≈ ₦{(amount * 1550).toLocaleString()}</div>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-slate-700 dark:text-slate-300">Unlimited API calls</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-slate-700 dark:text-slate-300">Priority support</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-slate-700 dark:text-slate-300">Advanced analytics</span>
              </div>
            </div>

            <Button
              onClick={() => setShowCheckout(true)}
              size="lg"
              className="w-full text-lg h-14"
            >
              <CreditCard className="mr-2 h-5 w-5" />
              Pay with Crypto
            </Button>
          </Card>

          {/* Info */}
          <div className="text-center text-sm text-slate-500">
            <p>🔒 Secure blockchain payments • 🌍 5 networks supported • ⚡ Instant confirmation</p>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <MultiStepCheckout
          paymentIntent={{
            id: `pi_${Date.now()}`,
            amount: amount,
            currency: "USD",
            merchantId: "demo_merchant",
            merchantName: "Demo Store",
            description: "Premium Subscription",
          }}
          onClose={() => setShowCheckout(false)}
          onSuccess={handleSuccess}
          theme="auto"
        />
      )}
    </div>
  );
}

