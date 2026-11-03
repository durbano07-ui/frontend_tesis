import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import ReporteEncabezado, { ListaRegistros } from '../components/ReporteEncabezado';

describe('encabezado común de los reportes', () => {
    afterEach(cleanup);

    it('muestra período, subpestañas y resumen, y avisa al cambiar de pestaña', () => {
        const onTab = vi.fn();
        const onPeriodo = vi.fn();
        render(
            <ReporteEncabezado
                titulo="Fichas"
                periodo={{ tipo: 'mes', mes: 10, anio: 2026, dia: '2026-10-25' }}
                onPeriodo={onPeriodo}
                que="de las fichas"
                tabs={[{ id: 'ingreso', label: 'Ingreso' }, { id: 'cese', label: 'Retiro' }]}
                tabActiva="ingreso"
                onTab={onTab}
                estado="2 fichas emitidas en octubre de 2026"
            />
        );
        expect(screen.getByRole('button', { name: 'Ingreso' }).getAttribute('aria-pressed')).toBe('true');
        expect(screen.getByRole('status').textContent).toBe('2 fichas emitidas en octubre de 2026');

        fireEvent.click(screen.getByRole('button', { name: 'Retiro' }));
        expect(onTab).toHaveBeenCalledWith('cese');

        fireEvent.click(screen.getByRole('button', { name: 'Por día' }));
        expect(onPeriodo).toHaveBeenCalledWith(expect.objectContaining({ tipo: 'dia' }));
    });

    it('el selector muestra solo el nombre del paciente y permite cambiarlo', () => {
        const onSeleccionar = vi.fn();
        render(<ListaRegistros items={[
            { id: 3, titulo: 'Luis Bayas', fecha: '2026-10-25' },
            { id: 4, titulo: 'Ana Paz', fecha: '2026-10-26' }
        ]} seleccionado={3} onSeleccionar={onSeleccionar} />);
        expect(screen.getByRole('option', { name: 'Luis Bayas' })).toBeTruthy();
        fireEvent.change(screen.getByRole('combobox'), { target: { value: '4' } });
        expect(onSeleccionar).toHaveBeenCalledWith(4);
    });

    it('si el nombre se repite, la opción lleva la fecha', () => {
        render(<ListaRegistros items={[
            { id: 1, titulo: 'Luis Bayas', fecha: '2026-10-25' },
            { id: 2, titulo: 'Luis Bayas', fecha: '2026-10-27' }
        ]} seleccionado={1} onSeleccionar={() => {}} />);
        expect(screen.getByRole('option', { name: 'Luis Bayas — 27/10/2026' })).toBeTruthy();
    });
});
