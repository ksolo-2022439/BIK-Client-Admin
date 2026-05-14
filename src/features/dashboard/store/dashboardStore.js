import { create } from 'zustand';
import { getDashboardStats } from '../../../shared/api';

export const useDashboardStore = create((set) => ({
  stats: null,
  loading: false,
  error: null,

  fetchStats: async () => {
    try {
      set({ loading: true, error: null });
      const response = await getDashboardStats();
      set({ stats: response.data.data, loading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Error al obtener estadísticas del dashboard', loading: false });
    }
  },

  clearError: () => set({ error: null })
}));
