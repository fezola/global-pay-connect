import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAppStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { Copy, Check, RefreshCw, Send, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Settings() {
  const { merchant, useMockBackend, setUseMockBackend, regenerateApiKey, updateWebhook, reset, logout } = useAppStore();
  const { toast } = useToast();

  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState(merchant?.webhookUrl || "");
  const [testingWebhook, setTestingWebhook] = useState(false);

  const copyApiKey = () => {
    if (merchant?.apiKey) {
      navigator.clipboard.writeText(merchant.apiKey);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  const copyWebhookSecret = () => {
    if (merchant?.webhookSecret) {
      navigator.clipboard.writeText(merchant.webhookSecret);
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    }
  };

  const handleRegenerateKey = () => {
    const newKey = regenerateApiKey();
    toast({ title: "API key regenerated", description: "Make sure to update your integrations." });
  };

  const handleSaveWebhook = () => {
    updateWebhook(webhookUrl);
    toast({ title: "Webhook saved", description: "Your webhook URL has been updated." });
  };

  const handleTestWebhook = async () => {
    setTestingWebhook(true);
    await new Promise((r) => setTimeout(r, 1000));
    setTestingWebhook(false);
    toast({ title: "Webhook test sent", description: "Check your endpoint for the test payload." });
  };

  const handleDeleteMerchant = () => {
    reset();
    logout();
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your merchant configuration and API access
        </p>
      </div>

      <div className="space-y-6 max-w-2xl">
        {/* Merchant Profile */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h2 className="font-semibold mb-4">Merchant Profile</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground text-sm">Business Name</Label>
              <p className="font-medium">{merchant?.name}</p>
            </div>
            <div>
              <Label className="text-muted-foreground text-sm">Country</Label>
              <p className="font-medium">{merchant?.country}</p>
            </div>
            <div>
              <Label className="text-muted-foreground text-sm">Contact Email</Label>
              <p className="font-medium">{merchant?.email}</p>
            </div>
            <div>
              <Label className="text-muted-foreground text-sm">Merchant ID</Label>
              <p className="font-mono text-sm">{merchant?.id}</p>
            </div>
          </div>
        </div>

        {/* API Keys */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h2 className="font-semibold mb-4">API Keys</h2>
          <div className="space-y-4">
            <div>
              <Label className="text-muted-foreground text-sm">Test API Key</Label>
              <div className="flex items-center gap-2 mt-1">
                <code className="flex-1 p-3 bg-muted rounded-lg text-sm font-mono truncate">
                  {merchant?.apiKey}
                </code>
                <Button variant="outline" size="icon" onClick={copyApiKey}>
                  {copiedKey ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <Button variant="outline" onClick={handleRegenerateKey} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Regenerate Key
            </Button>
          </div>
        </div>

        {/* Webhooks */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h2 className="font-semibold mb-4">Webhooks</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="webhookUrl">Webhook URL</Label>
              <Input
                id="webhookUrl"
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://your-app.com/webhooks/klyr"
              />
            </div>

            {merchant?.webhookSecret && (
              <div>
                <Label className="text-muted-foreground text-sm">Webhook Secret</Label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="flex-1 p-3 bg-muted rounded-lg text-sm font-mono">
                    {merchant.webhookSecret}
                  </code>
                  <Button variant="outline" size="icon" onClick={copyWebhookSecret}>
                    {copiedSecret ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={handleSaveWebhook}>Save Webhook</Button>
              <Button
                variant="outline"
                onClick={handleTestWebhook}
                disabled={!merchant?.webhookUrl || testingWebhook}
                className="gap-2"
              >
                <Send className="h-4 w-4" />
                {testingWebhook ? "Sending..." : "Test Webhook"}
              </Button>
            </div>
          </div>
        </div>

        {/* Environment */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h2 className="font-semibold mb-4">Environment</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Use Mock Backend</p>
              <p className="text-sm text-muted-foreground">
                Toggle between mock and devnet environments
              </p>
            </div>
            <Switch checked={useMockBackend} onCheckedChange={setUseMockBackend} />
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-card rounded-lg border border-destructive/30 p-6">
          <h2 className="font-semibold mb-4 text-destructive">Danger Zone</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Delete Test Merchant</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete this sandbox merchant and all data
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="gap-2">
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete test merchant?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete your sandbox merchant, including all
                    transactions, balances, and settings. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteMerchant}>
                    Delete Merchant
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
