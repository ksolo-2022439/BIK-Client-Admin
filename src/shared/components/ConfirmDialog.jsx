import { Modal } from './Modal';
import { AlertTriangle, Info, CheckCircle } from 'lucide-react';

export const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirmar', cancelText = 'Cancelar', variant = 'warning', loading = false }) => {
  const variants = {
    warning: {
      color: 'bg-red-600 hover:bg-red-700 text-white',
      icon: <AlertTriangle size={32} className="text-red-500 mb-4 mx-auto" />
    },
    info: {
      color: 'bg-bik-blue hover:bg-blue-800 text-white',
      icon: <Info size={32} className="text-bik-blue mb-4 mx-auto" />
    },
    success: {
      color: 'bg-green-600 hover:bg-green-700 text-white',
      icon: <CheckCircle size={32} className="text-green-500 mb-4 mx-auto" />
    }
  };

  const currentVariant = variants[variant] || variants.info;

  return (
    <Modal isOpen={isOpen} onClose={loading ? undefined : onClose} title={title}>
      <div className="text-center py-4">
        {currentVariant.icon}
        <p className="text-gray-700 dark:text-gray-300">{message}</p>
      </div>
      <div className="flex justify-end gap-3 mt-6">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          {cancelText}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className={`px-4 py-2 font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center ${currentVariant.color}`}
        >
          {loading ? 'Procesando...' : confirmText}
        </button>
      </div>
    </Modal>
  );
};
