import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import TipoUsuarioModal from '../components/TipoUsuarioModal';
import { useAuthStore } from '../stores/authStore';

const api = vi.hoisted(() => ({ get: vi.fn(), put: vi.fn() }));
vi.mock('../api/axios', () => ({ default: api }));

const CATALOGOS = {
    tipos_usuario: [
        { id: 1, nombre: 'Médico' }, { id: 2, nombre: 'Estudiante' }, { id: 3, nombre: 'Docente' },
        { id: 4, nombre: 'Administrativo' }, { id: 5, nombre: 'Código de Trabajo' },
    ],
    facultades: [{ id: 10, nombre: 'CIENCIAS DE LA SALUD' }],
    carreras: [{ id: 100, nombre: 'ENFERMERÍA', id_facultad: 10 }],
    ciclos: [{ id: 5, numero: '5' }],
};

describe('confirmación del tipo de usuario del paciente', () => {
    beforeEach(() => {
        useAuthStore.setState({ user: { id: 1, roles: ['paciente'] } });
        api.get.mockImplementation((url) => Promise.resolve({
            data: url.includes('tipo-usuario-estado') ? { data: { requiere_confirmacion: true } } : CATALOGOS,
        }));
        api.put.mockResolvedValue({ data: {} });
    });
    afterEach(() => { cleanup(); vi.clearAllMocks(); });

    const tipoSelect = () => screen.getByRole('combobox', { name: 'Soy' });

    it('no ofrece el tipo "Médico" y no preselecciona ninguna opción', async () => {
        render(<TipoUsuarioModal />);
        await screen.findByRole('dialog');
        const opciones = [...tipoSelect().options].map(o => o.textContent);
        expect(opciones).not.toContain('Médico');
        expect(tipoSelect().value).toBe('');
    });

    it('al docente no le pide nada más y guarda solo el tipo', async () => {
        render(<TipoUsuarioModal />);
        await screen.findByRole('dialog');
        fireEvent.change(tipoSelect(), { target: { value: '3' } });

        expect(screen.queryByRole('combobox', { name: 'Carrera' })).toBeNull();
        fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }));

        await waitFor(() => expect(api.put).toHaveBeenCalledWith('/user-profile/tipo-usuario', { id_tipo_usuario: 3, id_carrera: null, id_ciclo: null }));
        await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    });

    it('al estudiante le exige carrera y ciclo', async () => {
        render(<TipoUsuarioModal />);
        await screen.findByRole('dialog');
        fireEvent.change(tipoSelect(), { target: { value: '2' } });

        const confirmar = screen.getByRole('button', { name: 'Confirmar' });
        expect(confirmar.disabled).toBe(true);

        fireEvent.change(screen.getByRole('combobox', { name: 'Carrera' }), { target: { value: '100' } });
        fireEvent.change(screen.getByRole('combobox', { name: 'Ciclo / semestre actual' }), { target: { value: '5' } });
        expect(confirmar.disabled).toBe(false);
        fireEvent.click(confirmar);

        await waitFor(() => expect(api.put).toHaveBeenCalledWith('/user-profile/tipo-usuario', { id_tipo_usuario: 2, id_carrera: 100, id_ciclo: 5 }));
    });

    it('no aparece si el paciente ya confirmó', async () => {
        api.get.mockResolvedValue({ data: { data: { requiere_confirmacion: false } } });
        render(<TipoUsuarioModal />);
        await waitFor(() => expect(api.get).toHaveBeenCalled());
        expect(screen.queryByRole('dialog')).toBeNull();
    });
});
