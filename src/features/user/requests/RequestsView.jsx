import { useState, useEffect } from 'react';
import { Wallet, CreditCard, SmartphoneNfc, ChevronRight, Send } from 'lucide-react';
import { useRequestsStore } from './store/requestsStore';
import { useAccountsStore } from '../accounts/store/accountsStore';
import { Modal } from '../../../shared/components/Modal';
import Swal from 'sweetalert2';

/**
 * Vista premium para que el cliente pueda realizar solicitudes de productos bancarios (cuentas, TC, TD).
 */
export const RequestsView = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({ detalles: '', montoSolicitado: '', cuentaVinculadaId: '' });

  const { createProductRequest, loadingRequests } = useRequestsStore();
  const { accounts, fetchUserAccountsAndCards } = useAccountsStore();

  /**
   * Recupera las cuentas asociadas para inyectarlas en campos relacionales del formulario.
   */
  useEffect(() => {
    fetchUserAccountsAndCards();
  }, [fetchUserAccountsAndCards]);

  const productRequests = [
    {
      id: 'nueva-cuenta', title: 'Nueva Cuenta Digital',
      description: 'Abre una nueva cuenta monetaria o de ahorro en minutos, sin visitar una agencia.',
      icon: <Wallet size={32} />,
      fields: [{ name: 'tipoCuenta', label: 'Tipo de cuenta', type: 'select', options: ['Monetaria', 'Ahorro'] }, { name: 'moneda', label: 'Moneda', type: 'select', options: ['GTQ', 'USD'] }]
    },
    {
      id: 'tarjeta-credito', title: 'Tarjeta de Crédito',
      description: 'Solicita una tarjeta con el límite que se adapte a tus necesidades y acumula puntos BIK.',
      icon: <CreditCard size={32} />,
      fields: [{ name: 'montoSolicitado', label: 'Límite de crédito deseado (Q)', type: 'number' }]
    },
    {
      id: 'tarjeta-debito', title: 'Tarjeta de Débito Digital',
      description: 'Genera una tarjeta virtual instantánea para tus compras seguras por internet.',
      icon: <SmartphoneNfc size={32} />,
      fields: [{ name: 'cuentaVinculadaId', label: 'Cuenta a vincular', type: 'select-account' }]
    }
  ];

  /**
   * Habilita el modal dinámico con el esquema de campos asignado al producto bancario.
   */
  const openModal = (product) => {
    setSelectedProduct(product);
    setFormData({ detalles: '', montoSolicitado: '', tipoCuenta: 'Monetaria', moneda: 'GTQ', cuentaVinculadaId: '' });
    setIsModalOpen(true);
  };

  /**
   * Construye los detalles técnicos e inyecta la gestión atómica a la API.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userId = JSON.parse(localStorage.getItem('bik_user'))?._id;
      if (formData.montoSolicitado && Number(formData.montoSolicitado) <= 0) {
        return Swal.fire('Error', 'El monto o límite solicitado debe ser mayor a 0.', 'error');
      }

      const detailParts = [];
      if (formData.tipoCuenta) detailParts.push(`Tipo: ${formData.tipoCuenta}`);
      if (formData.moneda) detailParts.push(`Moneda: ${formData.moneda}`);
      if (formData.montoSolicitado) detailParts.push(`Límite solicitado: Q${formData.montoSolicitado}`);
      if (formData.cuentaVinculadaId) {
        const acc = accounts.find(a => a.id === formData.cuentaVinculadaId || a._id === formData.cuentaVinculadaId);
        if (acc) detailParts.push(`Vincular a cuenta: ${acc.numeroCuenta || acc.number}`);
      }
      if (formData.detalles) detailParts.push(formData.detalles);

      await createProductRequest({
        usuarioId: userId,
        cuentaVinculadaId: formData.cuentaVinculadaId || undefined,
        tipoGestion: `SOLICITUD DE PRODUCTO: ${selectedProduct.title}`,
        descripcion: detailParts.join(' | ') || `Solicitud de ${selectedProduct.title}`,
        estado: 'Pendiente',
        montoSolicitado: formData.montoSolicitado ? Number(formData.montoSolicitado) : undefined
      });
      Swal.fire('¡Solicitud Enviada!', `Tu solicitud de "${selectedProduct.title}" ha sido registrada. Un ejecutivo te contactará pronto.`, 'success');
      setIsModalOpen(false);
    } catch (err) {
      Swal.fire('Error', err.message || 'Error al enviar la solicitud', 'error');
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">Solicitud de Productos</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2 transition-colors duration-300">Selecciona el producto que deseas solicitar a un ejecutivo.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up">
        {productRequests.map((product) => (
          <button key={product.id} onClick={() => openModal(product)}
            className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-col items-center text-center hover:shadow-lg hover:border-bik-orange dark:hover:border-orange-400 transition-all duration-300 relative overflow-hidden active:scale-95">
            <div className="absolute top-0 left-0 w-full h-1 bg-bik-blue dark:bg-blue-600 group-hover:bg-bik-orange dark:group-hover:bg-orange-500 transition-colors duration-300"></div>
            <div className="bg-orange-50 dark:bg-orange-900/30 text-bik-orange dark:text-orange-400 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">{product.icon}</div>
            <h3 className="text-lg font-bold text-bik-blue dark:text-blue-400 mb-2 transition-colors duration-300">{product.title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 flex-1 transition-colors duration-300">{product.description}</p>
            <div className="w-full bg-gray-50 dark:bg-gray-700 py-3 rounded-lg text-bik-blue dark:text-blue-400 font-semibold group-hover:bg-bik-blue group-hover:text-white dark:group-hover:text-white transition-colors duration-300 flex justify-center items-center">
              Iniciar solicitud <ChevronRight size={18} className="ml-1" />
            </div>
          </button>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Solicitar: ${selectedProduct?.title}`}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">Completa los datos y un ejecutivo procesará tu solicitud en 24-48 horas hábiles.</p>
          
          {selectedProduct?.fields?.map(field => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{field.label}</label>
              {field.type === 'select' ? (
                <select value={formData[field.name] || ''} onChange={(e) => setFormData({...formData, [field.name]: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-bik-blue">
                  {field.options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : field.type === 'select-account' ? (
                <select value={formData[field.name] || ''} onChange={(e) => setFormData({...formData, [field.name]: e.target.value})} required
                  className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-bik-blue">
                  <option value="">-- Selecciona una cuenta --</option>
                  {accounts.filter(a => !a.isCard).map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.number} ({acc.tipo || 'Cuenta'} - {acc.moneda})
                    </option>
                  ))}
                </select>
              ) : (
                <input type={field.type} min={field.type === 'number' ? "0" : undefined} value={formData[field.name] || ''} onChange={(e) => setFormData({...formData, [field.name]: e.target.value})} placeholder={`Ingresa ${field.label.toLowerCase()}`}
                  className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-bik-blue" />
              )}
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Comentarios adicionales (opcional)</label>
            <textarea rows="3" value={formData.detalles} onChange={(e) => setFormData({...formData, detalles: e.target.value})} placeholder="Información adicional..."
              className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-bik-blue resize-none" />
          </div>

          <button type="submit" disabled={loadingRequests}
            className="w-full bg-bik-blue hover:bg-blue-800 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50">
            <Send size={18} className="mr-2" /> {loadingRequests ? 'Enviando...' : 'Enviar Solicitud'}
          </button>
        </form>
      </Modal>
    </div>
  );
};