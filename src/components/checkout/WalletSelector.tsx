/**
 * Wallet & Payment Method Selector
 * Allows users to choose their preferred blockchain and token
 */

import { useState } from "react";
import { ChevronRight, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ChainType, TokenType } from "@/lib/walletProviders";

interface PaymentOption {
  id: string;
  chain: ChainType;
  token: TokenType;
  name: string;
  network: string;
  tokenLogo: string;
  networkLogo: string;
  popular?: boolean;
}

const PAYMENT_OPTIONS: PaymentOption[] = [
  // Solana Network
  {
    id: "solana-usdc",
    chain: "solana",
    token: "USDC",
    name: "USDC",
    network: "Solana",
    tokenLogo: "/usd-coin-usdc-logo.svg",
    networkLogo: "/solana-sol-logo.svg",
    popular: true,
  },
  {
    id: "solana-sol",
    chain: "solana",
    token: "SOL",
    name: "SOL",
    network: "Solana",
    tokenLogo: "/solana-sol-logo.svg",
    networkLogo: "/solana-sol-logo.svg",
    popular: true,
  },
  {
    id: "solana-usdt",
    chain: "solana",
    token: "USDT",
    name: "USDT",
    network: "Solana",
    tokenLogo: "/tether-usdt-logo.svg",
    networkLogo: "/solana-sol-logo.svg",
  },

  // Base Network
  {
    id: "base-usdc",
    chain: "base",
    token: "USDC",
    name: "USDC",
    network: "Base",
    tokenLogo: "/usd-coin-usdc-logo.svg",
    networkLogo: "/base.png",
    popular: true,
  },
  {
    id: "base-eth",
    chain: "base",
    token: "ETH",
    name: "ETH",
    network: "Base",
    tokenLogo: "/ethereum-eth-logo.svg",
    networkLogo: "/base.png",
    popular: true,
  },
  {
    id: "base-usdt",
    chain: "base",
    token: "USDT",
    name: "USDT",
    network: "Base",
    tokenLogo: "/tether-usdt-logo.svg",
    networkLogo: "/base.png",
  },

  // Polygon Network
  {
    id: "polygon-usdc",
    chain: "polygon",
    token: "USDC",
    name: "USDC",
    network: "Polygon",
    tokenLogo: "/usd-coin-usdc-logo.svg",
    networkLogo: "/polygon-matic-logo.svg",
    popular: true,
  },
  {
    id: "polygon-matic",
    chain: "polygon",
    token: "MATIC",
    name: "MATIC",
    network: "Polygon",
    tokenLogo: "/polygon-matic-logo.svg",
    networkLogo: "/polygon-matic-logo.svg",
  },
  {
    id: "polygon-usdt",
    chain: "polygon",
    token: "USDT",
    name: "USDT",
    network: "Polygon",
    tokenLogo: "/tether-usdt-logo.svg",
    networkLogo: "/polygon-matic-logo.svg",
  },

  // Arbitrum Network
  {
    id: "arbitrum-usdc",
    chain: "arbitrum",
    token: "USDC",
    name: "USDC",
    network: "Arbitrum",
    tokenLogo: "/usd-coin-usdc-logo.svg",
    networkLogo: "/arbitrum-arb-logo.svg",
  },
  {
    id: "arbitrum-eth",
    chain: "arbitrum",
    token: "ETH",
    name: "ETH",
    network: "Arbitrum",
    tokenLogo: "/ethereum-eth-logo.svg",
    networkLogo: "/arbitrum-arb-logo.svg",
  },
  {
    id: "arbitrum-usdt",
    chain: "arbitrum",
    token: "USDT",
    name: "USDT",
    network: "Arbitrum",
    tokenLogo: "/tether-usdt-logo.svg",
    networkLogo: "/arbitrum-arb-logo.svg",
  },

  // Optimism Network
  {
    id: "optimism-usdc",
    chain: "optimism",
    token: "USDC",
    name: "USDC",
    network: "Optimism",
    tokenLogo: "/usd-coin-usdc-logo.svg",
    networkLogo: "/optimism-ethereum-op-logo.svg",
  },
  {
    id: "optimism-eth",
    chain: "optimism",
    token: "ETH",
    name: "ETH",
    network: "Optimism",
    tokenLogo: "/ethereum-eth-logo.svg",
    networkLogo: "/optimism-ethereum-op-logo.svg",
  },
  {
    id: "optimism-usdt",
    chain: "optimism",
    token: "USDT",
    name: "USDT",
    network: "Optimism",
    tokenLogo: "/tether-usdt-logo.svg",
    networkLogo: "/optimism-ethereum-op-logo.svg",
  },
];

