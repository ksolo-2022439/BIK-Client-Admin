import { create } from 'zustand';
import { bikApi } from '../../../../shared/api/axiosInstance';

export const useCurrencyStore = create((set) => ({
  exchangeRates: [],
  remittanceHistory: [],
  loading: false,
  error: null,

  fetchExchangeRates: async () => {
    set({ loading: true, error: null });
    try {
      const res = await bikApi.get('/currency/rates');
      set({ exchangeRates: res.data.data || [], loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  executeCurrencyExchange: async (data) => {
    set({ loading: true, error: null });
    try {
      const res = await bikApi.post('/currency/exchange', data);
      set({ loading: false });
      return res.data;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Error en cambio de divisas', loading: false });
      throw err;
    }
  },

  redeemRemittance: async (data) => {
    set({ loading: true, error: null });
    try {
      const res = await bikApi.post('/currency/remittance/redeem', data);
      set({ loading: false });
      return res.data;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Error al cobrar remesa', loading: false });
      throw err;
    }
  },

  fetchRemittanceHistory: async () => {
    set({ loading: true, error: null });
    try {
      const res = await bikApi.get('/transactions/history?tipo=Remesa');
      set({ remittanceHistory: res.data.data || [], loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  }
}));
