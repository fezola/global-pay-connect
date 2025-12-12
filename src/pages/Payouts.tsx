import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PayoutForm } from "@/components/PayoutForm";
import { PayoutDetailsModal } from "@/components/PayoutDetailsModal";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { usePayouts, Payout } from "@/hooks/usePayouts";
import { useBalances } from "@/hooks/useBalances";
import { useMerchant } from "@/hooks/useMerchant";
import { ArrowUpRight, Wallet, Loader2, ExternalLink, Eye } from "lucide-react";
import { format } from "date-fns";
import { EnvironmentModeSwitcher } from "@/components/EnvironmentModeSwitcher";
import { useEnvironmentMode } from "@/hooks/useEnvironmentMode";

export default function Payouts() {
  const { payouts, loading: payoutsLoading, approvePayout, rejectPayout, cancelPayout } = usePayouts();
  const { balances, formatBalance, loading: balancesLoading } = useBalances();
  const { merchant } = useMerchant();
  const [showPayoutForm, setShowPayoutForm] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);
  const { isTestMode } = useEnvironmentMode();

  // Check if user can approve payouts (admin/owner role)
  const canApprove = merchant?.role === 'owner' || merchant?.role === 'admin';

  const usdcBalance = balances.find((b) => b.currency === "USDC");
  const formattedBalance = usdcBalance ? formatBalance(usdcBalance) : null;
  const maxPayout = usdcBalance ? usdcBalance.total : 0;

  const loading = payoutsLoading || balancesLoading;

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Payouts</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Manage withdrawals and payout history
            </p>
          </div>
          <div className="flex items-center gap-3">
            <EnvironmentModeSwitcher variant="compact" showWarning={false} />
            <Button onClick={() => setShowPayoutForm(true)} className="gap-2">
              <ArrowUpRight className="h-4 w-4" />
              Request Payout
            </Button>
          </div>
        </div>
      </div>

      {/* Available Balance */}
      <div className="bg-card rounded-lg border border-border p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Available for payout</p>
            <p className="text-3xl font-semibold mt-1">
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                `${formattedBalance?.total || "0.00"} USDC`
              )}
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Wallet className="h-6 w-6 text-primary" />
          </div>
        </div>
      </div>

      {/* Payout History */}
      <div className="bg-card rounded-lg border border-border">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold">Payout History</h2>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : payouts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-sm text-muted-foreground">
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Amount</th>
                  <th className="text-left p-4 font-medium">Destination</th>
                  <th className="text-left p-4 font-medium">Fee</th>
                  <th className="text-left p-4 font-medium">Date</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {payouts.map((payout) => (
                  <tr key={payout.id} className="hover:bg-muted/50 transition-colors">
                    <td className="p-4">
                      <StatusBadge status={payout.status} />
                    </td>
                    <td className="p-4 font-medium">
                      {payout.amount} {payout.currency}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-mono text-sm truncate max-w-[200px]">
                            {payout.destination_address || payout.destination}
                          </p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {payout.destination_type}
                          </p>
                        </div>
                        {payout.tx_signature && (
                          <a
                            href={`https://solscan.io/tx/${payout.tx_signature}${isTestMode ? '?cluster=devnet' : ''}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary/80"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {payout.fee_amount || payout.fee} {payout.currency}
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {format(new Date(payout.created_at), "MMM d, yyyy")}
                    </td>
                    <td className="p-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedPayout(payout)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={<Wallet className="h-6 w-6" />}
            title="No payouts yet"
            description="Request your first payout when you have available balance."
            actionLabel="Request Payout"
            onAction={() => setShowPayoutForm(true)}
          />
        )}
      </div>

      {/* Payout Form Modal */}
      {showPayoutForm && (
        <PayoutForm onClose={() => setShowPayoutForm(false)} maxBalance={maxPayout} />
      )}

      {/* Payout Details Modal */}
      {selectedPayout && (
        <PayoutDetailsModal
          payout={selectedPayout}
          onClose={() => setSelectedPayout(null)}
          onApprove={approvePayout}
          onReject={rejectPayout}
          onCancel={cancelPayout}
          canApprove={canApprove}
        />
      )}
    </DashboardLayout>
  );
}
