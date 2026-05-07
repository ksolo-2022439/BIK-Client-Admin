import { useState } from 'react';
import { Search, FileText, Download } from 'lucide-react';
import { DataTable } from '../../shared/components/DataTable';

export const StatementView = () => {
  const [accountFound, setAccountFound] = useState(false);
  const [loading, setLoading] = useState(false);

  // Datos simulados
  const transacciones = [
    { id: 1, fecha: '2023-10-25', descripcion: 'Depósito en Efectivo', monto: 1500, tipo: 'credito' },
    { id: 2, fecha: '2023-10-24', descripcion: 'Pago de Servicio Eléctrico', monto: -350, tipo: 'debito' },
    { id: 3, fecha: '2023-10-22', descripcion: 'Transferencia a Terceros', monto: -500, tipo: 'debito' },
  ];

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
            <input type="text" className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-bik-blue dark:text-white" placeholder="Número de cuenta" />
          </div>
          <div className="w-full md:w-48 relative">
            <input type="month" className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-bik-blue dark:text-white" />
          </div>
          <button 
            type="button" 
            onClick={() => setAccountFound(true)}
            className="px-6 py-2.5 bg-bik-blue hover:bg-blue-800 text-white font-medium rounded-lg transition-colors shadow-sm"
          >
            Generar
          </button>
        </div>

        {accountFound && (
          <div className="space-y-6 animate-slide-up">
            <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Propietario</p>
                <p className="font-bold text-gray-900 dark:text-white">Juan Alberto Pérez</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">Saldo Final</p>
                <p className="font-bold text-bik-blue dark:text-blue-400">Q 4,150.00</p>
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
                { key: 'fecha', label: 'Fecha' },
                { key: 'descripcion', label: 'Descripción' },
                { 
                  key: 'monto', 
                  label: 'Monto',
                  render: (row) => (
                    <span className={`font-bold ${row.tipo === 'credito' ? 'text-green-600' : 'text-gray-900 dark:text-white'}`}>
                      {row.tipo === 'credito' ? '+' : ''} Q {Math.abs(row.monto).toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                    </span>
                  )
                }
              ]}
              data={transacciones}
            />
          </div>
        )}
      </div>
    </div>
  );
};
