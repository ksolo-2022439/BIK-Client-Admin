import { create } from 'zustand';
import { bikApi } from '../../../../shared/api/axiosInstance';

/**
 * Almacén de estado global (Zustand) para la consulta de analíticas y gastos financieros del cliente.
 */
export const useFinancesStore = create((set) => ({
  analytics: [],
  loading: false,
  error: null,

  /**
   * Recupera las analíticas e historial clasificado de gastos del usuario autenticado.
   * Garantiza que la respuesta sea un arreglo para evitar inconsistencias en la UI.
   */
  fetchAnalytics: async () => {
    set({ loading: true, error: null });
    try {
      const res = await bikApi.get('/transactions/analytics');
      const data = res.data.data || res.data || [];
      set({ analytics: Array.isArray(data) ? data : [], loading: false });
    } catch (err) {
      set({ error: err.message, loading: false, analytics: [] });
    }
  }
}));
