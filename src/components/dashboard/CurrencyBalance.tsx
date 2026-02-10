import { cn } from "@/lib/utils";
import type { Balance } from "@/lib/mockData";

interface CurrencyBalanceProps {
  balance: Balance;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

const currencyLogos: Record<string, string> = {
  USDC: "/usd-coin-usdc-logo.svg",
  USDT: "/tether-usdt-logo.svg",
  ETH: "/ethereum-eth-logo.svg",
  SOL: "/solana-sol-logo.svg",
  MATIC: "/polygon-matic-logo.svg",
  OP: "/optimism-ethereum-op-logo.svg",
  ARB: "/arbitrum-arb-logo.svg",
  AVAX: "/avalanche-avax-logo.svg",
  BNB: "/bnb-bnb-logo.svg",
  DAI: "/multi-collateral-dai-dai-logo.svg",
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
        <div className="flex h-10 w-10 shrink-0 items-center justify-center">
          <img
            src={currencyLogos[balance.currency] || "/placeholder.svg"}
            alt={balance.currency}
            className="h-10 w-10"
          />
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
