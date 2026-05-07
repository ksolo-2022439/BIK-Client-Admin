import { Navigate, Outlet } from 'react-router-dom';
import Swal from 'sweetalert2';

export const AdminProtectedRoute = () => {
    const token = localStorage.getItem('bik_token');
    const rol = localStorage.getItem('bik_rol');

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (rol !== 'ADMIN_ROLE') {
        Swal.fire({
            icon: 'error',
            title: 'Acceso Denegado',
            text: 'No tienes los permisos necesarios para acceder a la consola de administración.',
            confirmButtonColor: '#104F8C'
        });
        localStorage.removeItem('bik_token');
        localStorage.removeItem('bik_rol');
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};