import { create } from 'zustand';
import { listTransactions } from '../../../shared/api';

export const useTransactionsStore = create((set) => ({
  transactions: [],
  loading: false,
  error: null,
  pagination: { page: 1, total: 0, pages: 1 },

  fetchTransactions: async (params = {}) => {
    try {
      set({ loading: true, error: null });
      const response = await listTransactions(params);
      set({ 
        transactions: response.data.data, 
        pagination: response.data.pagination,
        loading: false 
      });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Error al obtener transacciones', loading: false });
    }
  },

  clearError: () => set({ error: null })
}));
