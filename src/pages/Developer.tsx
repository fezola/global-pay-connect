import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import { Copy, Check, ExternalLink, Terminal } from "lucide-react";

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
};

export default function Developer() {
  const { merchant } = useAppStore();
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);
  const [copiedApiKey, setCopiedApiKey] = useState(false);

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
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Developer</h1>
        <p className="text-muted-foreground text-sm mt-1">
          SDK documentation and integration guides
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Start */}
          <div className="bg-card rounded-lg border border-border p-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Terminal className="h-5 w-5" />
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
          <div className="bg-card rounded-lg border border-border p-6">
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
          <div className="bg-card rounded-lg border border-border p-4">
            <h3 className="font-semibold mb-3">Sandbox API Key</h3>
            <div className="flex items-center gap-2">
              <code className="flex-1 p-2 bg-muted rounded text-xs font-mono truncate">
                {merchant?.apiKey.substring(0, 24)}...
              </code>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={copyApiKey}>
                {copiedApiKey ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Resources */}
          <div className="bg-card rounded-lg border border-border p-4">
            <h3 className="font-semibold mb-3">Resources</h3>
            <div className="space-y-2">
              <a
                href="#"
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors text-sm"
              >
                <span>SDK Repository</span>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </a>
              <a
                href="#"
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors text-sm"
              >
                <span>OpenAPI Spec</span>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </a>
              <a
                href="#"
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors text-sm"
              >
                <span>Full Documentation</span>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </a>
              <a
                href="#"
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors text-sm"
              >
                <span>Postman Collection</span>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </a>
            </div>
          </div>

          {/* Base URL */}
          <div className="bg-card rounded-lg border border-border p-4">
            <h3 className="font-semibold mb-3">Base URL</h3>
            <code className="text-xs font-mono text-muted-foreground">
              https://api.klyr.io/v1
            </code>
          </div>
        </div>
      </div>
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
