import { cn } from "@/lib/utils";
import type { Balance } from "@/lib/mockData";

interface CurrencyBalanceProps {
  balance: Balance;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

const currencyIcons: Record<string, string> = {
  USDC: "U",
  USDT: "T",
  ETH: "E",
  SOL: "S",
};

const currencyColors: Record<string, string> = {
  USDC: "from-blue-500 to-blue-600",
  USDT: "from-emerald-500 to-emerald-600",
  ETH: "from-violet-500 to-violet-600",
  SOL: "from-purple-500 to-purple-600",
};

export function CurrencyBalance({ balance, isActive, onClick, className }: CurrencyBalanceProps) {
  const onchainValue = parseFloat(balance.onchain.replace(",", ""));
  const totalValue = parseFloat(balance.total.replace(",", ""));
  const onchainPercent = totalValue > 0 ? (onchainValue / totalValue) * 100 : 0;

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative w-full text-left p-4 rounded-xl border-2 transition-all",
        isActive 
          ? "border-primary bg-primary/5" 
          : "border-border hover:border-primary/30 bg-card",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-white font-bold text-sm",
          currencyColors[balance.currency] || "from-slate-500 to-slate-600"
        )}>
          {currencyIcons[balance.currency] || balance.currency[0]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">{balance.currency}</span>
            {isActive && (
              <span className="text-xs font-medium text-primary px-1.5 py-0.5 rounded bg-primary/10">
                Active
              </span>
            )}
          </div>
          <p className="text-xl font-bold mt-0.5">${balance.total}</p>
        </div>
      </div>

      {/* Balance distribution bar */}
      <div className="mt-3 space-y-1.5">
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70 transition-all"
            style={{ width: `${onchainPercent}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>On-chain: ${balance.onchain}</span>
          <span>Off-chain: ${balance.offchain}</span>
        </div>
      </div>
    </button>
  );
}
