import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { KlyrCheckout } from "@/components/KlyrCheckout";
import { PayoutForm } from "@/components/PayoutForm";
import { TransactionDetail } from "@/components/TransactionDetail";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { BalanceChart } from "@/components/dashboard/BalanceChart";
import { VolumeChart } from "@/components/dashboard/VolumeChart";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { CurrencyBalance } from "@/components/dashboard/CurrencyBalance";
import { ApiKeyCard } from "@/components/dashboard/ApiKeyCard";
import { WebhookStatus } from "@/components/dashboard/WebhookStatus";
import { Button } from "@/components/ui/button";
import { useMerchant } from "@/hooks/useMerchant";
import { useTransactions, type Transaction as DbTransaction } from "@/hooks/useTransactions";
import { useBalances } from "@/hooks/useBalances";
import { useRealtimeKYB } from "@/hooks/useRealtimeKYB";
import { useProfile } from "@/hooks/useProfile";
import { 
  Wallet, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Activity, 
  TrendingUp,
  ExternalLink,
  Bell,
  ChevronRight,
  Loader2
} from "lucide-react";
import type { Transaction } from "@/lib/mockData";

export default function Dashboard() {
  // Enable real-time KYB status updates
  useRealtimeKYB();
  
  const { merchant } = useMerchant();
  const { profile } = useProfile();
  const { transactions: dbTransactions, loading: txLoading } = useTransactions();
  const { balances: dbBalances, formatBalance, loading: balLoading } = useBalances();
  
  const [showCheckout, setShowCheckout] = useState(false);
  const [showPayout, setShowPayout] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [activeCurrency, setActiveCurrency] = useState("USDC");

  // Transform DB transactions to match the existing Transaction type
  const transactions: Transaction[] = dbTransactions.map((tx: DbTransaction) => ({
    id: tx.id,
    status: tx.status,
    type: tx.type,
    amount: tx.amount.toString(),
    currency: tx.currency,
    description: tx.description || '',
    createdAt: tx.created_at,
    updatedAt: tx.updated_at,
    txHash: tx.tx_hash || undefined,
    auditLogs: []
  }));

  // Transform DB balances to match display format
  const balances = dbBalances.map(formatBalance);

  const recentTransactions = transactions.slice(0, 10);
  const usdcBalance = dbBalances.find((b) => b.currency === "USDC");
  const maxPayout = usdcBalance ? usdcBalance.total : 0;

  // Calculate stats
  const totalBalance = dbBalances.reduce((sum, b) => sum + b.total, 0);
  const settledCount = transactions.filter(t => t.status.startsWith("settled")).length;
  const pendingCount = transactions.filter(t => t.status === "pending").length;
  const successRate = transactions.length > 0 
    ? Math.round((settledCount / transactions.length) * 100) 
    : 0;

  const loading = txLoading || balLoading;

  const handleRegenerateApiKey = () => {
    // This would call the API to regenerate the key
    console.log("Regenerate API key");
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
              Sandbox
            </span>
          </div>
          <p className="text-muted-foreground">
            Welcome back, {profile?.full_name || merchant?.name || "Developer"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </Button>
          <Button onClick={() => setShowCheckout(true)} className="gap-2">
            <ArrowDownLeft className="h-4 w-4" />
            Receive Test USDC
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Total Balance"
          value={loading ? "..." : `$${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          change={12.5}
          trend="up"
          icon={<Wallet className="h-5 w-5" />}
        />
        <StatsCard
          title="Monthly Volume"
          value="$12,450"
          change={8.2}
          trend="up"
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <StatsCard
          title="Transactions"
          value={loading ? "..." : transactions.length.toString()}
          change={-2.4}
          trend="down"
          icon={<Activity className="h-5 w-5" />}
        />
        <StatsCard
          title="Success Rate"
          value={loading ? "..." : `${successRate}%`}
          change={1.2}
          trend="up"
          icon={<ArrowUpRight className="h-5 w-5" />}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Content - Left 2 columns */}
        <div className="xl:col-span-2 space-y-6">
          {/* Quick Actions */}
          <QuickActions 
            onReceive={() => setShowCheckout(true)} 
            onPayout={() => setShowPayout(true)} 
          />

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Balance Over Time */}
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold">Balance History</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Last 30 days</p>
                </div>
                <Button variant="ghost" size="sm" className="text-xs gap-1">
                  View Report
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
              <BalanceChart />
            </div>

            {/* Transaction Volume */}
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold">Transaction Volume</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">This week</p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    Deposits
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-muted-foreground" />
                    Payouts
                  </span>
                </div>
              </div>
              <VolumeChart />
            </div>
          </div>

          {/* Recent Activity */}
          <div className="rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div>
                <h3 className="font-semibold">Recent Activity</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {pendingCount} pending, {settledCount} settled
                </p>
              </div>
              <Button variant="ghost" size="sm" className="text-xs gap-1" asChild>
                <a href="/transactions">
                  View All
                  <ChevronRight className="h-3 w-3" />
                </a>
              </Button>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <RecentActivity 
                transactions={recentTransactions} 
                onSelect={(tx) => setSelectedTx(tx)}
              />
            )}
          </div>
        </div>

        {/* Sidebar - Right column */}
        <div className="space-y-6">
          {/* Currency Balances */}
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Balances</h3>
              <Button variant="ghost" size="sm" className="text-xs">
                Add Currency
              </Button>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-3">
                {balances.map((balance) => (
                  <CurrencyBalance
                    key={balance.currency}
                    balance={balance}
                    isActive={balance.currency === activeCurrency}
                    onClick={() => setActiveCurrency(balance.currency)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* API Key */}
          <ApiKeyCard 
            apiKey={merchant?.apiKey || ""} 
            onRegenerate={handleRegenerateApiKey}
          />

          {/* Webhook Status */}
          <WebhookStatus 
            url={merchant?.webhookUrl || undefined}
            status={merchant?.webhookUrl ? "active" : "inactive"}
            lastPing="2 minutes ago"
          />

          {/* Quick Links */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-semibold mb-3">Quick Links</h3>
            <div className="space-y-2">
              {[
                { label: "API Documentation", href: "/dev" },
                { label: "Checkout Widget", href: "/dev#widget" },
                { label: "Webhook Events", href: "/settings" },
                { label: "Test Cards", href: "/help" },
              ].map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted/50 transition-colors group"
                >
                  <span className="text-sm">{link.label}</span>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </a>
              ))}
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
