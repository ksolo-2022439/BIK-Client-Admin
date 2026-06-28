import { create } from 'zustand';
import { bikApi } from '../../../../shared/api/axiosInstance';

/**
 * Almacén de estado global (Zustand) para la gestión y contratación de pólizas de seguro.
 */
export const useInsuranceStore = create((set) => ({
  userInsurances: [],
  loading: false,
  error: null,

  /**
   * Recupera las pólizas de seguro activas o canceladas del usuario autenticado.
   * 
   * @returns {Promise<Array>} Lista de seguros.
   */
  fetchUserInsurances: async () => {
    set({ loading: true, error: null });
    try {
      const res = await bikApi.get('/insurance/user');
      const data = res.data.data || [];
      set({ userInsurances: data, loading: false });
      return data;
    } catch (err) {
      set({ error: err.message, loading: false });
      return [];
    }
  },

  /**
   * Envía una solicitud de suscripción a un plan de seguro.
   * 
   * @param {Object} data - Payload conteniendo usuario, cuentaId, tipo y primaMensual.
   * @returns {Promise<Object>} Respuesta del servidor.
   */
  enrollInsurance: async (data) => {
    set({ loading: true, error: null });
    try {
      const res = await bikApi.post('/insurance/enroll', data);
      set({ loading: false });
      return res.data;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Error al contratar seguro', loading: false });
      throw err;
    }
  },

  /**
   * Desactiva de forma lógica la póliza de seguro indicada por ID.
   * 
   * @param {string} id - ID de la póliza de seguro.
   * @returns {Promise<boolean>} Estado de la operación.
   */
  cancelInsurance: async (id) => {
    set({ loading: true, error: null });
    try {
      await bikApi.patch(`/insurance/${id}`, { estado: 'Cancelado' });
      set((state) => ({
        userInsurances: state.userInsurances.map(i => i._id === id ? { ...i, estado: 'Cancelado' } : i),
        loading: false
      }));
      return true;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Error al cancelar póliza', loading: false });
      return false;
    }
  }
}));
