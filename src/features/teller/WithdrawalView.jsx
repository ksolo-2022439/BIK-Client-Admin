import { useState } from 'react';
import { ArrowUpCircle, Search, User, FileText, Loader2, CheckCircle, AlertCircle, Wallet, Hash, Phone, Mail } from 'lucide-react';
import { useTellerStore } from './store/tellerStore';
import { formatCurrency, getCurrencySymbol } from '../../shared/utils/currency';

export const WithdrawalView = () => {
  const { accountData, searchLoading, searchError, loading, error, successData, searchAccount, processWithdrawal, clearData } = useTellerStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({ monto: '', descripcion: '' });

  const handleSearchAccount = async () => {
    if (!searchTerm.trim()) return;
    await searchAccount(searchTerm.trim());
  };

  const handleWithdrawal = async () => {
    if (!accountData || !formData.monto || parseFloat(formData.monto) <= 0) return;
    try {
      await processWithdrawal({
        cuentaOrigenId: accountData._id,
        monto: parseFloat(formData.monto),
        descripcion: formData.descripcion || 'Retiro en ventanilla'
      });
      setFormData({ monto: '', descripcion: '' });
      setSearchTerm('');
    } catch (err) {
      alert(err.message || 'Error al procesar el retiro.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Retiro de Fondos</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Retiro de efectivo en ventanilla debitado de cuenta</p>
      </div>

      {successData && (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800/50 p-6 animate-slide-up">
          <div className="flex items-center gap-3">
            <CheckCircle size={32} className="text-emerald-600" />
            <div>
              <h2 className="text-lg font-bold text-emerald-900 dark:text-emerald-100">Retiro Procesado</h2>
              <p className="text-emerald-700 dark:text-emerald-300">{formatCurrency(parseFloat(formData.monto), accountData?.moneda || 'GTQ')} debitados de cuenta {accountData?.numeroCuenta}. Entregar efectivo al cliente.</p>
            </div>
          </div>
          <button onClick={() => clearData()} className="mt-4 px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors">
            Nuevo Retiro
          </button>
        </div>
      )}

      {!successData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    placeholder="Número de cuenta origen" 
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

            {/* Información completa de la cuenta encontrada */}
            {accountData && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800/50 p-6 animate-slide-up space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-blue-200 dark:border-blue-800/50">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-800/50 flex items-center justify-center">
                    <User size={20} className="text-bik-blue dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-blue-900 dark:text-blue-100">{accountData.usuarioId?.nombres} {accountData.usuarioId?.apellidos}</p>
                    <p className="text-xs text-blue-700 dark:text-blue-300">Propietario de la cuenta</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700 dark:text-blue-400 flex items-center gap-1"><Wallet size={14} /> No. Cuenta</span>
                    <span className="font-bold font-mono text-blue-900 dark:text-blue-100">{accountData.numeroCuenta}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700 dark:text-blue-400 flex items-center gap-1"><Hash size={14} /> DPI</span>
                    <span className="font-bold font-mono text-blue-900 dark:text-blue-100">{accountData.usuarioId?.dpi}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700 dark:text-blue-400 flex items-center gap-1"><Mail size={14} /> Correo</span>
                    <span className="font-medium text-blue-900 dark:text-blue-100 text-xs">{accountData.usuarioId?.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700 dark:text-blue-400 flex items-center gap-1"><Phone size={14} /> Teléfono</span>
                    <span className="font-medium text-blue-900 dark:text-blue-100">{accountData.usuarioId?.telefono}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-blue-200 dark:border-blue-800/50">
                    <span className="text-blue-700 dark:text-blue-400">Tipo</span>
                    <span className="font-medium text-blue-900 dark:text-blue-100">{accountData.tipo} • {accountData.moneda === 'USD' ? 'Dólares (USD)' : 'Quetzales (GTQ)'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700 dark:text-blue-400">Saldo Disponible</span>
                    <span className="font-bold text-lg text-blue-900 dark:text-blue-100">{formatCurrency(accountData.saldo, accountData.moneda)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 relative overflow-hidden">
            {!accountData && (
              <div className="absolute inset-0 bg-white/60 dark:bg-gray-800/80 backdrop-blur-[2px] z-10 flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400 font-medium bg-white dark:bg-gray-900 px-4 py-2 rounded-lg shadow-sm">
                  Ingresa un número de cuenta para continuar
                </p>
              </div>
            )}

            <div className="flex items-center gap-2 mb-6 text-bik-red">
              <ArrowUpCircle size={24} />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Datos del Retiro</h2>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Monto a Retirar ({accountData?.moneda === 'USD' ? 'USD' : 'GTQ'})</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-500">{getCurrencySymbol(accountData?.moneda)}</span>
                  <input 
                    type="number" 
                    value={formData.monto}
                    onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-bik-blue text-lg font-bold dark:text-white" 
                    placeholder="0.00" min="0.01" step="0.01" 
                  />
                </div>
                {accountData && parseFloat(formData.monto) > (accountData.saldo || 0) && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> El monto excede el saldo disponible
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Descripción (Opcional)</label>
                <input 
                  type="text" 
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-bik-blue dark:text-white" 
                  placeholder="Ej. Retiro para pago de colegiatura" 
                />
              </div>
              
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-lg">
                <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">⚠️ Se requiere validar el DPI del cliente físicamente antes de entregar el efectivo.</p>
              </div>

              <button 
                type="button" 
                onClick={handleWithdrawal}
                disabled={loading || !accountData || !formData.monto || parseFloat(formData.monto) > (accountData?.saldo || 0)} 
                className="w-full mt-4 py-3.5 bg-bik-red hover:bg-red-700 text-white font-bold rounded-lg transition-colors shadow-md flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 size={20} className="animate-spin" /> : <FileText size={20} />}
                {loading ? 'Procesando...' : 'Procesar Retiro y Generar Recibo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
