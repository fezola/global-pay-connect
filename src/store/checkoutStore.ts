/**
 * Checkout Store
 * Manages checkout state across multiple steps
 */

import { create } from 'zustand';
import type { ChainType, TokenType, WalletConnection } from '@/lib/walletProviders';
import { convertUSDToLocal, initializeCurrencyConversion } from '@/lib/currencyConversion';

export interface CheckoutState {
  // Step 1: Currency Selection
  selectedCurrency: TokenType | null;
  setSelectedCurrency: (currency: TokenType) => void;

  // Step 2: Network Selection
  selectedNetwork: ChainType | null;
  setSelectedNetwork: (network: ChainType) => void;

  // Step 3: Amount & Fees
  amount: number;
  amountUSD: number;
  amountLocal: number;
  localCurrency: string;
  localCurrencySymbol: string;
  exchangeRate: number;
  networkFee: number;
  tax: number;
  totalUSD: number;
  totalLocal: number;
  totalCrypto: number;
  setAmount: (amount: number) => void;
  calculateFees: () => Promise<void>;
  initializeCurrency: () => Promise<void>;

  // Step 4: Wallet Connection
  wallet: WalletConnection | null;
  setWallet: (wallet: WalletConnection | null) => void;

  // Step 5: Payment Confirmation
  confirmed: boolean;
  setConfirmed: (confirmed: boolean) => void;

  // Navigation
  currentStep: number;
  goToStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;

  // Reset
  reset: () => void;
}

// Tax rate (if applicable, varies by country)
const TAX_RATE = 0.00; // 0% for crypto (adjust as needed)

// Network fees (estimated, in USD)
const NETWORK_FEES: Record<ChainType, number> = {
  solana: 0.0001,
  base: 0.01,
  ethereum: 2.00,
  polygon: 0.01,
  arbitrum: 0.10,
  optimism: 0.10,
};

export const useCheckoutStore = create<CheckoutState>((set, get) => ({
  // Initial state
  selectedCurrency: null,
  selectedNetwork: null,
  amount: 0,
  amountUSD: 0,
  amountLocal: 0,
  localCurrency: 'NGN',
  localCurrencySymbol: '₦',
  exchangeRate: 1550,
  networkFee: 0,
  tax: 0,
  totalUSD: 0,
  totalLocal: 0,
  totalCrypto: 0,
  wallet: null,
  confirmed: false,
  currentStep: 1,

  // Actions
  setSelectedCurrency: (currency) => {
    set({ selectedCurrency: currency });
  },

  setSelectedNetwork: (network) => {
    set({ selectedNetwork: network });
    get().calculateFees();
  },

  setAmount: (amount) => {
    set({ amount, amountUSD: amount });
    get().calculateFees();
  },

  initializeCurrency: async () => {
    try {
      const currencyInfo = await initializeCurrencyConversion();
      console.log('Currency initialized:', currencyInfo);

      set({
        localCurrency: currencyInfo.currency,
        localCurrencySymbol: currencyInfo.symbol,
        exchangeRate: currencyInfo.rates[currencyInfo.currency] || 1,
      });

      // Recalculate fees with new exchange rate
      await get().calculateFees();
    } catch (error) {
      console.error('Failed to initialize currency:', error);
      // Keep default values (NGN)
    }
  },

  calculateFees: async () => {
    const { amountUSD, selectedNetwork, localCurrency, exchangeRate } = get();

    if (!amountUSD) {
      return;
    }

    // Get network fee
    const networkFee = selectedNetwork ? (NETWORK_FEES[selectedNetwork] || 0) : 0;

    // Calculate tax
    const tax = amountUSD * TAX_RATE;

    // Calculate totals in USD
    const totalUSD = amountUSD + networkFee + tax;
    const totalCrypto = totalUSD;

    // Convert to local currency using real exchange rate
    const amountLocal = amountUSD * exchangeRate;
    const totalLocal = totalUSD * exchangeRate;

    console.log('Fee calculation:', {
      amountUSD,
      exchangeRate,
      localCurrency,
      amountLocal,
      totalLocal,
    });

    set({
      amountLocal,
      networkFee,
      tax,
      totalUSD,
      totalLocal,
      totalCrypto,
    });
  },

  setWallet: (wallet) => {
    set({ wallet });
  },

  setConfirmed: (confirmed) => {
    set({ confirmed });
  },

  goToStep: (step) => {
    set({ currentStep: step });
  },

  nextStep: () => {
    const { currentStep } = get();
    if (currentStep < 5) {
      set({ currentStep: currentStep + 1 });
    }
  },

  prevStep: () => {
    const { currentStep } = get();
    if (currentStep > 1) {
      set({ currentStep: currentStep - 1 });
    }
  },

  reset: () => {
    set({
      selectedCurrency: null,
      selectedNetwork: null,
      amount: 0,
      amountUSD: 0,
      amountLocal: 0,
      networkFee: 0,
      tax: 0,
      totalUSD: 0,
      totalLocal: 0,
      totalCrypto: 0,
      wallet: null,
      confirmed: false,
      currentStep: 1,
      // Keep currency settings
    });
  },
}));

