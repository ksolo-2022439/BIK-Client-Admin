import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../shared/hooks/useAuth';

/**
 * Guard de seguridad para el panel administrativo.
 * Restringe el acceso a usuarios que no tengan un rol administrativo.
 */
export const AdminProtectedRoute = () => {
    const { token, rol, isAuthenticated } = useAuth();
    const ADMIN_ROLES = ['Administrador', 'Admin_Gestiones', 'Soporte_Remoto', 'Soporte_Presencial', 'Cajero'];

    if (!isAuthenticated || !token) {
        return <Navigate to="/login" replace />;
    }

    if (!ADMIN_ROLES.includes(rol)) {
        console.warn("Acceso denegado a panel administrativo. Redirigiendo a banca de clientes.");
        return <Navigate to="/mi-banca/cuentas" replace />;
    }

    return <Outlet />;
};