import { describe, it, expect } from 'vitest';
import { VIAS_ADMINISTRACION, viaDeProducto } from '../utils/viasAdministracion';

describe('vía de administración tomada de Farmacia', () => {
    it('usa la vía que registró el farmacéutico', () => {
        expect(viaDeProducto({ via_administracion: 'Tópica' })).toBe('Tópica');
    });

    it('sin vía registrada (o con un valor fuera de la lista) la elige el médico', () => {
        expect(viaDeProducto({ via_administracion: null })).toBeNull();
        expect(viaDeProducto({ via_administracion: 'oral.' })).toBeNull();
        expect(viaDeProducto(null)).toBeNull();
    });

    it('la lista no tiene duplicados y empieza por Oral', () => {
        expect(new Set(VIAS_ADMINISTRACION).size).toBe(VIAS_ADMINISTRACION.length);
        expect(VIAS_ADMINISTRACION[0]).toBe('Oral');
    });
});
