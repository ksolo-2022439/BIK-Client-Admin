import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, User, Loader2 } from 'lucide-react';
import { useClientsStore } from './store/clientsStore';
import Swal from 'sweetalert2';

/**
 * Vista del panel administrativo para dar de alta nuevos clientes de forma directa.
 */
export const CreateClientView = () => {
  const navigate = useNavigate();
  const { addClient } = useClientsStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    dpi: '',
    email: '',
    telefono: '',
    password: '',
    fechaNacimiento: '',
    ingresosMensuales: 0,
    departamento: 'Guatemala',
    municipio: 'Guatemala',
    zona: '1',
    detalle: 'Ciudad de Guatemala'
  });

  /**
   * Actualiza el estado local de los campos del formulario.
   * 
   * @param {Object} e - Evento de cambio del input.
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  /**
   * Realiza las validaciones y envía la solicitud de creación de cliente con placeholders biométricos predeterminados.
   * 
   * @param {Object} e - Evento de envío del formulario.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.dpi.length !== 13) {
      return Swal.fire('Error', 'El DPI debe tener 13 dígitos.', 'error');
    }

    if (Number(formData.ingresosMensuales) < 0) {
      return Swal.fire('Error', 'Los ingresos mensuales no pueden ser negativos.', 'error');
    }

    try {
      setLoading(true);
      
      const payload = {
        ...formData,
        direccion: {
          departamento: formData.departamento,
          municipio: formData.municipio,
          zona: formData.zona,
          detalle: formData.detalle
        },
        fotoDpiAdelanteUrl: 'https://res.cloudinary.com/demo/image/upload/v1/sample.jpg',
        fotoDpiAtrasUrl: 'https://res.cloudinary.com/demo/image/upload/v1/sample.jpg',
        fotoRostroUrl: 'https://res.cloudinary.com/demo/image/upload/v1/sample.jpg'
      };

      const success = await addClient(payload);
      
      if (success) {
        await Swal.fire('Éxito', 'Cliente registrado correctamente en el sistema.', 'success');
        navigate('/clientes');
      } else {
        Swal.fire('Error', 'Error al registrar el cliente.', 'error');
      }
    } catch (error) {
      console.error('Error creating client:', error);
      Swal.fire('Error', error.message || 'Error al registrar el cliente.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/clientes')}
          className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Alta de Nuevo Cliente</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Registra un nuevo usuario en el sistema bancario</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
          <div className="w-10 h-10 rounded-full bg-bik-blue/10 flex items-center justify-center">
            <User size={20} className="text-bik-blue" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Datos del Cliente</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nombres</label>
              <input 
                name="nombres"
                value={formData.nombres}
                onChange={handleChange}
                required
                type="text" 
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-bik-blue transition-all dark:text-white" 
                placeholder="Nombres completos" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Apellidos</label>
              <input 
                name="apellidos"
                value={formData.apellidos}
                onChange={handleChange}
                required
                type="text" 
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-bik-blue transition-all dark:text-white" 
                placeholder="Apellidos completos" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">DPI (13 dígitos)</label>
              <input 
                name="dpi"
                value={formData.dpi}
                onChange={handleChange}
                required
                type="text" 
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-bik-blue transition-all dark:text-white" 
                placeholder="13 dígitos" 
                maxLength={13} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Correo Electrónico</label>
              <input 
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                type="email" 
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-bik-blue transition-all dark:text-white" 
                placeholder="correo@ejemplo.com" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Teléfono</label>
              <input 
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                required
                type="text" 
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-bik-blue transition-all dark:text-white" 
                placeholder="8 dígitos" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fecha de Nacimiento</label>
              <input 
                name="fechaNacimiento"
                value={formData.fechaNacimiento}
                onChange={handleChange}
                required
                type="date" 
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-bik-blue transition-all dark:text-white" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Contraseña Inicial</label>
              <input 
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                type="password" 
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-bik-blue transition-all dark:text-white" 
                placeholder="Min. 8 caracteres" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ingresos Mensuales</label>
              <input 
                name="ingresosMensuales"
                value={formData.ingresosMensuales}
                onChange={handleChange}
                required
                type="number" 
                min="0"
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-bik-blue transition-all dark:text-white" 
                placeholder="0.00" 
              />
            </div>
          </div>

          <div className="pt-4 mt-6 border-t border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Dirección</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Departamento</label>
                <input 
                  name="departamento"
                  value={formData.departamento}
                  onChange={handleChange}
                  required
                  type="text" 
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-bik-blue transition-all dark:text-white" 
                  placeholder="Ej. Guatemala" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Municipio</label>
                <input 
                  name="municipio"
                  value={formData.municipio}
                  onChange={handleChange}
                  required
                  type="text" 
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-bik-blue transition-all dark:text-white" 
                  placeholder="Ej. Mixco" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Zona</label>
                <input 
                  name="zona"
                  value={formData.zona}
                  onChange={handleChange}
                  required
                  type="text" 
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-bik-blue transition-all dark:text-white" 
                  placeholder="Ej. 10" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Detalle (Calle, Avenida, Casa)</label>
                <input 
                  name="detalle"
                  value={formData.detalle}
                  onChange={handleChange}
                  required
                  type="text" 
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-bik-blue transition-all dark:text-white" 
                  placeholder="1ra Calle 2-34" 
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t border-gray-100 dark:border-gray-700 gap-4">
            <button 
              type="button" 
              onClick={() => navigate('/clientes')} 
              className="px-6 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={loading} 
              className="flex items-center gap-2 px-6 py-2.5 bg-bik-blue hover:bg-blue-800 text-white font-medium rounded-lg transition-colors shadow-md disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              Guardar Cliente
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
