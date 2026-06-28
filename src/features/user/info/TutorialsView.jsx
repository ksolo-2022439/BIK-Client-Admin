import { PlayCircle, BookOpen, ChevronRight } from 'lucide-react';
import Swal from 'sweetalert2';

/**
 * Vista del centro de aprendizaje interactivo.
 * Proporciona guías paso a paso y videos tutoriales sobre el uso de la banca en línea.
 */
export const TutorialsView = () => {
  const tutoriales = [
    { titulo: "Aprende a realizar Transferencias Móviles", tipo: "Video", duracion: "2:30 min", contenido: "En este video, aprenderás cómo usar la función de transferencias móviles enviando dinero a través de un número de teléfono de forma rápida y segura." },
    { titulo: "Cómo configurar el Token Biométrico", tipo: "Guía", duracion: "5 pasos", contenido: "1. Ve a configuración.\n2. Selecciona Seguridad.\n3. Activa Token Biométrico.\n4. Escanea tu huella/rostro.\n5. Confirma tu PIN." },
    { titulo: "Bloqueo preventivo de tarjetas por viaje", tipo: "Video", duracion: "1:45 min", contenido: "Aprende a proteger tus tarjetas de crédito y débito bloqueándolas temporalmente si vas a viajar o no las vas a utilizar, previniendo fraudes." },
    { titulo: "Gestión y modificación de límites diarios", tipo: "Guía", duracion: "3 pasos", contenido: "1. Entra a Cuentas.\n2. Presiona Límites y Restricciones.\n3. Ajusta tu barra de límites diarios según tu preferencia." },
    { titulo: "Cómo cobrar una remesa internacional", tipo: "Video", duracion: "3:10 min", contenido: "Pasos detallados para canjear tu código MTCN y recibir tus remesas internacionales directamente en tu cuenta de ahorros o monetaria." }
  ];

  const handleOpenTutorial = (tutorial) => {
    if (tutorial.tipo === 'Video') {
      Swal.fire({
        title: tutorial.titulo,
        html: `
          <div style="background: #000; color: #fff; height: 200px; display: flex; align-items: center; justify-content: center; border-radius: 8px; margin-bottom: 15px;">
            <div style="text-align: center;">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 auto; color: #ccc;"><circle cx="12" cy="12" r="10"></circle><polygon points="10 8 16 12 10 16 10 8"></polygon></svg>
              <p style="margin-top: 10px; font-size: 14px;">Reproductor de Video Simulado</p>
            </div>
          </div>
          <p style="text-align: left; font-size: 14px; color: #555;">${tutorial.contenido}</p>
        `,
        confirmButtonText: 'Cerrar',
        confirmButtonColor: '#0052cc',
        width: '600px'
      });
    } else {
      Swal.fire({
        title: tutorial.titulo,
        html: `
          <div style="text-align: left; background: #f9f9f9; padding: 20px; border-radius: 8px; font-size: 14px; line-height: 1.6; color: #333; white-space: pre-line;">
            ${tutorial.contenido}
          </div>
        `,
        icon: 'info',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#0052cc'
      });
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto animate-fade-in pb-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">Tutoriales</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2 transition-colors duration-300">
          Aprende cómo utilizar BIK en línea de manera segura y eficiente.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
        {tutoriales.map((tutorial, index) => (
          <button 
            key={index}
            onClick={() => handleOpenTutorial(tutorial)}
            className="w-full flex justify-between items-center p-5 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left group"
          >
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-gray-100 dark:bg-gray-700 text-bik-blue dark:text-blue-400 rounded-lg group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 transition-colors">
                {tutorial.tipo === 'Video' ? <PlayCircle size={22} /> : <BookOpen size={22} />}
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1 group-hover:text-bik-blue dark:group-hover:text-blue-400 transition-colors">
                  {tutorial.titulo}
                </h3>
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {tutorial.tipo} • {tutorial.duracion}
                </span>
              </div>
            </div>
            <ChevronRight size={20} className="text-gray-400 group-hover:text-bik-blue dark:group-hover:text-blue-400 transition-colors flex-shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
};