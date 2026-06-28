import { useState, useEffect } from 'react';
import { ChevronRight, User, KeyRound, Moon, Sun, Bell, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../../../shared/components/Modal';
import { useTheme } from '../../../shared/hooks/useTheme';
import { useSettingsStore } from './store/settingsStore';
import { useAuthStore } from '../../auth/store/authStore';
import Swal from 'sweetalert2';

export const GeneralSettingsView = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const { user: userData, logout } = useAuthStore();
  const { changePassword, loading } = useSettingsStore();

  const [loginAutomatico, setLoginAutomatico] = useState(() => localStorage.getItem('bik_auto_login') === 'true');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', newPw: '', confirm: '' });

  const toggleAutoLogin = () => { const v = !loginAutomatico; setLoginAutomatico(v); localStorage.setItem('bik_auto_login', String(v)); };

  const handleLogout = () => { 
    logout();
    navigate('/login'); 
  };

  const handleChangePw = async (e) => {
    e.preventDefault();
    if (passwordForm.newPw !== passwordForm.confirm) { 
      Swal.fire('Error', 'Las contraseñas no coinciden', 'error'); 
      return; 
    }
    if (passwordForm.newPw.length < 8) { 
      Swal.fire('Error', 'Mínimo 8 caracteres', 'error'); 
      return; 
    }

    try {
      await changePassword({
        currentPassword: passwordForm.current,
        newPassword: passwordForm.newPw
      });

      Swal.fire('Éxito', 'Contraseña actualizada correctamente.', 'success');
      setIsPasswordModalOpen(false);
      setPasswordForm({ current: '', newPw: '', confirm: '' });
    } catch (err) {
      Swal.fire('Error', err.message || 'Error al actualizar contraseña', 'error');
    }
  };

  const items = [
    { label: 'Configuración de Perfil', icon: <User size={20} />, action: () => setIsProfileModalOpen(true) },
    { label: 'Notificaciones', icon: <Bell size={20} />, action: () => navigate('/notificaciones') },
    { label: 'Contraseña', icon: <KeyRound size={20} />, action: () => setIsPasswordModalOpen(true) },
  ];

  const Toggle = ({ on, onToggle }) => (
    <button onClick={onToggle} className={`w-11 h-6 rounded-full flex items-center transition-colors px-1 ${on ? 'bg-bik-blue' : 'bg-gray-300 dark:bg-gray-600'}`}>
      <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${on ? 'translate-x-5' : ''}`}></div>
    </button>
  );

  return (
    <div className="w-full max-w-3xl mx-auto animate-fade-in pb-12">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Configuraciones</h1>
      <div className="space-y-8">
        <div>
          <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 px-1 mb-2">Generales</h2>
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
            {items.map((item, i) => (
              <button key={i} onClick={item.action} className="w-full flex justify-between items-center p-5 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center"><span className="mr-3 text-bik-blue dark:text-blue-400">{item.icon}</span>{item.label}</span>
                <ChevronRight size={20} className="text-bik-blue dark:text-blue-400 flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 px-1 mb-2">Apariencia y acceso</h2>
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-gray-100 dark:border-gray-700">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">{isDarkMode ? <Moon size={20} className="mr-3 text-bik-blue" /> : <Sun size={20} className="mr-3 text-bik-orange" />}Modo Oscuro</span>
              <Toggle on={isDarkMode} onToggle={toggleTheme} />
            </div>
            <div className="flex justify-between items-center p-5">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center"><KeyRound size={20} className="mr-3 text-bik-blue dark:text-blue-400" />Login Automático</span>
              <Toggle on={loginAutomatico} onToggle={toggleAutoLogin} />
            </div>
          </div>
        </div>
        <button onClick={handleLogout} className="w-full bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 font-bold py-4 rounded-lg transition-colors flex items-center justify-center border border-red-200 dark:border-red-800">
          <LogOut size={20} className="mr-2" /> Cerrar Sesión
        </button>
      </div>

      <Modal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} title="Mi Perfil">
        {userData ? (
          <div className="space-y-3">
            {[['Nombre', `${userData.nombres} ${userData.apellidos}`], ['DPI', userData.dpi], ['Email', userData.email], ['Teléfono', userData.telefono], ['Estado', userData.estado], ['Rol', userData.rol]].map(([l, v]) => (
              <div key={l} className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm text-gray-500 dark:text-gray-400">{l}</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{v || 'N/A'}</span>
              </div>
            ))}
          </div>
        ) : <p className="text-gray-500 text-center py-4">No se pudieron cargar los datos.</p>}
      </Modal>

      <Modal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} title="Cambiar Contraseña">
        <form onSubmit={handleChangePw} className="space-y-4">
          {[['Contraseña actual', 'current'], ['Nueva contraseña', 'newPw'], ['Confirmar contraseña', 'confirm']].map(([label, key]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
              <input type="password" value={passwordForm[key]} onChange={(e) => setPasswordForm({...passwordForm, [key]: e.target.value})} required minLength={key !== 'current' ? 8 : undefined}
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-bik-blue" />
            </div>
          ))}
          <button type="submit" disabled={loading} className="w-full bg-bik-blue hover:bg-blue-800 text-white font-semibold py-3 rounded-lg transition-colors mt-2 disabled:opacity-50">
            {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
          </button>
        </form>
      </Modal>
    </div>
  );
};