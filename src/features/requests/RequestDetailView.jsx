import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle, FileText, User } from 'lucide-react';
import { usePermissions } from '../../shared/hooks/usePermissions';
import { StatusBadge } from '../../shared/components/StatusBadge';

export const RequestDetailView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { canPerformAction } = usePermissions();
  const [loading, setLoading] = useState(false);
  const [escalateNote, setEscalateNote] = useState('');

  // Estructura visual de prueba.
  // En implementación real, se hace un fetch a /admin/requests/:id
  const request = {
    _id: id,
    fechaSolicitud: new Date().toISOString(),
    tipoGestion: 'Reposicion_Tarjeta',
    estado: 'Pendiente',
    prioridad: 'Normal',
    descripcion: 'Robo de billetera. Solicito reposición de mi tarjeta Visa.',
    usuarioId: {
      nombres: 'Juan Alberto',
      apellidos: 'Pérez Gómez',
      dpi: '1234567890101',
      telefono: '55443322'
    },
    notas: []
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/gestiones')}
            className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              Gestión #{request._id.slice(-6).toUpperCase()}
              <StatusBadge status={request.estado} />
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Ingresada el {new Date(request.fechaSolicitud).toLocaleString()}</p>
          </div>
        </div>
        
        {/* Acciones de resolución (Admin Gestiones / Soporte Presencial) */}
        {canPerformAction('approve_request') && request.estado === 'Pendiente' && (
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 font-medium rounded-lg transition-colors">
              <XCircle size={18} />
              Rechazar
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors shadow-sm">
              <CheckCircle size={18} />
              Aprobar
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Detalles principales */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-3">
              <FileText size={20} className="text-bik-blue" />
              Detalle de la Solicitud
            </h2>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Tipo de Gestión</p>
                <p className="text-base text-gray-900 dark:text-white mt-1">{request.tipoGestion.replace(/_/g, ' ')}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Descripción proporcionada por el cliente</p>
                <div className="mt-2 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 text-sm leading-relaxed">
                  {request.descripcion}
                </div>
              </div>
            </div>
          </div>

          {/* Historial de Notas */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Bitácora Interna</h2>
            {request.notas.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No hay notas registradas en esta gestión.</p>
            ) : (
              <div className="space-y-4">
                {request.notas.map((nota, i) => (
                  <div key={i} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-l-4 border-bik-blue">
                    <p className="text-xs text-gray-500 mb-1">{new Date(nota.fecha).toLocaleString()} • ID Empleado: {nota.autor}</p>
                    <p className="text-sm text-gray-800 dark:text-gray-200">{nota.texto}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Panel lateral */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <User size={16} className="text-bik-blue" />
              Solicitante
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Nombre</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{request.usuarioId.nombres} {request.usuarioId.apellidos}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">DPI</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{request.usuarioId.dpi}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Teléfono</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{request.usuarioId.telefono}</p>
              </div>
              <button 
                onClick={() => navigate(`/clientes/${request.usuarioId._id}`)}
                className="w-full mt-2 py-2 text-sm text-bik-blue bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 font-medium rounded-lg transition-colors"
              >
                Ver Perfil Completo
              </button>
            </div>
          </div>

          {/* Panel de Escalamiento (Soporte Remoto) */}
          {canPerformAction('escalate_request') && request.estado === 'Pendiente' && (
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-800/50 p-6">
              <h2 className="text-sm font-semibold text-orange-800 dark:text-orange-400 mb-3 flex items-center gap-2">
                <AlertTriangle size={16} />
                Escalar Gestión
              </h2>
              <p className="text-xs text-orange-700 dark:text-orange-300 mb-4">Si el caso requiere atención inmediata, puedes escalarlo para que un Administrador lo priorice.</p>
              
              <textarea 
                value={escalateNote}
                onChange={(e) => setEscalateNote(e.target.value)}
                placeholder="Motivo del escalamiento..."
                className="w-full p-3 text-sm bg-white dark:bg-gray-800 border border-orange-200 dark:border-orange-700 rounded-lg mb-3 focus:ring-2 focus:ring-orange-500 outline-none dark:text-white"
                rows="3"
              />
              
              <button className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-lg transition-colors shadow-sm">
                Escalar a Prioridad Alta
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
