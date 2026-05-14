import { useState, useEffect } from 'react';
import { useAuditStore } from './store/auditStore';
import { DataTable } from '../../shared/components/DataTable';
import { ShieldAlert, Activity } from 'lucide-react';

export const AuditLogView = () => {
  const { logs, loading, fetchLogs } = useAuditStore();

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const getMethodColor = (method) => {
    switch (method) {
      case 'POST': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      case 'PUT': 
      case 'PATCH': return 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400';
      case 'DELETE': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const columns = [
    { 
      key: 'fecha', 
      label: 'Fecha',
      render: (row) => new Date(row.createdAt).toLocaleString()
    },
    { 
      key: 'usuario', 
      label: 'Empleado',
      render: (row) => row.adminId ? `${row.adminId.nombres} ${row.adminId.apellidos}` : 'Sistema'
    },
    { 
      key: 'accion', 
      label: 'Acción / Método',
      render: (row) => (
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded text-xs font-bold ${getMethodColor(row.accion)}`}>
            {row.accion}
          </span>
          <span className="text-sm font-mono truncate max-w-xs">{row.endpoint}</span>
        </div>
      )
    },
    { 
      key: 'ip', 
      label: 'IP',
      render: (row) => <span className="font-mono text-xs">{row.direccionIp || 'N/A'}</span>
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-100 dark:border-red-800/50 mb-6">
        <ShieldAlert className="text-red-600 dark:text-red-400 flex-shrink-0" size={24} />
        <div>
          <h2 className="text-red-800 dark:text-red-300 font-bold text-sm">Registro de Auditoría Restringido</h2>
          <p className="text-red-600 dark:text-red-400 text-xs mt-0.5">Acceso exclusivo para Super Administradores. Todas las consultas a esta sección quedan registradas.</p>
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Activity size={24} className="text-bik-blue" />
          Auditoría del Sistema
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Traza de modificaciones realizadas por el personal administrativo</p>
      </div>

      <DataTable 
        columns={columns}
        data={logs}
        loading={loading}
        emptyMessage="No hay registros de auditoría disponibles"
      />
    </div>
  );
};
