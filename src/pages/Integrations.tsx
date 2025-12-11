import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Link2,
  Building,
  Wallet,
  Webhook,
  ArrowUpRight,
  CheckCircle2,
  Settings,
  Trash2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const availableIntegrations = [
  {
    type: 'bank',
    provider: 'stripe',
    name: 'Stripe Connect',
    description: 'Accept card payments and bank transfers',
    icon: Building,
    category: 'Banking',
  },
  {
    type: 'bank',
    provider: 'plaid',
    name: 'Plaid',
    description: 'Instant bank account verification',
    icon: Building,
    category: 'Banking',
  },
  {
    type: 'ramp',
    provider: 'moonpay',
    name: 'MoonPay',
    description: 'Fiat on/off ramp for crypto',
    icon: ArrowUpRight,
    category: 'On-Ramp',
  },
  {
    type: 'ramp',
    provider: 'transak',
    name: 'Transak',
    description: 'Global crypto purchase gateway',
    icon: ArrowUpRight,
    category: 'On-Ramp',
  },
  {
    type: 'custodian',
    provider: 'fireblocks',
    name: 'Fireblocks',
    description: 'Enterprise-grade custody and MPC',
    icon: Wallet,
    category: 'Custody',
  },
  {
    type: 'custodian',
    provider: 'copper',
    name: 'Copper',
    description: 'Institutional digital asset custody',
    icon: Wallet,
    category: 'Custody',
  },
];

export default function Integrations() {
  const { integrations, addIntegration, updateIntegration, removeIntegration } = useAppStore();
  const { toast } = useToast();
  const [isWebhookOpen, setIsWebhookOpen] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');

  const handleConnect = (integration: typeof availableIntegrations[0]) => {
    addIntegration({
      type: integration.type as any,
      provider: integration.provider,
      name: integration.name,
      isConnected: true,
      isProduction: false,
    });
    toast({ 
      title: "Integration connected", 
      description: `${integration.name} has been connected successfully` 
    });
  };

  const handleDisconnect = (id: string, name: string) => {
    removeIntegration(id);
    toast({ 
      title: "Integration removed", 
      description: `${name} has been disconnected` 
    });
  };

  const handleAddWebhook = () => {
    if (!webhookUrl) {
      toast({ title: "Error", description: "Webhook URL is required", variant: "destructive" });
      return;
    }
    addIntegration({
      type: 'webhook',
      provider: 'custom',
      name: webhookUrl,
      isConnected: true,
      isProduction: false,
    });
    setWebhookUrl('');
    setIsWebhookOpen(false);
    toast({ title: "Webhook added", description: "Your webhook endpoint has been configured" });
  };

  const isConnected = (provider: string) => integrations.some(i => i.provider === provider);

  const webhooks = integrations.filter(i => i.type === 'webhook');
  const connectedIntegrations = integrations.filter(i => i.type !== 'webhook');

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Integrations</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Connect banks, ramps, custodians, and configure webhooks
        </p>
      </div>

      <div className="space-y-8">
        {/* Connected Integrations */}
        {connectedIntegrations.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Connected</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {connectedIntegrations.map((integration) => (
                <div key={integration.id} className="bg-card rounded-lg border border-success/30 p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                        <CheckCircle2 className="h-5 w-5 text-success" />
                      </div>
                      <div>
                        <h3 className="font-medium">{integration.name}</h3>
                        <p className="text-sm text-muted-foreground capitalize">{integration.type}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="border-success text-success">
                      Connected
                    </Badge>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1 gap-1">
                      <Settings className="h-3 w-3" />
                      Configure
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDisconnect(integration.id, integration.name)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Available Integrations by Category */}
        {['Banking', 'On-Ramp', 'Custody'].map((category) => (
          <div key={category}>
            <h2 className="text-lg font-semibold mb-4">{category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableIntegrations
                .filter((i) => i.category === category && !isConnected(i.provider))
                .map((integration) => (
                  <div key={integration.provider} className="bg-card rounded-lg border border-border p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                        <integration.icon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{integration.name}</h3>
                        <p className="text-sm text-muted-foreground">{integration.description}</p>
                      </div>
                    </div>
                    <Button 
                      className="w-full mt-4" 
                      variant="outline"
                      onClick={() => handleConnect(integration)}
                    >
                      Connect
                    </Button>
                  </div>
                ))}
            </div>
          </div>
        ))}

        {/* Webhooks */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Webhooks</h2>
            <Dialog open={isWebhookOpen} onOpenChange={setIsWebhookOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Webhook
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Webhook Endpoint</DialogTitle>
                  <DialogDescription>
                    Configure a URL to receive event notifications
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Endpoint URL</Label>
                    <Input
                      type="url"
                      placeholder="https://your-app.com/webhooks/klyr"
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsWebhookOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddWebhook}>Add Webhook</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {webhooks.length === 0 ? (
            <div className="bg-card rounded-lg border border-dashed border-border p-8 text-center">
              <Webhook className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-medium">No webhooks configured</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Add a webhook endpoint to receive real-time event notifications
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {webhooks.map((webhook) => (
                <div key={webhook.id} className="flex items-center justify-between p-4 bg-card rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <Webhook className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-mono text-sm">{webhook.name}</p>
                      <p className="text-xs text-muted-foreground">All events</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-success text-success">Active</Badge>
                    <Button variant="outline" size="sm">Test</Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDisconnect(webhook.id, 'Webhook')}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
