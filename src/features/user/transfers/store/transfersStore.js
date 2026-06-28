import { create } from 'zustand';
import { bikApi } from '../../../../shared/api/axiosInstance';

export const useTransfersStore = create((set, get) => ({
  sourceAccounts: [],
  destinationAccounts: [],
  exchangeRates: null,
  loadingData: false,
  transferLoading: false,
  error: null,

  fetchTransferData: async () => {
    set({ loadingData: true, error: null });
    try {
      const token = localStorage.getItem('bik_token');
      if (!token) return;
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      const [cuentasRes, contactosRes, ratesRes] = await Promise.all([
        bikApi.get(`/accounts/user/${payload.uid}`),
        bikApi.get('/contacts'),
        bikApi.get('/currency/rates').catch(() => ({ data: { status: 'error' } }))
      ]);

      let sourceAccounts = [];
      let destinationAccounts = [];
      let exchangeRates = null;

      if (cuentasRes.data.status === 'success') {
        sourceAccounts = cuentasRes.data.data;
      }
      
      if (contactosRes.data.status === 'success') {
        destinationAccounts = contactosRes.data.data.filter(c => c.tipoDestinatario === 'BIK');
      }

      if (ratesRes.data.status === 'success') {
        const usdGtq = ratesRes.data.data.find(r => r.monedaBase === 'USD' && r.monedaDestino === 'GTQ');
        if (usdGtq) exchangeRates = usdGtq;
      }

      set({ sourceAccounts, destinationAccounts, exchangeRates, loadingData: false });
    } catch (err) {
      console.error("Error al cargar datos:", err);
      set({ error: 'Error al cargar datos', loadingData: false });
    }
  },

  executeTransfer: async (transferData) => {
    set({ transferLoading: true, error: null });
    try {
      const response = await bikApi.post('/transactions/transfer', transferData);
      set({ transferLoading: false });
      return response.data;
    } catch (err) {
      set({ 
        transferLoading: false, 
        error: err.response?.data?.message || 'Error al procesar la transferencia.' 
      });
      throw err;
    }
  },

  addContact: async (contactData) => {
    try {
      await bikApi.post('/contacts', contactData);
      await get().fetchTransferData();
      return true;
    } catch (err) {
      throw err;
    }
  },

  executeMobileTransfer: async (data) => {
    set({ transferLoading: true, error: null });
    try {
      const response = await bikApi.post('/transactions/mobile', data);
      set({ transferLoading: false });
      return response.data;
    } catch (err) {
      set({ transferLoading: false, error: err.response?.data?.message || 'Error en transferencia móvil' });
      throw err;
    }
  },

  executeInternationalTransfer: async (data) => {
    set({ transferLoading: true, error: null });
    try {
      const response = await bikApi.post('/transactions/international', data);
      set({ transferLoading: false });
      return response.data;
    } catch (err) {
      set({ transferLoading: false, error: err.response?.data?.message || 'Error en transferencia internacional' });
      throw err;
    }
  },

  executeAchTransfer: async (data) => {
    set({ transferLoading: true, error: null });
    try {
      const response = await bikApi.post('/transactions/ach', data);
      set({ transferLoading: false });
      return response.data;
    } catch (err) {
      set({ transferLoading: false, error: err.response?.data?.message || 'Error en transferencia ACH' });
      throw err;
    }
  },

  clearError: () => set({ error: null })
}));
