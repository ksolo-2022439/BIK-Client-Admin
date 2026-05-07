import { useState } from 'react';
import { ChevronUp, ChevronDown, Search } from 'lucide-react';

/**
 * Componente de tabla de datos reutilizable con sorting, búsqueda y paginación.
 */
export const DataTable = ({ columns, data, searchPlaceholder = 'Buscar...', onSearch, pagination, onPageChange, loading, emptyMessage = 'No se encontraron resultados' }) => {
  const [sortKey, setSortKey] = useState('');
  const [sortDir, setSortDir] = useState('asc');
  const [searchTerm, setSearchTerm] = useState('');

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    if (onSearch) onSearch(e.target.value);
  };

  const sortedData = [...(data || [])].sort((a, b) => {
    if (!sortKey) return 0;
    const aVal = a[sortKey] ?? '';
    const bVal = b[sortKey] ?? '';
    if (typeof aVal === 'string') {
      return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
      {/* Barra de búsqueda */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-700">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder={searchPlaceholder}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-bik-blue focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable && handleSort(col.key)}
                  className={`px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ${col.sortable ? 'cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 select-none' : ''}`}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && sortKey === col.key && (
                      sortDir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              sortedData.map((row, i) => (
                <tr key={row._id || i} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {pagination && pagination.pages > 1 && (
        <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Página {pagination.page} de {pagination.pages} ({pagination.total} registros)
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange && onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Anterior
            </button>
            <button
              onClick={() => onPageChange && onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
              className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
