import { Eye, Star, StarOff } from 'lucide-react';
import { formatGTQ } from '../../../../shared/utils/currency';

export const AccountCard = ({ account, onViewDetails, onToggleFavorite }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-col justify-between h-full hover:shadow-md transition-all duration-300 relative">
      {!account.isCard && onToggleFavorite && (
        <button 
          onClick={() => onToggleFavorite(account.id, account.isFavorite)}
          className="absolute top-4 right-4 text-yellow-400 hover:text-yellow-500 transition-colors"
          title="Alternar Favorito"
        >
          {account.isFavorite ? <Star size={20} fill="currentColor" /> : <StarOff size={20} />}
        </button>
      )}
      <div>
        <div className="flex justify-between items-start mb-4">
          <div className="pr-8">
            <h3 className="text-lg font-bold text-bik-blue dark:text-blue-400 transition-colors duration-300">{account.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-mono transition-colors duration-300">{account.number}</p>
          </div>
          <span className="bg-blue-50 dark:bg-blue-900/30 text-bik-blue dark:text-blue-300 text-xs font-semibold px-3 py-1 rounded-full transition-colors duration-300">
            {account.isCard ? 'Crédito' : account.isSavings ? 'Ahorro' : 'Monetaria'}
          </span>
        </div>
        <div className="mb-6">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1 transition-colors duration-300">{account.isCard ? 'Límite de crédito' : 'Fondos disponibles'}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-300">{formatGTQ(account.balance, account.moneda)}</p>
          {account.isCard && account.creditLimit > 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Utilizado: {formatGTQ(account.creditUsed || 0)} — Disponible: {formatGTQ((account.creditLimit - (account.creditUsed || 0)))}</p>
          )}
        </div>
      </div>
      <div className="flex gap-3 mt-4">
        <button 
          onClick={() => onViewDetails && onViewDetails(account)}
          className="flex-1 bg-bik-blue hover:bg-blue-800 text-white py-2.5 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center">
          <Eye size={18} className="mr-2" />
          Ver Detalles
        </button>
      </div>
    </div>
  );
};