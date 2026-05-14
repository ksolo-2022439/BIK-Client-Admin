import { create } from 'zustand';
import { listRequests, getRequestById, updateRequestStatus, escalateRequest } from '../../../shared/api';

export const useRequestsStore = create((set, get) => ({
  requests: [],
  selectedRequest: null,
  loading: false,
  error: null,
  pagination: { page: 1, total: 0, pages: 1 },

  fetchRequests: async (params = {}) => {
    try {
      set({ loading: true, error: null });
      const response = await listRequests(params);
      set({ 
        requests: response.data.data, 
        pagination: response.data.pagination,
        loading: false 
      });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Error al obtener gestiones', loading: false });
    }
  },

  fetchRequestDetail: async (id) => {
    try {
      set({ loading: true, error: null });
      const response = await getRequestById(id);
      set({ selectedRequest: response.data.data, loading: false });
      return response.data.data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Error al cargar gestión', loading: false });
      throw error;
    }
  },

  changeRequestStatus: async (id, data) => {
    try {
      set({ loading: true, error: null });
      await updateRequestStatus(id, data);
      await get().fetchRequestDetail(id);
      return true;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Error al actualizar gestión', loading: false });
      throw error;
    }
  },

  escalate: async (id, data) => {
    try {
      set({ loading: true, error: null });
      await escalateRequest(id, data);
      await get().fetchRequestDetail(id);
      return true;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Error al escalar gestión', loading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null })
}));
