import { useAuthStore } from '../../features/auth/store/authStore';

/**
 * Hook de autenticación para el panel administrativo.
 * Ahora utiliza el store centralizado Zustand.
 */
export const useAuth = () => {
  const user = useAuthStore(state => state.user);
  const token = useAuthStore(state => state.token);
  const rol = useAuthStore(state => state.role);
  const logout = useAuthStore(state => state.logout);
  const isAuthenticated = !!token;

  return {
    user,
    token,
    rol,
    isAuthenticated,
    logout
  };
};
