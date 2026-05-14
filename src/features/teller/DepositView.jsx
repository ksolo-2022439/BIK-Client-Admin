import { useState, useEffect } from 'react';
import { ArrowDownCircle, Search, User, CreditCard, Loader2, CheckCircle, AlertCircle, Wallet, Hash, Phone, Mail, RefreshCw } from 'lucide-react';
import { useTellerStore } from './store/tellerStore';
import { formatCurrency, getCurrencySymbol } from '../../shared/utils/currency';

export const DepositView = () => {
  const { exchangeRate, accountData, searchLoading, searchError, loading, error, successData, fetchExchangeRates, searchAccount, processDeposit, clearData } = useTellerStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({ monto: '', depositante: '', dpiDepositante: '', monedaDeposito: '' });

  useEffect(() => {
    fetchExchangeRates();
  }, []);

  const handleSearchAccount = async () => {
    if (!searchTerm.trim()) return;
    const account = await searchAccount(searchTerm.trim());
    if (account) {
      setFormData(prev => ({ ...prev, monedaDeposito: account.moneda || 'GTQ' }));
    }
  };

  const handleDeposit = async () => {
    if (!accountData || !formData.monto || parseFloat(formData.monto) <= 0) return;
    try {
      await processDeposit({
        cuentaDestinoId: accountData._id,
        monto: parseFloat(formData.monto),
        descripcion: `Depósito en efectivo por ${formData.depositante || 'cliente'}`,
        monedaDeposito: formData.monedaDeposito
      });
      setFormData({ monto: '', depositante: '', dpiDepositante: '', monedaDeposito: '' });
      setSearchTerm('');
    } catch (err) {
      alert(err.message || 'Error al procesar el depósito.');
    }
  };

  // Calcular preview de conversión
  const getConversionPreview = () => {
    if (!accountData || !formData.monto || !exchangeRate) return null;
    const monto = parseFloat(formData.monto);
    if (isNaN(monto) || monto <= 0) return null;

    const monedaCuenta = accountData.moneda || 'GTQ';
    const monedaDep = formData.monedaDeposito;

    if (monedaDep === monedaCuenta) return null; // Sin conversión

    if (monedaDep === 'GTQ' && monedaCuenta === 'USD') {
      const convertido = monto / exchangeRate.tasaCompra;
      return { from: `Q ${monto.toFixed(2)}`, to: `$ ${convertido.toFixed(2)}`, rate: exchangeRate.tasaCompra };
    }
    if (monedaDep === 'USD' && monedaCuenta === 'GTQ') {
      const convertido = monto * exchangeRate.tasaCompra;
      return { from: `$ ${monto.toFixed(2)}`, to: `Q ${convertido.toFixed(2)}`, rate: exchangeRate.tasaCompra };
    }
    return null;
  };

  const conversionPreview = getConversionPreview();
  const monedaCuenta = accountData?.moneda || 'GTQ';
  const symbolDeposito = getCurrencySymbol(formData.monedaDeposito || monedaCuenta);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Depósito en Efectivo</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Recepción de efectivo en ventanilla para abono a cuenta</p>
      </div>

      {successData && (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800/50 p-6 animate-slide-up">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle size={32} className="text-emerald-600" />
            <div>
              <h2 className="text-lg font-bold text-emerald-900 dark:text-emerald-100">Depósito Procesado</h2>
              <p className="text-emerald-700 dark:text-emerald-300">
                Cuenta {successData.cuenta || (accountData && accountData.numeroCuenta)} 
              </p>
            </div>
          </div>
          <div className="space-y-2 text-sm border-t border-emerald-200 dark:border-emerald-800/50 pt-3">
            <div className="flex justify-between">
              <span className="text-emerald-700 dark:text-emerald-400">Efectivo Recibido</span>
              <span className="font-bold text-emerald-900 dark:text-emerald-100">{formatCurrency(successData.montoRecibido || parseFloat(formData.monto), successData.monedaRecibida || formData.monedaDeposito)}</span>
            </div>
            {successData.tasaCambio && (
              <>
                <div className="flex justify-between">
                  <span className="text-emerald-700 dark:text-emerald-400">Tipo de Cambio</span>
                  <span className="font-medium text-emerald-900 dark:text-emerald-100">{successData.tasaCambio}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-700 dark:text-emerald-400">Monto Acreditado</span>
                  <span className="font-bold text-emerald-900 dark:text-emerald-100">{formatCurrency(successData.montoAcreditado, successData.monedaCuenta)}</span>
                </div>
              </>
            )}
          </div>
          <button onClick={() => clearData()} className="mt-4 px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors">
            Nuevo Depósito
          </button>
        </div>
      )}

      {!successData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Panel Izquierdo: Búsqueda por No. Cuenta */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Wallet size={16} className="text-bik-blue" />
                Buscar por Número de Cuenta
              </h2>
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchAccount()}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-bik-blue dark:text-white" 
                    placeholder="Número de cuenta destino" 
                  />
                </div>
                <button 
                  type="button" 
                  onClick={handleSearchAccount}
                  disabled={searchLoading}
                  className="px-4 py-2.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white font-medium rounded-lg transition-colors"
                >
                  {searchLoading ? <Loader2 size={16} className="animate-spin" /> : 'Buscar'}
                </button>
              </div>
              {searchError && (
                <div className="mt-3 flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
                  <AlertCircle size={16} />
                  {searchError}
                </div>
              )}
            </div>

            {accountData && (
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800/50 p-6 animate-slide-up space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-emerald-200 dark:border-emerald-800/50">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-800/50 flex items-center justify-center">
                    <User size={20} className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-emerald-900 dark:text-emerald-100">{accountData.usuarioId?.nombres} {accountData.usuarioId?.apellidos}</p>
                    <p className="text-xs text-emerald-700 dark:text-emerald-300">Propietario de la cuenta</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1"><Wallet size={14} /> No. Cuenta</span>
                    <span className="font-bold font-mono text-emerald-900 dark:text-emerald-100">{accountData.numeroCuenta}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1"><Hash size={14} /> DPI</span>
                    <span className="font-bold font-mono text-emerald-900 dark:text-emerald-100">{accountData.usuarioId?.dpi}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1"><Mail size={14} /> Correo</span>
                    <span className="font-medium text-emerald-900 dark:text-emerald-100 text-xs">{accountData.usuarioId?.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1"><Phone size={14} /> Teléfono</span>
                    <span className="font-medium text-emerald-900 dark:text-emerald-100">{accountData.usuarioId?.telefono}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-emerald-200 dark:border-emerald-800/50">
                    <span className="text-emerald-700 dark:text-emerald-400">Tipo / Moneda</span>
                    <span className="font-bold text-emerald-900 dark:text-emerald-100">{accountData.tipo} • {monedaCuenta === 'USD' ? 'Dólares (USD)' : 'Quetzales (GTQ)'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-emerald-700 dark:text-emerald-400">Saldo Actual</span>
                    <span className="font-bold text-emerald-900 dark:text-emerald-100">{formatCurrency(accountData.saldo, monedaCuenta)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Panel Derecho: Operación de Depósito */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 relative overflow-hidden">
            {!accountData && (
              <div className="absolute inset-0 bg-white/60 dark:bg-gray-800/80 backdrop-blur-[2px] z-10 flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400 font-medium bg-white dark:bg-gray-900 px-4 py-2 rounded-lg shadow-sm">
                  Ingresa un número de cuenta para continuar
                </p>
              </div>
            )}

            <div className="flex items-center gap-2 mb-6 text-bik-blue">
              <ArrowDownCircle size={24} />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Datos del Depósito</h2>
            </div>

            <div className="space-y-5">
              {/* Selector de moneda del depósito — solo visible si la cuenta es USD */}
              {accountData?.moneda === 'USD' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Moneda del Efectivo Recibido</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      type="button"
                      onClick={() => setFormData({ ...formData, monedaDeposito: 'USD' })}
                      className={`py-2.5 rounded-lg border-2 font-medium text-sm transition-all ${formData.monedaDeposito === 'USD' ? 'border-bik-blue bg-blue-50 dark:bg-blue-900/30 text-bik-blue' : 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-300'}`}
                    >
                      $ Dólares (USD)
                    </button>
                    <button 
                      type="button"
                      onClick={() => setFormData({ ...formData, monedaDeposito: 'GTQ' })}
                      className={`py-2.5 rounded-lg border-2 font-medium text-sm transition-all ${formData.monedaDeposito === 'GTQ' ? 'border-bik-blue bg-blue-50 dark:bg-blue-900/30 text-bik-blue' : 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-300'}`}
                    >
                      Q Quetzales (GTQ)
                    </button>
                  </div>
                  {exchangeRate && formData.monedaDeposito === 'GTQ' && (
                    <p className="mt-2 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <RefreshCw size={12} /> Tipo de cambio (compra): Q {exchangeRate.tasaCompra} = $1.00
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Monto a Depositar ({formData.monedaDeposito === 'USD' ? 'USD' : formData.monedaDeposito === 'GTQ' ? 'GTQ' : monedaCuenta})
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-500">{symbolDeposito}</span>
                  <input 
                    type="number" 
                    value={formData.monto}
                    onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-bik-blue text-lg font-bold dark:text-white" 
                    placeholder="0.00" min="0.01" step="0.01" 
                  />
                </div>
              </div>

              {/* Preview de conversión */}
              {conversionPreview && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-lg animate-fade-in">
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200 flex items-center gap-2">
                    <RefreshCw size={14} />
                    {conversionPreview.from} → {conversionPreview.to}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">Tipo de cambio aplicado: {conversionPreview.rate}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Depositante</label>
                <input 
                  type="text" 
                  value={formData.depositante}
                  onChange={(e) => setFormData({ ...formData, depositante: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-bik-blue dark:text-white" 
                  placeholder="Nombre de quien deposita" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">DPI del Depositante</label>
                <input 
                  type="text" 
                  value={formData.dpiDepositante}
                  onChange={(e) => setFormData({ ...formData, dpiDepositante: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-bik-blue dark:text-white" 
                  placeholder="13 dígitos" maxLength="13" 
                />
              </div>

              <button 
                type="button" 
                onClick={handleDeposit}
                disabled={loading || !accountData || !formData.monto} 
                className="w-full mt-4 py-3.5 bg-bik-blue hover:bg-blue-800 text-white font-bold rounded-lg transition-colors shadow-md flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 size={20} className="animate-spin" /> : <CreditCard size={20} />}
                {loading ? 'Procesando...' : 'Procesar Depósito'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
