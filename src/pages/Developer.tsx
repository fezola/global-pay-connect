import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { EmbeddableCheckout, EmbeddableCheckoutPreview } from "@/components/EmbeddableCheckout";
import { useAppStore } from "@/lib/store";
import { Copy, Check, ExternalLink, Terminal, Code, Palette, Zap, Layout } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const codeSnippets = {
  install: `npm install @klyr/sdk`,
  init: `import { KlyrClient } from '@klyr/sdk';

const klyr = new KlyrClient({
  apiKey: 'sk_test_klyr_...',
  environment: 'sandbox'
});`,
  charge: `// Create a payment charge
const charge = await klyr.payments.charge({
  amount: '100.00',
  currency: 'USDC',
  payment_method: 'onchain',
  customer_info: {
    email: 'customer@example.com'
  }
});

console.log(charge.id); // "pay_1a2b3c4d5e6f"
console.log(charge.status); // "pending"`,
  balance: `// Get merchant balances
const balances = await klyr.balances.list();

// Returns:
// [
//   { currency: 'USDC', total: '2450.00', onchain: '1950.00', offchain: '500.00' },
//   { currency: 'USDT', total: '500.00', onchain: '500.00', offchain: '0.00' }
// ]`,
  payout: `// Request a payout
const payout = await klyr.payouts.create({
  amount: '500.00',
  currency: 'USDC',
  destination: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD81',
  destination_type: 'onchain'
});

console.log(payout.status); // "pending"
console.log(payout.fee); // "0.10"`,
  webhook: `// Verify webhook signature
import { verifyWebhook } from '@klyr/sdk';

app.post('/webhooks/klyr', (req, res) => {
  const signature = req.headers['x-klyr-signature'];
  const isValid = verifyWebhook(req.body, signature, webhookSecret);
  
  if (!isValid) {
    return res.status(401).send('Invalid signature');
  }
  
  const event = req.body;
  
  switch (event.type) {
    case 'payment.settled':
      // Handle settled payment
      break;
    case 'payout.completed':
      // Handle completed payout
      break;
  }
  
  res.status(200).send('OK');
});`,
  widgetScript: `<!-- Add the Klyr Checkout script -->
<script src="https://js.klyr.io/v1/checkout.js"></script>`,
  widgetInit: `// Initialize the checkout widget
Klyr.checkout({
  merchantId: 'your_merchant_id',
  amount: '99.00',
  currency: 'USD',
  theme: 'light', // or 'dark'
  onSuccess: function(paymentId) {
    console.log('Payment successful:', paymentId);
    // Redirect to success page or update UI
  },
  onClose: function() {
    console.log('Checkout closed');
  }
});`,
  widgetReact: `import { KlyrCheckout } from '@klyr/react';

function PaymentPage() {
  const [showCheckout, setShowCheckout] = useState(false);

  const handleSuccess = (paymentId) => {
    console.log('Payment complete:', paymentId);
    setShowCheckout(false);
    // Handle success
  };

  return (
    <div>
      <button onClick={() => setShowCheckout(true)}>
        Pay Now
      </button>
      
      {showCheckout && (
        <KlyrCheckout
          merchantId="your_merchant_id"
          amount="99.00"
          currency="USD"
          theme="light"
          onSuccess={handleSuccess}
          onClose={() => setShowCheckout(false)}
        />
      )}
    </div>
  );
}`,
  widgetCustom: `// Custom styling options
Klyr.checkout({
  merchantId: 'your_merchant_id',
  amount: '99.00',
  merchantName: 'Your Store Name',
  theme: 'light',
  primaryColor: '#0ea5a4', // Custom accent color
  showBranding: false,     // Hide "Powered by Klyr"
  currencies: ['USDC', 'USDT', 'ETH'], // Available payment methods
  onSuccess: handleSuccess
});`,
};

