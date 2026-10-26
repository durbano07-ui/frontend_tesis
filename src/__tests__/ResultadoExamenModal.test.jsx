import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import ResultadoExamenModal from '../pages/occupational/ResultadoExamenModal';

const api = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }));
vi.mock('../api/axios', () => ({ default: api }));

const paciente = { id: 7, nombre_completo: 'Luis Bayas', cedula: '0201864329' };
const orden = { id: 31, fecha: '2026-10-20', observaciones: 'Control anual', tipos_examen: [{ tipo_examen: { detalle_tipo: 'Biometría hemática' } }], otros: [] };

const elegirPaciente = async () => {
    render(<ResultadoExamenModal onClose={() => {}} onUploaded={() => {}} />);
    fireEvent.change(screen.getByRole('textbox', { name: 'Buscar paciente por cédula o nombre' }), { target: { value: '0201' } });
    fireEvent.click(await screen.findByRole('button', { name: /Luis Bayas/ }));
};

describe('subir resultado de exámenes', () => {
    beforeEach(() => {
        api.get.mockImplementation((url) => Promise.resolve({ data: { data: url.includes('search-by-cedula') ? [paciente] : [orden] } }));
        api.post.mockResolvedValue({ data: {} });
    });
    afterEach(() => { cleanup(); vi.clearAllMocks(); });

    it('muestra las órdenes del paciente que aún no tienen resultado', async () => {
        await elegirPaciente();
        expect(await screen.findByText(/Orden N° 31/)).toBeTruthy();
        expect(screen.getByText('Biometría hemática')).toBeTruthy();
        expect(api.get).toHaveBeenCalledWith('/medicina-ocupacional/orden-examen', { params: { id_usuario_paciente: 7, sin_resultado: 1 } });
    });

    it('adjunta el PDF a la orden elegida', async () => {
        await elegirPaciente();
        const input = await screen.findByLabelText('Adjuntar PDF de resultados a la orden 31');
        const pdf = new File(['%PDF-1.4'], 'biometria.pdf', { type: 'application/pdf' });
        fireEvent.change(input, { target: { files: [pdf] } });

        await waitFor(() => expect(api.post).toHaveBeenCalled());
        const [url, data, config] = api.post.mock.calls[0];
        expect(url).toBe('/medicina-ocupacional/orden-examen/31/resultado');
        expect(data.get('archivo').name).toBe('biometria.pdf');
        expect(config.headers['Content-Type']).toBe('multipart/form-data');
        expect(await screen.findByText(/biometria.pdf/)).toBeTruthy();
    });

    it('rechaza archivos que no son PDF sin enviarlos', async () => {
        await elegirPaciente();
        const input = await screen.findByLabelText('Adjuntar PDF de resultados a la orden 31');
        fireEvent.change(input, { target: { files: [new File(['x'], 'foto.png', { type: 'image/png' })] } });

        expect(await screen.findByRole('alert')).toHaveProperty('textContent', 'Seleccione un archivo PDF.');
        expect(api.post).not.toHaveBeenCalled();
    });
});
