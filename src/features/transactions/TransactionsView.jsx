import { useState, useEffect } from 'react';
import { bikApi } from '../../shared/api/axiosInstance';
import { DataTable } from '../../shared/components/DataTable';
import { StatusBadge } from '../../shared/components/StatusBadge';
import { Filter, Download } from 'lucide-react';

export const TransactionsView = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 0 });
  const [filters, setFilters] = useState({ tipo: '', estado: '' });

  const fetchTransactions = async (page = 1, currentFilters = filters) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (currentFilters.tipo) params.append('tipo', currentFilters.tipo);
      if (currentFilters.estado) params.append('estado', currentFilters.estado);

      const response = await bikApi.get(`/admin/transactions?${params.toString()}`);
      setTransactions(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleFilter = (e) => {
    e.preventDefault();
    fetchTransactions(1, filters);
  };

  const columns = [
    { 
      key: 'fecha', 
      label: 'Fecha y Hora',
      render: (row) => new Date(row.createdAt).toLocaleString()
    },
    { key: 'tipo', label: 'Tipo de Operación' },
    { 
      key: 'monto', 
      label: 'Monto',
      render: (row) => `Q ${row.monto.toLocaleString('es-GT', { minimumFractionDigits: 2 })}`
    },
    { 
      key: 'origen', 
      label: 'Cuenta Origen',
      render: (row) => row.cuentaOrigenId ? row.cuentaOrigenId.numeroCuenta : 'N/A'
    },
    { 
      key: 'destino', 
      label: 'Cuenta Destino',
      render: (row) => row.cuentaDestinoId ? row.cuentaDestinoId.numeroCuenta : 'N/A'
    },
    { 
      key: 'estado', 
      label: 'Estado',
      render: (row) => <StatusBadge status={row.estado} />
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Registro de Transacciones</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Historial global de movimientos financieros del banco</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-white font-medium rounded-lg transition-colors">
          <Download size={18} />
          Exportar Excel
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
        <form onSubmit={handleFilter} className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-64 relative">
            <Filter size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={filters.tipo}
              onChange={(e) => setFilters({ ...filters, tipo: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-bik-blue appearance-none"
            >
              <option value="">Todos los tipos</option>
              <option value="Transferencia_Interna">Transferencia Interna</option>
              <option value="Transferencia_ACH">Transferencia ACH</option>
              <option value="Deposito">Depósito</option>
              <option value="Retiro">Retiro</option>
              <option value="Pago_Servicio">Pago de Servicio</option>
            </select>
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 bg-bik-blue hover:bg-blue-800 text-white font-medium rounded-lg transition-colors"
          >
            Filtrar
          </button>
        </form>
      </div>

      <DataTable 
        columns={columns}
        data={transactions}
        loading={loading}
        pagination={pagination}
        onPageChange={(page) => fetchTransactions(page)}
      />
    </div>
  );
};
