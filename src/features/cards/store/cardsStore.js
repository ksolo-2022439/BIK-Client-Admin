import { create } from 'zustand';
import { searchUserByDpi, getCardsByUser, freezeCard } from '../../../shared/api';

export const useCardsStore = create((set, get) => ({
  cards: [],
  loading: false,
  error: null,
  toggling: null, // Guardar ID de la tarjeta que se está bloqueando/desbloqueando

  fetchCardsByDpi: async (dpi, filterTipo = '') => {
    try {
      set({ loading: true, error: null });
      const userRes = await searchUserByDpi(dpi);
      
      if (userRes.data.status === 'success') {
        const userId = userRes.data.data.publicId || userRes.data.data._id;
        const cardsRes = await getCardsByUser(userId);
        
        let fetchedCards = (cardsRes.data.data || []).map(c => ({
          ...c,
          clienteNombre: `${userRes.data.data.nombres} ${userRes.data.data.apellidos}`,
          clienteDpi: userRes.data.data.dpi
        }));

        if (filterTipo) {
          fetchedCards = fetchedCards.filter(c => {
            if (filterTipo === 'Credito') return c.tipo === 'Credito';
            if (filterTipo === 'Debito') return c.tipo.startsWith('Debito');
            return true;
          });
        }

        set({ cards: fetchedCards, loading: false });
        return true;
      }
    } catch (error) {
      if (error.response?.status === 404) {
        set({ cards: [], loading: false });
      } else {
        set({ error: error.response?.data?.message || 'Error buscando tarjetas.', loading: false });
      }
      return false;
    }
  },

  toggleCardFreeze: async (id) => {
    try {
      set({ toggling: id, error: null });
      await freezeCard(id);
      
      // Actualizar tarjeta en la lista local
      set((state) => ({
        cards: state.cards.map(card => {
          if (card._id === id || card.publicId === id) {
            return {
              ...card,
              configuraciones: {
                ...card.configuraciones,
                bloqueada: !card.configuraciones?.bloqueada
              }
            };
          }
          return card;
        }),
        toggling: null
      }));
      return true;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Error al cambiar estado de la tarjeta.', toggling: null });
      return false;
    }
  },

  clearCards: () => set({ cards: [] }),
  clearError: () => set({ error: null })
}));
