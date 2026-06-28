import { useAuthStore } from '../../features/auth/store/authStore';

/**
 * Hook de autenticación para toda la aplicación (Panel de Admin y Banca de Cliente).
 */
export const useAuth = () => {
  const user = useAuthStore(state => state.user);
  const token = useAuthStore(state => state.token);
  const rol = useAuthStore(state => state.role);
  const logout = useAuthStore(state => state.logout);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  const isClient = rol === 'Cliente';
  const isAdmin = ['Administrador', 'Admin_Gestiones', 'Soporte_Remoto', 'Soporte_Presencial', 'Cajero'].includes(rol);

  return {
    user,
    token,
    rol,
    isAuthenticated,
    isClient,
    isAdmin,
    logout
  };
};
