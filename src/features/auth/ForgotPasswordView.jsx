import { Link } from 'react-router-dom';

/**
 * Vista de recuperación de contraseña con estilo adaptativo.
 * Aplica el esquema de colores para modo oscuro y animaciones de entrada
 * para una transición de navegación más natural.
 */
export const ForgotPasswordView = () => {
  return (
    <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-800 animate-in fade-in zoom-in duration-300">
      <div className="bg-bik-blue p-8 flex flex-col items-center text-center">
        <h2 className="text-white text-xl font-bold mb-2">Recuperación de Acceso</h2>
        <p className="text-blue-100 text-sm">Verifica tu identidad para restablecer tus credenciales.</p>
      </div>
      <div className="p-8">
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Código Único</label>
            <input
              type="text"
              maxLength="5"
              className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg p-3 focus:ring-2 focus:ring-bik-blue outline-none transition-all"
              placeholder="12345"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Usuario</label>
            <input
              type="text"
              className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg p-3 focus:ring-2 focus:ring-bik-blue outline-none transition-all"
              placeholder="Ingresa tu usuario"
              required
            />
          </div>
          <button className="w-full bg-bik-orange hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition-all duration-300 shadow-md mt-6 active:scale-95">
            Validar Identidad
          </button>
        </form>
        <div className="mt-6 text-center">
          <Link to="/login" className="text-sm text-bik-blue dark:text-blue-400 font-bold hover:underline transition-colors">Regresar al inicio de sesión</Link>
        </div>
      </div>
    </div>
  );
};