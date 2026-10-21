/**
 * Narrativas del Reporte General Mensual de Odontología (texto HTML con datos escapados).
 * Extraído de Odontologo_page.jsx — ISO/IEC 25010, mantenibilidad (modularidad).
 */
import { escapeHtml } from '../../../utils/escapeHtml';

export const getFacultyNarrativeTitle = (facName) => {
    const fUpper = (facName || '').toUpperCase();
    if (fUpper.includes('SALUD')) return 'Facultad de la Salud';
    if (fUpper.includes('JURISPRUDENCIA')) return 'Facultad de Jurisprudencia';
    if (fUpper.includes('ADMINISTRATIVAS')) return 'Facultad Ciencias Administrativas';
    if (fUpper.includes('AGROPECUARIAS')) return 'Facultad Ciencias Agropecuarias';
    if (fUpper.includes('EDUCACIÓN') || fUpper.includes('EDUCACION')) return 'Facultad Ciencias de la Educación';
    return `Facultad de ${escapeHtml(facName)}`;
};

export const buildFacultyNarrative = (facName, careersObj) => {
    const careers = careersObj || {};
    const title = getFacultyNarrativeTitle(facName);
    let facH = 0;
    let facM = 0;
    let facL = 0;
    let facTotal = 0;
    const careerSentences = [];

    Object.entries(careers).forEach(([cName, stats]) => {
        facH += stats.hombres || 0;
        facM += stats.mujeres || 0;
        facL += stats.lgbti || 0;
        facTotal += stats.total || 0;

        if ((stats.total || 0) > 0) {
            let part = '';
            if (stats.hombres > 0 && stats.mujeres > 0) {
                part = `${escapeHtml(stats.hombres)} hombre${stats.hombres > 1 ? 's' : ''} y ${escapeHtml(stats.mujeres)} mujer${stats.mujeres > 1 ? 'es' : ''}`;
            } else if (stats.hombres > 0) {
                part = `${escapeHtml(stats.hombres)} hombre${stats.hombres > 1 ? 's' : ''}`;
            } else if (stats.mujeres > 0) {
                part = `${escapeHtml(stats.mujeres)} mujer${stats.mujeres > 1 ? 'es' : ''}`;
            }
            if (stats.lgbti > 0) {
                part += (part ? `, ` : '') + `${escapeHtml(stats.lgbti)} LGBTI`;
            }
            const cLower = cName.toLowerCase();
            let prefix = 'En la Carrera de';
            if (cLower.startsWith('centro')) {
                prefix = 'En el';
            } else if (cLower.startsWith('carrera')) {
                prefix = 'En la';
            } else if (cLower.startsWith('educación') || cLower.startsWith('educacion') || cLower.startsWith('pedagogía') || cLower.startsWith('pedagogia') || cLower.startsWith('fisicomatemático') || cLower.startsWith('fisicomatematico')) {
                prefix = 'En la Carrera';
            }
            careerSentences.push(`${escapeHtml(prefix)} ${escapeHtml(cName)} ${escapeHtml(part)}.`);
        }
    });

    if (facTotal === 0) {
        return `${escapeHtml(title)}, no se registraron atenciones a estudiantes durante este período.`;
    }

    const fUpper = facName.toUpperCase();
    let verbClause = 'la atención fue a';
    if (fUpper.includes('JURISPRUDENCIA')) verbClause = 'se atendió a';

    const hasComma = fUpper.includes('SALUD') || fUpper.includes('JURISPRUDENCIA');
    let intro = `${escapeHtml(title)}${escapeHtml(hasComma ? ',' : '')} ${escapeHtml(verbClause)} ${escapeHtml(facTotal)} estudiantes, ${escapeHtml(facH)} hombres y ${escapeHtml(facM)} mujeres`;
    if (facL > 0) intro += `, ${escapeHtml(facL)} LGBTI`;
    intro += '.';

    return `${intro} ${careerSentences.join(' ')}`;
};

