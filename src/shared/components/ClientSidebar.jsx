import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Menu, ArrowLeft, LogOut, LayoutDashboard, Send, CreditCard, ClipboardList, QrCode, ArrowRightLeft } from 'lucide-react';
import { useAuthStore } from '../../features/auth/store/authStore';

/**
 * Componente de navegación lateral para el cliente (Banca en Línea).
 * Administra el acceso a las rutas principales de banca digital.
 */
export const ClientSidebar = () => {
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const navigate = useNavigate();
  const logout = useAuthStore(state => state.logout);
  const user = useAuthStore(state => state.user);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const mainMenuItems = [
    { name: 'Cuentas', path: '/mi-banca/cuentas', icon: <LayoutDashboard size={20} /> },
    { name: 'Transferencias BIK', path: '/mi-banca/transferencias/internas', icon: <ArrowRightLeft size={20} /> },
    { name: 'Transferencias Móviles', path: '/mi-banca/transferencias/moviles', icon: <Send size={20} /> },
    { name: 'Pago QR', path: '/mi-banca/pago-qr', icon: <QrCode size={20} /> },
    { name: 'Gestiones en Línea', path: '/mi-banca/gestiones/en-linea', icon: <ClipboardList size={20} /> },
    { name: 'Tarjetas', path: '/mi-banca/tarjetas/configuracion', icon: <CreditCard size={20} /> }
  ];

  const moreMenuItems = [
    { name: 'Transferencias Otros Bancos', path: '/mi-banca/transferencias/ach' },
    { name: 'Transferencias Internacionales', path: '/mi-banca/transferencias/internacionales' },
    { name: 'Cobro de Remesas', path: '/mi-banca/remesas/cobro' },
    { name: 'Negociación de Divisas', path: '/mi-banca/divisas/negociacion' },
    { name: 'Tipo de Cambio', path: '/mi-banca/divisas/tipo-cambio' },
    { name: 'Solicitud de Productos', path: '/mi-banca/gestiones/solicitud-productos' },
    { name: 'Firma de Documentos', path: '/mi-banca/gestiones/documentos' },
    { name: 'Finanzas Personales', path: '/mi-banca/finanzas' },
    { name: 'Seguros', path: '/mi-banca/seguros' },
    { name: 'Mantenimiento de Cuentas', path: '/mi-banca/cuentas/mantenimiento' },
    { name: 'Límites de Transferencias', path: '/mi-banca/cuentas/limites' },
    { name: 'Bloqueos', path: '/mi-banca/cuentas/bloqueos' },
    { name: 'Notificaciones', path: '/mi-banca/notificaciones' },
    { name: 'Tutoriales', path: '/mi-banca/tutoriales' },
    { name: 'Configuraciones', path: '/mi-banca/configuracion/general' }
  ];

  return (
    <aside className="w-72 bg-bik-blue text-white flex flex-col h-full shadow-lg transition-all duration-300 z-50">
      <div className="p-6 flex justify-center items-center border-b border-white/10">
        <img src="/logo-bik.png" alt="Logo BIK" className="h-16 object-contain" />
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        {!isMoreMenuOpen ? (
          <nav className="flex flex-col space-y-1 px-4">
            {mainMenuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-lg transition-colors font-medium ${isActive ? 'bg-white/20 text-bik-yellow' : 'hover:bg-white/10 text-white'}`
                }
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </NavLink>
            ))}
            <button
              onClick={() => setIsMoreMenuOpen(true)}
              className="flex items-center w-full px-4 py-3 hover:bg-white/10 rounded-lg text-left transition-colors font-medium mt-4 border-t border-white/10 pt-4"
            >
              <Menu size={20} className="mr-3" />
              Más opciones
            </button>
          </nav>
        ) : (
          <nav className="flex flex-col space-y-1 px-4 animate-fade-in">
            <button
              onClick={() => setIsMoreMenuOpen(false)}
              className="flex items-center px-4 py-3 bg-white/5 hover:bg-white/20 rounded-lg text-left mb-4 transition-colors font-semibold"
            >
              <ArrowLeft size={20} className="mr-3 text-bik-orange" />
              Regresar
            </button>
            {moreMenuItems.map((item, index) => (
              <NavLink
                key={index}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 rounded-lg text-left text-sm transition-colors font-medium ${isActive ? 'bg-white/20 text-bik-yellow' : 'text-white/80 hover:bg-white/5 hover:text-white'}`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </nav>
        )}
      </div>

      {/* Perfil del Cliente */}
      <div className="p-4 border-t border-white/10 space-y-3">
        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 rounded-full bg-bik-orange flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {user?.nombres?.charAt(0) || 'C'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {user?.nombres || 'Cliente'} {user?.apellidos || ''}
            </p>
            <p className="text-xs text-white/50 truncate">Cliente BIK</p>
          </div>
        </div>
        
        {isMoreMenuOpen && (
          <button onClick={handleLogout} className="flex items-center justify-center w-full px-4 py-2.5 bg-bik-red hover:bg-red-700 rounded-lg transition-colors font-bold text-white">
            <LogOut size={18} className="mr-2" />
            Cerrar Sesión
          </button>
        )}
      </div>
    </aside>
  );
};
