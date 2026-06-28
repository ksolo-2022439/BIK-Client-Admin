import { useState, useEffect } from 'react';
import { Search, ChevronRight, FileText, Send } from 'lucide-react';
import { useRequestsStore } from './store/requestsStore';
import { useAuthStore } from '../../auth/store/authStore';
import { Modal } from '../../../shared/components/Modal';
import Swal from 'sweetalert2';

/**
 * Vista para gestionar trámites administrativos en línea.
 * Presenta un listado filtrable de gestiones disponibles para el usuario.
 */
export const OnlineRequestsView = () => {
  const [activeTab, setActiveTab] = useState('gestiones');
  const { user } = useAuthStore();
  const { 
    createProductRequest, 
    fetchUserRequests, 
    loadingRequests: loading, 
    error: storeError 
  } = useRequestsStore();
  
  const [historial, setHistorial] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGestion, setSelectedGestion] = useState('');
  const [detalles, setDetalles] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchHistorial = async () => {
    const data = await fetchUserRequests();
    setHistorial(data || []);
  };

  useEffect(() => {
    if (activeTab === 'historial') fetchHistorial();
  }, [activeTab]);

  const gestiones = [
    "BIK ADICIÓN DE CUENTAS PROPIAS",
    "BIK ELIMINACIÓN DE USUARIO",
    "BIK PERMISO DE TRANSFERENCIA AL EXTERIOR",
    "BIK MÓVIL SOLICITUD DE SERVICIO",
    "SOLICITUD DE PRÉSTAMO",
    "TARJETA BIK GANG SOLICITUD DE TARJETA",
    "TARJETA DE CRÉDITO AUMENTO DE LÍMITE",
    "TARJETA DE CRÉDITO CONFIGURACIONES",
    "TARJETA DE CRÉDITO PERSONALIZACIÓN"
  ];

  const filteredGestiones = gestiones.filter(g => g.toLowerCase().includes(searchTerm.toLowerCase()));

  const openGestionModal = (gestion) => {
    setSelectedGestion(gestion);
    setDetalles('');
    setIsModalOpen(true);
  };

  const handleSubmitGestion = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const userId = user?.id || user?._id;
      await createProductRequest({
        usuarioId: userId,
        tipoGestion: selectedGestion,
        descripcion: detalles || `Solicitud de: ${selectedGestion}`,
        estado: 'Pendiente'
      });
      Swal.fire('Solicitud Enviada', `Tu gestión "${selectedGestion}" ha sido registrada y será procesada por un ejecutivo.`, 'success');
      setIsModalOpen(false);
      setActiveTab('historial');
    } catch (err) {
      Swal.fire('Error', err.message || 'Error al enviar la gestión', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Gestiones en línea</h1>

      <div className="flex border-b border-gray-300 dark:border-gray-700 mb-6 bg-white dark:bg-gray-900 sticky top-0 z-10">
        {[{ key: 'gestiones', label: 'Gestiones' }, { key: 'historial', label: 'Historial' }].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-3 text-center font-semibold text-sm transition-colors ${
              activeTab === tab.key
                ? 'border-b-2 border-bik-blue text-bik-blue dark:border-blue-400 dark:text-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}>{tab.label}</button>
        ))}
      </div>

      {activeTab === 'gestiones' && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 text-gray-900 dark:text-white" size={20} />
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar gestión..."
              className="w-full bg-white dark:bg-gray-800 border-none shadow-sm rounded-lg p-3.5 pl-12 text-gray-900 dark:text-white focus:ring-2 focus:ring-bik-blue outline-none transition-all" />
          </div>
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
            {filteredGestiones.map((gestion, index) => (
              <button key={index} onClick={() => openGestionModal(gestion)}
                className="w-full flex justify-between items-center p-5 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left">
                <span className="text-sm font-bold text-bik-blue dark:text-blue-400 pr-4">{gestion}</span>
                <ChevronRight size={20} className="text-gray-900 dark:text-white flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'historial' && (
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bik-blue mx-auto"></div></div>
          ) : historial.length > 0 ? (
            historial.map((req, idx) => (
              <div key={req._id || idx} className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-5 flex flex-col border border-gray-100 dark:border-gray-700">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-bik-blue dark:text-blue-400 flex items-center">
                    <FileText size={16} className="mr-2" /> {req.tipoGestion || req.tipo}
                  </span>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    req.estado === 'Aprobada' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    req.estado === 'Rechazada' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                  }`}>{req.estado}</span>
                </div>
                {req.createdAt && <p className="text-xs text-gray-400 mb-1">{new Date(req.createdAt).toLocaleDateString('es-GT')}</p>}
                <p className="text-sm text-gray-700 dark:text-gray-300">{req.descripcion || req.detalles || 'Sin detalles'}</p>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">No tienes gestiones registradas.</div>
          )}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedGestion}>
        <form onSubmit={handleSubmitGestion} className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">Tu solicitud será procesada por un ejecutivo de BIK en un plazo de 24-48 horas hábiles.</p>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Detalles o comentarios adicionales</label>
            <textarea rows="4" value={detalles} onChange={(e) => setDetalles(e.target.value)} placeholder="Describe tu solicitud con el mayor detalle posible..."
              className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-bik-blue resize-none" />
          </div>
          <button type="submit" disabled={submitting}
            className="w-full bg-bik-blue hover:bg-blue-800 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50">
            <Send size={18} className="mr-2" /> {submitting ? 'Enviando...' : 'Enviar Solicitud'}
          </button>
        </form>
      </Modal>
    </div>
  );
};