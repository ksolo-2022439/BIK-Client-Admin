import { create } from 'zustand';
import { bikApi } from '../../../../shared/api/axiosInstance';
import { useAuthStore } from '../../../auth/store/authStore';

/**
 * Almacén de estado global (Zustand) para la sincronización y gestión de cuentas y tarjetas de débito/crédito.
 * Implementa normalizaciones de esquemas y controles transaccionales.
 */
export const useAccountsStore = create((set, get) => ({
  accounts: [],
  cards: [],
  loading: false,
  error: null,
  recentTransactions: [],
  loadingTransactions: false,

  /**
   * Recupera las cuentas monetarias/ahorros y tarjetas de crédito asociadas al identificador del cliente.
   * Realiza un mapeo y normalización estructural de campos (como publicId y tipo de cuenta).
   * 
   * @param {string} [userId] - Identificador único de usuario (opcional, lee de localStorage por defecto).
   * @returns {Promise<Array>} Lista unificada de cuentas y tarjetas.
   */
  fetchUserAccountsAndCards: async (userId) => {
    set({ loading: true, error: null });
    try {
      if (!userId) {
        const authUser = useAuthStore.getState().user;
        if (authUser) {
          userId = authUser.publicId || authUser.id || authUser._id;
        }
      }

      if (!userId) {
        const userStr = localStorage.getItem('bik_user');
        if (userStr) {
          const user = JSON.parse(userStr);
          userId = user.publicId || user.id || user._id;
        }
      }

      if (!userId) {
        set({ accounts: [], cards: [], loading: false, error: 'Usuario no encontrado' });
        return;
      }

      const [accRes, cardRes] = await Promise.all([
        bikApi.get(`/accounts/user/${userId}`).catch(() => ({ data: { data: [] } })),
        bikApi.get(`/cards/user/${userId}`).catch(() => ({ data: { data: [] } }))
      ]);

      const rawAcc = accRes.data.data || accRes.data || [];
      const accData = (Array.isArray(rawAcc) ? rawAcc : []).map(a => ({
        ...a,
        id: a.publicId || a._id,
        name: a.tipo + (a.moneda === 'USD' ? ' (USD)' : ''),
        number: a.numeroCuenta || 'N/A',
        moneda: a.moneda || 'GTQ',
        isSavings: a.tipo && a.tipo.toLowerCase().includes('ahorro'),
        balance: a.saldo || 0,
        isFavorite: a.isFavorite || false,
        isCard: false,
        blocked: a.saldoBloqueado || 0,
        reserved: a.saldoRetenido || 0,
      }));

      const rawCards = cardRes.data.data || cardRes.data || [];
      const normalizedCards = (Array.isArray(rawCards) ? rawCards : []).map(c => ({
        ...c,
        id: c.publicId || c._id,
        cuentaVinculadaId: c.cuentaVinculadaId?.publicId || c.cuentaVinculadaId?._id || c.cuentaVinculadaId
      }));

      const creditCards = normalizedCards.filter(c => 
        c.tipo && (c.tipo.toLowerCase().includes('credito') || c.tipo.toLowerCase().includes('crédito'))
      );
      
      const cardData = creditCards.map(c => ({
        ...c,
        name: c.tipo || 'Tarjeta de Crédito',
        number: c.numeroTarjeta ? `**** **** **** ${c.numeroTarjeta.slice(-4)}` : 'N/A',
        moneda: 'GTQ',
        balance: c.limiteCredito || 0,
        creditUsed: c.saldoUtilizado || 0,
        creditLimit: c.limiteCredito || 0,
        isFavorite: false,
        isCard: true,
      }));

      const combinedAccounts = [...accData, ...cardData];

      set({
        accounts: combinedAccounts,
        cards: normalizedCards,
        loading: false,
        error: null
      });

      return combinedAccounts;
    } catch (error) {
      console.error('Error fetching accounts and cards:', error);
      set({ loading: false, error: 'Error al cargar las cuentas' });
      return [];
    }
  },

  /**
   * Alterna el estado de favorita de una cuenta de origen de forma optimista.
   * 
   * @param {string} id - ID de la cuenta.
   * @param {boolean} currentFav - Estado actual de favorito.
   */
  toggleFavoriteAccount: async (id, currentFav) => {
    const { accounts } = get();
    set({
      accounts: accounts.map(a => a.id === id ? { ...a, isFavorite: !currentFav } : a)
    });

    try {
      await bikApi.patch(`/accounts/${id}/favorite`);
    } catch (err) {
      console.error('Error toggling favorite:', err);
      set({
        accounts: accounts.map(a => a.id === id ? { ...a, isFavorite: currentFav } : a)
      });
    }
  },

  /**
   * Recupera el historial transaccional de una cuenta específica con un límite de 10 registros.
   * 
   * @param {string} accountId - ID de la cuenta bancaria.
   */
  fetchAccountTransactions: async (accountId) => {
    set({ loadingTransactions: true });
    try {
      const res = await bikApi.get(`/transactions/history?accountId=${accountId}&limit=10`);
      set({ 
        recentTransactions: res.data.data || [], 
        loadingTransactions: false 
      });
    } catch (error) {
      console.error("Error cargando transacciones", error);
      set({ recentTransactions: [], loadingTransactions: false });
    }
  },
  
  /**
   * Limpia la lista de transacciones recientes precargadas.
   */
  clearTransactions: () => set({ recentTransactions: [] }),
  
  /**
   * Actualiza los límites diarios de transferencias de la cuenta.
   * 
   * @param {string} accountId - ID de la cuenta bancaria.
   * @param {Object} limits - Payload conteniendo límites de transferencias internas o externas.
   * @returns {Promise<boolean>} Estado de la operación.
   */
  updateAccountLimits: async (accountId, limits) => {
    set({ loading: true, error: null });
    try {
      await bikApi.patch(`/accounts/${accountId}/limits`, limits);
      await get().fetchUserAccountsAndCards();
      return true;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Error al actualizar límites', loading: false });
      return false;
    }
  },

  /**
   * Congela o congela temporalmente una cuenta bancaria (cambio de estado Activa/Inactiva).
   * 
   * @param {string} accountId - ID de la cuenta bancaria.
   * @returns {Promise<boolean>} Estado de la operación.
   */
  freezeAccount: async (accountId) => {
    set({ loading: true, error: null });
    try {
      await bikApi.patch(`/accounts/${accountId}/freeze`);
      await get().fetchUserAccountsAndCards();
      return true;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Error al cambiar estado de cuenta', loading: false });
      return false;
    }
  }
}));
