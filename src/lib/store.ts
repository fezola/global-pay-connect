import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { mockBalances, mockTransactions, mockPayouts, mockMerchant, type Balance, type Transaction, type Payout, type Merchant } from './mockData';

export interface Business {
  id: string;
  legalName: string;
  tradeName?: string;
  entityType: string;
  registrationNumber?: string;
  taxId?: string;
  country: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
  };
  status: 'draft' | 'submitted' | 'under_review' | 'verified' | 'rejected';
  walletVerified: boolean;
  submittedAt?: string;
  verifiedAt?: string;
}

export interface BusinessOwner {
  id: string;
  name: string;
  email?: string;
  dob?: string;
  nationality?: string;
  idNumber?: string;
  idType?: string;
  ownershipPercentage?: number;
}

export interface BusinessWallet {
  id: string;
  address: string;
  chain: string;
  type: 'hot' | 'multisig' | 'custodial';
  proofVerified: boolean;
  details?: Record<string, any>;
}

export interface TeamMember {
  id: string;
  email: string;
  role: 'admin' | 'finance' | 'developer' | 'viewer';
  status: 'invited' | 'active' | 'disabled';
  invitedAt: string;
}

export interface Integration {
  id: string;
  type: 'bank' | 'ramp' | 'custodian' | 'webhook';
  provider: string;
  name: string;
  isConnected: boolean;
  isProduction: boolean;
}

export interface Customer {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  createdAt: string;
}

interface AppState {
  isAuthenticated: boolean;
  isOnboarded: boolean;
  merchant: Merchant | null;
  business: Business | null;
  businessOwners: BusinessOwner[];
  businessWallets: BusinessWallet[];
  balances: Balance[];
  transactions: Transaction[];
  payouts: Payout[];
  teamMembers: TeamMember[];
  integrations: Integration[];
  customers: Customer[];
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
  
  // Business registration
  createBusiness: (data: Partial<Business>) => string;
  updateBusiness: (updates: Partial<Business>) => void;
  addBusinessOwner: (owner: Omit<BusinessOwner, 'id'>) => string;
  removeBusinessOwner: (id: string) => void;
  addBusinessWallet: (wallet: Omit<BusinessWallet, 'id'>) => string;
  verifyWallet: (id: string) => void;
  submitForKYB: () => void;
  
  // Team management
  inviteTeamMember: (email: string, role: TeamMember['role']) => string;
  updateTeamMember: (id: string, updates: Partial<TeamMember>) => void;
  removeTeamMember: (id: string) => void;
  
  // Integrations
  addIntegration: (integration: Omit<Integration, 'id'>) => string;
  updateIntegration: (id: string, updates: Partial<Integration>) => void;
  removeIntegration: (id: string) => void;
  
  // Customers
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => string;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  removeCustomer: (id: string) => void;
  
  // Production toggle
  enableProduction: () => boolean;
  canEnableProduction: () => { canEnable: boolean; reasons: string[] };
}

