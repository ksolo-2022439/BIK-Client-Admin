import axios from 'axios';

/**
 * Instancia global de Axios preconfigurada para apuntar al BIK-Server-Admin (Node.js).
 * Utiliza variables de entorno para facilitar la orquestación en contenedores.
 */
export const bikApi = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
});

/**
 * Interceptor de Peticiones.
 * Extrae el token de seguridad del almacenamiento local y lo inyecta en la cabecera de autorización.
 * Usa claves separadas (bik_admin_*) para evitar conflictos con la sesión de Client-User.
 */
bikApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('bik_admin_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * Interceptor de Respuestas.
 * Maneja errores globales, como la expiración del token (401) o acceso denegado (403).
 */
bikApi.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            if (error.response.status === 401) {
                // Token expirado o inválido
                localStorage.removeItem('bik_admin_token');
                localStorage.removeItem('bik_admin_user');
                localStorage.removeItem('bik_admin_rol');
                window.location.href = '/login';
            }
            // 403 se maneja en cada componente según el contexto
        }
        return Promise.reject(error);
    }
);
