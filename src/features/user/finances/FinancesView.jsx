import { useState, useEffect } from 'react';
import { PieChart, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { useFinancesStore } from './store/financesStore';
import { useAuthStore } from '../../auth/store/authStore';

/**
 * Vista premium para la visualización de finanzas personales, presupuestos y analíticas de gastos.
 */
export const FinancesView = () => {
    const { user } = useAuthStore();
    const { analytics: finances, loading, fetchAnalytics } = useFinancesStore();
    const [ingresosMensuales, setIngresosMensuales] = useState(0);

    /**
     * Sincroniza los ingresos declarados del usuario y recupera las analíticas de transacciones.
     */
    useEffect(() => {
        if (user) {
            setIngresosMensuales(user.ingresosMensuales || 0);
        }
        fetchAnalytics();
    }, [user, fetchAnalytics]);

    const totalGastado = finances.reduce((acc, curr) => acc + curr.totalGastado, 0);

    return (
        <div className="w-full animate-fade-in">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 transition-colors duration-300">Finanzas Personales</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-slide-up">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Ingresos Próximos</h3>
                        <div className="p-2 bg-green-50 dark:bg-green-900/30 text-green-600 rounded-lg"><TrendingUp size={20} /></div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{loading ? '...' : `Q ${ingresosMensuales.toLocaleString('es-GT', { minimumFractionDigits: 2 })}`}</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Gastos Registrados</h3>
                        <div className="p-2 bg-red-50 dark:bg-red-900/30 text-red-600 rounded-lg"><TrendingDown size={20} /></div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {loading ? '...' : `Q ${totalGastado.toFixed(2)}`}
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Ahorro Proyectado</h3>
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-bik-blue rounded-lg"><DollarSign size={20} /></div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {loading ? '...' : `Q ${(ingresosMensuales - totalGastado).toLocaleString('es-GT', { minimumFractionDigits: 2 })}`}
                    </p>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-slide-up">
                <div className="flex items-center mb-6">
                    <PieChart className="text-bik-orange mr-3" size={24} />
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Distribución de Gastos (Analytics)</h2>
                </div>
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-5">
                    {loading ? (
                        <p className="text-gray-500 dark:text-gray-400 text-center py-8">Cargando métricas...</p>
                    ) : finances.length === 0 ? (
                        <p className="text-gray-500 dark:text-gray-400 text-center py-8">Aún no hay transacciones para analizar.</p>
                    ) : (
                        <div className="space-y-4">
                            {finances.map((item, index) => {
                                const percentage = totalGastado > 0 ? (item.totalGastado / totalGastado) * 100 : 0;
                                const colors = ['bg-bik-blue', 'bg-bik-orange', 'bg-green-500', 'bg-purple-500', 'bg-red-500', 'bg-yellow-500'];
                                const colorClass = colors[index % colors.length];
                                
                                return (
                                    <div key={item._id} className="w-full">
                                        <div className="flex justify-between items-center mb-1 text-sm">
                                            <span className="font-semibold text-gray-700 dark:text-gray-300">{item._id || 'Otros'}</span>
                                            <span className="text-gray-500 dark:text-gray-400 font-bold">Q {item.totalGastado.toFixed(2)} ({percentage.toFixed(1)}%)</span>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                            <div className={`${colorClass} h-2.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.conteo} transacción(es)</p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};