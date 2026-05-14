import { create } from 'zustand';
import { listAccounts, getAccountDetail, getAccountStatement, createAccount, searchUserByDpi } from '../../../shared/api';

export const useAccountsStore = create((set, get) => ({
  accounts: [],
  selectedAccount: null,
  accountStatement: null,
  loading: false,
  error: null,
  pagination: { page: 1, total: 0, pages: 1 },

  fetchAccounts: async (params = {}) => {
    try {
      set({ loading: true, error: null });
      const response = await listAccounts(params);
      set({ 
        accounts: response.data.data, 
        pagination: response.data.pagination,
        loading: false 
      });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Error al obtener cuentas', loading: false });
    }
  },

  fetchAccountDetail: async (id) => {
    try {
      set({ loading: true, error: null });
      const response = await getAccountDetail(id);
      set({ selectedAccount: response.data.data, loading: false });
      return response.data.data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Error al cargar detalle', loading: false });
      throw error;
    }
  },

  fetchAccountStatement: async (id, params = {}) => {
    try {
      set({ loading: true, error: null });
      const response = await getAccountStatement(id, params);
      set({ accountStatement: response.data.data, loading: false });
      return response.data.data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Error al cargar estado de cuenta', loading: false });
      throw error;
    }
  },

  searchClient: async (dpi) => {
    try {
      set({ loading: true, error: null });
      const response = await searchUserByDpi(dpi);
      set({ loading: false });
      return response.data.data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Cliente no encontrado', loading: false });
      throw error;
    }
  },

  addAccount: async (data) => {
    try {
      set({ loading: true, error: null });
      const response = await createAccount(data);
      set({ loading: false });
      return response.data.data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Error al crear la cuenta', loading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null })
}));
