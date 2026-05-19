import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { loginAdmin } from '../../../shared/api';
import { bikApi } from '../../../shared/api/axiosInstance';
import { jwtDecode } from 'jwt-decode';

/**
 * Almacén de estado global (Zustand) persistido para la autenticación y sesión de personal administrativo.
 */
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      role: null,
      loading: false,
      error: null,

      /**
       * Realiza el inicio de sesión del usuario administrativo, valida sus roles permitidos y recupera su perfil bancario.
       * 
       * @param {Object} credentials - Credenciales de acceso (email y password).
       * @returns {Promise<boolean>} True si el login fue exitoso y el rol está autorizado.
       */
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

            let userId = null;
            try {
               const payload = JSON.parse(atob(token.split('.')[1]));
               userId = payload.uid;
            } catch(e) {
               console.error("Error decoding token");
            }

            let userData = { id: userId };
            
            localStorage.setItem('bik_admin_token', token);

            try {
              if (userId) {
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

      /**
       * Cierra la sesión activa removiendo los tokens de seguridad y limpiando el estado global.
       */
      logout: () => {
        localStorage.removeItem('bik_admin_token');
        set({ user: null, token: null, role: null, error: null });
      },

      /**
       * Limpia el mensaje de error activo en el estado de autenticación.
       */
      clearError: () => set({ error: null })
    }),
    {
      name: 'bik-admin-auth',
      partialize: (state) => ({ token: state.token, role: state.role, user: state.user }),
    }
  )
);