const generateId = (prefix: string) => `${prefix}_${Math.random().toString(36).substring(2, 14)}`;
const generateApiKey = () => `sk_test_klyr_${Math.random().toString(36).substring(2, 26)}`;

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      isOnboarded: false,
      merchant: null,
      business: null,
      businessOwners: [],
      businessWallets: [],
      balances: [],
      transactions: [],
      payouts: [],
      teamMembers: [],
      integrations: [],
      customers: [],
      useMockBackend: true,

      login: (email: string) => {
        set({ isAuthenticated: true });
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
          productionEnabled: false,
          kybStatus: 'pending',
          twoFactorEnabled: false,
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
          business: null,
          businessOwners: [],
          businessWallets: [],
          balances: [],
          transactions: [],
          payouts: [],
          teamMembers: [],
          integrations: [],
          customers: [],
        });
      },
      
      // Business registration
      createBusiness: (data: Partial<Business>) => {
        const id = generateId('business');
        const business: Business = {
          id,
          legalName: data.legalName || '',
          tradeName: data.tradeName,
          entityType: data.entityType || 'llc',
          registrationNumber: data.registrationNumber,
          taxId: data.taxId,
          country: data.country || 'US',
          address: data.address,
          status: 'draft',
          walletVerified: false,
        };
        set({ business });
        return id;
      },
      
      updateBusiness: (updates: Partial<Business>) => {
        set((state) => ({
          business: state.business ? { ...state.business, ...updates } : null,
        }));
      },
      
      addBusinessOwner: (owner: Omit<BusinessOwner, 'id'>) => {
        const id = generateId('owner');
        set((state) => ({
          businessOwners: [...state.businessOwners, { ...owner, id }],
        }));
        return id;
      },
      
      removeBusinessOwner: (id: string) => {
        set((state) => ({
          businessOwners: state.businessOwners.filter((o) => o.id !== id),
        }));
      },
      
      addBusinessWallet: (wallet: Omit<BusinessWallet, 'id'>) => {
        const id = generateId('wallet');
        set((state) => ({
          businessWallets: [...state.businessWallets, { ...wallet, id }],
        }));
        return id;
      },
      
      verifyWallet: (id: string) => {
        set((state) => ({
          businessWallets: state.businessWallets.map((w) =>
            w.id === id ? { ...w, proofVerified: true } : w
          ),
          business: state.business ? { ...state.business, walletVerified: true } : null,
        }));
      },
      
      submitForKYB: () => {
        set((state) => ({
          business: state.business
            ? { ...state.business, status: 'submitted', submittedAt: new Date().toISOString() }
            : null,
          merchant: state.merchant
            ? { ...state.merchant, kybStatus: 'in_progress' }
            : null,
        }));
        
        // Simulate KYB verification after 3 seconds (mock)
        setTimeout(() => {
          set((state) => ({
            business: state.business
              ? { ...state.business, status: 'verified', verifiedAt: new Date().toISOString() }
              : null,
            merchant: state.merchant
              ? { ...state.merchant, kybStatus: 'verified' }
              : null,
          }));
        }, 3000);
      },
      
      // Team management
      inviteTeamMember: (email: string, role: TeamMember['role']) => {
        const id = generateId('member');
        set((state) => ({
          teamMembers: [
            ...state.teamMembers,
            { id, email, role, status: 'invited', invitedAt: new Date().toISOString() },
          ],
        }));
        return id;
      },
      
      updateTeamMember: (id: string, updates: Partial<TeamMember>) => {
        set((state) => ({
          teamMembers: state.teamMembers.map((m) =>
            m.id === id ? { ...m, ...updates } : m
          ),
        }));
      },
      
      removeTeamMember: (id: string) => {
        set((state) => ({
          teamMembers: state.teamMembers.filter((m) => m.id !== id),
        }));
      },
      
      // Integrations
      addIntegration: (integration: Omit<Integration, 'id'>) => {
        const id = generateId('integration');
        set((state) => ({
          integrations: [...state.integrations, { ...integration, id }],
        }));
        return id;
      },
      
      updateIntegration: (id: string, updates: Partial<Integration>) => {
        set((state) => ({
          integrations: state.integrations.map((i) =>
            i.id === id ? { ...i, ...updates } : i
          ),
        }));
      },
      
      removeIntegration: (id: string) => {
        set((state) => ({
          integrations: state.integrations.filter((i) => i.id !== id),
        }));
      },
      
      // Customers
      addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => {
        const id = generateId('customer');
        set((state) => ({
          customers: [
            ...state.customers,
            { ...customer, id, createdAt: new Date().toISOString() },
          ],
        }));
        return id;
      },
      
      updateCustomer: (id: string, updates: Partial<Customer>) => {
        set((state) => ({
          customers: state.customers.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        }));
      },
      
      removeCustomer: (id: string) => {
        set((state) => ({
          customers: state.customers.filter((c) => c.id !== id),
        }));
      },
      
      // Production toggle
      canEnableProduction: () => {
        const state = get();
        const reasons: string[] = [];
        
        if (!state.business || state.business.status !== 'verified') {
          reasons.push('Complete business registration and KYB verification');
        }
        
        if (!state.business?.walletVerified) {
          reasons.push('Verify wallet ownership with proof of control');
        }
        
        if (!state.merchant?.twoFactorEnabled) {
          reasons.push('Enable two-factor authentication');
        }
        
        const hasConnectedBank = state.integrations.some(
          (i) => i.type === 'bank' && i.isConnected
        );
        const hasConnectedCustodian = state.integrations.some(
          (i) => i.type === 'custodian' && i.isConnected
        );
        
        if (!hasConnectedBank && !hasConnectedCustodian) {
          reasons.push('Connect at least one bank or custodian integration');
        }
        
        return { canEnable: reasons.length === 0, reasons };
      },
      
      enableProduction: () => {
        const { canEnable } = get().canEnableProduction();
        if (canEnable) {
          const liveKey = `sk_live_klyr_${Math.random().toString(36).substring(2, 26)}`;
          set((state) => ({
            merchant: state.merchant
              ? { ...state.merchant, productionEnabled: true, apiKeyLive: liveKey }
              : null,
          }));
          return true;
        }
        return false;
      },
    }),
    {
      name: 'klyr-storage',
    }
  )
);
