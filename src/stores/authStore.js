import { create } from 'zustand';

export const useAuthStore = create((set) => ({
    user: JSON.parse(localStorage.getItem('auth_user')) || null,
    token: localStorage.getItem('auth_token') || null,
    isAuthenticated: !!localStorage.getItem('auth_token'),
    mustChangePassword: localStorage.getItem('auth_must_change_password') === 'true',

    login: (user, token, mustChangePassword = false) => {
        localStorage.setItem('auth_token', token);
        localStorage.setItem('auth_user', JSON.stringify(user));
        localStorage.setItem('auth_must_change_password', String(!!mustChangePassword));
        set({ user, token, isAuthenticated: true, mustChangePassword: !!mustChangePassword });
    },

    logout: () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_must_change_password');
        set({ user: null, token: null, isAuthenticated: false, mustChangePassword: false });
    },

    updateUser: (user) => {
        localStorage.setItem('auth_user', JSON.stringify(user));
        set({ user });
    },

    setMustChangePassword: (value) => {
        localStorage.setItem('auth_must_change_password', String(!!value));
        set({ mustChangePassword: !!value });
    }
}));
