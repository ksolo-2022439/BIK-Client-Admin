import { useState, useEffect } from 'react';
import { Send, Globe, ChevronDown, Building, Info, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../../../shared/utils/currency';
import { useTransfersStore } from './store/transfersStore';
import { useAccountsStore } from '../accounts/store/accountsStore';
import { useAuthStore } from '../../auth/store/authStore';
import { ReceiptModal } from '../../../shared/components/ReceiptModal';
import { getReadableError } from '../../../shared/utils/errorMessages';

/**
 * Vista para transferencias internacionales (Red SWIFT/ACH Global).
 * Gestiona la captura de datos de enrutamiento y beneficiario, y procesa la transacción con validación de token.
 */
export const InternationalTransfersView = () => {
  const [activeTab, setActiveTab] = useState('transferencia');
  const { user } = useAuthStore();
  const { accounts: sourceAccounts, fetchUserAccountsAndCards } = useAccountsStore();
  const { executeInternationalTransfer, exchangeRates, transferLoading: isLoading } = useTransfersStore();
  
  const [formData, setFormData] = useState({
    cuentaOrigenId: '',
    monto: '',
    swiftBic: '',
    abaRouting: '',
    bancoDestino: '',
    direccionBanco: '',
    cuentaIban: '',
    tipoBeneficiario: 'Individual',
    nombreBeneficiario: '',
    direccionBeneficiario: '',
    motivoTransferencia: ''
  });

  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [transactionResult, setTransactionResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const userId = user?.publicId || user?.id || user?._id;
    if (userId) {
      fetchUserAccountsAndCards(userId);
    }
  }, [user, fetchUserAccountsAndCards]);

  /**
   * Actualiza el estado del formulario dinámicamente.
   */
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /**
   * Verifica los campos obligatorios antes de invocar el modal de seguridad.
   */
  const handleTransferSubmit = (e) => {
    e.preventDefault();
    setError(null);

    const { cuentaOrigenId, monto, swiftBic, bancoDestino, cuentaIban, nombreBeneficiario, direccionBeneficiario, motivoTransferencia } = formData;

    if (!cuentaOrigenId || !monto || !swiftBic || !bancoDestino || !cuentaIban || !nombreBeneficiario || !direccionBeneficiario || !motivoTransferencia) {
      setError('Por favor, completa todos los campos obligatorios marcados con asterisco (*).');
      return;
    }

    if (Number(monto) <= 0) {
      setError('El monto a transferir debe ser mayor a 0.');
      return;
    }

    processTransfer();
  };

  /**
   * Envía la carga útil al endpoint internacional tras la validación del token de seguridad.
   */
  const processTransfer = async () => {
    setError(null);

    try {
      const { cuentaOrigenId, monto, motivoTransferencia, ...internationalDetails } = formData;

      const response = await executeInternationalTransfer({
        cuentaOrigenId,
        monto: Number(monto),
        descripcion: motivoTransferencia,
        internationalDetails,
        tokenSeguridad: 'VALID_BYPASS'
      });

      if (response.status === 'success') {
        setTransactionResult({
          ...response.data,
          destinatarioAlias: `${internationalDetails.nombreBeneficiario} (${internationalDetails.bancoDestino})`
        });
        setIsReceiptModalOpen(true);
        resetForm();
      }
    } catch (err) {
      setError(err.message || 'Error al procesar la transferencia internacional.');
    }
  };

  /**
   * Restablece los valores del formulario a su estado inicial.
   */
  const resetForm = () => {
    setFormData({
      cuentaOrigenId: '',
      monto: '',
      swiftBic: '',
      abaRouting: '',
      bancoDestino: '',
      direccionBanco: '',
      cuentaIban: '',
      tipoBeneficiario: 'Individual',
      nombreBeneficiario: '',
      direccionBeneficiario: '',
      motivoTransferencia: ''
    });
  };

  return (
    <div className="max-w-3xl mx-auto w-full animate-fade-in pb-12">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Transferencias Internacionales</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center text-red-600 dark:text-red-400">
          <AlertCircle size={20} className="mr-2 flex-shrink-0" />
          <span className="text-sm font-medium">{getReadableError(error)}</span>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 md:p-8 transition-colors duration-300">
        <form className="space-y-8" onSubmit={handleTransferSubmit}>
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-bik-blue dark:text-blue-400 flex items-center border-b border-gray-200 dark:border-gray-700 pb-2">
              <Globe size={20} className="mr-2" /> Datos de Origen
            </h2>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Cuenta a debitar *
              </label>
              <div className="relative">
                <select 
                  name="cuentaOrigenId"
                  value={formData.cuentaOrigenId}
                  onChange={handleChange}
                  className="w-full appearance-none bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-bik-blue focus:border-bik-blue block p-3.5 pr-10 cursor-pointer outline-none"
                >
                  <option value="">Selecciona tu cuenta BIK</option>
                  {sourceAccounts.filter(acc => !acc.isCard).map(acc => (
                    <option key={acc._id} value={acc._id}>
                      {acc.numeroCuenta} (Disponible: {formatCurrency(acc.saldo, acc.moneda)})
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-3.5 text-gray-500 dark:text-gray-400 pointer-events-none" size={20} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Monto a transferir (USD) *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-gray-500 dark:text-gray-400 font-semibold">$</span>
                <input
                  type="number"
                  name="monto"
                  value={formData.monto}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-lg rounded-lg focus:ring-bik-blue focus:border-bik-blue block p-3 pl-10 outline-none"
                />
              </div>
              
              {sourceAccounts.find(a => a._id === formData.cuentaOrigenId)?.moneda === 'GTQ' && Number(formData.monto) > 0 && exchangeRates && (
                <p className="text-sm text-bik-blue dark:text-blue-400 mt-3 font-medium bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg border border-blue-100 dark:border-blue-800">
                  $ {Number(formData.monto).toLocaleString('en-US', { minimumFractionDigits: 2 })} equivalen a debitar Q {(Number(formData.monto) * exchangeRates.tasaVenta).toLocaleString('es-GT', { minimumFractionDigits: 2 })} de tu cuenta (TC Venta: {exchangeRates.tasaVenta})
                </p>
              )}

              <p className="text-xs text-gray-500 mt-2 flex items-center">
                <Info size={14} className="mr-1 text-bik-orange" />
                Comisión estimada SWIFT: $35.00
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-lg font-bold text-bik-blue dark:text-blue-400 flex items-center border-b border-gray-200 dark:border-gray-700 pb-2">
              <Building size={20} className="mr-2" /> Datos del Banco Destino
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Código SWIFT / BIC *</label>
                <input type="text" name="swiftBic" value={formData.swiftBic} onChange={handleChange} placeholder="Ej. BOFAUS3N" className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-sm outline-none focus:ring-bik-blue" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Routing Number / ABA (Solo USA)</label>
                <input type="text" name="abaRouting" value={formData.abaRouting} onChange={handleChange} placeholder="Código de 9 dígitos" className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-sm outline-none focus:ring-bik-blue" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre del Banco Destino *</label>
              <input type="text" name="bancoDestino" value={formData.bancoDestino} onChange={handleChange} placeholder="Nombre completo de la institución" className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-sm outline-none focus:ring-bik-blue" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dirección del Banco Destino</label>
              <input type="text" name="direccionBanco" value={formData.direccionBanco} onChange={handleChange} placeholder="Ciudad, Estado, País" className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-sm outline-none focus:ring-bik-blue" />
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-lg font-bold text-bik-blue dark:text-blue-400 flex items-center border-b border-gray-200 dark:border-gray-700 pb-2">
              <Send size={20} className="mr-2" /> Datos del Beneficiario
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Número de Cuenta / IBAN *</label>
                <input type="text" name="cuentaIban" value={formData.cuentaIban} onChange={handleChange} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-sm outline-none focus:ring-bik-blue" />
              </div>
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo de Beneficiario *</label>
                <select name="tipoBeneficiario" value={formData.tipoBeneficiario} onChange={handleChange} className="w-full appearance-none bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-sm outline-none focus:ring-bik-blue cursor-pointer">
                  <option value="Individual">Individual</option>
                  <option value="Empresa">Empresa</option>
                </select>
                <ChevronDown className="absolute right-3 top-9 text-gray-500 pointer-events-none" size={16} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre Completo del Beneficiario *</label>
              <input type="text" name="nombreBeneficiario" value={formData.nombreBeneficiario} onChange={handleChange} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-sm outline-none focus:ring-bik-blue" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dirección Completa *</label>
              <input type="text" name="direccionBeneficiario" value={formData.direccionBeneficiario} onChange={handleChange} placeholder="Calle, Ciudad, Código Postal, País" className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-sm outline-none focus:ring-bik-blue" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Motivo de la Transferencia *</label>
              <input type="text" name="motivoTransferencia" value={formData.motivoTransferencia} onChange={handleChange} placeholder="Ej. Pago de servicios, Ayuda familiar" className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-sm outline-none focus:ring-bik-blue" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-bik-orange hover:bg-orange-600 text-white font-bold rounded-lg text-lg px-5 py-4 flex items-center justify-center transition-all shadow-md active:scale-95 mt-8"
          >
            <Send size={20} className="mr-2" />
            Procesar Transferencia Internacional
          </button>
        </form>
      </div>

      <ReceiptModal 
        isOpen={isReceiptModalOpen} 
        onClose={() => setIsReceiptModalOpen(false)} 
        transaction={transactionResult}
      />
    </div>
  );
};