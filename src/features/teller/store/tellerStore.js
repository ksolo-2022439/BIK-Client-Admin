import { create } from 'zustand';
import { getExchangeRates, getAccountByNumber, depositCash, withdrawCash, processCheck, getAccountStatement } from '../../../shared/api';

export const useTellerStore = create((set) => ({
  exchangeRate: null,
  accountData: null,
  searchLoading: false,
  searchError: null,
  loading: false,
  error: null,
  successData: null,

  fetchExchangeRates: async () => {
    try {
      const response = await getExchangeRates();
      const usdGtq = (response.data.data || []).find(r => r.monedaBase === 'USD' && r.monedaDestino === 'GTQ');
      if (usdGtq) set({ exchangeRate: usdGtq });
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
    }
  },

  searchAccount: async (accountNumber) => {
    try {
      set({ searchLoading: true, searchError: null, accountData: null, successData: null });
      const response = await getAccountByNumber(accountNumber);
      
      const account = response.data.data;
      if (account.estado !== 'Activa') {
        set({ searchError: 'La cuenta encontrada no está activa. Estado: ' + account.estado, searchLoading: false });
        return null;
      }
      
      set({ accountData: account, searchLoading: false });
      return account;
    } catch (error) {
      set({ searchError: error.response?.data?.message || 'Cuenta no encontrada.', searchLoading: false });
      return null;
    }
  },

  processDeposit: async (data) => {
    try {
      set({ loading: true, error: null });
      const response = await depositCash(data);
      set({ successData: response.data, loading: false });
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Error al procesar el depósito.', loading: false });
      throw error;
    }
  },

  processWithdrawal: async (data) => {
    try {
      set({ loading: true, error: null });
      const response = await withdrawCash(data);
      set({ successData: response.data, loading: false });
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Error al procesar el retiro.', loading: false });
      throw error;
    }
  },

  processCheckDeposit: async (data) => {
    try {
      set({ loading: true, error: null });
      const response = await processCheck(data);
      set({ successData: response.data, loading: false });
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Error al procesar el cheque.', loading: false });
      throw error;
    }
  },

  clearData: () => set({ accountData: null, successData: null, error: null, searchError: null })
}));
