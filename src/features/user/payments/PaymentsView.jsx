import { useState, useEffect } from 'react';
import { CreditCard, Landmark, Lightbulb, Globe, Shield, ArrowRight } from 'lucide-react';
import { Modal } from '../../../shared/components/Modal';
import { usePaymentsStore } from './store/paymentsStore';
import { useAccountsStore } from '../accounts/store/accountsStore';
import { useAuthStore } from '../../auth/store/authStore';
import Swal from 'sweetalert2';

/**
 * Vista premium para gestionar y efectuar el pago de servicios públicos y otras obligaciones.
 */
export const PaymentsView = () => {
  const { user } = useAuthStore();
  const { accounts: cuentas, fetchUserAccountsAndCards } = useAccountsStore();
  const { payService, loading } = usePaymentsStore();
  
  const [isServiceModalOpen, setServiceModalOpen] = useState(false);
  const [cuentaOrigenId, setCuentaOrigenId] = useState('');
  const [servicio, setServicio] = useState('');
  const [monto, setMonto] = useState('');
  const [descripcion, setDescripcion] = useState('');

  /**
   * Recupera las cuentas del cliente al cargar para poblar el dropdown de origen.
   */
  useEffect(() => {
    if (user?.id || user?._id) {
      fetchUserAccountsAndCards(user.id || user._id);
    }
  }, [user, fetchUserAccountsAndCards]);

  /**
   * Habilita el modal de pago de servicios o muestra aviso informativo para módulos en construcción.
   */
  const handleCategoryClick = (id) => {
    if (id === 'servicios') {
      setServiceModalOpen(true);
    } else {
      Swal.fire('Atención', 'Módulo en desarrollo para esta categoría', 'info');
    }
  };

  /**
   * Procesa la confirmación de pago de servicio debitando de la cuenta seleccionada.
   */
  const handlePayService = async (e) => {
    e.preventDefault();
    if (!cuentaOrigenId || !servicio || !monto) {
      Swal.fire('Error', 'Debe llenar los campos requeridos', 'error');
      return;
    }
    try {
      await payService({
        cuentaOrigenId,
        servicio,
        monto: Number(monto),
        descripcion
      });
      Swal.fire('Éxito', 'Servicio pagado correctamente', 'success');
      setServiceModalOpen(false);
      setCuentaOrigenId('');
      setServicio('');
      setMonto('');
      setDescripcion('');
      if (user?.id || user?._id) fetchUserAccountsAndCards(user.id || user._id);
    } catch (err) {
      Swal.fire('Error', err.message || 'Error al pagar el servicio', 'error');
    }
  };

  const paymentCategories = [
    { id: 'tarjetas', title: 'Tarjetas de crédito', icon: <CreditCard size={32} />, description: 'Paga tus tarjetas BIK o de otros bancos' },
    { id: 'prestamos', title: 'Préstamos', icon: <Landmark size={32} />, description: 'Abonos a capital o cuotas mensuales' },
    { id: 'servicios', title: 'Servicios', icon: <Lightbulb size={32} />, description: 'Agua, luz, teléfono, colegiaturas y más' },
    { id: 'remesas', title: 'Remesas', icon: <Globe size={32} />, description: 'Cobro y pago de remesas internacionales' },
    { id: 'seguros', title: 'Seguros', icon: <Shield size={32} />, description: 'Pago de primas de seguro de vida y vehículos' },
  ];

  return (
    <div className="w-full animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 transition-colors duration-300">Realizar un Pago</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
        {paymentCategories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategoryClick(category.id)}
            className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-col items-start text-left hover:shadow-md hover:border-bik-blue dark:hover:border-blue-400 transition-all duration-300"
          >
            <div className="bg-blue-50 dark:bg-blue-900/30 text-bik-blue dark:text-blue-400 p-4 rounded-lg mb-4 group-hover:bg-bik-blue group-hover:text-white transition-colors duration-300">
              {category.icon}
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-bik-blue dark:group-hover:text-blue-400 transition-colors duration-300">
              {category.title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 flex-1 transition-colors duration-300">
              {category.description}
            </p>
            <div className="flex items-center text-bik-orange dark:text-orange-400 font-semibold text-sm group-hover:translate-x-2 transition-all duration-300">
              Proceder al pago <ArrowRight size={16} className="ml-2" />
            </div>
          </button>
        ))}
      </div>

      <Modal isOpen={isServiceModalOpen} onClose={() => setServiceModalOpen(false)} title="Pagar Servicio">
        <form onSubmit={handlePayService} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cuenta Origen</label>
            <select
              value={cuentaOrigenId}
              onChange={(e) => setCuentaOrigenId(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-bik-blue"
              required
            >
              <option value="">Seleccione una cuenta</option>
              {cuentas.map(c => (
                <option key={c._id || c.numeroCuenta} value={c._id}>{c.numeroCuenta} - Q{c.saldo}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Servicio a Pagar</label>
            <select
              value={servicio}
              onChange={(e) => setServicio(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-bik-blue"
              required
            >
              <option value="">Seleccione el servicio</option>
              <option value="Agua">Agua</option>
              <option value="Luz">Luz</option>
              <option value="Telefono">Teléfono / Internet</option>
              <option value="Colegiatura">Colegiatura</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monto a Pagar (Q)</label>
            <input
              type="number"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-bik-blue"
              placeholder="Ej. 150.00"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción / Referencia</label>
            <input
              type="text"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-bik-blue"
              placeholder="Número de contador, teléfono, etc."
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-bik-blue hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors mt-4 disabled:opacity-50"
          >
            {loading ? 'Procesando...' : 'Confirmar Pago'}
          </button>
        </form>
      </Modal>
    </div>
  );
};