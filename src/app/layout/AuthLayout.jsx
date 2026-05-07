import { Outlet } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../shared/hooks/useTheme';

/**
 * Layout para las rutas públicas (login).
 * Incluye botón de toggle de tema y animación de entrada.
 */
export const AuthLayout = () => {
    const { isDarkMode, toggleTheme } = useTheme();

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex flex-col items-center justify-center p-6 transition-colors duration-300 relative">
            <button
                onClick={toggleTheme}
                className="absolute top-6 right-6 p-3 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full shadow-md hover:scale-110 transition-all duration-300"
            >
                {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
            </button>

            <div className="w-full flex justify-center animate-slide-up">
                <Outlet />
            </div>
        </div>
    );
};
