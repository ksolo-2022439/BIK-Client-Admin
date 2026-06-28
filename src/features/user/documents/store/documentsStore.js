import { create } from 'zustand';
import { bikApi } from '../../../../shared/api/axiosInstance';

export const useDocumentsStore = create((set) => ({
  documents: [],
  loading: false,
  error: null,

  fetchDocuments: async () => {
    set({ loading: true, error: null });
    try {
      const res = await bikApi.get('/documents');
      set({ documents: res.data.data || res.data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  signDocument: async (id) => {
    set({ loading: true, error: null });
    try {
      await bikApi.patch(`/documents/${id}/sign`);
      set((state) => ({
        documents: state.documents.map(d => d._id === id ? { ...d, estado: 'Firmado' } : d),
        loading: false
      }));
      return true;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Error al firmar documento', loading: false });
      return false;
    }
  }
}));
