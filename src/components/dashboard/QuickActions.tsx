import { ArrowDownLeft, ArrowUpRight, RefreshCw, Settings, Code, Webhook } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  variant?: "default" | "outline" | "secondary";
  onClick: () => void;
}

interface QuickActionsProps {
  onReceive: () => void;
  onPayout: () => void;
  className?: string;
}

export function QuickActions({ onReceive, onPayout, className }: QuickActionsProps) {
  const actions: QuickAction[] = [
    {
      id: "receive",
      label: "Receive",
      description: "Get test USDC",
      icon: <ArrowDownLeft className="h-5 w-5" />,
      variant: "default",
      onClick: onReceive,
    },
    {
      id: "payout",
      label: "Payout",
      description: "Request withdrawal",
      icon: <ArrowUpRight className="h-5 w-5" />,
      variant: "outline",
      onClick: onPayout,
    },
    {
      id: "convert",
      label: "Convert",
      description: "Swap currencies",
      icon: <RefreshCw className="h-5 w-5" />,
      variant: "outline",
      onClick: () => {},
    },
  ];

  return (
    <div className={cn("grid grid-cols-3 gap-3", className)}>
      {actions.map((action) => (
        <button
          key={action.id}
          onClick={action.onClick}
          className={cn(
            "group flex flex-col items-center gap-2 p-4 rounded-xl border transition-all",
            action.variant === "default"
              ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90"
              : "bg-card border-border hover:border-primary/50 hover:bg-muted/50"
          )}
        >
          <div className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg transition-transform group-hover:scale-110",
            action.variant === "default" ? "bg-primary-foreground/10" : "bg-primary/10"
          )}>
            <span className={action.variant === "default" ? "" : "text-primary"}>
              {action.icon}
            </span>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold">{action.label}</p>
            <p className={cn(
              "text-xs",
              action.variant === "default" ? "text-primary-foreground/70" : "text-muted-foreground"
            )}>
              {action.description}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}
