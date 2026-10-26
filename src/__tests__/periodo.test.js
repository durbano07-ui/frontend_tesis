import { describe, it, expect } from 'vitest';
import { enPeriodo, describirPeriodo } from '../utils/periodo';

describe('período de los reportes', () => {
    const octubre = { tipo: 'mes', mes: 10, anio: 2026, dia: '2026-10-25' };
    const dia = { ...octubre, tipo: 'dia' };

    it('por mes incluye todo el mes y nada más', () => {
        expect(enPeriodo('2026-10-01', octubre)).toBe(true);
        expect(enPeriodo('2026-10-31T05:00:00.000000Z', octubre)).toBe(true);
        expect(enPeriodo('2026-09-30', octubre)).toBe(false);
        expect(enPeriodo('2025-10-15', octubre)).toBe(false);
    });

    it('por día solo esa fecha', () => {
        expect(enPeriodo('2026-10-25', dia)).toBe(true);
        expect(enPeriodo('2026-10-24', dia)).toBe(false);
    });

    it('un registro sin fecha no entra en ningún período', () => {
        expect(enPeriodo('', octubre)).toBe(false);
        expect(enPeriodo(null, dia)).toBe(false);
    });

    it('describe el período para los mensajes', () => {
        expect(describirPeriodo(octubre)).toBe('en octubre de 2026');
        expect(describirPeriodo(dia)).toBe('el 25/10/2026');
    });
});
