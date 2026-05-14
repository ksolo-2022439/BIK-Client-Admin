import { useState } from 'react';
import { Search, FileText, Download, Loader2, AlertCircle } from 'lucide-react';
import { DataTable } from '../../shared/components/DataTable';
import { useTellerStore } from './store/tellerStore';
import { useAccountsStore } from '../accounts/store/accountsStore';

export const StatementView = () => {
  const [accountFound, setAccountFound] = useState(false);
  const [loading, setLoading] = useState(false);

  const { searchAccount, searchLoading, searchError } = useTellerStore();
  const { fetchAccountStatement, accountStatement, loading: stmtLoading } = useAccountsStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [month, setMonth] = useState('');

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    setAccountFound(false);
    
    const account = await searchAccount(searchTerm.trim());
    if (account) {
      const publicId = account.publicId || account._id;
      // Preparar parámetros de fecha
      const params = {};
      if (month) {
        const [yyyy, mm] = month.split('-');
        params.mes = parseInt(mm, 10);
        params.anio = parseInt(yyyy, 10);
      }
      
      try {
        await fetchAccountStatement(publicId, params);
        setAccountFound(true);
      } catch (err) {
        console.error('Error fetching statement', err);
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Estado de Cuenta</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Consulta y emisión de estados de cuenta impresos</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-bik-blue dark:text-white" 
              placeholder="Número de cuenta" 
            />
          </div>
          <div className="w-full md:w-48 relative">
            <input 
              type="month" 
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-bik-blue dark:text-white" 
            />
          </div>
          <button 
            type="button" 
            onClick={handleSearch}
            disabled={searchLoading || stmtLoading}
            className="px-6 py-2.5 bg-bik-blue hover:bg-blue-800 text-white font-medium rounded-lg transition-colors shadow-sm disabled:opacity-50"
          >
            {searchLoading || stmtLoading ? <Loader2 size={16} className="animate-spin" /> : 'Generar'}
          </button>
        </div>

        {searchError && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 text-sm">
            <AlertCircle size={16} />
            {searchError}
          </div>
        )}

        {accountFound && accountStatement && (
          <div className="space-y-6 animate-slide-up">
            <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Propietario</p>
                <p className="font-bold text-gray-900 dark:text-white">{accountStatement.cuenta.propietario}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">Saldo Final</p>
                <p className="font-bold text-bik-blue dark:text-blue-400">Q {accountStatement.resumen.saldoFinal.toLocaleString('es-GT', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>

            <div className="flex justify-end">
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white font-medium rounded-lg transition-colors shadow-sm">
                <Download size={18} />
                Descargar PDF
              </button>
            </div>

            <DataTable 
              columns={[
                { key: 'fecha', label: 'Fecha', render: (row) => new Date(row.fecha).toLocaleString() },
                { key: 'descripcion', label: 'Descripción' },
                { 
                  key: 'monto', 
                  label: 'Monto',
                  render: (row) => {
                    const isCredit = row.tipo === 'credito';
                    return (
                      <span className={`font-bold ${isCredit ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
                        {isCredit ? '+' : '-'} Q {Math.abs(row.monto).toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                      </span>
                    )
                  }
                }
              ]}
              data={accountStatement.transacciones}
            />
          </div>
        )}
      </div>
    </div>
  );
};
