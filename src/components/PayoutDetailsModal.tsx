import { useState } from "react";
import { X, ExternalLink, CheckCircle, XCircle, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { StatusBadge } from "@/components/StatusBadge";
import { Payout } from "@/hooks/usePayouts";
import { useEnvironmentMode } from "@/hooks/useEnvironmentMode";
import { format } from "date-fns";

interface PayoutDetailsModalProps {
  payout: Payout;
  onClose: () => void;
  onApprove?: (payoutId: string, notes?: string) => Promise<void>;
  onReject?: (payoutId: string, reason: string) => Promise<void>;
  onCancel?: (payoutId: string) => Promise<void>;
  canApprove?: boolean;
}

export function PayoutDetailsModal({
  payout,
  onClose,
  onApprove,
  onReject,
  onCancel,
  canApprove = false,
}: PayoutDetailsModalProps) {
  const { isTestMode } = useEnvironmentMode();
  const [showApproval, setShowApproval] = useState(false);
  const [showRejection, setShowRejection] = useState(false);
  const [notes, setNotes] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    if (!onApprove) return;
    setLoading(true);
    try {
      await onApprove(payout.id, notes);
      onClose();
    } catch (error) {
      console.error('Approval error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!onReject || !reason.trim()) return;
    setLoading(true);
    try {
      await onReject(payout.id, reason);
      onClose();
    } catch (error) {
      console.error('Rejection error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!onCancel) return;
    if (!confirm('Are you sure you want to cancel this payout?')) return;
    setLoading(true);
    try {
      await onCancel(payout.id);
      onClose();
    } catch (error) {
      console.error('Cancel error:', error);
    } finally {
      setLoading(false);
    }
  };

  const explorerUrl = payout.tx_signature
    ? `https://solscan.io/tx/${payout.tx_signature}${isTestMode ? '?cluster=devnet' : ''}`
    : null;

  return (
    <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-lg shadow-lg w-full max-w-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-card">
          <div>
            <h3 className="text-lg font-semibold">Payout Details</h3>
            <p className="text-sm text-muted-foreground font-mono">{payout.id}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status */}
          <div>
            <Label className="text-muted-foreground">Status</Label>
            <div className="mt-1">
              <StatusBadge status={payout.status} />
            </div>
          </div>

          {/* Amount Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Amount</Label>
              <p className="text-2xl font-bold mt-1">
                {payout.amount.toFixed(2)} {payout.currency}
              </p>
            </div>
            <div>
              <Label className="text-muted-foreground">Fee</Label>
              <p className="text-lg font-semibold mt-1">
                {payout.fee_amount.toFixed(2)} {payout.currency}
              </p>
            </div>
          </div>

          <div>
            <Label className="text-muted-foreground">Net Amount (You Receive)</Label>
            <p className="text-xl font-bold text-success mt-1">
              {payout.net_amount.toFixed(2)} {payout.currency}
            </p>
          </div>

          {/* Destination */}
          <div>
            <Label className="text-muted-foreground">Destination</Label>
            <p className="font-mono text-sm mt-1 break-all bg-muted/50 p-2 rounded">
              {payout.destination_address}
            </p>
            <p className="text-xs text-muted-foreground mt-1 capitalize">
              {payout.destination_type} • {payout.chain || 'Solana'}
            </p>
          </div>

          {/* Transaction */}
          {payout.tx_signature && (
            <div>
              <Label className="text-muted-foreground">Transaction</Label>
              <a
                href={explorerUrl!}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-primary hover:underline mt-1"
              >
                <span className="font-mono text-sm truncate">{payout.tx_signature}</span>
                <ExternalLink className="h-4 w-4 flex-shrink-0" />
              </a>
            </div>
          )}

          {/* Timestamps */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <Label className="text-muted-foreground">Created</Label>
              <p className="mt-1">{format(new Date(payout.created_at), 'PPp')}</p>
            </div>
            {payout.approved_at && (
              <div>
                <Label className="text-muted-foreground">Approved</Label>
                <p className="mt-1">{format(new Date(payout.approved_at), 'PPp')}</p>
              </div>
            )}
          </div>

          {/* Error Message */}
          {payout.error_message && (
            <Alert className="border-destructive/50 bg-destructive/5">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <AlertDescription className="text-sm">
                {payout.error_message}
              </AlertDescription>
            </Alert>
          )}

          {/* Approval Required Notice */}
          {payout.requires_approval && payout.status === 'pending' && (
            <Alert className="border-warning/50 bg-warning/5">
              <AlertCircle className="h-4 w-4 text-warning" />
              <AlertDescription className="text-sm">
                This payout requires manual approval (amount exceeds $1,000)
              </AlertDescription>
            </Alert>
          )}

          {/* Approval Interface */}
          {canApprove && payout.status === 'pending' && !showRejection && (
            <div className="space-y-3 border-t pt-4">
              {!showApproval ? (
                <div className="flex gap-2">
                  <Button
                    onClick={() => setShowApproval(true)}
                    className="flex-1"
                    disabled={loading}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve Payout
                  </Button>
                  <Button
                    onClick={() => setShowRejection(true)}
                    variant="destructive"
                    className="flex-1"
                    disabled={loading}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject Payout
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="approval-notes">Approval Notes (Optional)</Label>
                    <Textarea
                      id="approval-notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add any notes about this approval..."
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleApprove}
                      className="flex-1"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Approving...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Confirm Approval
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => setShowApproval(false)}
                      variant="outline"
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Rejection Interface */}
          {canApprove && payout.status === 'pending' && showRejection && (
            <div className="space-y-3 border-t pt-4">
              <div>
                <Label htmlFor="rejection-reason">Rejection Reason *</Label>
                <Textarea
                  id="rejection-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Explain why this payout is being rejected..."
                  rows={3}
                  className="border-destructive/50"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleReject}
                  variant="destructive"
                  className="flex-1"
                  disabled={!reason.trim() || loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Rejecting...
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 mr-2" />
                      Confirm Rejection
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => setShowRejection(false)}
                  variant="outline"
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Cancel Button for Pending/Approved Payouts */}
          {!canApprove && ['pending', 'approved'].includes(payout.status) && onCancel && (
            <div className="border-t pt-4">
              <Button
                onClick={handleCancel}
                variant="outline"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  'Cancel Payout'
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

