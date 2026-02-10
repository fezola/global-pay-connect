import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, Wallet, Copy, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// This simulates what your customers will see when they pay
export default function PaymentCheckoutDemo() {
  const [step, setStep] = useState<'details' | 'wallet' | 'processing' | 'success'>('details');
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const { toast } = useToast();

  const paymentDetails = {
    merchant: 'Acme Store',
    amount: '99.99',
    currency: 'USDC',
    chain: 'Solana',
    description: 'Premium Subscription - 1 Year',
  };

  const wallets = [
    { id: 'phantom', name: 'Phantom', icon: '👻', popular: true },
    { id: 'metamask', name: 'MetaMask', icon: '🦊', popular: true },
    { id: 'coinbase', name: 'Coinbase Wallet', icon: '🔵', popular: false },
    { id: 'walletconnect', name: 'WalletConnect', icon: '🔗', popular: false },
  ];

  const handleWalletSelect = (walletId: string) => {
    setSelectedWallet(walletId);
    setStep('wallet');
    
    // Simulate wallet connection
    setTimeout(() => {
      setStep('processing');
      
      // Simulate payment processing
      setTimeout(() => {
        setStep('success');
      }, 3000);
    }, 1500);
  };

  const copyAddress = () => {
    navigator.clipboard.writeText('7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU');
    toast({ title: 'Address copied!' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
            <Wallet className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Global Pay Connect</h1>
          <p className="text-sm text-muted-foreground">Secure Crypto Payments</p>
        </div>

        {/* Payment Card */}
        <div className="bg-card border border-border rounded-xl shadow-xl overflow-hidden">
          {/* Step 1: Payment Details */}
          {step === 'details' && (
            <div className="p-6 space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Payment Details</h2>
                
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Merchant</span>
                    <span className="font-medium">{paymentDetails.merchant}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Description</span>
                    <span className="font-medium text-sm">{paymentDetails.description}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Network</span>
                    <Badge variant="outline">{paymentDetails.chain}</Badge>
                  </div>
                  <div className="border-t border-border pt-3 flex justify-between items-center">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-2xl font-bold text-primary">
                      {paymentDetails.amount} {paymentDetails.currency}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-3">Select Wallet</h3>
                <div className="space-y-2">
                  {wallets.map((wallet) => (
                    <button
                      key={wallet.id}
                      onClick={() => handleWalletSelect(wallet.id)}
                      className="w-full flex items-center justify-between p-4 bg-muted/50 hover:bg-muted rounded-lg transition-colors border border-transparent hover:border-primary"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{wallet.icon}</span>
                        <span className="font-medium">{wallet.name}</span>
                      </div>
                      {wallet.popular && (
                        <Badge variant="secondary" className="text-xs">Popular</Badge>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-xs text-muted-foreground text-center">
                🔒 Secured by Global Pay Connect • Your keys, your crypto
              </div>
            </div>
          )}

          {/* Step 2: Wallet Connection */}
          {step === 'wallet' && (
            <div className="p-6 space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Connecting Wallet</h2>
                <p className="text-sm text-muted-foreground">
                  Please approve the connection in your {wallets.find(w => w.id === selectedWallet)?.name} wallet
                </p>
              </div>

              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{wallets.find(w => w.id === selectedWallet)?.icon}</span>
                  <span className="font-medium">{wallets.find(w => w.id === selectedWallet)?.name}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  A popup should appear in your wallet extension
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Processing */}
          {step === 'processing' && (
            <div className="p-6 space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Processing Payment</h2>
                <p className="text-sm text-muted-foreground">
                  Confirming transaction on the blockchain...
                </p>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-medium">{paymentDetails.amount} {paymentDetails.currency}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Network</span>
                  <span className="font-medium">{paymentDetails.chain}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant="secondary">
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Confirming
                  </Badge>
                </div>
              </div>

              <div className="text-xs text-muted-foreground text-center">
                This usually takes 5-30 seconds depending on network congestion
              </div>
            </div>
          )}

          {/* Step 4: Success */}
          {step === 'success' && (
            <div className="p-6 space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-4">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Payment Successful!</h2>
                <p className="text-sm text-muted-foreground">
                  Your payment has been confirmed on the blockchain
                </p>
              </div>

              <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount Paid</span>
                  <span className="font-medium">{paymentDetails.amount} {paymentDetails.currency}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Transaction</span>
                  <button
                    onClick={copyAddress}
                    className="flex items-center gap-1 text-primary hover:underline"
                  >
                    <code className="text-xs">7xKX...gAsU</code>
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <Button className="w-full" onClick={() => setStep('details')}>
                Make Another Payment
              </Button>

              <div className="text-center">
                <a href="#" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
                  View on Explorer
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-muted-foreground">
          This is a demo of the customer payment experience
        </div>
      </div>
    </div>
  );
}

