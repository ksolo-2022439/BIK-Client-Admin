import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bikApi } from '../../shared/api/axiosInstance';
import { StatusBadge } from '../../shared/components/StatusBadge';
import { DataTable } from '../../shared/components/DataTable';
import { ArrowLeft, Wallet, User, CreditCard, ArrowRightLeft, Calendar, MapPin, Phone, Mail, Hash } from 'lucide-react';
import { formatCurrency, getCurrencySymbol } from '../../shared/utils/currency';

export const AccountDetailView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await bikApi.get(`/admin/accounts/${id}/detail`);
        setData(response.data.data);
      } catch (err) {
        setError('Error al cargar el detalle de la cuenta');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading) return <div className="p-8 flex justify-center"><div className="w-8 h-8 border-4 border-bik-blue border-t-transparent rounded-full animate-spin"></div></div>;
  if (error) return <div className="p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg">{error}</div>;
  if (!data) return null;

  const { account, owner, cards, recentTransactions } = data;

  const txColumns = [
    { key: 'fecha', label: 'Fecha', render: (row) => new Date(row.createdAt).toLocaleString() },
    { key: 'tipo', label: 'Tipo' },
    { key: 'descripcion', label: 'Descripción' },
    { 
      key: 'monto', label: 'Monto',
      render: (row) => {
        const isCredit = String(row.cuentaDestinoId) === id;
        return (
          <span className={`font-bold ${isCredit ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
            {isCredit ? '+' : '-'} {formatCurrency(row.monto, account.moneda)}
          </span>
        );
      }
    },
    { key: 'estado', label: 'Estado', render: (row) => <StatusBadge status={row.estado} /> }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/cuentas')} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            Cuenta {account.numeroCuenta}
            <StatusBadge status={account.estado} />
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{account.tipo} • {account.moneda === 'USD' ? 'Dólares (USD)' : 'Quetzales (GTQ)'} • Creada el {new Date(account.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna izquierda: Info de cuenta y propietario */}
        <div className="space-y-6">
          {/* Datos de la cuenta */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Wallet size={20} className="text-bik-blue" />
              Información de la Cuenta
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm text-gray-500 dark:text-gray-400">No. Cuenta</span>
                <span className="text-sm font-bold font-mono text-gray-900 dark:text-white">{account.numeroCuenta}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm text-gray-500 dark:text-gray-400">Tipo</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{account.tipo}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm text-gray-500 dark:text-gray-400">Moneda</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{account.moneda === 'USD' ? 'Dólares (USD)' : 'Quetzales (GTQ)'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm text-gray-500 dark:text-gray-400">Saldo Disponible</span>
                <span className="text-lg font-bold text-bik-blue dark:text-blue-400">{formatCurrency(account.saldo, account.moneda)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm text-gray-500 dark:text-gray-400">Límite Diario</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(account.limiteTransferenciaDiario, account.moneda)}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Estado</span>
                <StatusBadge status={account.estado} />
              </div>
            </div>
          </div>

          {/* Datos del propietario */}
          {owner && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <User size={20} className="text-bik-blue" />
                Propietario
              </h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Hash size={16} className="text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">DPI</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{owner.dpi}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <User size={16} className="text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Nombre Completo</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{owner.nombres} {owner.apellidos}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail size={16} className="text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Correo</p>
                    <p className="text-sm text-gray-900 dark:text-white break-all">{owner.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone size={16} className="text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Teléfono</p>
                    <p className="text-sm text-gray-900 dark:text-white">{owner.telefono}</p>
                  </div>
                </div>
                <button 
                  onClick={() => navigate(`/clientes/${owner._id}`)}
                  className="w-full mt-2 py-2 text-sm text-bik-blue bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 font-medium rounded-lg transition-colors"
                >
                  Ver Perfil Completo del Cliente
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Columna derecha: Tarjetas vinculadas y transacciones */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tarjetas vinculadas a esta cuenta */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-5 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <CreditCard size={20} className="text-bik-blue" />
                Tarjetas Vinculadas ({cards?.length || 0})
              </h2>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {!cards || cards.length === 0 ? (
                <p className="p-5 text-sm text-gray-500 text-center">No hay tarjetas vinculadas a esta cuenta</p>
              ) : (
                cards.map(card => {
                  const isBlocked = card.configuraciones?.bloqueada;
                  return (
                    <div key={card._id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-8 rounded bg-gradient-to-r ${card.tipo === 'Credito' ? 'from-orange-500 to-red-500' : 'from-blue-600 to-blue-800'} flex items-center justify-center`}>
                          <span className="text-white text-[9px] font-bold">{card.tipo === 'Credito' ? 'CRÉDITO' : 'DÉBITO'}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white text-sm">**** {card.numeroTarjeta?.slice(-4) || '----'}</p>
                          <p className="text-xs text-gray-500">Exp: {card.fechaExpiracion || 'N/A'}</p>
                        </div>
                      </div>
                      <StatusBadge status={isBlocked ? 'Bloqueada' : 'Activa'} />
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Últimas transacciones de esta cuenta */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-5 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <ArrowRightLeft size={20} className="text-bik-blue" />
                Últimos Movimientos
              </h2>
            </div>
            {!recentTransactions || recentTransactions.length === 0 ? (
              <p className="p-5 text-sm text-gray-500 text-center">No hay transacciones registradas en esta cuenta</p>
            ) : (
              <div className="overflow-x-auto">
                <DataTable columns={txColumns} data={recentTransactions} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
