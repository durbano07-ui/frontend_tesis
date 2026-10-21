import { create } from 'zustand';

/**
 * Sesión del usuario.
 *
 * OWASP ASVS 4.0.3:
 *  - V3.2.3 / V8.2.2: el token y los datos del usuario se guardan en sessionStorage
 *    (se borran al cerrar la pestaña y no se comparten con otras), no en localStorage.
 *  - V8.2.3: al cerrar sesión se elimina todo dato autenticado del navegador,
 *    incluidos los borradores clínicos.
 */
const storage = window.sessionStorage;

export const DRAFT_PREFIX = 'bu_draft_';

const read = (key) => {
    try { return storage.getItem(key); } catch { return null; }
};

const readJson = (key) => {
    try { return JSON.parse(read(key)) || null; } catch { return null; }
};

const write = (key, value) => {
    try { storage.setItem(key, value); } catch { /* almacenamiento no disponible */ }
};

// Elimina los datos de sesión y los borradores clínicos (también los que hubieran
// quedado en localStorage de versiones anteriores de la aplicación)
export const clearSessionData = () => {
    for (const store of [window.sessionStorage, window.localStorage]) {
        try {
            ['auth_token', 'auth_user', 'auth_must_change_password', 'auth_last_activity'].forEach((k) => store.removeItem(k));
            Object.keys(store).filter((k) => k.startsWith(DRAFT_PREFIX)).forEach((k) => store.removeItem(k));
        } catch { /* almacenamiento no disponible */ }
    }
};

// Limpieza única de datos sensibles que versiones anteriores dejaban en localStorage
try {
    if (window.localStorage.getItem('auth_token') || Object.keys(window.localStorage).some((k) => k.startsWith(DRAFT_PREFIX))) {
        ['auth_token', 'auth_user', 'auth_must_change_password', 'auth_last_activity'].forEach((k) => window.localStorage.removeItem(k));
        Object.keys(window.localStorage).filter((k) => k.startsWith(DRAFT_PREFIX)).forEach((k) => window.localStorage.removeItem(k));
    }
} catch { /* almacenamiento no disponible */ }

export const getAuthToken = () => read('auth_token');

export const useAuthStore = create((set) => ({
    user: readJson('auth_user'),
    token: read('auth_token'),
    isAuthenticated: !!read('auth_token'),
    mustChangePassword: read('auth_must_change_password') === 'true',

    login: (user, token, mustChangePassword = false) => {
        write('auth_token', token);
        write('auth_user', JSON.stringify(user));
        write('auth_must_change_password', String(!!mustChangePassword));
        set({ user, token, isAuthenticated: true, mustChangePassword: !!mustChangePassword });
    },

    logout: () => {
        clearSessionData();
        set({ user: null, token: null, isAuthenticated: false, mustChangePassword: false });
    },

    updateUser: (user) => {
        write('auth_user', JSON.stringify(user));
        set({ user });
    },

    setMustChangePassword: (value) => {
        write('auth_must_change_password', String(!!value));
        set({ mustChangePassword: !!value });
    }
}));
