import { useState } from 'react';
import { Save, Building, Loader2, AlertCircle } from 'lucide-react';
import { Modal } from './Modal';
import { useContactsStore } from '../../features/user/accounts/store/contactsStore';

/**
 * Componente modal para el registro de nuevos destinatarios.
 * Procesa la creación del contacto en la base de datos según el tipo de cuenta destino.
 */
export const NewContactModal = ({ isOpen, onClose, onSuccess, contactType = 'BIK' }) => {
  const { addContact, loading: isLoading } = useContactsStore();
  const [formData, setFormData] = useState({
    alias: '',
    numeroCuenta: '',
    banco: contactType === 'BIK' ? 'Banco Informático Kinal' : '',
    tipoCuenta: 'Monetaria',
    swiftBic: '',
    nombreBeneficiario: ''
  });
  const [error, setError] = useState(null);

  /**
   * Actualiza el estado del formulario dinámicamente.
   */
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /**
   * Procesa la inserción del contacto mediante el API.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const payload = {
        alias: formData.alias,
        tipoDestinatario: contactType,
        banco: formData.banco,
        numeroCuenta: formData.numeroCuenta,
        tipoCuenta: formData.tipoCuenta,
        datosInternacionales: contactType === 'Internacional' ? {
          swiftBic: formData.swiftBic,
          nombreBeneficiario: formData.nombreBeneficiario
        } : undefined
      };

      const result = await addContact(payload);
      
      if (onSuccess) onSuccess(result);
      onClose();
      setFormData({
        alias: '',
        numeroCuenta: '',
        banco: contactType === 'BIK' ? 'Banco Informático Kinal' : '',
        tipoCuenta: 'Monetaria',
        swiftBic: '',
        nombreBeneficiario: ''
      });
    } catch (err) {
      setError(err.message || 'Error al guardar el destinatario.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Agregar Destinatario ${contactType}`}>
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center text-red-600 dark:text-red-400 text-sm">
          <AlertCircle size={16} className="mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Alias del Contacto
          </label>
          <input
            type="text"
            name="alias"
            placeholder="Ej. Pago Alquiler, Hermana"
            value={formData.alias}
            onChange={handleChange}
            className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-sm focus:ring-2 focus:ring-bik-blue outline-none text-gray-900 dark:text-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Número de Cuenta / IBAN
          </label>
          <input
            type="text"
            name="numeroCuenta"
            placeholder="Número de cuenta"
            value={formData.numeroCuenta}
            onChange={handleChange}
            className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-sm focus:ring-2 focus:ring-bik-blue outline-none text-gray-900 dark:text-white"
            required
          />
        </div>

        {contactType !== 'BIK' && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Nombre de la Institución
            </label>
            <div className="relative">
              <Building size={18} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                name="banco"
                placeholder="Nombre del Banco"
                value={formData.banco}
                onChange={handleChange}
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-3 pl-10 text-sm focus:ring-2 focus:ring-bik-blue outline-none text-gray-900 dark:text-white"
                required
              />
            </div>
          </div>
        )}

        {contactType === 'Internacional' && (
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Código SWIFT / BIC
              </label>
              <input
                type="text"
                name="swiftBic"
                value={formData.swiftBic}
                onChange={handleChange}
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-sm focus:ring-2 focus:ring-bik-blue outline-none text-gray-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Nombre Completo del Beneficiario
              </label>
              <input
                type="text"
                name="nombreBeneficiario"
                value={formData.nombreBeneficiario}
                onChange={handleChange}
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-sm focus:ring-2 focus:ring-bik-blue outline-none text-gray-900 dark:text-white"
                required
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-bik-blue hover:bg-blue-800 text-white font-bold py-3 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 mt-6"
        >
          {isLoading ? <Loader2 size={20} className="animate-spin mr-2" /> : <Save size={20} className="mr-2" />}
          {isLoading ? 'Guardando...' : 'Guardar Destinatario'}
        </button>
      </form>
    </Modal>
  );
};
