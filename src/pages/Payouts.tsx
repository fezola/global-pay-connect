import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PayoutForm } from "@/components/PayoutForm";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import { ArrowUpRight, Wallet } from "lucide-react";
import { format } from "date-fns";

export default function Payouts() {
  const { payouts, balances } = useAppStore();
  const [showPayoutForm, setShowPayoutForm] = useState(false);

  const usdcBalance = balances.find((b) => b.currency === "USDC");
  const maxPayout = usdcBalance ? parseFloat(usdcBalance.total.replace(",", "")) : 0;

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Payouts</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage withdrawals and payout history
          </p>
        </div>
        <Button onClick={() => setShowPayoutForm(true)} className="gap-2">
          <ArrowUpRight className="h-4 w-4" />
          Request Payout
        </Button>
      </div>

      {/* Available Balance */}
      <div className="bg-card rounded-lg border border-border p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Available for payout</p>
            <p className="text-3xl font-semibold mt-1">{usdcBalance?.total || "0.00"} USDC</p>
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
        {payouts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-sm text-muted-foreground">
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Amount</th>
                  <th className="text-left p-4 font-medium">Destination</th>
                  <th className="text-left p-4 font-medium">Fee</th>
                  <th className="text-left p-4 font-medium">Date</th>
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
                      <div>
                        <p className="font-mono text-sm truncate max-w-[200px]">
                          {payout.destination}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {payout.destinationType}
                        </p>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {payout.fee} {payout.currency}
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {format(new Date(payout.createdAt), "MMM d, yyyy")}
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
    </DashboardLayout>
  );
}
