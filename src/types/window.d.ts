/**
 * Window type declarations for wallet providers
 */

import { Buffer } from 'buffer';

interface Window {
  Buffer: typeof Buffer;
  // Phantom Wallet (Solana)
  phantom?: {
    solana?: {
      isPhantom: boolean;
      connect: () => Promise<{ publicKey: { toString: () => string } }>;
      disconnect: () => Promise<void>;
      signTransaction: (transaction: any) => Promise<any>;
      signAllTransactions: (transactions: any[]) => Promise<any[]>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      off: (event: string, callback: (...args: any[]) => void) => void;
    };
  };

  // Solflare Wallet (Solana)
  solflare?: {
    isSolflare: boolean;
    connect: () => Promise<{ publicKey: { toString: () => string } }>;
    disconnect: () => Promise<void>;
    signTransaction: (transaction: any) => Promise<any>;
    signAllTransactions: (transactions: any[]) => Promise<any[]>;
  };

  // MetaMask / EVM Wallets
  ethereum?: {
    isMetaMask?: boolean;
    isCoinbaseWallet?: boolean;
    request: (args: { method: string; params?: any[] }) => Promise<any>;
    on: (event: string, callback: (...args: any[]) => void) => void;
    removeListener: (event: string, callback: (...args: any[]) => void) => void;
    selectedAddress: string | null;
    chainId: string | null;
  };

  // WalletConnect
  WalletConnect?: any;
}

export {};

