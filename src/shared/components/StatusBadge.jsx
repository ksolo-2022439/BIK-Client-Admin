export const StatusBadge = ({ status }) => {
  const styles = {
    Activo: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    Activa: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    Completada: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    Pendiente: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    'En Verificacion': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    En_Proceso: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    Suspendido: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    Rechazada: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    Cancelada: 'bg-gray-100 text-gray-700 dark:bg-gray-700/30 dark:text-gray-400',
    Bloqueada: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    Normal: 'bg-gray-100 text-gray-600 dark:bg-gray-700/30 dark:text-gray-400',
    Alta: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    Urgente: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };

  const displayName = status?.replace(/_/g, ' ') || 'Sin estado';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[status] || 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}>
      {displayName}
    </span>
  );
};
