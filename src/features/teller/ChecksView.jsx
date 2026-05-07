import { useState } from 'react';
import { CheckSquare, AlertCircle } from 'lucide-react';

export const ChecksView = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestión de Cheques</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Abono y cobro de cheques en ventanilla</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
          <CheckSquare size={32} className="text-bik-blue dark:text-blue-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Módulo en Desarrollo</h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-md">
          La funcionalidad de lectura OCR y compensación automática de cheques estará disponible en la próxima actualización del sistema.
        </p>
        <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800/50 flex items-start gap-3 text-left max-w-md">
          <AlertCircle size={20} className="text-amber-600 dark:text-amber-400 mt-0.5" />
          <p className="text-sm text-amber-800 dark:text-amber-300">
            Por el momento, el abono de cheques debe realizarse mediante el proceso manual de compensación con el Banco Central.
          </p>
        </div>
      </div>
    </div>
  );
};
