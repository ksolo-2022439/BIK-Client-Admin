import { create } from 'zustand';
import { bikApi } from '../../../../shared/api/axiosInstance';

export const useCardsStore = create((set) => ({
  cards: [],
  loading: false,
  error: null,

  fetchUserCards: async (userId) => {
    set({ loading: true, error: null });
    try {
      const response = await bikApi.get(`/cards/user/${userId}`);
      set({ 
        cards: response.data.data || response.data, 
        loading: false 
      });
    } catch (err) {
      set({ 
        error: err.response?.data?.message || 'Error al cargar tarjetas', 
        loading: false 
      });
    }
  },

  updateCardConfig: async (cardId, configs) => {
    set({ loading: true, error: null });
    try {
      await bikApi.patch(`/cards/${cardId}`, configs);
      set((state) => ({
        cards: state.cards.map(c => c._id === cardId ? { ...c, ...configs } : c),
        loading: false
      }));
      return true;
    } catch (err) {
      set({ 
        error: err.response?.data?.message || 'Error al actualizar tarjeta', 
        loading: false 
      });
      return false;
    }
  }
}));
