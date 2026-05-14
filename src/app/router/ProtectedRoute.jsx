import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../shared/hooks/useAuth';

/**
 * Guard de rutas protegidas para el panel administrativo.
 */
export const ProtectedRoute = () => {
    const { token, rol, isAuthenticated } = useAuth();

    const ADMIN_ROLES = ['Administrador', 'Admin_Gestiones', 'Soporte_Remoto', 'Soporte_Presencial', 'Cajero'];

    // Sin token o no autenticado → login
    if (!isAuthenticated || !token) {
        return <Navigate to="/login" replace />;
    }

    // Rol no autorizado → login
    if (rol && !ADMIN_ROLES.includes(rol)) {
        console.error("Acceso denegado: Rol no administrativo detectado.");
        // Si el rol no es válido para el admin, forzamos logout para evitar bucles
        setTimeout(() => {
            localStorage.clear();
            window.location.href = '/login';
        }, 0);
        return null;
    }

    return <Outlet />;
};
