/**
 * Checkout Widget Demo Page
 * Interactive demo of the Klyr checkout widget
 */

import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { MultiStepCheckout } from "@/components/checkout/MultiStepCheckout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, Play, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function CheckoutDemo() {
  const { toast } = useToast();
  const [showCheckout, setShowCheckout] = useState(false);
  const [copied, setCopied] = useState(false);

  // Configuration state
  const [amount, setAmount] = useState("100.00");
  const [currency, setCurrency] = useState("USD");
  const [description, setDescription] = useState("Premium Plan - Monthly");
  const [theme, setTheme] = useState<"light" | "dark" | "auto">("auto");
  const [showBranding, setShowBranding] = useState(true);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const jsCode = `<script src="https://js.klyr.io/v1/checkout.js"></script>

<button onclick="openCheckout()">Pay with Crypto</button>

<script>
function openCheckout() {
  Klyr.checkout.open({
    merchantId: 'your_merchant_id',
    amount: '${amount}',
    currency: '${currency}',
    description: '${description}',
    theme: '${theme}',
    showBranding: ${showBranding},
    onSuccess: (paymentId, txHash) => {
      console.log('Payment successful!', paymentId);
    }
  });
}
</script>`;

  const reactCode = `import { KlyrCheckoutButton } from '@klyr/sdk/react';

function App() {
  return (
    <KlyrCheckoutButton
      merchantId="your_merchant_id"
      amount="${amount}"
      currency="${currency}"
      description="${description}"
      theme="${theme}"
      showBranding={${showBranding}}
      onSuccess={(paymentId, txHash) => {
        console.log('Payment successful!', paymentId);
      }}
    >
      Pay with Crypto
    </KlyrCheckoutButton>
  );
}`;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Checkout Widget Demo</h1>
          <p className="text-muted-foreground">
            Interactive demo of the Klyr checkout widget. Configure and test the payment flow.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Configuration Panel */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Configuration</h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="100.00"
                />
              </div>

              <div>
                <Label htmlFor="currency">Currency</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Payment description"
                />
              </div>

              <div>
                <Label htmlFor="theme">Theme</Label>
                <Select value={theme} onValueChange={(v: any) => setTheme(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="auto">Auto</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="branding">Show Branding</Label>
                <Switch
                  id="branding"
                  checked={showBranding}
                  onCheckedChange={setShowBranding}
                />
              </div>

              <Button
                onClick={() => setShowCheckout(true)}
                className="w-full"
                size="lg"
              >
                <Play className="h-4 w-4 mr-2" />
                Launch Checkout Demo
              </Button>
            </div>
          </Card>

          {/* Code Examples */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Integration Code</h2>
            
            <Tabs defaultValue="javascript">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                <TabsTrigger value="react">React</TabsTrigger>
              </TabsList>

              <TabsContent value="javascript" className="mt-4">
                <div className="relative">
                  <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{jsCode}</code>
                  </pre>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-2 right-2"
                    onClick={() => handleCopy(jsCode)}
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="react" className="mt-4">
                <div className="relative">
                  <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{reactCode}</code>
                  </pre>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-2 right-2"
                    onClick={() => handleCopy(reactCode)}
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        {/* Testing Instructions */}
        <Card className="p-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <h2 className="text-xl font-semibold mb-4">🧪 Testing Instructions</h2>
          <div className="space-y-3 text-sm">
            <div>
              <strong>1. Install a Wallet:</strong>
              <ul className="ml-4 mt-1 space-y-1">
                <li>• For Solana: Install <a href="https://phantom.app/" target="_blank" className="text-blue-600 hover:underline">Phantom Wallet</a></li>
                <li>• For Base: Install <a href="https://metamask.io/" target="_blank" className="text-blue-600 hover:underline">MetaMask</a></li>
              </ul>
            </div>
            <div>
              <strong>2. Switch to Testnet:</strong>
              <ul className="ml-4 mt-1 space-y-1">
                <li>• Phantom: Settings → Developer Settings → Change Network → Devnet</li>
                <li>• MetaMask: Add Base Testnet network</li>
              </ul>
            </div>
            <div>
              <strong>3. Get Test Tokens:</strong>
              <ul className="ml-4 mt-1 space-y-1">
                <li>• Solana Devnet: <a href="https://solfaucet.com/" target="_blank" className="text-blue-600 hover:underline">SOL Faucet</a></li>
                <li>• Base Testnet: <a href="https://faucet.quicknode.com/base/testnet" target="_blank" className="text-blue-600 hover:underline">Base Faucet</a></li>
              </ul>
            </div>
            <div>
              <strong>4. Test the Flow:</strong>
              <ul className="ml-4 mt-1 space-y-1">
                <li>• Click "Launch Checkout Demo" above</li>
                <li>• Select a payment method (Solana USDC recommended for testing)</li>
                <li>• Connect your wallet</li>
                <li>• Approve the transaction</li>
                <li>• Watch real-time confirmation!</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Features */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Features</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">🔗 Multi-Chain</h3>
              <p className="text-sm text-muted-foreground">
                Support for Solana and Base networks with USDC/USDT
              </p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">👛 Wallet Integration</h3>
              <p className="text-sm text-muted-foreground">
                Phantom, MetaMask, Coinbase Wallet, and more
              </p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">⚡ Real-time Updates</h3>
              <p className="text-sm text-muted-foreground">
                Live transaction status and confirmation tracking
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Checkout Widget */}
      {showCheckout && (
        <MultiStepCheckout
          paymentIntent={{
            id: `pi_${Date.now()}`,
            amount: parseFloat(amount),
            currency: currency,
            merchantId: "demo_merchant",
            merchantName: "Demo Store",
            description: description,
          }}
          onSuccess={(txHash) => {
            toast({
              title: "Payment Successful!",
              description: `Transaction: ${txHash.slice(0, 10)}...`,
            });
            setShowCheckout(false);
          }}
          onClose={() => setShowCheckout(false)}
          theme={theme}
        />
      )}
    </DashboardLayout>
  );
}

