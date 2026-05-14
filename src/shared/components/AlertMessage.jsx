import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

export const AlertMessage = ({ type = 'info', message, onDismiss }) => {
  const types = {
    error: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
      text: 'text-red-600 dark:text-red-400',
      icon: <AlertCircle size={20} className="mr-2 flex-shrink-0" />
    },
    success: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-800',
      text: 'text-green-600 dark:text-green-400',
      icon: <CheckCircle size={20} className="mr-2 flex-shrink-0" />
    },
    warning: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      border: 'border-yellow-200 dark:border-yellow-800',
      text: 'text-yellow-600 dark:text-yellow-400',
      icon: <AlertTriangle size={20} className="mr-2 flex-shrink-0" />
    },
    info: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      text: 'text-blue-600 dark:text-blue-400',
      icon: <Info size={20} className="mr-2 flex-shrink-0" />
    }
  };

  const style = types[type] || types.info;

  if (!message) return null;

  return (
    <div className={`mb-6 p-4 border rounded-lg flex items-start justify-between text-sm ${style.bg} ${style.border} ${style.text}`}>
      <div className="flex items-center">
        {style.icon}
        <span className="font-medium">{message}</span>
      </div>
      {onDismiss && (
        <button onClick={onDismiss} className="ml-4 hover:opacity-75 transition-opacity">
          <X size={18} />
        </button>
      )}
    </div>
  );
};