export const buildPreventivasNarrative = (pStats) => {
    const exam = pStats?.['Examen Odontológico'] || {
        estudiantes: { hombres: 0, mujeres: 0, lgbti: 0, total: 0 },
        administrativos: { hombres: 0, mujeres: 0, lgbti: 0, total: 0 },
        docentes: { hombres: 0, mujeres: 0, lgbti: 0, total: 0 }
    };

    const parts = [];
    const estH = exam.estudiantes?.hombres || 0;
    const estM = exam.estudiantes?.mujeres || 0;
    const estT = exam.estudiantes?.total || 0;
    let detEst = '';
    if (estH > 0 && estM > 0) detEst = `a ${escapeHtml(estH)} hombres y ${escapeHtml(estM)} mujeres`;
    else if (estH > 0) detEst = `a ${escapeHtml(estH)} hombre${estH > 1 ? 's' : ''}`;
    else if (estM > 0) detEst = `a ${escapeHtml(estM)} mujer${estM > 1 ? 'es' : ''}`;
    else detEst = `a 0 personas`;
    parts.push(`<strong>Estudiantes:</strong> Examen Odontológicos ${escapeHtml(detEst)}.`);

    const admH = exam.administrativos?.hombres || 0;
    const admM = exam.administrativos?.mujeres || 0;
    const admT = exam.administrativos?.total || 0;
    if (admT > 0) {
        let detAdm = '';
        if (admH > 0 && admM > 0) detAdm = `a ${escapeHtml(admH)} hombres y ${escapeHtml(admM)} mujeres`;
        else if (admH > 0) detAdm = `a ${escapeHtml(admH)} hombre${admH > 1 ? 's' : ''}`;
        else if (admM > 0) detAdm = `a ${escapeHtml(admM)} mujer${admM > 1 ? 'es' : ''}`;
        parts.push(`<strong>Administrativos:</strong> Examen Odontológico ${escapeHtml(detAdm)}.`);
    }

    const docH = exam.docentes?.hombres || 0;
    const docM = exam.docentes?.mujeres || 0;
    const docT = exam.docentes?.total || 0;
    if (docT > 0) {
        let detDoc = '';
        if (docH > 0 && docM > 0) detDoc = `a ${escapeHtml(docH)} hombres y ${escapeHtml(docM)} mujeres`;
        else if (docH > 0) detDoc = `a ${escapeHtml(docH)} hombre${docH > 1 ? 's' : ''}`;
        else if (docM > 0) detDoc = `a ${escapeHtml(docM)} mujer${docM > 1 ? 'es' : ''}`;
        parts.push(`<strong>Docentes:</strong> Examen Odontológico ${escapeHtml(detDoc)}.`);
    }

    return parts.join(' ');
};

export const defaultFacultyCareers = {
    'CIENCIAS DE LA SALUD': [
        'Enfermería',
        'Gestión de Riesgos',
        'Psicología',
        'Terapia Física'
    ],
    'JURISPRUDENCIA': [
        'Criminalística',
        'Derecho',
        'Sociología'
    ],
    'CIENCIAS ADMINISTRATIVAS': [
        'Ad. Empresas',
        'Comunicación',
        'Cont. Auditoría',
        'Emprendimiento e Innovación',
        'Gestión del Talento Humano',
        'Marketing Digital',
        'Mercadotecnia',
        'Software',
        'Tecnología de la Informática',
        'Turismo'
    ],
    'CIENCIAS AGROPECUARIAS': [
        'Agroindustria',
        'Agronomía',
        'Med. Veterinaria'
    ],
    'CIENCIAS DE LA EDUCACIÓN': [
        'Educación Básica',
        'Educación Inicial',
        'Educación Intercultural',
        'Fisicomatemático',
        'Pedagogía Idiomas Nacionales',
        'Pedagogía de la Informática',
        'Centro de Desarrollo Infantil'
    ]
};

