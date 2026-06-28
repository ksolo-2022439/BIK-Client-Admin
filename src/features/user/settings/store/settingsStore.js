import { create } from 'zustand';
import { bikApi } from '../../../../shared/api/axiosInstance';

export const useSettingsStore = create((set) => ({
  loading: false,
  error: null,

  changePassword: async (data) => {
    set({ loading: true, error: null });
    try {
      const res = await bikApi.put('/users/change-password', data);
      set({ loading: false });
      return res.data;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Error al cambiar contraseña', loading: false });
      throw err;
    }
  }
}));
