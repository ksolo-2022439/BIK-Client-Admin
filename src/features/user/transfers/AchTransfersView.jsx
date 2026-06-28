import { useState, useRef, useEffect } from 'react';
import { Landmark, ChevronDown, Send, Building2, AlertCircle, BookmarkPlus, Users } from 'lucide-react';
import { formatCurrency, getCurrencySymbol } from '../../../shared/utils/currency';
import { useTransfersStore } from './store/transfersStore';
import { useAccountsStore } from '../accounts/store/accountsStore';
import { useAuthStore } from '../../auth/store/authStore';
import { useContactsStore } from '../accounts/store/contactsStore';
import { ReceiptModal } from '../../../shared/components/ReceiptModal';
import Swal from 'sweetalert2';
import { getReadableError } from '../../../shared/utils/errorMessages';

/**
 * Vista para transferencias ACH hacia otras entidades financieras.
 * Permite guardar cuentas de destino y reutilizarlas desde un selector.
 */
export const AchTransfersView = () => {
  const { user } = useAuthStore();
  const { accounts: sourceAccounts, fetchUserAccountsAndCards } = useAccountsStore();
  const { executeAchTransfer, addContact, exchangeRates, loadingData, transferLoading: isLoading } = useTransfersStore();
  const { contacts, fetchContacts } = useContactsStore();
  
  const [sourceAccount, setSourceAccount] = useState('');
  const [selectedSavedContact, setSelectedSavedContact] = useState('');

  const [isSavedContactMenuOpen, setIsSavedContactMenuOpen] = useState(false);
  const savedContactMenuRef = useRef(null);

  const [isBankMenuOpen, setIsBankMenuOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState(null);
  const [tipoCuentaDestino, setTipoCuentaDestino] = useState('');
  const [cuentaDestinoExterna, setCuentaDestinoExterna] = useState('');
  const [titularDestino, setTitularDestino] = useState('');
  const [guardarCuenta, setGuardarCuenta] = useState(false);
  const [aliasCuenta, setAliasCuenta] = useState('');

  const [monto, setMonto] = useState('');
  const [monedaTransferencia, setMonedaTransferencia] = useState('');
  const [descripcion, setDescripcion] = useState('');

  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [transactionResult, setTransactionResult] = useState(null);
  const [error, setError] = useState(null);

  const menuRef = useRef(null);

  const banks = [
    { id: 'bi', name: 'Banco Industrial, S.A.', code: '001', color: 'text-blue-700' },
    { id: 'banrural', name: 'Banco de Desarrollo Rural, S.A. (Banrural)', code: '041', color: 'text-green-600' },
    { id: 'gyt', name: 'Banco G&T Continental, S.A.', code: '009', color: 'text-orange-500' },
    { id: 'bac', name: 'BAC Credomatic', code: '072', color: 'text-red-700' },
    { id: 'bam', name: 'Banco Agromercantil de Guatemala, S.A.', code: '014', color: 'text-red-600' },
    { id: 'bantrab', name: 'Banco de los Trabajadores', code: '044', color: 'text-blue-900' },
    { id: 'ficohsa', name: 'Banco Ficohsa Guatemala, S.A.', code: '056', color: 'text-blue-800' },
    { id: 'promerica', name: 'Banco Promerica, S.A.', code: '054', color: 'text-green-700' },
    { id: 'chn', name: 'Credito Hipotecario Nacional (CHN)', code: '005', color: 'text-blue-600' },
    { id: 'internacional', name: 'Banco Internacional, S.A.', code: '030', color: 'text-yellow-600' },
    { id: 'inmobiliario', name: 'Banco Inmobiliario, S.A.', code: '003', color: 'text-blue-500' },
    { id: 'azteca', name: 'Banco Azteca Guatemala, S.A.', code: '057', color: 'text-green-500' },
    { id: 'vivibanco', name: 'Vivibanco, S.A.', code: '048', color: 'text-green-800' },
    { id: 'antigua', name: 'Banco de Antigua, S.A.', code: '050', color: 'text-yellow-500' },
    { id: 'citi', name: 'Citibank, N.A.', code: '032', color: 'text-blue-400' },
    { id: 'inv', name: 'Banco INV, S.A.', code: '059', color: 'text-indigo-600' },
    { id: 'nexa', name: 'Banco Nexa, S.A.', code: '065', color: 'text-purple-600' },
    { id: 'credicorp', name: 'Banco Credicorp, S.A.', code: '052', color: 'text-blue-700' }
  ];

  useEffect(() => {
    const init = async () => {
      const userId = user?.publicId || user?.id || user?._id;
      if (userId) {
        await fetchUserAccountsAndCards(userId);
        await fetchContacts();
      }
    };
    init();
  }, [user, fetchUserAccountsAndCards, fetchContacts]);

  const savedContacts = contacts.filter(c => c.tipoDestinatario === 'ACH');

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setIsBankMenuOpen(false);
      if (savedContactMenuRef.current && !savedContactMenuRef.current.contains(event.target)) setIsSavedContactMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuRef, savedContactMenuRef]);

  const handleSelectSavedContact = (contactId) => {
    if (!contactId) { resetDestFields(); return; }
    const contact = savedContacts.find(c => c._id === contactId);
    if (contact) {
      setSelectedBank(banks.find(b => b.name === contact.banco) || { name: contact.banco, color: 'text-gray-600' });
      setTipoCuentaDestino(contact.tipoCuenta === 'Monetaria' ? 'monetaria' : 'ahorro');
      setCuentaDestinoExterna(contact.numeroCuenta);
      setTitularDestino(contact.alias);
      setSelectedSavedContact(contactId);
    }
  };

  const resetDestFields = () => {
    setSelectedBank(null); setTipoCuentaDestino(''); setCuentaDestinoExterna('');
    setTitularDestino(''); setSelectedSavedContact('');
  };

  const handleTransferSubmit = (e) => {
    e.preventDefault();
    setError(null);
    if (!sourceAccount || !selectedBank || !tipoCuentaDestino || !cuentaDestinoExterna || !titularDestino || !monto || monto <= 0) {
      setError('Por favor, completa todos los datos del destinatario y el monto.');
      return;
    }
    if (guardarCuenta && !aliasCuenta) {
      setError('Ingresa un alias para guardar la cuenta.');
      return;
    }
    processTransfer();
  };

  const processTransfer = async () => {
    setError(null);
    try {
      const response = await executeAchTransfer({
        cuentaOrigenId: sourceAccount,
        monto: Number(monto),
        monedaTransferencia: monedaTransferencia || (sourceAccounts.find(a => a._id === sourceAccount)?.moneda || 'GTQ'),
        descripcion,
        achDetails: {
          bancoDestino: selectedBank.name,
          titularDestino,
          cuentaDestinoExterna,
          tipoCuentaDestino: tipoCuentaDestino === 'monetaria' ? 'Monetaria' : 'Ahorro'
        },
        tokenSeguridad: 'VALID_BYPASS'
      });
      
      if (response.status === 'success') {
        if (guardarCuenta && aliasCuenta) {
          try {
            await addContact({
              alias: aliasCuenta,
              tipoDestinatario: 'ACH',
              banco: selectedBank.name,
              numeroCuenta: cuentaDestinoExterna,
              tipoCuenta: tipoCuentaDestino === 'monetaria' ? 'Monetaria' : 'Ahorro'
            });
          } catch (saveErr) {
            console.warn('No se pudo guardar la cuenta:', saveErr);
          }
        }
        setTransactionResult({ ...response.data, destinatarioAlias: `${titularDestino} (${selectedBank.name})` });
        setIsReceiptModalOpen(true);
        resetForm();
        fetchContacts();
      }
    } catch (err) {
      setError(err.message || 'Error al procesar la transferencia ACH.');
    }
  };

  const resetForm = () => {
    setMonto(''); setDescripcion(''); resetDestFields();
    setGuardarCuenta(false); setAliasCuenta('');
    setMonedaTransferencia('');
  };

  return (
    <div className="max-w-2xl mx-auto w-full animate-fade-in pb-12">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Transferencias a Otros Bancos (ACH)</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center text-red-600 dark:text-red-400">
          <AlertCircle size={20} className="mr-2 flex-shrink-0" />
          <span className="text-sm font-medium">{getReadableError(error)}</span>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 md:p-8 transition-colors duration-300">
        <form className="space-y-6" onSubmit={handleTransferSubmit}>
          {/* Source account */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Cuenta a debitar</label>
            <div className="relative">
              <select value={sourceAccount} onChange={(e) => setSourceAccount(e.target.value)}
                className="w-full appearance-none bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-bik-blue focus:border-bik-blue block p-3.5 pr-10 cursor-pointer outline-none">
                <option value="">Selecciona tu cuenta BIK</option>
                {sourceAccounts.filter(acc => !acc.isCard).map(acc => (<option key={acc._id} value={acc._id}>{acc.numeroCuenta} (Disponible: {formatCurrency(acc.saldo, acc.moneda)})</option>))}
              </select>
              <ChevronDown className="absolute right-3 top-3.5 text-gray-500 dark:text-gray-400 pointer-events-none" size={20} />
            </div>
          </div>

          {/* Saved contacts selector */}
          {savedContacts.length > 0 && (
            <div className="relative" ref={savedContactMenuRef}>
              <label className="block text-sm font-semibold text-bik-blue dark:text-blue-400 mb-2 flex items-center">
                <Users size={16} className="mr-2" /> Cuentas guardadas
              </label>
              <button 
                type="button" 
                onClick={() => setIsSavedContactMenuOpen(!isSavedContactMenuOpen)}
                className="w-full flex justify-between items-center bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-sm rounded-lg p-3.5 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-300 outline-none focus:ring-2 focus:ring-bik-blue"
              >
                <span className={selectedSavedContact ? "text-gray-900 dark:text-white font-medium" : "text-gray-500 dark:text-gray-400"}>
                  {selectedSavedContact ? (
                    (() => {
                      const contact = savedContacts.find(c => c._id === selectedSavedContact);
                      return contact ? `${contact.alias} — ${contact.banco} (${contact.numeroCuenta})` : 'Seleccionar cuenta guardada...';
                    })()
                  ) : 'Seleccionar cuenta guardada...'}
                </span>
                <ChevronDown className="text-gray-500 dark:text-gray-400 transition-colors duration-300" size={20} />
              </button>

              {isSavedContactMenuOpen && (
                <div className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden animate-dropdown">
                  <div className="max-h-60 overflow-y-auto">
                    <button
                      type="button"
                      onClick={() => { handleSelectSavedContact(''); setIsSavedContactMenuOpen(false); }}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 font-medium text-gray-500 dark:text-gray-400"
                    >
                      Ninguna / Nueva cuenta externa
                    </button>
                    {savedContacts.map(c => (
                      <button 
                        key={c._id} 
                        type="button"
                        onClick={() => { handleSelectSavedContact(c._id); setIsSavedContactMenuOpen(false); }}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 flex flex-col transition-colors duration-300"
                      >
                        <span className="font-semibold text-bik-blue dark:text-blue-400">{c.alias}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center mt-1">
                          <Building2 size={12} className="mr-1" /> {c.banco} | Cuenta {c.tipoCuenta} | {c.numeroCuenta}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Destination details */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h2 className="text-lg font-bold text-bik-blue dark:text-blue-400 mb-4 flex items-center"><Landmark size={20} className="mr-2" /> Datos del Destinatario</h2>
            <div className="space-y-4">
              <div className="relative" ref={menuRef}>
                <button type="button" onClick={() => setIsBankMenuOpen(!isBankMenuOpen)}
                  className="w-full flex justify-between items-center bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-sm rounded-lg p-3.5 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors outline-none focus:ring-2 focus:ring-bik-blue">
                  {selectedBank ? (
                    <span className="flex items-center text-gray-900 dark:text-white font-medium"><Building2 size={16} className={`mr-2 ${selectedBank.color}`} />{selectedBank.name}</span>
                  ) : (<span className="text-gray-500 dark:text-gray-400">Selecciona el banco destino</span>)}
                  <ChevronDown className="text-gray-500 dark:text-gray-400" size={20} />
                </button>
                {isBankMenuOpen && (
                  <div className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden animate-dropdown">
                    <div className="max-h-60 overflow-y-auto">
                      {banks.map((bank) => (
                        <button key={bank.id} type="button" onClick={() => { setSelectedBank(bank); setIsBankMenuOpen(false); }}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 flex items-center transition-colors">
                          <div className={`p-2 rounded-md bg-gray-100 dark:bg-gray-900 mr-3 ${bank.color}`}><Building2 size={18} /></div>
                          <div><p className="font-semibold text-gray-900 dark:text-white">{bank.name}</p><p className="text-xs text-gray-500 dark:text-gray-400">Código: {bank.code}</p></div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                <select value={tipoCuentaDestino} onChange={(e) => setTipoCuentaDestino(e.target.value)}
                  className="w-full appearance-none bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg p-3.5 pr-10 cursor-pointer outline-none">
                  <option value="">Tipo de cuenta</option>
                  <option value="monetaria">Monetaria</option>
                  <option value="ahorro">Ahorro</option>
                </select>
                <ChevronDown className="absolute right-3 top-3.5 text-gray-500 pointer-events-none" size={20} />
              </div>

              <input type="text" value={cuentaDestinoExterna} onChange={(e) => setCuentaDestinoExterna(e.target.value)} placeholder="Número de cuenta destino"
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg p-3.5 outline-none focus:ring-2 focus:ring-bik-blue" />
              <input type="text" value={titularDestino} onChange={(e) => setTitularDestino(e.target.value)} placeholder="Nombre del titular"
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg p-3.5 outline-none focus:ring-2 focus:ring-bik-blue" />
            </div>
          </div>

          {/* Save account checkbox */}
          <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <input type="checkbox" id="guardar" checked={guardarCuenta} onChange={(e) => setGuardarCuenta(e.target.checked)}
              className="mt-1 w-4 h-4 text-bik-blue rounded focus:ring-bik-blue cursor-pointer" />
            <div className="flex-1">
              <label htmlFor="guardar" className="text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer flex items-center">
                <BookmarkPlus size={16} className="mr-2 text-bik-orange dark:text-orange-400" /> Guardar esta cuenta para futuras transferencias
              </label>
              {guardarCuenta && (
                <input type="text" value={aliasCuenta} onChange={(e) => setAliasCuenta(e.target.value)} placeholder="Alias (Ej. Cuenta de Juan)" required={guardarCuenta}
                  className="mt-3 w-full bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 text-gray-900 dark:text-white text-sm rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-bik-blue" />
              )}
            </div>
          </div>

          {/* Amount and description */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Monto a transferir</label>
              
              {sourceAccounts.find(a => a._id === sourceAccount)?.moneda === 'USD' && (
                <div className="mb-3 grid grid-cols-2 gap-3">
                  <button 
                    type="button"
                    onClick={() => setMonedaTransferencia('USD')}
                    className={`py-2 rounded-lg border font-medium text-sm transition-all ${monedaTransferencia === 'USD' || !monedaTransferencia ? 'border-bik-blue bg-blue-50 dark:bg-blue-900/30 text-bik-blue' : 'border-gray-200 dark:border-gray-600 text-gray-500 hover:border-gray-300'}`}
                  >
                    $ Dólares (USD)
                  </button>
                  <button 
                    type="button"
                    onClick={() => setMonedaTransferencia('GTQ')}
                    className={`py-2 rounded-lg border font-medium text-sm transition-all ${monedaTransferencia === 'GTQ' ? 'border-bik-blue bg-blue-50 dark:bg-blue-900/30 text-bik-blue' : 'border-gray-200 dark:border-gray-600 text-gray-500 hover:border-gray-300'}`}
                  >
                    Q Quetzales (GTQ)
                  </button>
                </div>
              )}

              <div className="relative">
                <span className="absolute left-4 top-3 text-gray-500 font-semibold">
                  {getCurrencySymbol(monedaTransferencia || sourceAccounts.find(a => a._id === sourceAccount)?.moneda || 'GTQ')}
                </span>
                <input type="number" value={monto} onChange={(e) => setMonto(e.target.value)} placeholder="0.00"
                  className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-lg rounded-lg p-3 pl-10 outline-none focus:ring-2 focus:ring-bik-blue" />
              </div>

              {sourceAccounts.find(a => a._id === sourceAccount)?.moneda === 'USD' && monedaTransferencia === 'GTQ' && Number(monto) > 0 && exchangeRates && (
                <p className="text-sm text-bik-blue dark:text-blue-400 mt-2 font-medium bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg border border-blue-100 dark:border-blue-800">
                  Q {Number(monto).toLocaleString('es-GT', { minimumFractionDigits: 2 })} equivalen a debitar $ {(Number(monto) / exchangeRates.tasaCompra).toLocaleString('es-GT', { minimumFractionDigits: 2 })} de tu cuenta (TC Compra: {exchangeRates.tasaCompra})
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Concepto</label>
              <input type="text" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Motivo de la transferencia"
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg p-3.5 outline-none focus:ring-2 focus:ring-bik-blue" />
            </div>
          </div>

          <button type="submit" className="w-full bg-bik-orange hover:bg-orange-600 text-white font-bold rounded-lg text-lg px-5 py-4 flex items-center justify-center transition-all shadow-md active:scale-95 mt-4">
            <Send size={20} className="mr-2" /> Transferir vía ACH
          </button>
        </form>
      </div>

      <ReceiptModal isOpen={isReceiptModalOpen} onClose={() => setIsReceiptModalOpen(false)} transaction={transactionResult} />
    </div>
  );
};