export const buildCurativasNarrative = (curativoStats, curDiagnosesList) => {
    const stats = curativoStats || {};
    const diagList = curDiagnosesList || [];
    const groups = [
        { key: 'estudiantes', label: 'Estudiantes' },
        { key: 'administrativos', label: 'Administrativos' },
        { key: 'docentes', label: 'Docentes' }
    ];

    const parts = [];

    groups.forEach(g => {
        const diagsFound = [];
        diagList.forEach(diag => {
            const r = stats[diag]?.[g.key];
            if ((r?.total || 0) > 0) {
                diagsFound.push({ diag, h: r.hombres || 0, m: r.mujeres || 0 });
            }
        });

        if (diagsFound.length > 0) {
            const sentences = diagsFound.map((item, idx) => {
                let det = '';
                if (item.h > 0 && item.m > 0) det = `${escapeHtml(item.h)} hombre${item.h > 1 ? 's' : ''} y ${escapeHtml(item.m)} mujer${item.m > 1 ? 'es' : ''}`;
                else if (item.h > 0) det = `${escapeHtml(item.h)} hombre${item.h > 1 ? 's' : ''}`;
                else if (item.m > 0) det = `${escapeHtml(item.m)} mujer${item.m > 1 ? 'es' : ''}`;

                if (idx === 0) {
                    return `${escapeHtml(item.diag)} a ${escapeHtml(det)}`;
                }
                return `${escapeHtml(item.diag)} ${escapeHtml(det)}`;
            });
            parts.push(`<strong>${escapeHtml(g.label)}:</strong> ${sentences.join('. ')}.`);
        }
    });

    return parts.length > 0 ? parts.join('<br/><br/>') : 'Sin atenciones curativas registradas.';
};

export const buildProcedimientosPreventivosNarrative = (procPreventivos) => {
    const p = procPreventivos || {};
    const groups = [
        { key: 'estudiantes', label: 'Estudiantes:' },
        { key: 'administrativos', label: 'Administrativos:' },
        { key: 'docentes', label: 'Docente:' }
    ];

    const parts = [];

    groups.forEach(g => {
        const items = [];
        const prof = p['PROFILAXIS']?.[g.key];
        const fluor = p['FLUORIZACIÓN']?.[g.key];

        const profTotal = (prof?.hombres || 0) + (prof?.mujeres || 0);
        if (profTotal > 0) {
            let det = '';
            if ((prof.hombres || 0) > 0 && (prof.mujeres || 0) > 0) {
                det = `${escapeHtml(prof.hombres)} hombres y ${escapeHtml(prof.mujeres)} mujeres`;
            } else if ((prof.hombres || 0) > 0) {
                det = `${escapeHtml(prof.hombres)} hombre${prof.hombres > 1 ? 's' : ''}`;
            } else if ((prof.mujeres || 0) > 0) {
                det = `${escapeHtml(prof.mujeres)} mujer${prof.mujeres > 1 ? 'es' : ''}`;
            }
            items.push(`Profilaxis a ${escapeHtml(det)}`);
        }

        const fluorTotal = (fluor?.hombres || 0) + (fluor?.mujeres || 0);
        if (fluorTotal > 0) {
            let det = '';
            if ((fluor.hombres || 0) > 0 && (fluor.mujeres || 0) > 0) {
                det = `${escapeHtml(fluor.hombres)} hombres y ${escapeHtml(fluor.mujeres)} mujeres`;
            } else if ((fluor.hombres || 0) > 0) {
                det = `${escapeHtml(fluor.hombres)} hombre${fluor.hombres > 1 ? 's' : ''}`;
            } else if ((fluor.mujeres || 0) > 0) {
                det = `${escapeHtml(fluor.mujeres)} mujer${fluor.mujeres > 1 ? 'es' : ''}`;
            }
            items.push(`Fluorización a ${escapeHtml(det)}`);
        }

        if (items.length > 0) {
            parts.push(`<strong>${escapeHtml(g.label)}</strong> ${items.join('. ')}.`);
        }
    });

    return parts.length > 0 ? parts.join('<br/><br/>') : 'Sin procedimientos preventivos registrados.';
};

