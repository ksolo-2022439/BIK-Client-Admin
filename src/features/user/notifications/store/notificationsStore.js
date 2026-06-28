import { create } from 'zustand';
import { bikApi } from '../../../../shared/api/axiosInstance';

export const useNotificationsStore = create((set, get) => ({
  notifications: [],
  loading: false,
  error: null,

  fetchNotifications: async () => {
    set({ loading: true, error: null });
    try {
      const res = await bikApi.get('/notifications');
      const data = res.data.data || res.data.notifications || res.data || [];
      set({ notifications: Array.isArray(data) ? data : [], loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  markAsRead: async (id) => {
    try {
      await bikApi.patch(`/notifications/${id}/read`);
      set((state) => ({
        notifications: state.notifications.map(n => n._id === id ? { ...n, leido: true } : n)
      }));
    } catch (err) {
      console.error(err);
    }
  },

  markAllAsRead: async () => {
    const { notifications } = get();
    const unread = notifications.filter(n => !n.leido);
    try {
      await Promise.all(unread.map(n => bikApi.patch(`/notifications/${n._id}/read`)));
      set({
        notifications: notifications.map(n => ({ ...n, leido: true }))
      });
    } catch (err) {
      console.error(err);
    }
  }
}));