interface WalletSelectorProps {
  amount: string;
  currency: string;
  onSelect: (chain: ChainType, token: TokenType) => void;
  theme?: "light" | "dark" | "auto";
}

export function WalletSelector({ amount, currency, onSelect, theme = "light" }: WalletSelectorProps) {
  const [selectedOption, setSelectedOption] = useState<PaymentOption | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<string>("all");

  const isDark = theme === "dark" || (theme === "auto" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  // Get unique networks
  const networks = ["all", ...Array.from(new Set(PAYMENT_OPTIONS.map(opt => opt.network)))];

  // Filter options by network
  const filteredOptions = selectedNetwork === "all"
    ? PAYMENT_OPTIONS
    : PAYMENT_OPTIONS.filter(opt => opt.network === selectedNetwork);

  const handleSelect = (option: PaymentOption) => {
    setSelectedOption(option);
    onSelect(option.chain, option.token);
  };

  return (
    <div className="space-y-6">
      {/* Amount Display */}
      <div className="text-center py-6">
        <p className={cn("text-sm mb-2", isDark ? "text-slate-400" : "text-slate-600")}>
          Amount to pay
        </p>
        <div className="text-4xl font-bold">
          {amount} <span className="text-2xl">{currency}</span>
        </div>
      </div>

      {/* Network Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {networks.map((network) => (
          <button
            key={network}
            onClick={() => setSelectedNetwork(network)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex-shrink-0",
              selectedNetwork === network
                ? "bg-blue-500 text-white shadow-md"
                : isDark
                ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            )}
          >
            {network === "all" ? "All Networks" : network}
          </button>
        ))}
      </div>

      {/* Payment Method Selection */}
      <div>
        <h3 className="text-sm font-semibold mb-3">
          {selectedNetwork === "all" ? "All Payment Methods" : `${selectedNetwork} Network`}
          <span className={cn("ml-2 text-xs font-normal", isDark ? "text-slate-400" : "text-slate-500")}>
            ({filteredOptions.length} options)
          </span>
        </h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => handleSelect(option)}
              className={cn(
                "w-full p-4 rounded-lg border-2 transition-all hover:scale-[1.02]",
                "flex items-center justify-between group",
                isDark
                  ? "border-slate-700 hover:border-blue-500 bg-slate-800/50"
                  : "border-slate-200 hover:border-blue-500 bg-white",
                selectedOption?.id === option.id && "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
              )}
            >
              <div className="flex items-center gap-3">
                {/* Token and Network Logos */}
                <div className="relative w-12 h-12">
                  {/* Network logo (background) */}
                  <div className="absolute inset-0 rounded-full bg-white dark:bg-slate-800 p-1.5 shadow-sm">
                    <img
                      src={option.networkLogo}
                      alt={option.network}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  {/* Token logo (foreground, bottom-right) */}
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white dark:bg-slate-800 p-0.5 shadow-md border-2 border-white dark:border-slate-900">
                    <img
                      src={option.tokenLogo}
                      alt={option.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>

                <div className="text-left">
                  <div className="font-semibold flex items-center gap-2">
                    {option.name}
                    {option.popular && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500 text-white">
                        Popular
                      </span>
                    )}
                  </div>
                  <div className={cn("text-sm", isDark ? "text-slate-400" : "text-slate-600")}>
                    {option.network} Network
                  </div>
                </div>
              </div>
              <ChevronRight className={cn(
                "h-5 w-5 transition-transform group-hover:translate-x-1",
                isDark ? "text-slate-400" : "text-slate-400"
              )} />
            </button>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className={cn(
        "p-4 rounded-lg text-sm",
        isDark ? "bg-slate-800/50 text-slate-300" : "bg-slate-50 text-slate-600"
      )}>
        <p className="font-semibold mb-2">Why choose crypto payments?</p>
        <ul className="space-y-1 text-xs">
          <li>✓ Instant settlement</li>
          <li>✓ Low transaction fees</li>
          <li>✓ Secure blockchain verification</li>
          <li>✓ No chargebacks</li>
        </ul>
      </div>
    </div>
  );
}

