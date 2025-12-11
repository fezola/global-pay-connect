import { CheckCircle, XCircle, AlertCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface WebhookStatusProps {
  url?: string;
  status?: "active" | "failing" | "inactive";
  lastPing?: string;
  className?: string;
}

export function WebhookStatus({ 
  url, 
  status = "inactive", 
  lastPing,
  className 
}: WebhookStatusProps) {
  const getStatusIcon = () => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "failing":
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case "active":
        return "Active";
      case "failing":
        return "Failing";
      default:
        return "Not configured";
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "active":
        return "bg-success/10 text-success";
      case "failing":
        return "bg-destructive/10 text-destructive";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className={cn("p-4 rounded-xl border border-border bg-card", className)}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold">Webhooks</h4>
        <span className={cn("flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded", getStatusColor())}>
          {getStatusIcon()}
          {getStatusLabel()}
        </span>
      </div>

      {url ? (
        <div className="space-y-2">
          <code className="block p-2.5 bg-muted rounded-lg text-xs font-mono truncate">
            {url}
          </code>
          {lastPing && (
            <p className="text-xs text-muted-foreground">
              Last ping: {lastPing}
            </p>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground mb-3">
          Configure webhooks to receive real-time payment notifications.
        </p>
      )}

      <Button variant="outline" size="sm" className="w-full mt-3 gap-1.5 text-xs" asChild>
        <a href="/settings">
          <ExternalLink className="h-3 w-3" />
          {url ? "Manage Webhooks" : "Configure Webhooks"}
        </a>
      </Button>
    </div>
  );
}
