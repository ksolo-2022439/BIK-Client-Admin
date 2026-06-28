import { useState, useEffect } from 'react';
import { ArrowLeftRight, DollarSign } from 'lucide-react';
import { useCurrencyStore } from './store/currencyStore';
import { useAccountsStore } from '../accounts/store/accountsStore';
import { useAuthStore } from '../../auth/store/authStore';
import Swal from 'sweetalert2';

/**
 * Vista para la negociación de divisas.
 * Permite al usuario convertir fondos entre sus cuentas en Quetzales (GTQ) y Dólares (USD),
 * mostrando la tasa de cambio aplicada a la transacción.
 */
export const CurrencyExchangeView = () => {
  const { user } = useAuthStore();
  const { accounts: cuentas, fetchUserAccountsAndCards } = useAccountsStore();
  const { exchangeRates: allRates, fetchExchangeRates, executeCurrencyExchange, loading } = useCurrencyStore();
  
  const [cuentaOrigenId, setCuentaOrigenId] = useState('');
  const [cuentaDestinoId, setCuentaDestinoId] = useState('');
  const [montoOrigen, setMontoOrigen] = useState('');
  const [exchangeRates, setExchangeRates] = useState(null);

  /**
   * Dispara la sincronización inicial de cuentas del cliente y tipos de cambio oficiales de divisas.
   */
  useEffect(() => {
    const userId = user?.publicId || user?.id || user?._id;
    if (userId) {
      fetchUserAccountsAndCards(userId);
    }
    fetchExchangeRates();
  }, [user, fetchUserAccountsAndCards, fetchExchangeRates]);

  /**
   * Extrae del almacén global el par cambiario USD/GTQ para su aplicación en la conversión de saldos.
   */
  useEffect(() => {
    if (allRates.length > 0) {
      const usdGtq = allRates.find(r => r.monedaBase === 'USD' && r.monedaDestino === 'GTQ');
      if (usdGtq) setExchangeRates(usdGtq);
    }
  }, [allRates]);

  const cuentaOrigenObj = cuentas.find(c => c._id === cuentaOrigenId);
  const cuentaDestinoObj = cuentas.find(c => c._id === cuentaDestinoId);
  
  let tasaAplicada = 0;
  let tipoOperacion = '';
  
  if (cuentaOrigenObj && cuentaDestinoObj && exchangeRates) {
    if (cuentaOrigenObj.moneda === 'GTQ' && cuentaDestinoObj.moneda === 'USD') {
      tasaAplicada = exchangeRates.tasaVenta;
      tipoOperacion = 'Venta';
    } else if (cuentaOrigenObj.moneda === 'USD' && cuentaDestinoObj.moneda === 'GTQ') {
      tasaAplicada = exchangeRates.tasaCompra;
      tipoOperacion = 'Compra';
    }
  }

  /**
   * Ejecuta la debitación de la cuenta de origen, aplica el tipo de cambio y acredita los fondos resultantes en destino.
   */
  const handleExchange = async (e) => {
    e.preventDefault();
    if (!cuentaOrigenId || !cuentaDestinoId || !montoOrigen) {
      Swal.fire('Error', 'Todos los campos son requeridos', 'error');
      return;
    }
    if (cuentaOrigenId === cuentaDestinoId) {
      Swal.fire('Error', 'Las cuentas de origen y destino deben ser distintas', 'error');
      return;
    }
    if (!tasaAplicada) {
      Swal.fire('Error', 'Debe seleccionar una cuenta GTQ y una USD.', 'error');
      return;
    }

    try {
      await executeCurrencyExchange({
        cuentaOrigenId,
        cuentaDestinoId,
        montoOrigen: Number(montoOrigen),
        tasaAplicada
      });
      Swal.fire('Éxito', 'Negociación de divisas completada', 'success');
      setMontoOrigen('');
      setCuentaOrigenId('');
      setCuentaDestinoId('');
      const userId = user?.publicId || user?.id || user?._id;
      if (userId) fetchUserAccountsAndCards(userId);
    } catch (err) {
      Swal.fire('Error', err.message || 'Error en el cambio de divisas', 'error');
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in pb-12">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Negociación de Divisas</h1>

      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 p-6 sm:p-8">
        <div className="flex items-center mb-8 pb-4 border-b border-gray-100 dark:border-gray-700">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-bik-blue dark:text-blue-400 rounded-lg mr-4">
            <ArrowLeftRight size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Compra y Venta</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Transfiere entre tus cuentas con distintas monedas</p>
          </div>
        </div>

        <form className="space-y-6" onSubmit={handleExchange}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Cuenta origen (Debitar)</label>
              <select 
                value={cuentaOrigenId}
                onChange={(e) => setCuentaOrigenId(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg p-3.5 focus:ring-2 focus:ring-bik-blue outline-none cursor-pointer"
                required
              >
                <option value="">Selecciona una cuenta</option>
                {cuentas.filter(c => !c.isCard).map(c => (
                  <option key={c._id} value={c._id}>{c.numeroCuenta} - [Moneda {c.moneda || 'GTQ'}]</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Cuenta destino (Acreditar)</label>
              <select 
                value={cuentaDestinoId}
                onChange={(e) => setCuentaDestinoId(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg p-3.5 focus:ring-2 focus:ring-bik-blue outline-none cursor-pointer"
                required
              >
                <option value="">Selecciona una cuenta</option>
                {cuentas.filter(c => !c.isCard).map(c => (
                  <option key={c._id} value={c._id}>{c.numeroCuenta} - [Moneda {c.moneda || 'USD'}]</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Monto a debitar</label>
            <div className="relative">
              <span className="absolute left-4 top-3.5 text-gray-500 dark:text-gray-400 font-bold">
                {cuentaOrigenObj ? (cuentaOrigenObj.moneda === 'USD' ? '$' : 'Q') : ''}
              </span>
              <input 
                type="number" 
                placeholder="0.00" 
                value={montoOrigen}
                onChange={(e) => setMontoOrigen(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-lg rounded-lg p-3 pl-10 focus:ring-2 focus:ring-bik-blue outline-none transition-all"
                required
              />
            </div>
          </div>

          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800 rounded-lg p-4 flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tasa de cambio aplicada {tipoOperacion ? `(${tipoOperacion})` : ''}:</span>
            <span className="text-sm font-bold text-bik-orange dark:text-orange-400 flex items-center">
              <DollarSign size={16} className="mr-1" /> 1.00 USD = {tasaAplicada ? tasaAplicada.toFixed(2) : '0.00'} GTQ
            </span>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-bik-blue hover:bg-blue-800 text-white font-bold rounded-lg px-5 py-4 transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Procesando...' : 'Ejecutar Cambio de Divisas'}
          </button>
        </form>
      </div>
    </div>
  );
};