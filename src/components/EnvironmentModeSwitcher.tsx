import { useEnvironmentMode } from "@/hooks/useEnvironmentMode";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { useMerchant } from "@/hooks/useMerchant";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EnvironmentModeSwitcherProps {
  variant?: 'default' | 'compact' | 'badge-only';
  showWarning?: boolean;
  className?: string;
}

export function EnvironmentModeSwitcher({ 
  variant = 'default', 
  showWarning = true,
  className 
}: EnvironmentModeSwitcherProps) {
  const { mode, toggleMode, isTestMode, isProductionMode } = useEnvironmentMode();
  const { merchant } = useMerchant();

  // Check if production is enabled for this merchant
  const canUseProduction = merchant?.productionEnabled || false;

  const handleToggle = () => {
    if (isTestMode && !canUseProduction) {
      // Don't allow switching to production if not enabled
      return;
    }
    toggleMode();
  };

  // Badge-only variant (for compact spaces like nav)
  if (variant === 'badge-only') {
    return (
      <Badge 
        variant="outline" 
        className={cn(
          "text-[10px] px-2 py-0.5 cursor-pointer transition-colors",
          isTestMode 
            ? "border-warning text-warning hover:bg-warning/10" 
            : "border-success text-success hover:bg-success/10",
          !canUseProduction && isProductionMode && "opacity-50 cursor-not-allowed",
          className
        )}
        onClick={handleToggle}
      >
        {isTestMode ? "Test Mode" : "Production"}
      </Badge>
    );
  }

  // Compact variant (for headers)
  if (variant === 'compact') {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-card">
          <div className={cn(
            "w-2 h-2 rounded-full",
            isTestMode ? "bg-warning animate-pulse" : "bg-success"
          )} />
          <span className="text-xs font-medium">
            {isTestMode ? "Test Mode" : "Production Mode"}
          </span>
        </div>
        {canUseProduction && (
          <Switch
            checked={isProductionMode}
            onCheckedChange={handleToggle}
            className="data-[state=checked]:bg-success"
          />
        )}
      </div>
    );
  }

  // Default variant (full featured)
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-card">
        <div className="flex items-center gap-3">
          {isTestMode ? (
            <AlertCircle className="h-5 w-5 text-warning" />
          ) : (
            <CheckCircle2 className="h-5 w-5 text-success" />
          )}
          <div>
            <Label className="text-sm font-semibold">
              {isTestMode ? "Test Mode" : "Production Mode"}
            </Label>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isTestMode 
                ? "Using sandbox API keys for testing" 
                : "Using live API keys for real transactions"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right mr-2">
            <div className="text-xs text-muted-foreground">Switch to</div>
            <div className="text-xs font-medium">
              {isTestMode ? "Production" : "Test"}
            </div>
          </div>
          <Switch
            checked={isProductionMode}
            onCheckedChange={handleToggle}
            disabled={!canUseProduction && isTestMode}
            className="data-[state=checked]:bg-success"
          />
        </div>
      </div>

      {showWarning && (
        <>
          {isTestMode && (
            <Alert className="border-warning/50 bg-warning/5">
              <AlertCircle className="h-4 w-4 text-warning" />
              <AlertDescription className="text-xs">
                You are in <strong>Test Mode</strong>. All transactions use sandbox API keys and no real money is processed.
              </AlertDescription>
            </Alert>
          )}

          {isProductionMode && (
            <Alert className="border-success/50 bg-success/5">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <AlertDescription className="text-xs">
                You are in <strong>Production Mode</strong>. All transactions use live API keys and process real money.
              </AlertDescription>
            </Alert>
          )}

          {!canUseProduction && isTestMode && (
            <Alert className="border-muted bg-muted/5">
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
              <AlertDescription className="text-xs">
                Production mode is not enabled. Complete KYB verification to enable live transactions.
              </AlertDescription>
            </Alert>
          )}
        </>
      )}
    </div>
  );
}

