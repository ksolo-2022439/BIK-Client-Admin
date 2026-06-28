import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { ClientSidebar } from '../../shared/components/ClientSidebar';
import { ClientTopBar } from '../../shared/components/ClientTopBar';

/**
 * Layout principal de la banca en línea de clientes.
 * Estructura: ClientSidebar + ClientTopBar + Outlet de contenido.
 */
export const ClientLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      
      {/* Overlay oscuro para móviles cuando el menú está abierto */}
      <div 
        className={`fixed inset-0 z-20 transition-opacity duration-300 lg:hidden ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} 
        onClick={toggleMobileMenu}
      >
        <div className="absolute inset-0 bg-black/50"></div>
      </div>
      
      {/* Barra lateral (Sidebar de cliente) */}
      <div className={`fixed inset-y-0 left-0 z-30 transform transition-transform duration-300 lg:relative lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <ClientSidebar />
      </div>

      {/* Contenedor Principal */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        <ClientTopBar toggleMobileMenu={toggleMobileMenu} />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-800 p-4 md:p-6 transition-colors duration-300">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
