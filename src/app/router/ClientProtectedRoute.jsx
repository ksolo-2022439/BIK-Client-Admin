import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../shared/hooks/useAuth';

/**
 * Guard de seguridad para la banca en línea de clientes.
 * Restringe el acceso a usuarios que no tengan el rol de Cliente.
 */
export const ClientProtectedRoute = () => {
    const { token, rol, isAuthenticated } = useAuth();

    if (!isAuthenticated || !token) {
        return <Navigate to="/login" replace />;
    }

    if (rol !== 'Cliente') {
        console.warn("Acceso denegado a banca de clientes. Redirigiendo a panel administrativo.");
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};
