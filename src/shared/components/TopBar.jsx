import { useState, useEffect, useRef } from 'react';
import { Bell, LogOut, Menu, Moon, Sun, Shield } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../hooks/useAuth';
import { usePermissions } from '../hooks/usePermissions';

export const TopBar = ({ toggleMobileMenu }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { logout, user } = useAuth();
  const { getRolDisplayName } = usePermissions();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setIsProfileOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-white dark:bg-gray-900 h-16 flex items-center justify-between lg:justify-end px-4 md:px-6 shadow-sm border-b border-gray-200 dark:border-gray-800 transition-colors duration-300 relative z-40">

      <button onClick={toggleMobileMenu}
        className="p-2 text-bik-blue dark:text-gray-300 lg:hidden hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
        <Menu size={24} />
      </button>

      <div className="flex space-x-2 items-center">
        {/* Indicador de rol */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-bik-blue/5 dark:bg-bik-blue/20 rounded-full mr-2">
          <Shield size={14} className="text-bik-blue dark:text-blue-400" />
          <span className="text-xs font-semibold text-bik-blue dark:text-blue-400">{getRolDisplayName()}</span>
        </div>

        {/* Toggle tema */}
        <button onClick={toggleTheme}
          className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Perfil */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-bik-orange flex items-center justify-center text-white font-bold text-sm">
              {user?.nombres?.charAt(0) || 'A'}
            </div>
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden animate-dropdown">
              <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                <p className="font-bold text-gray-900 dark:text-white text-sm">{user?.nombres} {user?.apellidos}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{user?.email}</p>
                <p className="text-xs text-bik-blue dark:text-blue-400 font-semibold mt-1">{getRolDisplayName()}</p>
              </div>
              <div className="p-2">
                <button
                  onClick={logout}
                  className="flex items-center w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <LogOut size={16} className="mr-2" />
                  Cerrar Sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
