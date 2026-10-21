import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore, getAuthToken } from '../stores/authStore';

// OWASP ASVS V3.2.3 / V8.2.2 / V8.2.3
describe('sesión en el navegador', () => {
    beforeEach(() => { sessionStorage.clear(); localStorage.clear(); });

    it('guarda el token en sessionStorage, no en localStorage', () => {
        useAuthStore.getState().login({ id: 1, roles: ['medico_general'] }, 'token-123');
        expect(getAuthToken()).toBe('token-123');
        expect(sessionStorage.getItem('auth_token')).toBe('token-123');
        expect(localStorage.getItem('auth_token')).toBeNull();
    });

    it('al cerrar sesión borra el token y los borradores clínicos', () => {
        useAuthStore.getState().login({ id: 1 }, 'token-123');
        sessionStorage.setItem('bu_draft_medicina_doc1_pat2', '{"diagnostico":"x"}');
        localStorage.setItem('bu_draft_antiguo_doc1_pat3', '{"x":1}');

        useAuthStore.getState().logout();

        expect(getAuthToken()).toBeNull();
        expect(sessionStorage.getItem('bu_draft_medicina_doc1_pat2')).toBeNull();
        expect(localStorage.getItem('bu_draft_antiguo_doc1_pat3')).toBeNull();
        expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });
});
