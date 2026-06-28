import { useState, useEffect } from 'react';
import { CreditCard, Lock, Unlock, Globe, ShieldCheck, ChevronDown, AlertCircle } from 'lucide-react';
import { useCardsStore } from './store/cardsStore';
import { useAuthStore } from '../../auth/store/authStore';
import Swal from 'sweetalert2';

/**
 * Vista premium para la administración y configuración avanzada de tarjetas del cliente.
 * Permite realizar bloqueo/desbloqueo temporal e inhabilitar compras internacionales en tiempo real.
 */
export const CardSettingsView = () => {
  const { cards, loading, fetchUserCards, updateCardConfig } = useCardsStore();
  const { user } = useAuthStore();
  const [selectedCard, setSelectedCard] = useState(null);

  /**
   * Consulta las tarjetas activas del usuario autenticado al cargar el componente.
   */
  useEffect(() => {
    if (user?.id || user?._id) {
      fetchUserCards(user.id || user._id);
    }
  }, [user, fetchUserCards]);

  /**
   * Sincroniza la tarjeta actualmente seleccionada en el formulario con el almacén global.
   */
  useEffect(() => {
    if (cards.length > 0 && !selectedCard) {
      setSelectedCard(cards[0]);
    } else if (selectedCard) {
      const updated = cards.find(c => c._id === selectedCard._id);
      if (updated) setSelectedCard(updated);
    }
  }, [cards, selectedCard]);

  /**
   * Cambia el estado de una propiedad booleana de configuración de seguridad de la tarjeta.
   * 
   * @param {string} field - Atributo de la configuración a alternar (ej. bloqueada o comprasInternacionales).
   */
  const toggleConfig = async (field) => {
    if (!selectedCard) return;
    const current = selectedCard.configuraciones?.[field] || false;
    const newConfigs = { ...selectedCard.configuraciones, [field]: !current };
    
    const success = await updateCardConfig(selectedCard._id, { configuraciones: newConfigs });
    if (success) {
      Swal.fire('Éxito', `Configuración actualizada correctamente`, 'success');
    } else {
      Swal.fire('Error', 'No se pudo actualizar la configuración', 'error');
    }
  };

  /**
   * Formatea un número de tarjeta enmascarando los dígitos sensibles.
   * 
   * @param {string} num - Número de tarjeta completo.
   * @returns {string} Número enmascarado.
   */
  const maskNumber = (num) => num ? `**** **** **** ${num.slice(-4)}` : '****';

  return (
    <div className="w-full max-w-3xl mx-auto animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Configuraciones de tarjeta</h1>

      {loading ? (
        <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bik-blue"></div></div>
      ) : cards.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-8 text-center animate-slide-up border border-gray-200 dark:border-gray-700">
          <div className="bg-gray-50 dark:bg-gray-700 p-5 rounded-full w-max mx-auto mb-6"><CreditCard size={40} className="text-gray-400" /></div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No tienes tarjetas asociadas</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Solicita una tarjeta desde la sección de Solicitud de Productos.</p>
        </div>
      ) : (
        <div className="space-y-6 animate-slide-up">
          {/* Card Selector */}
          {cards.length > 1 && (
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Selecciona una tarjeta</label>
              <select value={selectedCard?._id || ''} onChange={(e) => setSelectedCard(cards.find(c => c._id === e.target.value))}
                className="w-full appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg p-3.5 pr-10 cursor-pointer outline-none focus:ring-2 focus:ring-bik-blue">
                {cards.map(c => <option key={c._id} value={c._id}>{c.tipo} — {maskNumber(c.numeroTarjeta)}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-10 text-gray-500 pointer-events-none" size={20} />
            </div>
          )}

          {selectedCard && (
            <>
              {/* Card Visual */}
              <div className={`relative rounded-2xl p-6 text-white overflow-hidden shadow-lg ${selectedCard.tipo?.includes('Credito') ? 'bg-gradient-to-br from-bik-blue to-blue-900' : 'bg-gradient-to-br from-gray-700 to-gray-900'}`}>
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-10 translate-x-10"></div>
                <p className="text-xs uppercase tracking-widest opacity-75 mb-6">{selectedCard.tipo}</p>
                <p className="text-xl font-mono tracking-widest mb-6">{maskNumber(selectedCard.numeroTarjeta)}</p>
                <div className="flex justify-between items-end">
                  <div><p className="text-[10px] uppercase opacity-60">Vence</p><p className="font-semibold">{selectedCard.fechaExpiracion}</p></div>
                  <div><p className="text-[10px] uppercase opacity-60">CVV</p><p className="font-semibold">***</p></div>
                  <img src="/logo-bik.png" alt="BIK" className="h-8 opacity-80" />
                </div>
              </div>

              {/* Config Toggles */}
              <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                  <div className="flex items-center">
                    {selectedCard.configuraciones?.bloqueada ? <Lock size={20} className="mr-3 text-red-500" /> : <Unlock size={20} className="mr-3 text-green-500" />}
                    <div>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">Bloqueo de tarjeta</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Bloquea temporalmente tu tarjeta</p>
                    </div>
                  </div>
                  <button onClick={() => toggleConfig('bloqueada')}
                    className={`w-11 h-6 rounded-full flex items-center transition-colors px-1 ${selectedCard.configuraciones?.bloqueada ? 'bg-red-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${selectedCard.configuraciones?.bloqueada ? 'translate-x-5' : ''}`}></div>
                  </button>
                </div>

                <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                  <div className="flex items-center">
                    <Globe size={20} className="mr-3 text-bik-blue dark:text-blue-400" />
                    <div>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">Compras internacionales</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Permitir compras en sitios extranjeros</p>
                    </div>
                  </div>
                  <button onClick={() => toggleConfig('comprasInternacionales')}
                    className={`w-11 h-6 rounded-full flex items-center transition-colors px-1 ${selectedCard.configuraciones?.comprasInternacionales ? 'bg-bik-blue' : 'bg-gray-300 dark:bg-gray-600'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${selectedCard.configuraciones?.comprasInternacionales ? 'translate-x-5' : ''}`}></div>
                  </button>
                </div>

                {selectedCard.tipo?.includes('Credito') && (
                  <div className="p-5 flex justify-between items-center">
                    <div className="flex items-center">
                      <ShieldCheck size={20} className="mr-3 text-bik-orange dark:text-orange-400" />
                      <div>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">Límite de crédito</span>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Utilizado: Q{(selectedCard.saldoUtilizado || 0).toFixed(2)} de Q{(selectedCard.limiteCredito || 0).toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">Q{((selectedCard.limiteCredito || 0) - (selectedCard.saldoUtilizado || 0)).toFixed(2)}</span>
                      <p className="text-xs text-gray-500">Disponible</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};