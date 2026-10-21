import { describe, it, expect } from 'vitest';
import { getUserModules, normalizeRoles } from '../utils/roleModules';

const paths = (roles) => getUserModules({ roles }).map(m => m.path);

describe('módulos según el rol', () => {
    it('un rol abre su módulo', () => {
        expect(paths(['medico_general'])).toEqual(['/medicina-general']);
        expect(paths(['paciente'])).toEqual(['/estudiante']);
    });

    it('un usuario multirol obtiene varios módulos', () => {
        expect(paths(['medico_general', 'medico_coordinador'])).toEqual(['/medicina-general', '/administrador']);
    });

    it('administrador y coordinador comparten un único módulo', () => {
        expect(paths(['administrador', 'medico_coordinador'])).toEqual(['/administrador']);
    });

    it('acepta roles como objetos y sin roles no da acceso', () => {
        expect(normalizeRoles([{ name: 'Odontologo' }])).toEqual(['odontologo']);
        expect(paths([])).toEqual([]);
        expect(getUserModules(null)).toEqual([]);
    });
});