export const buildProcedimientosMorbilidadNarrative = (procMorbilidad) => {
    const p = procMorbilidad || {};
    const procList = [
        { key: 'DESTARTRAJE', label: 'Destartraje' },
        { key: 'RESTAURACIÓN PROVISIONAL', label: 'Restauración Provisional' },
        { key: 'RESTAURACIÓN CON RESINA', label: 'Restauración con Resina' },
        { key: 'DESGASTE DE PAREDES', label: 'Desgaste de Paredes', altLabel: { administrativos: 'Desgaste' } },
        { key: 'EXODONCIA', label: 'Exodoncias' },
        { key: 'RECETAS', label: 'Recetas' },
        { key: 'ORDEN DE RX', label: 'Orden de Rx' },
        { key: 'RETIRO DE PUNTOS', label: 'Retiro de Puntos' }
    ];

    const groups = [
        { key: 'estudiantes', label: 'Estudiantes:' },
        { key: 'administrativos', label: 'Administrativos:' },
        { key: 'docentes', label: 'Docente:' }
    ];

    const parts = [];

    groups.forEach(g => {
        const items = [];
        procList.forEach(proc => {
            const r = p[proc.key]?.[g.key];
            const h = r?.hombres || 0;
            const m = r?.mujeres || 0;
            const total = h + m;

            if (total > 0) {
                let det = '';
                if (h > 0 && m > 0) {
                    det = `${escapeHtml(h)} hombres y ${escapeHtml(m)} mujeres`;
                } else if (h > 0) {
                    det = `${escapeHtml(h)} hombre${h > 1 ? 's' : ''}`;
                } else if (m > 0) {
                    det = `${escapeHtml(m)} mujer${m > 1 ? 'es' : ''}`;
                }

                const procName = proc.altLabel?.[g.key] || proc.label;
                if (proc.key.includes('RESTAURACIÓN') && (h > 1 || m > 1 || (h + m > 2))) {
                    items.push(`${escapeHtml(procName)} a ${escapeHtml(det)}`);
                } else {
                    items.push(`${escapeHtml(procName)} ${escapeHtml(det)}`);
                }
            }
        });

        if (items.length > 0) {
            parts.push(`<strong>${escapeHtml(g.label)}</strong> ${items.join('. ')}.`);
        }
    });

    return parts.length > 0 ? parts.join('<br/><br/>') : 'Sin procedimientos de morbilidad registrados.';
};

export const buildGenderNarrative = (totalPacientes, totalEstudiantes, totalAdministrativos, totalDocentes, genderCounts) => {
    const totalH = (genderCounts?.estudiantes?.hombres || 0) + (genderCounts?.administrativos?.hombres || 0) + (genderCounts?.docentes?.hombres || 0);
    const totalM = (genderCounts?.estudiantes?.mujeres || 0) + (genderCounts?.administrativos?.mujeres || 0) + (genderCounts?.docentes?.mujeres || 0);
    const totalL = (genderCounts?.estudiantes?.lgbti || 0) + (genderCounts?.administrativos?.lgbti || 0) + (genderCounts?.docentes?.lgbti || 0);

    const estH = genderCounts?.estudiantes?.hombres || 0;
    const estM = genderCounts?.estudiantes?.mujeres || 0;
    const admH = genderCounts?.administrativos?.hombres || 0;
    const admM = genderCounts?.administrativos?.mujeres || 0;
    const docH = genderCounts?.docentes?.hombres || 0;
    const docM = genderCounts?.docentes?.mujeres || 0;

    let docText = 'Docente ';
    if (docH > 0 && docM > 0) {
        docText += `${escapeHtml(docH)} hombres y ${escapeHtml(docM)} mujeres`;
    } else if (docH > 0) {
        docText += `${escapeHtml(docH)} hombre${docH > 1 ? 's' : ''}`;
    } else if (docM > 0) {
        docText += `${escapeHtml(docM)} mujer${docM > 1 ? 'es' : ''}`;
    } else {
        docText += '0 docentes';
    }

    return `El total de la población atendida fue a ${escapeHtml(totalPacientes)} pacientes ${escapeHtml(totalH)} hombres y ${escapeHtml(totalM)} mujeres${totalL > 0 ? `, ${escapeHtml(totalL)} LGBTI` : ''}, estudiantes ${escapeHtml(totalEstudiantes)} de los cuales son ${escapeHtml(estH)} hombres y ${escapeHtml(estM)} mujeres, ${escapeHtml(totalAdministrativos)} Administrativos ${escapeHtml(admH)} hombres y ${escapeHtml(admM)} mujeres, ${docText}.`;
};
