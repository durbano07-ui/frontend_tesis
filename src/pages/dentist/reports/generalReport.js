/**
 * Reporte General Mensual de Odontología (documento HTML imprimible).
 * Extraído de Odontologo_page.jsx — ISO/IEC 25010, mantenibilidad (modularidad).
 * Recibe el mes, el año y el usuario como parámetros en lugar de leerlos del estado del componente.
 */
import { escapeHtml } from '../../../utils/escapeHtml';
import { logoBienestar } from '../../../assets/logoBienestarBase64.js';
import { headerBienestar } from '../../../assets/headerBienestarBase64.js';
import { logoUebTexto } from '../../../assets/logoUebTextoBase64.js';
import {
    buildCurativasNarrative,
    buildFacultyNarrative,
    buildGenderNarrative,
    buildPreventivasNarrative,
    buildProcedimientosMorbilidadNarrative,
    buildProcedimientosPreventivosNarrative,
    defaultFacultyCareers,
} from './narratives';

export const buildGeneralReportHtml = (data, forPrint = false, { genReportMonth, genReportYear, user } = {}) => {
    if (!data) return '';
    try {
        const monthsText = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
        const selectedMonthText = monthsText[genReportMonth - 1] || 'Abril';

        const doctorNameText = user?.name || 'Andrea García León';
        const doctorEmail = user?.email || 'angarcia@ueb.edu.ec';
        const reportNo = `006-OD-${genReportYear}`;

        const lastDayOfMonth = new Date(genReportYear, genReportMonth, 0).getDate();
        const reportDateFormatted = `${String(lastDayOfMonth).padStart(2, '0')}/${String(genReportMonth).padStart(2, '0')}/${genReportYear}`;

        const allCanonicalCareersOrdered = Object.values(defaultFacultyCareers).flat();
        const getCareerSortIndex = (careerName) => {
            const idx = allCanonicalCareersOrdered.findIndex(c => c.toLowerCase() === (careerName || '').toLowerCase());
            return idx >= 0 ? idx : 999;
        };
        const activeCareers = Object.keys(data.careerIndividualStats || {}).sort((a, b) => getCareerSortIndex(a) - getCareerSortIndex(b));
        const remainingCareers = activeCareers.slice(1);
        const extraCareerPages = Math.ceil(remainingCareers.length / 2);
        const totalPages = 8 + 1 + extraCareerPages;

        let totalEstCareersCount = 0;
        (data.reportingFaculties || []).forEach(f => {
            totalEstCareersCount += Object.keys(data.statsByFacultyAndCareer?.[f] || {}).length;
        });

    const totalH = (data.genderCounts?.estudiantes?.hombres || 0) + (data.genderCounts?.administrativos?.hombres || 0) + (data.genderCounts?.docentes?.hombres || 0);
    const totalM = (data.genderCounts?.estudiantes?.mujeres || 0) + (data.genderCounts?.administrativos?.mujeres || 0) + (data.genderCounts?.docentes?.mujeres || 0);
    const totalL = (data.genderCounts?.estudiantes?.lgbti || 0) + (data.genderCounts?.administrativos?.lgbti || 0) + (data.genderCounts?.docentes?.lgbti || 0);
    const grandTotal = data.totalPacientes || 0;

    const genderNarrative = buildGenderNarrative(data.totalPacientes, data.totalEstudiantes, data.totalAdministrativos, data.totalDocentes, data.genderCounts);
    const prevExamen = data.consolidadoStats?.preventivo?.['Examen Odontológico'] || {
        estudiantes: { hombres: 0, mujeres: 0, lgbti: 0, total: 0 },
        administrativos: { hombres: 0, mujeres: 0, lgbti: 0, total: 0 },
        docentes: { hombres: 0, mujeres: 0, lgbti: 0, total: 0 }
    };
    const prevTotal = (prevExamen.estudiantes?.total || 0) + (prevExamen.administrativos?.total || 0) + (prevExamen.docentes?.total || 0);
    const preventivasNarrative = buildPreventivasNarrative(data.consolidadoStats?.preventivo);

    // Variables para Página 4: Curativos y Procedimientos
    let totEstCurH = 0, totEstCurM = 0, totEstCurL = 0, totEstCurT = 0;
    let totAdmCurH = 0, totAdmCurM = 0, totAdmCurL = 0, totAdmCurT = 0;
    let totDocCurH = 0, totDocCurM = 0, totDocCurL = 0, totDocCurT = 0;
    let totGrandCurT = 0;

    const curativosRowsHtml = (data.curativosDiagnoses || []).map(diag => {
        const cur = data.consolidadoStats?.curativo?.[diag] || {
            estudiantes: { hombres: 0, mujeres: 0, lgbti: 0, total: 0 },
            administrativos: { hombres: 0, mujeres: 0, lgbti: 0, total: 0 },
            docentes: { hombres: 0, mujeres: 0, lgbti: 0, total: 0 }
        };
        const e = cur.estudiantes || { hombres: 0, mujeres: 0, lgbti: 0, total: 0 };
        const a = cur.administrativos || { hombres: 0, mujeres: 0, lgbti: 0, total: 0 };
        const d = cur.docentes || { hombres: 0, mujeres: 0, lgbti: 0, total: 0 };
        const rowTotal = (e.total || 0) + (a.total || 0) + (d.total || 0);

        totEstCurH += e.hombres || 0; totEstCurM += e.mujeres || 0; totEstCurL += e.lgbti || 0; totEstCurT += e.total || 0;
        totAdmCurH += a.hombres || 0; totAdmCurM += a.mujeres || 0; totAdmCurL += a.lgbti || 0; totAdmCurT += a.total || 0;
        totDocCurH += d.hombres || 0; totDocCurM += d.mujeres || 0; totDocCurL += d.lgbti || 0; totDocCurT += d.total || 0;
        totGrandCurT += rowTotal;

        return `
            <tr style="font-size: 7px;">
                <td style="border: 1px solid #000; padding: 1.5px 3px; text-align: left;">${escapeHtml(diag)}</td>
                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${e.hombres > 0 ? e.hombres : ''}</td>
                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${e.mujeres > 0 ? e.mujeres : ''}</td>
                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${escapeHtml(e.lgbti || 0)}</td>
                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; font-weight: bold;">${escapeHtml(e.total || 0)}</td>
                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${a.hombres > 0 ? a.hombres : ''}</td>
                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${a.mujeres > 0 ? a.mujeres : ''}</td>
                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${escapeHtml(a.lgbti || 0)}</td>
                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; font-weight: bold;">${escapeHtml(a.total || 0)}</td>
                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${d.hombres > 0 ? d.hombres : ''}</td>
                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${d.mujeres > 0 ? d.mujeres : ''}</td>
                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${escapeHtml(d.lgbti || 0)}</td>
                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; font-weight: bold;">${escapeHtml(d.total || 0)}</td>
                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; font-weight: bold;">${escapeHtml(rowTotal)}</td>
            </tr>
        `;
    }).join('');

    const curativasNarrativeHtml = buildCurativasNarrative(data.consolidadoStats?.curativo, data.curativosDiagnoses);

    const procPrev = data.procPreventivos || {};
    const profE = procPrev['PROFILAXIS']?.estudiantes || { hombres: 0, mujeres: 0, lgbti: 0 };
    const profA = procPrev['PROFILAXIS']?.administrativos || { hombres: 0, mujeres: 0, lgbti: 0 };
    const profD = procPrev['PROFILAXIS']?.docentes || { hombres: 0, mujeres: 0, lgbti: 0 };
    const profET = (profE.hombres || 0) + (profE.mujeres || 0) + (profE.lgbti || 0);
    const profAT = (profA.hombres || 0) + (profA.mujeres || 0) + (profA.lgbti || 0);
    const profDT = (profD.hombres || 0) + (profD.mujeres || 0) + (profD.lgbti || 0);
    const profTotal = profET + profAT + profDT;

    const fluoE = procPrev['FLUORIZACIÓN']?.estudiantes || { hombres: 0, mujeres: 0, lgbti: 0 };
    const fluoA = procPrev['FLUORIZACIÓN']?.administrativos || { hombres: 0, mujeres: 0, lgbti: 0 };
    const fluoD = procPrev['FLUORIZACIÓN']?.docentes || { hombres: 0, mujeres: 0, lgbti: 0 };
    const fluoET = (fluoE.hombres || 0) + (fluoE.mujeres || 0) + (fluoE.lgbti || 0);
    const fluoAT = (fluoA.hombres || 0) + (fluoA.mujeres || 0) + (fluoA.lgbti || 0);
    const fluoDT = (fluoD.hombres || 0) + (fluoD.mujeres || 0) + (fluoD.lgbti || 0);
    const fluoTotal = fluoET + fluoAT + fluoDT;

    const totProcH_E = (profE.hombres || 0) + (fluoE.hombres || 0);
    const totProcM_E = (profE.mujeres || 0) + (fluoE.mujeres || 0);
    const totProcL_E = (profE.lgbti || 0) + (fluoE.lgbti || 0);
    const totProcT_E = profET + fluoET;

    const totProcH_A = (profA.hombres || 0) + (fluoA.hombres || 0);
    const totProcM_A = (profA.mujeres || 0) + (fluoA.mujeres || 0);
    const totProcL_A = (profA.lgbti || 0) + (fluoA.lgbti || 0);
    const totProcT_A = profAT + fluoAT;

    const totProcH_D = (profD.hombres || 0) + (fluoD.hombres || 0);
    const totProcM_D = (profD.mujeres || 0) + (fluoD.mujeres || 0);
    const totProcL_D = (profD.lgbti || 0) + (fluoD.lgbti || 0);
    const totProcT_D = profDT + fluoDT;

    const totProcGrand = totProcT_E + totProcT_A + totProcT_D;

    const procPrevNarrativeHtml = buildProcedimientosPreventivosNarrative(data.procPreventivos);

    // Variables para Página 5: Procedimientos de Morbilidad
    const pMor = data.procMorbilidad || {};
    const morbilidadProcs = [
        'DESTARTRAJE',
        'RESTAURACIÓN PROVISIONAL',
        'RESTAURACIÓN CON RESINA',
        'DESGASTE DE PAREDES',
        'EXODONCIA',
        'RECETAS',
        'ORDEN DE RX',
        'RETIRO DE PUNTOS'
    ];

    let totEstMorH = 0, totEstMorM = 0, totEstMorL = 0, totEstMorT = 0;
    let totAdmMorH = 0, totAdmMorM = 0, totAdmMorL = 0, totAdmMorT = 0;
    let totDocMorH = 0, totDocMorM = 0, totDocMorL = 0, totDocMorT = 0;
    let totGrandMorT = 0;

    const morbilidadRowsHtml = morbilidadProcs.map(proc => {
        const est = pMor[proc]?.estudiantes || { hombres: 0, mujeres: 0, lgbti: 0 };
        const adm = pMor[proc]?.administrativos || { hombres: 0, mujeres: 0, lgbti: 0 };
        const doc = pMor[proc]?.docentes || { hombres: 0, mujeres: 0, lgbti: 0 };

        const estH = est.hombres || 0;
        const estM = est.mujeres || 0;
        const estL = est.lgbti || 0;
        const estT = estH + estM + estL;

        const admH = adm.hombres || 0;
        const admM = adm.mujeres || 0;
        const admL = adm.lgbti || 0;
        const admT = admH + admM + admL;

        const docH = doc.hombres || 0;
        const docM = doc.mujeres || 0;
        const docL = doc.lgbti || 0;
        const docT = docH + docM + docL;

        const rowTotal = estT + admT + docT;

        totEstMorH += estH;
        totEstMorM += estM;
        totEstMorL += estL;
        totEstMorT += estT;

        totAdmMorH += admH;
        totAdmMorM += admM;
        totAdmMorL += admL;
        totAdmMorT += admT;

        totDocMorH += docH;
        totDocMorM += docM;
        totDocMorL += docL;
        totDocMorT += docT;

        totGrandMorT += rowTotal;

        return `
            <tr style="font-size: 7px;">
                <td style="border: 1px solid #000; padding: 1.5px 4px; text-align: left; width: 18%;">${escapeHtml(proc)}</td>
                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; width: 6%;">${escapeHtml(estH)}</td>
                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; width: 6%;">${escapeHtml(estM)}</td>
                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; width: 5%;">${escapeHtml(estL)}</td>
                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; font-weight: bold; background-color: #f2dcdb; width: 6%;">${escapeHtml(estT)}</td>
                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; width: 6%;">${escapeHtml(admH)}</td>
                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; width: 6%;">${escapeHtml(admM)}</td>
                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; width: 5%;">${escapeHtml(admL)}</td>
                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; font-weight: bold; background-color: #f2dcdb; width: 6%;">${escapeHtml(admT)}</td>
                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; width: 6%;">${escapeHtml(docH)}</td>
                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; width: 6%;">${escapeHtml(docM)}</td>
                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; width: 5%;">${escapeHtml(docL)}</td>
                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; font-weight: bold; background-color: #f2dcdb; width: 6%;">${escapeHtml(docT)}</td>
                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; font-weight: bold; background-color: #f2dcdb; width: 8%;">${escapeHtml(rowTotal)}</td>
            </tr>
        `;
    }).join('');

    const procMorbilidadNarrativeHtml = buildProcedimientosMorbilidadNarrative(data.procMorbilidad);

    const renderFacultyNarrativeText = (facName, careersObj) => {
        return buildFacultyNarrative(facName, careersObj);
    };

    const renderFacultyTableHtml = (facName, careersObj) => {
        let careers = careersObj;
        if (!careers || Object.keys(careers).length === 0) {
            careers = {};
            (defaultFacultyCareers[facName] || []).forEach(cName => {
                careers[cName] = { hombres: 0, mujeres: 0, lgbti: 0, total: 0 };
            });
        }
        const careerNames = Object.keys(careers);
        if (careerNames.length === 0) return '';

        let facH = 0;
        let facM = 0;
        let facL = 0;
        let facTotal = 0;

        let rowsHtml = '';
        careerNames.forEach((cName, idx) => {
            const s = careers[cName];
            facH += s.hombres || 0;
            facM += s.mujeres || 0;
            facL += s.lgbti || 0;
            facTotal += s.total || 0;

            rowsHtml += `
                <tr style="font-size: 8px;">
                    ${idx === 0 ? `
                        <td rowspan="${escapeHtml(careerNames.length)}" style="border: 1px solid #4b5563; padding: 2px 4px; text-align: center; vertical-align: middle; font-weight: bold; background-color: #cbd5e1; width: 26%;">
                            ${escapeHtml(facName)}
                        </td>
                    ` : ''}
                    <td style="border: 1px solid #4b5563; padding: 2px 6px; text-align: left; width: 38%;">${escapeHtml(cName)}</td>
                    <td style="border: 1px solid #4b5563; padding: 2px 4px; text-align: center; width: 9%;">${escapeHtml(s.hombres)}</td>
                    <td style="border: 1px solid #4b5563; padding: 2px 4px; text-align: center; width: 9%;">${escapeHtml(s.mujeres)}</td>
                    <td style="border: 1px solid #4b5563; padding: 2px 4px; text-align: center; width: 9%;">${escapeHtml(s.lgbti)}</td>
                    <td style="border: 1px solid #4b5563; padding: 2px 4px; text-align: center; width: 9%; font-weight: bold;">${escapeHtml(s.total)}</td>
                </tr>
            `;
        });

        rowsHtml += `
            <tr style="background-color: #cbd5e1; font-weight: bold; font-size: 8px;">
                <td colspan="2" style="border: 1px solid #4b5563; padding: 2px 6px; text-align: left;">TOTAL</td>
                <td style="border: 1px solid #4b5563; padding: 2px 4px; text-align: center;">${escapeHtml(facH)}</td>
                <td style="border: 1px solid #4b5563; padding: 2px 4px; text-align: center;">${escapeHtml(facM)}</td>
                <td style="border: 1px solid #4b5563; padding: 2px 4px; text-align: center;">${escapeHtml(facL)}</td>
                <td style="border: 1px solid #4b5563; padding: 2px 4px; text-align: center;">${escapeHtml(facTotal)}</td>
            </tr>
        `;

        return `
            <table style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; border: 1px solid #4b5563; margin-bottom: 5px;">
                <thead>
                    <tr style="background-color: #cbd5e1; font-weight: bold; font-size: 8px; text-align: center;">
                        <th style="border: 1px solid #4b5563; padding: 2px 4px; width: 26%;">FACULTAD</th>
                        <th style="border: 1px solid #4b5563; padding: 2px 4px; width: 38%;">CARRERA</th>
                        <th style="border: 1px solid #4b5563; padding: 2px 4px; width: 9%;">HOMBRES</th>
                        <th style="border: 1px solid #4b5563; padding: 2px 4px; width: 9%;">MUJERES</th>
                        <th style="border: 1px solid #4b5563; padding: 2px 4px; width: 9%;">LGBTI</th>
                        <th style="border: 1px solid #4b5563; padding: 2px 4px; width: 9%;">TOTAL</th>
                    </tr>
                </thead>
                <tbody>
                    ${rowsHtml}
                </tbody>
            </table>
        `;
    };

    const renderAnexoTableRowsHtml = () => {
        const anexoFaculties = [
            {
                faculty: 'CIENCIAS DE LA SALUD',
                careers: ['Enfermería', 'Gestión de Riesgos', 'Psicología', 'Terapia Física']
            },
            {
                faculty: 'JURISPRUDENCIA',
                careers: ['Criminalística', 'Derecho', 'Sociología']
            },
            {
                faculty: 'CIENCIAS ADMINISTRATIVAS',
                careers: [
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
                ]
            },
            {
                faculty: 'CIENCIAS AGROPECUARIAS',
                careers: ['Agroindustria', 'Agronomía', 'Med. Veterinaria']
            },
            {
                faculty: 'CIENCIAS DE LA EDUCACIÓN',
                careers: [
                    'Educación Básica',
                    'Educación Inicial',
                    'Educación Intercultural',
                    'Fisicomatemático',
                    'Pedagogía Idiomas Nacionales',
                    'Pedagogía de la Informática',
                    'Centro de Desarrollo Infantil'
                ]
            }
        ];

        let html = '';
        let isFirstEver = true;

        anexoFaculties.forEach(facGroup => {
            const facName = facGroup.faculty;
            const careers = facGroup.careers;
            const facRowspan = careers.length;

            careers.forEach((careerName, idx) => {
                const stats = data.statsByFacultyAndCareer?.[facName]?.[careerName] || {
                    hombres: 0,
                    mujeres: 0,
                    lgbti: 0,
                    total: 0
                };

                html += '<tr style="font-size: 7.5px;">';

                if (isFirstEver) {
                    html += `
                        <td rowspan="27" style="border: 1px solid #000; background-color: #d9d9d9; width: 3.5%; text-align: center; vertical-align: middle; font-weight: bold; font-size: 7.5px; line-height: 1.15; padding: 2px 0;">
                            E<br/>S<br/>T<br/>U<br/>D<br/>I<br/>A<br/>N<br/>T<br/>E<br/>S
                        </td>
                    `;
                    isFirstEver = false;
                }

                if (idx === 0) {
                    html += `
                        <td rowspan="${escapeHtml(facRowspan)}" style="border: 1px solid #000; background-color: #d9d9d9; font-weight: bold; text-align: center; vertical-align: middle; padding: 2px 3px; font-size: 7.5px; width: 22%;">
                            ${escapeHtml(facName)}
                        </td>
                    `;
                }

                html += `
                    <td style="border: 1px solid #000; padding: 1.5px 4px; text-align: left; width: 34.5%;">${escapeHtml(careerName)}</td>
                    <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; width: 10%;">${escapeHtml(stats.hombres || 0)}</td>
                    <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; width: 10%;">${escapeHtml(stats.mujeres || 0)}</td>
                    <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; width: 10%;">${escapeHtml(stats.lgbti || 0)}</td>
                    <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; width: 10%; font-weight: bold;">${escapeHtml(stats.total || 0)}</td>
                </tr>`;
            });
        });

        // 4 Filas de Resumen
        const estH = data.genderCounts?.estudiantes?.hombres || 0;
        const estM = data.genderCounts?.estudiantes?.mujeres || 0;
        const estL = data.genderCounts?.estudiantes?.lgbti || 0;
        const estT = data.totalEstudiantes || (estH + estM + estL);

        const admH = data.genderCounts?.administrativos?.hombres || 0;
        const admM = data.genderCounts?.administrativos?.mujeres || 0;
        const admL = data.genderCounts?.administrativos?.lgbti || 0;
        const admT = data.totalAdministrativos || (admH + admM + admL);

        const docH = data.genderCounts?.docentes?.hombres || 0;
        const docM = data.genderCounts?.docentes?.mujeres || 0;
        const docL = data.genderCounts?.docentes?.lgbti || 0;
        const docT = data.totalDocentes || (docH + docM + docL);

        const totH = estH + admH + docH;
        const totM = estM + admM + docM;
        const totL = estL + admL + docL;
        const grandTotalAnexo = estT + admT + docT;

        html += `
            <tr style="font-weight: bold; font-size: 7.5px;">
                <td colspan="3" style="border: 1px solid #000; background-color: #d9d9d9; padding: 2px 4px; text-align: left;">ESTUDIANTES</td>
                <td style="border: 1px solid #000; padding: 2px; text-align: center; background-color: #fff;">${escapeHtml(estH)}</td>
                <td style="border: 1px solid #000; padding: 2px; text-align: center; background-color: #fff;">${escapeHtml(estM)}</td>
                <td style="border: 1px solid #000; padding: 2px; text-align: center; background-color: #fff;">${escapeHtml(estL)}</td>
                <td style="border: 1px solid #000; padding: 2px; text-align: center; background-color: #fff;">${escapeHtml(estT)}</td>
            </tr>
            <tr style="font-weight: bold; font-size: 7.5px;">
                <td colspan="3" style="border: 1px solid #000; background-color: #d9d9d9; padding: 2px 4px; text-align: left;">ADMINISTRATIVOS</td>
                <td style="border: 1px solid #000; padding: 2px; text-align: center; background-color: #fff;">${escapeHtml(admH)}</td>
                <td style="border: 1px solid #000; padding: 2px; text-align: center; background-color: #fff;">${escapeHtml(admM)}</td>
                <td style="border: 1px solid #000; padding: 2px; text-align: center; background-color: #fff;">${escapeHtml(admL)}</td>
                <td style="border: 1px solid #000; padding: 2px; text-align: center; background-color: #fff;">${escapeHtml(admT)}</td>
            </tr>
            <tr style="font-weight: bold; font-size: 7.5px;">
                <td colspan="3" style="border: 1px solid #000; background-color: #d9d9d9; padding: 2px 4px; text-align: left;">DOCENTES</td>
                <td style="border: 1px solid #000; padding: 2px; text-align: center; background-color: #fff;">${escapeHtml(docH)}</td>
                <td style="border: 1px solid #000; padding: 2px; text-align: center; background-color: #fff;">${escapeHtml(docM)}</td>
                <td style="border: 1px solid #000; padding: 2px; text-align: center; background-color: #fff;">${escapeHtml(docL)}</td>
                <td style="border: 1px solid #000; padding: 2px; text-align: center; background-color: #fff;">${escapeHtml(docT)}</td>
            </tr>
            <tr style="font-weight: bold; font-size: 7.5px; background-color: #d9d9d9;">
                <td colspan="3" style="border: 1px solid #000; padding: 2px 4px; text-align: left;">TOTAL</td>
                <td style="border: 1px solid #000; padding: 2px; text-align: center;">${escapeHtml(totH)}</td>
                <td style="border: 1px solid #000; padding: 2px; text-align: center;">${escapeHtml(totM)}</td>
                <td style="border: 1px solid #000; padding: 2px; text-align: center;">${escapeHtml(totL)}</td>
                <td style="border: 1px solid #000; padding: 2px; text-align: center;">${escapeHtml(grandTotalAnexo)}</td>
            </tr>
        `;

        return html;
    };

    const renderAnexo2TableRowsHtml = () => {
        const facConfigs = [
            {
                shortName: 'F.C. SALUD',
                fullName: 'CIENCIAS DE LA SALUD',
                careers: ['Enfermería', 'Gestión de Riesgos', 'Psicología', 'Terapia Física']
            },
            {
                shortName: 'F.C. JURISPRUDENCIA',
                fullName: 'JURISPRUDENCIA',
                careers: ['Criminalística', 'Derecho', 'Sociología']
            },
            {
                shortName: 'F.C. ADMINISTRATIVAS',
                fullName: 'CIENCIAS ADMINISTRATIVAS',
                careers: [
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
                ]
            },
            {
                shortName: 'F.C. AGROPECUARIAS',
                fullName: 'CIENCIAS AGROPECUARIAS',
                careers: ['Agroindustria', 'Agronomía', 'Med. Veterinaria']
            },
            {
                shortName: 'F.C. EDUCACIÓN',
                fullName: 'CIENCIAS DE LA EDUCACIÓN',
                careers: [
                    'Educación Básica',
                    'Educación Inicial',
                    'Educación Intercultural Bilingüe',
                    'Fisicomatemático',
                    'Pedagogía Idiomas Nacionales',
                    'Pedagogía de la Informática',
                    'Centro de Desarrollo Infantil'
                ]
            }
        ];

        let html = '';
        let estPrevH = 0, estPrevM = 0, estPrevL = 0, estPrevT = 0;
        let estCurH = 0, estCurM = 0, estCurL = 0, estCurT = 0;
        let estGrandTotal = 0;

        facConfigs.forEach(cfg => {
            const facShort = cfg.shortName;
            const facFull = cfg.fullName;
            const careers = cfg.careers;
            const facRowspan = careers.length + 1;

            let fPrevH = 0, fPrevM = 0, fPrevL = 0, fPrevT = 0;
            let fCurH = 0, fCurM = 0, fCurL = 0, fCurT = 0;
            let fTotal = 0;

            careers.forEach((careerName, idx) => {
                const stats = data.statsByFacultyAndCareer?.[facFull]?.[careerName] || {};
                const p = stats.preventiva || {};
                const c = stats.curativa || {};

                const pH = p.hombres || 0;
                const pM = p.mujeres || 0;
                const pL = p.lgbti || 0;
                const pT = p.total || (pH + pM + pL);

                const cH = c.hombres || 0;
                const cM = c.mujeres || 0;
                const cL = c.lgbti || 0;
                const cT = c.total || (cH + cM + cL);

                const rowTotal = stats.total || (pT + cT);

                fPrevH += pH; fPrevM += pM; fPrevL += pL; fPrevT += pT;
                fCurH += cH; fCurM += cM; fCurL += cL; fCurT += cT;
                fTotal += rowTotal;

                estPrevH += pH; estPrevM += pM; estPrevL += pL; estPrevT += pT;
                estCurH += cH; estCurM += cM; estCurL += cL; estCurT += cT;
                estGrandTotal += rowTotal;

                html += '<tr style="font-size: 7px;">';

                if (idx === 0) {
                    html += `
                        <td rowspan="${escapeHtml(facRowspan)}" style="border: 1px solid #000; background-color: #fde9d9; font-weight: bold; text-align: center; vertical-align: middle; padding: 2px; width: 14%; color: #000;">
                            ${escapeHtml(facShort)}
                        </td>
                    `;
                }

                html += `
                    <td style="border: 1px solid #000; padding: 1px 3px; text-align: left; width: 24%;">${escapeHtml(careerName)}</td>
                    <td style="border: 1px solid #000; padding: 1px 2px; text-align: center; width: 6%;">${escapeHtml(pH)}</td>
                    <td style="border: 1px solid #000; padding: 1px 2px; text-align: center; width: 6%;">${escapeHtml(pM)}</td>
                    <td style="border: 1px solid #000; padding: 1px 2px; text-align: center; width: 5%;">${escapeHtml(pL)}</td>
                    <td style="border: 1px solid #000; padding: 1px 2px; text-align: center; width: 7%; background-color: #d8e4bc; font-weight: bold;">${escapeHtml(pT)}</td>
                    <td style="border: 1px solid #000; padding: 1px 2px; text-align: center; width: 6%;">${escapeHtml(cH)}</td>
                    <td style="border: 1px solid #000; padding: 1px 2px; text-align: center; width: 6%;">${escapeHtml(cM)}</td>
                    <td style="border: 1px solid #000; padding: 1px 2px; text-align: center; width: 5%;">${escapeHtml(cL)}</td>
                    <td style="border: 1px solid #000; padding: 1px 2px; text-align: center; width: 7%; background-color: #d8e4bc; font-weight: bold;">${escapeHtml(cT)}</td>
                    <td style="border: 1px solid #000; padding: 1px 2px; text-align: center; width: 8%; background-color: #d8e4bc; font-weight: bold;">${escapeHtml(rowTotal)}</td>
                </tr>`;
            });

            html += `
                <tr style="font-weight: bold; font-size: 7px; background-color: #fde9d9;">
                    <td style="border: 1px solid #000; padding: 1.5px 3px; text-align: center;">TOTAL</td>
                    <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${escapeHtml(fPrevH)}</td>
                    <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${escapeHtml(fPrevM)}</td>
                    <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${escapeHtml(fPrevL)}</td>
                    <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; background-color: #d8e4bc;">${escapeHtml(fPrevT)}</td>
                    <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${escapeHtml(fCurH)}</td>
                    <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${escapeHtml(fCurM)}</td>
                    <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${escapeHtml(fCurL)}</td>
                    <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; background-color: #d8e4bc;">${escapeHtml(fCurT)}</td>
                    <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; background-color: #d8e4bc;">${escapeHtml(fTotal)}</td>
                </tr>
            `;
        });

        // Resumen Administrativos
        const admPrev = data.consolidadoStats?.preventivo?.['Examen Odontológico']?.administrativos || {};
        const admPrevH = admPrev.hombres || 0;
        const admPrevM = admPrev.mujeres || 0;
        const admPrevL = admPrev.lgbti || 0;
        const admPrevT = admPrev.total || (admPrevH + admPrevM + admPrevL);

        let admCurH = 0, admCurM = 0, admCurL = 0, admCurT = 0;
        (data.curativosDiagnoses || []).forEach(diag => {
            const r = data.consolidadoStats?.curativo?.[diag]?.administrativos || {};
            admCurH += r.hombres || 0;
            admCurM += r.mujeres || 0;
            admCurL += r.lgbti || 0;
            admCurT += r.total || 0;
        });
        const admTotal = data.totalAdministrativos || (admPrevT + admCurT);

        // Resumen Docentes
        const docPrev = data.consolidadoStats?.preventivo?.['Examen Odontológico']?.docentes || {};
        const docPrevH = docPrev.hombres || 0;
        const docPrevM = docPrev.mujeres || 0;
        const docPrevL = docPrev.lgbti || 0;
        const docPrevT = docPrev.total || (docPrevH + docPrevM + docPrevL);

        let docCurH = 0, docCurM = 0, docCurL = 0, docCurT = 0;
        (data.curativosDiagnoses || []).forEach(diag => {
            const r = data.consolidadoStats?.curativo?.[diag]?.docentes || {};
            docCurH += r.hombres || 0;
            docCurM += r.mujeres || 0;
            docCurL += r.lgbti || 0;
            docCurT += r.total || 0;
        });
        const docTotal = data.totalDocentes || (docPrevT + docCurT);

        // Resumen General
        const grandPrevH = estPrevH + admPrevH + docPrevH;
        const grandPrevM = estPrevM + admPrevM + docPrevM;
        const grandPrevL = estPrevL + admPrevL + docPrevL;
        const grandPrevT = estPrevT + admPrevT + docPrevT;

        const grandCurH = estCurH + admCurH + docCurH;
        const grandCurM = estCurM + admCurM + docCurM;
        const grandCurL = estCurL + admCurL + docCurL;
        const grandCurT = estCurT + admCurT + docCurT;

        const grandTotalAll = data.totalPacientes || (grandPrevT + grandCurT);

        // 4 Filas de Resumen
        html += `
            <tr style="font-weight: bold; font-size: 7px; background-color: #fde9d9;">
                <td colspan="2" style="border: 1px solid #000; padding: 2px 4px; text-align: left;">ESTUDIANTES</td>
                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${escapeHtml(estPrevH)}</td>
                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${escapeHtml(estPrevM)}</td>
                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${escapeHtml(estPrevL)}</td>
                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; background-color: #d8e4bc;">${escapeHtml(estPrevT)}</td>
                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${escapeHtml(estCurH)}</td>
                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${escapeHtml(estCurM)}</td>
                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${escapeHtml(estCurL)}</td>
                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; background-color: #d8e4bc;">${escapeHtml(estCurT)}</td>
                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; background-color: #d8e4bc;">${escapeHtml(estGrandTotal)}</td>
            </tr>
            <tr style="font-weight: bold; font-size: 7px; background-color: #fde9d9;">
                <td colspan="2" style="border: 1px solid #000; padding: 2px 4px; text-align: left;">ADMINISTRATIVOS</td>
                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${escapeHtml(admPrevH)}</td>
                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${escapeHtml(admPrevM)}</td>
                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${escapeHtml(admPrevL)}</td>
                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; background-color: #d8e4bc;">${escapeHtml(admPrevT)}</td>
                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${escapeHtml(admCurH)}</td>
                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${escapeHtml(admCurM)}</td>
                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${escapeHtml(admCurL)}</td>
                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; background-color: #d8e4bc;">${escapeHtml(admCurT)}</td>
                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; background-color: #d8e4bc;">${escapeHtml(admTotal)}</td>
            </tr>
            <tr style="font-weight: bold; font-size: 7px; background-color: #fde9d9;">
                <td colspan="2" style="border: 1px solid #000; padding: 2px 4px; text-align: left;">DOCENTES</td>
                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${escapeHtml(docPrevH)}</td>
                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${escapeHtml(docPrevM)}</td>
                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${escapeHtml(docPrevL)}</td>
                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; background-color: #d8e4bc;">${escapeHtml(docPrevT)}</td>
                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${escapeHtml(docCurH)}</td>
                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${escapeHtml(docCurM)}</td>
                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${escapeHtml(docCurL)}</td>
                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; background-color: #d8e4bc;">${escapeHtml(docCurT)}</td>
                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; background-color: #d8e4bc;">${escapeHtml(docTotal)}</td>
            </tr>
            <tr style="font-weight: bold; font-size: 7px; background-color: #cbd5e1;">
                <td colspan="2" style="border: 1px solid #000; padding: 2px 4px; text-align: center;">TOTAL</td>
                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${escapeHtml(grandPrevH)}</td>
                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${escapeHtml(grandPrevM)}</td>
                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${escapeHtml(grandPrevL)}</td>
                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; background-color: #d8e4bc;">${escapeHtml(grandPrevT)}</td>
                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${escapeHtml(grandCurH)}</td>
                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${escapeHtml(grandCurM)}</td>
                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${escapeHtml(grandCurL)}</td>
                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; background-color: #d8e4bc;">${escapeHtml(grandCurT)}</td>
                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; background-color: #d8e4bc;">${escapeHtml(grandTotalAll)}</td>
            </tr>
        `;

        return html;
    };

    const renderConsolidadoTableHtml = () => {
        const pExamen = data.consolidadoStats?.preventivo?.['Examen Odontológico'] || {
            estudiantes: { hombres: 0, mujeres: 0, lgbti: 0, total: 0 },
            administrativos: { hombres: 0, mujeres: 0, lgbti: 0, total: 0 },
            docentes: { hombres: 0, mujeres: 0, lgbti: 0, total: 0 }
        };
        const prevTotal = (pExamen.estudiantes?.total || 0) + (pExamen.administrativos?.total || 0) + (pExamen.docentes?.total || 0);

        let totEstH = pExamen.estudiantes?.hombres || 0;
        let totEstM = pExamen.estudiantes?.mujeres || 0;
        let totEstL = pExamen.estudiantes?.lgbti || 0;
        let totEstT = pExamen.estudiantes?.total || 0;

        let totAdmH = pExamen.administrativos?.hombres || 0;
        let totAdmM = pExamen.administrativos?.mujeres || 0;
        let totAdmL = pExamen.administrativos?.lgbti || 0;
        let totAdmT = pExamen.administrativos?.total || 0;

        let totDocH = pExamen.docentes?.hombres || 0;
        let totDocM = pExamen.docentes?.mujeres || 0;
        let totDocL = pExamen.docentes?.lgbti || 0;
        let totDocT = pExamen.docentes?.total || 0;

        let totGrandT = prevTotal;

        const curRowsHtml = (data.curativosDiagnoses || []).map(diag => {
            const cur = data.consolidadoStats?.curativo?.[diag] || {
                estudiantes: { hombres: 0, mujeres: 0, lgbti: 0, total: 0 },
                administrativos: { hombres: 0, mujeres: 0, lgbti: 0, total: 0 },
                docentes: { hombres: 0, mujeres: 0, lgbti: 0, total: 0 }
            };
            const e = cur.estudiantes || { hombres: 0, mujeres: 0, lgbti: 0, total: 0 };
            const a = cur.administrativos || { hombres: 0, mujeres: 0, lgbti: 0, total: 0 };
            const d = cur.docentes || { hombres: 0, mujeres: 0, lgbti: 0, total: 0 };
            const rowTotal = (e.total || 0) + (a.total || 0) + (d.total || 0);

            totEstH += e.hombres || 0; totEstM += e.mujeres || 0; totEstL += e.lgbti || 0; totEstT += e.total || 0;
            totAdmH += a.hombres || 0; totAdmM += a.mujeres || 0; totAdmL += a.lgbti || 0; totAdmT += a.total || 0;
            totDocH += d.hombres || 0; totDocM += d.mujeres || 0; totDocL += d.lgbti || 0; totDocT += d.total || 0;
            totGrandT += rowTotal;

            return `
                <tr style="font-size: 6.5px;">
                    <td style="border: 1px solid #000; padding: 0.8px 3px; text-align: left;">${escapeHtml(diag)}</td>
                    <td style="border: 1px solid #000; padding: 0.8px 1px; text-align: center;">${e.hombres > 0 ? e.hombres : ''}</td>
                    <td style="border: 1px solid #000; padding: 0.8px 1px; text-align: center;">${e.mujeres > 0 ? e.mujeres : ''}</td>
                    <td style="border: 1px solid #000; padding: 0.8px 1px; text-align: center;">0</td>
                    <td style="border: 1px solid #000; padding: 0.8px 1px; text-align: center;">${escapeHtml(e.total || 0)}</td>
                    <td style="border: 1px solid #000; padding: 0.8px 1px; text-align: center;">${a.hombres > 0 ? a.hombres : ''}</td>
                    <td style="border: 1px solid #000; padding: 0.8px 1px; text-align: center;">${a.mujeres > 0 ? a.mujeres : ''}</td>
                    <td style="border: 1px solid #000; padding: 0.8px 1px; text-align: center;">0</td>
                    <td style="border: 1px solid #000; padding: 0.8px 1px; text-align: center;">${escapeHtml(a.total || 0)}</td>
                    <td style="border: 1px solid #000; padding: 0.8px 1px; text-align: center;">${d.hombres > 0 ? d.hombres : ''}</td>
                    <td style="border: 1px solid #000; padding: 0.8px 1px; text-align: center;">${d.mujeres > 0 ? d.mujeres : ''}</td>
                    <td style="border: 1px solid #000; padding: 0.8px 1px; text-align: center;">0</td>
                    <td style="border: 1px solid #000; padding: 0.8px 1px; text-align: center;">${escapeHtml(d.total || 0)}</td>
                    <td style="border: 1px solid #000; padding: 0.8px 1px; text-align: center;">${escapeHtml(rowTotal || 0)}</td>
                </tr>
            `;
        }).join('');

        return `
            <table style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; border: 1.5px solid #000; font-size: 6.5px; margin-bottom: 2px;">
                <thead>
                    <tr>
                        <td colspan="2" style="border: 1px solid #000; padding: 2px; text-align: center; vertical-align: middle; background-color: #fff; width: 18%;">
                            <img src="${escapeHtml(logoUebTexto)}" alt="UEB" style="max-height: 22px; width: auto; object-fit: contain;" />
                        </td>
                        <td colspan="10" style="border: 1px solid #000; padding: 2px; text-align: center; font-weight: bold; font-size: 7.5px; background-color: #fff; line-height: 1.2;">
                            UNIVERSIDAD ESTATAL DE BOLÍVAR<br/>
                            BIENESTAR UNIVERSITARIO<br/>
                            ATENCIONES DE ODONTOLOGÍA - ${escapeHtml(selectedMonthText.toUpperCase())} ${escapeHtml(genReportYear)}
                        </td>
                        <td colspan="2" style="border: 1px solid #000; padding: 2px; text-align: center; vertical-align: middle; background-color: #fff; width: 18%;">
                            <img src="${escapeHtml(logoBienestar)}" alt="Bienestar Universitario" style="max-height: 22px; width: auto; object-fit: contain;" />
                        </td>
                    </tr>
                    <tr style="font-weight: bold; text-align: center; font-size: 6.5px;">
                        <th style="border: 1px solid #000; background-color: #ebf1de; padding: 2px; text-align: left; width: 22%; color: #000;">CONSOLIDADO</th>
                        <th colspan="4" style="border: 1px solid #000; background-color: #fde9d9; padding: 2px; color: #000;">ESTUDIANTES</th>
                        <th colspan="4" style="border: 1px solid #000; background-color: #fde9d9; padding: 2px; color: #000;">ADMINISTRATIVOS</th>
                        <th colspan="4" style="border: 1px solid #000; background-color: #fde9d9; padding: 2px; color: #000;">DOCENTES</th>
                        <th rowspan="2" style="border: 1px solid #000; background-color: #8db4e2; padding: 2px; color: #000; vertical-align: middle; width: 7%;">TOTAL</th>
                    </tr>
                    <tr style="font-weight: bold; text-align: center; font-size: 6px;">
                        <th style="border: 1px solid #000; background-color: #fde9d9; padding: 1.5px 2px; text-align: left; color: #000;">PREVENCION</th>
                        <th style="border: 1px solid #000; background-color: #fde9d9; padding: 1.5px 1px; color: #000; width: 5.5%;">MASCULINO</th>
                        <th style="border: 1px solid #000; background-color: #fde9d9; padding: 1.5px 1px; color: #000; width: 5.5%;">FEMENINO</th>
                        <th style="border: 1px solid #000; background-color: #fde9d9; padding: 1.5px 1px; color: #000; width: 5%;">LGBTI</th>
                        <th style="border: 1px solid #000; background-color: #d8e4bc; padding: 1.5px 1px; color: #000; width: 5.5%;">TOTAL</th>
                        <th style="border: 1px solid #000; background-color: #fde9d9; padding: 1.5px 1px; color: #000; width: 5.5%;">MASCULINO</th>
                        <th style="border: 1px solid #000; background-color: #fde9d9; padding: 1.5px 1px; color: #000; width: 5.5%;">FEMENINO</th>
                        <th style="border: 1px solid #000; background-color: #fde9d9; padding: 1.5px 1px; color: #000; width: 5%;">LGBTI</th>
                        <th style="border: 1px solid #000; background-color: #d8e4bc; padding: 1.5px 1px; color: #000; width: 5.5%;">TOTAL</th>
                        <th style="border: 1px solid #000; background-color: #fde9d9; padding: 1.5px 1px; color: #000; width: 5.5%;">MASCULINO</th>
                        <th style="border: 1px solid #000; background-color: #fde9d9; padding: 1.5px 1px; color: #000; width: 5.5%;">FEMENINO</th>
                        <th style="border: 1px solid #000; background-color: #fde9d9; padding: 1.5px 1px; color: #000; width: 5%;">LGBTI</th>
                        <th style="border: 1px solid #000; background-color: #d8e4bc; padding: 1.5px 1px; color: #000; width: 5.5%;">TOTAL</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style="font-size: 6.5px;">
                        <td style="border: 1px solid #000; padding: 1px 3px; text-align: left;">Examen Odontológico</td>
                        <td style="border: 1px solid #000; padding: 1px; text-align: center;">${pExamen.estudiantes?.hombres > 0 ? pExamen.estudiantes?.hombres : ''}</td>
                        <td style="border: 1px solid #000; padding: 1px; text-align: center;">${pExamen.estudiantes?.mujeres > 0 ? pExamen.estudiantes?.mujeres : ''}</td>
                        <td style="border: 1px solid #000; padding: 1px; text-align: center;">0</td>
                        <td style="border: 1px solid #000; padding: 1px; text-align: center;">${escapeHtml(pExamen.estudiantes?.total || 0)}</td>
                        <td style="border: 1px solid #000; padding: 1px; text-align: center;">${pExamen.administrativos?.hombres > 0 ? pExamen.administrativos?.hombres : ''}</td>
                        <td style="border: 1px solid #000; padding: 1px; text-align: center;">${pExamen.administrativos?.mujeres > 0 ? pExamen.administrativos?.mujeres : ''}</td>
                        <td style="border: 1px solid #000; padding: 1px; text-align: center;">0</td>
                        <td style="border: 1px solid #000; padding: 1px; text-align: center;">${escapeHtml(pExamen.administrativos?.total || 0)}</td>
                        <td style="border: 1px solid #000; padding: 1px; text-align: center;">${pExamen.docentes?.hombres > 0 ? pExamen.docentes?.hombres : ''}</td>
                        <td style="border: 1px solid #000; padding: 1px; text-align: center;">${pExamen.docentes?.mujeres > 0 ? pExamen.docentes?.mujeres : ''}</td>
                        <td style="border: 1px solid #000; padding: 1px; text-align: center;">0</td>
                        <td style="border: 1px solid #000; padding: 1px; text-align: center;">${escapeHtml(pExamen.docentes?.total || 0)}</td>
                        <td style="border: 1px solid #000; padding: 1px; text-align: center;">${escapeHtml(prevTotal)}</td>
                    </tr>
                    <tr style="font-weight: bold; text-align: center; font-size: 6px;">
                        <th style="border: 1px solid #000; background-color: #fde9d9; padding: 1.5px 2px; text-align: left; color: #000;">CURATIVO</th>
                        <th style="border: 1px solid #000; background-color: #fde9d9; padding: 1.5px 1px; color: #000;">MASCULINO</th>
                        <th style="border: 1px solid #000; background-color: #fde9d9; padding: 1.5px 1px; color: #000;">FEMENINO</th>
                        <th style="border: 1px solid #000; background-color: #fde9d9; padding: 1.5px 1px; color: #000;">LGBTI</th>
                        <th style="border: 1px solid #000; background-color: #d8e4bc; padding: 1.5px 1px; color: #000;">TOTAL</th>
                        <th style="border: 1px solid #000; background-color: #fde9d9; padding: 1.5px 1px; color: #000;">MASCULINO</th>
                        <th style="border: 1px solid #000; background-color: #fde9d9; padding: 1.5px 1px; color: #000;">FEMENINO</th>
                        <th style="border: 1px solid #000; background-color: #fde9d9; padding: 1.5px 1px; color: #000;">LGBTI</th>
                        <th style="border: 1px solid #000; background-color: #d8e4bc; padding: 1.5px 1px; color: #000;">TOTAL</th>
                        <th style="border: 1px solid #000; background-color: #fde9d9; padding: 1.5px 1px; color: #000;">MASCULINO</th>
                        <th style="border: 1px solid #000; background-color: #fde9d9; padding: 1.5px 1px; color: #000;">FEMENINO</th>
                        <th style="border: 1px solid #000; background-color: #fde9d9; padding: 1.5px 1px; color: #000;">LGBTI</th>
                        <th style="border: 1px solid #000; background-color: #d8e4bc; padding: 1.5px 1px; color: #000;">TOTAL</th>
                        <th style="border: 1px solid #000; background-color: #8db4e2; padding: 1.5px 1px; color: #000;">TOTAL</th>
                    </tr>
                    ${curRowsHtml}
                    <tr style="font-weight: bold; font-size: 6.5px; background-color: #e4dfec;">
                        <td style="border: 1px solid #000; padding: 1.5px 3px; text-align: center;">TOTAL</td>
                        <td style="border: 1px solid #000; padding: 1.5px 1px; text-align: center;">${escapeHtml(totEstH)}</td>
                        <td style="border: 1px solid #000; padding: 1.5px 1px; text-align: center;">${escapeHtml(totEstM)}</td>
                        <td style="border: 1px solid #000; padding: 1.5px 1px; text-align: center;">0</td>
                        <td style="border: 1px solid #000; padding: 1.5px 1px; text-align: center;">${escapeHtml(totEstT)}</td>
                        <td style="border: 1px solid #000; padding: 1.5px 1px; text-align: center;">${escapeHtml(totAdmH)}</td>
                        <td style="border: 1px solid #000; padding: 1.5px 1px; text-align: center;">${escapeHtml(totAdmM)}</td>
                        <td style="border: 1px solid #000; padding: 1.5px 1px; text-align: center;">0</td>
                        <td style="border: 1px solid #000; padding: 1.5px 1px; text-align: center;">${escapeHtml(totAdmT)}</td>
                        <td style="border: 1px solid #000; padding: 1.5px 1px; text-align: center;">${escapeHtml(totDocH)}</td>
                        <td style="border: 1px solid #000; padding: 1.5px 1px; text-align: center;">${escapeHtml(totDocM)}</td>
                        <td style="border: 1px solid #000; padding: 1.5px 1px; text-align: center;">0</td>
                        <td style="border: 1px solid #000; padding: 1.5px 1px; text-align: center;">${escapeHtml(totDocT)}</td>
                        <td style="border: 1px solid #000; padding: 1.5px 1px; text-align: center;">${escapeHtml(totGrandT)}</td>
                    </tr>
                </tbody>
            </table>
            <div style="display: flex; justify-content: flex-end; margin-bottom: 5px;">
                <div style="width: 7%; border: 1px solid #000; background-color: #fff; font-size: 6.5px; font-weight: bold; text-align: center; padding: 1px 0;">
                    ${escapeHtml(totGrandT)}
                </div>
            </div>
        `;
    };

    const formatCareerDisplayName = (cName) => {
        if (!cName) return '';
        const norm = cName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
        if (norm.includes('admin') || norm.includes('empresa')) return 'ADMINISTRACIÓN DE EMPRESAS';
        if (norm.includes('contab') || norm.includes('auditor')) return 'CONTABILIDAD';
        if (norm.includes('veterin')) return 'MEDICINA VETERINARIA';
        return cName.toUpperCase();
    };

    const renderSingleCareerTableHtml = (careerName) => {
        const cStats = data.careerIndividualStats?.[careerName] || {};
        const pVal = cStats.preventivo?.['Examen Odontológico'] || { hombres: 0, mujeres: 0, lgbti: 0, total: 0 };

        let curH = 0, curM = 0, curL = 0, curT = 0;
        const careerCurRowsHtml = (data.curativosDiagnoses || []).map(diag => {
            const r = cStats.curativo?.[diag] || { hombres: 0, mujeres: 0, lgbti: 0, total: 0 };
            curH += r.hombres || 0;
            curM += r.mujeres || 0;
            curL += r.lgbti || 0;
            curT += r.total || 0;

            return `
                <tr style="font-size: 6.5px;">
                    <td style="border: 1px solid #000; padding: 0.8px 3px; text-align: left;">${escapeHtml(diag)}</td>
                    <td style="border: 1px solid #000; padding: 0.8px 2px; text-align: center;">${r.hombres > 0 ? r.hombres : ''}</td>
                    <td style="border: 1px solid #000; padding: 0.8px 2px; text-align: center;">${r.mujeres > 0 ? r.mujeres : ''}</td>
                    <td style="border: 1px solid #000; padding: 0.8px 2px; text-align: center;">${r.lgbti > 0 ? r.lgbti : ''}</td>
                    <td style="border: 1px solid #000; padding: 0.8px 2px; text-align: center;">${escapeHtml(r.total || 0)}</td>
                </tr>
            `;
        }).join('');

        const cFinalH = (pVal.hombres || 0) + curH;
        const cFinalM = (pVal.mujeres || 0) + curM;
        const cFinalL = (pVal.lgbti || 0) + curL;
        const cFinalT = (pVal.total || 0) + curT;

        return `
            <table style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; border: 1.5px solid #000; font-size: 6.5px; margin-bottom: 2px;">
                <thead>
                    <tr>
                        <td style="border: 1px solid #000; padding: 2px; text-align: center; vertical-align: middle; background-color: #fff; width: 18%;">
                            <img src="${escapeHtml(logoUebTexto)}" alt="UEB" style="max-height: 22px; width: auto; object-fit: contain;" />
                        </td>
                        <td colspan="3" style="border: 1px solid #000; padding: 2px; text-align: center; font-weight: bold; font-size: 7.5px; background-color: #fff; line-height: 1.2;">
                            UNIVERSIDAD ESTATAL DE BOLÍVAR<br/>
                            BIENESTAR UNIVERSITARIO<br/>
                            ATENCIONES DE ODONTOLOGÍA - ${escapeHtml(selectedMonthText.toUpperCase())} ${escapeHtml(genReportYear)}
                        </td>
                        <td style="border: 1px solid #000; padding: 2px; text-align: center; vertical-align: middle; background-color: #fff; width: 18%;">
                            <img src="${escapeHtml(logoBienestar)}" alt="Bienestar Universitario" style="max-height: 22px; width: auto; object-fit: contain;" />
                        </td>
                    </tr>
                    <tr style="font-weight: bold; font-size: 6.5px;">
                        <th style="border: 1px solid #000; background-color: #ebf1de; padding: 2px 4px; text-align: left; color: #000; width: 50%;">
                            ${escapeHtml(formatCareerDisplayName(careerName))}
                        </th>
                        <th colspan="4" style="border: 1px solid #000; background-color: #fde9d9; padding: 2px; text-align: center; color: #000; width: 50%;">
                            ESTUDIANTES
                        </th>
                    </tr>
                    <tr style="font-weight: bold; font-size: 6px; text-align: center;">
                        <th style="border: 1px solid #000; background-color: #fde9d9; padding: 1.5px 3px; text-align: left; color: #000;">PREVENCION</th>
                        <th style="border: 1px solid #000; background-color: #fde9d9; padding: 1.5px 2px; color: #000; width: 12.5%;">MASCULINO</th>
                        <th style="border: 1px solid #000; background-color: #fde9d9; padding: 1.5px 2px; color: #000; width: 12.5%;">FEMENINO</th>
                        <th style="border: 1px solid #000; background-color: #fde9d9; padding: 1.5px 2px; color: #000; width: 11%;">LGBTI</th>
                        <th style="border: 1px solid #000; background-color: #d8e4bc; padding: 1.5px 2px; color: #000; width: 14%;">TOTAL</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style="font-size: 6.5px;">
                        <td style="border: 1px solid #000; padding: 1px 3px; text-align: left;">Examen Odontológico</td>
                        <td style="border: 1px solid #000; padding: 1px; text-align: center;">${pVal.hombres > 0 ? pVal.hombres : ''}</td>
                        <td style="border: 1px solid #000; padding: 1px; text-align: center;">${pVal.mujeres > 0 ? pVal.mujeres : ''}</td>
                        <td style="border: 1px solid #000; padding: 1px; text-align: center;"></td>
                        <td style="border: 1px solid #000; padding: 1px; text-align: center;">${escapeHtml(pVal.total || 0)}</td>
                    </tr>
                    <tr style="font-weight: bold; font-size: 6px; text-align: center;">
                        <th style="border: 1px solid #000; background-color: #fde9d9; padding: 1.5px 3px; text-align: left; color: #000;">CURATIVO</th>
                        <th style="border: 1px solid #000; background-color: #fde9d9; padding: 1.5px 2px; color: #000;">MASCULINO</th>
                        <th style="border: 1px solid #000; background-color: #fde9d9; padding: 1.5px 2px; color: #000;">FEMENINO</th>
                        <th style="border: 1px solid #000; background-color: #fde9d9; padding: 1.5px 2px; color: #000;">LGBTI</th>
                        <th style="border: 1px solid #000; background-color: #d8e4bc; padding: 1.5px 2px; color: #000;">TOTAL</th>
                    </tr>
                    ${careerCurRowsHtml}
                    <tr style="font-weight: bold; font-size: 6.5px; background-color: #e4dfec;">
                        <td style="border: 1px solid #000; padding: 1.5px 3px; text-align: center;">TOTAL</td>
                        <td style="border: 1px solid #000; padding: 1.5px; text-align: center;">${curH > 0 ? curH : 0}</td>
                        <td style="border: 1px solid #000; padding: 1.5px; text-align: center;">${curM > 0 ? curM : 0}</td>
                        <td style="border: 1px solid #000; padding: 1.5px; text-align: center;">0</td>
                        <td style="border: 1px solid #000; padding: 1.5px; text-align: center;">${escapeHtml(curT || 0)}</td>
                    </tr>
                </tbody>
            </table>
            <div style="display: flex; justify-content: flex-end; margin-bottom: 4px;">
                <div style="width: 14%; border: 1px solid #000; background-color: #fff; font-size: 6.5px; font-weight: bold; text-align: center; padding: 1px 0;">
                    ${escapeHtml(cFinalT || 0)}
                </div>
            </div>
        `;
    };

    const renderRemainingCareerPagesHtml = () => '';

    const renderProceduresRows = (procObj) => {
        const keys = Object.keys(procObj);
        let totalEstH = 0, totalEstM = 0, totalEstL = 0;
        let totalAdmH = 0, totalAdmM = 0, totalAdmL = 0;
        let totalDocH = 0, totalDocM = 0, totalDocL = 0;

        const rowsHtml = keys.map(k => {
            const r = procObj[k];
            totalEstH += r.estudiantes.hombres;
            totalEstM += r.estudiantes.mujeres;
            totalEstL += r.estudiantes.lgbti;
            totalAdmH += r.administrativos.hombres;
            totalAdmM += r.administrativos.mujeres;
            totalAdmL += r.administrativos.lgbti;
            totalDocH += r.docentes.hombres;
            totalDocM += r.docentes.mujeres;
            totalDocL += r.docentes.lgbti;

            return `
                <tr>
                    <td class="left-align font-bold" style="border: 1px solid #000; font-size: 8px; padding: 4px;">${escapeHtml(k)}</td>
                    <td style="border: 1px solid #000;">${escapeHtml(r.estudiantes.hombres || '')}</td>
                    <td style="border: 1px solid #000;">${escapeHtml(r.estudiantes.mujeres || '')}</td>
                    <td style="border: 1px solid #000;">${escapeHtml(r.estudiantes.lgbti || '')}</td>
                    <td class="font-bold bg-gray" style="border: 1px solid #000;">${escapeHtml(r.estudiantes.hombres + r.estudiantes.mujeres + r.estudiantes.lgbti)}</td>
                    <td style="border: 1px solid #000;">${escapeHtml(r.administrativos.hombres || '')}</td>
                    <td style="border: 1px solid #000;">${escapeHtml(r.administrativos.mujeres || '')}</td>
                    <td style="border: 1px solid #000;">${escapeHtml(r.administrativos.lgbti || '')}</td>
                    <td class="font-bold bg-gray" style="border: 1px solid #000;">${escapeHtml(r.administrativos.hombres + r.administrativos.mujeres + r.administrativos.lgbti)}</td>
                    <td style="border: 1px solid #000;">${escapeHtml(r.docentes.hombres || '')}</td>
                    <td style="border: 1px solid #000;">${escapeHtml(r.docentes.mujeres || '')}</td>
                    <td style="border: 1px solid #000;">${escapeHtml(r.docentes.lgbti || '')}</td>
                    <td class="font-bold bg-gray" style="border: 1px solid #000;">${escapeHtml(r.docentes.hombres + r.docentes.mujeres + r.docentes.lgbti)}</td>
                    <td class="bg-total font-bold" style="border: 1px solid #000;">${escapeHtml(r.estudiantes.hombres + r.estudiantes.mujeres + r.estudiantes.lgbti + r.administrativos.hombres + r.administrativos.mujeres + r.administrativos.lgbti + r.docentes.hombres + r.docentes.mujeres + r.docentes.lgbti)}</td>
                </tr>
            `;
        }).join('');

        const grandEstTotal = totalEstH + totalEstM + totalEstL;
        const grandAdmTotal = totalAdmH + totalAdmM + totalAdmL;
        const grandDocTotal = totalDocH + totalDocM + totalDocL;
        const grandTotal = grandEstTotal + grandAdmTotal + grandDocTotal;

        const footerHtml = `
            <tr class="bg-total font-bold" style="font-size: 8.5px; background-color: #cbd5e1 !important; border: 1px solid #000;">
                <td class="left-align" style="border: 1px solid #000; padding: 4px;">TOTAL</td>
                <td style="border: 1px solid #000;">${escapeHtml(totalEstH)}</td>
                <td style="border: 1px solid #000;">${escapeHtml(totalEstM)}</td>
                <td style="border: 1px solid #000;">${escapeHtml(totalEstL)}</td>
                <td style="border: 1px solid #000;">${escapeHtml(grandEstTotal)}</td>
                <td style="border: 1px solid #000;">${escapeHtml(totalAdmH)}</td>
                <td style="border: 1px solid #000;">${escapeHtml(totalAdmM)}</td>
                <td style="border: 1px solid #000;">${escapeHtml(totalAdmL)}</td>
                <td style="border: 1px solid #000;">${escapeHtml(grandAdmTotal)}</td>
                <td style="border: 1px solid #000;">${escapeHtml(totalDocH)}</td>
                <td style="border: 1px solid #000;">${escapeHtml(totalDocM)}</td>
                <td style="border: 1px solid #000;">${escapeHtml(totalDocL)}</td>
                <td style="border: 1px solid #000;">${escapeHtml(grandDocTotal)}</td>
                <td style="background-color: #94a3b8 !important; color: #fff; border: 1px solid #000;">${escapeHtml(grandTotal)}</td>
            </tr>
        `;
        return rowsHtml + footerHtml;
    };

    return `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>Informe General de Atenciones - ${escapeHtml(selectedMonthText)} ${escapeHtml(genReportYear)}</title>
            <style>
                @page {
                    size: A4 portrait;
                    margin: 10mm 12mm 12mm 12mm;
                }
                body {
                    font-family: Arial, sans-serif;
                    font-size: 9.5px;
                    line-height: 1.4;
                    color: #000;
                    margin: 0;
                    padding: 20px 0;
                    background: #e2e8f0;
                }
                .page-container {
                    width: 100%;
                    max-width: 210mm;
                    min-height: auto !important;
                    height: auto !important;
                    padding: 12mm 16mm 14mm 16mm;
                    margin: 0 auto 16px auto;
                    background: #fff;
                    box-shadow: 0 4px 14px rgba(0,0,0,0.12);
                    box-sizing: border-box;
                    border-radius: 4px;
                    position: relative;
                }
                table, .report-table, .branding-table, .general-data-table {
                    page-break-inside: avoid !important;
                    break-inside: avoid !important;
                }
                tr, tbody {
                    page-break-inside: avoid !important;
                    break-inside: avoid !important;
                }
                thead {
                    display: table-header-group;
                }
                .career-card, .table-card, .signature-card, .section-card {
                    page-break-inside: avoid !important;
                    break-inside: avoid !important;
                }
                .page-footer-container {
                    margin-top: 14px;
                    border-top: 1px solid #cbd5e1;
                    padding-top: 4px;
                    font-size: 7.5px;
                    line-height: 1.3;
                    color: #1e3a8a;
                    text-align: left;
                    font-family: Arial, sans-serif;
                    page-break-inside: avoid !important;
                    break-inside: avoid !important;
                }
                @media print {
                    body {
                        background: #fff !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .page-container {
                        width: 100% !important;
                        max-width: 100% !important;
                        min-height: auto !important;
                        height: auto !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        box-shadow: none !important;
                        background: #fff !important;
                        border-radius: 0 !important;
                    }
                }
                .branding-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 15px;
                }
                .branding-table td {
                    border: 1px solid #000;
                    padding: 6px;
                    text-align: center;
                    vertical-align: middle;
                }
                .branding-title {
                    font-size: 12px;
                    font-weight: bold;
                    color: #003366;
                    text-transform: uppercase;
                }
                .branding-subtitle {
                    font-size: 10px;
                    font-weight: bold;
                    color: #b71a34;
                    margin-top: 3px;
                }
                .general-data-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 20px;
                    font-size: 9px;
                }
                .general-data-table td, .general-data-table th {
                    border: 1px solid #000;
                    padding: 5px 6px;
                    vertical-align: top;
                }
                .general-data-table th {
                    background-color: #f1f5f9;
                    text-transform: uppercase;
                    font-weight: bold;
                    text-align: center;
                }
                .report-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 8px;
                    margin-bottom: 12px;
                    border: 1px solid #000;
                }
                .report-table th, .report-table td {
                    border: 1px solid #000;
                    padding: 4px;
                    text-align: center;
                }
                .report-table th {
                    font-weight: bold;
                    font-size: 8px;
                }
                .bg-gray {
                    background-color: #f1f5f9 !important;
                }
                .bg-total {
                    background-color: #cbd5e1 !important;
                }
                .left-align {
                    text-align: left !important;
                }
                .font-bold {
                    font-weight: bold;
                }
                .text-upper {
                    text-transform: uppercase;
                }
                h2 {
                    font-size: 11px;
                    font-weight: bold;
                    margin-top: 15px;
                    margin-bottom: 6px;
                    text-transform: uppercase;
                    border-bottom: 1px solid #000;
                    padding-bottom: 2px;
                }
                h3 {
                    font-size: 10px;
                    font-weight: bold;
                    margin-top: 12px;
                    margin-bottom: 5px;
                    text-transform: uppercase;
                }
                p, li {
                    font-size: 10px;
                    text-align: justify;
                    margin-bottom: 8px;
                }
                .footnote-address {
                    margin-top: 30px;
                    font-size: 7.5px;
                    color: #64748b;
                    border-top: 1px solid #cbd5e1;
                    padding-top: 6px;
                }
            </style>
        </head>
        <body>
            <!-- CUERPO CONTINUO DEL INFORME: ANTECEDENTES, ACTIVIDADES, RESULTADOS, GÉNERO, FACULTADES, PREVENTIVAS, CURATIVAS, PROCEDIMIENTOS, CONCLUSIONES, RECOMENDACIONES, ANEXOS, FIRMAS -->
            <div class="page-container" style="padding: 12mm 16mm 14mm 16mm; box-sizing: border-box; font-family: Arial, sans-serif;">
                <!-- Banner Institucional Superior -->
                <div style="margin-bottom: 12px; text-align: center;">
                    <img src="${headerBienestar}" alt="UEB | Bienestar Universitario" style="width: 100%; max-height: 48px; object-fit: contain;" />
                </div>

                <!-- Tabla de Control y Datos Generales -->
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 18px; font-family: Arial, sans-serif; border: 1px solid #4b5563;">
                    <!-- Fila 1: Logo UEB | Nombre Institución | Versión y Página -->
                    <tr>
                        <td style="width: 18%; text-align: center; vertical-align: middle; padding: 6px 8px; border: 1px solid #4b5563; background: #fff;">
                            <img src="${escapeHtml(logoUebTexto)}" alt="UEB" style="max-height: 38px; width: auto; max-width: 95%; object-fit: contain;" />
                        </td>
                        <td colspan="3" style="width: 60%; text-align: center; vertical-align: middle; padding: 6px 8px; border: 1px solid #4b5563; background: #fff;">
                            <div style="font-size: 13px; font-weight: bold; color: #1e3a8a; line-height: 1.2;">Universidad Estatal de Bolívar</div>
                            <div style="font-size: 11px; font-weight: bold; color: #3b82f6; margin-top: 3px;">Informe General</div>
                        </td>
                        <td style="width: 22%; padding: 0; vertical-align: middle; border: 1px solid #4b5563; background: #fff;">
                            <table style="width: 100%; height: 100%; border-collapse: collapse; font-size: 8px;">
                                <tr>
                                    <td style="width: 50%; border-right: 1px solid #4b5563; border-bottom: 1px solid #4b5563; padding: 4px; font-weight: bold; text-align: center; color: #1e293b;">VERSIÓN:</td>
                                    <td style="width: 50%; border-bottom: 1px solid #4b5563; padding: 4px; text-align: center;">1.0</td>
                                </tr>
                                <tr>
                                    <td style="width: 50%; border-right: 1px solid #4b5563; padding: 4px; font-weight: bold; text-align: center; color: #1e293b;">PÁGINA:</td>
                                    <td style="width: 50%; padding: 4px; text-align: center;"><sup>1</sup> de ${escapeHtml(totalPages)}</td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Fila 2: DATOS GENERALES -->
                    <tr>
                        <td colspan="5" style="background-color: #cbd5e1; text-align: center; padding: 4px; font-weight: bold; font-size: 10.5px; color: #1e3a8a; border: 1px solid #4b5563; text-transform: uppercase;">
                            DATOS GENERALES
                        </td>
                    </tr>

                    <!-- Fila 3: Fecha de Informe & No. De Informe -->
                    <tr style="font-size: 8.5px;">
                        <td style="background-color: #e2e8f0; border: 1px solid #4b5563; padding: 4px 6px; font-weight: 500; width: 18%;">Fecha de Informe:</td>
                        <td style="border: 1px solid #4b5563; padding: 4px 6px; text-align: center; width: 20%;">${escapeHtml(reportDateFormatted)}</td>
                        <td style="background-color: #e2e8f0; border: 1px solid #4b5563; padding: 4px 6px; font-weight: 500; width: 15%;">No. De Informe</td>
                        <td colspan="2" style="border: 1px solid #4b5563; padding: 4px 6px; text-align: center; width: 47%;">${escapeHtml(reportNo)}</td>
                    </tr>

                    <!-- Fila 4: Funcionario Responsable de Informe (Subcabecera Contacto) -->
                    <tr style="font-size: 8.5px; background-color: #e2e8f0;">
                        <td rowspan="3" style="border: 1px solid #4b5563; padding: 4px 6px; vertical-align: middle; font-weight: 500; width: 18%;">Funcionario Responsable de Informe</td>
                        <td rowspan="2" style="border: 1px solid #4b5563; padding: 4px 6px; vertical-align: middle; text-align: left; font-weight: 500; width: 20%;">Nombre</td>
                        <td colspan="2" style="border: 1px solid #4b5563; padding: 3px; text-align: center; font-weight: 500; width: 40%;">Contacto</td>
                        <td rowspan="2" style="border: 1px solid #4b5563; padding: 4px 6px; vertical-align: middle; text-align: left; font-weight: 500; width: 22%;">Cargo</td>
                    </tr>

                    <!-- Fila 5: Extensión Telefónica y Correo Electrónico sub-headers -->
                    <tr style="font-size: 7.5px; background-color: #e2e8f0;">
                        <td style="border: 1px solid #4b5563; padding: 2px 4px; text-align: left; font-weight: 500; width: 15%;">Extensión Telefónica</td>
                        <td style="border: 1px solid #4b5563; padding: 2px 4px; text-align: left; font-weight: 500; width: 25%;">Correo Electrónico</td>
                    </tr>

                    <!-- Fila 6: Datos del Funcionario -->
                    <tr style="font-size: 8px;">
                        <td style="border: 1px solid #4b5563; padding: 5px; text-align: left;">${escapeHtml(doctorNameText)}</td>
                        <td style="border: 1px solid #4b5563; padding: 5px; text-align: center;">167 &nbsp; 168 &nbsp; 169</td>
                        <td style="border: 1px solid #4b5563; padding: 5px; text-align: left;">${escapeHtml(doctorEmail)}</td>
                        <td style="border: 1px solid #4b5563; padding: 5px; text-align: left;">Odontóloga de Bienestar Universitario</td>
                    </tr>

                    <!-- Fila 7: Informe dirigido a: (Subcabecera Contacto) -->
                    <tr style="font-size: 8.5px; background-color: #e2e8f0;">
                        <td rowspan="3" style="border: 1px solid #4b5563; padding: 4px 6px; vertical-align: middle; font-weight: 500; width: 18%;">Informe dirigido a:</td>
                        <td rowspan="2" style="border: 1px solid #4b5563; padding: 4px 6px; vertical-align: middle; text-align: left; font-weight: 500; width: 20%;">Nombre</td>
                        <td colspan="2" style="border: 1px solid #4b5563; padding: 3px; text-align: center; font-weight: 500; width: 40%;">Contacto</td>
                        <td rowspan="2" style="border: 1px solid #4b5563; padding: 4px 6px; vertical-align: middle; text-align: left; font-weight: 500; width: 22%;">Cargo</td>
                    </tr>

                    <!-- Fila 8: Extensión Telefónica y Correo Electrónico sub-headers -->
                    <tr style="font-size: 7.5px; background-color: #e2e8f0;">
                        <td style="border: 1px solid #4b5563; padding: 2px 4px; text-align: left; font-weight: 500; width: 15%;">Extensión Telefónica</td>
                        <td style="border: 1px solid #4b5563; padding: 2px 4px; text-align: left; font-weight: 500; width: 25%;">Correo Electrónico</td>
                    </tr>

                    <!-- Fila 9: Datos del Destinatario -->
                    <tr style="font-size: 8px;">
                        <td style="border: 1px solid #4b5563; padding: 5px; text-align: left;">Michel Gaibor Vásquez</td>
                        <td style="border: 1px solid #4b5563; padding: 5px; text-align: center;">167 &nbsp; 168 &nbsp; 169</td>
                        <td style="border: 1px solid #4b5563; padding: 5px; text-align: left;">sgaibor@ueb.gob.ec</td>
                        <td style="border: 1px solid #4b5563; padding: 5px; text-align: left;">Coordinadora de Bienestar Universitario</td>
                    </tr>

                    <!-- Fila 10: ASUNTO -->
                    <tr>
                        <td colspan="5" style="background-color: #eee9f6; border: 1px solid #4b5563; padding: 5px 8px; font-size: 8.5px; text-align: left;">
                            <strong>ASUNTO:</strong> Informe mensual de atenciones odontológicas del mes de ${escapeHtml(selectedMonthText.toLowerCase())}.
                        </td>
                    </tr>
                </table>

                <!-- Sección 1: ANTECEDENTES -->
                <div style="font-size: 10px; font-weight: bold; margin-top: 14px; margin-bottom: 6px; text-transform: uppercase; color: #000;">
                    1. ANTECEDENTES
                </div>
                <p style="font-size: 8.5px; line-height: 1.4; text-align: justify; margin-bottom: 8px; color: #000;">
                    Bienestar Universitario, fue creado mediante resolución del Honorable Consejo Estudiantil en el año 1990 en conjunto con los demás departamentos que conforman la estructura administrativa de la institución. Dentro de su organización interna, se la concibió como un departamento de atención médica, odontológica, psicológica y servicio social dirigido a los miembros de la comunidad universitaria.
                </p>
                <p style="font-size: 8.5px; line-height: 1.4; text-align: justify; margin-bottom: 12px; color: #000;">
                    Bienestar Universitario, a través del área de odontología brinda atención diaria a la comunidad universitaria, conformada por estudiantes, docentes y personal administrativo, asegurando la prestación continua y eficiente en la atención preventiva y curativa a los usuarios.
                </p>

                <!-- Sección 2: ACTIVIDADES -->
                <div style="font-size: 10px; font-weight: bold; margin-top: 14px; margin-bottom: 6px; text-transform: uppercase; color: #000;">
                    2. ACTIVIDADES
                </div>
                <div style="font-size: 8.5px; line-height: 1.45; color: #000; margin-bottom: 14px; padding-left: 5px;">
                    <div>• Promoción de la salud buco-dental</div>
                    <div>• Atención Preventiva.</div>
                    <div>• Atención Curativa o Morbilidad.</div>
                    <div>• Tratamiento y procedimientos oportuno</div>
                    <div>• Elaboración de Historia Clínica Odontológica a los pacientes.</div>
                    <div>• Registro de atenciones.</div>
                    <div>• Elaboración del informe mensual de actividades.</div>
                </div>

                <!-- Sección 3: ANÁLISIS DE RESULTADOS -->
                <div style="font-size: 10px; font-weight: bold; margin-top: 14px; margin-bottom: 8px; text-transform: uppercase; color: #000;">
                    3. ANÁLISIS DE RESULTADOS
                </div>
                <table style="width: 250px; border-collapse: collapse; margin-left: 140px; margin-bottom: 15px; border: 1px solid #4b5563; font-family: Arial, sans-serif;">
                    <thead>
                        <tr style="background-color: #cbd5e1; font-size: 8.5px; font-weight: bold;">
                            <th style="border: 1px solid #4b5563; padding: 4px 8px; text-align: left; width: 65%;">COMUNIDAD UNIVERSITARIA</th>
                            <th style="border: 1px solid #4b5563; padding: 4px 8px; text-align: center; width: 35%;">TOTAL</th>
                        </tr>
                    </thead>
                    <tbody style="font-size: 8.5px;">
                        <tr>
                            <td style="border: 1px solid #4b5563; padding: 3px 8px; text-align: left;">ESTUDIANTES</td>
                            <td style="border: 1px solid #4b5563; padding: 3px 8px; text-align: center;">${escapeHtml(data.totalEstudiantes)}</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #4b5563; padding: 3px 8px; text-align: left;">ADMINISTRATIVOS</td>
                            <td style="border: 1px solid #4b5563; padding: 3px 8px; text-align: center;">${escapeHtml(data.totalAdministrativos)}</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #4b5563; padding: 3px 8px; text-align: left;">DOCENTES</td>
                            <td style="border: 1px solid #4b5563; padding: 3px 8px; text-align: center;">${escapeHtml(data.totalDocentes)}</td>
                        </tr>
                        <tr style="background-color: #cbd5e1; font-weight: bold;">
                            <td style="border: 1px solid #4b5563; padding: 3px 8px; text-align: left;">TOTAL</td>
                            <td style="border: 1px solid #4b5563; padding: 3px 8px; text-align: center;">${escapeHtml(data.totalPacientes)}</td>
                        </tr>
                    </tbody>
                </table>

                <!-- Párrafo introductorio -->
                <p style="font-size: 8.5px; line-height: 1.35; text-align: justify; margin: 0 0 8px 0; color: #1e293b;">
                    Las actividades realizadas durante el mes de ${escapeHtml(selectedMonthText.toLowerCase())} en las atenciones odontológicas a la Comunidad Universitaria dan un total de ${escapeHtml(data.totalPacientes)} pacientes, ${escapeHtml(data.totalEstudiantes)} estudiantes, ${escapeHtml(data.totalAdministrativos)} Administrativos y ${escapeHtml(data.totalDocentes)} Docentes.
                </p>

                <!-- DATOS POR GÉNERO -->
                <div style="font-weight: bold; font-size: 9px; margin-top: 10px; margin-bottom: 5px; color: #000;">
                    DATOS POR GÉNERO:
                </div>

                <table style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; border: 1px solid #4b5563; margin-bottom: 6px;">
                    <thead>
                        <tr style="background-color: #cbd5e1; font-weight: bold; font-size: 8px; text-align: center;">
                            <th style="border: 1px solid #4b5563; padding: 2px 6px; text-align: left; width: 40%;">COMUNIDAD UNIVERSITARIA</th>
                            <th style="border: 1px solid #4b5563; padding: 2px 4px; width: 15%;">HOMBRES</th>
                            <th style="border: 1px solid #4b5563; padding: 2px 4px; width: 15%;">MUJERES</th>
                            <th style="border: 1px solid #4b5563; padding: 2px 4px; width: 15%;">LGBTI</th>
                            <th style="border: 1px solid #4b5563; padding: 2px 4px; width: 15%;">TOTAL</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style="font-size: 8px;">
                            <td style="border: 1px solid #4b5563; padding: 2px 6px; text-align: left;">ESTUDIANTES</td>
                            <td style="border: 1px solid #4b5563; padding: 2px 4px; text-align: center;">${escapeHtml(data.genderCounts?.estudiantes?.hombres || 0)}</td>
                            <td style="border: 1px solid #4b5563; padding: 2px 4px; text-align: center;">${escapeHtml(data.genderCounts?.estudiantes?.mujeres || 0)}</td>
                            <td style="border: 1px solid #4b5563; padding: 2px 4px; text-align: center;">${escapeHtml(data.genderCounts?.estudiantes?.lgbti || 0)}</td>
                            <td style="border: 1px solid #4b5563; padding: 2px 4px; text-align: center; font-weight: bold;">${escapeHtml(data.totalEstudiantes || 0)}</td>
                        </tr>
                        <tr style="font-size: 8px;">
                            <td style="border: 1px solid #4b5563; padding: 2px 6px; text-align: left;">ADMINISTRATIVOS</td>
                            <td style="border: 1px solid #4b5563; padding: 2px 4px; text-align: center;">${escapeHtml(data.genderCounts?.administrativos?.hombres || 0)}</td>
                            <td style="border: 1px solid #4b5563; padding: 2px 4px; text-align: center;">${escapeHtml(data.genderCounts?.administrativos?.mujeres || 0)}</td>
                            <td style="border: 1px solid #4b5563; padding: 2px 4px; text-align: center;">${escapeHtml(data.genderCounts?.administrativos?.lgbti || 0)}</td>
                            <td style="border: 1px solid #4b5563; padding: 2px 4px; text-align: center; font-weight: bold;">${escapeHtml(data.totalAdministrativos || 0)}</td>
                        </tr>
                        <tr style="font-size: 8px;">
                            <td style="border: 1px solid #4b5563; padding: 2px 6px; text-align: left;">DOCENTES</td>
                            <td style="border: 1px solid #4b5563; padding: 2px 4px; text-align: center;">${escapeHtml(data.genderCounts?.docentes?.hombres || 0)}</td>
                            <td style="border: 1px solid #4b5563; padding: 2px 4px; text-align: center;">${escapeHtml(data.genderCounts?.docentes?.mujeres || 0)}</td>
                            <td style="border: 1px solid #4b5563; padding: 2px 4px; text-align: center;">${escapeHtml(data.genderCounts?.docentes?.lgbti || 0)}</td>
                            <td style="border: 1px solid #4b5563; padding: 2px 4px; text-align: center; font-weight: bold;">${escapeHtml(data.totalDocentes || 0)}</td>
                        </tr>
                        <tr style="background-color: #cbd5e1; font-weight: bold; font-size: 8px;">
                            <td style="border: 1px solid #4b5563; padding: 2px 6px; text-align: left;">TOTAL</td>
                            <td style="border: 1px solid #4b5563; padding: 2px 4px; text-align: center;">${escapeHtml(totalH)}</td>
                            <td style="border: 1px solid #4b5563; padding: 2px 4px; text-align: center;">${escapeHtml(totalM)}</td>
                            <td style="border: 1px solid #4b5563; padding: 2px 4px; text-align: center;">${escapeHtml(totalL)}</td>
                            <td style="border: 1px solid #4b5563; padding: 2px 4px; text-align: center;">${escapeHtml(data.totalPacientes || 0)}</td>
                        </tr>
                    </tbody>
                </table>

                <!-- Narrativa Género -->
                <p style="font-size: 8.5px; line-height: 1.35; text-align: justify; margin: 0 0 10px 0; color: #1e293b;">
                    ${genderNarrative}
                </p>

                <!-- POR FACULTADES -->
                <div style="font-weight: bold; font-size: 9px; margin-top: 10px; margin-bottom: 5px; color: #000;">
                    POR FACULTADES:
                </div>

                <!-- Facultad 1: CIENCIAS DE LA SALUD -->
                ${renderFacultyTableHtml('CIENCIAS DE LA SALUD', data.statsByFacultyAndCareer?.['CIENCIAS DE LA SALUD'] || {})}
                <p style="font-size: 8px; line-height: 1.35; text-align: justify; margin: 0 0 6px 0; color: #1e293b;">
                    ${renderFacultyNarrativeText('CIENCIAS DE LA SALUD', data.statsByFacultyAndCareer?.['CIENCIAS DE LA SALUD'] || {})}
                </p>

                <!-- Facultad 2: JURISPRUDENCIA -->
                ${renderFacultyTableHtml('JURISPRUDENCIA', data.statsByFacultyAndCareer?.['JURISPRUDENCIA'] || {})}
                <p style="font-size: 8px; line-height: 1.35; text-align: justify; margin: 0 0 6px 0; color: #1e293b;">
                    ${renderFacultyNarrativeText('JURISPRUDENCIA', data.statsByFacultyAndCareer?.['JURISPRUDENCIA'] || {})}
                </p>

                <!-- Facultad 3: CIENCIAS ADMINISTRATIVAS -->
                ${renderFacultyTableHtml('CIENCIAS ADMINISTRATIVAS', data.statsByFacultyAndCareer?.['CIENCIAS ADMINISTRATIVAS'] || {})}
                <p style="font-size: 8px; line-height: 1.35; text-align: justify; margin: 0 0 6px 0; color: #1e293b;">
                    ${renderFacultyNarrativeText('CIENCIAS ADMINISTRATIVAS', data.statsByFacultyAndCareer?.['CIENCIAS ADMINISTRATIVAS'] || {})}
                </p>

                <!-- Facultad 4: CIENCIAS AGROPECUARIAS -->
                ${renderFacultyTableHtml('CIENCIAS AGROPECUARIAS', data.statsByFacultyAndCareer?.['CIENCIAS AGROPECUARIAS'] || {})}
                <p style="font-size: 8px; line-height: 1.35; text-align: justify; margin: 0 0 6px 0; color: #1e293b;">
                    ${renderFacultyNarrativeText('CIENCIAS AGROPECUARIAS', data.statsByFacultyAndCareer?.['CIENCIAS AGROPECUARIAS'] || {})}
                </p>

                <!-- Facultad 5: CIENCIAS DE LA EDUCACIÓN -->
                ${renderFacultyTableHtml('CIENCIAS DE LA EDUCACIÓN', data.statsByFacultyAndCareer?.['CIENCIAS DE LA EDUCACIÓN'] || {})}
                <p style="font-size: 8px; line-height: 1.35; text-align: justify; margin: 0 0 10px 0; color: #1e293b;">
                    ${renderFacultyNarrativeText('CIENCIAS DE LA EDUCACIÓN', data.statsByFacultyAndCareer?.['CIENCIAS DE LA EDUCACIÓN'] || {})}
                </p>

                <!-- Sección ATENCIONES PREVENTIVAS -->
                <div style="font-weight: bold; font-size: 9px; margin-top: 12px; margin-bottom: 6px; color: #000; text-transform: uppercase;">
                    ATENCIONES PREVENTIVAS
                </div>

                <!-- Tabla ATENCIONES PREVENTIVAS -->
                <table style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; border: 1px solid #000; margin-bottom: 6px; font-size: 7.5px;">
                    <thead>
                        <tr style="font-weight: bold; text-align: center;">
                            <th style="border: 1px solid #000; background-color: #fde9d9; padding: 2px 4px; width: 16%; color: #000;">COMUNIDAD<br/>UNIVERSITARIA</th>
                            <th colspan="4" style="border: 1px solid #000; background-color: #fde9d9; padding: 2px 4px; width: 25%; color: #000;">ESTUDIANTES</th>
                            <th colspan="4" style="border: 1px solid #000; background-color: #fde9d9; padding: 2px 4px; width: 25%; color: #000;">ADMINISTRATIVOS</th>
                            <th colspan="4" style="border: 1px solid #000; background-color: #fde9d9; padding: 2px 4px; width: 25%; color: #000;">DOCENTES</th>
                            <th style="border: 1px solid #000; background-color: #8db4e2; padding: 2px 4px; width: 9%; color: #000;">TOTAL</th>
                        </tr>
                        <tr style="font-weight: bold; text-align: center; font-size: 7px;">
                            <th style="border: 1px solid #000; background-color: #fcd5b4; padding: 2px 4px; color: #000;">PREVENCIÓN</th>
                            <th style="border: 1px solid #000; background-color: #fcd5b4; padding: 2px 2px; color: #000;">MASCULINO</th>
                            <th style="border: 1px solid #000; background-color: #fcd5b4; padding: 2px 2px; color: #000;">FEMENINO</th>
                            <th style="border: 1px solid #000; background-color: #fcd5b4; padding: 2px 2px; color: #000;">LGBTI</th>
                            <th style="border: 1px solid #000; background-color: #d8e4bc; padding: 2px 2px; color: #000;">TOTAL</th>
                            <th style="border: 1px solid #000; background-color: #fcd5b4; padding: 2px 2px; color: #000;">MASCULINO</th>
                            <th style="border: 1px solid #000; background-color: #fcd5b4; padding: 2px 2px; color: #000;">FEMENINO</th>
                            <th style="border: 1px solid #000; background-color: #fcd5b4; padding: 2px 2px; color: #000;">LGBTI</th>
                            <th style="border: 1px solid #000; background-color: #d8e4bc; padding: 2px 2px; color: #000;">TOTAL</th>
                            <th style="border: 1px solid #000; background-color: #fcd5b4; padding: 2px 2px; color: #000;">MASCULINO</th>
                            <th style="border: 1px solid #000; background-color: #fcd5b4; padding: 2px 2px; color: #000;">FEMENINO</th>
                            <th style="border: 1px solid #000; background-color: #fcd5b4; padding: 2px 2px; color: #000;">LGBTI</th>
                            <th style="border: 1px solid #000; background-color: #d8e4bc; padding: 2px 2px; color: #000;">TOTAL</th>
                            <th style="border: 1px solid #000; background-color: #8db4e2; padding: 2px 2px; color: #000;">TOTAL</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style="font-size: 7.5px;">
                            <td style="border: 1px solid #000; padding: 2px 4px; text-align: left;">Examen<br/>Odontológico</td>
                            <td style="border: 1px solid #000; padding: 2px 2px; text-align: center;">${escapeHtml(prevExamen.estudiantes?.hombres || 0)}</td>
                            <td style="border: 1px solid #000; padding: 2px 2px; text-align: center;">${escapeHtml(prevExamen.estudiantes?.mujeres || 0)}</td>
                            <td style="border: 1px solid #000; padding: 2px 2px; text-align: center;">${escapeHtml(prevExamen.estudiantes?.lgbti || 0)}</td>
                            <td style="border: 1px solid #000; padding: 2px 2px; text-align: center; font-weight: bold;">${escapeHtml(prevExamen.estudiantes?.total || 0)}</td>
                            <td style="border: 1px solid #000; padding: 2px 2px; text-align: center;">${escapeHtml(prevExamen.administrativos?.hombres || 0)}</td>
                            <td style="border: 1px solid #000; padding: 2px 2px; text-align: center;">${escapeHtml(prevExamen.administrativos?.mujeres || 0)}</td>
                            <td style="border: 1px solid #000; padding: 2px 2px; text-align: center;">${escapeHtml(prevExamen.administrativos?.lgbti || 0)}</td>
                            <td style="border: 1px solid #000; padding: 2px 2px; text-align: center; font-weight: bold;">${escapeHtml(prevExamen.administrativos?.total || 0)}</td>
                            <td style="border: 1px solid #000; padding: 2px 2px; text-align: center;">${escapeHtml(prevExamen.docentes?.hombres || 0)}</td>
                            <td style="border: 1px solid #000; padding: 2px 2px; text-align: center;">${escapeHtml(prevExamen.docentes?.mujeres || 0)}</td>
                            <td style="border: 1px solid #000; padding: 2px 2px; text-align: center;">${escapeHtml(prevExamen.docentes?.lgbti || 0)}</td>
                            <td style="border: 1px solid #000; padding: 2px 2px; text-align: center; font-weight: bold;">${escapeHtml(prevExamen.docentes?.total || 0)}</td>
                            <td style="border: 1px solid #000; padding: 2px 2px; text-align: center; font-weight: bold;">${escapeHtml(prevTotal)}</td>
                        </tr>
                    </tbody>
                </table>

                <!-- Narrativa ATENCIONES PREVENTIVAS -->
                <p style="font-size: 8px; line-height: 1.35; margin: 4px 0 10px 0; color: #000;">
                    ${preventivasNarrative}
                </p>

                <!-- Sección ATENCIONES CURATIVAS (TABLA COMPLETA UNIFICADA) -->
                <div style="font-weight: bold; font-size: 9px; margin-top: 12px; margin-bottom: 6px; color: #000; text-transform: uppercase;">
                    ATENCIONES CURATIVAS
                </div>

                <table style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; border: 1px solid #000; margin-bottom: 6px; font-size: 7px;">
                    <thead>
                        <tr style="font-weight: bold; text-align: center;">
                            <th style="border: 1px solid #000; background-color: #fde9d9; padding: 2px 4px; width: 18%; color: #000;">COMUNIDAD<br/>UNIVERSITARIA</th>
                            <th colspan="4" style="border: 1px solid #000; background-color: #fde9d9; padding: 2px 4px; width: 23%; color: #000;">ESTUDIANTES</th>
                            <th colspan="4" style="border: 1px solid #000; background-color: #fde9d9; padding: 2px 4px; width: 23%; color: #000;">ADMINISTRATIVOS</th>
                            <th colspan="4" style="border: 1px solid #000; background-color: #fde9d9; padding: 2px 4px; width: 23%; color: #000;">DOCENTES</th>
                            <th style="border: 1px solid #000; background-color: #8db4e2; padding: 2px 4px; width: 8%; color: #000;">TOTAL</th>
                        </tr>
                        <tr style="font-weight: bold; text-align: center; font-size: 7px;">
                            <th style="border: 1px solid #000; background-color: #fcd5b4; padding: 2px 4px; color: #000; text-align: left; width: 18%;">CURATIVO</th>
                            <th style="border: 1px solid #000; background-color: #fcd5b4; padding: 1.5px 2px; color: #000; width: 6%;">MASCULINO</th>
                            <th style="border: 1px solid #000; background-color: #fcd5b4; padding: 1.5px 2px; color: #000; width: 6%;">FEMENINO</th>
                            <th style="border: 1px solid #000; background-color: #fcd5b4; padding: 1.5px 2px; color: #000; width: 5%;">LGBTI</th>
                            <th style="border: 1px solid #000; background-color: #d8e4bc; padding: 1.5px 2px; color: #000; width: 6%;">TOTAL</th>
                            <th style="border: 1px solid #000; background-color: #fcd5b4; padding: 1.5px 2px; color: #000; width: 6%;">MASCULINO</th>
                            <th style="border: 1px solid #000; background-color: #fcd5b4; padding: 1.5px 2px; color: #000; width: 6%;">FEMENINO</th>
                            <th style="border: 1px solid #000; background-color: #fcd5b4; padding: 1.5px 2px; color: #000; width: 5%;">LGBTI</th>
                            <th style="border: 1px solid #000; background-color: #d8e4bc; padding: 1.5px 2px; color: #000; width: 6%;">TOTAL</th>
                            <th style="border: 1px solid #000; background-color: #fcd5b4; padding: 1.5px 2px; color: #000; width: 6%;">MASCULINO</th>
                            <th style="border: 1px solid #000; background-color: #fcd5b4; padding: 1.5px 2px; color: #000; width: 6%;">FEMENINO</th>
                            <th style="border: 1px solid #000; background-color: #fcd5b4; padding: 1.5px 2px; color: #000; width: 5%;">LGBTI</th>
                            <th style="border: 1px solid #000; background-color: #d8e4bc; padding: 1.5px 2px; color: #000; width: 6%;">TOTAL</th>
                            <th style="border: 1px solid #000; background-color: #8db4e2; padding: 1.5px 2px; color: #000; width: 8%;">TOTAL</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${curativosRowsHtml}
                        <tr style="background-color: #cbd5e1; font-weight: bold; font-size: 7px;">
                            <td style="border: 1px solid #000; padding: 2px 4px; text-align: left;">TOTAL</td>
                            <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${escapeHtml(totEstCurH)}</td>
                            <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${escapeHtml(totEstCurM)}</td>
                            <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${escapeHtml(totEstCurL)}</td>
                            <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${escapeHtml(totEstCurT)}</td>
                            <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${escapeHtml(totAdmCurH)}</td>
                            <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${escapeHtml(totAdmCurM)}</td>
                            <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${escapeHtml(totAdmCurL)}</td>
                            <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${escapeHtml(totAdmCurT)}</td>
                            <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${escapeHtml(totDocCurH)}</td>
                            <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${escapeHtml(totDocCurM)}</td>
                            <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${escapeHtml(totDocCurL)}</td>
                            <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${escapeHtml(totDocCurT)}</td>
                            <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${escapeHtml(totGrandCurT)}</td>
                        </tr>
                    </tbody>
                </table>

                <!-- Narrativa ATENCIONES CURATIVAS -->
                <div style="font-size: 8px; line-height: 1.35; margin: 4px 0 10px 0; color: #000; text-align: justify;">
                    ${curativasNarrativeHtml}
                </div>

                <!-- Sección PROCEDIMIENTOS PREVENTIVOS -->
                <div style="font-weight: bold; font-size: 9px; margin-top: 12px; margin-bottom: 5px; color: #000; text-transform: uppercase;">
                    PROCEDIMIENTOS PREVENTIVOS
                </div>

                <table style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; border: 1px solid #000; margin-bottom: 5px; font-size: 7px;">
                    <thead>
                        <tr style="font-weight: bold; text-align: center;">
                            <th style="border: 1px solid #000; background-color: #fde9d9; padding: 2px 4px; width: 18%; color: #000; text-align: left;">PROCEDIMIENTOS</th>
                            <th colspan="4" style="border: 1px solid #000; background-color: #fde9d9; padding: 2px 4px; width: 23%; color: #000;">ESTUDIANTES</th>
                            <th colspan="4" style="border: 1px solid #000; background-color: #fde9d9; padding: 2px 4px; width: 23%; color: #000;">ADMINISTRATIVOS</th>
                            <th colspan="4" style="border: 1px solid #000; background-color: #fde9d9; padding: 2px 4px; width: 23%; color: #000;">DOCENTES</th>
                            <th style="border: 1px solid #000; background-color: #8db4e2; padding: 2px 4px; width: 8%; color: #000;">TOTAL</th>
                        </tr>
                        <tr style="font-weight: bold; text-align: center;">
                            <th style="border: 1px solid #000; background-color: #fcd5b4; padding: 1.5px 4px; color: #000; text-align: left;">PREVENCIÓN</th>
                            <th style="border: 1px solid #000; background-color: #fcd5b4; padding: 1.5px 2px; color: #000;">MASCULINO</th>
                            <th style="border: 1px solid #000; background-color: #fcd5b4; padding: 1.5px 2px; color: #000;">FEMENINO</th>
                            <th style="border: 1px solid #000; background-color: #fcd5b4; padding: 1.5px 2px; color: #000;">LGBTI</th>
                            <th style="border: 1px solid #000; background-color: #d8e4bc; padding: 1.5px 2px; color: #000;">TOTAL</th>
                            <th style="border: 1px solid #000; background-color: #fcd5b4; padding: 1.5px 2px; color: #000;">MASCULINO</th>
                            <th style="border: 1px solid #000; background-color: #fcd5b4; padding: 1.5px 2px; color: #000;">FEMENINO</th>
                            <th style="border: 1px solid #000; background-color: #fcd5b4; padding: 1.5px 2px; color: #000;">LGBTI</th>
                            <th style="border: 1px solid #000; background-color: #d8e4bc; padding: 1.5px 2px; color: #000;">TOTAL</th>
                            <th style="border: 1px solid #000; background-color: #fcd5b4; padding: 1.5px 2px; color: #000;">MASCULINO</th>
                            <th style="border: 1px solid #000; background-color: #fcd5b4; padding: 1.5px 2px; color: #000;">FEMENINO</th>
                            <th style="border: 1px solid #000; background-color: #fcd5b4; padding: 1.5px 2px; color: #000;">LGBTI</th>
                            <th style="border: 1px solid #000; background-color: #d8e4bc; padding: 1.5px 2px; color: #000;">TOTAL</th>
                            <th style="border: 1px solid #000; background-color: #8db4e2; padding: 1.5px 2px; color: #000;">TOTAL</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="border: 1px solid #000; padding: 1.5px 4px; text-align: left;">PROFILAXIS</td>
                            <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${escapeHtml(profE.hombres || '')}</td>
                            <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${escapeHtml(profE.mujeres || '')}</td>
                            <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${escapeHtml(profE.lgbti || 0)}</td>
                            <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; font-weight: bold;">${escapeHtml(profET)}</td>
                            <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${escapeHtml(profA.hombres || '')}</td>
                            <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${escapeHtml(profA.mujeres || '')}</td>
                            <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${escapeHtml(profA.lgbti || 0)}</td>
                            <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; font-weight: bold;">${escapeHtml(profAT)}</td>
                            <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${escapeHtml(profD.hombres || '')}</td>
                            <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${escapeHtml(profD.mujeres || '')}</td>
                            <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${escapeHtml(profD.lgbti || 0)}</td>
                            <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; font-weight: bold;">${escapeHtml(profDT)}</td>
                            <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; font-weight: bold;">${escapeHtml(profTotal)}</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #000; padding: 1.5px 4px; text-align: left;">FLUORIZACIÓN</td>
                            <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${escapeHtml(fluoE.hombres || '')}</td>
                            <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${escapeHtml(fluoE.mujeres || '')}</td>
                            <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${escapeHtml(fluoE.lgbti || 0)}</td>
                            <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; font-weight: bold;">${escapeHtml(fluoET)}</td>
                            <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${escapeHtml(fluoA.hombres || '')}</td>
                            <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${escapeHtml(fluoA.mujeres || '')}</td>
                            <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${escapeHtml(fluoA.lgbti || 0)}</td>
                            <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; font-weight: bold;">${escapeHtml(fluoAT)}</td>
                            <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${escapeHtml(fluoD.hombres || '')}</td>
                            <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${escapeHtml(fluoD.mujeres || '')}</td>
                            <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${escapeHtml(fluoD.lgbti || 0)}</td>
                            <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; font-weight: bold;">${escapeHtml(fluoDT)}</td>
                            <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; font-weight: bold;">${escapeHtml(fluoTotal)}</td>
                        </tr>
                        <tr style="background-color: #cbd5e1; font-weight: bold; font-size: 7px;">
                            <td style="border: 1px solid #000; padding: 1.5px 4px; text-align: left;">TOTAL</td>
                            <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${escapeHtml(totProcH_E)}</td>
                            <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${escapeHtml(totProcM_E)}</td>
                            <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${escapeHtml(totProcL_E)}</td>
                            <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${escapeHtml(totProcT_E)}</td>
                            <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${escapeHtml(totProcH_A)}</td>
                            <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${escapeHtml(totProcM_A)}</td>
                            <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${escapeHtml(totProcL_A)}</td>
                            <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${escapeHtml(totProcT_A)}</td>
                            <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${escapeHtml(totProcH_D)}</td>
                            <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${escapeHtml(totProcM_D)}</td>
                            <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${escapeHtml(totProcL_D)}</td>
                            <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${escapeHtml(totProcT_D)}</td>
                            <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${escapeHtml(totProcGrand)}</td>
                        </tr>
                    </tbody>
                </table>

                <!-- Narrativa PROCEDIMIENTOS PREVENTIVOS -->
                <div style="font-size: 8px; line-height: 1.35; margin: 4px 0 10px 0; color: #000; text-align: justify;">
                    ${procPrevNarrativeHtml}
                </div>

                <!-- Sección PROCEDIMIENTOS DE MORBILIDAD (TABLA COMPLETA UNIFICADA) -->
                <div style="font-weight: bold; font-size: 9px; margin-top: 12px; margin-bottom: 5px; color: #000; text-transform: uppercase;">
                    PROCEDIMIENTOS DE MORBILIDAD
                </div>

                <table style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; border: 1px solid #000; margin-bottom: 6px; font-size: 7px;">
                    <thead>
                        <tr style="font-weight: bold; text-align: center;">
                            <th style="border: 1px solid #000; background-color: #fde9d9; padding: 2px 4px; width: 18%; color: #000; text-align: left;">PROCEDIMIENTOS</th>
                            <th colspan="4" style="border: 1px solid #000; background-color: #fde9d9; padding: 2px 4px; width: 23%; color: #000;">ESTUDIANTES</th>
                            <th colspan="4" style="border: 1px solid #000; background-color: #fde9d9; padding: 2px 4px; width: 23%; color: #000;">ADMINISTRATIVOS</th>
                            <th colspan="4" style="border: 1px solid #000; background-color: #fde9d9; padding: 2px 4px; width: 23%; color: #000;">DOCENTES</th>
                            <th style="border: 1px solid #000; background-color: #8db4e2; padding: 2px 4px; width: 8%; color: #000;">TOTAL</th>
                        </tr>
                        <tr style="font-weight: bold; text-align: center;">
                            <th style="border: 1px solid #000; background-color: #fcd5b4; padding: 1.5px 4px; color: #000; text-align: left;">MORBILIDAD</th>
                            <th style="border: 1px solid #000; background-color: #fcd5b4; padding: 1.5px 2px; color: #000;">MASCULINO</th>
                            <th style="border: 1px solid #000; background-color: #fcd5b4; padding: 1.5px 2px; color: #000;">FEMENINO</th>
                            <th style="border: 1px solid #000; background-color: #fcd5b4; padding: 1.5px 2px; color: #000;">LGBTI</th>
                            <th style="border: 1px solid #000; background-color: #d8e4bc; padding: 1.5px 2px; color: #000;">TOTAL</th>
                            <th style="border: 1px solid #000; background-color: #fcd5b4; padding: 1.5px 2px; color: #000;">MASCULINO</th>
                            <th style="border: 1px solid #000; background-color: #fcd5b4; padding: 1.5px 2px; color: #000;">FEMENINO</th>
                            <th style="border: 1px solid #000; background-color: #fcd5b4; padding: 1.5px 2px; color: #000;">LGBTI</th>
                            <th style="border: 1px solid #000; background-color: #d8e4bc; padding: 1.5px 2px; color: #000;">TOTAL</th>
                            <th style="border: 1px solid #000; background-color: #fcd5b4; padding: 1.5px 2px; color: #000;">MASCULINO</th>
                            <th style="border: 1px solid #000; background-color: #fcd5b4; padding: 1.5px 2px; color: #000;">FEMENINO</th>
                            <th style="border: 1px solid #000; background-color: #fcd5b4; padding: 1.5px 2px; color: #000;">LGBTI</th>
                            <th style="border: 1px solid #000; background-color: #d8e4bc; padding: 1.5px 2px; color: #000;">TOTAL</th>
                            <th style="border: 1px solid #000; background-color: #8db4e2; padding: 1.5px 2px; color: #000;">TOTAL</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${morbilidadRowsHtml}
                        <tr style="font-weight: bold; font-size: 7px;">
                            <td style="border: 1px solid #000; padding: 2px 4px; text-align: left; width: 18%;">TOTAL</td>
                            <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; width: 6%;">${escapeHtml(totEstMorH)}</td>
                            <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; width: 6%;">${escapeHtml(totEstMorM)}</td>
                            <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; width: 5%;">${escapeHtml(totEstMorL)}</td>
                            <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; background-color: #f2dcdb; width: 6%;">${escapeHtml(totEstMorT)}</td>
                            <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; width: 6%;">${escapeHtml(totAdmMorH)}</td>
                            <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; width: 6%;">${escapeHtml(totAdmMorM)}</td>
                            <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; width: 5%;">${escapeHtml(totAdmMorL)}</td>
                            <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; background-color: #f2dcdb; width: 6%;">${escapeHtml(totAdmMorT)}</td>
                            <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; width: 6%;">${escapeHtml(totDocMorH)}</td>
                            <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; width: 6%;">${escapeHtml(totDocMorM)}</td>
                            <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; width: 5%;">${escapeHtml(totDocMorL)}</td>
                            <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; background-color: #f2dcdb; width: 6%;">${escapeHtml(totDocMorT)}</td>
                            <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; background-color: #f2dcdb; width: 8%;">${escapeHtml(totGrandMorT)}</td>
                        </tr>
                    </tbody>
                </table>

                <!-- Narrativa PROCEDIMIENTOS DE MORBILIDAD -->
                <div style="font-size: 8px; line-height: 1.35; margin: 6px 0 14px 0; color: #000; text-align: justify;">
                    ${procMorbilidadNarrativeHtml}
                </div>

                <!-- 4. CONCLUSIONES -->
                <div style="font-weight: bold; font-size: 9px; margin-top: 14px; margin-bottom: 6px; text-transform: uppercase; color: #000;">
                    4. CONCLUSIONES
                </div>
                <p style="font-size: 8.5px; line-height: 1.4; text-align: justify; margin: 0 0 14px 0; color: #000;">
                    El Servicio de Odontología contribuye a garantizar la salud Buco-Dental de los miembros de la comunidad universitaria, lograr disminuir las patologías bucales con las atenciones preventivas, curativas, campañas de prevención y socialización que realizamos con las distintas carreras de nuestra universidad.
                </p>

                <!-- 5. RECOMENDACIONES -->
                <div style="font-weight: bold; font-size: 9px; margin-top: 14px; margin-bottom: 6px; text-transform: uppercase; color: #000;">
                    5. RECOMENDACIONES
                </div>
                <p style="font-size: 8.5px; line-height: 1.4; text-align: justify; margin: 0 0 4px 0; color: #000;">
                    Fortalecer el Servicio de Odontológico de Bienestar Universitario con la compra oportuna de los insumos e instrumentos odontológicos solicitados por el área de odontología.
                </p>
                <p style="font-size: 8.5px; line-height: 1.4; text-align: justify; margin: 0 0 14px 0; color: #000;">
                    Actualizar información de los servicios que brinda Bienestar Universitario en la página web de la Universidad Estatal de Bolívar.
                </p>

                <!-- 6. ANEXOS -->
                <div style="font-weight: bold; font-size: 9.5px; margin-top: 18px; margin-bottom: 8px; text-transform: uppercase; color: #000; border-bottom: 1.5px solid #000; padding-bottom: 2px;">
                    6. ANEXOS
                </div>

                <!-- TABLA GENERAL DE ATENCIONES (ANEXO 1) -->
                <div class="table-card" style="page-break-inside: avoid !important; break-inside: avoid !important; margin-bottom: 14px;">
                    <div style="font-weight: bold; font-size: 9px; text-align: center; margin-bottom: 6px; color: #000; text-transform: uppercase;">
                        ATENCIONES DE ODONTOLOGÍA - ${escapeHtml(selectedMonthText.toUpperCase())} ${escapeHtml(genReportYear)}
                    </div>
                    <table style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; border: 1.5px solid #000; font-size: 7.5px; margin-bottom: 4px;">
                        <thead>
                            <tr style="font-weight: bold; text-align: center; background-color: #d9d9d9;">
                                <th colspan="2" style="border: 1px solid #000; padding: 2.5px 2px; width: 25.5%; color: #000;">FACULTAD</th>
                                <th style="border: 1px solid #000; padding: 2.5px 2px; width: 34.5%; color: #000;">CARRERA</th>
                                <th style="border: 1px solid #000; padding: 2.5px 2px; width: 10%; color: #000;">HOMBRES</th>
                                <th style="border: 1px solid #000; padding: 2.5px 2px; width: 10%; color: #000;">MUJERES</th>
                                <th style="border: 1px solid #000; padding: 2.5px 2px; width: 10%; color: #000;">LGBTI</th>
                                <th style="border: 1px solid #000; padding: 2.5px 2px; width: 10%; color: #000;">TOTAL</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${renderAnexoTableRowsHtml()}
                        </tbody>
                    </table>
                </div>

                <!-- TABLA PREVENTIVA VS CURATIVA (ANEXO 2) -->
                <div class="table-card" style="page-break-inside: avoid !important; break-inside: avoid !important; margin-bottom: 14px;">
                    <div style="font-weight: bold; font-size: 9px; text-align: center; margin-bottom: 6px; color: #000; text-transform: uppercase;">
                        ATENCIONES DE ODONTOLOGÍA - ${escapeHtml(selectedMonthText.toUpperCase())} ${escapeHtml(genReportYear)}
                    </div>
                    <table style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; border: 1.5px solid #000; font-size: 7px; margin-bottom: 4px;">
                        <thead>
                            <tr style="font-weight: bold; text-align: center;">
                                <th colspan="2" style="border: 1px solid #000; background-color: #8db4e2; padding: 2px; color: #000; width: 38%;">COMUNIDAD UNIVERSITARIA</th>
                                <th colspan="4" style="border: 1px solid #000; background-color: #8db4e2; padding: 2px; color: #000; width: 24%;">ODONTOLOGÍA PREVENTIVA</th>
                                <th colspan="4" style="border: 1px solid #000; background-color: #8db4e2; padding: 2px; color: #000; width: 24%;">ODONTOLOGÍA CURATIVA</th>
                                <th rowspan="2" style="border: 1px solid #000; background-color: #d8e4bc; padding: 2px; color: #000; width: 8%; vertical-align: middle;">TOTAL</th>
                            </tr>
                            <tr style="font-weight: bold; text-align: center; background-color: #fde9d9;">
                                <th style="border: 1px solid #000; padding: 1.5px 2px; color: #000; width: 14%;">FACULTAD</th>
                                <th style="border: 1px solid #000; padding: 1.5px 2px; color: #000; width: 24%;">CARRERA</th>
                                <th style="border: 1px solid #000; padding: 1.5px 2px; color: #000; width: 6%;">MASCULINO</th>
                                <th style="border: 1px solid #000; padding: 1.5px 2px; color: #000; width: 6%;">FEMENINO</th>
                                <th style="border: 1px solid #000; padding: 1.5px 2px; color: #000; width: 5%;">LGBTI</th>
                                <th style="border: 1px solid #000; background-color: #d8e4bc; padding: 1.5px 2px; color: #000; width: 7%;">TOTAL</th>
                                <th style="border: 1px solid #000; padding: 1.5px 2px; color: #000; width: 6%;">MASCULINO</th>
                                <th style="border: 1px solid #000; padding: 1.5px 2px; color: #000; width: 6%;">FEMENINO</th>
                                <th style="border: 1px solid #000; padding: 1.5px 2px; color: #000; width: 5%;">LGBTI</th>
                                <th style="border: 1px solid #000; background-color: #d8e4bc; padding: 1.5px 2px; color: #000; width: 7%;">TOTAL</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${renderAnexo2TableRowsHtml()}
                        </tbody>
                    </table>
                </div>

                <!-- TABLA CONSOLIDADO -->
                <div class="table-card" style="page-break-inside: avoid !important; break-inside: avoid !important; margin-bottom: 14px;">
                    ${renderConsolidadoTableHtml()}
                </div>

                <!-- TABLAS INDIVIDUALES POR CARRERA -->
                ${(activeCareers && activeCareers.length > 0) ? activeCareers.map(cName => `
                    <div class="career-card" style="page-break-inside: avoid !important; break-inside: avoid !important; margin-bottom: 10px;">
                        ${renderSingleCareerTableHtml(cName)}
                    </div>
                `).join('') : `
                    <div style="text-align: center; color: #64748b; font-style: italic; font-size: 8px; margin: 15px 0;">
                        No se registraron atenciones a estudiantes de carreras específicas este mes.
                    </div>
                `}

                <!-- LEGALIZACIÓN Y FIRMAS -->
                <div class="signature-card" style="page-break-inside: avoid !important; break-inside: avoid !important; margin-top: 18px; margin-bottom: 14px;">
                    <div style="font-size: 8.5px; font-family: Arial, sans-serif; margin-bottom: 8px; color: #000; text-align: left;">
                        Adjunto ${escapeHtml(data.totalFojas || 18)} fojas, copias a color partes diarios.
                    </div>

                    <table style="width: 85%; border-collapse: collapse; margin-top: 6px; border: 1px solid #000; font-family: Arial, sans-serif; font-size: 7.5px;">
                        <thead>
                            <tr style="background-color: #e4dfec; font-weight: bold;">
                                <td style="border: 1px solid #000; padding: 4px 6px; text-align: center; width: 22%; font-weight: bold; color: #000;">Datos</td>
                                <td style="border: 1px solid #000; padding: 4px 6px; text-align: center; width: 39%; font-weight: bold; color: #000;">Elaborado por:</td>
                                <td style="border: 1px solid #000; padding: 4px 6px; text-align: center; width: 39%; font-weight: bold; color: #000;">Revisado y Aprobado por:</td>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style="border: 1px solid #000; padding: 4px 6px; text-align: left; font-weight: bold; background-color: #e4dfec; height: 50px; vertical-align: top; color: #000;">Firmas</td>
                                <td style="border: 1px solid #000; padding: 4px 6px; text-align: center; height: 50px; background-color: #fff;"></td>
                                <td style="border: 1px solid #000; padding: 4px 6px; text-align: center; height: 50px; background-color: #fff;"></td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #000; padding: 3px 6px; text-align: left; font-weight: bold; background-color: #e4dfec; color: #000;">Nombre y Apellido</td>
                                <td style="border: 1px solid #000; padding: 3px 6px; text-align: center; color: #000; background-color: #fff;">${escapeHtml(doctorNameText)}</td>
                                <td style="border: 1px solid #000; padding: 3px 6px; text-align: center; color: #000; background-color: #fff;">Michel Gaibor Vásquez</td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #000; padding: 3px 6px; text-align: left; font-weight: bold; background-color: #e4dfec; color: #000;">Cargo</td>
                                <td style="border: 1px solid #000; padding: 3px 6px; text-align: center; color: #000; background-color: #fff;">Odontóloga de Bienestar Universitario</td>
                                <td style="border: 1px solid #000; padding: 3px 6px; text-align: center; color: #000; background-color: #fff;">Coordinadora de Bienestar Universitario</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Pie de Página Institucional -->
                <div class="page-footer-container" style="margin-top: 18px; border-top: 1px solid #cbd5e1; padding-top: 5px; font-size: 7.5px; line-height: 1.3; color: #1e3a8a; text-align: left; font-family: Arial, sans-serif; page-break-inside: avoid !important; break-inside: avoid !important;">
                    <div>Dirección: &nbsp;Av. Ernesto Che Guevara y Gabriel Secaira</div>
                    <div>Guaranda-Ecuador</div>
                    <div>Teléfono: (593) 3220-6010 &nbsp;<strong>EXT 1168</strong></div>
                    <div><strong>www.ueb.edu.ec</strong></div>
                </div>
            </div>

            ${forPrint ? `
                <script>
                    window.onload = function() {
                        setTimeout(function() {
                            window.print();
                        }, 300);
                    };
                </script>
            ` : ''}
        </body>
        </html>
    `;
    } catch (err) {
        console.error("Error al compilar informe general HTML:", err);
        return `
            <!DOCTYPE html>
            <html lang="es">
            <body style="font-family: Arial, sans-serif; padding: 30px; text-align: center;">
                <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 20px;">
                    <h4 style="color: #1e3a8a; margin: 0 0 8px 0;">Cargando informe mensual...</h4>
                    <p style="color: #64748b; font-size: 12px; margin: 0;">Los datos se están procesando correctamente.</p>
                </div>
            </body>
            </html>
        `;
    }
};
