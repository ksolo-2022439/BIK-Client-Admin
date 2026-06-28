import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, ChevronRight, Bell, CheckCheck } from 'lucide-react';
import { useNotificationsStore } from './store/notificationsStore';

/**
 * Vista de alertas y notificaciones del sistema.
 * Consume notificaciones reales del backend y permite marcarlas como leídas.
 */
export const NotificationsView = () => {
  const [activeTab, setActiveTab] = useState('notificaciones');
  const { 
    notifications, 
    loading, 
    fetchNotifications, 
    markAsRead: handleMarkAsRead, 
    markAllAsRead: handleMarkAllAsRead 
  } = useNotificationsStore();
  
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const filtered = notifications.filter(n =>
    (n.mensaje || n.texto || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const unreadCount = notifications.filter(n => !n.leido).length;

  return (
    <div className="w-full max-w-3xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Alertas</h1>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllAsRead} className="text-sm text-bik-blue dark:text-blue-400 font-medium hover:underline flex items-center">
            <CheckCheck size={16} className="mr-1" /> Marcar todas como leídas
          </button>
        )}
      </div>

      <div className="flex border-b border-gray-300 dark:border-gray-700 mb-4 bg-white dark:bg-gray-900 sticky top-0 z-10">
        {[{ key: 'notificaciones', label: `Notificaciones${unreadCount > 0 ? ` (${unreadCount})` : ''}` }, { key: 'token', label: 'Token Biométrico' }].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-3 text-center font-semibold text-sm transition-colors ${
              activeTab === tab.key ? 'border-b-2 border-bik-blue text-bik-blue dark:border-blue-400 dark:text-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}>{tab.label}</button>
        ))}
      </div>

      {activeTab === 'notificaciones' && (
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-3.5 text-bik-blue dark:text-blue-400" size={20} />
              <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar notificación..."
                className="w-full bg-white dark:bg-gray-800 border-none shadow-sm rounded-lg p-3.5 pl-12 text-gray-900 dark:text-white focus:ring-2 focus:ring-bik-blue outline-none transition-all" />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bik-blue mx-auto"></div></div>
          ) : filtered.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-12 text-center">
              <Bell size={40} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Sin notificaciones</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">No hay alertas disponibles en este momento.</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
              {filtered.map((notif) => (
                <button key={notif._id} onClick={() => !notif.leido && handleMarkAsRead(notif._id)}
                  className={`w-full flex justify-between items-center p-5 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left ${notif.leido ? 'opacity-60' : ''}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${notif.leido ? 'bg-gray-300 dark:bg-gray-600' : 'bg-bik-blue dark:bg-blue-400'}`}></div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                        {notif.fecha ? new Date(notif.fecha).toLocaleString('es-GT') : notif.createdAt ? new Date(notif.createdAt).toLocaleString('es-GT') : ''}
                      </p>
                      {notif.titulo && (
                        <p className={`text-sm font-bold pr-4 ${notif.leido ? 'text-gray-600 dark:text-gray-300' : 'text-gray-900 dark:text-white'}`}>
                          {notif.titulo}
                        </p>
                      )}
                      <p className={`text-sm font-medium leading-snug pr-4 ${notif.leido ? 'text-gray-500 dark:text-gray-400' : 'text-bik-blue dark:text-blue-400'}`}>
                        {notif.mensaje || notif.texto}
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-bik-blue dark:text-blue-400 flex-shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'token' && (
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-12 text-center">
          <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-full w-max mx-auto mb-4">
            <SlidersHorizontal size={36} className="text-bik-blue dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Token de Seguridad</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">Tu token biométrico está activo. Se generará automáticamente al realizar transacciones que requieran verificación adicional.</p>
        </div>
      )}
    </div>
  );
};