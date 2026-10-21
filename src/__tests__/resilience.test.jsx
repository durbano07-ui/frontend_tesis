import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, act, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ErrorBoundary from '../components/ErrorBoundary';
import A11yShell from '../components/A11yShell';

// ISO/IEC 25010 — Fiabilidad
describe('tolerancia a fallos de la interfaz', () => {
    afterEach(() => cleanup());

    it('un componente que falla muestra un mensaje de recuperación, no una pantalla en blanco', () => {
        const Roto = () => { throw new Error('dato inválido'); };
        vi.spyOn(console, 'error').mockImplementation(() => {});

        render(<ErrorBoundary><Roto /></ErrorBoundary>);

        expect(screen.getByRole('alert').textContent).toContain('Algo salió mal');
        expect(screen.getByRole('button', { name: 'Recargar la página' })).toBeTruthy();
    });

    it('avisa al usuario cuando el servidor no responde', () => {
        render(<MemoryRouter initialEntries={['/login']}><A11yShell><p>contenido</p></A11yShell></MemoryRouter>);

        act(() => { window.dispatchEvent(new CustomEvent('api:unavailable', { detail: { offline: true } })); });

        expect(screen.getByRole('alert').textContent).toContain('No se pudo conectar con el servidor');
    });

    it('pone título a la página según la ruta (WCAG 2.4.2)', () => {
        render(<MemoryRouter initialEntries={['/psicologia']}><A11yShell><p>x</p></A11yShell></MemoryRouter>);
        expect(document.title).toBe('Psicología | Bienestar Universitario UEB');
    });
});
