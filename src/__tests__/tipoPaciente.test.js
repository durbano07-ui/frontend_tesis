import { describe, it, expect } from 'vitest';
import { clasificarTipoPaciente, esPersonalAdministrativo } from '../utils/tipoPaciente';

const paciente = (id_tipo_usuario, extra = {}) => ({ estudio_carrera: { id_tipo_usuario, ...extra } });

describe('clasificación del paciente por tipo de usuario', () => {
    it('usa los códigos reales de la tabla tipo_usuario', () => {
        expect(clasificarTipoPaciente(paciente(2))).toBe('estudiante');
        expect(clasificarTipoPaciente(paciente(3))).toBe('docente');
        expect(clasificarTipoPaciente(paciente(4))).toBe('administrativo');
        expect(clasificarTipoPaciente(paciente(5))).toBe('codigo_trabajo');
    });

    it('un docente con datos académicos guardados sigue siendo docente (antes Odontología lo contaba como estudiante)', () => {
        expect(clasificarTipoPaciente(paciente(3, { id_carrera: 7, carrera: { nombre: 'ENFERMERÍA' } }))).toBe('docente');
    });

    it('el código 1 (Médico) no se confunde con estudiante (antes 1 = estudiante en los partes diarios)', () => {
        expect(clasificarTipoPaciente(paciente(1))).toBeNull();
    });

    it('un paciente sin tipo confirmado no se clasifica', () => {
        expect(clasificarTipoPaciente({})).toBeNull();
        expect(clasificarTipoPaciente(null)).toBeNull();
        expect(clasificarTipoPaciente({ estudio_carrera: null, id_tipo_usuario: null })).toBeNull();
    });

    it('acepta las distintas formas en que la API envía el registro académico', () => {
        expect(clasificarTipoPaciente({ estudioCarrera: { id_tipo_usuario: 3 } })).toBe('docente');
        expect(clasificarTipoPaciente({ career_study: { tipo_usuario: { nombre: 'Estudiante' } } })).toBe('estudiante');
        expect(clasificarTipoPaciente({ id_tipo_usuario: 4 })).toBe('administrativo');
    });

    it('código de trabajo cuenta como personal administrativo en los reportes de 3 columnas', () => {
        expect(esPersonalAdministrativo('codigo_trabajo')).toBe(true);
        expect(esPersonalAdministrativo('administrativo')).toBe(true);
        expect(esPersonalAdministrativo('docente')).toBe(false);
        expect(esPersonalAdministrativo(null)).toBe(false);
    });
});
