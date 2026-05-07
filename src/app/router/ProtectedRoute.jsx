import { Navigate, Outlet } from 'react-router-dom';

/**
 * Guard de rutas protegidas para el panel administrativo.
 * Verifica tanto la existencia del token como que el rol NO sea 'Cliente'.
 * Esto agrega una capa de seguridad en el frontend para evitar que clientes accedan al panel.
 */
export const ProtectedRoute = () => {
    const token = localStorage.getItem('bik_admin_token');
    const rol = localStorage.getItem('bik_admin_rol');

    const ADMIN_ROLES = ['Administrador', 'Admin_Gestiones', 'Soporte_Remoto', 'Soporte_Presencial', 'Cajero'];

    // Sin token → login
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // Rol no autorizado → login con limpieza de sesión
    if (!ADMIN_ROLES.includes(rol)) {
        localStorage.removeItem('bik_admin_token');
        localStorage.removeItem('bik_admin_user');
        localStorage.removeItem('bik_admin_rol');
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};
