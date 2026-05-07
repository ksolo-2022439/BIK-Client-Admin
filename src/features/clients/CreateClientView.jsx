import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, User } from 'lucide-react';

export const CreateClientView = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Solo estructura visual de prueba, la creación real requiere Auth-Service y Server-Admin
  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/clientes')}
          className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Alta de Nuevo Cliente</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Registra un nuevo usuario en el sistema bancario</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
          <div className="w-10 h-10 rounded-full bg-bik-blue/10 flex items-center justify-center">
            <User size={20} className="text-bik-blue" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Datos del Cliente</h2>
        </div>

        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nombres</label>
              <input type="text" className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-bik-blue transition-all dark:text-white" placeholder="Nombres completos" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Apellidos</label>
              <input type="text" className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-bik-blue transition-all dark:text-white" placeholder="Apellidos completos" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">DPI</label>
              <input type="text" className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-bik-blue transition-all dark:text-white" placeholder="13 dígitos" maxLength={13} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Correo Electrónico</label>
              <input type="email" className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-bik-blue transition-all dark:text-white" placeholder="correo@ejemplo.com" />
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t border-gray-100 dark:border-gray-700 gap-4">
            <button type="button" onClick={() => navigate('/clientes')} className="px-6 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium rounded-lg transition-colors">
              Cancelar
            </button>
            <button type="button" disabled={loading} className="flex items-center gap-2 px-6 py-2.5 bg-bik-blue hover:bg-blue-800 text-white font-medium rounded-lg transition-colors shadow-md">
              <Save size={18} />
              Guardar Cliente
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
