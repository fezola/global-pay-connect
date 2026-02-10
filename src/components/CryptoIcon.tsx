/**
 * CryptoIcon Component
 * Displays cryptocurrency icons using the cryptocurrency-icons package
 */

import { useEffect, useState } from 'react';

interface CryptoIconProps {
  symbol: string;
  size?: number;
  className?: string;
  variant?: 'color' | 'black' | 'white' | 'icon';
}

export function CryptoIcon({ 
  symbol, 
  size = 32, 
  className = '',
  variant = 'color'
}: CryptoIconProps) {
  const [iconUrl, setIconUrl] = useState<string>('');
  const [error, setError] = useState(false);

  useEffect(() => {
    // Map symbol to icon filename (lowercase)
    const iconName = symbol.toLowerCase();
    
    // Try to load the icon from cryptocurrency-icons package
    const loadIcon = async () => {
      try {
        // Use SVG icons for better quality
        const icon = await import(`cryptocurrency-icons/svg/${variant}/${iconName}.svg`);
        setIconUrl(icon.default);
        setError(false);
      } catch (err) {
        // Fallback to generic icon if specific icon not found
        try {
          const genericIcon = await import(`cryptocurrency-icons/svg/${variant}/generic.svg`);
          setIconUrl(genericIcon.default);
        } catch {
          setError(true);
        }
      }
    };

    loadIcon();
  }, [symbol, variant]);

  if (error || !iconUrl) {
    // Fallback to a simple circle with the symbol
    return (
      <div 
        className={`flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold ${className}`}
        style={{ width: size, height: size, fontSize: size * 0.4 }}
      >
        {symbol.substring(0, 2)}
      </div>
    );
  }

  return (
    <img
      src={iconUrl}
      alt={symbol}
      className={className}
      style={{ width: size, height: size }}
    />
  );
}

/**
 * Network/Chain Icon Component
 * Displays blockchain network icons
 */

interface NetworkIconProps {
  chain: string;
  size?: number;
  className?: string;
}

export function NetworkIcon({ 
  chain, 
  size = 32, 
  className = ''
}: NetworkIconProps) {
  const [iconUrl, setIconUrl] = useState<string>('');
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadIcon = async () => {
      try {
        // Map chain names to cryptocurrency symbols
        const chainToSymbol: Record<string, string> = {
          'solana': 'sol',
          'ethereum': 'eth',
          'polygon': 'matic',
          'base': 'eth', // Base uses ETH logo
          'arbitrum': 'arb',
          'optimism': 'op',
          'avalanche': 'avax',
          'bsc': 'bnb',
        };

        const symbol = chainToSymbol[chain.toLowerCase()] || chain.toLowerCase();
        const icon = await import(`cryptocurrency-icons/svg/color/${symbol}.svg`);
        setIconUrl(icon.default);
        setError(false);
      } catch (err) {
        setError(true);
      }
    };

    loadIcon();
  }, [chain]);

  if (error || !iconUrl) {
    // Fallback
    return (
      <div 
        className={`flex items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-600 text-white font-bold ${className}`}
        style={{ width: size, height: size, fontSize: size * 0.4 }}
      >
        {chain.substring(0, 1)}
      </div>
    );
  }

  return (
    <img
      src={iconUrl}
      alt={chain}
      className={className}
      style={{ width: size, height: size }}
    />
  );
}

/**
 * Wallet Icon Component
 * Displays wallet provider icons
 */

interface WalletIconProps {
  wallet: string;
  size?: number;
  className?: string;
}

const WALLET_ICONS: Record<string, string> = {
  'phantom': 'https://avatars.githubusercontent.com/u/78782331?s=200&v=4',
  'metamask': 'https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg',
  'coinbase': 'https://avatars.githubusercontent.com/u/18060234?s=200&v=4',
  'walletconnect': 'https://avatars.githubusercontent.com/u/37784886?s=200&v=4',
  'solflare': 'https://avatars.githubusercontent.com/u/85809304?s=200&v=4',
  'backpack': 'https://pbs.twimg.com/profile_images/1593304942210478080/TUYae5z7_400x400.jpg',
};

export function WalletIcon({ 
  wallet, 
  size = 32, 
  className = ''
}: WalletIconProps) {
  const iconUrl = WALLET_ICONS[wallet.toLowerCase()];

  if (!iconUrl) {
    // Fallback
    return (
      <div 
        className={`flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 text-white font-bold ${className}`}
        style={{ width: size, height: size, fontSize: size * 0.4 }}
      >
        {wallet.substring(0, 1)}
      </div>
    );
  }

  return (
    <img
      src={iconUrl}
      alt={wallet}
      className={`rounded-full ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

