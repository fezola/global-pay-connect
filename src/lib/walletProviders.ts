/**
 * Wallet Provider Integrations
 * Supports Solana and EVM wallets for crypto payments
 */

export type WalletType = 'phantom' | 'solflare' | 'backpack' | 'metamask' | 'coinbase' | 'walletconnect';
export type ChainType = 'solana' | 'base' | 'ethereum' | 'polygon' | 'arbitrum' | 'optimism' | 'avalanche' | 'bsc';
export type TokenType =
  // Stablecoins
  | 'USDC' | 'USDT' | 'DAI' | 'USDC.e' | 'BUSD'
  // Native tokens
  | 'SOL' | 'ETH' | 'MATIC' | 'AVAX' | 'BNB' | 'OP' | 'ARB'
  // Other
  | 'BTC';

export interface WalletProvider {
  id: WalletType;
  name: string;
  icon: string;
  chains: ChainType[];
  installed: boolean;
  connect: () => Promise<WalletConnection>;
  disconnect: () => Promise<void>;
}

export interface WalletConnection {
  address: string;
  chain: ChainType;
  provider: any;
}

export interface TokenBalance {
  token: TokenType;
  balance: number;
  decimals: number;
  chain: ChainType;
}

/**
 * Check if Phantom wallet is installed
 */
export function isPhantomInstalled(): boolean {
  if (typeof window === 'undefined') return false;

  // Check for Phantom
  const isPhantom = window.phantom?.solana?.isPhantom;
  console.log('Phantom check:', {
    hasPhantom: 'phantom' in window,
    hasSolana: !!window.phantom?.solana,
    isPhantom
  });

  return !!isPhantom;
}

/**
 * Check if MetaMask is installed
 */
export function isMetaMaskInstalled(): boolean {
  if (typeof window === 'undefined') return false;

  const isMetaMask = window.ethereum?.isMetaMask;
  console.log('MetaMask check:', {
    hasEthereum: 'ethereum' in window,
    isMetaMask
  });

  return !!isMetaMask;
}

/**
 * Check if Coinbase Wallet is installed
 */
export function isCoinbaseWalletInstalled(): boolean {
  if (typeof window === 'undefined') return false;

  return !!window.ethereum?.isCoinbaseWallet;
}

/**
 * Connect to Phantom wallet (Solana)
 */
export async function connectPhantom(): Promise<WalletConnection> {
  console.log('Attempting to connect to Phantom...');

  if (typeof window === 'undefined') {
    throw new Error('Window is not defined');
  }

  if (!window.phantom?.solana) {
    throw new Error('Phantom wallet is not installed. Please install it from https://phantom.app/');
  }

  try {
    const provider = window.phantom.solana;
    console.log('Phantom provider:', provider);

    // Check if already connected
    if (provider.isConnected) {
      console.log('Phantom already connected');
      return {
        address: provider.publicKey.toString(),
        chain: 'solana',
        provider: provider,
      };
    }

    // Request connection
    console.log('Requesting Phantom connection...');
    const resp = await provider.connect({ onlyIfTrusted: false });
    console.log('Phantom connected:', resp.publicKey.toString());

    return {
      address: resp.publicKey.toString(),
      chain: 'solana',
      provider: provider,
    };
  } catch (error: any) {
    console.error('Phantom connection error:', error);

    // Handle specific error codes
    if (error.code === 4001 || error.message?.includes('User rejected')) {
      throw new Error('User rejected the connection request');
    }

    if (error.message?.includes('already pending')) {
      throw new Error('Connection request already pending. Please check your Phantom wallet.');
    }

    throw new Error('Failed to connect to Phantom wallet: ' + (error.message || 'Unknown error'));
  }
}

/**
 * Disconnect from Phantom wallet
 */
export async function disconnectPhantom(): Promise<void> {
  if (typeof window !== 'undefined' && window.phantom?.solana?.isConnected) {
    try {
      await window.phantom.solana.disconnect();
      console.log('Phantom disconnected');
    } catch (error) {
      console.error('Failed to disconnect Phantom:', error);
    }
  }
}

/**
 * Connect to MetaMask (EVM)
 */
export async function connectMetaMask(chainId: string = '0x2105'): Promise<WalletConnection> {
  console.log('Attempting to connect to MetaMask...');

  if (typeof window === 'undefined') {
    throw new Error('Window is not defined');
  }

  if (!window.ethereum) {
    throw new Error('MetaMask is not installed. Please install it from https://metamask.io/');
  }

  try {
    const provider = window.ethereum;
    console.log('MetaMask provider:', provider);

    // Request account access
    console.log('Requesting MetaMask accounts...');
    const accounts = await provider.request({
      method: 'eth_requestAccounts',
      params: []
    }) as string[];

    console.log('MetaMask connected:', accounts[0]);

    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found');
    }

    // Switch to Base network (0x2105 = 8453)
    try {
      console.log('Switching to Base network...');
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId }],
      });
      console.log('Switched to Base network');
    } catch (switchError: any) {
      console.log('Switch error:', switchError);

      // Chain not added, add it
      if (switchError.code === 4902 || switchError.code === -32603) {
        console.log('Adding Base network...');
        try {
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId,
              chainName: 'Base',
              nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
              rpcUrls: ['https://mainnet.base.org'],
              blockExplorerUrls: ['https://basescan.org'],
            }],
          });
          console.log('Base network added');
        } catch (addError: any) {
          console.error('Failed to add Base network:', addError);
          // Continue anyway - user might be on a different network
        }
      } else if (switchError.code !== 4001) {
        // Ignore user rejection, throw other errors
        console.warn('Network switch error (continuing):', switchError);
      }
    }

    return {
      address: accounts[0],
      chain: 'base',
      provider: provider,
    };
  } catch (error: any) {
    console.error('MetaMask connection error:', error);

    // Handle specific error codes
    if (error.code === 4001 || error.message?.includes('User rejected')) {
      throw new Error('User rejected the connection request');
    }

    if (error.code === -32002) {
      throw new Error('Connection request already pending. Please check your MetaMask extension.');
    }

    throw new Error('Failed to connect to MetaMask: ' + (error.message || 'Unknown error'));
  }
}

