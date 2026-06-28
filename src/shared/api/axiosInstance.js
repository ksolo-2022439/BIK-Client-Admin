import axios from 'axios';

/**
 * Instancia global de Axios preconfigurada para apuntar al BIK-Server-Admin (Node.js).
 * Utiliza variables de entorno para facilitar la orquestación en contenedores.
 */
export const bikApi = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
});

/**
 * Instancia global de Axios preconfigurada para apuntar al BIK-Auth-Service (C#).
 */
export const bikAuthApi = axios.create({
    baseURL: import.meta.env.VITE_AUTH_API_URL || 'http://localhost:5213/api'
});

/**
 * Interceptor de Peticiones.
 * Extrae el token de seguridad del almacenamiento local de Zustand o del token manual e inyecta la cabecera Bearer.
 */
bikApi.interceptors.request.use(
    (config) => {
        let token = null;
        
        const authStorage = localStorage.getItem('bik-auth-storage');
        if (authStorage) {
            try {
                const parsed = JSON.parse(authStorage);
                token = parsed.state?.token;
            } catch (e) {
                console.warn("Error al parsear el almacenamiento de autenticación");
            }
        }

        if (!token) {
            token = localStorage.getItem('bik_token');
        }

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
 * Controla de forma reactiva las excepciones de seguridad (401 Expirado) purgando credenciales y redirigiendo al Login.
 */
bikApi.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            if (error.response.status === 401) {
                localStorage.removeItem('bik-auth-storage');
                localStorage.removeItem('bik_token');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);
