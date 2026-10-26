import { describe, it, expect } from 'vitest';
import { compileOfficialIngresoFormHtml, extractFichaFields } from '../pages/occupational/OfficialFichaIngresoModal';
import { compileOfficialRetiroFormHtml } from '../pages/occupational/OfficialFichaRetiroModal';
import { compileOfficialReintegroFormHtml } from '../pages/occupational/OfficialFichaReintegroModal';

// Datos de ejemplo que antes rellenaban las fichas cuando faltaba información
const DATOS_DE_EJEMPLO = ['MERCHAN', 'SILVIA', 'AGUALONGO', 'LÓPEZ CARLOS', 'JORGE MORALES', '1804486288', '0201575900',
    'QUERATOCONO', 'LOSARTÁN', 'HERNIORRAFIA', 'ABUELO MATERNO', 'PROFESOR OCASIONAL', 'Católica'];

const fichaReal = {
    fecha: '2026-10-25',
    motivoConsulta: 'EVALUACIÓN PREOCUPACIONAL',
    enfermedadActual: 'ASINTOMÁTICO',
    examenFisico: { normal: true, descripcion: 'Examen físico normal' },
    vitalSigns: { paSystolic: '118', paDiastolic: '76', fc: '70', fr: '16', temp: '36.4', spo2: '97', peso: '80', talla: '175' },
    diagnosticoCie: 'Z10.0 - Examen ocupacional',
    aptitudLaboral: 'apto',
    planTratamiento: 'Pausas activas',
    patientSelected: { primer_nombre: 'Luis', segundo_nombre: 'Alfredo', apellido_paterno: 'Bayas', apellido_materno: 'Torres', cedula: '0201864329', sexo: 'M', fecha_nacimiento: '1980-05-10', puestoTrabajo: 'Personal Docente' }
};

describe('fichas ocupacionales con datos del sistema', () => {
    it('una ficha sin datos no se rellena con datos de ejemplo', () => {
        for (const compilar of [compileOfficialIngresoFormHtml, compileOfficialRetiroFormHtml, compileOfficialReintegroFormHtml]) {
            const html = compilar({}, '', false);
            DATOS_DE_EJEMPLO.forEach(dato => expect(html).not.toContain(dato));
        }
    });

    it('usa la identificación del perfil y lo registrado en la atención', () => {
        const f = extractFichaFields(fichaReal);
        expect([f.p1Ape, f.p2Ape, f.p1Nom, f.p2Nom]).toEqual(['Bayas', 'Torres', 'Luis', 'Alfredo']);
        expect(f.ced).toBe('0201864329');
        expect(f.sexo).toBe('M');
        expect(f.puesto).toBe('Personal Docente');
        expect(f.constantes.pa).toBe('118/76');
        expect(f.constantes.talla).toBe('1.75');
        expect(f.diags).toEqual([{ num: 1, desc: 'EXAMEN OCUPACIONAL', cie: 'Z10.0', pre: false, def: true }]);
        expect(f.apt.apto).toBe(true);

        const html = compileOfficialIngresoFormHtml(fichaReal, '', false);
        expect(html).toContain('0201864329');
        expect(html).toContain('EVALUACIÓN PREOCUPACIONAL');
    });

    it('lo que no está registrado queda en blanco', () => {
        const f = extractFichaFields({ patientSelected: { cedula: '0201864329' } });
        expect(f.rel).toBe('');
        expect(f.grpSangre).toBe('');
        expect(f.tel).toBe('');
        expect(f.diags).toEqual([]);
        expect(f.exLab).toEqual([]);
        expect(f.prof.nombre).toBe('');
    });
});

describe('receta ocupacional', async () => {
    const { compileRecetaFormHtmlString } = await import('../pages/occupational/reports/recetaTemplate');

    it('no se rellena con médico, CIE ni indicaciones de ejemplo', () => {
        const html = compileRecetaFormHtmlString({ id: 5, fecha: '2026-10-25', paciente: 'Luis Bayas', cedula: '0201864329', lineas: [] });
        ['Fernando Vaca', 'ACESS-MED-84920', 'Z00.0', 'Fiebre persistente', 'Reposo relativo'].forEach(dato => expect(html).not.toContain(dato));
        expect(html).toContain('0201864329');
    });
});
