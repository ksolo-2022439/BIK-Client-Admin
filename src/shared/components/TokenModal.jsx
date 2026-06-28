import { useState } from 'react';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { Modal } from './Modal';

/**
 * Modal para solicitar y validar el token biométrico o código de seguridad.
 * Interrumpe operaciones críticas hasta confirmar la identidad del usuario.
 */
export const TokenModal = ({ isOpen, onClose, onConfirm, isLoading }) => {
  const [token, setToken] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(token);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Verificación de Seguridad">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 text-bik-blue dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldCheck size={32} />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Ingresa el código de 6 dígitos generado en tu aplicación de Token Biométrico BIK para autorizar esta transacción.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <input
          type="text"
          maxLength="6"
          placeholder="000000"
          value={token}
          onChange={(e) => setToken(e.target.value.replace(/\D/g, ''))}
          className="w-full text-center text-2xl tracking-[0.5em] font-mono bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg p-4 outline-none focus:ring-2 focus:ring-bik-blue"
          required
        />

        <button
          type="submit"
          disabled={token.length !== 6 || isLoading}
          className="w-full bg-bik-blue hover:bg-blue-800 text-white font-bold py-3 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
        >
          {isLoading ? <Loader2 size={20} className="animate-spin mr-2" /> : null}
          {isLoading ? 'Verificando...' : 'Confirmar Autorización'}
        </button>
      </form>
    </Modal>
  );
};
