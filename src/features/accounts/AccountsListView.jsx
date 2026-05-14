import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccountsStore } from './store/accountsStore';
import { DataTable } from '../../shared/components/DataTable';
import { StatusBadge } from '../../shared/components/StatusBadge';
import { usePermissions } from '../../shared/hooks/usePermissions';
import { Wallet, Plus, Search, Filter, Eye } from 'lucide-react';
import { formatCurrency } from '../../shared/utils/currency';

export const AccountsListView = () => {
  const navigate = useNavigate();
  const { canPerformAction } = usePermissions();
  const { accounts, loading, pagination, fetchAccounts } = useAccountsStore();
  const [filters, setFilters] = useState({ tipo: '', estado: '' });

  useEffect(() => {
    fetchAccounts({ page: 1 });
  }, []);

  const handleFilter = (e) => {
    e.preventDefault();
    fetchAccounts({ 
      page: 1, 
      tipo: filters.tipo || undefined, 
      estado: filters.estado || undefined 
    });
  };

  const columns = [
    { key: 'numeroCuenta', label: 'No. Cuenta', sortable: true },
    { 
      key: 'cliente', 
      label: 'Propietario',
      render: (row) => row.usuarioId ? `${row.usuarioId.nombres} ${row.usuarioId.apellidos}` : 'N/A'
    },
    { key: 'tipo', label: 'Tipo', sortable: true },
    { 
      key: 'saldo', 
      label: 'Saldo',
      render: (row) => formatCurrency(row.saldo, row.moneda),
      sortable: true
    },
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
          onClick={() => navigate(`/cuentas/${row.publicId || row._id}`)}
          className="p-1.5 text-bik-blue hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
          title="Ver detalle de la cuenta"
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Cuentas Bancarias</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Gestión global de cuentas del banco</p>
        </div>
        
        {canPerformAction('create_account') && (
          <button
            onClick={() => navigate('/cuentas/nueva')}
            className="flex items-center gap-2 px-4 py-2 bg-bik-blue hover:bg-blue-800 text-white font-medium rounded-lg transition-colors shadow-sm"
          >
            <Plus size={18} />
            Aperturar Cuenta
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
        <form onSubmit={handleFilter} className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-48 relative">
            <Filter size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={filters.tipo}
              onChange={(e) => setFilters({ ...filters, tipo: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-bik-blue appearance-none"
            >
              <option value="">Todos los tipos</option>
              <option value="Monetaria">Monetaria</option>
              <option value="Ahorro">Ahorro</option>
              <option value="Plazo_Fijo">Plazo Fijo</option>
            </select>
          </div>
          <div className="w-full md:w-48 relative">
            <Filter size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={filters.estado}
              onChange={(e) => setFilters({ ...filters, estado: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-bik-blue appearance-none"
            >
              <option value="">Todos los estados</option>
              <option value="Activa">Activa</option>
              <option value="Bloqueada">Bloqueada</option>
              <option value="Cancelada">Cancelada</option>
            </select>
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-lg transition-colors"
          >
            Filtrar
          </button>
        </form>
      </div>

      <DataTable 
        columns={columns}
        data={accounts}
        loading={loading}
        pagination={pagination}
        onPageChange={(page) => fetchAccounts({ page, tipo: filters.tipo || undefined, estado: filters.estado || undefined })}
      />
    </div>
  );
};
