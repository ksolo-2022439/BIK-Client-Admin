import { create } from 'zustand';
import { getAuditLogs } from '../../../shared/api';

export const useAuditStore = create((set) => ({
  logs: [],
  loading: false,
  error: null,

  fetchLogs: async () => {
    try {
      set({ loading: true, error: null });
      const response = await getAuditLogs();
      set({ logs: response.data.data || [], loading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Error al obtener registros de auditoría', loading: false });
    }
  },

  clearError: () => set({ error: null })
}));
