import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Balance {
  currency: string;
  amount: string;
  value: string;
}

interface Transaction {
  id: number;
  type: string;
  currency: string;
  amount: string;
  value: string;
  status: 'Completed' | 'Pending' | 'Failed';
  date: string;
}

interface WalletState {
  balances: Balance[];
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => void;
  updateBalance: (currency: string, amount: string, value: string) => void;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set) => ({
      balances: [
        { currency: 'BTC', amount: '0.5234', value: '$21,234.50' },
        { currency: 'ETH', amount: '3.2154', value: '$6,431.08' },
        { currency: 'USDT', amount: '1,234.56', value: '$1,234.56' },
      ],
      transactions: [
        { id: 1, type: 'Buy', currency: 'BTC', amount: '0.1234', value: '$5,678.90', status: 'Completed', date: '2024-03-15' },
        { id: 2, type: 'Sell', currency: 'ETH', amount: '1.5000', value: '$3,456.78', status: 'Pending', date: '2024-03-14' },
        { id: 3, type: 'Deposit', currency: 'USDT', amount: '500.00', value: '$500.00', status: 'Completed', date: '2024-03-13' },
      ],
      addTransaction: (transaction) =>
        set((state) => ({
          transactions: [
            {
              ...transaction,
              id: state.transactions.length + 1,
              date: new Date().toISOString().split('T')[0],
            },
            ...state.transactions,
          ],
        })),
      updateBalance: (currency, amount, value) =>
        set((state) => ({
          balances: state.balances.map((balance) =>
            balance.currency === currency ? { ...balance, amount, value } : balance
          ),
        })),
    }),
    {
      name: 'wallet-storage',
    }
  )
);