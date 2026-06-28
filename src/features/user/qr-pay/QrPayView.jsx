import { useState, useRef, useEffect } from 'react';
import { QrCode, UploadCloud, History, Camera, Download, Wallet, ArrowRight, CheckCircle2, RefreshCw } from 'lucide-react';
import { usePaymentsStore } from '../payments/store/paymentsStore';
import { useAccountsStore } from '../accounts/store/accountsStore';
import { useAuthStore } from '../../auth/store/authStore';
import { Modal } from '../../../shared/components/Modal';
import Swal from 'sweetalert2';
import jsQR from 'jsqr';
import QRCode from 'qrcode';
import { bikApi } from '../../../shared/api/axiosInstance';
import { formatCurrency } from '../../../shared/utils/currency';

/**
 * Vista premium para efectuar cobros y pagos de manera instantánea mediante códigos QR.
 * Soporta la decodificación local de imágenes con jsQR y la generación dinámica de códigos QR oficiales de BIK.
 */
export const QrPayView = () => {
  const [activeTab, setActiveTab] = useState('escanear');
  const fileInputRef = useRef(null);
  const { user } = useAuthStore();
  const { accounts: cuentas, fetchUserAccountsAndCards } = useAccountsStore();
  const { payQr, loading } = usePaymentsStore();

  const [cuentaOrigenId, setCuentaOrigenId] = useState('');
  const [cuentaDestinoId, setCuentaDestinoId] = useState('');
  const [cuentaDestinoNum, setCuentaDestinoNum] = useState('');
  const [cuentaDestinoTitular, setCuentaDestinoTitular] = useState('');
  const [monto, setMonto] = useState(0);
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);

  const [genCuentaId, setGenCuentaId] = useState('');
  const [genMonto, setGenMonto] = useState('');
  const [generatedQrUrl, setGeneratedQrUrl] = useState('');

  const [qrTransactions, setQrTransactions] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (user?.id || user?._id) {
      fetchUserAccountsAndCards(user.id || user._id);
    }
  }, [user, fetchUserAccountsAndCards]);

  /**
   * Recupera el historial de transacciones liquidadas mediante código QR del cliente.
   */
  const fetchQrHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await bikApi.get('/transactions/history?tipo=Pago_QR');
      setQrTransactions(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'historial') {
      fetchQrHistory();
    }
  }, [activeTab]);

  /**
   * Dispara el diálogo nativo del sistema operativo para seleccionar un archivo de imagen.
   */
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    fileInputRef.current?.click();
  };

  /**
   * Lee la imagen cargada y ejecuta jsQR para decodificar los datos del código QR.
   * Realiza validaciones sintácticas estrictas sobre la estructura JSON decodificada.
   */
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        
        if (code) {
          try {
            const data = JSON.parse(code.data);
            if (data.cuentaId && data.numeroCuenta && data.monto !== undefined) {
              setCuentaDestinoId(data.cuentaId);
              setCuentaDestinoNum(data.numeroCuenta);
              setCuentaDestinoTitular(data.titular || 'Cobro QR');
              setMonto(Number(data.monto));
              setConfirmModalOpen(true);
            } else {
              Swal.fire({
                title: 'QR No Válido',
                text: 'El código QR decodificado no contiene el formato oficial de BIK.',
                icon: 'warning',
                confirmButtonColor: '#1e3a8a'
              });
            }
          } catch (err) {
            Swal.fire({
              title: 'Formato Incorrecto',
              text: 'La imagen contiene un código QR pero no corresponde a un cobro de BIK.',
              icon: 'error',
              confirmButtonColor: '#1e3a8a'
            });
          }
        } else {
          Swal.fire({
            title: 'Lectura Fallida',
            text: 'No se detectó ningún código QR en la imagen cargada. Intente con otra imagen más clara.',
            icon: 'info',
            confirmButtonColor: '#1e3a8a'
          });
        }
      };
      img.src = event.target?.result;
    };
    reader.readAsDataURL(file);
  };

  /**
   * Envía la liquidación de pago QR validado hacia el backend.
   * Valida disponibilidad de fondos y previene transferencias al mismo titular origen.
   */
  const handleConfirmPay = async (e) => {
    e.preventDefault();
    if (!cuentaOrigenId) {
      Swal.fire('Error', 'Seleccione una cuenta de origen', 'error');
      return;
    }
    
    const selectedOriginAcc = cuentas.find(c => c._id === cuentaOrigenId || c.id === cuentaOrigenId);
    if (selectedOriginAcc && (selectedOriginAcc.id === cuentaDestinoId || selectedOriginAcc._id === cuentaDestinoId)) {
      Swal.fire('Pago Inválido', 'No puede transferirse fondos a la misma cuenta de origen.', 'warning');
      return;
    }

    try {
      await payQr({
        cuentaOrigenId,
        cuentaDestinoId,
        monto
      });
      
      Swal.fire({
        title: '¡Pago Exitoso!',
        text: `Se transfirieron ${formatCurrency(monto)} correctamente.`,
        icon: 'success',
        confirmButtonColor: '#1e3a8a'
      });
      
      setConfirmModalOpen(false);
      setCuentaOrigenId('');
      if (user?.id || user?._id) fetchUserAccountsAndCards(user.id || user._id);
    } catch (err) {
      Swal.fire('Error al Pagar', err.message || 'Error al procesar el pago QR.', 'error');
    }
  };

  /**
   * Genera una imagen en código QR oficial codificando los datos de cobro estructurados del cliente.
   */
  const handleGenerateQr = async (e) => {
    e.preventDefault();
    if (!genCuentaId) {
      Swal.fire('Error', 'Selecciona una cuenta', 'error');
      return;
    }
    const selectedAcc = cuentas.find(c => c._id === genCuentaId || c.id === genCuentaId);
    if (!selectedAcc) return;

    const qrPayload = JSON.stringify({
      cuentaId: selectedAcc.id || selectedAcc._id,
      numeroCuenta: selectedAcc.numeroCuenta,
      titular: `${user?.nombres} ${user?.apellidos}`,
      monto: Number(genMonto) || 0
    });

    try {
      const url = await QRCode.toDataURL(qrPayload, {
        width: 300,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      });
      setGeneratedQrUrl(url);
    } catch (err) {
      Swal.fire('Error', 'No se pudo generar el código QR.', 'error');
    }
  };

  /**
   * Genera y descarga una imagen PNG consolidada y formal con membrete del banco BIK,
   * metadatos de la cuenta destino, el monto a cobrar y el código QR oficial en el centro.
   */
  const handleDownloadQr = (e) => {
    e.preventDefault();
    if (!generatedQrUrl) return;

    const selectedAcc = cuentas.find(c => c._id === genCuentaId || c.id === genCuentaId);
    if (!selectedAcc) return;

    try {
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 550;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = '#1e3a8a';
      ctx.lineWidth = 6;
      ctx.strokeRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#1e3a8a';
      ctx.fillRect(3, 3, canvas.width - 6, 70);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px "Inter", "Outfit", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('BANCO INFORMÁTICO KINAL', canvas.width / 2, 42);

      ctx.fillStyle = '#ff6600';
      ctx.font = 'bold 12px "Inter", sans-serif';
      ctx.fillText('CÓDIGO DE COBRO DIGITAL', canvas.width / 2, 105);

      ctx.fillStyle = '#475569';
      ctx.font = '600 13px "Inter", sans-serif';
      ctx.fillText(`${selectedAcc.tipo} — Cuenta No. ${selectedAcc.numeroCuenta}`, canvas.width / 2, 128);

      ctx.fillStyle = '#0f172a';
      ctx.font = 'extrabold 22px "Inter", "Outfit", sans-serif';
      const montoTexto = Number(genMonto) > 0 
        ? formatCurrency(Number(genMonto), selectedAcc.moneda)
        : 'Monto Variable';
      ctx.fillText(montoTexto, canvas.width / 2, 160);

      const qrImg = new Image();
      qrImg.onload = () => {
        ctx.drawImage(qrImg, 50, 185, 300, 300);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '500 9px "Inter", sans-serif';
        ctx.fillText('Transacción segura procesada por BIK Pay.', canvas.width / 2, 510);
        ctx.fillStyle = '#64748b';
        ctx.font = 'italic 500 10px "Inter", sans-serif';
        ctx.fillText('Escanee desde su App BIK para transferir de inmediato.', canvas.width / 2, 526);

        try {
          const consolidatedDataUrl = canvas.toDataURL('image/png');

          const link = document.createElement('a');
          link.href = consolidatedDataUrl;
          link.download = `BIK_Cobro_QR_${genMonto || 'Variable'}.png`;
          
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } catch (err) {
          console.error('Error al exportar QR consolidado:', err);
          const link = document.createElement('a');
          link.href = generatedQrUrl;
          link.download = `BIK_Cobro_QR_${genMonto || 'Variable'}.png`;
          link.click();
        }
      };
      qrImg.src = generatedQrUrl;
    } catch (error) {
      console.error('Error generando canvas QR:', error);
      const link = document.createElement('a');
      link.href = generatedQrUrl;
      link.download = `BIK_Cobro_QR_${genMonto || 'Variable'}.png`;
      link.click();
    }
  };

  return (
    <div className="max-w-3xl mx-auto w-full">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 transition-colors duration-300">Pago con Código QR</h1>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors duration-300">
        <div className="flex border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <button
            onClick={() => setActiveTab('escanear')}
            className={`flex-1 py-4 font-semibold text-sm flex items-center justify-center transition-all duration-300 ${activeTab === 'escanear' ? 'text-bik-blue dark:text-blue-400 border-b-2 border-bik-blue dark:border-blue-400 bg-blue-50/50 dark:bg-blue-900/20' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
          >
            <Camera size={18} className="mr-2" /> Escanear
          </button>
          <button
            onClick={() => setActiveTab('generar')}
            className={`flex-1 py-4 font-semibold text-sm flex items-center justify-center transition-all duration-300 ${activeTab === 'generar' ? 'text-bik-blue dark:text-blue-400 border-b-2 border-bik-blue dark:border-blue-400 bg-blue-50/50 dark:bg-blue-900/20' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
          >
            <QrCode size={18} className="mr-2" /> Generar Cobro
          </button>
          <button
            onClick={() => setActiveTab('historial')}
            className={`flex-1 py-4 font-semibold text-sm flex items-center justify-center transition-all duration-300 ${activeTab === 'historial' ? 'text-bik-blue dark:text-blue-400 border-b-2 border-bik-blue dark:border-blue-400 bg-blue-50/50 dark:bg-blue-900/20' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
          >
            <History size={18} className="mr-2" /> Historial QR
          </button>
        </div>

        <div className="p-8">
          {activeTab === 'escanear' && (
            <div key="escanear" className="flex flex-col items-center text-center animate-slide-up">
              <div className="w-64 h-64 border-2 border-dashed border-bik-blue dark:border-blue-400 rounded-2xl flex flex-col items-center justify-center bg-blue-50 dark:bg-blue-900/20 mb-6 relative overflow-hidden transition-colors duration-300">
                <QrCode size={64} className="text-bik-blue dark:text-blue-400 opacity-20 absolute" />
                <div className="w-48 h-48 border-2 border-bik-blue/50 dark:border-blue-400/50 rounded-lg absolute transition-colors duration-300"></div>
                <div className="w-full h-1 bg-bik-orange/50 dark:bg-orange-400/50 absolute top-1/2 shadow-[0_0_10px_rgba(255,102,0,0.8)] animate-pulse"></div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">Cargar imagen de Código QR</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-md transition-colors duration-300 font-medium">Sube una captura de pantalla o imagen con el código QR de cobro de BIK de otro cliente para efectuar el pago de forma instantánea.</p>

              <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
              <button
                onClick={handleUploadClick}
                className="bg-bik-blue hover:bg-blue-800 text-white font-semibold py-3 px-6 rounded-lg flex items-center transition-all duration-300 active:scale-95 shadow-md"
              >
                <UploadCloud size={20} className="mr-2" />
                Seleccionar Imagen QR
              </button>
            </div>
          )}

          {activeTab === 'generar' && (
            <div key="generar" className="animate-slide-up max-w-md mx-auto">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 text-center">Generar Código de Cobro QR</h3>
              
              {!generatedQrUrl ? (
                <form onSubmit={handleGenerateQr} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Seleccionar Cuenta para Recibir Pago</label>
                    <select
                      value={genCuentaId}
                      onChange={(e) => setGenCuentaId(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-bik-blue font-semibold"
                      required
                    >
                      <option value="">Seleccione cuenta...</option>
                      {cuentas.filter(c => !c.isCard).map(c => (
                        <option key={c._id} value={c._id}>{c.numeroCuenta} — {c.tipo} ({formatCurrency(c.saldo, c.moneda)})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monto a Cobrar (Opcional)</label>
                    <input
                      type="number"
                      value={genMonto}
                      onChange={(e) => setGenMonto(e.target.value)}
                      placeholder="Ingrese el monto (ej. 150)"
                      className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-bik-blue font-semibold"
                      min="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">Si no especifica un monto, el pagador podrá ingresar la cantidad al escanear.</p>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-bik-blue hover:bg-blue-800 text-white font-bold py-3 rounded-lg flex items-center justify-center transition-colors shadow-md active:scale-95 mt-6"
                  >
                    <QrCode size={18} className="mr-2" />
                    Generar Código de Cobro
                  </button>
                </form>
              ) : (
                <div className="text-center py-6 space-y-6">
                  <div className="bg-white p-6 rounded-2xl inline-block shadow-lg border border-gray-100">
                    <img src={generatedQrUrl} alt="BIK QR Code" className="w-64 h-64 mx-auto" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-base font-bold text-gray-900 dark:text-white">Código Listo para Cobro</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Comparte esta imagen con la persona que te va a pagar. El pago se acreditará de inmediato.</p>
                  </div>
                  <div className="flex gap-4 max-w-sm mx-auto">
                    <button
                      onClick={handleDownloadQr}
                      className="flex-1 bg-bik-blue hover:bg-blue-800 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center transition-all duration-300 shadow active:scale-95"
                    >
                      <Download size={18} className="mr-2" />
                      Descargar QR
                    </button>
                    <button
                      onClick={() => {
                        setGeneratedQrUrl('');
                        setGenMonto('');
                      }}
                      className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 active:scale-95"
                    >
                      Nuevo Código
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'historial' && (
            <div key="historial" className="animate-slide-up">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Pagos QR Recientes</h3>
                <button 
                  onClick={fetchQrHistory}
                  disabled={loadingHistory}
                  className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <RefreshCw size={18} className={loadingHistory ? 'animate-spin' : ''} />
                </button>
              </div>

              {loadingHistory ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bik-blue"></div>
                </div>
              ) : qrTransactions.length === 0 ? (
                <div className="text-center py-12">
                  <History size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                  <h4 className="text-base font-bold text-gray-900 dark:text-white">Sin transacciones QR</h4>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Aún no has enviado ni recibido pagos mediante códigos QR.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {qrTransactions.map((tx) => {
                    const isSender = cuentas.some(c => c._id === tx.cuentaOrigenId?._id || c.numeroCuenta === tx.cuentaOrigenId?.numeroCuenta);
                    return (
                      <div key={tx._id} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700/40 border border-gray-100 dark:border-gray-700/50 rounded-xl transition-all hover:scale-[1.01]">
                        <div className="flex items-center gap-3">
                          <div className={`p-2.5 rounded-lg flex items-center justify-center ${isSender ? 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400' : 'bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400'}`}>
                            <QrCode size={20} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                              {isSender ? 'Pago Realizado' : 'Cobro Recibido'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                              {isSender 
                                ? `Destino: ${tx.cuentaDestinoId?.numeroCuenta || 'Externa'}` 
                                : `Origen: ${tx.cuentaOrigenId?.numeroCuenta || 'Externa'}`
                              } • {new Date(tx.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <p className={`text-base font-extrabold ${isSender ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                          {isSender ? '-' : '+'} {formatCurrency(tx.monto)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={isConfirmModalOpen} onClose={() => setConfirmModalOpen(false)} title="Confirmar Pago QR">
        <form onSubmit={handleConfirmPay} className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30 space-y-2">
            <div className="flex justify-between">
              <span className="text-xs text-gray-500 dark:text-gray-400">Titular de Destino</span>
              <span className="text-xs font-bold text-gray-900 dark:text-white">{cuentaDestinoTitular}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-500 dark:text-gray-400">Cuenta de Destino</span>
              <span className="text-xs font-mono font-bold text-gray-900 dark:text-white">{cuentaDestinoNum}</span>
            </div>
            <div className="flex justify-between border-t border-blue-200/50 dark:border-blue-800/30 pt-2 mt-2">
              <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Monto a Debitar</span>
              <span className="text-base font-extrabold text-bik-blue dark:text-blue-400">{formatCurrency(monto)}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Cuenta de Origen (Fondos)</label>
            <select
              value={cuentaOrigenId}
              onChange={(e) => setCuentaOrigenId(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-bik-blue font-semibold"
              required
            >
              <option value="">Seleccione su cuenta...</option>
              {cuentas.filter(c => !c.isCard).map(c => (
                <option key={c._id} value={c._id}>{c.numeroCuenta} — {c.tipo} ({formatCurrency(c.saldo, c.moneda)})</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading || !cuentaOrigenId}
            className="w-full bg-bik-blue hover:bg-blue-700 text-white font-bold py-3.5 rounded-lg transition-all shadow mt-6 disabled:opacity-50 active:scale-95"
          >
            {loading ? 'Procesando Pago...' : 'Confirmar y Pagar'}
          </button>
        </form>
      </Modal>
    </div>
  );
};