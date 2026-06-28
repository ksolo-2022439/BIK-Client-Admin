import { create } from 'zustand';
import { bikApi } from '../../../../shared/api/axiosInstance';

export const useRequestsStore = create((set, get) => ({
  loadingRequests: false,
  error: null,

  createProductRequest: async (requestData) => {
    set({ loadingRequests: true, error: null });
    try {
      const response = await bikApi.post('/requests', requestData);
      set({ loadingRequests: false });
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al enviar la solicitud';
      set({ loadingRequests: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  fetchUserRequests: async () => {
    set({ loadingRequests: true, error: null });
    try {
      const response = await bikApi.get('/requests');
      set({ loadingRequests: false });
      return response.data.data || response.data;
    } catch (err) {
      set({ loadingRequests: false, error: 'Error al cargar solicitudes' });
      return [];
    }
  },

  clearError: () => set({ error: null })
}));
