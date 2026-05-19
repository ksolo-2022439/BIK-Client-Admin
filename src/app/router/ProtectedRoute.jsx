import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../shared/hooks/useAuth';

/**
 * Guard de seguridad de rutas protegidas para el panel administrativo.
 * Restringe el acceso a usuarios no autenticados o con roles no autorizados para la administración.
 */
export const ProtectedRoute = () => {
    const { token, rol, isAuthenticated } = useAuth();

    const ADMIN_ROLES = ['Administrador', 'Admin_Gestiones', 'Soporte_Remoto', 'Soporte_Presencial', 'Cajero'];

    if (!isAuthenticated || !token) {
        return <Navigate to="/login" replace />;
    }

    if (rol && !ADMIN_ROLES.includes(rol)) {
        console.error("Acceso denegado: Rol no administrativo detectado.");
        setTimeout(() => {
            localStorage.clear();
            window.location.href = '/login';
        }, 0);
        return null;
    }

    return <Outlet />;
};
