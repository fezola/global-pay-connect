import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { mockBalances, mockTransactions, mockPayouts, mockMerchant, type Balance, type Transaction, type Payout, type Merchant } from './mockData';

interface AppState {
  isAuthenticated: boolean;
  isOnboarded: boolean;
  merchant: Merchant | null;
  balances: Balance[];
  transactions: Transaction[];
  payouts: Payout[];
  useMockBackend: boolean;
  
  login: (email: string) => void;
  logout: () => void;
  createMerchant: (data: Partial<Merchant>) => string;
  addTransaction: (tx: Transaction) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  addPayout: (payout: Payout) => void;
  updatePayout: (id: string, updates: Partial<Payout>) => void;
  updateBalance: (currency: string, amount: number) => void;
  setUseMockBackend: (value: boolean) => void;
  regenerateApiKey: () => string;
  updateWebhook: (url: string) => void;
  reset: () => void;
}

const generateId = (prefix: string) => `${prefix}_${Math.random().toString(36).substring(2, 14)}`;
const generateApiKey = () => `sk_test_klyr_${Math.random().toString(36).substring(2, 26)}`;

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      isOnboarded: false,
      merchant: null,
      balances: [],
      transactions: [],
      payouts: [],
      useMockBackend: true,

      login: (email: string) => {
        const state = get();
        if (state.isOnboarded && state.merchant) {
          set({ isAuthenticated: true });
        } else {
          set({ isAuthenticated: true });
        }
      },

      logout: () => {
        set({ isAuthenticated: false });
      },

      createMerchant: (data: Partial<Merchant>) => {
        const apiKey = generateApiKey();
        const merchant: Merchant = {
          id: generateId('merchant'),
          name: data.name || 'Test Merchant',
          email: data.email || 'test@example.com',
          country: data.country || 'US',
          businessType: data.businessType || 'software',
          website: data.website,
          apiKey,
          createdAt: new Date().toISOString(),
        };
        set({
          merchant,
          isOnboarded: true,
          balances: mockBalances,
          transactions: mockTransactions,
          payouts: mockPayouts,
        });
        return apiKey;
      },

      addTransaction: (tx: Transaction) => {
        set((state) => ({
          transactions: [tx, ...state.transactions],
        }));
      },

      updateTransaction: (id: string, updates: Partial<Transaction>) => {
        set((state) => ({
          transactions: state.transactions.map((tx) =>
            tx.id === id ? { ...tx, ...updates } : tx
          ),
        }));
      },

      addPayout: (payout: Payout) => {
        set((state) => ({
          payouts: [payout, ...state.payouts],
        }));
      },

      updatePayout: (id: string, updates: Partial<Payout>) => {
        set((state) => ({
          payouts: state.payouts.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        }));
      },

      updateBalance: (currency: string, amount: number) => {
        set((state) => ({
          balances: state.balances.map((b) => {
            if (b.currency === currency) {
              const currentTotal = parseFloat(b.total.replace(',', ''));
              const currentOnchain = parseFloat(b.onchain.replace(',', ''));
              const newTotal = (currentTotal + amount).toFixed(2);
              const newOnchain = (currentOnchain + amount).toFixed(2);
              return {
                ...b,
                total: newTotal.includes('.') ? newTotal : `${newTotal}.00`,
                onchain: newOnchain.includes('.') ? newOnchain : `${newOnchain}.00`,
              };
            }
            return b;
          }),
        }));
      },

      setUseMockBackend: (value: boolean) => {
        set({ useMockBackend: value });
      },

      regenerateApiKey: () => {
        const newKey = generateApiKey();
        set((state) => ({
          merchant: state.merchant ? { ...state.merchant, apiKey: newKey } : null,
        }));
        return newKey;
      },

      updateWebhook: (url: string) => {
        set((state) => ({
          merchant: state.merchant
            ? { ...state.merchant, webhookUrl: url, webhookSecret: `whsec_${Math.random().toString(36).substring(2, 14)}` }
            : null,
        }));
      },

      reset: () => {
        set({
          isAuthenticated: false,
          isOnboarded: false,
          merchant: null,
          balances: [],
          transactions: [],
          payouts: [],
        });
      },
    }),
    {
      name: 'klyr-storage',
    }
  )
);
