import { CheckCircle, Download, Share2, Info } from 'lucide-react';
import { Modal } from './Modal';
import { formatCurrency } from '../utils/currency';

/**
 * Modal para visualizar el comprobante de una transacción exitosa.
 * Despliega los detalles finales y proporciona acciones para descargar o compartir el recibo.
 */
export const ReceiptModal = ({ isOpen, onClose, transaction }) => {
  if (!transaction) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Comprobante de Transacción">
      <div className="text-center mb-6">
        <div className="flex justify-center mb-4 text-green-500">
          <CheckCircle size={64} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">¡Transferencia Exitosa!</h2>
        <p className="text-gray-500 dark:text-gray-400">Los fondos han sido acreditados correctamente.</p>
      </div>

      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 mb-6 space-y-4">
        <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-600 pb-3">
          <span className="text-sm text-gray-500 dark:text-gray-400">Número de Referencia</span>
          <span className="text-sm font-mono font-bold text-gray-900 dark:text-white">{transaction.publicId || transaction._id || 'REF-837492'}</span>
        </div>
        <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-600 pb-3">
          <span className="text-sm text-gray-500 dark:text-gray-400">Fecha y Hora</span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {new Date(transaction.createdAt || Date.now()).toLocaleString('es-GT')}
          </span>
        </div>
        <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-600 pb-3">
          <span className="text-sm text-gray-500 dark:text-gray-400">Destinatario</span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">{transaction.destinatarioAlias || 'Cuenta Destino'}</span>
        </div>
        <div className="flex justify-between items-center pt-2">
          <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Monto Debitado</span>
          <span className="text-xl font-bold text-bik-blue dark:text-blue-400">{formatCurrency(transaction.monto, transaction.monedaOrigen || 'GTQ')}</span>
        </div>

        {transaction.monedaOrigen && transaction.monedaDestino && transaction.monedaOrigen !== transaction.monedaDestino && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600 space-y-3 bg-blue-50/50 dark:bg-blue-900/10 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-bik-blue dark:text-blue-400 font-medium mb-1">
              <Info size={16} /> Detalles de Conversión
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500 dark:text-gray-400">Tipo de Cambio</span>
              <span className="text-xs font-medium text-gray-900 dark:text-white">{transaction.tasaCambio}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500 dark:text-gray-400">Monto Acreditado</span>
              <span className="text-sm font-bold text-green-600 dark:text-green-400">
                {formatCurrency(transaction.montoAcreditado, transaction.monedaDestino)}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-4">
        <button className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-semibold py-3 rounded-lg flex items-center justify-center transition-colors">
          <Download size={18} className="mr-2" /> Guardar
        </button>
        <button className="flex-1 bg-bik-blue hover:bg-blue-800 text-white font-semibold py-3 rounded-lg flex items-center justify-center transition-colors">
          <Share2 size={18} className="mr-2" /> Compartir
        </button>
      </div>
    </Modal>
  );
};
