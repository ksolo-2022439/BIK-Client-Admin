import { useState, useEffect } from 'react';
import { useCardsStore } from './store/cardsStore';
import { Search, CreditCard, Filter, Eye, Lock, Unlock, Loader2, X, Wallet } from 'lucide-react';
import { DataTable } from '../../shared/components/DataTable';
import { StatusBadge } from '../../shared/components/StatusBadge';
import { Modal } from '../../shared/components/Modal';

export const CardsManageView = () => {
  const { cards, loading, toggling, error, fetchCardsByDpi, toggleCardFreeze } = useCardsStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const [selectedCard, setSelectedCard] = useState(null); // Tarjeta para ver detalles
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const searchCards = async () => {
    if (!searchTerm.trim()) return;
    await fetchCardsByDpi(searchTerm.trim(), filterTipo);
  };

  const handleToggleFreeze = async (cardId) => {
    const success = await toggleCardFreeze(cardId);
    if (!success) {
      alert(error || 'Error al cambiar estado de la tarjeta.');
    }
  };

  const openDetail = (card) => {
    setSelectedCard(card);
    setIsDetailOpen(true);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    searchCards();
  };

  const columns = [
    { 
      key: 'numeroTarjeta', 
      label: 'Número de Tarjeta',
      render: (row) => {
        const num = row.numeroTarjeta || '';
        return `**** **** **** ${num.slice(-4)}`;
      }
    },
    { key: 'clienteNombre', label: 'Propietario' },
    { key: 'tipo', label: 'Tipo' },
    { 
      key: 'fechaExpiracion', 
      label: 'Expiración',
      render: (row) => row.fechaExpiracion || 'N/A'
    },
    { 
      key: 'estado', 
      label: 'Estado',
      render: (row) => <StatusBadge status={row.configuraciones?.bloqueada ? 'Bloqueada' : 'Activa'} />
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => openDetail(row)}
            className="p-1.5 text-bik-blue hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
            title="Ver detalles"
          >
            <Eye size={16} />
          </button>
          <button 
            onClick={() => handleToggleFreeze(row.publicId || row._id)}
            disabled={toggling === (row.publicId || row._id)}
            className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium ${
              row.configuraciones?.bloqueada 
                ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30' 
                : 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30'
            }`}
            title={row.configuraciones?.bloqueada ? 'Desbloquear' : 'Bloquear'}
          >
            {toggling === (row.publicId || row._id) ? (
              <Loader2 size={14} className="animate-spin" />
            ) : row.configuraciones?.bloqueada ? (
              <><Unlock size={14} /><span>Desbloquear</span></>
            ) : (
              <><Lock size={14} /><span>Bloquear</span></>
            )}
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestión de Tarjetas</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Control y bloqueo de tarjetas de crédito y débito</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-bik-blue dark:text-white" 
              placeholder="Buscar por DPI del cliente..." 
            />
          </div>
          <div className="w-full md:w-48 relative">
            <Filter size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select 
              value={filterTipo}
              onChange={(e) => setFilterTipo(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-bik-blue appearance-none"
            >
              <option value="">Todos los tipos</option>
              <option value="Credito">Crédito</option>
              <option value="Debito">Débito</option>
            </select>
          </div>
          <button type="submit" className="px-6 py-2.5 bg-bik-blue hover:bg-blue-800 text-white font-medium rounded-lg transition-colors">
            Buscar
          </button>
        </form>
      </div>

      {cards.length === 0 && !loading ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-12 text-center">
          <CreditCard size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">Ingresa el DPI de un cliente para ver sus tarjetas</p>
        </div>
      ) : (
        <DataTable 
          columns={columns}
          data={cards}
          loading={loading}
        />
      )}

      {/* ======================== MODAL: Detalle de Tarjeta ======================== */}
      <Modal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} title="Detalle de Tarjeta" size="md">
        {selectedCard && (
          <div className="space-y-5">
            {/* Preview de tarjeta visual */}
            <div className={`relative w-full h-48 rounded-2xl bg-gradient-to-br ${selectedCard.tipo === 'Credito' ? 'from-orange-500 to-red-600' : 'from-blue-600 to-blue-900'} p-6 shadow-lg text-white overflow-hidden`}>
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4"></div>
              
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <p className="text-xs text-white/70 uppercase tracking-wider">Banco Informático Kinal</p>
                  <p className="text-sm font-bold mt-1">{selectedCard.tipo}</p>
                </div>
                <StatusBadge status={selectedCard.configuraciones?.bloqueada ? 'Bloqueada' : 'Activa'} />
              </div>
              
              <p className="text-xl font-mono tracking-[0.15em] mt-6 relative z-10">
                {selectedCard.numeroTarjeta?.replace(/(.{4})/g, '$1 ').trim() || '---- ---- ---- ----'}
              </p>
              
              <div className="flex justify-between items-end mt-4 relative z-10">
                <div>
                  <p className="text-[10px] text-white/60 uppercase">Propietario</p>
                  <p className="text-sm font-bold">{selectedCard.clienteNombre || 'N/A'}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-white/60 uppercase">Expira</p>
                  <p className="text-sm font-bold">{selectedCard.fechaExpiracion || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Detalles técnicos */}
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm text-gray-500 dark:text-gray-400">ID MongoDB</span>
                <span className="text-sm font-mono text-gray-900 dark:text-white">{selectedCard._id}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm text-gray-500 dark:text-gray-400">CVV</span>
                <span className="text-sm font-mono text-gray-900 dark:text-white">***</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm text-gray-500 dark:text-gray-400">DPI del Propietario</span>
                <span className="text-sm font-mono text-gray-900 dark:text-white">{selectedCard.clienteDpi}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1"><Wallet size={14} /> Cuenta Vinculada</span>
                <span className="text-sm font-mono text-gray-900 dark:text-white">{selectedCard.cuentaVinculadaId || 'N/A (Crédito)'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm text-gray-500 dark:text-gray-400">Compras Internacionales</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedCard.configuraciones?.comprasInternacionales ? 'Habilitadas' : 'Deshabilitadas'}</span>
              </div>
              {selectedCard.tipo === 'Credito' && (
                <>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Límite de Crédito</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">Q {selectedCard.limiteCredito?.toLocaleString('es-GT', { minimumFractionDigits: 2 }) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Saldo Utilizado</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">Q {selectedCard.saldoUtilizado?.toLocaleString('es-GT', { minimumFractionDigits: 2 }) || '0.00'}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Creada</span>
                <span className="text-sm text-gray-900 dark:text-white">{selectedCard.createdAt ? new Date(selectedCard.createdAt).toLocaleString() : 'N/A'}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
              <button 
                onClick={() => { handleToggleFreeze(selectedCard.publicId || selectedCard._id); setIsDetailOpen(false); }}
                className={`w-full py-2.5 font-medium rounded-lg transition-colors flex justify-center items-center gap-2 ${
                  selectedCard.configuraciones?.bloqueada 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                {selectedCard.configuraciones?.bloqueada ? <><Unlock size={18} /> Desbloquear Tarjeta</> : <><Lock size={18} /> Bloquear Tarjeta</>}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
