import { create } from 'zustand';
import { searchUserByDpi, getCardsByUser, freezeCard } from '../../../shared/api';

/**
 * Almacén de estado global (Zustand) para la gestión administrativa de tarjetas de crédito y débito.
 */
export const useCardsStore = create((set, get) => ({
  cards: [],
  loading: false,
  error: null,
  toggling: null,

  /**
   * Obtiene de forma asíncrona la lista de tarjetas vinculadas a un cliente por su DPI.
   * 
   * @param {string} dpi - Documento de identificación personal del cliente.
   * @param {string} [filterTipo] - Filtro de tipo ("Credito" o "Debito").
   * @returns {Promise<boolean>} Devuelve true si la búsqueda concluye correctamente.
   */
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

  /**
   * Realiza la congelación temporal o desbloqueo de una tarjeta del cliente y actualiza el estado localmente.
   * 
   * @param {string} id - ID único de la tarjeta a congelar/descongelar.
   * @returns {Promise<boolean>} True si se procesa correctamente en la base de datos.
   */
  toggleCardFreeze: async (id) => {
    try {
      set({ toggling: id, error: null });
      await freezeCard(id);
      
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

  /**
   * Limpia la lista de tarjetas en el estado global.
   */
  clearCards: () => set({ cards: [] }),

  /**
   * Limpia cualquier mensaje de error registrado.
   */
  clearError: () => set({ error: null })
}));
