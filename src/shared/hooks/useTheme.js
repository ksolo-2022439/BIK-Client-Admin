import { useState, useEffect } from 'react';

/**
 * Hook para gestionar el tema de la aplicación admin.
 * Sincroniza la selección en el almacenamiento local y actualiza el DOM de forma reactiva.
 * Usa clave separada (admin_theme) para no interferir con Client-User.
 */
export const useTheme = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('admin_theme') === 'dark');

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('admin_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('admin_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  return { isDarkMode, toggleTheme };
};
