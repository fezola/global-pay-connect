import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusStyles: Record<string, string> = {
  pending: "bg-warning/10 text-warning border-warning/20",
  approved: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  settled_onchain: "bg-success/10 text-success border-success/20",
  settled_offchain: "bg-success/10 text-success border-success/20",
  processing: "bg-primary/10 text-primary border-primary/20",
  completed: "bg-success/10 text-success border-success/20",
  paid: "bg-success/10 text-success border-success/20",
  failed: "bg-destructive/10 text-destructive border-destructive/20",
  cancelled: "bg-muted text-muted-foreground border-border",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
  succeeded: "bg-success/10 text-success border-success/20",
  expired: "bg-muted text-muted-foreground border-border",
};

const statusLabels: Record<string, string> = {
  pending: "Pending",
  approved: "Approved",
  settled_onchain: "Settled (On-chain)",
  settled_offchain: "Settled (Off-chain)",
  processing: "Processing",
  completed: "Completed",
  paid: "Paid",
  failed: "Failed",
  cancelled: "Cancelled",
  rejected: "Rejected",
  succeeded: "Succeeded",
  expired: "Expired",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-xs font-medium rounded border",
        statusStyles[status] || "bg-muted text-muted-foreground border-border",
        className
      )}
    >
      {statusLabels[status] || status}
    </span>
  );
}