export default function Developer() {
  const { merchant } = useAppStore();
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);
  const [copiedApiKey, setCopiedApiKey] = useState(false);
  const [showWidgetPreview, setShowWidgetPreview] = useState(false);

  const copySnippet = (key: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSnippet(key);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  const copyApiKey = () => {
    if (merchant?.apiKey) {
      navigator.clipboard.writeText(merchant.apiKey);
      setCopiedApiKey(true);
      setTimeout(() => setCopiedApiKey(false), 2000);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold tracking-tight">Developer</h1>
          <span className="text-xs font-medium text-success bg-success/10 px-2 py-1 rounded-full">
            Sandbox
          </span>
        </div>
        <p className="text-muted-foreground">
          SDK documentation, integration guides, and embeddable checkout widget
        </p>
      </div>

      <Tabs defaultValue="sdk" className="space-y-6">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="sdk" className="gap-2">
            <Terminal className="h-4 w-4" />
            SDK
          </TabsTrigger>
          <TabsTrigger value="widget" className="gap-2" id="widget">
            <Layout className="h-4 w-4" />
            Checkout Widget
          </TabsTrigger>
          <TabsTrigger value="api" className="gap-2">
            <Code className="h-4 w-4" />
            API Reference
          </TabsTrigger>
        </TabsList>

        {/* SDK Tab */}
        <TabsContent value="sdk" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Quick Start */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h2 className="font-semibold mb-4 flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Quick Start
                </h2>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">1. Install the SDK</p>
                    <CodeBlock
                      code={codeSnippets.install}
                      onCopy={() => copySnippet("install", codeSnippets.install)}
                      copied={copiedSnippet === "install"}
                    />
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-2">2. Initialize the client</p>
                    <CodeBlock
                      code={codeSnippets.init}
                      onCopy={() => copySnippet("init", codeSnippets.init)}
                      copied={copiedSnippet === "init"}
                    />
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-2">3. Create a charge</p>
                    <CodeBlock
                      code={codeSnippets.charge}
                      onCopy={() => copySnippet("charge", codeSnippets.charge)}
                      copied={copiedSnippet === "charge"}
                    />
                  </div>
                </div>
              </div>

              {/* API Methods */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h2 className="font-semibold mb-4">API Methods</h2>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Get Balances</h3>
                    <CodeBlock
                      code={codeSnippets.balance}
                      onCopy={() => copySnippet("balance", codeSnippets.balance)}
                      copied={copiedSnippet === "balance"}
                    />
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-2">Request Payout</h3>
                    <CodeBlock
                      code={codeSnippets.payout}
                      onCopy={() => copySnippet("payout", codeSnippets.payout)}
                      copied={copiedSnippet === "payout"}
                    />
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-2">Webhook Handler</h3>
                    <CodeBlock
                      code={codeSnippets.webhook}
                      onCopy={() => copySnippet("webhook", codeSnippets.webhook)}
                      copied={copiedSnippet === "webhook"}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* API Key */}
              <div className="bg-card rounded-xl border border-border p-4">
                <h3 className="font-semibold mb-3">Sandbox API Key</h3>
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-2 bg-muted rounded-lg text-xs font-mono truncate">
                    {merchant?.apiKey.substring(0, 24)}...
                  </code>
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={copyApiKey}>
                    {copiedApiKey ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* Resources */}
              <div className="bg-card rounded-xl border border-border p-4">
                <h3 className="font-semibold mb-3">Resources</h3>
                <div className="space-y-1">
                  {[
                    { label: "SDK Repository", href: "#" },
                    { label: "OpenAPI Spec", href: "#" },
                    { label: "Full Documentation", href: "#" },
                    { label: "Postman Collection", href: "#" },
                  ].map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted/50 transition-colors text-sm"
                    >
                      <span>{link.label}</span>
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Base URL */}
              <div className="bg-card rounded-xl border border-border p-4">
                <h3 className="font-semibold mb-3">Base URL</h3>
                <code className="text-xs font-mono text-muted-foreground">
                  https://api.klyr.io/v1
                </code>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Checkout Widget Tab */}
        <TabsContent value="widget" className="space-y-6">
          {/* Hero Section */}
          <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-2xl border border-primary/20 p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-2xl font-bold mb-3">Embeddable Checkout Widget</h2>
                <p className="text-muted-foreground mb-6">
                  Add crypto payments to your website with a single line of code. 
                  Fully customizable, supports multiple currencies, and provides a 
                  seamless payment experience for your customers.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button onClick={() => setShowWidgetPreview(true)}>
                    <Layout className="h-4 w-4 mr-2" />
                    Preview Widget
                  </Button>
                  <Button variant="outline">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Demo
                  </Button>
                </div>
              </div>
              <div className="hidden lg:flex justify-center">
                <div className="w-[280px] h-[320px] bg-card rounded-xl border-2 border-border shadow-xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                      <span className="text-primary-foreground font-bold">K</span>
                    </div>
                    <p className="text-sm font-medium">Klyr Checkout</p>
                    <p className="text-xs text-muted-foreground mt-1">Secure Payment Widget</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                icon: <Zap className="h-5 w-5" />,
                title: "Easy Integration",
                description: "Add payments with just a few lines of code",
              },
              {
                icon: <Palette className="h-5 w-5" />,
                title: "Fully Customizable",
                description: "Match your brand with custom colors and themes",
              },
              {
                icon: <Code className="h-5 w-5" />,
                title: "Framework Agnostic",
                description: "Works with React, Vue, vanilla JS, and more",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="p-5 rounded-xl border border-border bg-card"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-3">
                  {feature.icon}
                </div>
                <h3 className="font-semibold mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Integration Guide */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="font-semibold mb-4">JavaScript / HTML</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">1. Add the script tag</p>
                  <CodeBlock
                    code={codeSnippets.widgetScript}
                    onCopy={() => copySnippet("widgetScript", codeSnippets.widgetScript)}
                    copied={copiedSnippet === "widgetScript"}
                  />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">2. Initialize checkout</p>
                  <CodeBlock
                    code={codeSnippets.widgetInit}
                    onCopy={() => copySnippet("widgetInit", codeSnippets.widgetInit)}
                    copied={copiedSnippet === "widgetInit"}
                  />
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="font-semibold mb-4">React Component</h3>
              <CodeBlock
                code={codeSnippets.widgetReact}
                onCopy={() => copySnippet("widgetReact", codeSnippets.widgetReact)}
                copied={copiedSnippet === "widgetReact"}
              />
            </div>
          </div>

          {/* Customization */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-semibold mb-4">Customization Options</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CodeBlock
                code={codeSnippets.widgetCustom}
                onCopy={() => copySnippet("widgetCustom", codeSnippets.widgetCustom)}
                copied={copiedSnippet === "widgetCustom"}
              />
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Available Options</h4>
                <div className="space-y-2 text-sm">
                  {[
                    { prop: "merchantId", desc: "Your merchant identifier (required)" },
                    { prop: "amount", desc: "Payment amount (required)" },
                    { prop: "currency", desc: "Display currency (USD, EUR, etc.)" },
                    { prop: "merchantName", desc: "Your business name shown in widget" },
                    { prop: "theme", desc: "Widget theme: 'light', 'dark', or 'auto'" },
                    { prop: "primaryColor", desc: "Custom accent color (hex)" },
                    { prop: "showBranding", desc: "Show/hide Klyr branding" },
                    { prop: "currencies", desc: "Array of accepted crypto currencies" },
                    { prop: "onSuccess", desc: "Callback when payment succeeds" },
                    { prop: "onClose", desc: "Callback when widget is closed" },
                  ].map((option) => (
                    <div key={option.prop} className="flex gap-3">
                      <code className="text-xs font-mono text-primary shrink-0 w-28">
                        {option.prop}
                      </code>
                      <span className="text-muted-foreground">{option.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* API Reference Tab */}
        <TabsContent value="api" className="space-y-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="font-semibold mb-4">REST API Reference</h2>
            <div className="space-y-4">
              {[
                { method: "POST", endpoint: "/v1/payments/charge", desc: "Create a new payment charge" },
                { method: "GET", endpoint: "/v1/payments/:id", desc: "Retrieve a payment by ID" },
                { method: "GET", endpoint: "/v1/balances", desc: "List all currency balances" },
                { method: "POST", endpoint: "/v1/payouts", desc: "Request a payout" },
                { method: "GET", endpoint: "/v1/payouts/:id", desc: "Get payout status" },
                { method: "GET", endpoint: "/v1/transactions", desc: "List all transactions" },
              ].map((endpoint) => (
                <div
                  key={endpoint.endpoint}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <span className={`px-2 py-0.5 rounded text-xs font-mono font-medium ${
                    endpoint.method === "POST" 
                      ? "bg-success/10 text-success" 
                      : "bg-primary/10 text-primary"
                  }`}>
                    {endpoint.method}
                  </span>
                  <code className="text-sm font-mono flex-1">{endpoint.endpoint}</code>
                  <span className="text-sm text-muted-foreground hidden sm:block">{endpoint.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Widget Preview Modal */}
      {showWidgetPreview && (
        <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <EmbeddableCheckout
            merchantName={merchant?.name || "Demo Store"}
            onClose={() => setShowWidgetPreview(false)}
            onSuccess={(id) => {
              console.log("Payment:", id);
              setShowWidgetPreview(false);
            }}
          />
        </div>
      )}
    </DashboardLayout>
  );
}

function CodeBlock({
  code,
  onCopy,
  copied,
}: {
  code: string;
  onCopy: () => void;
  copied: boolean;
}) {
  return (
    <div className="relative group">
      <pre className="bg-sidebar text-sidebar-foreground p-4 rounded-lg overflow-x-auto text-sm">
        <code>{code}</code>
      </pre>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity bg-sidebar-accent"
        onClick={onCopy}
      >
        {copied ? (
          <Check className="h-4 w-4 text-sidebar-foreground" />
        ) : (
          <Copy className="h-4 w-4 text-sidebar-foreground" />
        )}
      </Button>
    </div>
  );
}
