/**
 * Step 1: Currency Selection
 * User selects which cryptocurrency to pay with
 */

import { Coins, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TokenType } from "@/lib/walletProviders";

interface Currency {
  id: TokenType;
  name: string;
  symbol: string;
  logo: string;
  description: string;
  popular?: boolean;
}

const CURRENCIES: Currency[] = [
  {
    id: "USDC",
    name: "USD Coin",
    symbol: "USDC",
    logo: "/usd-coin-usdc-logo.svg",
    description: "Stablecoin pegged to USD",
    popular: true,
  },
  {
    id: "USDT",
    name: "Tether",
    symbol: "USDT",
    logo: "/tether-usdt-logo.svg",
    description: "Stablecoin pegged to USD",
    popular: true,
  },
  {
    id: "SOL",
    name: "Solana",
    symbol: "SOL",
    logo: "/solana-sol-logo.svg",
    description: "Fast and low-cost blockchain",
  },
  {
    id: "ETH",
    name: "Ethereum",
    symbol: "ETH",
    logo: "/ethereum-eth-logo.svg",
    description: "Most popular smart contract platform",
    popular: true,
  },
  {
    id: "MATIC",
    name: "Polygon",
    symbol: "MATIC",
    logo: "/polygon-matic-logo.svg",
    description: "Low-cost Ethereum scaling solution",
  },
];

interface CurrencySelectionProps {
  onSelect: (currency: TokenType) => void;
  selected: TokenType | null;
  theme?: "light" | "dark" | "auto";
}

export function CurrencySelection({
  onSelect,
  selected,
  theme = "light",
}: CurrencySelectionProps) {
  const isDark = theme === "dark" || (theme === "auto" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
          <Coins className="h-8 w-8 text-blue-500" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Choose Currency</h2>
        <p className={cn("text-sm", isDark ? "text-slate-400" : "text-slate-600")}>
          Select the cryptocurrency you want to pay with
        </p>
      </div>

      {/* Currency Options */}
      <div className="space-y-3">
        {CURRENCIES.map((currency) => (
          <button
            key={currency.id}
            onClick={() => onSelect(currency.id)}
            className={cn(
              "w-full p-4 rounded-xl border-2 transition-all hover:scale-[1.02]",
              "flex items-center justify-between group",
              isDark
                ? "border-slate-700 hover:border-blue-500 bg-slate-800/50"
                : "border-slate-200 hover:border-blue-500 bg-white",
              selected === currency.id && "border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500/20"
            )}
          >
            <div className="flex items-center gap-4">
              {/* Logo */}
              <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-800 p-2 shadow-sm border border-slate-200 dark:border-slate-700">
                <img
                  src={currency.logo}
                  alt={currency.name}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Info */}
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-lg">{currency.symbol}</span>
                  {currency.popular && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500 text-white font-medium">
                      Popular
                    </span>
                  )}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  {currency.description}
                </div>
              </div>
            </div>

            {/* Arrow */}
            <ChevronRight
              className={cn(
                "h-5 w-5 transition-transform group-hover:translate-x-1",
                selected === currency.id ? "text-blue-500" : "text-slate-400"
              )}
            />
          </button>
        ))}
      </div>

      {/* Info Box */}
      <div className={cn(
        "p-4 rounded-lg border",
        isDark ? "bg-blue-900/20 border-blue-800" : "bg-blue-50 border-blue-200"
      )}>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          💡 <strong>Tip:</strong> Stablecoins (USDC, USDT) maintain a 1:1 value with USD, making them ideal for payments.
        </p>
      </div>
    </div>
  );
}

