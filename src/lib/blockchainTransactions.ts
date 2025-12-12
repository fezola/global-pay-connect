/**
 * Blockchain Transaction Utilities
 * Handles real blockchain transactions for Solana and EVM chains
 */

import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getAssociatedTokenAddress, createTransferInstruction, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import type { WalletConnection, TokenType } from './walletProviders';
import { TOKEN_ADDRESSES, TOKEN_DECIMALS } from './walletProviders';

// RPC endpoints
const SOLANA_RPC_MAINNET = 'https://api.mainnet-beta.solana.com';
const SOLANA_RPC_DEVNET = 'https://api.devnet.solana.com';

export interface TransactionResult {
  signature: string;
  success: boolean;
  error?: string;
}

export interface TransactionStatus {
  confirmed: boolean;
  confirmations?: number;
  error?: string;
}

/**
 * Create and send Solana token transfer (native SOL or SPL token)
 */
export async function sendSolanaTokenTransfer(
  wallet: WalletConnection,
  recipientAddress: string,
  amount: number,
  token: TokenType,
  useMainnet: boolean = false
): Promise<TransactionResult> {
  try {
    console.log('Creating Solana transaction...', {
      from: wallet.address,
      to: recipientAddress,
      amount,
      token,
      network: useMainnet ? 'mainnet' : 'devnet'
    });

    // Connect to Solana
    const rpcUrl = useMainnet ? SOLANA_RPC_MAINNET : SOLANA_RPC_DEVNET;
    const connection = new Connection(rpcUrl, 'confirmed');

    const fromPubkey = new PublicKey(wallet.address);
    const toPubkey = new PublicKey(recipientAddress);

    let transaction: Transaction;

    // Handle native SOL transfer
    if (token === 'SOL') {
      console.log('Creating native SOL transfer...');

      // Convert amount to lamports (1 SOL = 1,000,000,000 lamports)
      const lamports = Math.floor(amount * LAMPORTS_PER_SOL);

      // Create native SOL transfer instruction
      const transferInstruction = SystemProgram.transfer({
        fromPubkey,
        toPubkey,
        lamports,
      });

      transaction = new Transaction().add(transferInstruction);
    }
    // Handle SPL token transfer (USDC, USDT)
    else {
      console.log('Creating SPL token transfer...');

      // Get token mint address
      const mintAddress = TOKEN_ADDRESSES.solana[token];
      if (!mintAddress || mintAddress === 'native') {
        throw new Error(`Token ${token} not supported on Solana`);
      }

      const mint = new PublicKey(mintAddress);

      // Get associated token accounts
      const fromTokenAccount = await getAssociatedTokenAddress(mint, fromPubkey);
      const toTokenAccount = await getAssociatedTokenAddress(mint, toPubkey);

      console.log('Token accounts:', {
        from: fromTokenAccount.toString(),
        to: toTokenAccount.toString()
      });

      // Convert amount to token units based on decimals
      const decimals = TOKEN_DECIMALS[token];
      const tokenAmount = Math.floor(amount * Math.pow(10, decimals));

      // Create transfer instruction
      const transferInstruction = createTransferInstruction(
        fromTokenAccount,
        toTokenAccount,
        fromPubkey,
        tokenAmount,
        [],
        TOKEN_PROGRAM_ID
      );

      transaction = new Transaction().add(transferInstruction);
    }

    // Get recent blockhash
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = fromPubkey;

    console.log('Transaction created, requesting signature from wallet...');

    // Sign and send transaction using wallet
    const signedTransaction = await wallet.provider.signTransaction(transaction);
    const signature = await connection.sendRawTransaction(signedTransaction.serialize());

    console.log('Transaction sent:', signature);

    // Wait for confirmation
    await connection.confirmTransaction(signature, 'confirmed');

    console.log('Transaction confirmed:', signature);

    return {
      signature,
      success: true
    };
  } catch (error: any) {
    console.error('Solana transaction error:', error);
    return {
      signature: '',
      success: false,
      error: error.message || 'Transaction failed'
    };
  }
}

/**
 * Create and send EVM token transfer (native ETH or ERC-20)
 */
