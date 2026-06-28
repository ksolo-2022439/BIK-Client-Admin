import { useState, useEffect } from 'react';
import { Plus, Send, Download, RefreshCw, QrCode, AlertCircle, ChevronDown } from 'lucide-react';
import { useTransfersStore } from './store/transfersStore';
import { useAccountsStore } from '../accounts/store/accountsStore';
import { useAuthStore } from '../../auth/store/authStore';
import { formatCurrency, getCurrencySymbol } from '../../../shared/utils/currency';
import { ReceiptModal } from '../../../shared/components/ReceiptModal';
import Swal from 'sweetalert2';
import { getReadableError } from '../../../shared/utils/errorMessages';

/**
 * Vista principal para transferencias móviles.
 * Implementa envío, cobro y autoenvío con selección de cuenta origen.
 */
export const MobileTransfersView = () => {
  const [activeTab, setActiveTab] = useState('inicio');
  const { user } = useAuthStore();
  const { accounts: sourceAccounts, fetchUserAccountsAndCards } = useAccountsStore();
  const { executeMobileTransfer, exchangeRates, loadingData: isStoreLoading, error: storeError } = useTransfersStore();
  
  const [sourceAccount, setSourceAccount] = useState('');
  const [telefonoDestino, setTelefonoDestino] = useState('');
  const [monto, setMonto] = useState('');
  const [monedaTransferencia, setMonedaTransferencia] = useState('');
  const [descripcion, setDescripcion] = useState('');

  const [cobroTelefono, setCobroTelefono] = useState('');
  const [cobroMonto, setCobroMonto] = useState('');
  const [cobroDescripcion, setCobroDescripcion] = useState('');

  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [transactionResult, setTransactionResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const userId = user?.publicId || user?.id || user?._id;
    if (userId) {
      fetchUserAccountsAndCards(userId);
    }
  }, [user, fetchUserAccountsAndCards]);

  useEffect(() => {
    if (sourceAccounts.length > 0 && !sourceAccount) {
      const activeDep = sourceAccounts.find(a => !a.isCard);
      if (activeDep) {
        setSourceAccount(activeDep._id);
      }
    }
  }, [sourceAccounts, sourceAccount]);

  /**
   * Valida la integridad y completitud de los campos del formulario antes de procesar el envío.
   */
  const handleTransferSubmit = (e) => {
    e.preventDefault();
    setError(null);
    if (!sourceAccount || !telefonoDestino || !monto || monto <= 0) {
      setError('Asegúrate de seleccionar una cuenta, número de teléfono y un monto válido.');
      return;
    }
    processTransfer();
  };

  /**
   * Ejecuta la petición de transferencia móvil conectándose con la API principal.
   * Valida fondos y realiza la debitación y acreditación correspondientes.
   */
  const processTransfer = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      const response = await executeMobileTransfer({
        cuentaOrigenId: sourceAccount,
        telefonoDestino,
        monto: Number(monto),
        monedaTransferencia: monedaTransferencia || (sourceAccounts.find(a => a._id === sourceAccount)?.moneda || 'GTQ'),
        descripcion: descripcion || 'Transferencia Móvil',
        tokenSeguridad: 'VALID_BYPASS'
      });
      
      if (response.status === 'success') {
        setTransactionResult({ ...response.data, destinatarioAlias: `Tel: ${telefonoDestino}` });
        setIsReceiptModalOpen(true);
        resetForm();
        setActiveTab('inicio');
      }
    } catch (err) {
      setError(err.message || 'Error procesando la transferencia móvil.');
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Procesa una transferencia rápida auto-dirigida al propio número registrado del usuario.
   */
  const handleAutoEnvio = (e) => {
    e.preventDefault();
    setError(null);
    if (!sourceAccount || !monto || monto <= 0) {
      setError('Selecciona una cuenta y monto válido.');
      return;
    }
    const user = JSON.parse(localStorage.getItem('bik_user') || '{}');
    setTelefonoDestino(user.telefono || '');
    setDescripcion('Autoenvío');
    processTransfer();
  };

  /**
   * Envía una solicitud de cobro simulada por SMS/Notificación al teléfono de destino.
   */
  const handleCobro = async (e) => {
    e.preventDefault();
    if (!cobroTelefono || !cobroMonto || cobroMonto <= 0) {
      setError('Completa el teléfono y monto para solicitar el cobro.');
      return;
    }
    Swal.fire('Solicitud Enviada', `Se ha enviado una solicitud de cobro por Q${Number(cobroMonto).toFixed(2)} al número ${cobroTelefono}.`, 'success');
    setCobroTelefono('');
    setCobroMonto('');
    setCobroDescripcion('');
    setActiveTab('inicio');
  };

  const resetForm = () => { setTelefonoDestino(''); setMonto(''); setDescripcion(''); setMonedaTransferencia(''); };

  const AccountSelect = () => (
    <div>
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Cuenta a debitar</label>
      <div className="relative">
        <select value={sourceAccount} onChange={(e) => setSourceAccount(e.target.value)}
          className="w-full appearance-none bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg p-3.5 pr-10 cursor-pointer outline-none focus:ring-2 focus:ring-bik-blue">
          <option value="">Selecciona una cuenta</option>
          {sourceAccounts.filter(acc => !acc.isCard).map(acc => (
            <option key={acc._id} value={acc._id}>{acc.numeroCuenta} (Disponible: {formatCurrency(acc.saldo, acc.moneda)})</option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-3.5 text-gray-500 dark:text-gray-400 pointer-events-none" size={20} />
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in relative pb-28">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transferencias Móviles</h1>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center text-red-600 dark:text-red-400">
          <AlertCircle size={20} className="mr-2 flex-shrink-0" />
          <span className="text-sm font-medium">{getReadableError(error)}</span>
        </div>
      )}

      {activeTab === 'inicio' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center min-h-[300px] flex flex-col justify-center relative overflow-hidden transition-colors duration-300">
          <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-8 text-left absolute top-6 left-6">Transferencias realizadas</h2>
          <div className="mt-12">
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">¿Qué deseas realizar?</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button onClick={() => setActiveTab('enviar')} className="bg-bik-blue hover:bg-blue-800 text-white font-semibold py-3 px-8 rounded-full transition-colors w-full sm:w-auto shadow-sm">Enviar transferencia</button>
              <button onClick={() => setActiveTab('cobrar')} className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-bik-blue dark:text-blue-400 font-semibold py-3 px-8 rounded-full transition-colors w-full sm:w-auto">Cobrar transferencia</button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'enviar' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 md:p-8 animate-slide-up transition-colors duration-300">
          <h2 className="text-xl font-bold text-bik-blue dark:text-blue-400 mb-6 border-b border-gray-200 dark:border-gray-700 pb-2">Enviar Transferencia</h2>
          <form className="space-y-5" onSubmit={handleTransferSubmit}>
            <AccountSelect />
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Número de teléfono destino</label>
              <input type="tel" value={telefonoDestino} onChange={(e) => setTelefonoDestino(e.target.value)} placeholder="Ej. 55551234"
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg p-3.5 focus:ring-2 focus:ring-bik-blue outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Monto a enviar</label>
              
              {sourceAccounts.find(a => a._id === sourceAccount)?.moneda === 'USD' && (
                <div className="mb-3 grid grid-cols-2 gap-3">
                  <button 
                    type="button"
                    onClick={() => setMonedaTransferencia('USD')}
                    className={`py-2 rounded-lg border font-medium text-sm transition-all ${monedaTransferencia === 'USD' || !monedaTransferencia ? 'border-bik-blue bg-blue-50 dark:bg-blue-900/30 text-bik-blue' : 'border-gray-200 dark:border-gray-600 text-gray-500 hover:border-gray-300'}`}
                  >
                    $ Dólares (USD)
                  </button>
                  <button 
                    type="button"
                    onClick={() => setMonedaTransferencia('GTQ')}
                    className={`py-2 rounded-lg border font-medium text-sm transition-all ${monedaTransferencia === 'GTQ' ? 'border-bik-blue bg-blue-50 dark:bg-blue-900/30 text-bik-blue' : 'border-gray-200 dark:border-gray-600 text-gray-500 hover:border-gray-300'}`}
                  >
                    Q Quetzales (GTQ)
                  </button>
                </div>
              )}

              <div className="relative">
                <span className="absolute left-4 top-3.5 text-gray-500 dark:text-gray-400 font-semibold">
                  {getCurrencySymbol(monedaTransferencia || sourceAccounts.find(a => a._id === sourceAccount)?.moneda || 'GTQ')}
                </span>
                <input type="number" value={monto} onChange={(e) => setMonto(e.target.value)} placeholder="0.00"
                  className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-lg rounded-lg p-3 pl-10 focus:ring-2 focus:ring-bik-blue outline-none" required />
              </div>

              {sourceAccounts.find(a => a._id === sourceAccount)?.moneda === 'USD' && monedaTransferencia === 'GTQ' && Number(monto) > 0 && exchangeRates && (
                <p className="text-sm text-bik-blue dark:text-blue-400 mt-2 font-medium bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg border border-blue-100 dark:border-blue-800">
                  Q {Number(monto).toLocaleString('es-GT', { minimumFractionDigits: 2 })} equivalen a debitar $ {(Number(monto) / exchangeRates.tasaCompra).toLocaleString('es-GT', { minimumFractionDigits: 2 })} de tu cuenta (TC Compra: {exchangeRates.tasaCompra})
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Descripción (Opcional)</label>
              <input type="text" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Motivo del envío"
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg p-3.5 focus:ring-2 focus:ring-bik-blue outline-none" />
            </div>
            <button type="submit" className="w-full bg-bik-blue hover:bg-blue-800 text-white font-bold rounded-lg text-lg px-5 py-4 flex items-center justify-center transition-all shadow-md active:scale-95 mt-4">
              <Send size={20} className="mr-2" /> Confirmar Envío
            </button>
          </form>
        </div>
      )}

      {activeTab === 'cobrar' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 md:p-8 animate-slide-up transition-colors duration-300">
          <h2 className="text-xl font-bold text-bik-orange dark:text-orange-400 mb-6 border-b border-gray-200 dark:border-gray-700 pb-2">Solicitar Cobro</h2>
          <form className="space-y-5" onSubmit={handleCobro}>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Teléfono a cobrar</label>
              <input type="tel" value={cobroTelefono} onChange={(e) => setCobroTelefono(e.target.value)} placeholder="Ej. 55551234"
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg p-3.5 focus:ring-2 focus:ring-bik-orange outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Monto a cobrar</label>
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-gray-500 dark:text-gray-400 font-semibold">Q</span>
                <input type="number" value={cobroMonto} onChange={(e) => setCobroMonto(e.target.value)} placeholder="0.00"
                  className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-lg rounded-lg p-3 pl-10 focus:ring-2 focus:ring-bik-orange outline-none" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Descripción</label>
              <input type="text" value={cobroDescripcion} onChange={(e) => setCobroDescripcion(e.target.value)} placeholder="Motivo del cobro"
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg p-3.5 focus:ring-2 focus:ring-bik-orange outline-none" />
            </div>
            <button type="submit" className="w-full bg-bik-orange hover:bg-orange-600 text-white font-bold rounded-lg text-lg px-5 py-4 flex items-center justify-center transition-all shadow-md active:scale-95 mt-4">
              <Download size={20} className="mr-2" /> Enviar Solicitud de Cobro
            </button>
          </form>
        </div>
      )}

      {activeTab === 'autoenvio' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 md:p-8 animate-slide-up transition-colors duration-300">
          <h2 className="text-xl font-bold text-green-600 dark:text-green-400 mb-6 border-b border-gray-200 dark:border-gray-700 pb-2">Autoenvío</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Transfiere fondos entre tus propias cuentas asociadas a tu número de teléfono registrado.</p>
          <form className="space-y-5" onSubmit={handleAutoEnvio}>
            <AccountSelect />
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Monto</label>
              
              {sourceAccounts.find(a => a._id === sourceAccount)?.moneda === 'USD' && (
                <div className="mb-3 grid grid-cols-2 gap-3">
                  <button 
                    type="button"
                    onClick={() => setMonedaTransferencia('USD')}
                    className={`py-2 rounded-lg border font-medium text-sm transition-all ${monedaTransferencia === 'USD' || !monedaTransferencia ? 'border-green-600 bg-green-50 dark:bg-green-900/30 text-green-600' : 'border-gray-200 dark:border-gray-600 text-gray-500 hover:border-gray-300'}`}
                  >
                    $ Dólares (USD)
                  </button>
                  <button 
                    type="button"
                    onClick={() => setMonedaTransferencia('GTQ')}
                    className={`py-2 rounded-lg border font-medium text-sm transition-all ${monedaTransferencia === 'GTQ' ? 'border-green-600 bg-green-50 dark:bg-green-900/30 text-green-600' : 'border-gray-200 dark:border-gray-600 text-gray-500 hover:border-gray-300'}`}
                  >
                    Q Quetzales (GTQ)
                  </button>
                </div>
              )}

              <div className="relative">
                <span className="absolute left-4 top-3.5 text-gray-500 font-semibold">
                  {getCurrencySymbol(monedaTransferencia || sourceAccounts.find(a => a._id === sourceAccount)?.moneda || 'GTQ')}
                </span>
                <input type="number" value={monto} onChange={(e) => setMonto(e.target.value)} placeholder="0.00"
                  className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-lg rounded-lg p-3 pl-10 focus:ring-2 focus:ring-green-500 outline-none" required />
              </div>

              {sourceAccounts.find(a => a._id === sourceAccount)?.moneda === 'USD' && monedaTransferencia === 'GTQ' && Number(monto) > 0 && exchangeRates && (
                <p className="text-sm text-green-700 dark:text-green-400 mt-2 font-medium bg-green-50 dark:bg-green-900/20 p-2 rounded-lg border border-green-100 dark:border-green-800">
                  Q {Number(monto).toLocaleString('es-GT', { minimumFractionDigits: 2 })} equivalen a debitar $ {(Number(monto) / exchangeRates.tasaCompra).toLocaleString('es-GT', { minimumFractionDigits: 2 })} de tu cuenta (TC Compra: {exchangeRates.tasaCompra})
                </p>
              )}
            </div>
            <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg text-lg px-5 py-4 flex items-center justify-center transition-all shadow-md active:scale-95 mt-4">
              <RefreshCw size={20} className="mr-2" /> Transferir a mi cuenta
            </button>
          </form>
        </div>
      )}

      <button className="fixed bottom-28 right-6 lg:right-12 w-14 h-14 bg-bik-blue text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-800 transition-transform hover:scale-105 z-10">
        <QrCode size={24} />
      </button>

      <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex justify-center gap-12 sm:gap-24 py-3 px-4 z-20 lg:absolute lg:bg-transparent lg:border-none lg:gap-16 lg:px-0 lg:py-6 transition-colors duration-300">
        {[
          { key: 'enviar', icon: <Send size={20} />, label: 'Enviar' },
          { key: 'cobrar', icon: <Download size={20} />, label: 'Cobrar' },
          { key: 'autoenvio', icon: <RefreshCw size={20} />, label: 'Autoenvío' }
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex flex-col items-center gap-1 ${activeTab === tab.key ? 'text-bik-blue dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-bik-blue transition-colors'}`}>
            <div className={`p-2 rounded-full transition-colors ${activeTab === tab.key ? 'bg-blue-50 dark:bg-blue-900/30' : ''}`}>{tab.icon}</div>
            <span className="text-xs font-semibold">{tab.label}</span>
          </button>
        ))}
      </div>

      <ReceiptModal isOpen={isReceiptModalOpen} onClose={() => setIsReceiptModalOpen(false)} transaction={transactionResult} />
    </div>
  );
};