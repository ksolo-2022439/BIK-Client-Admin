import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bikApi } from '../../shared/api/axiosInstance';
import { DataTable } from '../../shared/components/DataTable';
import { StatusBadge } from '../../shared/components/StatusBadge';
import { usePermissions } from '../../shared/hooks/usePermissions';
import { UserPlus, Eye, Search, Filter } from 'lucide-react';

export const ClientSearchView = () => {
  const navigate = useNavigate();
  const { canPerformAction } = usePermissions();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 0 });
  const [filters, setFilters] = useState({ search: '', estado: '' });
  
  const fetchUsers = async (page = 1, currentFilters = filters) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: 10,
        rol: 'Cliente' // Solo buscar clientes
      });
      
      if (currentFilters.search) params.append('search', currentFilters.search);
      if (currentFilters.estado) params.append('estado', currentFilters.estado);

      const response = await bikApi.get(`/admin/users?${params.toString()}`);
      setUsers(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers(1, filters);
  };

  const columns = [
    { key: 'dpi', label: 'DPI', sortable: true },
    { 
      key: 'nombreCompleto', 
      label: 'Nombre Completo', 
      render: (row) => `${row.nombres} ${row.apellidos}`,
      sortable: true
    },
    { key: 'email', label: 'Correo Electrónico' },
    { key: 'telefono', label: 'Teléfono' },
    { 
      key: 'estado', 
      label: 'Estado',
      render: (row) => <StatusBadge status={row.estado} />,
      sortable: true
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (row) => (
        <button
          onClick={() => navigate(`/clientes/${row._id}`)}
          className="p-1.5 text-bik-blue hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
          title="Ver perfil completo"
        >
          <Eye size={18} />
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Directorio de Clientes</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Busca y gestiona los clientes del banco</p>
        </div>
        
        {canPerformAction('create_user') && (
          <button
            onClick={() => navigate('/clientes/nuevo')}
            className="flex items-center gap-2 px-4 py-2 bg-bik-blue hover:bg-blue-800 text-white font-medium rounded-lg transition-colors shadow-sm"
          >
            <UserPlus size={18} />
            Nuevo Cliente
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por DPI, nombre, correo o teléfono..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-bik-blue focus:border-transparent transition-all"
            />
          </div>
          <div className="w-full md:w-48 relative">
            <Filter size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={filters.estado}
              onChange={(e) => setFilters({ ...filters, estado: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-bik-blue focus:border-transparent appearance-none"
            >
              <option value="">Todos los estados</option>
              <option value="Activo">Activo</option>
              <option value="En Verificacion">En Verificación</option>
              <option value="Suspendido">Suspendido</option>
            </select>
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-lg transition-colors"
          >
            Buscar
          </button>
        </form>
      </div>

      <DataTable 
        columns={columns}
        data={users}
        loading={loading}
        pagination={pagination}
        onPageChange={(page) => fetchUsers(page)}
      />
    </div>
  );
};
