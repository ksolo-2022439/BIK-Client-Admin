import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { getReadableError } from '../../shared/utils/errorMessages';
import {
  User, Mail, Lock, Phone, IdCard, Calendar,
  MapPin, DollarSign, Camera, Loader2, AlertCircle, CheckCircle
} from 'lucide-react';

/**
 * Vista de registro integral de BIK.
 * Captura datos demográficos, geográficos, financieros y biométricos.
 * Se comunica con BIK-Server-Admin (Node.js), el cual delega la seguridad a C#.
 */
export const RegisterView = () => {
  const navigate = useNavigate();
  const { register, loading: isLoading, error: storeError } = useAuthStore();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    dpi: '',
    fechaNacimiento: '',
    email: '',
    password: '',
    telefono: '',
    ingresosMensuales: '',
    direccion: {
      departamento: '',
      municipio: '',
      zona: '',
      detalle: ''
    },
    fotoDpiAdelanteUrl: 'https://cdn.bik-bank.com/placeholder-dpi-front.png',
    fotoDpiAtrasUrl: 'https://cdn.bik-bank.com/placeholder-dpi-back.png',
    fotoRostroUrl: 'https://cdn.bik-bank.com/placeholder-face.png'
  });

  /**
   * Sincroniza los cambios de inputs de primer nivel y estructuras anidadas de la dirección en el estado.
   * 
   * @param {Object} e - Evento de cambio del input.
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: { ...formData[parent], [child]: value }
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  /**
   * Envía los datos capturados hacia el servicio de registro de usuarios de BIK.
   * 
   * @param {Object} e - Evento de envío de formulario.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(formData);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.message || 'Error al procesar el registro. Intente de nuevo.');
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl text-center animate-fade-in">
        <div className="flex justify-center mb-4 text-green-500">
          <CheckCircle size={64} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">¡Registro Exitoso!</h2>
        <p className="text-gray-500 dark:text-gray-400">Tu perfil ha sido creado y está en proceso de verificación administrativa.</p>
        <p className="text-bik-blue mt-4 font-semibold italic">Redirigiendo al login...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8 my-8 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Únete a BIK</h2>
        <p className="text-gray-500 dark:text-gray-400">Completa tu solicitud de cuenta bancaria digital</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center text-red-600 dark:text-red-400">
          <AlertCircle size={20} className="mr-2" />
          <span className="text-sm font-medium">{getReadableError(error)}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Sección: Información Personal */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-bik-blue dark:text-blue-400 border-b pb-2">Información Personal</h3>
          <div className="grid grid-cols-2 gap-4">
            <input name="nombres" placeholder="Nombres" required onChange={handleChange} className="input-field" />
            <input name="apellidos" placeholder="Apellidos" required onChange={handleChange} className="input-field" />
          </div>
          <div className="relative">
            <IdCard className="absolute left-3 top-3 text-gray-400" size={18} />
            <input name="dpi" placeholder="DPI (13 dígitos)" required onChange={handleChange} className="input-field pl-10" maxLength={13} />
          </div>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 text-gray-400" size={18} />
            <input name="fechaNacimiento" type="date" required onChange={handleChange} className="input-field pl-10" />
          </div>
        </div>

        {/* Sección: Ubicación */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-bik-blue dark:text-blue-400 border-b pb-2">Ubicación</h3>
          <div className="grid grid-cols-2 gap-4">
            <input name="direccion.departamento" placeholder="Departamento" required onChange={handleChange} className="input-field" />
            <input name="direccion.municipio" placeholder="Municipio" required onChange={handleChange} className="input-field" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <input name="direccion.zona" placeholder="Zona" required onChange={handleChange} className="input-field" />
            <div className="col-span-2 relative">
              <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
              <input name="direccion.detalle" placeholder="Dirección exacta (Calle/Ave/Casa)" required onChange={handleChange} className="input-field pl-10" />
            </div>
          </div>
        </div>

        {/* Sección: Contacto y Seguridad */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-bik-blue dark:text-blue-400 border-b pb-2">Contacto y Seguridad</h3>
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
            <input name="email" type="email" placeholder="Correo Electrónico" required onChange={handleChange} className="input-field pl-10" />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
            <input name="password" type="password" placeholder="Contraseña de Banca" required onChange={handleChange} className="input-field pl-10" />
          </div>
          <div className="relative">
            <Phone className="absolute left-3 top-3 text-gray-400" size={18} />
            <input name="telefono" placeholder="Número de Teléfono" required onChange={handleChange} className="input-field pl-10" />
          </div>
        </div>

        {/* Sección: Financiero y Verificación */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-bik-blue dark:text-blue-400 border-b pb-2">Verificación</h3>
          <div className="relative">
            <DollarSign className="absolute left-3 top-3 text-gray-400" size={18} />
            <input name="ingresosMensuales" type="number" min="0" placeholder="Ingresos Mensuales (GTQ)" required onChange={handleChange} className="input-field pl-10" />
          </div>
          <div className="grid grid-cols-1 gap-2 text-xs text-gray-500 dark:text-gray-400">
            <p className="flex items-center"><Camera size={14} className="mr-1" /> Se requerirá carga de DPI y rostro tras el envío.</p>
            <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-dashed border-gray-300 dark:border-gray-600">
              <p>Simulación: Fotografías listas para procesamiento biométrico.</p>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 mt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-bik-blue hover:bg-blue-800 text-white font-bold py-4 rounded-xl flex items-center justify-center transition-all shadow-lg active:scale-95 disabled:opacity-70"
          >
            {isLoading ? <Loader2 size={24} className="animate-spin mr-2" /> : null}
            {isLoading ? 'Procesando Solicitud...' : 'Enviar Solicitud de Apertura'}
          </button>

          <p className="text-center mt-6 text-gray-600 dark:text-gray-400 text-sm">
            ¿Ya tienes una cuenta?{' '}
            <Link to="/login" className="text-bik-orange font-bold hover:underline">Inicia Sesión</Link>
          </p>
        </div>
      </form>

      <style jsx>{`
        .input-field {
          width: 100%;
          padding: 0.75rem;
          background-color: transparent;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          color: #111827;
          font-size: 0.875rem;
          transition: all 0.2s;
        }
        
        .input-field.pl-10 {
          padding-left: 2.5rem !important; 
        }

        :global(.dark) .input-field {
          border-color: #374151;
          color: #f9fafb;
        }
        .input-field:focus {
          outline: none;
          border-color: #003366;
          box-shadow: 0 0 0 2px rgba(0, 51, 102, 0.1);
        }
      `}</style>
    </div>
  );
};