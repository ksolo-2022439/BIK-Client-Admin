/**
 * Hook de autenticación para el panel administrativo.
 * Proporciona acceso a los datos del usuario autenticado y funciones de sesión.
 */
export const useAuth = () => {
  const getUser = () => {
    try {
      const user = localStorage.getItem('bik_admin_user');
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  };

  const getToken = () => localStorage.getItem('bik_admin_token');
  const getRol = () => localStorage.getItem('bik_admin_rol') || '';
  const isAuthenticated = () => !!getToken();

  const logout = () => {
    localStorage.removeItem('bik_admin_token');
    localStorage.removeItem('bik_admin_user');
    localStorage.removeItem('bik_admin_rol');
    window.location.href = '/login';
  };

  return {
    user: getUser(),
    token: getToken(),
    rol: getRol(),
    isAuthenticated: isAuthenticated(),
    logout
  };
};