export async function sendEVMTokenTransfer(
  wallet: WalletConnection,
  recipientAddress: string,
  amount: number,
  token: TokenType,
  chainId: string = '0x2105' // Base mainnet
): Promise<TransactionResult> {
  try {
    console.log('Creating EVM transaction...', {
      from: wallet.address,
      to: recipientAddress,
      amount,
      token,
      chainId
    });

    let txHash: string;

    // Handle native ETH transfer
    if (token === 'ETH') {
      console.log('Creating native ETH transfer...');

      // Convert amount to wei (1 ETH = 10^18 wei)
      const decimals = TOKEN_DECIMALS[token];
      const weiAmount = Math.floor(amount * Math.pow(10, decimals));
      const valueHex = '0x' + weiAmount.toString(16);

      console.log('Transaction data:', {
        to: recipientAddress,
        value: valueHex,
        from: wallet.address
      });

      // Send native ETH transaction
      txHash = await wallet.provider.request({
        method: 'eth_sendTransaction',
        params: [{
          from: wallet.address,
          to: recipientAddress,
          value: valueHex,
        }]
      });
    }
    // Handle ERC-20 token transfer (USDC, USDT)
    else {
      console.log('Creating ERC-20 token transfer...');

      // Get token contract address
      const tokenAddress = TOKEN_ADDRESSES.base[token];
      if (!tokenAddress || tokenAddress === 'native') {
        throw new Error(`Token ${token} not supported on Base`);
      }

      // Convert amount to token units based on decimals
      const decimals = TOKEN_DECIMALS[token];
      const tokenAmount = Math.floor(amount * Math.pow(10, decimals));
      const amountHex = '0x' + tokenAmount.toString(16).padStart(64, '0');

      // ERC-20 transfer function signature: transfer(address,uint256)
      const transferMethodId = '0xa9059cbb';
      const recipientHex = recipientAddress.slice(2).padStart(64, '0');
      const data = transferMethodId + recipientHex + amountHex;

      console.log('Transaction data:', {
        to: tokenAddress,
        data,
        from: wallet.address
      });

      // Send ERC-20 transaction
      txHash = await wallet.provider.request({
        method: 'eth_sendTransaction',
        params: [{
          from: wallet.address,
          to: tokenAddress,
          data: data,
          value: '0x0'
        }]
      });
    }

    console.log('Transaction sent:', txHash);

    return {
      signature: txHash,
      success: true
    };
  } catch (error: any) {
    console.error('EVM transaction error:', error);
    return {
      signature: '',
      success: false,
      error: error.message || 'Transaction failed'
    };
  }
}

/**
 * Check Solana transaction status
 */
export async function checkSolanaTransactionStatus(
  signature: string,
  useMainnet: boolean = false
): Promise<TransactionStatus> {
  try {
    const rpcUrl = useMainnet ? SOLANA_RPC_MAINNET : SOLANA_RPC_DEVNET;
    const connection = new Connection(rpcUrl, 'confirmed');

    const status = await connection.getSignatureStatus(signature);

    if (status.value === null) {
      return { confirmed: false };
    }

    if (status.value.err) {
      return {
        confirmed: false,
        error: 'Transaction failed: ' + JSON.stringify(status.value.err)
      };
    }

    return {
      confirmed: status.value.confirmationStatus === 'confirmed' ||
                 status.value.confirmationStatus === 'finalized',
      confirmations: status.value.confirmations || 0
    };
  } catch (error: any) {
    console.error('Failed to check Solana transaction status:', error);
    return {
      confirmed: false,
      error: error.message
    };
  }
}

/**
 * Check EVM transaction status
 */
export async function checkEVMTransactionStatus(
  txHash: string,
  provider: any
): Promise<TransactionStatus> {
  try {
    const receipt = await provider.request({
      method: 'eth_getTransactionReceipt',
      params: [txHash]
    });

    if (!receipt) {
      return { confirmed: false };
    }

    const success = receipt.status === '0x1';

    if (!success) {
      return {
        confirmed: false,
        error: 'Transaction reverted'
      };
    }

    // Get current block to calculate confirmations
    const currentBlock = await provider.request({
      method: 'eth_blockNumber',
      params: []
    });

    const confirmations = parseInt(currentBlock, 16) - parseInt(receipt.blockNumber, 16);

    return {
      confirmed: confirmations >= 1,
      confirmations
    };
  } catch (error: any) {
    console.error('Failed to check EVM transaction status:', error);
    return {
      confirmed: false,
      error: error.message
    };
  }
}

