import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  change?: number;
  changeLabel?: string;
  icon?: ReactNode;
  trend?: "up" | "down" | "neutral";
  className?: string;
}

export function StatsCard({
  title,
  value,
  change,
  changeLabel = "vs last period",
  icon,
  trend,
  className,
}: StatsCardProps) {
  const getTrendIcon = () => {
    if (trend === "up") return <TrendingUp className="h-3.5 w-3.5" />;
    if (trend === "down") return <TrendingDown className="h-3.5 w-3.5" />;
    return <Minus className="h-3.5 w-3.5" />;
  };

  const getTrendColor = () => {
    if (trend === "up") return "text-success";
    if (trend === "down") return "text-destructive";
    return "text-muted-foreground";
  };

  return (
    <div className={cn(
      "relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-all hover:shadow-md",
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
        </div>
        {icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
        )}
      </div>
      
      {change !== undefined && (
        <div className="mt-3 flex items-center gap-1.5">
          <span className={cn("flex items-center gap-0.5 text-sm font-medium", getTrendColor())}>
            {getTrendIcon()}
            {Math.abs(change)}%
          </span>
          <span className="text-xs text-muted-foreground">{changeLabel}</span>
        </div>
      )}

      {/* Decorative gradient */}
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-primary/5 to-transparent" />
    </div>
  );
}
