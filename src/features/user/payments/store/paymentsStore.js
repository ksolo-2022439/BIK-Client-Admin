import { create } from 'zustand';
import { bikApi } from '../../../../shared/api/axiosInstance';

export const usePaymentsStore = create((set) => ({
  loading: false,
  error: null,

  payService: async (data) => {
    set({ loading: true, error: null });
    try {
      const res = await bikApi.post('/services/pay', data);
      set({ loading: false });
      return res.data;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Error al pagar servicio', loading: false });
      throw err;
    }
  },

  payQr: async (data) => {
    set({ loading: true, error: null });
    try {
      const res = await bikApi.post('/qr/pay', data);
      set({ loading: false });
      return res.data;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Error al procesar pago QR', loading: false });
      throw err;
    }
  }
}));
