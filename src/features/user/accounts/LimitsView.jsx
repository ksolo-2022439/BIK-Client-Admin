import { useState, useEffect } from 'react';
import { ChevronRight, HelpCircle } from 'lucide-react';
import { useAccountsStore } from './store/accountsStore';
import { useAuthStore } from '../../auth/store/authStore';
import Swal from 'sweetalert2';

/**
 * Vista para gestionar los montos máximos permitidos en transferencias.
 * Permite al usuario establecer límites diarios y mensuales por motivos de seguridad.
 */
export const LimitsView = () => {
  const { user } = useAuthStore();
  const { accounts: cuentas, loading, fetchUserAccountsAndCards, updateAccountLimits } = useAccountsStore();
  const [cuentaSeleccionada, setCuentaSeleccionada] = useState(null);
  const [limiteTercerosDiario, setLimiteTercerosDiario] = useState('');
  const [limiteTercerosMensual, setLimiteTercerosMensual] = useState('');
  const [limiteOtrosDiario, setLimiteOtrosDiario] = useState('');
  const [limiteOtrosMensual, setLimiteOtrosMensual] = useState('');

  /**
   * Recupera las cuentas asociadas y preselecciona la primera cuenta monetaria/ahorro al cargar la vista.
   */
  useEffect(() => {
    const initData = async () => {
        if (user?.id || user?._id) {
            const data = await fetchUserAccountsAndCards(user.id || user._id);
            if (data && data.length > 0) {
              const mainCuentas = data.filter(c => !c.isCard);
              if (mainCuentas.length > 0) seleccionarCuenta(mainCuentas[0]);
            }
        }
    };
    initData();
  }, [user, fetchUserAccountsAndCards]);

  /**
   * Carga los límites transaccionales específicos de la cuenta seleccionada en el formulario.
   * 
   * @param {Object} cuenta - Objeto de cuenta bancaria seleccionada.
   */
  const seleccionarCuenta = (cuenta) => {
    setCuentaSeleccionada(cuenta);
    setLimiteTercerosDiario(cuenta.limiteTransferenciaDiario || 5000);
    setLimiteTercerosMensual(cuenta.limiteTransferenciasTercerosMensual || 60000);
    setLimiteOtrosDiario(cuenta.limiteOtrosBancosDiario || 20000);
    setLimiteOtrosMensual(cuenta.limiteOtrosBancosMensual || 40000);
  };

  const handleSelectChange = (e) => {
    const cuenta = cuentas.find(c => c.id === e.target.value);
    if(cuenta) seleccionarCuenta(cuenta);
  };

  /**
   * Envía la solicitud de actualización de límite transaccional diario a la API.
   */
  const handleSaveLimits = async () => {
    if (!cuentaSeleccionada) return;
    try {
      await updateAccountLimits(cuentaSeleccionada.id, {
        limiteTransferenciaDiario: Number(limiteTercerosDiario)
      });
      Swal.fire('Éxito', 'Límites de transferencia actualizados', 'success');
      
      const updatedAccount = { ...cuentaSeleccionada, limiteTransferenciaDiario: Number(limiteTercerosDiario) };
      setCuentaSeleccionada(updatedAccount);
    } catch(err) {
      Swal.fire('Error', err.message || 'Error al actualizar límites', 'error');
    }
  };

  const mainCuentas = cuentas.filter(c => !c.isCard);

  if (!loading && mainCuentas.length === 0) {
    return (
      <div className="w-full max-w-2xl mx-auto animate-fade-in pb-24 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Límites de transferencias</h1>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-12 border border-gray-100 dark:border-gray-700 shadow-sm transition-colors duration-300">
          <HelpCircle size={56} className="mx-auto text-bik-blue dark:text-blue-400 mb-4 animate-bounce" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No posee cuentas monetarias o de ahorro</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md mx-auto">Para configurar y modificar límites diarios de transferencias, primero debe solicitar la apertura de una cuenta de ahorros o monetaria.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in pb-24">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Límites de transferencias</h1>
        <button className="text-bik-blue dark:text-blue-400">
          <HelpCircle size={28} />
        </button>
      </div>

      <div className="space-y-8">
        <div>
          <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Cuenta del límite a modificar
          </label>
          <select 
            value={cuentaSeleccionada ? cuentaSeleccionada.id : ''}
            onChange={handleSelectChange}
            className="w-full bg-white dark:bg-gray-800 border-none shadow-sm rounded-lg p-5 font-bold text-bik-blue dark:text-blue-400 text-sm focus:ring-2 focus:ring-bik-blue outline-none transition-colors"
          >
            {mainCuentas.map(c => (
              <option key={c.id} value={c.id}>
                {c.tipo} {c.moneda} - {c.number}
              </option>
            ))}
          </select>
        </div>

        <div>
          <h2 className="text-lg font-bold text-bik-blue dark:text-blue-400 mb-4">Máximo a transferir a terceros</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Diario</label>
              <input 
                type="number" 
                value={limiteTercerosDiario}
                onChange={(e) => setLimiteTercerosDiario(e.target.value)}
                className="w-full bg-white dark:bg-gray-800 border-none shadow-sm rounded-lg p-4 font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-bik-blue outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Mensual</label>
              <input 
                type="number" 
                value={limiteTercerosMensual}
                onChange={(e) => setLimiteTercerosMensual(e.target.value)}
                className="w-full bg-white dark:bg-gray-800 border-none shadow-sm rounded-lg p-4 font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-bik-blue outline-none"
              />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold text-bik-blue dark:text-blue-400 mb-4">Máximo a transferir a otros bancos</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Diario</label>
              <input 
                type="number" 
                value={limiteOtrosDiario}
                onChange={(e) => setLimiteOtrosDiario(e.target.value)}
                className="w-full bg-white dark:bg-gray-800 border-none shadow-sm rounded-lg p-4 font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-bik-blue outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Mensual</label>
              <input 
                type="number" 
                value={limiteOtrosMensual}
                onChange={(e) => setLimiteOtrosMensual(e.target.value)}
                className="w-full bg-white dark:bg-gray-800 border-none shadow-sm rounded-lg p-4 font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-bik-blue outline-none"
              />
            </div>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 w-full p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 lg:relative lg:bg-transparent lg:border-none lg:p-0">
          <button 
            onClick={handleSaveLimits}
            disabled={loading || !cuentaSeleccionada}
            className={`w-full ${cuentaSeleccionada ? 'bg-bik-blue hover:bg-blue-800' : 'bg-slate-400'} text-white font-semibold py-4 rounded-lg transition-all shadow-md disabled:opacity-50 active:scale-[0.98]`}
          >
            {loading ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  );
};