import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ size = 24, className = '', text = 'Cargando...' }) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
      <Loader2 size={size} className="animate-spin text-bik-blue dark:text-blue-400 mb-4" />
      {text && <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{text}</p>}
    </div>
  );
};
