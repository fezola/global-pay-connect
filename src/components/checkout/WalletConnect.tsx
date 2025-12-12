/**
 * Wallet Connection Component
 * Handles wallet detection and connection
 */

import { useState, useEffect } from "react";
import { Wallet, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  isPhantomInstalled,
  isMetaMaskInstalled,
  isCoinbaseWalletInstalled,
  connectPhantom,
  connectMetaMask,
  type WalletConnection,
  type ChainType,
} from "@/lib/walletProviders";
import { PhantomLogo, MetaMaskLogo, CoinbaseLogo } from "./WalletLogos";

interface WalletOption {
  id: string;
  name: string;
  logo: React.ComponentType<{ className?: string }>;
  installed: boolean;
  downloadUrl: string;
  connect: () => Promise<WalletConnection>;
}

interface WalletConnectProps {
  chain: ChainType;
  onConnect: (connection: WalletConnection) => void;
  onBack: () => void;
  theme?: "light" | "dark" | "auto";
}

export function WalletConnect({ chain, onConnect, onBack, theme = "light" }: WalletConnectProps) {
  const [wallets, setWallets] = useState<WalletOption[]>([]);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isDark = theme === "dark" || (theme === "auto" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  useEffect(() => {
    // Detect available wallets based on chain
    const availableWallets: WalletOption[] = [];

    if (chain === "solana") {
      availableWallets.push({
        id: "phantom",
        name: "Phantom",
        logo: PhantomLogo,
        installed: isPhantomInstalled(),
        downloadUrl: "https://phantom.app/",
        connect: connectPhantom,
      });
    } else if (chain === "base" || chain === "ethereum") {
      availableWallets.push(
        {
          id: "metamask",
          name: "MetaMask",
          logo: MetaMaskLogo,
          installed: isMetaMaskInstalled(),
          downloadUrl: "https://metamask.io/",
          connect: connectMetaMask,
        },
        {
          id: "coinbase",
          name: "Coinbase Wallet",
          logo: CoinbaseLogo,
          installed: isCoinbaseWalletInstalled(),
          downloadUrl: "https://www.coinbase.com/wallet",
          connect: connectMetaMask, // Uses same connection method
        }
      );
    }

    setWallets(availableWallets);
  }, [chain]);

  const handleConnect = async (wallet: WalletOption) => {
    if (!wallet.installed) {
      window.open(wallet.downloadUrl, "_blank");
      return;
    }

    setConnecting(wallet.id);
    setError(null);

    try {
      console.log(`Connecting to ${wallet.name}...`);
      const connection = await wallet.connect();
      console.log('Connection successful:', connection);
      onConnect(connection);
    } catch (err) {
      const error = err as Error;
      console.error(`Failed to connect to ${wallet.name}:`, error);

      // Show user-friendly error message
      let errorMessage = error.message;

      if (errorMessage.includes('already pending')) {
        errorMessage = `Please check your ${wallet.name} extension. There's a pending connection request.`;
      } else if (errorMessage.includes('User rejected')) {
        errorMessage = 'Connection request was rejected. Please try again.';
      } else if (errorMessage.includes('not installed')) {
        errorMessage = `${wallet.name} is not installed. Please install it and refresh the page.`;
      }

      setError(errorMessage);
    } finally {
      setConnecting(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-3">
          <Wallet className="h-6 w-6 text-blue-500" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
        <p className={cn("text-sm", isDark ? "text-slate-400" : "text-slate-600")}>
          Choose a wallet to connect to {chain === "solana" ? "Solana" : "Base"} network
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className={cn(
          "p-4 rounded-lg border",
          "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
        )}>
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Wallet Options */}
      <div className="space-y-3">
        {wallets.map((wallet) => {
          const WalletLogo = wallet.logo;
          return (
            <button
              key={wallet.id}
              onClick={() => handleConnect(wallet)}
              disabled={connecting === wallet.id}
              className={cn(
                "w-full p-4 rounded-lg border-2 transition-all hover:scale-[1.02]",
                "flex items-center justify-between group disabled:opacity-50 disabled:cursor-not-allowed",
                isDark
                  ? "border-slate-700 hover:border-blue-500 bg-slate-800/50"
                  : "border-slate-200 hover:border-blue-500 bg-white"
              )}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 p-2 shadow-sm border border-slate-200 dark:border-slate-700">
                  <WalletLogo className="w-full h-full" />
                </div>
                <div className="text-left">
                  <div className="font-semibold">{wallet.name}</div>
                  <div className={cn("text-sm", isDark ? "text-slate-400" : "text-slate-600")}>
                    {wallet.installed ? (
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        Detected
                      </span>
                    ) : (
                      "Not installed"
                    )}
                  </div>
                </div>
              </div>
              {connecting === wallet.id ? (
                <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
              ) : wallet.installed ? (
                <span className={cn("text-sm font-medium", isDark ? "text-blue-400" : "text-blue-600")}>
                  Connect →
                </span>
              ) : (
                <ExternalLink className={cn("h-5 w-5", isDark ? "text-slate-400" : "text-slate-400")} />
              )}
            </button>
          );
        })}
      </div>

      {/* Info */}
      <div className={cn(
        "p-4 rounded-lg text-sm",
        isDark ? "bg-slate-800/50 text-slate-300" : "bg-slate-50 text-slate-600"
      )}>
        <p className="font-semibold mb-2">Don't have a wallet?</p>
        <p className="text-xs">
          Click on any wallet above to download and install it. Wallets are free and take less than a minute to set up.
        </p>
      </div>

      {/* Back Button */}
      <Button variant="outline" onClick={onBack} className="w-full">
        Back to Payment Methods
      </Button>
    </div>
  );
}

