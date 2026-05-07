import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { bikApi } from '../../shared/api/axiosInstance';
import { ArrowLeft, Save, Wallet, Search, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export const CreateAccountView = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [dpiSearch, setDpiSearch] = useState('');
  const [clientFound, setClientFound] = useState(null);
  const [searchError, setSearchError] = useState('');
  const [formData, setFormData] = useState({ tipo: 'Monetaria', moneda: 'GTQ' });
  const [success, setSuccess] = useState(null);

  const handleSearchClient = async () => {
    if (!dpiSearch.trim()) return;
    setSearchLoading(true);
    setSearchError('');
    setClientFound(null);
    try {
      const response = await bikApi.get(`/users/${dpiSearch.trim()}`);
      if (response.data.status === 'success') {
        setClientFound(response.data.data);
      }
    } catch (err) {
      setSearchError(err.response?.data?.message || 'Cliente no encontrado con ese DPI.');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    if (!clientFound) return;
    setLoading(true);
    setSuccess(null);
    try {
      const response = await bikApi.post('/accounts', {
        usuarioId: clientFound._id,
        tipo: formData.tipo,
        moneda: formData.moneda
      });
      setSuccess(response.data.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Error al crear la cuenta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/cuentas')}
          className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Apertura de Cuenta</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Crear una nueva cuenta bancaria para un cliente existente</p>
        </div>
      </div>

      {/* Resultado exitoso */}
      {success && (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800/50 p-6 animate-slide-up">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle size={32} className="text-emerald-600 dark:text-emerald-400" />
            <div>
              <h2 className="text-lg font-bold text-emerald-900 dark:text-emerald-100">Cuenta Creada Exitosamente</h2>
              <p className="text-emerald-700 dark:text-emerald-300 text-sm">La nueva cuenta ya está operativa.</p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-emerald-700 dark:text-emerald-400">Número de Cuenta</span><span className="font-bold text-emerald-900 dark:text-emerald-100">{success.numeroCuenta}</span></div>
            <div className="flex justify-between"><span className="text-emerald-700 dark:text-emerald-400">Tipo</span><span className="font-bold text-emerald-900 dark:text-emerald-100">{success.tipo}</span></div>
            <div className="flex justify-between"><span className="text-emerald-700 dark:text-emerald-400">Moneda</span><span className="font-bold text-emerald-900 dark:text-emerald-100">{success.moneda}</span></div>
          </div>
          <button onClick={() => { setSuccess(null); setClientFound(null); setDpiSearch(''); }} className="mt-4 px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors">
            Crear otra cuenta
          </button>
        </div>
      )}

      {!success && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
          
          {/* Buscador de cliente */}
          <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Buscar Cliente por DPI</label>
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  value={dpiSearch}
                  onChange={(e) => setDpiSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchClient()}
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-bik-blue dark:text-white" 
                  placeholder="Ingresa el DPI del cliente" 
                />
              </div>
              <button 
                type="button" 
                onClick={handleSearchClient}
                disabled={searchLoading}
                className="px-4 py-2.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                {searchLoading ? <Loader2 size={16} className="animate-spin" /> : null}
                Verificar
              </button>
            </div>
            
            {searchError && (
              <div className="mt-3 flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
                <AlertCircle size={16} />
                {searchError}
              </div>
            )}
            
            {clientFound && (
              <div className="mt-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800/50 animate-fade-in">
                <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
                  ✓ {clientFound.nombres} {clientFound.apellidos} — DPI: {clientFound.dpi}
                </p>
                <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">{clientFound.email} • {clientFound.telefono}</p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
            <div className="w-10 h-10 rounded-full bg-bik-blue/10 flex items-center justify-center">
              <Wallet size={20} className="text-bik-blue" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Configuración de la Cuenta</h2>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tipo de Cuenta</label>
                <select 
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-bik-blue transition-all dark:text-white"
                >
                  <option value="Monetaria">Monetaria</option>
                  <option value="Ahorro">Ahorro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Moneda</label>
                <select 
                  value={formData.moneda}
                  onChange={(e) => setFormData({ ...formData, moneda: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-bik-blue transition-all dark:text-white"
                >
                  <option value="GTQ">Quetzales (GTQ)</option>
                  <option value="USD">Dólares (USD)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-gray-100 dark:border-gray-700 gap-4">
              <button type="button" onClick={() => navigate('/cuentas')} className="px-6 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium rounded-lg transition-colors">
                Cancelar
              </button>
              <button 
                type="button" 
                onClick={handleCreateAccount}
                disabled={loading || !clientFound} 
                className="flex items-center gap-2 px-6 py-2.5 bg-bik-blue hover:bg-blue-800 text-white font-medium rounded-lg transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {loading ? 'Creando...' : 'Crear Cuenta'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
