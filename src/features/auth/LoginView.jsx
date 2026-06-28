import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { Lock, User, AlertCircle, Loader2, Landmark } from 'lucide-react';
import { getReadableError } from '../../shared/utils/errorMessages';

export const LoginView = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ identificador: '', password: '' });
  const login = useAuthStore(state => state.login);
  const loading = useAuthStore(state => state.loading);
  const error = useAuthStore(state => state.error);
  const clearError = useAuthStore(state => state.clearError);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const role = useAuthStore(state => state.role);

  useEffect(() => {
    if (isAuthenticated && role) {
      if (role === 'Cliente') {
        navigate('/mi-banca/cuentas');
      } else {
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, role, navigate]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) clearError();
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const userRole = await login(formData);
    if (userRole) {
      if (userRole === 'Cliente') {
        navigate('/mi-banca/cuentas');
      } else {
        navigate('/dashboard');
      }
    }
  };

  return (
    <div className="w-full max-w-md animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8 transition-colors duration-300">

        <div className="text-center mb-8">
          <img src="/logo-bik.png" alt="BIK Logo" className="h-16 mx-auto mb-4" />
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-bik-blue/10 dark:bg-bik-blue/20 rounded-full mb-4">
            <Landmark size={14} className="text-bik-blue dark:text-blue-400" />
            <span className="text-xs font-bold text-bik-blue dark:text-blue-400 uppercase tracking-wider">Banca Digital</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Bienvenido de nuevo</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">Ingresa tus credenciales para acceder a tu portal</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg flex items-start text-red-600 dark:text-red-400 text-sm">
            <AlertCircle size={20} className="mr-2 flex-shrink-0 mt-0.5" />
            <span>{getReadableError(error)}</span>
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
                placeholder="Ej. correo@bik.com"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Contraseña
              </label>
              <Link to="/recuperar" className="text-sm text-bik-blue dark:text-blue-400 font-medium hover:underline">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
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
            disabled={loading}
            className="w-full bg-bik-blue hover:bg-blue-800 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-colors disabled:opacity-70 disabled:cursor-not-allowed mt-4"
          >
            {loading ? <Loader2 size={20} className="animate-spin mr-2" /> : null}
            {loading ? 'Autenticando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700 text-center">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            ¿Aún no tienes cuenta en BIK?{' '}
            <Link to="/register" className="text-bik-orange dark:text-orange-400 font-bold hover:underline">
              Regístrate aquí
            </Link>
          </p>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 text-center">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            © {new Date().getFullYear()} Banco Informático Kinal — Banca Digital Unificada
          </p>
        </div>
      </div>
    </div>
  );
};