/**
 * Disconnect from MetaMask
 */
export async function disconnectMetaMask(): Promise<void> {
  // MetaMask doesn't have a disconnect method, but we can clear the connection state
  // The user needs to disconnect from MetaMask extension directly
  console.log('MetaMask disconnect requested - user should disconnect from extension');
}

/**
 * Get Solana balance (native SOL or SPL token)
 */
export async function getSolanaTokenBalance(
  walletAddress: string,
  tokenMint: string,
  useMainnet: boolean = false
): Promise<number> {
  const rpcUrl = useMainnet
    ? 'https://api.mainnet-beta.solana.com'
    : 'https://api.devnet.solana.com';

  try {
    console.log('Fetching Solana balance...', { walletAddress, tokenMint, network: useMainnet ? 'mainnet' : 'devnet' });

    // Handle native SOL balance
    if (tokenMint === 'native') {
      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getBalance',
          params: [walletAddress],
        }),
      });

      const data = await response.json();
      console.log('SOL balance response:', data);

      if (data.result?.value !== undefined) {
        // Convert lamports to SOL (1 SOL = 1,000,000,000 lamports)
        const balance = data.result.value / 1_000_000_000;
        console.log('SOL balance:', balance);
        return balance;
      }

      return 0;
    }

    // Handle SPL token balance
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getTokenAccountsByOwner',
        params: [
          walletAddress,
          { mint: tokenMint },
          { encoding: 'jsonParsed' },
        ],
      }),
    });

    const data = await response.json();
    console.log('Solana token balance response:', data);

    if (data.result?.value?.length > 0) {
      const balance = data.result.value[0].account.data.parsed.info.tokenAmount.uiAmount;
      console.log('Solana token balance:', balance);
      return balance || 0;
    }

    console.log('No token account found, balance is 0');
    return 0;
  } catch (error) {
    console.error('Failed to get Solana balance:', error);
    return 0;
  }
}

/**
 * Get EVM balance (native ETH or ERC-20 token)
 */
export async function getEVMTokenBalance(
  walletAddress: string,
  tokenAddress: string,
  provider: any,
  decimals: number = 6
): Promise<number> {
  try {
    console.log('Fetching EVM balance...', { walletAddress, tokenAddress, decimals });

    // Handle native ETH balance
    if (tokenAddress === 'native') {
      const balance = await provider.request({
        method: 'eth_getBalance',
        params: [walletAddress, 'latest'],
      });

      console.log('ETH balance response:', balance);

      // Convert hex to decimal and adjust for 18 decimals (ETH)
      const balanceNum = parseInt(balance, 16) / Math.pow(10, decimals);
      console.log('ETH balance:', balanceNum);
      return balanceNum;
    }

    // Handle ERC-20 token balance
    // ERC-20 balanceOf function signature
    const data = '0x70a08231' + walletAddress.slice(2).padStart(64, '0');

    const balance = await provider.request({
      method: 'eth_call',
      params: [{
        to: tokenAddress,
        data,
      }, 'latest'],
    });

    console.log('EVM token balance response:', balance);

    // Convert hex to decimal and adjust for token decimals
    const balanceNum = parseInt(balance, 16) / Math.pow(10, decimals);
    console.log('EVM token balance:', balanceNum);
    return balanceNum;
  } catch (error) {
    console.error('Failed to get EVM balance:', error);
    return 0;
  }
}

// Token mint addresses
export const TOKEN_ADDRESSES = {
  solana: {
    USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    USDT: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    SOL: 'native',
  },
  base: {
    USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    USDT: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2',
    ETH: 'native',
  },
  ethereum: {
    USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    ETH: 'native',
  },
  polygon: {
    USDC: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    'USDC.e': '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    USDT: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    MATIC: 'native',
  },
  arbitrum: {
    USDC: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
    'USDC.e': '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
    USDT: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
    ETH: 'native',
  },
  optimism: {
    USDC: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607',
    USDT: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
    ETH: 'native',
  },
};

// Token decimals
export const TOKEN_DECIMALS: Record<TokenType, number> = {
  USDC: 6,
  USDT: 6,
  'USDC.e': 6,
  DAI: 18,
  BUSD: 18,
  SOL: 9,
  ETH: 18,
  BTC: 8,
  MATIC: 18,
};

