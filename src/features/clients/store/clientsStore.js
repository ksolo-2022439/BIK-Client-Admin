import { create } from 'zustand';
import { listUsers, getFullClientProfile, createClient, updateClient, updateClientStatus } from '../../../shared/api';

export const useClientsStore = create((set, get) => ({
  clients: [],
  selectedClient: null,
  loading: false,
  error: null,
  pagination: { page: 1, total: 0, pages: 1 },

  fetchClients: async (params = {}) => {
    try {
      set({ loading: true, error: null });
      const response = await listUsers(params);
      set({ 
        clients: response.data.data, 
        pagination: response.data.pagination,
        loading: false 
      });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Error al obtener clientes', loading: false });
    }
  },

  fetchClientProfile: async (id) => {
    try {
      set({ loading: true, error: null });
      const response = await getFullClientProfile(id);
      set({ selectedClient: response.data.data, loading: false });
      return response.data.data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Error al cargar el perfil', loading: false });
      throw error;
    }
  },

  addClient: async (data) => {
    try {
      set({ loading: true, error: null });
      await createClient(data);
      set({ loading: false });
      return true;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Error al crear cliente', loading: false });
      return false;
    }
  },

  editClient: async (id, data) => {
    try {
      set({ loading: true, error: null });
      await updateClient(id, data);
      await get().fetchClientProfile(id);
      return true;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Error al actualizar cliente', loading: false });
      throw error;
    }
  },

  changeClientStatus: async (id, status) => {
    try {
      set({ loading: true, error: null });
      await updateClientStatus(id, { estado: status });
      await get().fetchClientProfile(id);
      return true;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Error al actualizar estado', loading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null })
}));
