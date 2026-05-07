import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bikApi } from '../../shared/api/axiosInstance';
import { StatsCard } from '../../shared/components/StatsCard';
import { usePermissions } from '../../shared/hooks/usePermissions';
import { Users, UserPlus, UserX, Wallet, CreditCard, ClipboardList, Activity, ArrowRightLeft } from 'lucide-react';

export const DashboardView = () => {
  const navigate = useNavigate();
  const { canAccessModule } = usePermissions();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await bikApi.get('/admin/dashboard/stats');
        setStats(response.data.data);
      } catch (err) {
        setError('Error al cargar las estadísticas del dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 w-1/4 rounded animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5 h-28 animate-pulse">
              <div className="flex justify-between h-full">
                <div className="space-y-3 w-1/2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                </div>
                <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 p-6 rounded-xl text-center">
        <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-100 dark:bg-red-800/50 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Operativo</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Resumen general del estado del sistema BIK</p>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Última actualización: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Métricas de Usuarios - Visible si tiene acceso al módulo clients */}
      {canAccessModule('clients') && (
        <>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-8 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Gestión de Usuarios</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatsCard 
              title="Total de Clientes" 
              value={stats?.totalUsuarios || 0} 
              icon={Users} 
              color="blue" 
              onClick={() => navigate('/clientes')}
            />
            <StatsCard 
              title="Clientes Activos" 
              value={stats?.usuariosActivos || 0} 
              icon={UserPlus} 
              color="green" 
              onClick={() => navigate('/clientes')}
            />
            <StatsCard 
              title="En Verificación" 
              value={stats?.usuariosPendientes || 0} 
              icon={UserX} 
              color="yellow" 
              onClick={() => navigate('/clientes')}
              subtitle="Requieren aprobación"
            />
          </div>
        </>
      )}

      {/* Métricas de Cuentas y Gestiones - Visible si tiene acceso */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {canAccessModule('accounts') && (
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Cuentas Bancarias</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <StatsCard 
                title="Cuentas Totales" 
                value={stats?.totalCuentas || 0} 
                icon={Wallet} 
                color="blue" 
                onClick={() => navigate('/cuentas')}
              />
              <StatsCard 
                title="Cuentas Activas" 
                value={stats?.cuentasActivas || 0} 
                icon={Activity} 
                color="green" 
                onClick={() => navigate('/cuentas')}
              />
            </div>
          </div>
        )}

        {canAccessModule('requests') && (
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Cola de Gestiones</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <StatsCard 
                title="Gestiones Pendientes" 
                value={stats?.gestionesPendientes || 0} 
                icon={ClipboardList} 
                color="red" 
                onClick={() => navigate('/gestiones')}
                subtitle="Requieren atención"
              />
              <StatsCard 
                title="En Proceso (Soporte)" 
                value={stats?.gestionesEnProceso || 0} 
                icon={Activity} 
                color="yellow" 
                onClick={() => navigate('/gestiones')}
              />
            </div>
          </div>
        )}
      </div>

      {/* Métricas Financieras - Visible para Cajero y Admin_Gestiones */}
      {canAccessModule('teller') && (
        <>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-8 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Actividad Financiera (Hoy)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatsCard 
              title="Volumen Transaccional" 
              value={`Q ${stats?.volumenTransaccionesHoy?.toLocaleString('es-GT', { minimumFractionDigits: 2 }) || '0.00'}`} 
              icon={CreditCard} 
              color="orange" 
              onClick={() => navigate('/transacciones')}
            />
            <StatsCard 
              title="Transacciones Realizadas" 
              value={stats?.transaccionesHoy || 0} 
              icon={ArrowRightLeft} 
              color="purple" 
              onClick={() => navigate('/transacciones')}
            />
          </div>
        </>
      )}

    </div>
  );
};
