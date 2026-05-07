import { NavLink, useNavigate } from 'react-router-dom';
import { usePermissions } from '../hooks/usePermissions';
import { useAuth } from '../hooks/useAuth';
import {
  LayoutDashboard, Users, CreditCard, ClipboardList, Landmark,
  ArrowRightLeft, Shield, LogOut, Wallet, FileText
} from 'lucide-react';

/**
 * Sidebar de navegación del panel administrativo.
 * Filtra dinámicamente los módulos visibles según el rol del usuario autenticado.
 */
export const Sidebar = () => {
  const { canAccessModule } = usePermissions();
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const allMenuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} />, module: 'dashboard' },
    { name: 'Clientes', path: '/clientes', icon: <Users size={20} />, module: 'clients' },
    { name: 'Cuentas', path: '/cuentas', icon: <Wallet size={20} />, module: 'accounts' },
    { name: 'Gestiones', path: '/gestiones', icon: <ClipboardList size={20} />, module: 'requests' },
    { name: 'Ventanilla', path: '/ventanilla', icon: <Landmark size={20} />, module: 'teller' },
    { name: 'Tarjetas', path: '/tarjetas', icon: <CreditCard size={20} />, module: 'cards' },
    { name: 'Transacciones', path: '/transacciones', icon: <ArrowRightLeft size={20} />, module: 'transactions' },
    { name: 'Auditoría', path: '/auditoria', icon: <Shield size={20} />, module: 'audit' },
  ];

  const visibleItems = allMenuItems.filter(item => canAccessModule(item.module));

  return (
    <aside className="w-64 bg-bik-blue text-white flex flex-col h-full shadow-xl transition-all duration-300 z-50">
      {/* Logo */}
      <div className="p-5 flex justify-center items-center border-b border-white/10">
        <img src="/logo-bik.png" alt="Logo BIK" className="h-14 object-contain" />
      </div>

      {/* Badge del panel */}
      <div className="px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg">
          <FileText size={14} className="text-bik-yellow" />
          <span className="text-xs font-semibold text-bik-yellow tracking-wide uppercase">Panel Admin</span>
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <div className="flex flex-col space-y-1">
          {visibleItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 font-medium text-sm ${
                  isActive
                    ? 'bg-white/20 text-bik-yellow shadow-md'
                    : 'hover:bg-white/10 text-white/80 hover:text-white'
                }`
              }
            >
              <span className="mr-3 flex-shrink-0">{item.icon}</span>
              {item.name}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Perfil del empleado + Logout */}
      <div className="p-4 border-t border-white/10 space-y-3">
        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 rounded-full bg-bik-orange flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {user?.nombres?.charAt(0) || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {user?.nombres || 'Empleado'} {user?.apellidos || ''}
            </p>
            <p className="text-xs text-white/50 truncate">{user?.email || ''}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center justify-center w-full px-3 py-2.5 bg-white/10 hover:bg-bik-red rounded-lg transition-colors font-medium text-sm text-white/80 hover:text-white"
        >
          <LogOut size={16} className="mr-2" />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
};
