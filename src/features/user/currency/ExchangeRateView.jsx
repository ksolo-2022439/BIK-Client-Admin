import { useState, useEffect } from 'react';
import { Info, RefreshCw } from 'lucide-react';
import { useCurrencyStore } from './store/currencyStore';

/**
 * Vista informativa del tipo de cambio actual.
 * Consume datos reales desde el endpoint de divisas del backend.
 */
export const ExchangeRateView = () => {
  const [activeTab, setActiveTab] = useState('app');
  const { exchangeRates: allRates, loading, fetchExchangeRates } = useCurrencyStore();
  const [rates, setRates] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  /**
   * Recupera de forma asíncrona la lista de tipos de cambio al cargar la vista.
   */
  useEffect(() => {
    fetchExchangeRates();
  }, [fetchExchangeRates]);

  /**
   * Filtra las tasas recibidas para seleccionar el tipo de cambio USD a GTQ o asigna spreads por defecto.
   */
  useEffect(() => {
    if (allRates.length > 0) {
      const usdRate = allRates.find(r => r.moneda === 'USD' || r.monedaDestino === 'GTQ') || allRates[0];
      setRates(usdRate);
      setLastUpdate(new Date(usdRate.updatedAt || usdRate.fechaActualizacion || Date.now()));
    } else if (!loading) {
      setRates({ tasaCompra: 7.44, tasaVenta: 7.78 });
      setLastUpdate(new Date());
    }
  }, [allRates, loading]);

  const fetchRates = () => fetchExchangeRates();

  const compraApp = rates?.tasaCompra || 7.44;
  const ventaApp = rates?.tasaVenta || 7.78;
  const compraAgencia = (compraApp - 0.02).toFixed(2);
  const ventaAgencia = (ventaApp + 0.02).toFixed(2);

  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in relative">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tipo de cambio</h1>
        <button onClick={fetchRates} className="p-2 text-bik-blue dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors" title="Actualizar">
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button onClick={() => setActiveTab('app')}
            className={`flex-1 py-4 text-center font-bold text-sm transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'app' ? 'text-bik-blue dark:text-blue-400' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}>
            App {activeTab === 'app' && <Info size={18} className="text-bik-blue dark:text-blue-400" />}
          </button>
          <button onClick={() => setActiveTab('agencia')}
            className={`flex-1 py-4 text-center font-bold text-sm transition-colors ${
              activeTab === 'agencia' ? 'text-bik-blue dark:text-blue-400' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}>
            Agencia
          </button>
        </div>

        <div className="p-8">
          {loading ? (
            <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bik-blue"></div></div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex-1">
                  <h3 className="text-center text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Compra</h3>
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg py-5 text-center font-bold text-2xl text-green-700 dark:text-green-400 shadow-sm">
                    GTQ {activeTab === 'app' ? Number(compraApp).toFixed(2) : compraAgencia}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-center text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Venta</h3>
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg py-5 text-center font-bold text-2xl text-red-700 dark:text-red-400 shadow-sm">
                    GTQ {activeTab === 'app' ? Number(ventaApp).toFixed(2) : ventaAgencia}
                  </div>
                </div>
              </div>
              {lastUpdate && (
                <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-6">
                  Última actualización: {lastUpdate.toLocaleString('es-GT')}
                </p>
              )}
              {activeTab === 'app' && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                  <p className="text-xs text-bik-blue dark:text-blue-400 font-medium">Las tasas de la App tienen un mejor spread que en agencia física.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};