/**
 * Step 2: Network Selection
 * User selects which blockchain network to use
 */

import { Network, ChevronRight, Zap, DollarSign, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChainType, TokenType } from "@/lib/walletProviders";

interface NetworkOption {
  id: ChainType;
  name: string;
  logo: string;
  speed: "Fast" | "Very Fast" | "Instant";
  fee: "Low" | "Very Low" | "Medium" | "High";
  security: "High" | "Very High";
  description: string;
  recommended?: boolean;
  supportedTokens: TokenType[];
}

const NETWORKS: NetworkOption[] = [
  {
    id: "solana",
    name: "Solana",
    logo: "/solana-sol-logo.svg",
    speed: "Instant",
    fee: "Very Low",
    security: "High",
    description: "Ultra-fast transactions, minimal fees",
    recommended: true,
    supportedTokens: ["USDC", "USDT", "SOL"],
  },
  {
    id: "base",
    name: "Base",
    logo: "/base.png",
    speed: "Very Fast",
    fee: "Very Low",
    security: "High",
    description: "Ethereum L2, low cost, high speed",
    recommended: true,
    supportedTokens: ["USDC", "USDT", "ETH"],
  },
  {
    id: "polygon",
    name: "Polygon",
    logo: "/polygon-matic-logo.svg",
    speed: "Fast",
    fee: "Very Low",
    security: "High",
    description: "Ethereum scaling, very low fees",
    recommended: true,
    supportedTokens: ["USDC", "USDT", "MATIC"],
  },
  {
    id: "arbitrum",
    name: "Arbitrum",
    logo: "/arbitrum-arb-logo.svg",
    speed: "Fast",
    fee: "Low",
    security: "High",
    description: "Ethereum L2, optimized for DeFi",
    supportedTokens: ["USDC", "USDT", "ETH"],
  },
  {
    id: "optimism",
    name: "Optimism",
    logo: "/optimism-ethereum-op-logo.svg",
    speed: "Fast",
    fee: "Low",
    security: "High",
    description: "Ethereum L2, fast and efficient",
    supportedTokens: ["USDC", "USDT", "ETH"],
  },
];

interface NetworkSelectionProps {
  currency: TokenType;
  onSelect: (network: ChainType) => void;
  selected: ChainType | null;
  theme?: "light" | "dark" | "auto";
}

export function NetworkSelection({
  currency,
  onSelect,
  selected,
  theme = "light",
}: NetworkSelectionProps) {
  const isDark = theme === "dark" || (theme === "auto" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  // Filter networks that support the selected currency
  const availableNetworks = NETWORKS.filter((network) =>
    network.supportedTokens.includes(currency)
  );

  const getFeeColor = (fee: string) => {
    if (fee === "Very Low") return "text-green-500";
    if (fee === "Low") return "text-blue-500";
    if (fee === "Medium") return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/30 mb-4">
          <Network className="h-8 w-8 text-purple-500" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Choose Network</h2>
        <p className={cn("text-sm", isDark ? "text-slate-400" : "text-slate-600")}>
          Select the blockchain network for your {currency} payment
        </p>
      </div>

      {/* Network Options */}
      <div className="space-y-3">
        {availableNetworks.map((network) => (
          <button
            key={network.id}
            onClick={() => onSelect(network.id)}
            className={cn(
              "w-full p-4 rounded-xl border-2 transition-all hover:scale-[1.02]",
              "flex items-start justify-between group",
              isDark
                ? "border-slate-700 hover:border-purple-500 bg-slate-800/50"
                : "border-slate-200 hover:border-purple-500 bg-white",
              selected === network.id && "border-purple-500 bg-purple-50 dark:bg-purple-900/20 ring-2 ring-purple-500/20"
            )}
          >
            <div className="flex items-start gap-4 flex-1">
              {/* Logo */}
              <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-800 p-2 shadow-sm border border-slate-200 dark:border-slate-700 flex-shrink-0">
                <img
                  src={network.logo}
                  alt={network.name}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Info */}
              <div className="text-left flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-lg">{network.name}</span>
                  {network.recommended && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500 text-white font-medium">
                      Recommended
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                  {network.description}
                </p>

                {/* Features */}
                <div className="flex flex-wrap gap-3 text-xs">
                  <div className="flex items-center gap-1">
                    <Zap className="h-3 w-3 text-yellow-500" />
                    <span className="text-slate-600 dark:text-slate-400">{network.speed}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className={cn("h-3 w-3", getFeeColor(network.fee))} />
                    <span className="text-slate-600 dark:text-slate-400">{network.fee} Fee</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Shield className="h-3 w-3 text-blue-500" />
                    <span className="text-slate-600 dark:text-slate-400">{network.security}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Arrow */}
            <ChevronRight
              className={cn(
                "h-5 w-5 transition-transform group-hover:translate-x-1 flex-shrink-0 mt-2",
                selected === network.id ? "text-purple-500" : "text-slate-400"
              )}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

