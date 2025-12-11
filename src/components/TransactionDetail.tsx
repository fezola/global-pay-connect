import { X, ExternalLink, RotateCcw, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import type { Transaction } from "@/lib/mockData";
import { format } from "date-fns";

interface TransactionDetailProps {
  transaction: Transaction;
  onClose: () => void;
}

export function TransactionDetail({ transaction, onClose }: TransactionDetailProps) {
  return (
    <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-lg shadow-lg w-full max-w-lg animate-fade-in max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-card">
          <h3 className="text-lg font-semibold">Transaction Details</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <StatusBadge status={transaction.status} />
            <span className="text-sm text-muted-foreground">
              {format(new Date(transaction.createdAt), "MMM d, yyyy h:mm a")}
            </span>
          </div>

          {/* Amount */}
          <div className="text-center py-4">
            <div className="text-3xl font-semibold">
              {transaction.type === 'payout' ? '-' : '+'}{transaction.amount} {transaction.currency}
            </div>
            <div className="text-sm text-muted-foreground mt-1">{transaction.description}</div>
          </div>

          {/* Details */}
          <div className="space-y-3 bg-muted/30 rounded-lg p-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Transaction ID</span>
              <code className="font-mono text-xs">{transaction.id}</code>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Type</span>
              <span className="capitalize">{transaction.type}</span>
            </div>
            {transaction.txHash && (
              <div className="flex justify-between text-sm items-center">
                <span className="text-muted-foreground">On-chain TX</span>
                <a
                  href={`https://solscan.io/tx/${transaction.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-primary hover:underline font-mono text-xs"
                >
                  {transaction.txHash.substring(0, 10)}...
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
          </div>

          {/* Audit Logs */}
          <div>
            <h4 className="text-sm font-medium mb-3">Audit Log</h4>
            <div className="space-y-3">
              {transaction.auditLogs.map((log, i) => (
                <div key={i} className="flex gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium capitalize">{log.event.replace(/_/g, ' ')}</span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(log.timestamp), "h:mm:ss a")}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-xs mt-0.5">{log.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          {transaction.status === 'failed' && (
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1 gap-2">
                <RotateCcw className="h-4 w-4" />
                Retry
              </Button>
              <Button variant="outline" className="flex-1 gap-2">
                <Flag className="h-4 w-4" />
                Dispute
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
