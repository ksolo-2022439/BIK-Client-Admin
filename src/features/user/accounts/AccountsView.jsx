import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AccountCard } from './components/AccountCard';
import { Modal } from '../../../shared/components/Modal';
import { formatCurrency, formatGTQ } from '../../../shared/utils/currency';
import { Wallet, PlusCircle } from 'lucide-react';
import { useAccountsStore } from './store/accountsStore';

export const AccountsView = () => {
  const [activeTab, setActiveTab] = useState('todas');
  const [selectedDetails, setSelectedDetails] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const { 
    accounts: storeAccounts, 
    cards: allCards, 
    loading, 
    fetchUserAccountsAndCards, 
    toggleFavoriteAccount,
    recentTransactions,
    loadingTransactions,
    fetchAccountTransactions,
    clearTransactions
  } = useAccountsStore();

  useEffect(() => {
    fetchUserAccountsAndCards();
  }, [fetchUserAccountsAndCards]);

  useEffect(() => {
    if (isModalOpen && selectedDetails && !selectedDetails.isCard) {
      fetchAccountTransactions(selectedDetails.id);
    } else {
      clearTransactions();
    }
  }, [isModalOpen, selectedDetails, fetchAccountTransactions, clearTransactions]);

  const handleToggleFavorite = async (id, currentFav) => {
    await toggleFavoriteAccount(id, currentFav);
  };

  const handleViewDetails = (account) => {
    setSelectedDetails(account);
    setIsModalOpen(true);
  };

  const filteredAccounts = storeAccounts.filter(account => {
    if (activeTab === 'favoritas') return account.isFavorite;
    if (activeTab === 'todas') return !account.isCard;
    if (activeTab === 'tarjetas') return account.isCard;
    return true;
  });

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 transition-colors duration-300">Resumen de Cuentas</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg p-1 shadow-sm border border-gray-200 dark:border-gray-700 inline-flex mb-8 transition-colors duration-300">
        {['Favoritas', 'Todas', 'Tarjetas'].map((tab) => {
          const tabKey = tab.toLowerCase();
          return (
            <button
              key={tabKey}
              onClick={() => setActiveTab(tabKey)}
              className={`px-6 py-2 rounded-md text-sm font-semibold transition-all duration-300 ${
                activeTab === tabKey
                  ? 'bg-bik-blue text-white shadow'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bik-blue"></div>
        </div>
      ) : (storeAccounts || []).length === 0 ? (
        <div key="empty-all" className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 border-dashed transition-colors duration-300 animate-slide-up">
          <div className="bg-blue-50 dark:bg-blue-900/30 p-5 rounded-full w-max mx-auto mb-6">
            <Wallet size={48} className="text-bik-blue dark:text-blue-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Aún no tienes cuentas</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto">Solicita tu primera cuenta digital BIK y comienza a disfrutar de todos los beneficios.</p>
          <button
            onClick={() => navigate('/gestiones/solicitud-productos')}
            className="bg-bik-blue hover:bg-blue-800 text-white font-bold py-3 px-8 rounded-lg flex items-center justify-center mx-auto transition-colors shadow-md active:scale-95"
          >
            <PlusCircle size={20} className="mr-2" />
            Solicitar nueva cuenta
          </button>
        </div>
      ) : filteredAccounts.length > 0 ? (
        <div key={activeTab} className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 animate-slide-up">
          {filteredAccounts.map((account) => (
            <AccountCard 
              key={account.id} 
              account={account} 
              onViewDetails={handleViewDetails}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>
      ) : (
        <div key={activeTab} className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 border-dashed transition-colors duration-300 animate-slide-up">
          <p className="text-gray-500 dark:text-gray-400 font-medium">No hay elementos disponibles en esta categoría.</p>
        </div>
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={selectedDetails ? `Detalles: ${selectedDetails.name}` : 'Detalles de Cuenta'}
      >
        {selectedDetails && (
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-1">Número</h3>
              <p className="font-mono text-gray-900 dark:text-white">{selectedDetails.number}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-1">Disponible</h3>
                <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(selectedDetails.balance, selectedDetails.moneda)}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-1">Reservado</h3>
                <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(selectedDetails.reserved || 0, selectedDetails.moneda)}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-1">Bloqueado</h3>
                <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(selectedDetails.blocked || 0, selectedDetails.moneda)}</p>
              </div>
            </div>

            {/* Tarjetas de débito vinculadas */}
            {!selectedDetails.isCard && allCards.filter(c => c.cuentaVinculadaId === selectedDetails.id || c.cuentaVinculadaId?._id === selectedDetails.id).length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
                <h3 className="text-md font-bold text-gray-900 dark:text-white mb-4">Tarjetas Vinculadas</h3>
                <div className="space-y-3">
                  {allCards.filter(c => c.cuentaVinculadaId === selectedDetails.id || c.cuentaVinculadaId?._id === selectedDetails.id).map(card => (
                    <div key={card._id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-6 bg-gradient-to-r from-blue-600 to-blue-800 rounded flex items-center justify-center">
                          <span className="text-[8px] font-bold text-white italic">DÉBITO</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">**** {card.numeroTarjeta.slice(-4)}</p>
                          <p className="text-xs text-gray-500">{card.tipo}</p>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-semibold ${card.configuraciones?.bloqueada ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {card.configuraciones?.bloqueada ? 'Bloqueada' : 'Activa'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
              <h3 className="text-md font-bold text-gray-900 dark:text-white mb-4">Últimas Transacciones</h3>
              <div className="space-y-3">
                {loadingTransactions ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-bik-blue"></div>
                  </div>
                ) : recentTransactions.length === 0 ? (
                  <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                    No hay transacciones recientes para esta cuenta.
                  </div>
                ) : (
                  recentTransactions.map(tx => {
                    const isCredit = tx.cuentaDestinoId?.numeroCuenta === selectedDetails.number || 
                                     tx.cuentaDestinoId?._id === selectedDetails.id || 
                                     tx.cuentaDestinoId === selectedDetails.id;
                    let displayAmount = tx.monto;
                    if (isCredit) {
                      if (tx.montoAcreditado !== undefined && tx.montoAcreditado !== null) {
                        displayAmount = tx.montoAcreditado;
                      } else if (tx.descripcion && tx.descripcion.includes('→')) {
                        try {
                          const parts = tx.descripcion.split('→');
                          if (parts.length > 1) {
                            const destPart = parts[1].split('@')[0].trim();
                            const numericStr = destPart.replace(/[^0-9.]/g, '');
                            const parsed = parseFloat(numericStr);
                            if (!isNaN(parsed)) {
                              displayAmount = parsed;
                            }
                          }
                        } catch (e) {
                          console.error("Error parseando monto de descripción legada:", e);
                        }
                      } else {
                        const origenMoneda = tx.cuentaOrigenId?.moneda;
                        const destinoMoneda = selectedDetails.moneda;
                        if (origenMoneda && destinoMoneda && origenMoneda !== destinoMoneda) {
                          if (origenMoneda === 'GTQ' && destinoMoneda === 'USD') {
                            displayAmount = tx.monto / 7.75;
                          } else if (origenMoneda === 'USD' && destinoMoneda === 'GTQ') {
                            displayAmount = tx.monto * 7.75;
                          }
                        }
                      }
                    }
                    return (
                      <div key={tx._id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{tx.descripcion || tx.tipo}</p>
                          <p className="text-xs text-gray-500">{new Date(tx.createdAt).toLocaleDateString()}</p>
                        </div>
                        <p className={`text-sm font-bold ${isCredit ? 'text-green-600' : 'text-red-600'}`}>
                          {isCredit ? '+' : '-'} {formatCurrency(displayAmount, selectedDetails.moneda)}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};