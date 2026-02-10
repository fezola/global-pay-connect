import React, { useState } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckoutWidget } from '@/components/checkout/CheckoutWidget';
import { MultiStepCheckout } from '@/components/checkout/MultiStepCheckout';
import { ExternalLink, Code, Sparkles, Zap, AlertCircle } from 'lucide-react';

export default function PaymentWidgetShowcase() {
  const [showCheckout1, setShowCheckout1] = useState(false);
  const [showCheckout2, setShowCheckout2] = useState(false);

  const demoPaymentIntent = {
    id: `pi_${Date.now()}`,
    amount: 99.99,
    currency: 'USD',
    merchantId: 'demo_merchant',
    merchantName: 'Global Pay Connect',
    description: 'Premium Subscription - 1 Year',
    payment_address: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Payment Widget Showcase</h1>
          <p className="text-muted-foreground mt-1">
            See our beautiful, production-ready payment widgets in action
          </p>
        </div>

        {/* Important Note */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Note:</strong> The CheckoutWidget requires the <code>create-payment-intent</code> Edge Function to be deployed.
            For now, use <strong>MultiStepCheckout</strong> for the full demo experience, or deploy the Edge Functions first.
          </AlertDescription>
        </Alert>

        {/* Comparison */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-500" />
                CheckoutWidget
              </CardTitle>
              <CardDescription>Production-ready, full-featured</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  ✅ Multi-step flow
                </div>
                <div className="flex items-center gap-2">
                  ✅ Wallet selection (6+ wallets)
                </div>
                <div className="flex items-center gap-2">
                  ✅ Balance checking
                </div>
                <div className="flex items-center gap-2">
                  ✅ Real blockchain transactions
                </div>
                <div className="flex items-center gap-2">
                  ✅ Payment confirmation
                </div>
              </div>
              <Button onClick={() => setShowCheckout1(true)} className="w-full">
                Try CheckoutWidget
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-500" />
                MultiStepCheckout
              </CardTitle>
              <CardDescription>Advanced, customizable</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  ✅ Currency selection
                </div>
                <div className="flex items-center gap-2">
                  ✅ Network selection (5 chains)
                </div>
                <div className="flex items-center gap-2">
                  ✅ Amount review
                </div>
                <div className="flex items-center gap-2">
                  ✅ Fee breakdown
                </div>
                <div className="flex items-center gap-2">
                  ✅ Progress indicator
                </div>
              </div>
              <Button onClick={() => setShowCheckout2(true)} className="w-full">
                Try MultiStepCheckout
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5 text-green-500" />
                Mock Payment Flow
              </CardTitle>
              <CardDescription>Testing & development</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  ⚙️ Backend testing
                </div>
                <div className="flex items-center gap-2">
                  ⚙️ Database integration
                </div>
                <div className="flex items-center gap-2">
                  ⚙️ Mock transactions
                </div>
                <div className="flex items-center gap-2">
                  ⚙️ Test data generation
                </div>
                <div className="flex items-center gap-2">
                  ⚙️ Developer tool
                </div>
              </div>
              <Button onClick={() => window.location.href = '/mock-payment'} variant="outline" className="w-full">
                Go to Mock Flow
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Documentation */}
        <Card>
          <CardHeader>
            <CardTitle>Integration Options</CardTitle>
            <CardDescription>Multiple ways to integrate our payment widgets</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="javascript">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="javascript">JavaScript SDK</TabsTrigger>
                <TabsTrigger value="react">React Component</TabsTrigger>
                <TabsTrigger value="hosted">Hosted Page</TabsTrigger>
              </TabsList>

              <TabsContent value="javascript" className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <code className="text-sm">
                    {`<script src="https://js.klyr.io/v1/checkout.js"></script>

<button onclick="openCheckout()">Pay with Crypto</button>

<script>
function openCheckout() {
  Klyr.checkout.open({
    merchantId: 'your_merchant_id',
    amount: '99.99',
    currency: 'USD',
    onSuccess: (paymentId, txHash) => {
      console.log('Payment successful!', paymentId);
    }
  });
}
</script>`}
                  </code>
                </div>
              </TabsContent>

              <TabsContent value="react" className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <code className="text-sm">
                    {`import { KlyrCheckoutButton } from '@klyr/sdk/react';

<KlyrCheckoutButton
  merchantId="your_merchant_id"
  amount="99.99"
  currency="USD"
  onSuccess={(paymentId) => {
    console.log('Success!', paymentId);
  }}
>
  Pay with Crypto
</KlyrCheckoutButton>`}
                  </code>
                </div>
              </TabsContent>

              <TabsContent value="hosted" className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <code className="text-sm">
                    {`// Redirect to hosted checkout page
window.location.href = 
  'https://checkout.klyr.io?' +
  'merchant_id=your_merchant_id&' +
  'amount=99.99&' +
  'currency=USD&' +
  'return_url=https://yoursite.com/success';`}
                  </code>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Supported Wallets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <Badge>Solana</Badge>
                  <span className="text-sm">Phantom</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge>Solana</Badge>
                  <span className="text-sm">Solflare</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge>EVM</Badge>
                  <span className="text-sm">MetaMask</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge>EVM</Badge>
                  <span className="text-sm">Coinbase</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge>EVM</Badge>
                  <span className="text-sm">WalletConnect</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge>Solana</Badge>
                  <span className="text-sm">Backpack</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Supported Networks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Solana</span>
                  <Badge variant="outline">USDC, USDT</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Ethereum</span>
                  <Badge variant="outline">USDC, USDT</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Base</span>
                  <Badge variant="outline">USDC, USDT</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Polygon</span>
                  <Badge variant="outline">USDC, USDT</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Arbitrum</span>
                  <Badge variant="outline">USDC, USDT</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Checkout Modals */}
      {showCheckout1 && (
        <div className="fixed inset-0 z-50">
          <CheckoutWidget
            {...demoPaymentIntent}
            onClose={() => setShowCheckout1(false)}
            onSuccess={(paymentId, txHash) => {
              console.log('Payment successful!', paymentId, txHash);
              setShowCheckout1(false);
            }}
            theme="auto"
          />
        </div>
      )}

      {showCheckout2 && (
        <MultiStepCheckout
          paymentIntent={demoPaymentIntent}
          onClose={() => setShowCheckout2(false)}
          onSuccess={(paymentId, txHash) => {
            console.log('Payment successful!', paymentId, txHash);
            setShowCheckout2(false);
          }}
          theme="auto"
        />
      )}
    </DashboardLayout>
  );
}

