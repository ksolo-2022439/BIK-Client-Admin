import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { bikApi } from '../../shared/api/axiosInstance';
import { Lock, User, AlertCircle, Loader2, Shield } from 'lucide-react';

const ADMIN_ROLES = ['Administrador', 'Admin_Gestiones', 'Soporte_Remoto', 'Soporte_Presencial', 'Cajero'];

export const LoginView = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ identificador: '', password: '' });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const authUrl = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:5213';
      const response = await axios.post(`${authUrl}/api/auth/login`, formData);

      if (response.data.status === 'success') {
        const { token, rol } = response.data;

        // SEGURIDAD: Verificar que el rol sea uno de los roles administrativos
        if (!ADMIN_ROLES.includes(rol)) {
          setError('Acceso denegado. Esta plataforma es exclusiva para personal del banco. Si eres cliente, utiliza la aplicación de cliente.');
          setIsLoading(false);
          return;
        }

        localStorage.setItem('bik_admin_token', token);
        localStorage.setItem('bik_admin_rol', rol);

        // Decodificar JWT para obtener uid
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        const userId = tokenPayload.uid;

        // Obtener datos completos del empleado
        try {
          const userResponse = await bikApi.get(`/users/id/${userId}`);
          if (userResponse.data.status === 'success') {
            localStorage.setItem('bik_admin_user', JSON.stringify(userResponse.data.data));
          }
        } catch (userErr) {
          console.warn('No se pudieron cargar los datos del perfil:', userErr.message);
        }

        navigate('/dashboard');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Error de conexión con el servidor de autenticación.';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8 transition-colors duration-300">

        <div className="text-center mb-8">
          <img src="/logo-bik.png" alt="BIK Logo" className="h-16 mx-auto mb-4" />
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-bik-blue/10 dark:bg-bik-blue/20 rounded-full mb-4">
            <Shield size={14} className="text-bik-blue dark:text-blue-400" />
            <span className="text-xs font-bold text-bik-blue dark:text-blue-400 uppercase tracking-wider">Panel Administrativo</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Acceso de Empleados</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">Ingresa tus credenciales corporativas para acceder</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg flex items-start text-red-600 dark:text-red-400 text-sm">
            <AlertCircle size={20} className="mr-2 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              DPI, Correo o Teléfono
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                name="identificador"
                value={formData.identificador}
                onChange={handleInputChange}
                required
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-bik-blue focus:border-transparent transition-all"
                placeholder="Ej. gestiones@bik.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={18} className="text-gray-400" />
              </div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-bik-blue focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-bik-blue hover:bg-blue-800 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-colors disabled:opacity-70 disabled:cursor-not-allowed mt-4"
          >
            {isLoading ? <Loader2 size={20} className="animate-spin mr-2" /> : null}
            {isLoading ? 'Autenticando...' : 'Ingresar al Panel'}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 text-center">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            © {new Date().getFullYear()} Banco Informático Kinal — Uso exclusivo para personal autorizado
          </p>
        </div>
      </div>
    </div>
  );
};
