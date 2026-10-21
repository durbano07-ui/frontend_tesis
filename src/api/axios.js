import axios from 'axios';
import { useAuthStore, getAuthToken } from '../stores/authStore';

const api = axios.create({
    // Base API URL configuration
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = getAuthToken();
        if (token && !config.headers.Authorization) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// El backend expira el token tras un tiempo sin peticiones (ExpireInactiveTokens).
// Se guarda la hora de la última respuesta para avisar al usuario antes de que ocurra.
export const LAST_ACTIVITY_KEY = 'auth_last_activity';

api.interceptors.response.use(
    (response) => {
        try { sessionStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now())); } catch { /* sin almacenamiento */ }
        return response;
    },
    (error) => {
        // ISO/IEC 25010 — Fiabilidad: los fallos de conexión y del servidor se notifican de forma
        // global (A11yShell). Antes algunos módulos mostraban listas vacías sin avisar.
        if (!error.response || error.response.status >= 500) {
            window.dispatchEvent(new CustomEvent('api:unavailable', {
                detail: { offline: !error.response, status: error.response?.status },
            }));
        }
        if (error.response && error.response.status === 401) {
            if (!window.location.pathname.endsWith('/login')) {
                useAuthStore.getState().logout();
                window.location.href = '/login?expired=true';
            }
        }
        // El backend bloquea las rutas protegidas hasta que el usuario cambie su contraseña temporal
        if (error.response?.status === 403 && error.response.data?.message === 'Password change required') {
            useAuthStore.getState().setMustChangePassword(true);
        }
        return Promise.reject(error);
    }
);

export default api;
