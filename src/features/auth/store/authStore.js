import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { loginAdmin } from '../../../shared/api';
import { bikApi } from '../../../shared/api/axiosInstance'; // Import for profile fetching
import { jwtDecode } from 'jwt-decode';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      role: null,
      loading: false,
      error: null,

      login: async (credentials) => {
        try {
          set({ loading: true, error: null });
          const response = await loginAdmin(credentials);
          
          if (response.data.status === 'success') {
            const { token, rol } = response.data;
            const ADMIN_ROLES = ['Administrador', 'Admin_Gestiones', 'Soporte_Remoto', 'Soporte_Presencial', 'Cajero'];
            
            if (!ADMIN_ROLES.includes(rol)) {
              set({ error: 'Acceso denegado. Rol no administrativo.', loading: false });
              return false;
            }

            // Decode token safely (assuming jwt-decode is available or we decode base64 manually)
            let userId = null;
            try {
               const payload = JSON.parse(atob(token.split('.')[1]));
               userId = payload.uid;
            } catch(e) {
               console.error("Error decoding token");
            }

            let userData = { id: userId };
            
            // Temporary set token so bikApi can use it for the next call if interceptor reads from state
            // But interceptor reads from localStorage right now. 
            // We should ideally update interceptor later. For now we set it to localStorage too so it works.
            localStorage.setItem('bik_admin_token', token);

            try {
              if (userId) {
                // Pasamos el token explícitamente para asegurar que esta primera llamada funcione
                // independientemente de la velocidad de sincronización del localStorage/Zustand
                const userResponse = await bikApi.get(`/users/id/${userId}`, {
                  headers: { Authorization: `Bearer ${token}` }
                });
                
                if (userResponse.data.status === 'success') {
                  userData = userResponse.data.data;
                }
              }
            } catch (err) {
              console.warn('No se pudo obtener el perfil del usuario', err);
            }

            set({
              token,
              role: rol,
              user: userData,
              loading: false
            });
            return true;
          }
          return false;
        } catch (error) {
          set({
            error: error.response?.data?.message || 'Error de conexión con el servidor de autenticación.',
            loading: false
          });
          return false;
        }
      },

      logout: () => {
        localStorage.removeItem('bik_admin_token');
        set({ user: null, token: null, role: null, error: null });
      },

      clearError: () => set({ error: null })
    }),
    {
      name: 'bik-admin-auth', // name of the item in the storage (must be unique)
      partialize: (state) => ({ token: state.token, role: state.role, user: state.user }),
    }
  )
);
