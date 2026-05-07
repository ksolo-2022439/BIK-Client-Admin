import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bikApi } from '../../shared/api/axiosInstance';
import { StatusBadge } from '../../shared/components/StatusBadge';
import { Modal } from '../../shared/components/Modal';
import { usePermissions } from '../../shared/hooks/usePermissions';
import { ArrowLeft, User, Mail, Phone, MapPin, Briefcase, Calendar, CreditCard, ArrowRightLeft, Wallet, Save, Loader2, Plus, Hash } from 'lucide-react';
import { formatCurrency } from '../../shared/utils/currency';

export const ClientProfileView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { canPerformAction, canAccessModule } = usePermissions();
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estado para modal de edición
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);

  // Estado para modal de nueva cuenta
  const [isNewAccountOpen, setIsNewAccountOpen] = useState(false);
  const [newAccountData, setNewAccountData] = useState({ tipo: 'Monetaria', moneda: 'GTQ' });
  const [creatingAccount, setCreatingAccount] = useState(false);

  const fetchProfile = async () => {
    try {
      const response = await bikApi.get(`/admin/users/${id}/full-profile`);
      setProfile(response.data.data);
    } catch (err) {
      setError('Error al cargar el perfil del cliente');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [id]);

  // --- Editar información del cliente ---
  const openEditModal = () => {
    const u = profile.user;
    setEditData({
      nombres: u.nombres || '',
      apellidos: u.apellidos || '',
      telefono: u.telefono || '',
      email: u.email || '',
      ingresosMensuales: u.ingresosMensuales || 0,
      direccion: {
        departamento: u.direccion?.departamento || '',
        municipio: u.direccion?.municipio || '',
        zona: u.direccion?.zona || '',
        detalle: u.direccion?.detalle || ''
      }
    });
    setIsEditOpen(true);
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      await bikApi.put(`/users/${id}/update`, editData);
      setIsEditOpen(false);
      await fetchProfile();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al actualizar la información.');
    } finally {
      setSaving(false);
    }
  };

  // --- Crear nueva cuenta bancaria ---
  const handleCreateAccount = async () => {
    setCreatingAccount(true);
    try {
      await bikApi.post('/accounts', {
        usuarioId: id,
        tipo: newAccountData.tipo,
        moneda: newAccountData.moneda
      });
      setIsNewAccountOpen(false);
      setNewAccountData({ tipo: 'Monetaria', moneda: 'GTQ' });
      await fetchProfile();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al crear la cuenta.');
    } finally {
      setCreatingAccount(false);
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><div className="w-8 h-8 border-4 border-bik-blue border-t-transparent rounded-full animate-spin"></div></div>;
  if (error) return <div className="p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>;
  if (!profile?.user) return <div className="p-4 text-gray-500">Cliente no encontrado</div>;

  const { user, accounts, cards, recentTransactions } = profile;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/clientes')}
          className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            {user.nombres} {user.apellidos}
            <StatusBadge status={user.estado} />
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">DPI: {user.dpi}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información Personal */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <User size={20} className="text-bik-blue" />
              Datos Personales
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Hash size={18} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">DPI</p>
                  <p className="text-sm font-bold font-mono text-gray-900 dark:text-white">{user.dpi}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail size={18} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Correo Electrónico</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white break-all">{user.email}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Phone size={18} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Teléfono</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{user.telefono}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Calendar size={18} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Fecha de Nacimiento</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {new Date(user.fechaNacimiento).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Briefcase size={18} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Ingresos Mensuales</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Q {user.ingresosMensuales?.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Dirección</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user.direccion?.detalle}, Zona {user.direccion?.zona}, {user.direccion?.municipio}, {user.direccion?.departamento}
                  </p>
                </div>
              </div>
            </div>

            {canPerformAction('modify_client') && (
              <button 
                onClick={openEditModal}
                className="mt-6 w-full py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium rounded-lg transition-colors text-sm"
              >
                Editar Información
              </button>
            )}
          </div>
        </div>

        {/* Productos (Cuentas y Tarjetas) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cuentas */}
          {canAccessModule('accounts') && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Wallet size={20} className="text-bik-blue" />
                  Cuentas Bancarias ({accounts?.length || 0})
                </h2>
                {canPerformAction('create_account') && (
                  <button 
                    onClick={() => setIsNewAccountOpen(true)}
                    className="flex items-center gap-1.5 text-sm text-bik-blue font-medium hover:bg-blue-50 dark:hover:bg-blue-900/30 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Plus size={16} />
                    Nueva Cuenta
                  </button>
                )}
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {!accounts || accounts.length === 0 ? (
                  <p className="p-5 text-sm text-gray-500 text-center">No posee cuentas bancarias</p>
                ) : (
                  accounts.map(account => (
                    <div key={account._id} className="p-5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{account.numeroCuenta}</p>
                        <p className="text-sm text-gray-500">{account.tipo} • {account.moneda || 'GTQ'}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900 dark:text-white">{formatCurrency(account.saldo, account.moneda)}</p>
                        <StatusBadge status={account.estado} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Tarjetas */}
          {canAccessModule('cards') && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <CreditCard size={20} className="text-bik-blue" />
                  Tarjetas ({cards?.length || 0})
                </h2>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {!cards || cards.length === 0 ? (
                  <p className="p-5 text-sm text-gray-500 text-center">No posee tarjetas</p>
                ) : (
                  cards.map(card => {
                    const isBlocked = card.configuraciones?.bloqueada;
                    const isCredit = card.tipo === 'Credito';
                    return (
                      <div key={card._id} className="p-5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/30">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-8 rounded bg-gradient-to-r ${isCredit ? 'from-orange-500 to-red-500' : 'from-blue-600 to-blue-800'} flex items-center justify-center`}>
                            <span className="text-white text-[10px] font-bold italic">{isCredit ? 'CRÉDITO' : 'DÉBITO'}</span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              **** {card.numeroTarjeta ? card.numeroTarjeta.slice(-4) : '----'}
                            </p>
                            <p className="text-xs text-gray-500">{card.tipo} • Exp: {card.fechaExpiracion || 'N/A'}</p>
                          </div>
                        </div>
                        <StatusBadge status={isBlocked ? 'Bloqueada' : 'Activa'} />
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
          
          {/* Últimas transacciones */}
          {canAccessModule('transactions') && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="p-5 border-b border-gray-100 dark:border-gray-700">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <ArrowRightLeft size={20} className="text-bik-blue" />
                  Últimos Movimientos
                </h2>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {!recentTransactions || recentTransactions.length === 0 ? (
                  <p className="p-5 text-sm text-gray-500 text-center">No hay transacciones recientes</p>
                ) : (
                  recentTransactions.slice(0, 5).map(tx => {
                    const isCredit = ['Deposito', 'Abono'].includes(tx.tipo);
                    return (
                      <div key={tx._id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/30">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white text-sm">{tx.descripcion}</p>
                          <p className="text-xs text-gray-500">{new Date(tx.createdAt).toLocaleDateString()} • {tx.tipo}</p>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold text-sm ${isCredit ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
                            {isCredit ? '+' : '-'} Q {tx.monto?.toLocaleString('es-GT', { minimumFractionDigits: 2 }) || '0.00'}
                          </p>
                          <StatusBadge status={tx.estado} />
                        </div>
                      </div>
                    )
                  })
                )}
                {recentTransactions && recentTransactions.length > 5 && (
                  <button onClick={() => navigate('/transacciones')} className="w-full p-3 text-sm text-bik-blue font-medium hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    Ver todo el historial
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ======================== MODAL: Editar Información ======================== */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Editar Información del Cliente" size="lg">
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombres</label>
              <input type="text" value={editData.nombres || ''} onChange={(e) => setEditData({ ...editData, nombres: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg dark:text-white focus:ring-2 focus:ring-bik-blue" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Apellidos</label>
              <input type="text" value={editData.apellidos || ''} onChange={(e) => setEditData({ ...editData, apellidos: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg dark:text-white focus:ring-2 focus:ring-bik-blue" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Teléfono</label>
              <input type="text" value={editData.telefono || ''} onChange={(e) => setEditData({ ...editData, telefono: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg dark:text-white focus:ring-2 focus:ring-bik-blue" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Correo Electrónico</label>
              <input type="email" value={editData.email || ''} onChange={(e) => setEditData({ ...editData, email: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg dark:text-white focus:ring-2 focus:ring-bik-blue" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ingresos Mensuales (Q)</label>
              <input type="number" value={editData.ingresosMensuales || 0} onChange={(e) => setEditData({ ...editData, ingresosMensuales: parseFloat(e.target.value) })} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg dark:text-white focus:ring-2 focus:ring-bik-blue" />
            </div>
          </div>

          <h3 className="text-sm font-semibold text-gray-900 dark:text-white pt-4 border-t border-gray-100 dark:border-gray-700">Dirección</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Departamento</label>
              <input type="text" value={editData.direccion?.departamento || ''} onChange={(e) => setEditData({ ...editData, direccion: { ...editData.direccion, departamento: e.target.value } })} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg dark:text-white focus:ring-2 focus:ring-bik-blue" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Municipio</label>
              <input type="text" value={editData.direccion?.municipio || ''} onChange={(e) => setEditData({ ...editData, direccion: { ...editData.direccion, municipio: e.target.value } })} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg dark:text-white focus:ring-2 focus:ring-bik-blue" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Zona</label>
              <input type="text" value={editData.direccion?.zona || ''} onChange={(e) => setEditData({ ...editData, direccion: { ...editData.direccion, zona: e.target.value } })} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg dark:text-white focus:ring-2 focus:ring-bik-blue" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Detalle</label>
              <input type="text" value={editData.direccion?.detalle || ''} onChange={(e) => setEditData({ ...editData, direccion: { ...editData.direccion, detalle: e.target.value } })} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg dark:text-white focus:ring-2 focus:ring-bik-blue" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button onClick={() => setIsEditOpen(false)} className="px-5 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium rounded-lg transition-colors">Cancelar</button>
            <button onClick={handleSaveEdit} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-bik-blue hover:bg-blue-800 text-white font-medium rounded-lg transition-colors">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </div>
      </Modal>

      {/* ======================== MODAL: Nueva Cuenta ======================== */}
      <Modal isOpen={isNewAccountOpen} onClose={() => setIsNewAccountOpen(false)} title="Aperturar Nueva Cuenta" size="sm">
        <div className="space-y-5">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800/50">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <span className="font-bold">Cliente:</span> {user.nombres} {user.apellidos} (DPI: {user.dpi})
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo de Cuenta</label>
            <select value={newAccountData.tipo} onChange={(e) => setNewAccountData({ ...newAccountData, tipo: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg dark:text-white focus:ring-2 focus:ring-bik-blue">
              <option value="Monetaria">Monetaria</option>
              <option value="Ahorro">Ahorro</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Moneda</label>
            <select value={newAccountData.moneda} onChange={(e) => setNewAccountData({ ...newAccountData, moneda: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg dark:text-white focus:ring-2 focus:ring-bik-blue">
              <option value="GTQ">Quetzales (GTQ)</option>
              <option value="USD">Dólares (USD)</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button onClick={() => setIsNewAccountOpen(false)} className="px-5 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium rounded-lg transition-colors">Cancelar</button>
            <button onClick={handleCreateAccount} disabled={creatingAccount} className="flex items-center gap-2 px-5 py-2.5 bg-bik-blue hover:bg-blue-800 text-white font-medium rounded-lg transition-colors">
              {creatingAccount ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              {creatingAccount ? 'Creando...' : 'Crear Cuenta'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
