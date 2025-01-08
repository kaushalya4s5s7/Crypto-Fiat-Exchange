import create from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  walletAddress?: string;
  kycStatus: 'none' | 'pending' | 'verified';
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  connectWallet: (address: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        // TODO: Replace with actual API call
        // Simulating API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // For demo purposes, always succeed
        set({
          user: {
            id: '1',
            email,
            kycStatus: 'none'
          },
          isAuthenticated: true
        });
      },

      register: async (email: string, password: string) => {
        // TODO: Replace with actual API call
        // Simulating API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // For demo purposes, always succeed
        set({
          user: {
            id: '1',
            email,
            kycStatus: 'none'
          },
          isAuthenticated: true
        });
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false
        });
      },

      connectWallet: (address: string) => {
        set((state) => ({
          user: state.user ? {
            ...state.user,
            walletAddress: address
          } : null
        }));
      }
    }),
    {
      name: 'auth-storage',
      getStorage: () => localStorage
    }
  )
);