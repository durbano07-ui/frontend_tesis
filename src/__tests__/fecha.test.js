import { describe, it, expect } from 'vitest';
import { formatFecha } from '../utils/fecha';

describe('formato de fechas en reportes', () => {
    it('convierte la fecha de la API (UTC) sin desfasar el día', () => {
        expect(formatFecha('2026-10-25T05:00:00.000000Z')).toBe('25/10/2026');
    });

    it('acepta fechas simples y valores vacíos', () => {
        expect(formatFecha('2026-01-07')).toBe('07/01/2026');
        expect(formatFecha(null)).toBe('');
        expect(formatFecha('')).toBe('');
        expect(formatFecha('Todas las fechas')).toBe('Todas las fechas');
    });
});
