/**
 * EVM Chain Payout Processor
 * Handles payouts for Ethereum, Base, and Polygon
 */

import { ethers } from "https://esm.sh/ethers@6.9.0";

// ERC-20 ABI for transfer function
const ERC20_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

// USDC/USDT contract addresses per chain
const TOKEN_ADDRESSES: Record<string, { USDC: string; USDT: string }> = {
  ethereum: {
    USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  },
  base: {
    USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    USDT: '0x0000000000000000000000000000000000000000', // Base doesn't have USDT yet
  },
  polygon: {
    USDC: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    USDT: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
  },
};

// RPC endpoints per chain
const RPC_ENDPOINTS: Record<string, string> = {
  ethereum: Deno.env.get('ETHEREUM_RPC_ENDPOINT') || 'https://eth.llamarpc.com',
  base: Deno.env.get('BASE_RPC_ENDPOINT') || 'https://mainnet.base.org',
  polygon: Deno.env.get('POLYGON_RPC_ENDPOINT') || 'https://polygon-rpc.com',
};

// Block explorers per chain
const BLOCK_EXPLORERS: Record<string, string> = {
  ethereum: 'https://etherscan.io/tx/',
  base: 'https://basescan.org/tx/',
  polygon: 'https://polygonscan.com/tx/',
};

export interface EVMPayoutParams {
  chain: 'ethereum' | 'base' | 'polygon';
  currency: 'USDC' | 'USDT';
  toAddress: string;
  amount: number; // In USD (will be converted to token decimals)
  privateKey: string; // Hot wallet private key
}

export interface EVMPayoutResult {
  success: boolean;
  txHash?: string;
  explorerUrl?: string;
  error?: string;
}

/**
 * Process an EVM chain payout
 */
export async function processEVMPayout(params: EVMPayoutParams): Promise<EVMPayoutResult> {
  const { chain, currency, toAddress, amount, privateKey } = params;

  try {
    // Validate chain and currency
    if (!TOKEN_ADDRESSES[chain]) {
      throw new Error(`Unsupported chain: ${chain}`);
    }

    const tokenAddress = TOKEN_ADDRESSES[chain][currency];
    if (!tokenAddress || tokenAddress === '0x0000000000000000000000000000000000000000') {
      throw new Error(`${currency} not available on ${chain}`);
    }

    // Connect to RPC
    const rpcUrl = RPC_ENDPOINTS[chain];
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    
    // Create wallet from private key
    const wallet = new ethers.Wallet(privateKey, provider);
    
    // Connect to token contract
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, wallet);
    
    // Get token decimals (USDC/USDT typically use 6 decimals)
    const decimals = await tokenContract.decimals();
    
    // Convert amount to token units
    const tokenAmount = ethers.parseUnits(amount.toString(), decimals);
    
    // Check wallet balance
    const balance = await tokenContract.balanceOf(wallet.address);
    if (balance < tokenAmount) {
      throw new Error(`Insufficient balance. Have: ${ethers.formatUnits(balance, decimals)}, Need: ${amount}`);
    }
    
    // Estimate gas
    const gasEstimate = await tokenContract.transfer.estimateGas(toAddress, tokenAmount);
    const gasPrice = await provider.getFeeData();
    
    // Send transaction
    const tx = await tokenContract.transfer(toAddress, tokenAmount, {
      gasLimit: gasEstimate * 120n / 100n, // Add 20% buffer
      maxFeePerGas: gasPrice.maxFeePerGas,
      maxPriorityFeePerGas: gasPrice.maxPriorityFeePerGas,
    });
    
    console.log(`${chain} payout transaction sent:`, tx.hash);
    
    // Wait for confirmation (1 block)
    const receipt = await tx.wait(1);
    
    if (!receipt || receipt.status !== 1) {
      throw new Error('Transaction failed');
    }
    
    const explorerUrl = `${BLOCK_EXPLORERS[chain]}${tx.hash}`;
    
    return {
      success: true,
      txHash: tx.hash,
      explorerUrl,
    };
    
  } catch (error: any) {
    console.error(`EVM payout error on ${chain}:`, error);
    return {
      success: false,
      error: error.message || 'Unknown error',
    };
  }
}

/**
 * Validate an EVM address
 */
export function isValidEVMAddress(address: string): boolean {
  return ethers.isAddress(address);
}

/**
 * Get hot wallet address from private key
 */
export function getEVMWalletAddress(privateKey: string): string {
  const wallet = new ethers.Wallet(privateKey);
  return wallet.address;
}

