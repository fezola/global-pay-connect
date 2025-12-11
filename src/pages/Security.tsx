import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { 
  Shield,
  Key,
  Activity,
  Globe,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Smartphone,
  Eye,
  RefreshCw,
  Plus,
  Trash2,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const mockActivityLogs = [
  { id: 1, action: 'API key created', user: 'admin@acme.com', ip: '192.168.1.1', timestamp: '2024-01-15 14:32:00' },
  { id: 2, action: 'Webhook configured', user: 'admin@acme.com', ip: '192.168.1.1', timestamp: '2024-01-15 14:28:00' },
  { id: 3, action: 'Team member invited', user: 'admin@acme.com', ip: '192.168.1.1', timestamp: '2024-01-15 13:45:00' },
  { id: 4, action: 'Payout initiated', user: 'finance@acme.com', ip: '192.168.1.2', timestamp: '2024-01-15 12:00:00' },
  { id: 5, action: 'Login successful', user: 'admin@acme.com', ip: '192.168.1.1', timestamp: '2024-01-15 10:30:00' },
];

const mockApiKeys = [
  { id: 'key_1', name: 'Production Key', last4: '...7d3f', type: 'live', lastUsed: '2 mins ago', active: true },
  { id: 'key_2', name: 'Development Key', last4: '...a9b2', type: 'sandbox', lastUsed: '1 hour ago', active: true },
  { id: 'key_3', name: 'Legacy Key', last4: '...c4e1', type: 'sandbox', lastUsed: '30 days ago', active: false },
];

export default function Security() {
  const { merchant } = useAppStore();
  const { toast } = useToast();
  
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(merchant?.twoFactorEnabled || false);
  const [ipAllowlist, setIpAllowlist] = useState<string[]>([]);
  const [newIp, setNewIp] = useState('');

  const handleToggle2FA = (enabled: boolean) => {
    setTwoFactorEnabled(enabled);
    toast({ 
      title: enabled ? "2FA Enabled" : "2FA Disabled", 
      description: enabled ? "Two-factor authentication is now active" : "Two-factor authentication has been disabled"
    });
  };

  const handleAddIp = () => {
    if (!newIp) return;
    setIpAllowlist([...ipAllowlist, newIp]);
    setNewIp('');
    toast({ title: "IP added", description: `${newIp} added to allowlist` });
  };

  const handleRemoveIp = (ip: string) => {
    setIpAllowlist(ipAllowlist.filter(i => i !== ip));
    toast({ title: "IP removed", description: `${ip} removed from allowlist` });
  };

  const handleRotateKey = (keyId: string) => {
    toast({ title: "Key rotated", description: "New API key has been generated" });
  };

  const handleRevokeKey = (keyId: string) => {
    toast({ title: "Key revoked", description: "API key has been deactivated" });
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Security & Logs</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Security settings, API keys, and activity monitoring
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Security Settings */}
          <div className="bg-card rounded-lg border border-border p-6">
            <h2 className="font-semibold mb-4">Security Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground">
                      Require 2FA for admin actions
                    </p>
                  </div>
                </div>
                <Switch checked={twoFactorEnabled} onCheckedChange={handleToggle2FA} />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Session Timeout</p>
                    <p className="text-sm text-muted-foreground">
                      Auto-logout after 30 minutes of inactivity
                    </p>
                  </div>
                </div>
                <Badge variant="outline">30 min</Badge>
              </div>
            </div>
          </div>

          {/* API Keys */}
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">API Keys</h2>
              <Button variant="outline" size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Create Key
              </Button>
            </div>
            <div className="space-y-3">
              {mockApiKeys.map((key) => (
                <div key={key.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <Key className={cn(
                      "h-5 w-5",
                      key.active ? "text-success" : "text-muted-foreground"
                    )} />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{key.name}</p>
                        <Badge variant="outline" className="text-xs">
                          {key.type}
                        </Badge>
                        {!key.active && (
                          <Badge variant="secondary" className="text-xs">
                            Inactive
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground font-mono">
                        sk_{key.type === 'live' ? 'live' : 'test'}_klyr_{key.last4}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      Last used: {key.lastUsed}
                    </span>
                    <Button variant="ghost" size="sm" onClick={() => handleRotateKey(key.id)}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleRevokeKey(key.id)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Logs */}
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Activity Logs</h2>
              <Button variant="ghost" size="sm">View All</Button>
            </div>
            <div className="space-y-3">
              {mockActivityLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
                  <Activity className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{log.action}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{log.user}</span>
                      <span>•</span>
                      <span>{log.ip}</span>
                      <span>•</span>
                      <span>{log.timestamp}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Security Score */}
          <div className="bg-card rounded-lg border border-border p-4">
            <h3 className="font-medium mb-3">Security Score</h3>
            <div className="text-center py-4">
              <div className={cn(
                "w-20 h-20 rounded-full mx-auto flex items-center justify-center text-2xl font-bold",
                twoFactorEnabled ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
              )}>
                {twoFactorEnabled ? 'A' : 'B'}
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                {twoFactorEnabled 
                  ? "Excellent! Your account is well protected."
                  : "Good, but enable 2FA for better security."}
              </p>
            </div>
            <div className="space-y-2 mt-4">
              {[
                { label: '2FA Enabled', done: twoFactorEnabled },
                { label: 'Strong Password', done: true },
                { label: 'Session Timeout', done: true },
                { label: 'IP Allowlist', done: ipAllowlist.length > 0 },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  {item.done ? (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-warning" />
                  )}
                  <span className={item.done ? 'text-foreground' : 'text-muted-foreground'}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* IP Allowlist */}
          <div className="bg-card rounded-lg border border-border p-4">
            <h3 className="font-medium mb-3">IP Allowlist</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Restrict API access to specific IP addresses
            </p>
            <div className="flex gap-2 mb-3">
              <Input
                placeholder="192.168.1.1"
                value={newIp}
                onChange={(e) => setNewIp(e.target.value)}
                className="flex-1"
              />
              <Button size="icon" onClick={handleAddIp}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {ipAllowlist.length > 0 ? (
              <div className="space-y-2">
                {ipAllowlist.map((ip, idx) => (
                  <div key={idx} className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-mono">{ip}</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleRemoveIp(ip)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-2">
                No IPs configured — all IPs allowed
              </p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-card rounded-lg border border-border p-4">
            <h3 className="font-medium mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Shield className="h-4 w-4" />
                Download Audit Log
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <RefreshCw className="h-4 w-4" />
                Rotate All Keys
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2 text-destructive">
                <Lock className="h-4 w-4" />
                Lock Account
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
