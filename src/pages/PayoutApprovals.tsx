import { useState } from "react";
import { CheckCircle, XCircle, Clock, DollarSign, Wallet, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DashboardLayout } from "@/components/DashboardLayout";
import { EnvironmentModeSwitcher } from "@/components/EnvironmentModeSwitcher";
import { usePayouts } from "@/hooks/usePayouts";
import { formatCurrency } from "@/lib/utils";

export default function PayoutApprovals() {
  const { payouts, loading, approvePayout, rejectPayout } = usePayouts();
  const [selectedPayout, setSelectedPayout] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Filter payouts that require approval
  const pendingApprovals = payouts.filter(
    p => p.status === 'pending' && p.requires_approval
  );

  const handleApprove = async (payoutId: string) => {
    setProcessingId(payoutId);
    try {
      await approvePayout(payoutId);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (payoutId: string) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }
    
    setProcessingId(payoutId);
    try {
      await rejectPayout(payoutId, rejectionReason);
      setSelectedPayout(null);
      setRejectionReason('');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Payout Approvals</h1>
            <p className="text-muted-foreground mt-1">
              Review and approve large payout requests
            </p>
          </div>
          <EnvironmentModeSwitcher variant="compact" />
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-warning" />
              <span className="text-sm text-muted-foreground">Pending Approval</span>
            </div>
            <p className="text-2xl font-bold">{pendingApprovals.length}</p>
          </div>
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Total Amount</span>
            </div>
            <p className="text-2xl font-bold">
              {formatCurrency(
                pendingApprovals.reduce((sum, p) => sum + Number(p.amount), 0),
                'USDC'
              )}
            </p>
          </div>
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <span className="text-sm text-muted-foreground">Threshold</span>
            </div>
            <p className="text-2xl font-bold">$1,000</p>
          </div>
        </div>

        {/* Info Alert */}
        <Alert className="bg-primary/5 border-primary/20">
          <AlertCircle className="h-4 w-4 text-primary" />
          <AlertDescription>
            Payouts over $1,000 require manual approval. Review each request carefully before approving.
          </AlertDescription>
        </Alert>

        {/* Pending Approvals List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            <p className="text-muted-foreground mt-4">Loading approvals...</p>
          </div>
        ) : pendingApprovals.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-lg border">
            <CheckCircle className="h-12 w-12 mx-auto text-success mb-4" />
            <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
            <p className="text-muted-foreground">
              No pending payout approvals at the moment
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingApprovals.map((payout) => (
              <div
                key={payout.id}
                className="bg-card rounded-lg border p-6 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">
                        {formatCurrency(Number(payout.amount), payout.currency)}
                      </h3>
                      <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                        Requires Approval
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Requested {new Date(payout.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 mb-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Destination:</span>
                    <span className="font-mono">{payout.destination_address?.slice(0, 20)}...</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Chain:</span>
                    <span className="capitalize">{payout.chain}</span>
                  </div>
                </div>

                {selectedPayout === payout.id ? (
                  <div className="space-y-3 pt-3 border-t">
                    <div className="space-y-2">
                      <Label htmlFor={`reason-${payout.id}`}>Rejection Reason</Label>
                      <Textarea
                        id={`reason-${payout.id}`}
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Explain why this payout is being rejected..."
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="destructive"
                        onClick={() => handleReject(payout.id)}
                        disabled={processingId === payout.id || !rejectionReason.trim()}
                      >
                        Confirm Rejection
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedPayout(null);
                          setRejectionReason('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2 pt-3 border-t">
                    <Button
                      onClick={() => handleApprove(payout.id)}
                      disabled={processingId === payout.id}
                      className="flex-1"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve Payout
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedPayout(payout.id)}
                      disabled={processingId === payout.id}
                      className="flex-1"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

