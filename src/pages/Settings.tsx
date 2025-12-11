import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { 
  Copy, 
  Check, 
  RefreshCw, 
  Send, 
  Trash2, 
  Zap, 
  Shield, 
  Building2, 
  Wallet, 
  Link2,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Eye,
  EyeOff,
} from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

export default function Settings() {
  const { 
    merchant, 
    business,
    businessWallets,
    integrations,
    useMockBackend, 
    setUseMockBackend, 
    regenerateApiKey, 
    updateWebhook, 
    reset, 
    logout,
    canEnableProduction,
    enableProduction,
  } = useAppStore();
  const { toast } = useToast();

  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedLiveKey, setCopiedLiveKey] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState(merchant?.webhookUrl || "");
  const [testingWebhook, setTestingWebhook] = useState(false);
  const [showEnableModal, setShowEnableModal] = useState(false);
  const [showLiveKey, setShowLiveKey] = useState(false);

  const { canEnable, reasons } = canEnableProduction();

  const productionChecklist = [
    {
      id: 'kyb',
      label: 'KYB Verified',
      description: 'Complete business registration and verification',
      done: business?.status === 'verified',
      link: '/business',
      icon: Building2,
    },
    {
      id: 'wallet',
      label: 'Wallet Verified',
      description: 'Prove control of your settlement wallet',
      done: businessWallets.some(w => w.proofVerified),
      link: '/business',
      icon: Wallet,
    },
    {
      id: '2fa',
      label: '2FA Enabled',
      description: 'Enable two-factor authentication for admin actions',
      done: merchant?.twoFactorEnabled || false,
      link: '/security',
      icon: Shield,
    },
    {
      id: 'integration',
      label: 'Bank or Custodian Connected',
      description: 'Connect at least one banking partner or custodian',
      done: integrations.some(i => (i.type === 'bank' || i.type === 'custodian') && i.isConnected),
      link: '/integrations',
      icon: Link2,
    },
  ];

  const completedItems = productionChecklist.filter(item => item.done).length;
  const totalItems = productionChecklist.length;

  const copyApiKey = () => {
    if (merchant?.apiKey) {
      navigator.clipboard.writeText(merchant.apiKey);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  const copyLiveKey = () => {
    if (merchant?.apiKeyLive) {
      navigator.clipboard.writeText(merchant.apiKeyLive);
      setCopiedLiveKey(true);
      setTimeout(() => setCopiedLiveKey(false), 2000);
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
    regenerateApiKey();
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

  const handleEnableProduction = () => {
    const success = enableProduction();
    if (success) {
      setShowEnableModal(false);
      toast({ 
        title: "Production Enabled!", 
        description: "Your live API key has been generated. You can now process real payments." 
      });
    } else {
      toast({ 
        title: "Cannot enable production", 
        description: "Please complete all requirements first.",
        variant: "destructive"
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your merchant configuration and API access
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Production Toggle Card */}
          <div className={cn(
            "bg-card rounded-lg border p-6",
            merchant?.productionEnabled 
              ? "border-success/30 bg-success/5" 
              : "border-warning/30 bg-warning/5"
          )}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center",
                  merchant?.productionEnabled ? "bg-success/10" : "bg-warning/10"
                )}>
                  <Zap className={cn(
                    "h-6 w-6",
                    merchant?.productionEnabled ? "text-success" : "text-warning"
                  )} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Environment</h2>
                  <p className="text-sm text-muted-foreground">
                    {merchant?.productionEnabled 
                      ? "You're processing live payments" 
                      : "Enable production to process real payments"}
                  </p>
                </div>
              </div>
              <Badge className={cn(
                merchant?.productionEnabled 
                  ? "bg-success text-success-foreground" 
                  : "bg-warning text-warning-foreground"
              )}>
                {merchant?.productionEnabled ? "Production" : "Sandbox"}
              </Badge>
            </div>

            {!merchant?.productionEnabled && (
              <>
                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Completion</span>
                    <span className="font-medium">{completedItems} / {totalItems}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all",
                        completedItems === totalItems ? "bg-success" : "bg-warning"
                      )}
                      style={{ width: `${(completedItems / totalItems) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Checklist */}
                <div className="space-y-3 mb-4">
                  {productionChecklist.map((item) => (
                    <div 
                      key={item.id}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg border transition-colors",
                        item.done 
                          ? "bg-success/5 border-success/20" 
                          : "bg-card border-border hover:border-primary/30"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center",
                          item.done ? "bg-success/10" : "bg-muted"
                        )}>
                          {item.done ? (
                            <CheckCircle2 className="h-4 w-4 text-success" />
                          ) : (
                            <item.icon className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <p className={cn(
                            "font-medium text-sm",
                            item.done ? "text-foreground" : "text-muted-foreground"
                          )}>
                            {item.label}
                          </p>
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                        </div>
                      </div>
                      {!item.done && (
                        <Button asChild variant="ghost" size="sm" className="gap-1">
                          <Link to={item.link}>
                            Complete
                            <ArrowRight className="h-3 w-3" />
                          </Link>
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Enable/Status Button */}
            {merchant?.productionEnabled ? (
              <div className="flex items-center gap-2 p-3 bg-success/10 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-success" />
                <span className="text-sm font-medium text-success">
                  Production mode is active. Live API keys are available below.
                </span>
              </div>
            ) : (
              <Button 
                className="w-full gap-2" 
                size="lg"
                disabled={!canEnable}
                onClick={() => setShowEnableModal(true)}
              >
                <Zap className="h-4 w-4" />
                {canEnable ? "Enable Production" : `Complete ${totalItems - completedItems} more items`}
              </Button>
            )}
          </div>

          {/* API Keys */}
          <div className="bg-card rounded-lg border border-border p-6">
            <h2 className="font-semibold mb-4">API Keys</h2>
            <div className="space-y-4">
              {/* Sandbox Key */}
              <div>
                <Label className="text-muted-foreground text-sm flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">Sandbox</Badge>
                  Test API Key
                </Label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="flex-1 p-3 bg-muted rounded-lg text-sm font-mono truncate">
                    {merchant?.apiKey}
                  </code>
                  <Button variant="outline" size="icon" onClick={copyApiKey}>
                    {copiedKey ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* Live Key (only if production enabled) */}
              {merchant?.productionEnabled && merchant?.apiKeyLive && (
                <div>
                  <Label className="text-muted-foreground text-sm flex items-center gap-2">
                    <Badge className="text-xs bg-success text-success-foreground">Live</Badge>
                    Production API Key
                  </Label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="flex-1 p-3 bg-success/10 border border-success/20 rounded-lg text-sm font-mono truncate">
                      {showLiveKey ? merchant.apiKeyLive : '•'.repeat(40)}
                    </code>
                    <Button variant="outline" size="icon" onClick={() => setShowLiveKey(!showLiveKey)}>
                      {showLiveKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button variant="outline" size="icon" onClick={copyLiveKey}>
                      {copiedLiveKey ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-warning mt-2 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Live keys process real payments. Keep this key secure!
                  </p>
                </div>
              )}

              <Button variant="outline" onClick={handleRegenerateKey} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Regenerate Test Key
              </Button>
            </div>
          </div>

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

          {/* Mock Backend Toggle */}
          <div className="bg-card rounded-lg border border-border p-6">
            <h2 className="font-semibold mb-4">Development</h2>
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

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Quick Status */}
          <div className="bg-card rounded-lg border border-border p-4">
            <h3 className="font-medium mb-3">Account Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Environment</span>
                <Badge variant="outline" className={cn(
                  merchant?.productionEnabled 
                    ? "border-success text-success" 
                    : "border-warning text-warning"
                )}>
                  {merchant?.productionEnabled ? "Production" : "Sandbox"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">KYB Status</span>
                <Badge variant="outline">
                  {merchant?.kybStatus || 'pending'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">2FA</span>
                <Badge variant="outline" className={cn(
                  merchant?.twoFactorEnabled 
                    ? "border-success text-success" 
                    : ""
                )}>
                  {merchant?.twoFactorEnabled ? "Enabled" : "Disabled"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Help */}
          <div className="bg-primary/5 rounded-lg border border-primary/20 p-4">
            <h3 className="font-medium mb-2">Need to go live?</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Complete the production checklist to enable live payments and generate production API keys.
            </p>
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link to="/business">Start Registration</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Enable Production Modal */}
      <Dialog open={showEnableModal} onOpenChange={setShowEnableModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-warning" />
              Enable Production
            </DialogTitle>
            <DialogDescription>
              You're about to enable production mode. This will allow you to process real payments.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="p-4 bg-warning/10 rounded-lg border border-warning/20 mb-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
                <div>
                  <p className="font-medium text-warning">Important</p>
                  <p className="text-sm text-muted-foreground">
                    Once enabled, live API keys can move real funds. Ensure your compliance documents are valid and your integration is properly tested.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {productionChecklist.map((item) => (
                <div key={item.id} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEnableModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleEnableProduction} className="gap-2">
              <Zap className="h-4 w-4" />
              Enable Production
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
