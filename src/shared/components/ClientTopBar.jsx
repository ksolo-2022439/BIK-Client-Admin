import { useState, useEffect, useRef } from 'react';
import { Bell, LogOut, Menu, Moon, Sun } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { useNavigate } from 'react-router-dom';
import { useNotificationsStore } from '../../features/user/notifications/store/notificationsStore';
import { useAuthStore } from '../../features/auth/store/authStore';

/**
 * TopBar de la banca en línea de clientes.
 * Muestra notificaciones en tiempo real, toggle de tema y cierre de sesión.
 */
export const ClientTopBar = ({ toggleMobileMenu }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const logout = useAuthStore(state => state.logout);
  const { notifications, fetchNotifications, markAllAsRead: handleMarkAllRead } = useNotificationsStore();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsNotificationsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const unreadCount = notifications.filter(n => !n.leido).length;

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `Hace ${mins} min`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `Hace ${hrs}h`;
    return `Hace ${Math.floor(hrs / 24)}d`;
  };

  return (
    <header className="bg-white dark:bg-gray-900 h-16 flex items-center justify-between lg:justify-end px-4 md:px-6 shadow-sm border-b border-gray-200 dark:border-gray-800 transition-colors duration-300 relative z-40">

      <button onClick={toggleMobileMenu}
        className="p-2 text-bik-blue dark:text-gray-300 lg:hidden hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
        <Menu size={24} />
      </button>

      <div className="flex space-x-3 items-center">
        <button onClick={toggleTheme}
          className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
          {isDarkMode ? <Sun size={22} /> : <Moon size={22} />}
        </button>

        <div className="relative" ref={dropdownRef}>
          <button onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <Bell size={22} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-bik-red rounded-full border-2 border-white dark:border-gray-900"></span>
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden animate-fade-in">
              <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-700/50">
                <h3 className="font-bold text-gray-900 dark:text-white text-sm">Notificaciones</h3>
                {unreadCount > 0 && (
                  <button onClick={handleMarkAllRead} className="text-xs text-bik-blue dark:text-blue-400 font-semibold hover:underline">Marcar leídas</button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">Sin notificaciones</div>
                ) : notifications.map(notif => (
                  <div key={notif._id} className={`p-4 border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors ${!notif.leido ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                    {notif.titulo && (
                      <p className={`text-sm ${!notif.leido ? 'font-bold text-gray-900 dark:text-white' : 'font-semibold text-gray-700 dark:text-gray-300'}`}>{notif.titulo}</p>
                    )}
                    <p className={`text-sm mt-0.5 ${!notif.leido ? 'font-medium text-gray-800 dark:text-gray-200' : 'text-gray-600 dark:text-gray-400'}`}>{notif.mensaje || notif.texto}</p>
                    <span className="text-xs text-gray-400 dark:text-gray-500 mt-1 block">{formatTime(notif.fecha || notif.createdAt)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <button onClick={handleLogout} className="p-2 text-bik-red hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors" title="Cerrar sesión">
          <LogOut size={22} />
        </button>
      </div>
    </header>
  );
};
