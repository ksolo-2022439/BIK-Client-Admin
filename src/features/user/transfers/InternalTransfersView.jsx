import { useState, useEffect } from 'react';
import { Send, Plus, ChevronDown, Wallet, AlertCircle } from 'lucide-react';
import { formatCurrency, getCurrencySymbol } from '../../../shared/utils/currency';
import { useTransfersStore } from './store/transfersStore';
import { ReceiptModal } from '../../../shared/components/ReceiptModal';
import { Modal } from '../../../shared/components/Modal';
import Swal from 'sweetalert2';
import { getReadableError } from '../../../shared/utils/errorMessages';

/**
 * Vista para transferencias internas BIK a BIK.
 * Interactúa con BIK-Server-Admin para cargar datos y procesar transacciones atómicas.
 */
export const InternalTransfersView = () => {
  const { 
    sourceAccounts, 
    destinationAccounts, 
    exchangeRates, 
    loadingData, 
    transferLoading, 
    error: storeError, 
    fetchTransferData, 
    executeTransfer, 
    addContact 
  } = useTransfersStore();

  const [selectedSource, setSelectedSource] = useState('');
  const [selectedDest, setSelectedDest] = useState(null);
  const [monto, setMonto] = useState('');
  const [monedaTransferencia, setMonedaTransferencia] = useState('');
  const [descripcion, setDescripcion] = useState('');

  const [isDestMenuOpen, setIsDestMenuOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false);
  const [transactionResult, setTransactionResult] = useState(null);
  const [localError, setLocalError] = useState(null);

  const [newContactForm, setNewContactForm] = useState({ alias: '', numeroCuenta: '', tipoCuenta: 'Monetaria' });

  useEffect(() => { fetchTransferData(); }, [fetchTransferData]);

  const error = localError || storeError;

  /**
   * Valida los campos obligatorios del formulario antes de confirmar la transferencia.
   */
  const handleTransferSubmit = (e) => {
    e.preventDefault();
    setLocalError(null);
    if (!selectedSource || !selectedDest || !monto || monto <= 0) {
      setLocalError('Por favor, completa todos los campos obligatorios con valores válidos.');
      return;
    }
    processTransfer();
  };

  /**
   * Envía la solicitud de transferencia interna atómica a la API.
   * Modifica los saldos de forma segura tras verificar disponibilidad de fondos en el servidor.
   */
  const processTransfer = async () => {
    setLocalError(null);
    try {
      const responseData = await executeTransfer({
        cuentaOrigenId: selectedSource,
        cuentaDestinoId: selectedDest.numeroCuenta, 
        monto: Number(monto),
        monedaTransferencia: monedaTransferencia || (sourceAccounts.find(a => a._id === selectedSource)?.moneda || 'GTQ'),
        descripcion: descripcion,
        tokenSeguridad: 'VALID_BYPASS'
      });
      if (responseData.status === 'success') {
        const accOrigen = sourceAccounts.find(a => a._id === selectedSource);
        setTransactionResult({ 
          ...responseData.data, 
          destinatarioAlias: selectedDest.alias,
          tasaCambio: responseData.tasaCambio,
          montoAcreditado: responseData.montoAcreditado,
          monedaOrigen: accOrigen?.moneda || 'GTQ',
          monedaDestino: selectedDest.moneda || 'GTQ'
        });
        setIsReceiptModalOpen(true);
        setMonto('');
        setDescripcion('');
        setMonedaTransferencia('');
      }
    } catch (err) {
    }
  };

  /**
   * Guarda una nueva cuenta BIK favorita en el listado de contactos del cliente.
   */
  const handleAddContact = async (e) => {
    e.preventDefault();
    try {
      await addContact({
        ...newContactForm,
        banco: 'BIK',
        tipoDestinatario: 'BIK'
      });
      Swal.fire('Éxito', 'Cuenta BIK agregada a tus contactos', 'success');
      setIsAddContactModalOpen(false);
      setNewContactForm({ alias: '', numeroCuenta: '', tipoCuenta: 'Monetaria' });
    } catch (err) {
      Swal.fire('Error', getReadableError(err.response?.data?.message || err.message), 'error');
    }
  };

  return (
    <div className="max-w-2xl mx-auto w-full animate-fade-in pb-12">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Transferencias BIK</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center text-red-600 dark:text-red-400">
          <AlertCircle size={20} className="mr-2" />
          <span className="text-sm font-medium">{getReadableError(error)}</span>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 md:p-8 transition-colors duration-300">
        <form className="space-y-6" onSubmit={handleTransferSubmit}>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Transferir de</label>
            <div className="relative">
              <select value={selectedSource} onChange={(e) => setSelectedSource(e.target.value)}
                className="w-full appearance-none bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-bik-blue focus:border-bik-blue block p-3.5 pr-10 cursor-pointer outline-none">
                <option value="">Selecciona una cuenta a debitar</option>
                {sourceAccounts.map(acc => (
                  <option key={acc._id} value={acc._id}>{acc.numeroCuenta} (Disponible: {formatCurrency(acc.saldo, acc.moneda)})</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-3.5 text-gray-500 dark:text-gray-400 pointer-events-none" size={20} />
            </div>
          </div>

          <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Cuenta destino BIK</label>
            <button type="button" onClick={() => setIsDestMenuOpen(!isDestMenuOpen)}
              className="w-full flex justify-between items-center bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-sm rounded-lg p-3.5 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-300">
              <span className={selectedDest ? "text-gray-900 dark:text-white font-medium" : "text-gray-500 dark:text-gray-400"}>
                {selectedDest ? `${selectedDest.alias} - ${selectedDest.numeroCuenta}` : 'Selecciona un destinatario'}
              </span>
              <ChevronDown className="text-gray-500 dark:text-gray-400 transition-colors duration-300" size={20} />
            </button>

            {isDestMenuOpen && (
              <div className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden animate-dropdown">
                <div className="max-h-60 overflow-y-auto">
                  {destinationAccounts.length === 0 && (
                    <p className="p-4 text-sm text-gray-500 text-center">No posees contactos BIK registrados.</p>
                  )}
                  {destinationAccounts.map((dest) => (
                    <button key={dest._id} type="button"
                      onClick={() => { setSelectedDest(dest); setIsDestMenuOpen(false); }}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 flex flex-col transition-colors duration-300">
                      <span className="font-semibold text-bik-blue dark:text-blue-400">{dest.alias}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-1">
                        <Wallet size={14} className="mr-1" /> Cuenta | {dest.numeroCuenta}
                      </span>
                    </button>
                  ))}
                </div>
                <button type="button" onClick={() => { setIsDestMenuOpen(false); setIsAddContactModalOpen(true); }}
                  className="w-full bg-gray-50 dark:bg-gray-700 px-4 py-3 text-bik-orange dark:text-orange-400 font-semibold hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex items-center justify-center border-t border-gray-200 dark:border-gray-700">
                  <Plus size={18} className="mr-2" />
                  Agregar nueva cuenta BIK
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Monto a transferir</label>
            
            {sourceAccounts.find(a => a._id === selectedSource)?.moneda === 'USD' && (
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
              <span className="absolute left-4 top-3 text-gray-500 dark:text-gray-400 font-semibold">
                {getCurrencySymbol(monedaTransferencia || sourceAccounts.find(a => a._id === selectedSource)?.moneda || 'GTQ')}
              </span>
              <input type="number" value={monto} onChange={(e) => setMonto(e.target.value)} placeholder="0.00"
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-lg rounded-lg focus:ring-bik-blue focus:border-bik-blue block p-3 pl-10 transition-colors outline-none" />
            </div>
            
            {sourceAccounts.find(a => a._id === selectedSource)?.moneda === 'USD' && monedaTransferencia === 'GTQ' && Number(monto) > 0 && exchangeRates && (
              <p className="text-sm text-bik-blue dark:text-blue-400 mt-2 font-medium bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg border border-blue-100 dark:border-blue-800">
                Q {Number(monto).toLocaleString('es-GT', { minimumFractionDigits: 2 })} equivalen a debitar $ {(Number(monto) / exchangeRates.tasaCompra).toLocaleString('es-GT', { minimumFractionDigits: 2 })} de tu cuenta (TC Compra: {exchangeRates.tasaCompra})
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Descripción</label>
            <textarea rows="2" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Motivo de la transferencia"
              className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-bik-blue focus:border-bik-blue block p-3.5 resize-none transition-colors outline-none"></textarea>
          </div>

          <button type="submit" disabled={transferLoading} className="w-full bg-bik-blue hover:bg-blue-800 text-white font-bold rounded-lg text-lg px-5 py-4 flex items-center justify-center transition-all shadow-md active:scale-95 mt-4 disabled:opacity-70">
            <Send size={20} className="mr-2" /> {transferLoading ? 'Procesando...' : 'Confirmar Transferencia'}
          </button>
        </form>
      </div>

      <Modal isOpen={isAddContactModalOpen} onClose={() => setIsAddContactModalOpen(false)} title="Agregar cuenta BIK">
        <form onSubmit={handleAddContact} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Alias / Nombre</label>
            <input type="text" value={newContactForm.alias} onChange={(e) => setNewContactForm({...newContactForm, alias: e.target.value})} placeholder="Ej. Juan Pérez" required
              className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-bik-blue" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Número de cuenta BIK</label>
            <input type="text" value={newContactForm.numeroCuenta} onChange={(e) => setNewContactForm({...newContactForm, numeroCuenta: e.target.value})} placeholder="Ej. 4000000001" required
              className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-bik-blue" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo de cuenta</label>
            <select value={newContactForm.tipoCuenta} onChange={(e) => setNewContactForm({...newContactForm, tipoCuenta: e.target.value})} required
              className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-bik-blue">
              <option value="Monetaria">Monetaria</option>
              <option value="Ahorro">Ahorro</option>
            </select>
          </div>
          <button type="submit" className="w-full bg-bik-blue hover:bg-blue-800 text-white font-semibold py-3 rounded-lg transition-colors mt-2">
            Guardar cuenta BIK
          </button>
        </form>
      </Modal>

      <ReceiptModal isOpen={isReceiptModalOpen} onClose={() => setIsReceiptModalOpen(false)} transaction={transactionResult} />
    </div>
  );
};