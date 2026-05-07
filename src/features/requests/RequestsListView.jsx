import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bikApi } from '../../shared/api/axiosInstance';
import { DataTable } from '../../shared/components/DataTable';
import { StatusBadge } from '../../shared/components/StatusBadge';
import { usePermissions } from '../../shared/hooks/usePermissions';
import { Filter, Eye, AlertCircle } from 'lucide-react';

export const RequestsListView = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 0 });
  const [filters, setFilters] = useState({ estado: 'Pendiente', tipoGestion: '', prioridad: '' });

  const fetchRequests = async (page = 1, currentFilters = filters) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (currentFilters.estado) params.append('estado', currentFilters.estado);
      if (currentFilters.tipoGestion) params.append('tipoGestion', currentFilters.tipoGestion);
      if (currentFilters.prioridad) params.append('prioridad', currentFilters.prioridad);

      const response = await bikApi.get(`/admin/requests?${params.toString()}`);
      setRequests(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleFilter = (e) => {
    e.preventDefault();
    fetchRequests(1, filters);
  };

  const columns = [
    { 
      key: 'fechaSolicitud', 
      label: 'Fecha',
      render: (row) => new Date(row.fechaSolicitud).toLocaleDateString(),
      sortable: true
    },
    { 
      key: 'cliente', 
      label: 'Cliente',
      render: (row) => row.usuarioId ? `${row.usuarioId.nombres} ${row.usuarioId.apellidos}` : 'N/A'
    },
    { 
      key: 'tipoGestion', 
      label: 'Tipo de Gestión',
      render: (row) => row.tipoGestion.replace(/_/g, ' ')
    },
    { 
      key: 'prioridad', 
      label: 'Prioridad',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          {row.prioridad === 'Alta' || row.prioridad === 'Urgente' ? <AlertCircle size={14} className="text-red-500" /> : null}
          <span className={`text-xs font-semibold ${row.prioridad === 'Urgente' ? 'text-red-600' : row.prioridad === 'Alta' ? 'text-orange-600' : 'text-gray-500'}`}>
            {row.prioridad || 'Normal'}
          </span>
        </div>
      )
    },
    { 
      key: 'estado', 
      label: 'Estado',
      render: (row) => <StatusBadge status={row.estado} />
    },
    {
      key: 'actions',
      label: 'Atender',
      render: (row) => (
        <button
          onClick={() => navigate(`/gestiones/${row._id}`)}
          className="p-1.5 text-bik-blue hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors font-medium flex items-center gap-1 text-sm"
        >
          <Eye size={16} />
          <span>Abrir</span>
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bandeja de Gestiones</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Atiende y administra las solicitudes de los clientes</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
        <form onSubmit={handleFilter} className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-48 relative">
            <Filter size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={filters.estado}
              onChange={(e) => setFilters({ ...filters, estado: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-bik-blue appearance-none text-sm"
            >
              <option value="">Todos los estados</option>
              <option value="Pendiente">Pendiente</option>
              <option value="En_Proceso">En Proceso</option>
              <option value="Completada">Completada</option>
              <option value="Rechazada">Rechazada</option>
            </select>
          </div>
          
          <div className="w-full md:w-56 relative">
            <Filter size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={filters.tipoGestion}
              onChange={(e) => setFilters({ ...filters, tipoGestion: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-bik-blue appearance-none text-sm"
            >
              <option value="">Todos los tipos</option>
              <option value="Chequera">Chequera</option>
              <option value="Reposicion_Tarjeta">Reposición Tarjeta</option>
              <option value="Carta_Referencia">Carta Referencia</option>
              <option value="Actualizacion_Datos">Actualización Datos</option>
            </select>
          </div>

          <div className="w-full md:w-48 relative">
            <Filter size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={filters.prioridad}
              onChange={(e) => setFilters({ ...filters, prioridad: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-bik-blue appearance-none text-sm"
            >
              <option value="">Todas las prioridades</option>
              <option value="Normal">Normal</option>
              <option value="Alta">Alta</option>
              <option value="Urgente">Urgente</option>
            </select>
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-lg transition-colors text-sm"
          >
            Aplicar Filtros
          </button>
        </form>
      </div>

      <DataTable 
        columns={columns}
        data={requests}
        loading={loading}
        pagination={pagination}
        onPageChange={(page) => fetchRequests(page)}
        emptyMessage="No hay gestiones en la bandeja para los filtros seleccionados"
      />
    </div>
  );
};
