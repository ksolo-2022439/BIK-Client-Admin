import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle, FileText, User, Loader2 } from 'lucide-react';
import { useRequestsStore } from './store/requestsStore';
import { usePermissions } from '../../shared/hooks/usePermissions';
import { StatusBadge } from '../../shared/components/StatusBadge';
import Swal from 'sweetalert2';

/**
 * Vista de detalle y gestión de solicitudes de productos financieros.
 * Permite a los administradores calificar, aprobar, rechazar o escalar solicitudes de cuentas y tarjetas.
 */
export const RequestDetailView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { canPerformAction } = usePermissions();
  const { selectedRequest: request, loading, fetchRequestDetail, changeRequestStatus, escalate } = useRequestsStore();

  const [actionLoading, setActionLoading] = useState(false);
  const [escalateNote, setEscalateNote] = useState('');

  useEffect(() => {
    fetchRequestDetail(id);
  }, [id]);

  /**
   * Procesa la actualización del estado de la gestión (Aprobada / Rechazada).
   * Despliega diálogos dinámicos para capturar montos de saldo o crédito inicial si aplica.
   * 
   * @param {string} nuevoEstado - El nuevo estado a asignar ("Aprobada" o "Rechazada").
   */
  const handleUpdateStatus = async (nuevoEstado) => {
    try {
      let customMonto = undefined;
      let customComentario = undefined;

      if (nuevoEstado === 'Aprobada') {
        const isCreditCard = request.tipoGestion?.includes('Tarjeta de Crédito');
        const isAccount = request.tipoGestion?.includes('Cuenta') || request.tipoGestion?.includes('Nueva Cuenta') || request.tipoGestion?.includes('Cuenta Digital');

        if (isCreditCard || isAccount) {
          const promptTitle = isCreditCard ? 'Límite de Crédito Aprobado' : 'Monto de Apertura / Saldo Inicial';
          const promptText = isCreditCard ? 'Ingrese el límite de crédito para la tarjeta:' : 'Ingrese el saldo inicial para la cuenta:';
          const defaultVal = request.montoSolicitado || (isCreditCard ? 5000 : 0);

          const { value: limitVal, isDismissed } = await Swal.fire({
            title: promptTitle,
            text: promptText,
            input: 'number',
            inputValue: defaultVal,
            inputPlaceholder: 'Ingrese un valor numérico...',
            showCancelButton: true,
            confirmButtonText: 'Aprobar y Asignar',
            cancelButtonText: 'Cancelar',
            inputValidator: (value) => {
              if (value === '' || Number(value) < 0) {
                return 'Por favor ingrese un monto válido igual o mayor a 0';
              }
            }
          });

          if (isDismissed) return;
          customMonto = Number(limitVal);
        } else {
          const confirm = await Swal.fire({
            title: '¿Estás seguro?',
            text: '¿Deseas aprobar esta gestión?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, aprobar',
            cancelButtonText: 'Cancelar'
          });
          if (!confirm.isConfirmed) return;
        }
      } else {
        const { value: rejectComment, isDismissed } = await Swal.fire({
          title: 'Rechazar Gestión',
          text: 'Ingrese un comentario o motivo de rechazo (opcional):',
          input: 'text',
          inputPlaceholder: 'Motivo del rechazo...',
          showCancelButton: true,
          confirmButtonText: 'Confirmar Rechazo',
          cancelButtonText: 'Cancelar'
        });
        if (isDismissed) return;
        customComentario = rejectComment;
      }

      setActionLoading(true);
      await changeRequestStatus(id, { 
        estado: nuevoEstado, 
        montoSolicitado: customMonto,
        comentario: customComentario || (nuevoEstado === 'Aprobada' ? 'Gestión aprobada con éxito' : 'Gestión rechazada')
      });
      Swal.fire('Éxito', `Gestión ${nuevoEstado.toLowerCase()} correctamente.`, 'success');
    } catch (error) {
      Swal.fire('Error', error.message || 'Error al actualizar el estado.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Escala la gestión actual a prioridad Alta adjuntando una justificación del analista de soporte.
   */
  const handleEscalate = async () => {
    try {
      setActionLoading(true);
      await escalate(id, { 
        prioridad: 'Alta', 
        comentario: escalateNote 
      });
      Swal.fire('Éxito', 'Gestión escalada correctamente.', 'success');
      setEscalateNote('');
    } catch (error) {
      Swal.fire('Error', error.message || 'Error al escalar la gestión.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-bik-blue mb-2" size={40} />
        <p className="text-gray-500">Cargando detalles de la gestión...</p>
      </div>
    );
  }

  if (!request) return null;

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
            <p className="text-gray-500 dark:text-gray-400 mt-1">Ingresada el {new Date(request.fechaSolicitud || request.createdAt).toLocaleString()}</p>
          </div>
        </div>
        
        {canPerformAction('approve_request') && (request.estado === 'Pendiente' || request.estado === 'En_Proceso') && (
          <div className="flex gap-3">
            <button 
              onClick={() => handleUpdateStatus('Rechazada')}
              disabled={actionLoading}
              className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              <XCircle size={18} />
              Rechazar
            </button>
            <button 
              onClick={() => handleUpdateStatus('Aprobada')}
              disabled={actionLoading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              <CheckCircle size={18} />
              Aprobar
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-3">
              <FileText size={20} className="text-bik-blue" />
              Detalle de la Solicitud
            </h2>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Tipo de Gestión</p>
                <p className="text-base text-gray-900 dark:text-white mt-1">{request.tipoGestion?.replace(/_/g, ' ') || 'N/A'}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Descripción proporcionada por el cliente</p>
                <div className="mt-2 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 text-sm leading-relaxed">
                  {request.descripcion || 'Sin descripción'}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Bitácora Interna</h2>
            {!request.notas || request.notas.length === 0 ? (
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

        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <User size={16} className="text-bik-blue" />
              Solicitante
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Nombre</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {request.usuarioId?.nombres} {request.usuarioId?.apellidos}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">DPI</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{request.usuarioId?.dpi}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Teléfono</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{request.usuarioId?.telefono}</p>
              </div>
              <button 
                onClick={() => navigate(`/clientes/${request.usuarioId?.publicId || request.usuarioId?._id}`)}
                className="w-full mt-2 py-2 text-sm text-bik-blue bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 font-medium rounded-lg transition-colors"
              >
                Ver Perfil Completo
              </button>
            </div>
          </div>

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
              
              <button 
                onClick={handleEscalate}
                disabled={actionLoading || !escalateNote}
                className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-lg transition-colors shadow-sm disabled:opacity-50"
              >
                {actionLoading ? 'Escalando...' : 'Escalar a Prioridad Alta'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
