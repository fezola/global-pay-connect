import { ArrowDownLeft, ArrowUpRight, RefreshCw, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import type { Transaction } from "@/lib/mockData";

interface RecentActivityProps {
  transactions: Transaction[];
  onViewAll?: () => void;
  onSelect?: (tx: Transaction) => void;
  className?: string;
}

export function RecentActivity({ transactions, onViewAll, onSelect, className }: RecentActivityProps) {
  const getIcon = (type: string, status: string) => {
    if (status === "failed") return <AlertCircle className="h-4 w-4" />;
    if (type === "deposit") return <ArrowDownLeft className="h-4 w-4" />;
    if (type === "payout") return <ArrowUpRight className="h-4 w-4" />;
    return <RefreshCw className="h-4 w-4" />;
  };

  const getIconBg = (type: string, status: string) => {
    if (status === "failed") return "bg-destructive/10 text-destructive";
    if (type === "deposit") return "bg-success/10 text-success";
    if (type === "payout") return "bg-warning/10 text-warning";
    return "bg-primary/10 text-primary";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "settled_onchain":
      case "settled_offchain":
        return "text-success";
      case "pending":
        return "text-warning";
      case "failed":
        return "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className={cn("space-y-1", className)}>
      {transactions.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-sm text-muted-foreground">No recent activity</p>
        </div>
      ) : (
        transactions.slice(0, 6).map((tx) => (
          <button
            key={tx.id}
            onClick={() => onSelect?.(tx)}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors text-left"
          >
            <div className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
              getIconBg(tx.type, tx.status)
            )}>
              {getIcon(tx.type, tx.status)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium truncate">{tx.description}</p>
                <span className={cn(
                  "text-sm font-semibold tabular-nums",
                  tx.type === "payout" ? "text-foreground" : "text-success"
                )}>
                  {tx.type === "payout" ? "-" : "+"}${tx.amount}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 mt-0.5">
                <span className="text-xs text-muted-foreground font-mono truncate">
                  {tx.id}
                </span>
                <span className={cn("text-xs capitalize", getStatusColor(tx.status))}>
                  {tx.status.replace("_", " ")}
                </span>
              </div>
            </div>
          </button>
        ))
      )}
    </div>
  );
}
