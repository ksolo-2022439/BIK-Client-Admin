import { useState, useEffect } from 'react';
import { Lock, Unlock } from 'lucide-react';
import { useAccountsStore } from './store/accountsStore';
import { useAuthStore } from '../../auth/store/authStore';
import Swal from 'sweetalert2';

/**
 * Vista para gestionar bloqueos preventivos en cuentas y chequeras.
 * Proporciona un mecanismo rápido para inmovilizar fondos ante sospechas de fraude.
 */
export const BlocksView = () => {
  const [activeTab, setActiveTab] = useState('cuentas');
  const { user } = useAuthStore();
  const { accounts: cuentas, fetchUserAccountsAndCards, freezeAccount } = useAccountsStore();
  const [loadingId, setLoadingId] = useState(null);

  useEffect(() => { 
    if (user?.id || user?._id) {
      fetchUserAccountsAndCards(user.id || user._id);
    }
  }, [user, fetchUserAccountsAndCards]);

  const handleToggleFreeze = async (cuentaId, isFrozen) => {
    try {
      setLoadingId(cuentaId);
      await freezeAccount(cuentaId);
      Swal.fire('Éxito', `Cuenta ${isFrozen ? 'descongelada' : 'congelada'} exitosamente`, 'success');
    } catch (error) {
      Swal.fire('Error', error.message || 'Error al cambiar estado de cuenta', 'error');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Bloqueos</h1>

      <div className="flex border-b border-gray-300 dark:border-gray-700 mb-6 bg-white dark:bg-gray-900">
        <button
          onClick={() => setActiveTab('cuentas')}
          className={`flex-1 py-3 text-center font-semibold text-sm transition-colors ${
            activeTab === 'cuentas' 
              ? 'border-b-2 border-bik-blue text-bik-blue dark:border-blue-400 dark:text-blue-400' 
              : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
          }`}
        >
          Cuentas
        </button>
        <button
          onClick={() => setActiveTab('cheques')}
          className={`flex-1 py-3 text-center font-semibold text-sm transition-colors ${
            activeTab === 'cheques' 
              ? 'border-b-2 border-bik-blue text-bik-blue dark:border-blue-400 dark:text-blue-400' 
              : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
          }`}
        >
          Cheques
        </button>
      </div>

      {activeTab === 'cuentas' && (
        <div className="space-y-4">
          <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Tus Cuentas</h2>
          
          {cuentas.map(cuenta => {
             const isFrozen = cuenta.estado === 'Congelada';
             return (
               <div key={cuenta.id} className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-5 flex justify-between items-center transition-colors">
                <div>
                  <p className="font-bold text-bik-blue dark:text-blue-400 text-sm">
                    {cuenta.number} {isFrozen && <span className="text-red-500 text-xs ml-2">(Congelada)</span>}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 uppercase">CUENTA {cuenta.tipo} {cuenta.moneda}</p>
                </div>
                <button 
                  onClick={() => handleToggleFreeze(cuenta.id, isFrozen)}
                  disabled={loadingId === cuenta.id}
                  className={`p-3 rounded-full transition-colors ${isFrozen ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30' : 'text-bik-blue hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30'}`}
                >
                  {loadingId === cuenta.id ? (
                    <span className="text-sm">...</span>
                  ) : isFrozen ? (
                    <Unlock size={24} />
                  ) : (
                    <Lock size={24} />
                  )}
                </button>
              </div>
             );
          })}
        </div>
      )}

      {activeTab === 'cheques' && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No posees chequeras activas asociadas a tu usuario.
        </div>
      )}
    </div>
  );
};