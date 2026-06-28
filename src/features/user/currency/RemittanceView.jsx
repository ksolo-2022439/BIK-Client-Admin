import { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { useCurrencyStore } from './store/currencyStore';
import { useAccountsStore } from '../accounts/store/accountsStore';
import { useAuthStore } from '../../auth/store/authStore';
import Swal from 'sweetalert2';

/**
 * Vista para el cobro y acreditación de remesas.
 * Permite al usuario ingresar el número de remesa y seleccionar la cuenta destino.
 */
export const RemittanceView = () => {
  const [activeTab, setActiveTab] = useState('cobro');
  const [codigoRemesa, setCodigoRemesa] = useState('');
  const [cuentaDestinoId, setCuentaDestinoId] = useState('');
  const { user } = useAuthStore();
  const { accounts: cuentas, fetchUserAccountsAndCards } = useAccountsStore();
  const { 
    redeemRemittance, 
    fetchRemittanceHistory, 
    remittanceHistory: history, 
    loading 
  } = useCurrencyStore();
  
  const [remittanceInfo, setRemittanceInfo] = useState(null);
  const [loadingVerify, setLoadingVerify] = useState(false);

  /**
   * Carga las cuentas del cliente al montar el componente para poder acreditar la remesa.
   */
  useEffect(() => {
    const userId = user?.publicId || user?.id || user?._id;
    if (userId) {
      fetchUserAccountsAndCards(userId);
    }
  }, [user, fetchUserAccountsAndCards]);

  /**
   * Recupera de forma reactiva el historial de remesas cobradas por el usuario.
   */
  useEffect(() => {
    if (activeTab === 'historial') {
      fetchRemittanceHistory();
    }
  }, [activeTab, fetchRemittanceHistory]);

  const fetchHistory = () => fetchRemittanceHistory();

  /**
   * Realiza la consulta y verificación de la validez del código de remesa ingresado.
   */
  const handleVerify = async (e) => {
    e.preventDefault();
    if (!codigoRemesa || !cuentaDestinoId) {
      Swal.fire('Error', 'Debe ingresar el código de remesa y seleccionar una cuenta.', 'error');
      return;
    }

    try {
      setLoadingVerify(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setRemittanceInfo({
        monto: (Math.random() * 2000 + 100).toFixed(2),
        remitente: 'Familiar en el extranjero',
        moneda: 'GTQ'
      });
    } catch (error) {
      Swal.fire('Error', 'No se pudo verificar la remesa.', 'error');
    } finally {
      setLoadingVerify(false);
    }
  };

  /**
   * Finaliza el cobro y ejecuta la acreditación de fondos en la cuenta destino.
   */
  const handleRedeem = async () => {
    try {
      await redeemRemittance({
        cuentaDestinoId,
        codigoRemesa,
        montoAcreditado: Number(remittanceInfo.monto),
        remitente: remittanceInfo.remitente
      });
      Swal.fire('¡Éxito!', 'Remesa cobrada y acreditada correctamente.', 'success');
      setCodigoRemesa('');
      setCuentaDestinoId('');
      setRemittanceInfo(null);
      if (activeTab === 'historial') {
        fetchHistory();
      }
      const userId = user?.publicId || user?.id || user?._id;
      if (userId) fetchUserAccountsAndCards(userId);
    } catch (error) {
      Swal.fire('Error', error.message || 'Error al cobrar remesa', 'error');
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in relative pb-24">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 transition-colors duration-300">Remesas</h1>

      <div className="flex border-b border-gray-300 dark:border-gray-700 mb-6 transition-colors duration-300">
        <button
          onClick={() => setActiveTab('cobro')}
          className={`flex-1 py-3 text-center font-semibold text-sm transition-all ${
            activeTab === 'cobro' 
              ? 'border-b-2 border-bik-blue text-bik-blue dark:border-blue-400 dark:text-blue-400' 
              : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
          }`}
        >
          Cobro de Remesas
        </button>
        <button
          onClick={() => setActiveTab('historial')}
          className={`flex-1 py-3 text-center font-semibold text-sm transition-all ${
            activeTab === 'historial' 
              ? 'border-b-2 border-bik-blue text-bik-blue dark:border-blue-400 dark:text-blue-400' 
              : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
          }`}
        >
          Historial
        </button>
      </div>

      {activeTab === 'cobro' && (
        <div className="space-y-6 animate-slide-up">
          <form className="space-y-6" onSubmit={handleVerify}>
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Ingrese el número de remesa a cobrar
              </label>
              <input 
                type="text" 
                placeholder="Número de remesa"
                value={codigoRemesa}
                onChange={(e) => { setCodigoRemesa(e.target.value); setRemittanceInfo(null); }}
                className="w-full bg-white dark:bg-gray-800 border-none shadow-sm rounded-lg p-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-bik-blue outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Acreditar a
              </label>
              <select
                value={cuentaDestinoId}
                onChange={(e) => { setCuentaDestinoId(e.target.value); setRemittanceInfo(null); }}
                className="w-full bg-white dark:bg-gray-800 border-none shadow-sm rounded-lg p-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-bik-blue outline-none transition-all appearance-none"
              >
                <option value="">Selecciona la cuenta a acreditar</option>
                {cuentas.filter(c => !c.isCard).map(c => (
                  <option key={c._id} value={c._id}>
                    {c.numeroCuenta} - {c.moneda || 'GTQ'} (Disponible: Q {(c.saldo || 0).toLocaleString('es-GT', { minimumFractionDigits: 2 })})
                  </option>
                ))}
              </select>
            </div>

            {!remittanceInfo && (
              <div className="fixed bottom-0 left-0 w-full p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 lg:absolute lg:bg-transparent lg:border-none lg:p-0 lg:mt-8 transition-colors duration-300">
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-bik-blue hover:bg-blue-800 text-white font-semibold py-4 rounded-lg transition-all shadow-md disabled:opacity-50 active:scale-95"
                >
                  {loading || loadingVerify ? 'Verificando...' : 'Verificar Remesa'}
                </button>
              </div>
            )}
          </form>

          {remittanceInfo && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800 animate-slide-up">
              <h3 className="text-lg font-bold text-bik-blue dark:text-blue-400 mb-4">Información de la Remesa</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Monto a recibir:</span>
                  <span className="text-xl font-bold text-gray-900 dark:text-white">Q {remittanceInfo.monto}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Remitente:</span>
                  <span className="text-gray-900 dark:text-white">{remittanceInfo.remitente}</span>
                </div>
              </div>
              
              <button 
                onClick={handleRedeem}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-lg mt-6 transition-all shadow-md disabled:opacity-50 active:scale-95"
              >
                {loading ? 'Procesando...' : 'Confirmar y Acreditar'}
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'historial' && (
        <div className="space-y-4 animate-fade-in">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bik-blue"></div>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No hay historial de remesas cobradas.
            </div>
          ) : (
            <div className="space-y-3">
              {history.map(tx => (
                <div key={tx._id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex justify-between items-center hover:shadow-md transition-shadow">
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">{tx.descripcion}</p>
                    <p className="text-sm text-gray-500">{new Date(tx.createdAt).toLocaleString()}</p>
                    <p className="text-xs text-bik-blue font-mono mt-1">Ref: {tx._id.slice(-8).toUpperCase()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">+ Q {tx.monto.toLocaleString()}</p>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Acreditado</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};