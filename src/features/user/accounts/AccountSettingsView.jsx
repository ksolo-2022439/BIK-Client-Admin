import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Building2, Wallet, AlertCircle } from 'lucide-react';
import { useContactsStore } from './store/contactsStore';
import { Modal } from '../../../shared/components/Modal';
import Swal from 'sweetalert2';

/**
 * Vista para el mantenimiento de cuentas.
 * Permite gestionar las cuentas propias y de otros bancos agregadas como favoritas o frecuentes.
 */
export const AccountSettingsView = () => {
  const [activeTab, setActiveTab] = useState('bik');
  const { 
    contacts, 
    loading, 
    fetchContacts, 
    addContact, 
    updateContact, 
    deleteContact 
  } = useContactsStore();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [formData, setFormData] = useState({ alias: '', numeroCuenta: '', tipoCuenta: 'Monetaria', banco: 'BIK', tipoDestinatario: 'BIK' });

  useEffect(() => { fetchContacts(); }, [fetchContacts]);

  const filteredContacts = contacts.filter(c =>
    activeTab === 'bik' ? c.tipoDestinatario === 'BIK' : c.tipoDestinatario === 'ACH'
  );

  const openAddModal = () => {
    setEditingContact(null);
    setFormData({
      alias: '', numeroCuenta: '', tipoCuenta: 'Monetaria',
      banco: activeTab === 'bik' ? 'BIK' : '',
      tipoDestinatario: activeTab === 'bik' ? 'BIK' : 'ACH'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (contact) => {
    setEditingContact(contact);
    setFormData({
      alias: contact.alias,
      numeroCuenta: contact.numeroCuenta,
      tipoCuenta: contact.tipoCuenta,
      banco: contact.banco,
      tipoDestinatario: contact.tipoDestinatario
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingContact) {
        await updateContact(editingContact._id, formData);
        Swal.fire('Éxito', 'Cuenta actualizada correctamente', 'success');
      } else {
        await addContact(formData);
        Swal.fire('Éxito', 'Cuenta agregada correctamente', 'success');
      }
      setIsModalOpen(false);
    } catch (err) {
      Swal.fire('Error', err.message || 'Error al guardar la cuenta', 'error');
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: '¿Eliminar cuenta?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#003B7A',
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Sí, eliminar'
    });
    if (result.isConfirmed) {
      try {
        await deleteContact(id);
        Swal.fire('Eliminado', 'La cuenta fue eliminada.', 'success');
      } catch (err) {
        Swal.fire('Error', 'No se pudo eliminar la cuenta.', 'error');
      }
    }
  };

  const banks = [
    'Banco Industrial', 'Banco G&T Continental', 'Banrural',
    'Banco Promerica', 'Banco BAM', 'Bantrab', 'Banco Inmobiliario',
    'Banco de los Trabajadores', 'Banco Agromercantil', 'Otro'
  ];

  return (
    <div className="w-full max-w-3xl mx-auto animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Mantenimiento de cuentas</h1>

      <div className="flex border-b border-gray-300 dark:border-gray-700 mb-6 bg-white dark:bg-gray-900">
        {[{ key: 'bik', label: 'Cuentas BIK' }, { key: 'otros', label: 'Otros Bancos' }].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-3 text-center font-semibold text-sm transition-colors ${
              activeTab === tab.key
                ? 'border-b-2 border-bik-blue text-bik-blue dark:border-blue-400 dark:text-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >{tab.label}</button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bik-blue"></div></div>
      ) : filteredContacts.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-8 text-center animate-slide-up">
          <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-full w-max mx-auto mb-4">
            {activeTab === 'bik' ? <Wallet size={36} className="text-bik-blue dark:text-blue-400" /> : <Building2 size={36} className="text-bik-orange dark:text-orange-400" />}
          </div>
          <h2 className="text-lg font-bold text-bik-blue dark:text-blue-400 mb-2">
            {activeTab === 'bik' ? 'Sin cuentas BIK guardadas' : 'Sin cuentas de otros bancos'}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-xs mx-auto">
            Agrega las cuentas que utilizas con más frecuencia para agilizar tus transferencias.
          </p>
          <button onClick={openAddModal} className="bg-bik-blue hover:bg-blue-800 text-white font-semibold py-3 px-8 rounded-lg transition-colors shadow-sm flex items-center mx-auto">
            <Plus size={18} className="mr-2" /> Agregar cuenta
          </button>
        </div>
      ) : (
        <div className="space-y-3 animate-slide-up">
          {filteredContacts.map(contact => (
            <div key={contact._id} className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-5 flex items-center justify-between border border-gray-100 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
              <div className="flex items-center">
                <div className={`p-2.5 rounded-lg mr-4 ${contact.tipoDestinatario === 'BIK' ? 'bg-blue-50 dark:bg-blue-900/30 text-bik-blue dark:text-blue-400' : 'bg-orange-50 dark:bg-orange-900/30 text-bik-orange dark:text-orange-400'}`}>
                  {contact.tipoDestinatario === 'BIK' ? <Wallet size={20} /> : <Building2 size={20} />}
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white text-sm">{contact.alias}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{contact.banco} • {contact.tipoCuenta} • {contact.numeroCuenta}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => openEditModal(contact)} className="p-2 text-gray-400 hover:text-bik-blue dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <Pencil size={16} />
                </button>
                <button onClick={() => handleDelete(contact._id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          <button onClick={openAddModal} className="w-full bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-dashed border-gray-300 dark:border-gray-600 text-bik-blue dark:text-blue-400 font-semibold py-4 rounded-lg transition-colors flex items-center justify-center">
            <Plus size={18} className="mr-2" /> Agregar otra cuenta
          </button>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingContact ? 'Editar cuenta' : 'Agregar cuenta'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Alias / Nombre</label>
            <input type="text" value={formData.alias} onChange={(e) => setFormData({...formData, alias: e.target.value})} placeholder="Ej. Cuenta de Juan" required
              className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-bik-blue" />
          </div>
          {activeTab === 'otros' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Banco</label>
              <select value={formData.banco} onChange={(e) => setFormData({...formData, banco: e.target.value})} required
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-bik-blue">
                <option value="">Selecciona un banco</option>
                {banks.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Número de cuenta</label>
            <input type="text" value={formData.numeroCuenta} onChange={(e) => setFormData({...formData, numeroCuenta: e.target.value})} placeholder="Ej. 4000000001" required
              className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-bik-blue" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo de cuenta</label>
            <select value={formData.tipoCuenta} onChange={(e) => setFormData({...formData, tipoCuenta: e.target.value})} required
              className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-bik-blue">
              <option value="Monetaria">Monetaria</option>
              <option value="Ahorro">Ahorro</option>
            </select>
          </div>
          <button type="submit" className="w-full bg-bik-blue hover:bg-blue-800 text-white font-semibold py-3 rounded-lg transition-colors mt-2">
            {editingContact ? 'Guardar cambios' : 'Agregar cuenta'}
          </button>
        </form>
      </Modal>
    </div>
  );
};