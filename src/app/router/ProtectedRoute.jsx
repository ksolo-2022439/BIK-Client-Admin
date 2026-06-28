import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../shared/hooks/useAuth';

/**
 * Guard de seguridad general.
 * Verifica únicamente la existencia de sesión activa.
 */
export const ProtectedRoute = () => {
    const { token, isAuthenticated } = useAuth();

    if (!isAuthenticated || !token) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};
