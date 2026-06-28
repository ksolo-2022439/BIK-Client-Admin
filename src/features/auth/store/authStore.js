import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { loginAdmin } from '../../../shared/api';
import { bikApi } from '../../../shared/api/axiosInstance';

/**
 * Almacén de estado global (Zustand) persistido para la autenticación y sesión de usuarios y personal.
 */
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      role: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      /**
       * Realiza el inicio de sesión del usuario (cliente o administrativo) y recupera su perfil.
       * 
       * @param {Object} credentials - Credenciales de acceso (identificador/email y password).
       * @returns {Promise<string|boolean>} El rol del usuario si el login fue exitoso, false en caso contrario.
       */
      login: async (credentials) => {
        try {
          set({ loading: true, error: null });
          
          // Soporta tanto { identificador, password } del cliente como { email, password } del admin
          const payloadRequest = {
            identificador: credentials.identificador || credentials.email,
            password: credentials.password
          };

          const response = await loginAdmin(payloadRequest);
          
          if (response.data.status === 'success') {
            const { token, rol } = response.data;
            
            let userId = null;
            try {
               const payload = JSON.parse(atob(token.split('.')[1]));
               userId = payload.uid;
            } catch(e) {
               console.error("Error decoding token");
            }

            let userData = { id: userId, publicId: userId };
            
            localStorage.setItem('bik_token', token);

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
              isAuthenticated: true,
              loading: false,
              error: null
            });
            return rol;
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
       * Registra un nuevo usuario en la plataforma de BIK por medio de la API principal.
       * 
       * @param {Object} userData - Datos de registro (DPI, Nombre, Correo, Teléfono, Password).
       * @returns {Promise<Object>} Respuesta del servidor.
       */
      register: async (userData) => {
        set({ loading: true, error: null });
        try {
          const response = await bikApi.post('/users/register', userData);
          set({ loading: false });
          return response.data;
        } catch (error) {
          set({ 
            loading: false, 
            error: error.response?.data?.message || 'Error en el registro' 
          });
          throw error;
        }
      },

      /**
       * Cierra la sesión activa removiendo los tokens de seguridad y limpiando el estado global.
       */
      logout: () => {
        localStorage.removeItem('bik_token');
        localStorage.removeItem('bik_admin_token');
        set({ user: null, token: null, role: null, isAuthenticated: false, error: null });
      },

      /**
       * Limpia el mensaje de error activo en el estado de autenticación.
       */
      clearError: () => set({ error: null })
    }),
    {
      name: 'bik-auth-storage',
      partialize: (state) => ({ token: state.token, role: state.role, user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
