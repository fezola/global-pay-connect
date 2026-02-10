import React, { useState } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, CheckCircle, XCircle, Clock, Wallet, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useMerchant } from '@/hooks/useMerchant';

const CHAINS = [
  { id: 'solana', name: 'Solana', currency: 'SOL' },
  { id: 'ethereum', name: 'Ethereum', currency: 'ETH' },
  { id: 'base', name: 'Base', currency: 'ETH' },
  { id: 'polygon', name: 'Polygon', currency: 'MATIC' },
];

const STABLECOINS = ['USDC', 'USDT', 'DAI'];

export default function MockPaymentFlow() {
  const [step, setStep] = useState<'create' | 'pending' | 'processing' | 'completed'>('create');
  const [amount, setAmount] = useState('100');
  const [currency, setCurrency] = useState('USDC');
  const [chain, setChain] = useState('solana');
  const [customerEmail, setCustomerEmail] = useState('customer@example.com');
  const [loading, setLoading] = useState(false);
  const [paymentIntent, setPaymentIntent] = useState<any>(null);
  const [mockWalletAddress, setMockWalletAddress] = useState('');
  const { toast } = useToast();
  const { merchant, loading: merchantLoading } = useMerchant();

  const createPaymentIntent = async () => {
    setLoading(true);
    try {
      if (!merchant) {
        throw new Error('No merchant account found. Please complete your business profile first.');
      }

      // Generate mock payment address based on chain
      const paymentAddress = chain === 'solana'
        ? `${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`
        : `0x${Math.random().toString(16).substring(2, 15)}${Math.random().toString(16).substring(2, 15)}${Math.random().toString(16).substring(2, 15)}`;

      // Token mint addresses (Solana mainnet)
      const tokenMints: Record<string, string> = {
        'USDC': 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        'USDT': 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
        'DAI': '4Fau1Cg2LKfeX9TUo8NLKq1gXWHfxVVJy4VuT3UjYWax',
      };

      const expectedTokenMint = tokenMints[currency] || tokenMints['USDC'];

      // Create payment intent
      const paymentData = {
        merchant_id: merchant.id,
        amount: parseFloat(amount),
        currency: currency,
        chain: chain,
        payment_address: paymentAddress,
        expected_token_mint: expectedTokenMint,
        customer_email: customerEmail,
        status: 'pending', // Valid statuses: pending, processing, succeeded, failed, cancelled, expired
        metadata: {
          test: true,
          mock_payment: true,
          description: 'Mock payment for testing',
        },
      };

      const { data: payment, error } = await supabase
        .from('payment_intents')
        .insert(paymentData)
        .select()
        .single();

      if (error) throw error;

      setPaymentIntent(payment);
      setStep('pending');

      toast({
        title: 'Payment Created',
        description: `Payment intent ${payment.id.slice(0, 8)}... created`,
      });
    } catch (error) {
      console.error('Error creating payment:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create payment',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const simulateWalletConnection = async () => {
    setLoading(true);
    try {
      // Generate mock wallet address
      const mockAddress = `${chain === 'solana' ? '' : '0x'}${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
      setMockWalletAddress(mockAddress);

      // Update payment intent status to processing and store wallet in metadata
      const { error } = await supabase
        .from('payment_intents')
        .update({
          status: 'processing',
          metadata: {
            ...paymentIntent.metadata,
            customer_wallet_address: mockAddress,
          },
        })
        .eq('id', paymentIntent.id);

      if (error) throw error;

      setStep('processing');

      toast({
        title: 'Wallet Connected',
        description: 'Mock wallet connected successfully',
      });

      // Auto-complete after 2 seconds
      setTimeout(() => {
        simulatePaymentCompletion();
      }, 2000);
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast({
        title: 'Error',
        description: 'Failed to connect wallet',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const simulatePaymentCompletion = async () => {
    try {
      // Generate mock transaction hash
      const mockTxHash = `${chain === 'solana' ? '' : '0x'}${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;

      // Update payment intent to succeeded
      const { error } = await supabase
        .from('payment_intents')
        .update({
          status: 'succeeded',
          tx_hash: mockTxHash,
          confirmed_at: new Date().toISOString(),
        })
        .eq('id', paymentIntent.id);

      if (error) throw error;

      setPaymentIntent({ ...paymentIntent, status: 'succeeded', tx_hash: mockTxHash });
      setStep('completed');

      toast({
        title: 'Payment Completed',
        description: 'Mock payment completed successfully!',
      });
    } catch (error) {
      console.error('Error completing payment:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete payment',
        variant: 'destructive',
      });
    }
  };

  const resetFlow = () => {
    setStep('create');
    setPaymentIntent(null);
    setMockWalletAddress('');
  };

  // Show loading state while merchant is loading
  if (merchantLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Show error if no merchant
  if (!merchant) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-destructive/10 border border-destructive rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-destructive mb-2">No Merchant Account Found</h2>
            <p className="text-muted-foreground mb-4">
              Please complete your business profile first to use the mock payment flow.
            </p>
            <Button onClick={() => window.location.href = '/business'}>
              Complete Business Profile
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Mock Payment Flow</h1>
          <p className="text-muted-foreground mt-1">
            Test the complete payment journey from creation to completion
          </p>
        </div>

        {/* Progress Steps */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            {/* Step 1 */}
            <div className="flex flex-col items-center flex-1">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                step === 'create' ? 'bg-primary text-primary-foreground' : 
                ['pending', 'processing', 'completed'].includes(step) ? 'bg-green-500 text-white' : 
                'bg-muted text-muted-foreground'
              }`}>
                {['pending', 'processing', 'completed'].includes(step) ? <CheckCircle className="w-6 h-6" /> : '1'}
              </div>
              <span className="text-sm mt-2 font-medium">Create Payment</span>
            </div>

            <ArrowRight className="text-muted-foreground" />

            {/* Step 2 */}
            <div className="flex flex-col items-center flex-1">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                step === 'pending' ? 'bg-primary text-primary-foreground' : 
                ['processing', 'completed'].includes(step) ? 'bg-green-500 text-white' : 
                'bg-muted text-muted-foreground'
              }`}>
                {['processing', 'completed'].includes(step) ? <CheckCircle className="w-6 h-6" /> : 
                 step === 'pending' ? <Clock className="w-6 h-6" /> : '2'}
              </div>
              <span className="text-sm mt-2 font-medium">Connect Wallet</span>
            </div>

            <ArrowRight className="text-muted-foreground" />

            {/* Step 3 */}
            <div className="flex flex-col items-center flex-1">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                step === 'processing' ? 'bg-primary text-primary-foreground' : 
                step === 'completed' ? 'bg-green-500 text-white' : 
                'bg-muted text-muted-foreground'
              }`}>
                {step === 'completed' ? <CheckCircle className="w-6 h-6" /> : 
                 step === 'processing' ? <Loader2 className="w-6 h-6 animate-spin" /> : '3'}
              </div>
              <span className="text-sm mt-2 font-medium">Processing</span>
            </div>

            <ArrowRight className="text-muted-foreground" />

            {/* Step 4 */}
            <div className="flex flex-col items-center flex-1">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                step === 'completed' ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'
              }`}>
                {step === 'completed' ? <CheckCircle className="w-6 h-6" /> : '4'}
              </div>
              <span className="text-sm mt-2 font-medium">Completed</span>
            </div>
          </div>
        </div>

        {/* Step 1: Create Payment */}
        {step === 'create' && (
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Step 1: Create Payment Intent</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="100.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STABLECOINS.map((coin) => (
                        <SelectItem key={coin} value={coin}>
                          {coin}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="chain">Blockchain</Label>
                <Select value={chain} onValueChange={setChain}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CHAINS.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Customer Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="customer@example.com"
                />
              </div>

              <Button onClick={createPaymentIntent} disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Payment Intent'
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Pending Payment */}
        {step === 'pending' && paymentIntent && (
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Step 2: Customer Connects Wallet</h2>

            <div className="bg-muted/50 p-4 rounded-lg mb-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Payment ID:</span>
                <code className="bg-muted px-2 py-1 rounded text-xs">
                  {paymentIntent.id.slice(0, 16)}...
                </code>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-medium">{amount} {currency}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Chain:</span>
                <Badge variant="outline">{CHAINS.find(c => c.id === chain)?.name}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status:</span>
                <Badge variant="secondary">Pending Payment</Badge>
              </div>
            </div>

            <div className="text-center py-8">
              <Wallet className="w-16 h-16 mx-auto mb-4 text-primary" />
              <p className="text-lg font-medium mb-2">Waiting for customer to connect wallet</p>
              <p className="text-sm text-muted-foreground mb-6">
                In a real scenario, the customer would connect their wallet (Phantom, MetaMask, etc.)
              </p>
              <Button onClick={simulateWalletConnection} disabled={loading} size="lg">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Wallet className="w-4 h-4 mr-2" />
                    Simulate Wallet Connection
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Processing */}
        {step === 'processing' && paymentIntent && (
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Step 3: Processing Payment</h2>

            <div className="bg-muted/50 p-4 rounded-lg mb-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Payment ID:</span>
                <code className="bg-muted px-2 py-1 rounded text-xs">
                  {paymentIntent.id.slice(0, 16)}...
                </code>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Wallet Address:</span>
                <code className="bg-muted px-2 py-1 rounded text-xs">
                  {mockWalletAddress.slice(0, 16)}...
                </code>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-medium">{amount} {currency}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status:</span>
                <Badge variant="secondary">
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Processing
                </Badge>
              </div>
            </div>

            <div className="text-center py-8">
              <Loader2 className="w-16 h-16 mx-auto mb-4 text-primary animate-spin" />
              <p className="text-lg font-medium mb-2">Processing transaction on blockchain</p>
              <p className="text-sm text-muted-foreground">
                Waiting for blockchain confirmation...
              </p>
            </div>
          </div>
        )}

        {/* Step 4: Completed */}
        {step === 'completed' && paymentIntent && (
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Step 4: Payment Completed! 🎉</h2>

            <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 p-4 rounded-lg mb-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Payment ID:</span>
                <code className="bg-muted px-2 py-1 rounded text-xs">
                  {paymentIntent.id.slice(0, 16)}...
                </code>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Transaction Hash:</span>
                <code className="bg-muted px-2 py-1 rounded text-xs">
                  {paymentIntent.tx_hash?.slice(0, 16)}...
                </code>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-medium">{amount} {currency}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status:</span>
                <Badge className="bg-green-500 text-white">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Succeeded
                </Badge>
              </div>
            </div>

            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <p className="text-lg font-medium mb-2">Payment Successful!</p>
              <p className="text-sm text-muted-foreground mb-6">
                The payment has been confirmed on the blockchain
              </p>

              <div className="flex gap-3 justify-center">
                <Button onClick={resetFlow} variant="outline">
                  Create Another Payment
                </Button>
                <Button onClick={() => window.location.href = '/transactions'}>
                  View in Transactions
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="font-medium mb-2 flex items-center gap-2">
            <span className="text-blue-600 dark:text-blue-400">ℹ️</span>
            How This Works
          </h3>
          <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
            <li>This simulates the complete payment flow your customers will experience</li>
            <li>In production, customers would connect their real wallets (Phantom, MetaMask, etc.)</li>
            <li>The blockchain transaction would be real and verified on-chain</li>
            <li>You can view all created payments in the Transactions page</li>
            <li>This creates real database entries you can test with</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}


