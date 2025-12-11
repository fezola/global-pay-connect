import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { BalanceCard } from "@/components/BalanceCard";
import { TransactionRow } from "@/components/TransactionRow";
import { KlyrCheckout } from "@/components/KlyrCheckout";
import { PayoutForm } from "@/components/PayoutForm";
import { TransactionDetail } from "@/components/TransactionDetail";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import { ArrowDownLeft, ArrowUpRight, Key, Copy, Check, Inbox } from "lucide-react";
import type { Transaction } from "@/lib/mockData";

export default function Dashboard() {
  const { merchant, balances, transactions } = useAppStore();
  const [showCheckout, setShowCheckout] = useState(false);
  const [showPayout, setShowPayout] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  const recentTransactions = transactions.slice(0, 10);
  const usdcBalance = balances.find((b) => b.currency === "USDC");
  const maxPayout = usdcBalance ? parseFloat(usdcBalance.total.replace(",", "")) : 0;

  const copyApiKey = () => {
    if (merchant?.apiKey) {
      navigator.clipboard.writeText(merchant.apiKey);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold">Overview</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {merchant?.name} - Sandbox Environment
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowCheckout(true)} className="gap-2">
            <ArrowDownLeft className="h-4 w-4" />
            Receive Test USDC
          </Button>
          <Button variant="outline" onClick={() => setShowPayout(true)} className="gap-2">
            <ArrowUpRight className="h-4 w-4" />
            Request Payout
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Balance Cards */}
          <div className="flex gap-4 overflow-x-auto pb-2">
            {balances.map((balance) => (
              <BalanceCard
                key={balance.currency}
                {...balance}
                onReceive={() => setShowCheckout(true)}
              />
            ))}
          </div>

          {/* Transactions */}
          <div className="bg-card rounded-lg border border-border">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h2 className="font-semibold">Recent Transactions</h2>
              <Button variant="ghost" size="sm" asChild>
                <a href="/transactions">View all</a>
              </Button>
            </div>
            <div className="divide-y divide-border">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((tx) => (
                  <TransactionRow
                    key={tx.id}
                    transaction={tx}
                    onClick={() => setSelectedTx(tx)}
                  />
                ))
              ) : (
                <EmptyState
                  icon={<Inbox className="h-6 w-6" />}
                  title="No activity yet"
                  description="Try 'Receive Test USDC' to seed your account."
                  actionLabel="Receive Test USDC"
                  onAction={() => setShowCheckout(true)}
                />
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Settings */}
          <div className="bg-card rounded-lg border border-border p-4">
            <h3 className="font-semibold mb-4">Quick Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">API Key</label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="flex-1 p-2 bg-muted rounded text-xs font-mono truncate">
                    {merchant?.apiKey.substring(0, 20)}...
                  </code>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={copyApiKey}>
                    {copiedKey ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Webhook URL</label>
                <p className="text-sm mt-1 font-mono truncate">
                  {merchant?.webhookUrl || "Not configured"}
                </p>
              </div>
              <Button variant="outline" size="sm" className="w-full gap-2" asChild>
                <a href="/settings">
                  <Key className="h-4 w-4" />
                  Manage Settings
                </a>
              </Button>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="bg-card rounded-lg border border-border p-4">
            <h3 className="font-semibold mb-4">Activity</h3>
            <div className="space-y-3 text-sm">
              {recentTransactions.slice(0, 5).map((tx) => (
                <div key={tx.id} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                  <div>
                    <p className="text-foreground">{tx.description}</p>
                    <p className="text-xs text-muted-foreground font-mono">{tx.id}</p>
                  </div>
                </div>
              ))}
              {recentTransactions.length === 0 && (
                <p className="text-muted-foreground">No recent activity</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showCheckout && <KlyrCheckout onClose={() => setShowCheckout(false)} />}
      {showPayout && <PayoutForm onClose={() => setShowPayout(false)} maxBalance={maxPayout} />}
      {selectedTx && (
        <TransactionDetail transaction={selectedTx} onClose={() => setSelectedTx(null)} />
      )}
    </DashboardLayout>
  );
}
