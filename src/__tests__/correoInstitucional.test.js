import { describe, it, expect } from 'vitest';
import { armarCorreo, separarCorreo, esCorreoInstitucional } from '../utils/correoInstitucional';

describe('correo institucional', () => {
    it('completa el usuario con el dominio elegido', () => {
        expect(armarCorreo(' ana.perez ')).toBe('ana.perez@ueb.edu.ec');
        expect(armarCorreo('ana.perez', 'mailes.ueb.edu.ec')).toBe('ana.perez@mailes.ueb.edu.ec');
        expect(armarCorreo('ana@mailes.ueb.edu.ec', 'ueb.edu.ec')).toBe('ana@mailes.ueb.edu.ec');
        expect(armarCorreo('')).toBe('');
    });

    it('separa un correo pegado y reconoce solo los dominios institucionales', () => {
        expect(separarCorreo('ana@MAILES.ueb.edu.ec')).toEqual({ usuario: 'ana', dominio: 'mailes.ueb.edu.ec' });
        expect(separarCorreo('ana@gmail.com')).toEqual({ usuario: 'ana', dominio: null });
        expect(separarCorreo('ana')).toEqual({ usuario: 'ana', dominio: null });
    });

    it('acepta ueb.edu.ec y mailes.ueb.edu.ec y nada más', () => {
        expect(esCorreoInstitucional('a@ueb.edu.ec')).toBe(true);
        expect(esCorreoInstitucional('a@mailes.ueb.edu.ec')).toBe(true);
        expect(esCorreoInstitucional('a@otro.ueb.edu.ec')).toBe(false);
        expect(esCorreoInstitucional('a@gmail.com')).toBe(false);
    });
});
