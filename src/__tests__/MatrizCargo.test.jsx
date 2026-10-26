import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import MatrizRegistroModal from '../pages/occupational/MatrizRegistroModal';

const api = vi.hoisted(() => ({ get: vi.fn(), put: vi.fn(), post: vi.fn() }));
vi.mock('../api/axios', () => ({ default: api }));

const docente = { id: 7, nombres: 'Ana', apellidos: 'Paz', cedula: '0201111111', id_tipo_usuario: 3, tipo_usuario_confirmado: true, puestoTrabajo: 'Personal Docente' };
const sinCargo = { id: 8, nombres: 'Luis', apellidos: 'Mora', cedula: '0202222222', id_tipo_usuario: null, tipo_usuario_confirmado: false, puestoTrabajo: 'Sin confirmar' };

const abrirYElegir = async (paciente) => {
    api.get.mockResolvedValue({ data: { data: [paciente] } });
    render(<MatrizRegistroModal matrizKey="personal_nuevo" today="2026-10-25" onClose={() => {}} onSaved={() => {}} />);
    fireEvent.change(screen.getByRole('textbox', { name: 'Buscar por cédula o nombre' }), { target: { value: '020' } });
    fireEvent.click(await screen.findByRole('button', { name: new RegExp(paciente.nombres) }));
};

describe('cargo en las matrices ocupacionales', () => {
    beforeEach(() => {
        api.post.mockResolvedValue({ data: {} });
        api.put.mockResolvedValue({ data: { data: { puestoTrabajo: 'Personal Administrativo' } } });
    });
    afterEach(() => { cleanup(); vi.clearAllMocks(); });

    it('muestra el cargo registrado en el sistema sin permitir escribirlo', async () => {
        await abrirYElegir(docente);
        const cargo = screen.getByDisplayValue('Personal Docente');
        expect(cargo.readOnly).toBe(true);

        fireEvent.click(screen.getByRole('button', { name: /Guardar registro/ }));
        await waitFor(() => expect(api.post).toHaveBeenCalledWith('/medicina-ocupacional/personal-nuevo', expect.objectContaining({ cargo: 'PERSONAL DOCENTE', id_usuario_paciente: 7 })));
        expect(api.put).not.toHaveBeenCalled();
    });

    it('si el paciente no tiene cargo, el médico lo elige de la lista y se guarda en su perfil', async () => {
        await abrirYElegir(sinCargo);
        const select = screen.getByRole('combobox');
        expect([...select.options].map(o => o.textContent)).toEqual(['Seleccione el cargo...', 'Personal Docente', 'Personal Administrativo', 'Código de Trabajo']);

        fireEvent.change(select, { target: { value: '4' } });
        fireEvent.click(screen.getByRole('button', { name: /Guardar registro/ }));

        await waitFor(() => expect(api.put).toHaveBeenCalledWith('/medicina-ocupacional/patient/8/tipo-trabajador', { id_tipo_usuario: 4 }));
        await waitFor(() => expect(api.post).toHaveBeenCalledWith('/medicina-ocupacional/personal-nuevo', expect.objectContaining({ cargo: 'PERSONAL ADMINISTRATIVO' })));
    });
});
