import { useState } from 'react';
import { FileText, Printer, X } from 'lucide-react';
import { logoBienestar } from '../../assets/logoBienestarBase64.js';
import { escapeHtml } from '../../utils/escapeHtml';
import { extraerIdentificacion, extraerGineco, extraerHabitos, extraerAntecedentesFamiliares, extraerFactoresRiesgo, extraerConstantes, extraerExamenFisico, extraerLaboratorios, extraerDiagnosticos, extraerRecomendaciones, extraerProfesional, primero } from './fichaComun';

/**
 * Función que extrae y normaliza de forma exhaustiva todos los campos clínicos,
 * ocupacionales y administrativos del Formulario MSP/MDT 077, soportando:
 * 1. Modelos normalizados del Backend (users, datos_identificacion, cargos, personal_nuevo_medicoocupacional,
 *    signos_vitales, motivo_consulta_medicina, antecedentes_medicina, enfermedades_actuales_medicina,
 *    revision_organos_medicina, examen_fisico_medicina, diagnosticos_medicina, planes_terapeuticos_medicina,
 *    historial_evolucion_medicina, orden_de_examen)
 * 2. Estado de la consulta ocupacional del Frontend (stepper de 7 pasos, vitalSigns, paciente seleccionado, etc.)
 * 3. Registros históricos y mockups de fichas.
 */
export const extractFichaFields = (record = {}) => {
    const r = record || {};
    // Solo datos registrados en el sistema; lo que falta queda en blanco (ver ./fichaComun.js)
    const {
        pac, ced, p1Ape, p2Ape, p1Nom, p2Nom, edad, sexo, puesto, cargo, ciuo, actividades,
        tel, rel, grpSangre, lat, orientacion, idGen, disc, ruc, estSalud, numHC, numArch
    } = extraerIdentificacion(r);
    const antClin = primero(r.antecedentesClinicos, r.antecedentesPersonales, r.detalle_antecedente);
    const antQuir = primero(r.antecedentesQuirurgicos);
    const gin = extraerGineco(r, sexo);
    const hab = extraerHabitos(r);
    const antFam = extraerAntecedentesFamiliares(r);
    const factRiesgo = extraerFactoresRiesgo(r, cargo, actividades);
    const actExtra = primero(r.actividadesExtraLaborales);
    const enfAct = primero(r.enfermedadActual, r.detalle_enfermedad_actual);
    const orgSist = r.organosSistemas || { normal: false, descripcion: primero(r.detalle_revision_organos) };
    const constantes = extraerConstantes(r);
    const exLab = extraerLaboratorios(r);
    const diags = extraerDiagnosticos(r);
    const recs = extraerRecomendaciones(r);
    const sinCalificar = { calificado: false, fecha: '', especificaciones: '', observaciones: '' };
    const accTrab = r.accidentesTrabajo || sinCalificar;
    const enfProf = r.enfermedadesProfesionales || sinCalificar;
    const aptStr = String(r.aptitudLaboral || r.aptitud || '').toLowerCase();

    const fecIngreso = primero(r.fechaIngreso, r.fecha_ingreso, r.fecha);
    const motivo = primero(r.motivoConsulta, r.detalle_motivo, r.motivo);
    const exFisico = extraerExamenFisico(r);

    // Empleos anteriores: los registrados, o el texto de antecedentes laborales de la atención
    let empAnt = Array.isArray(r.empleosAnteriores) ? r.empleosAnteriores : [];
    if (empAnt.length === 0 && r.antecedentesOcupacionales) {
        empAnt = [{
            empresa: '', puesto: r.antecedentesOcupacionales, actividades: '', tiempo: '',
            riesgos: { fisico: false, mecanico: false, quimico: false, biologico: false, ergonomico: false, psicosocial: false },
            observaciones: ''
        }];
    }

    // Aptitud dictada en la atención
    const restricciones = primero(r.restriccionesOcupacionales);
    const apt = r.aptitudDetalle || {
        apto: aptStr === 'apto',
        aptoObservacion: aptStr.includes('restric') || aptStr.includes('observ') || aptStr.includes('adaptac'),
        aptoLimitaciones: aptStr.includes('restric') || aptStr.includes('adaptac'),
        noApto: aptStr.includes('no apto') || aptStr === 'no_apto',
        observacion: restricciones,
        limitacion: restricciones
    };

    const prof = extraerProfesional(r, fecIngreso);

    return {
        pac, ced, p1Ape, p2Ape, p1Nom, p2Nom, edad, sexo, puesto, cargo, ciuo, actividades,
        fecIngreso, tel, rel, grpSangre, lat, orientacion, idGen, disc, ruc, estSalud,
        numHC, numArch, motivo, antClin, antQuir, gin, hab, empAnt, accTrab, enfProf,
        antFam, factRiesgo, actExtra, enfAct, orgSist, constantes, exFisico, exLab,
        diags, apt, recs, prof
    };
};

/**
 * Función utilitaria para imprimir el Formulario Oficial MSP/MDT 077
 * Ficha Médica Ocupacional Preocupacional - Inicio / Periódica
 */
export const compileOfficialIngresoFormHtml = (record = {}, uebBannerLogo = '', forPrint = false) => {
    const {
        pac, ced, p1Ape, p2Ape, p1Nom, p2Nom, edad, sexo, puesto, cargo, ciuo, actividades,
        fecIngreso, tel, rel, grpSangre, lat, orientacion, idGen, disc, ruc, estSalud,
        numHC, numArch, motivo, antClin, antQuir, gin, hab, empAnt, accTrab, enfProf,
        antFam, factRiesgo, actExtra, enfAct, orgSist, constantes, exFisico, exLab,
        diags, apt, recs, prof
    } = extractFichaFields(record);

    const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8" />
        <title>FORMULARIO 077 - EVALUACIÓN MÉDICA PREOCUPACIONAL - ${escapeHtml(pac)}</title>
        <style>
            @page {
                size: portrait;
                margin: 8mm;
            }
            * { box-sizing: border-box; }
            body {
                font-family: Arial, 'Segoe UI', Helvetica, sans-serif;
                margin: 0;
                padding: 6px;
                color: #000000;
                background: #ffffff;
                font-size: 8.5px;
                line-height: 1.2;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 4px;
            }
            th, td {
                border: 1px solid #000000;
                padding: 2.5px 4px;
                font-size: 8px;
                vertical-align: middle;
            }
            .text-center { text-align: center; }
            .text-left { text-align: left; }
            .text-right { text-align: right; }
            .font-bold { font-weight: bold; }
            .uppercase { text-transform: uppercase; }

            /* Paleta exacta del Excel de la UEB */
            .bg-purple {
                background-color: #d9d9f3 !important;
                font-weight: bold;
                font-size: 9px;
                padding: 3.5px 6px;
                border: 1px solid #000000;
            }
            .bg-green {
                background-color: #e2efda !important;
                font-weight: bold;
                font-size: 7.5px;
                text-align: center;
                border: 1px solid #000000;
            }
            .bg-cyan {
                background-color: #d9f2f8 !important;
                font-size: 7.5px;
            }
            .bg-yellow {
                background-color: #ffff00 !important;
            }
            .sheet-break {
                page-break-after: always;
                break-after: page;
                margin-bottom: 14px;
            }
            .sheet-break:last-child {
                page-break-after: avoid;
                break-after: avoid;
                margin-bottom: 0;
            }
            .check-box {
                display: inline-block;
                width: 11px;
                height: 11px;
                line-height: 11px;
                text-align: center;
                border: 1px solid #000;
                font-weight: bold;
                font-size: 8px;
                margin: 0 1px;
                vertical-align: middle;
            }
            .check-box.checked {
                background: #000;
                color: #fff;
            }
            @media print {
                .no-print { display: none !important; }
                body { padding: 0; }
            }
        </style>
    </head>
    <body>
        <!-- BARRA SUPERIOR PARA PANTALLA -->
        <div class="no-print" style="position: sticky; top: 0; background: #002060; color: #ffffff; padding: 10px 18px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 12px rgba(0,0,0,0.15); margin-bottom: 12px; border-radius: 6px; z-index: 9999;">
            <div style="font-weight: 800; font-size: 13px; letter-spacing: 0.3px;">
                UNIVERSIDAD ESTATAL DE BOLÍVAR · FORMULARIO OFICIAL MSP/MDT 077 (INGRESO / PERIÓDICO)
            </div>
            <div style="display: flex; gap: 8px;">
                <button onclick="window.print()" style="background: #0284c7; color: #ffffff; border: none; padding: 7px 16px; border-radius: 6px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px; font-size: 12px;">
                    Imprimir Formato Completo (3 Hojas)
                </button>
                <button onclick="window.close()" style="background: #475569; color: #ffffff; border: none; padding: 7px 14px; border-radius: 6px; font-weight: 700; cursor: pointer; font-size: 12px;">
                    Cerrar
                </button>
            </div>
        </div>

        <!-- ========================================== -->
        <!-- HOJA 1: 077-PREOCUPA. INICIO 1-3          -->
        <!-- ========================================== -->
        <div class="sheet-break">
            <!-- ENCABEZADO INSTITUCIONAL -->
            <table style="margin-bottom: 4px; border: 1.5px solid #000;">
                <tr>
                    <td style="width: 32%; padding: 4px 8px; border: 1.5px solid #000;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <img src="${escapeHtml(logoBienestar)}" style="height: 38px; object-fit: contain;" alt="Bienestar Universitario" />
                            ${uebBannerLogo ? `<img src="${escapeHtml(uebBannerLogo)}" style="height: 38px; object-fit: contain;" alt="UEB" />` : ''}
                            <div>
                                <div style="font-weight: 900; font-size: 11px; color: #002060;">UNIVERSIDAD ESTATAL DE BOLÍVAR</div>
                                <div style="font-size: 7.5px; font-weight: bold; color: #002060;">DIRECCIÓN DE BIENESTAR UNIVERSITARIO · SALUD OCUPACIONAL</div>
                            </div>
                        </div>
                    </td>
                    <td style="background: #d9d9f3; text-align: center; font-weight: 900; font-size: 13px; padding: 6px; border: 1.5px solid #000;">
                        EVALUACIÓN MÉDICA PREOCUPACIONAL - INICIO
                        <div style="font-size: 8px; font-weight: normal; margin-top: 2px;">FORMULARIO MSP / MDT 077 · HOJA 1 DE 3</div>
                    </td>
                </tr>
            </table>

            <!-- SECCIÓN A: DATOS DE LA EMPRESA -->
            <table>
                <tr>
                    <td colspan="6" class="bg-purple">A. DATOS DE LA EMPRESA DONDE LABORA EL TRABAJADOR O ASPIRANTE</td>
                </tr>
                <tr class="bg-green">
                    <td style="width: 28%;">INSTITUCIÓN DEL SISTEMA O NOMBRE DE LA EMPRESA</td>
                    <td style="width: 14%;">RUC</td>
                    <td style="width: 8%;">CIIU</td>
                    <td style="width: 24%;">ESTABLECIMIENTO DE SALUD</td>
                    <td style="width: 16%;">NÚMERO DE HISTORIA CLÍNICA</td>
                    <td style="width: 10%;">NÚMERO DE ARCHIVO</td>
                </tr>
                <tr class="text-center font-bold">
                    <td>UNIVERSIDAD ESTATAL DE BOLIVAR</td>
                    <td>${escapeHtml(ruc)}</td>
                    <td>-</td>
                    <td>${escapeHtml(estSalud)}</td>
                    <td>${escapeHtml(numHC)}</td>
                    <td>${escapeHtml(numArch)}</td>
                </tr>
            </table>

            <!-- DATOS DEL TRABAJADOR -->
            <table>
                <tr class="bg-green">
                    <td style="width: 15%;">PRIMER APELLIDO</td>
                    <td style="width: 15%;">SEGUNDO APELLIDO</td>
                    <td style="width: 15%;">PRIMER NOMBRE</td>
                    <td style="width: 15%;">SEGUNDO NOMBRE</td>
                    <td style="width: 5%;">SEXO</td>
                    <td style="width: 6%;">EDAD</td>
                    <td style="width: 13%;">RELIGIÓN</td>
                    <td style="width: 8%;">GRUPO SANGUÍNEO</td>
                    <td style="width: 8%;">LATERALIDAD</td>
                </tr>
                <tr class="text-center font-bold">
                    <td class="uppercase">${escapeHtml(p1Ape)}</td>
                    <td class="uppercase">${escapeHtml(p2Ape)}</td>
                    <td class="uppercase">${escapeHtml(p1Nom)}</td>
                    <td class="uppercase">${escapeHtml(p2Nom)}</td>
                    <td>${escapeHtml(sexo)}</td>
                    <td>${escapeHtml(edad)}</td>
                    <td>${escapeHtml(rel)}</td>
                    <td>${escapeHtml(grpSangre)}</td>
                    <td>${escapeHtml(lat)}</td>
                </tr>
            </table>

            <!-- ORIENTACIÓN, GÉNERO, DISCAPACIDAD Y PUESTO -->
            <table>
                <tr class="bg-green">
                    <td style="width: 16%;">ORIENTACIÓN SEXUAL</td>
                    <td style="width: 14%;">IDENTIDAD DE GÉNERO</td>
                    <td style="width: 13%;">DISCAPACIDAD</td>
                    <td style="width: 12%;">FECHA DE INGRESO</td>
                    <td style="width: 9%;">CIUO</td>
                    <td style="width: 18%;">CARGO / OCUPACIÓN</td>
                    <td style="width: 10%;">TELÉFONO</td>
                </tr>
                <tr class="text-center">
                    <td><strong>${escapeHtml(orientacion)}</strong></td>
                    <td><strong>${escapeHtml(idGen)}</strong></td>
                    <td>${disc.tiene ? `SÍ (${escapeHtml(disc.tipo)} ${escapeHtml(disc.porcentaje)}%)` : '<strong>NO</strong>'}</td>
                    <td><strong>${escapeHtml(fecIngreso)}</strong></td>
                    <td><strong>${escapeHtml(ciuo)}</strong></td>
                    <td class="uppercase" style="font-size: 7.5px;"><strong>${escapeHtml(cargo)}</strong></td>
                    <td>${escapeHtml(tel)}</td>
                </tr>
                <tr>
                    <td colspan="7" style="background: #f8fafc; padding: 3px 6px;">
                        <strong>ACTIVIDADES RELEVANTES AL PUESTO DE TRABAJO A OCUPAR:</strong> <span class="uppercase">${escapeHtml(actividades)}</span>
                    </td>
                </tr>
            </table>

            <!-- SECCIÓN B: MOTIVO DE CONSULTA -->
            <table>
                <tr>
                    <td class="bg-purple">B. MOTIVO DE CONSULTA <span style="font-size: 7.5px; font-weight: normal; float: right;">(Versión del informante)</span></td>
                </tr>
                <tr>
                    <td style="padding: 5px 8px; font-weight: bold; background: #fafafa;">${escapeHtml(motivo)}</td>
                </tr>
            </table>

            <!-- SECCIÓN C: ANTECEDENTES PERSONALES -->
            <table>
                <tr>
                    <td colspan="4" class="bg-purple">C. ANTECEDENTES PERSONALES</td>
                </tr>
                <tr>
                    <td colspan="4" class="bg-green text-left font-bold" style="padding-left: 6px;">1. ANTECEDENTES CLÍNICOS Y QUIRÚRGICOS</td>
                </tr>
                <tr>
                    <td colspan="4" style="padding: 4px 6px;">
                        <div><strong>Antecedentes clínicos:</strong> ${escapeHtml(antClin)}</div>
                        <div style="margin-top: 3px;"><strong>Antecedentes quirúrgicos:</strong> ${escapeHtml(antQuir)}</div>
                    </td>
                </tr>
                <tr>
                    <td colspan="4" class="bg-green text-left font-bold" style="padding-left: 6px;">2. ANTECEDENTES GINECO OBSTÉTRICOS (Para mujeres)</td>
                </tr>
                <tr>
                    <td colspan="4">
                        <table style="margin: 0; width: 100%;">
                            <tr class="bg-green" style="font-size: 7px;">
                                <td>MENARQUÍA</td>
                                <td>CICLOS</td>
                                <td>FUM</td>
                                <td>GESTAS</td>
                                <td>PARTOS</td>
                                <td>CESÁREAS</td>
                                <td>ABORTOS</td>
                                <td>HIJOS VIVOS</td>
                                <td>VIDA SEXUAL</td>
                                <td>PLANIFICACIÓN</td>
                            </tr>
                            <tr class="text-center font-bold" style="font-size: 7.5px;">
                                <td>${escapeHtml(gin.menarquia || '-')}</td>
                                <td>${escapeHtml(gin.ciclos || '-')}</td>
                                <td>${escapeHtml(gin.fum || '-')}</td>
                                <td>${escapeHtml(gin.gestas ?? 0)}</td>
                                <td>${escapeHtml(gin.partos ?? 0)}</td>
                                <td>${escapeHtml(gin.cesareas ?? 0)}</td>
                                <td>${escapeHtml(gin.abortos ?? 0)}</td>
                                <td>${escapeHtml(gin.hijosVivos ?? 0)}</td>
                                <td>${escapeHtml(gin.vidaSexualActiva ? 'SÍ' : 'NO')}</td>
                                <td>${escapeHtml(gin.planificacionFamiliar ? 'SÍ' : 'NO')}</td>
                            </tr>
                        </table>
                        <div style="padding: 3px 6px; font-size: 7.5px; background: #fafafa; border-top: 1px solid #000;">
                            <strong>PAPANICOLAOU:</strong> ${gin.papanicolaou?.realizada ? `SÍ (${escapeHtml(gin.papanicolaou.tiempo)} - ${escapeHtml(gin.papanicolaou.resultado)})` : 'NO'} |
                            <strong>COLPOSCOPIA:</strong> ${escapeHtml(gin.colposcopia?.resultado || '')} |
                            <strong>MAMOGRAFÍA:</strong> ${escapeHtml(gin.mamografia?.resultado || '')} |
                            <strong>ECO-MAMARIO:</strong> ${escapeHtml(gin.ecoMamario?.resultado || '')}
                        </div>
                    </td>
                </tr>
                <tr>
                    <td colspan="4" class="bg-green text-left font-bold" style="padding-left: 6px;">3. HÁBITOS TÓXICOS Y ESTILO DE VIDA</td>
                </tr>
                <tr>
                    <td style="width: 25%; font-size: 7.5px;">
                        <strong>TABACO:</strong> ${escapeHtml(hab.tabaco ? 'SÍ' : 'NO [X]')}
                    </td>
                    <td style="width: 25%; font-size: 7.5px;">
                        <strong>ALCOHOL:</strong> ${escapeHtml(hab.alcohol ? 'SÍ' : 'NO [X]')}
                    </td>
                    <td style="width: 25%; font-size: 7.5px;">
                        <strong>ACTIVIDAD FÍSICA:</strong> ${hab.actividadFisica?.tiene ? `SÍ (${escapeHtml(hab.actividadFisica.cual)} - ${escapeHtml(hab.actividadFisica.tiempo)})` : 'NO'}
                    </td>
                    <td style="width: 25%; font-size: 7.5px;">
                        <strong>MEDICACIÓN HABITUAL:</strong> ${hab.medicacionHabitual?.tiene ? `SÍ (${escapeHtml(hab.medicacionHabitual.cual)} - ${escapeHtml(hab.medicacionHabitual.tiempo)})` : 'NO'}
                    </td>
                </tr>
            </table>

            <!-- SECCIÓN D: ANTECEDENTES DE TRABAJO -->
            <table>
                <tr>
                    <td colspan="6" class="bg-purple">D. ANTECEDENTES DE TRABAJO</td>
                </tr>
                <tr class="bg-green">
                    <td style="width: 26%;">EMPRESA</td>
                    <td style="width: 14%;">PUESTO</td>
                    <td style="width: 16%;">ACTIVIDADES</td>
                    <td style="width: 10%;">TIEMPO</td>
                    <td style="width: 20%;">RIESGOS IDENTIFICADOS</td>
                    <td style="width: 14%;">OBSERVACIONES</td>
                </tr>
                ${empAnt.map((item, idx) => `
                    <tr key="${escapeHtml(idx)}" class="text-center font-bold">
                        <td class="text-left">${escapeHtml(item.empresa)}</td>
                        <td>${escapeHtml(item.puesto)}</td>
                        <td>${escapeHtml(item.actividades)}</td>
                        <td>${escapeHtml(item.tiempo)}</td>
                        <td style="font-size: 7px;">${escapeHtml(item.riesgos?.fisico ? '[FÍSICO] ' : '')}${escapeHtml(item.riesgos?.quimico ? '[QUÍMICO] ' : '')}${escapeHtml(item.riesgos?.mecanico ? '[MECÁNICO] ' : '')}</td>
                        <td>${escapeHtml(item.observaciones || '')}</td>
                    </tr>
                `).join('')}
                <tr>
                    <td colspan="6" style="padding: 3px 6px; font-size: 7.5px;">
                        <strong>ACCIDENTES DE TRABAJO:</strong> ${accTrab.calificado ? `CALIFICADO IESS - ${escapeHtml(accTrab.especificaciones)}` : 'NO CALIFICADO [X] - Observaciones: NINGUNA'}<br />
                        <strong>ENFERMEDADES PROFESIONALES:</strong> ${enfProf.calificado ? `CALIFICADA IESS - ${escapeHtml(enfProf.especificaciones)}` : 'NO CALIFICADA [X] - Observaciones: NINGUNA'}
                    </td>
                </tr>
            </table>
        </div>

        <!-- ========================================== -->
        <!-- HOJA 2: 077-PREOCUPA. INICIO 2-3          -->
        <!-- ========================================== -->
        <div class="sheet-break">
            <!-- ENCABEZADO HOJA 2 -->
            <table style="margin-bottom: 4px; border: 1.5px solid #000;">
                <tr>
                    <td style="width: 32%; padding: 4px 8px; border: 1.5px solid #000;">
                        <div style="font-weight: 900; font-size: 11px; color: #002060;">UNIVERSIDAD ESTATAL DE BOLÍVAR</div>
                        <div style="font-size: 7.5px; font-weight: bold; color: #002060;">DEPARTAMENTO MÉDICO · SALUD OCUPACIONAL</div>
                    </td>
                    <td style="background: #d9d9f3; text-align: center; font-weight: 900; font-size: 13px; padding: 6px; border: 1.5px solid #000;">
                        EVALUACIÓN MÉDICA PREOCUPACIONAL - INICIO
                        <div style="font-size: 8px; font-weight: normal; margin-top: 2px;">FORMULARIO MSP / MDT 077 · HOJA 2 DE 3</div>
                    </td>
                </tr>
            </table>

            <!-- SECCIÓN E: ANTECEDENTES FAMILIARES -->
            <table>
                <tr>
                    <td class="bg-purple">E. ANTECEDENTES FAMILIARES (DETALLAR EL PARENTESCO)</td>
                </tr>
                <tr class="bg-green" style="font-size: 7px;">
                    <td>
                        <span class="check-box ${escapeHtml(antFam.cardiovascular ? 'checked' : '')}">X</span> 1. CARDIO-VASCULAR |
                        <span class="check-box"></span> 2. METABÓLICA |
                        <span class="check-box"></span> 3. NEUROLÓGICA |
                        <span class="check-box"></span> 4. ONCOLÓGICA |
                        <span class="check-box"></span> 5. INFECCIOSA |
                        <span class="check-box"></span> 6. HEREDITARIA |
                        <span class="check-box"></span> 7. DISCAPACIDADES |
                        <span class="check-box"></span> 8. OTROS
                    </td>
                </tr>
                <tr>
                    <td style="padding: 4px 8px; font-weight: bold; background: #fafafa;">
                        ${escapeHtml(antFam.descripcion || '')}
                    </td>
                </tr>
            </table>

            <!-- SECCIÓN F: FACTORES DE RIESGO DEL PUESTO DE TRABAJO -->
            <table>
                <tr>
                    <td colspan="5" class="bg-purple">F. FACTORES DE RIESGOS DEL PUESTO DE TRABAJO ACTUAL</td>
                </tr>
                <tr class="bg-green">
                    <td style="width: 22%;">PUESTO / ÁREA</td>
                    <td style="width: 14%;">ACTIVIDADES</td>
                    <td style="width: 22%;">FÍSICO</td>
                    <td style="width: 22%;">MECÁNICO</td>
                    <td style="width: 20%;">QUÍMICO</td>
                </tr>
                <tr style="font-size: 7.5px;">
                    <td class="font-bold uppercase">${escapeHtml(factRiesgo.puesto || '')}</td>
                    <td class="font-bold uppercase">${escapeHtml(factRiesgo.actividades || '')}</td>
                    <td>
                        <span class="check-box checked">X</span> Temperaturas altas<br />
                        <span class="check-box checked">X</span> Temperaturas bajas<br />
                        <span class="check-box"></span> Ruido / Vibración / Radiación
                    </td>
                    <td>
                        <span class="check-box checked">X</span> Caídas al mismo nivel<br />
                        <span class="check-box checked">X</span> Caídas a diferente nivel<br />
                        <span class="check-box"></span> Atrapamiento / Cortes
                    </td>
                    <td>
                        <span class="check-box"></span> Polvos / Humos / Vapores<br />
                        <span class="check-box"></span> Líquidos / Químicos<br />
                        <em>(No aplica)</em>
                    </td>
                </tr>
                <tr class="bg-green">
                    <td colspan="2">BIOLÓGICO</td>
                    <td>ERGONÓMICO</td>
                    <td>PSICOSOCIAL</td>
                    <td>MEDIDAS PREVENTIVAS</td>
                </tr>
                <tr style="font-size: 7.5px;">
                    <td colspan="2">
                        <span class="check-box checked">X</span> Virus (Exposición respiratoria)<br />
                        <span class="check-box"></span> Hongos / Bacterias / Parásitos
                    </td>
                    <td>
                        <span class="check-box checked">X</span> Otros: Posiciones estáticas prolongadas<br />
                        <span class="check-box"></span> Manejo cargas / Repetitivos
                    </td>
                    <td>
                        <span class="check-box checked">X</span> Inestabilidad laboral<br />
                        <span class="check-box"></span> Sobrecarga / Alta responsabilidad
                    </td>
                    <td style="background: #fafafa; font-size: 7px; line-height: 1.25;">
                        ${escapeHtml(factRiesgo.medidasPreventivas)}
                    </td>
                </tr>
            </table>

            <!-- SECCIÓN G: ACTIVIDADES EXTRA LABORALES -->
            <table>
                <tr>
                    <td class="bg-purple">G. ACTIVIDADES EXTRA LABORALES</td>
                </tr>
                <tr>
                    <td style="padding: 4px 8px; font-weight: bold;">${escapeHtml(actExtra)}</td>
                </tr>
            </table>

            <!-- SECCIÓN H: ENFERMEDAD ACTUAL -->
            <table>
                <tr>
                    <td class="bg-purple">H. ENFERMEDAD ACTUAL</td>
                </tr>
                <tr>
                    <td style="padding: 4px 8px; font-weight: bold; background: #fafafa;">${escapeHtml(enfAct)}</td>
                </tr>
            </table>

            <!-- SECCIÓN I: REVISIÓN ACTUAL DE ÓRGANOS Y SISTEMAS -->
            <table>
                <tr>
                    <td colspan="5" class="bg-purple">I. REVISIÓN ACTUAL DE ÓRGANOS Y SISTEMAS</td>
                </tr>
                <tr class="bg-green" style="font-size: 7px;">
                    <td>1. PIEL - ANEXOS: CP</td>
                    <td>3. RESPIRATORIO: CP</td>
                    <td>5. DIGESTIVO: CP</td>
                    <td>7. MÚSCULO ESQ.: CP</td>
                    <td>9. HEMO LINFÁTICO: CP</td>
                </tr>
                <tr class="bg-green" style="font-size: 7px;">
                    <td>2. SENTIDOS: CP</td>
                    <td>4. CARDIO-VASCULAR: CP</td>
                    <td>6. GENITO-URINARIO: CP</td>
                    <td>8. ENDOCRINO: CP</td>
                    <td>10. NERVIOSO: CP</td>
                </tr>
                <tr>
                    <td colspan="5" style="padding: 4px 8px; font-weight: bold; background: #fafafa;">
                        ${escapeHtml(orgSist)}
                    </td>
                </tr>
            </table>

            <!-- SECCIÓN J: CONSTANTES VITALES Y ANTROPOMETRÍA -->
            <table>
                <tr>
                    <td colspan="9" class="bg-purple">J. CONSTANTES VITALES Y ANTROPOMETRÍA</td>
                </tr>
                <tr class="bg-green" style="font-size: 7px;">
                    <td style="width: 14%;">PRESIÓN ARTERIAL (mmHg)</td>
                    <td style="width: 10%;">TEMPERATURA (°C)</td>
                    <td style="width: 12%;">FREQ. CARDIACA (Lat/min)</td>
                    <td style="width: 11%;">SAT. OXÍGENO (%)</td>
                    <td style="width: 12%;">FREQ. RESPIRATORIA</td>
                    <td style="width: 10%;">PESO (Kg)</td>
                    <td style="width: 10%;">TALLA (m)</td>
                    <td style="width: 11%;">I.M.C. (Kg/m²)</td>
                    <td style="width: 10%;">PERÍMETRO ABD.</td>
                </tr>
                <tr class="text-center font-bold" style="font-size: 9px;">
                    <td style="color: #0284c7;">${escapeHtml(constantes.pa)} mmHg</td>
                    <td>${escapeHtml(constantes.temp)} °C</td>
                    <td>${escapeHtml(constantes.fc)} lpm</td>
                    <td>${escapeHtml(constantes.satO2)}%</td>
                    <td>${escapeHtml(constantes.fr)} rpm</td>
                    <td>${escapeHtml(constantes.peso)} Kg</td>
                    <td>${escapeHtml(constantes.talla)} m</td>
                    <td style="background: #f0fdf4; color: #166534;">${escapeHtml(constantes.imc)}</td>
                    <td>${escapeHtml(constantes.perimetroAbd || '-')}</td>
                </tr>
            </table>
        </div>

        <!-- ========================================== -->
        <!-- HOJA 3: 077-PREOCUPA. INICIO 3-3          -->
        <!-- ========================================== -->
        <div class="sheet-break">
            <!-- ENCABEZADO HOJA 3 -->
            <table style="margin-bottom: 4px; border: 1.5px solid #000;">
                <tr>
                    <td style="width: 32%; padding: 4px 8px; border: 1.5px solid #000;">
                        <div style="font-weight: 900; font-size: 11px; color: #002060;">UNIVERSIDAD ESTATAL DE BOLÍVAR</div>
                        <div style="font-size: 7.5px; font-weight: bold; color: #002060;">DEPARTAMENTO MÉDICO · SALUD OCUPACIONAL</div>
                    </td>
                    <td style="background: #d9d9f3; text-align: center; font-weight: 900; font-size: 13px; padding: 6px; border: 1.5px solid #000;">
                        EVALUACIÓN MÉDICA PREOCUPACIONAL - INICIO
                        <div style="font-size: 8px; font-weight: normal; margin-top: 2px;">FORMULARIO MSP / MDT 077 · HOJA 3 DE 3</div>
                    </td>
                </tr>
            </table>

            <!-- SECCIÓN K: EXAMEN FÍSICO REGIONAL -->
            <table>
                <tr>
                    <td colspan="5" class="bg-purple">K. EXAMEN FÍSICO REGIONAL</td>
                </tr>
                <tr class="bg-green" style="font-size: 7px;">
                    <td style="width: 20%;">CABEZA / CUELLO</td>
                    <td style="width: 20%;">TÓRAX / CARDIO</td>
                    <td style="width: 20%;">ABDOMEN / PELVIS</td>
                    <td style="width: 20%;">EXTREMIDADES</td>
                    <td style="width: 20%;">NEUROLÓGICO</td>
                </tr>
                <tr style="font-size: 7.2px; vertical-align: top;">
                    <td>
                        • Piel: Normal<br />
                        • Ojos/Párpados: Normal<br />
                        • Oído/Tímpanos: Normal<br />
                        • Orofaringe: Normal<br />
                        • Nariz/Mucosas: Normal<br />
                        • Cuello/Tiroides: Normal
                    </td>
                    <td>
                        • Tórax simétrico: Normal<br />
                        • Mamas: Normal<br />
                        • Corazón: R1/R2 rítmicos<br />
                        • Pulmones: Murmullo vesicular conservado<br />
                        • Parrilla costal: Normal
                    </td>
                    <td>
                        • Vísceras: Normal<br />
                        • Pared abdominal: Blando, no doloroso<br />
                        • Columna: Eje alineado, flexibilidad conservada<br />
                        • Pelvis / Genitales: Normal
                    </td>
                    <td>
                        • Vascular: Pulsos presentes<br />
                        • Miembros superiores: Movilidad conservada<br />
                        • Miembros inferiores: Sin edemas
                    </td>
                    <td>
                        • Fuerza muscular: 5/5<br />
                        • Sensibilidad: Conservada<br />
                        • Marcha: Estable<br />
                        • Reflejos osteotendinosos: Normales
                    </td>
                </tr>
                <tr>
                    <td colspan="5" style="padding: 4px 8px; font-weight: bold; background: #fafafa;">
                        HALLAZGOS: ${escapeHtml(exFisico)}
                    </td>
                </tr>
            </table>

            <!-- SECCIÓN L: RESULTADOS DE EXÁMENES -->
            <table>
                <tr>
                    <td colspan="3" class="bg-purple">L. RESULTADOS DE EXÁMENES GENERALES Y ESPECÍFICOS</td>
                </tr>
                <tr class="bg-green">
                    <td style="width: 35%;">EXAMEN</td>
                    <td style="width: 20%;">FECHA (aaaa/mm/dd)</td>
                    <td style="width: 45%;">RESULTADOS</td>
                </tr>
                ${exLab.map((item, idx) => `
                    <tr key="${escapeHtml(idx)}" class="text-center">
                        <td class="text-left font-bold">${escapeHtml(item.examen)}</td>
                        <td>${escapeHtml(item.fecha || '')}</td>
                        <td class="font-bold" style="color: #0284c7;">${escapeHtml(item.resultado)}</td>
                    </tr>
                `).join('')}
                <tr>
                    <td colspan="3" style="font-size: 7.5px; background: #fafafa; padding: 3px 6px;">
                        <strong>OBSERVACIONES:</strong> Pendiente recepción y cotejo de resultados paraclínicos.
                    </td>
                </tr>
            </table>

            <!-- SECCIÓN M: DIAGNÓSTICO -->
            <table>
                <tr>
                    <td colspan="5" class="bg-purple">
                        M. DIAGNÓSTICO
                        <span style="font-size: 7.5px; font-weight: normal; float: right;">PRE = PRESUNTIVO | DEF = DEFINITIVO</span>
                    </td>
                </tr>
                <tr class="bg-green">
                    <td style="width: 5%;">N°</td>
                    <td style="width: 65%;">DIAGNÓSTICO</td>
                    <td style="width: 14%;">CIE-10</td>
                    <td style="width: 8%;">PRE</td>
                    <td style="width: 8%;">DEF</td>
                </tr>
                ${diags.map((d, idx) => `
                    <tr key="${escapeHtml(idx)}" class="text-center font-bold">
                        <td>${escapeHtml(d.num || idx + 1)}</td>
                        <td class="text-left">${escapeHtml(d.desc)}</td>
                        <td>${escapeHtml(d.cie)}</td>
                        <td>${escapeHtml(d.pre ? 'X' : '')}</td>
                        <td>${escapeHtml(d.def ? 'X' : '')}</td>
                    </tr>
                `).join('')}
            </table>

            <!-- SECCIÓN N: APTITUD MÉDICA PARA EL TRABAJO -->
            <table>
                <tr>
                    <td colspan="4" class="bg-purple">N. APTITUD MÉDICA PARA EL TRABAJO</td>
                </tr>
                <tr class="text-center font-bold" style="font-size: 9px;">
                    <td style="width: 25%; background: ${escapeHtml(apt.apto ? '#dcfce7' : '#ffffff')}; color: ${escapeHtml(apt.apto ? '#15803d' : '#000000')};">
                        <span class="check-box ${escapeHtml(apt.apto ? 'checked' : '')}">X</span> APTO
                    </td>
                    <td style="width: 25%;">
                        <span class="check-box ${escapeHtml(apt.aptoObservacion ? 'checked' : '')}"></span> APTO EN OBSERVACIÓN
                    </td>
                    <td style="width: 25%;">
                        <span class="check-box ${escapeHtml(apt.aptoLimitaciones ? 'checked' : '')}"></span> APTO CON LIMITACIONES
                    </td>
                    <td style="width: 25%;">
                        <span class="check-box ${escapeHtml(apt.noApto ? 'checked' : '')}"></span> NO APTO
                    </td>
                </tr>
                <tr>
                    <td colspan="4" style="padding: 3px 6px; font-size: 7.5px;">
                        <strong>Observación:</strong> ${escapeHtml(apt.observacion || '')}<br />
                        <strong>Limitación o restricciones laborales:</strong> ${escapeHtml(apt.limitacion || '')}
                    </td>
                </tr>
            </table>

            <!-- SECCIÓN O: RECOMENDACIONES Y/O TRATAMIENTO -->
            <table>
                <tr>
                    <td class="bg-purple">O. RECOMENDACIONES Y/O TRATAMIENTO</td>
                </tr>
                <tr>
                    <td style="padding: 4px 8px; font-size: 8px;">
                        <ol style="margin: 0; padding-left: 16px;">
                            ${recs.map((rec, i) => `<li key="${escapeHtml(i)}"><strong>${escapeHtml(rec)}</strong></li>`).join('')}
                        </ol>
                    </td>
                </tr>
            </table>

            <!-- CERTIFICACIÓN DEL TRABAJADOR -->
            <div style="border: 1px solid #000; padding: 4px 6px; font-size: 7px; text-align: justify; margin-bottom: 4px; background: #fafafa;">
                <strong>CERTIFICACIÓN DEL TRABAJADOR:</strong> CERTIFICO QUE LO ANTERIORMENTE EXPRESADO EN RELACIÓN A MI ESTADO DE SALUD ES VERDAD. SE ME HA INFORMADO LAS MEDIDAS PREVENTIVAS A TOMAR PARA DISMINUIR O MITIGAR LOS RIESGOS RELACIONADOS CON MI ACTIVIDAD LABORAL.
            </div>

            <!-- SECCIÓN P & Q: PROFESIONAL Y FIRMA USUARIO -->
            <table>
                <tr class="bg-purple">
                    <td style="width: 65%;">P. DATOS DEL PROFESIONAL</td>
                    <td style="width: 35%;">Q. FIRMA DEL USUARIO</td>
                </tr>
                <tr>
                    <td style="vertical-align: top; padding: 6px;">
                        <table style="margin: 0; width: 100%; border: none;">
                            <tr style="border: none;">
                                <td style="border: none; width: 25%;"><strong>FECHA:</strong> ${escapeHtml(prof.fecha)}</td>
                                <td style="border: none; width: 25%;"><strong>HORA:</strong> ${escapeHtml(prof.hora)}</td>
                                <td style="border: none; width: 50%;"><strong>CÓDIGO MSP:</strong> ${escapeHtml(prof.codigo)}</td>
                            </tr>
                            <tr style="border: none;">
                                <td colspan="3" style="border: none; padding-top: 6px;">
                                    <strong>MÉDICO OCUPACIONAL:</strong> <span class="uppercase">${escapeHtml(prof.nombre)}</span><br />
                                    <span style="font-size: 7px; color: #555;">Unidad de Seguridad y Salud en el Trabajo - UEB</span>
                                </td>
                            </tr>
                        </table>
                    </td>
                    <td class="text-center" style="vertical-align: bottom; padding: 10px 6px;">
                        <div style="border-top: 1px solid #000; width: 85%; margin: 30px auto 2px auto;"></div>
                        <strong>FIRMA DEL TRABAJADOR</strong><br />
                        <span style="font-size: 7px;">C.I.: ${escapeHtml(ced)}</span>
                    </td>
                </tr>
            </table>
        </div>

        ${forPrint ? `
        <script>
            if (document.readyState === 'complete') {
                setTimeout(function() { window.print(); }, 350);
            } else {
                window.addEventListener('load', function() {
                    setTimeout(function() { window.print(); }, 350);
                });
            }
        </script>
        ` : ''}
    </body>
    </html>
    `;
    return html;
};

export const printOfficialIngresoForm = (record = {}, uebBannerLogo = '') => {
    const html = compileOfficialIngresoFormHtml(record, uebBannerLogo, true);
    const printWindow = window.open('', '_blank', 'width=1100,height=850');
    if (printWindow) {
        printWindow.document.open();
        printWindow.document.write(html);
        printWindow.document.close();
    } else {
        alert('Por favor habilite los popups en el navegador para imprimir el Formulario Oficial.');
    }
};

/**
 * Componente Modal para visualización e interactividad en pantalla
 * de la Ficha Médica Ocupacional Formulario MSP/MDT 077
 */
export default function OfficialFichaIngresoModal({
    isOpen,
    onClose,
    record,
    uebBannerLogo
}) {
    const [activeSheet, setActiveSheet] = useState(1); // 1 | 2 | 3 | 'all'

    if (!isOpen || !record) return null;

    const {
        pac, ced, p1Ape, p2Ape, p1Nom, p2Nom, edad, sexo, puesto, cargo, ciuo, actividades,
        fecIngreso, tel, rel, grpSangre, lat, orientacion, idGen, disc, ruc, estSalud,
        numHC, numArch, motivo, antClin, antQuir, gin, hab, empAnt, accTrab, enfProf,
        antFam, factRiesgo, actExtra, enfAct, orgSist, constantes, exFisico, exLab,
        diags, apt, recs, prof
    } = extractFichaFields(record);

    return (
        <div className="clinical-modal show" style={{ zIndex: 99999 }}>
            <div className="clinical-modal__backdrop" onClick={onClose}></div>
            <div className="clinical-modal__dialog" style={{ maxWidth: '1100px', width: '96vw', maxHeight: '94vh', display: 'flex', flexDirection: 'column' }}>
                {/* ENCABEZADO MODAL */}
                <header className="clinical-modal__header" style={{ background: '#002060', color: '#ffffff', padding: '14px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <FileText size={24} style={{ color: '#93c5fd' }} />
                        <div>
                            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', letterSpacing: '0.4px', color: '#ffffff' }}>
                                FORMATO OFICIAL: EVALUACIÓN MÉDICA PREOCUPACIONAL (FORMULARIO MSP 077)
                            </h3>
                            <p style={{ margin: 0, fontSize: '12px', color: '#bfdbfe' }}>
                                CH DE INGRESO · {pac} (C.I.: {ced})
                            </p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <button
                            type="button"
                            className="action-button action-button--accent"
                            onClick={() => printOfficialIngresoForm(record, uebBannerLogo)}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                background: '#0369a1',
                                color: '#ffffff',
                                fontWeight: '700',
                                padding: '7px 14px',
                                borderRadius: '8px',
                                fontSize: '12px',
                                border: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            <Printer size={15} /> Imprimir Formulario Oficial (A4)
                        </button>
                        <button aria-label="Cerrar"
                            type="button"
                            className="clinical-modal__close"
                            onClick={onClose}
                            style={{ color: '#ffffff' }}
                        >
                            <X size={20} />
                        </button>
                    </div>
                </header>

                {/* SELECTOR DE PESTAÑAS DE HOJAS DEL EXCEL */}
                <div style={{ display: 'flex', gap: '8px', padding: '10px 22px', background: '#f1f5f9', borderBottom: '1px solid #cbd5e1', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '12px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginRight: '6px' }}>
                        Hojas del Formato 077:
                    </span>
                    <button
                        type="button"
                        onClick={() => setActiveSheet(1)}
                        style={{
                            padding: '6px 14px',
                            borderRadius: '8px',
                            border: activeSheet === 1 ? '2px solid #002060' : '1px solid #cbd5e1',
                            background: activeSheet === 1 ? '#002060' : '#ffffff',
                            color: activeSheet === 1 ? '#ffffff' : '#1e293b',
                            fontWeight: '700',
                            fontSize: '12px',
                            cursor: 'pointer'
                        }}
                    >
                        077-PREOCUPA. INICIO 1-3
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveSheet(2)}
                        style={{
                            padding: '6px 14px',
                            borderRadius: '8px',
                            border: activeSheet === 2 ? '2px solid #002060' : '1px solid #cbd5e1',
                            background: activeSheet === 2 ? '#002060' : '#ffffff',
                            color: activeSheet === 2 ? '#ffffff' : '#1e293b',
                            fontWeight: '700',
                            fontSize: '12px',
                            cursor: 'pointer'
                        }}
                    >
                        077-PREOCUPA. INICIO 2-3
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveSheet(3)}
                        style={{
                            padding: '6px 14px',
                            borderRadius: '8px',
                            border: activeSheet === 3 ? '2px solid #002060' : '1px solid #cbd5e1',
                            background: activeSheet === 3 ? '#002060' : '#ffffff',
                            color: activeSheet === 3 ? '#ffffff' : '#1e293b',
                            fontWeight: '700',
                            fontSize: '12px',
                            cursor: 'pointer'
                        }}
                    >
                        077-PREOCUPA. INICIO 3-3
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveSheet('all')}
                        style={{
                            padding: '6px 14px',
                            borderRadius: '8px',
                            border: activeSheet === 'all' ? '2px solid #0284c7' : '1px solid #cbd5e1',
                            background: activeSheet === 'all' ? '#0284c7' : '#ffffff',
                            color: activeSheet === 'all' ? '#ffffff' : '#1e293b',
                            fontWeight: '700',
                            fontSize: '12px',
                            cursor: 'pointer'
                        }}
                    >
                        Ver Formulario Completo (1-3)
                    </button>
                </div>

                {/* CUERPO DEL MODAL (RÉPLICA EXACTA DEL EXCEL) */}
                <div className="clinical-modal__body" style={{ overflowY: 'auto', padding: '22px', background: '#e2e8f0', display: 'flex', flexDirection: 'column', gap: '22px' }}>
                    
                    {/* HOJA 1 */}
                    {(activeSheet === 1 || activeSheet === 'all') && (
                        <div style={{ background: '#ffffff', padding: '20px', border: '1.5px solid #000000', borderRadius: '4px', boxShadow: '0 4px 14px rgba(0,0,0,0.08)', fontSize: '11px', color: '#000000' }}>
                            {/* ENCABEZADO INSTITUCIONAL */}
                            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px', border: '1.5px solid #000' }}>
                                <tbody>
                                    <tr>
                                        <td style={{ width: '35%', padding: '6px 12px', border: '1.5px solid #000', verticalAlign: 'middle' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <img src={logoBienestar} style={{ height: '42px', objectFit: 'contain' }} alt="Bienestar Universitario" />
                                                {uebBannerLogo && <img src={uebBannerLogo} style={{ height: '42px', objectFit: 'contain' }} alt="UEB Logo" />}
                                                <div>
                                                    <div style={{ fontWeight: '900', fontSize: '12px', color: '#002060' }}>UNIVERSIDAD ESTATAL DE BOLÍVAR</div>
                                                    <div style={{ fontSize: '8px', fontWeight: 'bold', color: '#002060' }}>DIRECCIÓN DE BIENESTAR UNIVERSITARIO · SALUD OCUPACIONAL</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ background: '#d9d9f3', textAlign: 'center', fontWeight: '900', fontSize: '14px', padding: '10px', border: '1.5px solid #000' }}>
                                            EVALUACIÓN MÉDICA PREOCUPACIONAL - INICIO
                                            <div style={{ fontSize: '9px', fontWeight: 'normal', marginTop: '2px' }}>FORMULARIO MSP / MDT 077 · HOJA 1 DE 3</div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            {/* SECCIÓN A: DATOS DE LA EMPRESA */}
                            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '6px' }}>
                                <tbody>
                                    <tr>
                                        <td colSpan={6} style={{ background: '#d9d9f3', fontWeight: 'bold', padding: '4px 8px', border: '1px solid #000', fontSize: '11px' }}>
                                            A. DATOS DE LA EMPRESA DONDE LABORA EL TRABAJADOR O ASPIRANTE
                                        </td>
                                    </tr>
                                    <tr style={{ background: '#e2efda', fontWeight: 'bold', textAlign: 'center', fontSize: '8.5px' }}>
                                        <td style={{ border: '1px solid #000', width: '28%', padding: '4px' }}>INSTITUCIÓN DEL SISTEMA O NOMBRE DE LA EMPRESA</td>
                                        <td style={{ border: '1px solid #000', width: '14%', padding: '4px' }}>RUC</td>
                                        <td style={{ border: '1px solid #000', width: '8%', padding: '4px' }}>CIIU</td>
                                        <td style={{ border: '1px solid #000', width: '24%', padding: '4px' }}>ESTABLECIMIENTO DE SALUD</td>
                                        <td style={{ border: '1px solid #000', width: '16%', padding: '4px' }}>NÚMERO DE HISTORIA CLÍNICA</td>
                                        <td style={{ border: '1px solid #000', width: '10%', padding: '4px' }}>NÚMERO DE ARCHIVO</td>
                                    </tr>
                                    <tr style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '10px' }}>
                                        <td style={{ border: '1px solid #000', padding: '5px' }}>UNIVERSIDAD ESTATAL DE BOLIVAR</td>
                                        <td style={{ border: '1px solid #000', padding: '5px' }}>{ruc}</td>
                                        <td style={{ border: '1px solid #000', padding: '5px' }}>-</td>
                                        <td style={{ border: '1px solid #000', padding: '5px' }}>{estSalud}</td>
                                        <td style={{ border: '1px solid #000', padding: '5px' }}>{numHC}</td>
                                        <td style={{ border: '1px solid #000', padding: '5px' }}>{numArch}</td>
                                    </tr>
                                </tbody>
                            </table>

                            {/* DATOS DEL TRABAJADOR */}
                            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '6px' }}>
                                <tbody>
                                    <tr style={{ background: '#e2efda', fontWeight: 'bold', textAlign: 'center', fontSize: '8.5px' }}>
                                        <td style={{ border: '1px solid #000', width: '15%', padding: '4px' }}>PRIMER APELLIDO</td>
                                        <td style={{ border: '1px solid #000', width: '15%', padding: '4px' }}>SEGUNDO APELLIDO</td>
                                        <td style={{ border: '1px solid #000', width: '15%', padding: '4px' }}>PRIMER NOMBRE</td>
                                        <td style={{ border: '1px solid #000', width: '15%', padding: '4px' }}>SEGUNDO NOMBRE</td>
                                        <td style={{ border: '1px solid #000', width: '6%', padding: '4px' }}>SEXO</td>
                                        <td style={{ border: '1px solid #000', width: '6%', padding: '4px' }}>EDAD</td>
                                        <td style={{ border: '1px solid #000', width: '12%', padding: '4px' }}>RELIGIÓN</td>
                                        <td style={{ border: '1px solid #000', width: '8%', padding: '4px' }}>GRUPO SANG.</td>
                                        <td style={{ border: '1px solid #000', width: '8%', padding: '4px' }}>LATERALIDAD</td>
                                    </tr>
                                    <tr style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '10px' }}>
                                        <td style={{ border: '1px solid #000', padding: '5px' }}>{p1Ape}</td>
                                        <td style={{ border: '1px solid #000', padding: '5px' }}>{p2Ape}</td>
                                        <td style={{ border: '1px solid #000', padding: '5px' }}>{p1Nom}</td>
                                        <td style={{ border: '1px solid #000', padding: '5px' }}>{p2Nom}</td>
                                        <td style={{ border: '1px solid #000', padding: '5px' }}>{sexo}</td>
                                        <td style={{ border: '1px solid #000', padding: '5px' }}>{edad}</td>
                                        <td style={{ border: '1px solid #000', padding: '5px' }}>{rel}</td>
                                        <td style={{ border: '1px solid #000', padding: '5px' }}>{grpSangre}</td>
                                        <td style={{ border: '1px solid #000', padding: '5px' }}>{lat}</td>
                                    </tr>
                                </tbody>
                            </table>

                            {/* ORIENTACIÓN, GÉNERO, DISCAPACIDAD Y PUESTO */}
                            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px' }}>
                                <tbody>
                                    <tr style={{ background: '#e2efda', fontWeight: 'bold', textAlign: 'center', fontSize: '8.5px' }}>
                                        <td style={{ border: '1px solid #000', width: '16%', padding: '4px' }}>ORIENTACIÓN SEXUAL</td>
                                        <td style={{ border: '1px solid #000', width: '14%', padding: '4px' }}>IDENTIDAD DE GÉNERO</td>
                                        <td style={{ border: '1px solid #000', width: '14%', padding: '4px' }}>DISCAPACIDAD</td>
                                        <td style={{ border: '1px solid #000', width: '13%', padding: '4px' }}>FECHA DE INGRESO</td>
                                        <td style={{ border: '1px solid #000', width: '8%', padding: '4px' }}>CIUO</td>
                                        <td style={{ border: '1px solid #000', width: '22%', padding: '4px' }}>CARGO / OCUPACIÓN</td>
                                        <td style={{ border: '1px solid #000', width: '13%', padding: '4px' }}>TELÉFONO</td>
                                    </tr>
                                    <tr style={{ textAlign: 'center', fontSize: '10px' }}>
                                        <td style={{ border: '1px solid #000', padding: '5px', fontWeight: 'bold' }}>{orientacion}</td>
                                        <td style={{ border: '1px solid #000', padding: '5px', fontWeight: 'bold' }}>{idGen}</td>
                                        <td style={{ border: '1px solid #000', padding: '5px' }}>
                                            {disc.tiene ? <strong>SÍ ({disc.tipo} {disc.porcentaje}%)</strong> : <strong>NO [X]</strong>}
                                        </td>
                                        <td style={{ border: '1px solid #000', padding: '5px', fontWeight: 'bold' }}>{fecIngreso}</td>
                                        <td style={{ border: '1px solid #000', padding: '5px', fontWeight: 'bold' }}>{ciuo}</td>
                                        <td style={{ border: '1px solid #000', padding: '5px', fontWeight: 'bold' }}>{cargo}</td>
                                        <td style={{ border: '1px solid #000', padding: '5px' }}>{tel}</td>
                                    </tr>
                                    <tr>
                                        <td colSpan={7} style={{ border: '1px solid #000', padding: '5px 8px', background: '#fafafa', fontSize: '9.5px' }}>
                                            <strong>ACTIVIDADES RELEVANTES AL PUESTO DE TRABAJO A OCUPAR:</strong> <span style={{ textTransform: 'uppercase', fontWeight: 'bold' }}>{actividades}</span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            {/* SECCIÓN B: MOTIVO DE CONSULTA */}
                            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px' }}>
                                <tbody>
                                    <tr>
                                        <td style={{ background: '#d9d9f3', fontWeight: 'bold', padding: '4px 8px', border: '1px solid #000', fontSize: '11px' }}>
                                            B. MOTIVO DE CONSULTA <span style={{ fontSize: '9px', fontWeight: 'normal', float: 'right' }}>(Anotar la causa del problema en la versión del informante)</span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style={{ border: '1px solid #000', padding: '8px', fontWeight: 'bold', background: '#fafafa' }}>
                                            {motivo}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            {/* SECCIÓN C: ANTECEDENTES PERSONALES */}
                            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px' }}>
                                <tbody>
                                    <tr>
                                        <td colSpan={4} style={{ background: '#d9d9f3', fontWeight: 'bold', padding: '4px 8px', border: '1px solid #000', fontSize: '11px' }}>
                                            C. ANTECEDENTES PERSONALES
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colSpan={4} style={{ background: '#e2efda', fontWeight: 'bold', padding: '4px 8px', border: '1px solid #000', fontSize: '9px' }}>
                                            1. ANTECEDENTES CLÍNICOS Y QUIRÚRGICOS
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colSpan={4} style={{ border: '1px solid #000', padding: '6px 8px', fontSize: '9.5px' }}>
                                            <div><strong>Antecedentes clínicos:</strong> {antClin}</div>
                                            <div style={{ marginTop: '4px' }}><strong>Antecedentes quirúrgicos:</strong> {antQuir}</div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colSpan={4} style={{ background: '#e2efda', fontWeight: 'bold', padding: '4px 8px', border: '1px solid #000', fontSize: '9px' }}>
                                            2. ANTECEDENTES GINECO OBSTÉTRICOS
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colSpan={4} style={{ border: '1px solid #000', padding: 0 }}>
                                            <table style={{ width: '100%', borderCollapse: 'collapse', margin: 0 }}>
                                                <tbody>
                                                    <tr style={{ background: '#e2efda', fontSize: '8px', textAlign: 'center', fontWeight: 'bold' }}>
                                                        <td style={{ border: '1px solid #000', padding: '3px' }}>MENARQUÍA</td>
                                                        <td style={{ border: '1px solid #000', padding: '3px' }}>CICLOS</td>
                                                        <td style={{ border: '1px solid #000', padding: '3px' }}>FUM</td>
                                                        <td style={{ border: '1px solid #000', padding: '3px' }}>GESTAS</td>
                                                        <td style={{ border: '1px solid #000', padding: '3px' }}>PARTOS</td>
                                                        <td style={{ border: '1px solid #000', padding: '3px' }}>CESÁREAS</td>
                                                        <td style={{ border: '1px solid #000', padding: '3px' }}>ABORTOS</td>
                                                        <td style={{ border: '1px solid #000', padding: '3px' }}>HIJOS VIVOS</td>
                                                        <td style={{ border: '1px solid #000', padding: '3px' }}>VIDA SEXUAL</td>
                                                        <td style={{ border: '1px solid #000', padding: '3px' }}>PLANIFICACIÓN</td>
                                                    </tr>
                                                    <tr style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '9.5px' }}>
                                                        <td style={{ border: '1px solid #000', padding: '4px' }}>{gin.menarquia || '-'}</td>
                                                        <td style={{ border: '1px solid #000', padding: '4px' }}>{gin.ciclos || '-'}</td>
                                                        <td style={{ border: '1px solid #000', padding: '4px' }}>{gin.fum || '-'}</td>
                                                        <td style={{ border: '1px solid #000', padding: '4px' }}>{gin.gestas ?? 0}</td>
                                                        <td style={{ border: '1px solid #000', padding: '4px' }}>{gin.partos ?? 0}</td>
                                                        <td style={{ border: '1px solid #000', padding: '4px' }}>{gin.cesareas ?? 0}</td>
                                                        <td style={{ border: '1px solid #000', padding: '4px' }}>{gin.abortos ?? 0}</td>
                                                        <td style={{ border: '1px solid #000', padding: '4px' }}>{gin.hijosVivos ?? 0}</td>
                                                        <td style={{ border: '1px solid #000', padding: '4px' }}>{gin.vidaSexualActiva ? 'SÍ' : 'NO [X]'}</td>
                                                        <td style={{ border: '1px solid #000', padding: '4px' }}>{gin.planificacionFamiliar ? 'SÍ' : 'NO [X]'}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                            <div style={{ padding: '5px 8px', fontSize: '9px', background: '#fafafa', borderTop: '1px solid #000' }}>
                                                <strong>PAPANICOLAOU:</strong> {gin.papanicolaou?.realizada ? `SÍ (${gin.papanicolaou.tiempo} - ${gin.papanicolaou.resultado})` : 'NO'} |
                                                <strong> COLPOSCOPIA:</strong> {gin.colposcopia?.resultado || ''} |
                                                <strong> MAMOGRAFÍA:</strong> {gin.mamografia?.resultado || ''} |
                                                <strong> ECO-MAMARIO:</strong> {gin.ecoMamario?.resultado || ''}
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colSpan={4} style={{ background: '#e2efda', fontWeight: 'bold', padding: '4px 8px', border: '1px solid #000', fontSize: '9px' }}>
                                            3. HÁBITOS TÓXICOS Y ESTILO DE VIDA
                                        </td>
                                    </tr>
                                    <tr style={{ fontSize: '9.5px' }}>
                                        <td style={{ border: '1px solid #000', padding: '5px 8px', width: '25%' }}>
                                            <strong>TABACO:</strong> {hab.tabaco ? 'SÍ' : 'NO [X]'}
                                        </td>
                                        <td style={{ border: '1px solid #000', padding: '5px 8px', width: '25%' }}>
                                            <strong>ALCOHOL:</strong> {hab.alcohol ? 'SÍ' : 'NO [X]'}
                                        </td>
                                        <td style={{ border: '1px solid #000', padding: '5px 8px', width: '25%' }}>
                                            <strong>ACTIVIDAD FÍSICA:</strong> {hab.actividadFisica?.tiene ? `SÍ (${hab.actividadFisica.cual} - ${hab.actividadFisica.tiempo})` : 'NO'}
                                        </td>
                                        <td style={{ border: '1px solid #000', padding: '5px 8px', width: '25%' }}>
                                            <strong>MEDICACIÓN:</strong> {hab.medicacionHabitual?.tiene ? `SÍ (${hab.medicacionHabitual.cual} - ${hab.medicacionHabitual.tiempo})` : 'NO'}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            {/* SECCIÓN D: ANTECEDENTES DE TRABAJO */}
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <tbody>
                                    <tr>
                                        <td colSpan={6} style={{ background: '#d9d9f3', fontWeight: 'bold', padding: '4px 8px', border: '1px solid #000', fontSize: '11px' }}>
                                            D. ANTECEDENTES DE TRABAJO
                                        </td>
                                    </tr>
                                    <tr style={{ background: '#e2efda', fontWeight: 'bold', textAlign: 'center', fontSize: '8.5px' }}>
                                        <td style={{ border: '1px solid #000', width: '26%', padding: '4px' }}>EMPRESA</td>
                                        <td style={{ border: '1px solid #000', width: '14%', padding: '4px' }}>PUESTO</td>
                                        <td style={{ border: '1px solid #000', width: '16%', padding: '4px' }}>ACTIVIDADES</td>
                                        <td style={{ border: '1px solid #000', width: '10%', padding: '4px' }}>TIEMPO</td>
                                        <td style={{ border: '1px solid #000', width: '20%', padding: '4px' }}>RIESGOS IDENTIFICADOS</td>
                                        <td style={{ border: '1px solid #000', width: '14%', padding: '4px' }}>OBSERVACIONES</td>
                                    </tr>
                                    {empAnt.map((item, idx) => (
                                        <tr key={idx} style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '9.5px' }}>
                                            <td style={{ border: '1px solid #000', padding: '5px', textAlign: 'left' }}>{item.empresa}</td>
                                            <td style={{ border: '1px solid #000', padding: '5px' }}>{item.puesto}</td>
                                            <td style={{ border: '1px solid #000', padding: '5px' }}>{item.actividades}</td>
                                            <td style={{ border: '1px solid #000', padding: '5px' }}>{item.tiempo}</td>
                                            <td style={{ border: '1px solid #000', padding: '5px', fontSize: '8.5px' }}>
                                                {item.riesgos?.fisico && <span style={{ background: '#fee2e2', padding: '2px 4px', borderRadius: '4px', marginRight: '3px' }}>FÍSICO</span>}
                                                {item.riesgos?.quimico && <span style={{ background: '#e0f2fe', padding: '2px 4px', borderRadius: '4px' }}>QUÍMICO</span>}
                                            </td>
                                            <td style={{ border: '1px solid #000', padding: '5px' }}>{item.observaciones || ''}</td>
                                        </tr>
                                    ))}
                                    <tr>
                                        <td colSpan={6} style={{ border: '1px solid #000', padding: '6px 8px', fontSize: '9.5px', background: '#fafafa' }}>
                                            <div><strong>ACCIDENTES DE TRABAJO:</strong> {accTrab.calificado ? `CALIFICADO IESS - ${accTrab.especificaciones}` : 'NO CALIFICADO [X] - Observaciones: NINGUNA'}</div>
                                            <div style={{ marginTop: '3px' }}><strong>ENFERMEDADES PROFESIONALES:</strong> {enfProf.calificado ? `CALIFICADA IESS - ${enfProf.especificaciones}` : 'NO CALIFICADA [X] - Observaciones: NINGUNA'}</div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* HOJA 2 */}
                    {(activeSheet === 2 || activeSheet === 'all') && (
                        <div style={{ background: '#ffffff', padding: '20px', border: '1.5px solid #000000', borderRadius: '4px', boxShadow: '0 4px 14px rgba(0,0,0,0.08)', fontSize: '11px', color: '#000000' }}>
                            {/* ENCABEZADO HOJA 2 */}
                            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px', border: '1.5px solid #000' }}>
                                <tbody>
                                    <tr>
                                        <td style={{ width: '35%', padding: '6px 12px', border: '1.5px solid #000', verticalAlign: 'middle' }}>
                                            <div style={{ fontWeight: '900', fontSize: '12px', color: '#002060' }}>UNIVERSIDAD ESTATAL DE BOLÍVAR</div>
                                            <div style={{ fontSize: '8px', fontWeight: 'bold', color: '#002060' }}>DEPARTAMENTO MÉDICO · SALUD OCUPACIONAL</div>
                                        </td>
                                        <td style={{ background: '#d9d9f3', textAlign: 'center', fontWeight: '900', fontSize: '14px', padding: '10px', border: '1.5px solid #000' }}>
                                            EVALUACIÓN MÉDICA PREOCUPACIONAL - INICIO
                                            <div style={{ fontSize: '9px', fontWeight: 'normal', marginTop: '2px' }}>FORMULARIO MSP / MDT 077 · HOJA 2 DE 3</div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            {/* SECCIÓN E: ANTECEDENTES FAMILIARES */}
                            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px' }}>
                                <tbody>
                                    <tr>
                                        <td style={{ background: '#d9d9f3', fontWeight: 'bold', padding: '4px 8px', border: '1px solid #000', fontSize: '11px' }}>
                                            E. ANTECEDENTES FAMILIARES (DETALLAR EL PARENTESCO)
                                        </td>
                                    </tr>
                                    <tr style={{ background: '#e2efda', fontSize: '8.5px', textAlign: 'center', fontWeight: 'bold' }}>
                                        <td style={{ border: '1px solid #000', padding: '4px' }}>
                                            [X] 1. CARDIO-VASCULAR | [ ] 2. METABÓLICA | [ ] 3. NEUROLÓGICA | [ ] 4. ONCOLÓGICA | [ ] 5. INFECCIOSA | [ ] 6. HEREDITARIA | [ ] 7. DISCAPACIDADES | [ ] 8. OTROS
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style={{ border: '1px solid #000', padding: '8px', fontWeight: 'bold', background: '#fafafa', fontSize: '10px' }}>
                                            {antFam.descripcion || ''}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            {/* SECCIÓN F: FACTORES DE RIESGO DEL PUESTO DE TRABAJO */}
                            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px' }}>
                                <tbody>
                                    <tr>
                                        <td colSpan={5} style={{ background: '#d9d9f3', fontWeight: 'bold', padding: '4px 8px', border: '1px solid #000', fontSize: '11px' }}>
                                            F. FACTORES DE RIESGOS DEL PUESTO DE TRABAJO ACTUAL
                                        </td>
                                    </tr>
                                    <tr style={{ background: '#e2efda', fontWeight: 'bold', textAlign: 'center', fontSize: '8.5px' }}>
                                        <td style={{ border: '1px solid #000', width: '22%', padding: '4px' }}>PUESTO / ÁREA</td>
                                        <td style={{ border: '1px solid #000', width: '14%', padding: '4px' }}>ACTIVIDADES</td>
                                        <td style={{ border: '1px solid #000', width: '22%', padding: '4px' }}>FÍSICO</td>
                                        <td style={{ border: '1px solid #000', width: '22%', padding: '4px' }}>MECÁNICO</td>
                                        <td style={{ border: '1px solid #000', width: '20%', padding: '4px' }}>QUÍMICO</td>
                                    </tr>
                                    <tr style={{ fontSize: '9px' }}>
                                        <td style={{ border: '1px solid #000', padding: '6px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                                            {factRiesgo.puesto || ''}
                                        </td>
                                        <td style={{ border: '1px solid #000', padding: '6px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                                            {factRiesgo.actividades || ''}
                                        </td>
                                        <td style={{ border: '1px solid #000', padding: '6px' }}>
                                            <div><strong>[X] Temperaturas altas</strong></div>
                                            <div><strong>[X] Temperaturas bajas</strong></div>
                                            <div style={{ color: '#888' }}>[ ] Radiación / Ruido</div>
                                        </td>
                                        <td style={{ border: '1px solid #000', padding: '6px' }}>
                                            <div><strong>[X] Caídas al mismo nivel</strong></div>
                                            <div><strong>[X] Caídas a diferente nivel</strong></div>
                                            <div style={{ color: '#888' }}>[ ] Atrapamiento / Cortes</div>
                                        </td>
                                        <td style={{ border: '1px solid #000', padding: '6px', color: '#777' }}>
                                            [ ] Polvos / Vapores<br />
                                            [ ] Humos / Químicos<br />
                                            <em>(Sin exposición directa)</em>
                                        </td>
                                    </tr>
                                    <tr style={{ background: '#e2efda', fontWeight: 'bold', textAlign: 'center', fontSize: '8.5px' }}>
                                        <td colSpan={2} style={{ border: '1px solid #000', padding: '4px' }}>BIOLÓGICO</td>
                                        <td style={{ border: '1px solid #000', padding: '4px' }}>ERGONÓMICO</td>
                                        <td style={{ border: '1px solid #000', padding: '4px' }}>PSICOSOCIAL</td>
                                        <td style={{ border: '1px solid #000', padding: '4px' }}>MEDIDAS PREVENTIVAS</td>
                                    </tr>
                                    <tr style={{ fontSize: '9px' }}>
                                        <td colSpan={2} style={{ border: '1px solid #000', padding: '6px' }}>
                                            <div><strong>[X] Virus</strong> (Exposición comunitaria)</div>
                                            <div style={{ color: '#888' }}>[ ] Hongos / Bacterias</div>
                                        </td>
                                        <td style={{ border: '1px solid #000', padding: '6px' }}>
                                            <div><strong>[X] Posiciones estáticas</strong> prolongadas</div>
                                            <div style={{ color: '#888' }}>[ ] Manejo de cargas</div>
                                        </td>
                                        <td style={{ border: '1px solid #000', padding: '6px' }}>
                                            <div><strong>[X] Inestabilidad laboral</strong></div>
                                            <div style={{ color: '#888' }}>[ ] Monotonía / Sobrecarga</div>
                                        </td>
                                        <td style={{ border: '1px solid #000', padding: '6px', background: '#fafafa', fontSize: '8.5px', lineHeight: '1.3' }}>
                                            {factRiesgo.medidasPreventivas}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            {/* SECCIÓN G: ACTIVIDADES EXTRA LABORALES */}
                            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px' }}>
                                <tbody>
                                    <tr>
                                        <td style={{ background: '#d9d9f3', fontWeight: 'bold', padding: '4px 8px', border: '1px solid #000', fontSize: '11px' }}>
                                            G. ACTIVIDADES EXTRA LABORALES
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>
                                            {actExtra}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            {/* SECCIÓN H: ENFERMEDAD ACTUAL */}
                            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px' }}>
                                <tbody>
                                    <tr>
                                        <td style={{ background: '#d9d9f3', fontWeight: 'bold', padding: '4px 8px', border: '1px solid #000', fontSize: '11px' }}>
                                            H. ENFERMEDAD ACTUAL
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style={{ border: '1px solid #000', padding: '8px', fontWeight: 'bold', background: '#fafafa' }}>
                                            {enfAct}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            {/* SECCIÓN I: REVISIÓN ACTUAL DE ÓRGANOS Y SISTEMAS */}
                            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px' }}>
                                <tbody>
                                    <tr>
                                        <td colSpan={5} style={{ background: '#d9d9f3', fontWeight: 'bold', padding: '4px 8px', border: '1px solid #000', fontSize: '11px' }}>
                                            I. REVISIÓN ACTUAL DE ÓRGANOS Y SISTEMAS
                                        </td>
                                    </tr>
                                    <tr style={{ background: '#e2efda', fontSize: '8.5px', textAlign: 'center', fontWeight: 'bold' }}>
                                        <td style={{ border: '1px solid #000', padding: '3px' }}>1. PIEL - ANEXOS: CP</td>
                                        <td style={{ border: '1px solid #000', padding: '3px' }}>3. RESPIRATORIO: CP</td>
                                        <td style={{ border: '1px solid #000', padding: '3px' }}>5. DIGESTIVO: CP</td>
                                        <td style={{ border: '1px solid #000', padding: '3px' }}>7. MÚSCULO ESQ.: CP</td>
                                        <td style={{ border: '1px solid #000', padding: '3px' }}>9. HEMO LINFÁTICO: CP</td>
                                    </tr>
                                    <tr style={{ background: '#e2efda', fontSize: '8.5px', textAlign: 'center', fontWeight: 'bold' }}>
                                        <td style={{ border: '1px solid #000', padding: '3px' }}>2. SENTIDOS: CP</td>
                                        <td style={{ border: '1px solid #000', padding: '3px' }}>4. CARDIO-VASCULAR: CP</td>
                                        <td style={{ border: '1px solid #000', padding: '3px' }}>6. GENITO-URINARIO: CP</td>
                                        <td style={{ border: '1px solid #000', padding: '3px' }}>8. ENDOCRINO: CP</td>
                                        <td style={{ border: '1px solid #000', padding: '3px' }}>10. NERVIOSO: CP</td>
                                    </tr>
                                    <tr>
                                        <td colSpan={5} style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold', background: '#fafafa' }}>
                                            {orgSist}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            {/* SECCIÓN J: CONSTANTES VITALES Y ANTROPOMETRÍA */}
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <tbody>
                                    <tr>
                                        <td colSpan={9} style={{ background: '#d9d9f3', fontWeight: 'bold', padding: '4px 8px', border: '1px solid #000', fontSize: '11px' }}>
                                            J. CONSTANTES VITALES Y ANTROPOMETRÍA
                                        </td>
                                    </tr>
                                    <tr style={{ background: '#e2efda', fontWeight: 'bold', textAlign: 'center', fontSize: '8px' }}>
                                        <td style={{ border: '1px solid #000', width: '14%', padding: '4px' }}>PRESIÓN ART. (mmHg)</td>
                                        <td style={{ border: '1px solid #000', width: '10%', padding: '4px' }}>TEMP. (°C)</td>
                                        <td style={{ border: '1px solid #000', width: '12%', padding: '4px' }}>FREQ. CARD. (Lat/min)</td>
                                        <td style={{ border: '1px solid #000', width: '11%', padding: '4px' }}>SAT. O2 (%)</td>
                                        <td style={{ border: '1px solid #000', width: '12%', padding: '4px' }}>FREQ. RESP.</td>
                                        <td style={{ border: '1px solid #000', width: '10%', padding: '4px' }}>PESO (Kg)</td>
                                        <td style={{ border: '1px solid #000', width: '10%', padding: '4px' }}>TALLA (m)</td>
                                        <td style={{ border: '1px solid #000', width: '11%', padding: '4px' }}>I.M.C. (Kg/m²)</td>
                                        <td style={{ border: '1px solid #000', width: '10%', padding: '4px' }}>PERÍMETRO ABD.</td>
                                    </tr>
                                    <tr style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '11px' }}>
                                        <td style={{ border: '1px solid #000', padding: '6px', color: '#0284c7' }}>{constantes.pa} mmHg</td>
                                        <td style={{ border: '1px solid #000', padding: '6px' }}>{constantes.temp} °C</td>
                                        <td style={{ border: '1px solid #000', padding: '6px' }}>{constantes.fc} lpm</td>
                                        <td style={{ border: '1px solid #000', padding: '6px' }}>{constantes.satO2}%</td>
                                        <td style={{ border: '1px solid #000', padding: '6px' }}>{constantes.fr} rpm</td>
                                        <td style={{ border: '1px solid #000', padding: '6px' }}>{constantes.peso} Kg</td>
                                        <td style={{ border: '1px solid #000', padding: '6px' }}>{constantes.talla} m</td>
                                        <td style={{ border: '1px solid #000', padding: '6px', background: '#f0fdf4', color: '#166534' }}>{constantes.imc}</td>
                                        <td style={{ border: '1px solid #000', padding: '6px' }}>{constantes.perimetroAbd || '-'}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* HOJA 3 */}
                    {(activeSheet === 3 || activeSheet === 'all') && (
                        <div style={{ background: '#ffffff', padding: '20px', border: '1.5px solid #000000', borderRadius: '4px', boxShadow: '0 4px 14px rgba(0,0,0,0.08)', fontSize: '11px', color: '#000000' }}>
                            {/* ENCABEZADO HOJA 3 */}
                            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px', border: '1.5px solid #000' }}>
                                <tbody>
                                    <tr>
                                        <td style={{ width: '35%', padding: '6px 12px', border: '1.5px solid #000', verticalAlign: 'middle' }}>
                                            <div style={{ fontWeight: '900', fontSize: '12px', color: '#002060' }}>UNIVERSIDAD ESTATAL DE BOLÍVAR</div>
                                            <div style={{ fontSize: '8px', fontWeight: 'bold', color: '#002060' }}>DEPARTAMENTO MÉDICO · SALUD OCUPACIONAL</div>
                                        </td>
                                        <td style={{ background: '#d9d9f3', textAlign: 'center', fontWeight: '900', fontSize: '14px', padding: '10px', border: '1.5px solid #000' }}>
                                            EVALUACIÓN MÉDICA PREOCUPACIONAL - INICIO
                                            <div style={{ fontSize: '9px', fontWeight: 'normal', marginTop: '2px' }}>FORMULARIO MSP / MDT 077 · HOJA 3 DE 3</div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            {/* SECCIÓN K: EXAMEN FÍSICO REGIONAL */}
                            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px' }}>
                                <tbody>
                                    <tr>
                                        <td colSpan={5} style={{ background: '#d9d9f3', fontWeight: 'bold', padding: '4px 8px', border: '1px solid #000', fontSize: '11px' }}>
                                            K. EXAMEN FÍSICO REGIONAL
                                        </td>
                                    </tr>
                                    <tr style={{ background: '#e2efda', fontWeight: 'bold', textAlign: 'center', fontSize: '8.5px' }}>
                                        <td style={{ border: '1px solid #000', width: '20%', padding: '4px' }}>CABEZA / CUELLO</td>
                                        <td style={{ border: '1px solid #000', width: '20%', padding: '4px' }}>TÓRAX / CARDIO</td>
                                        <td style={{ border: '1px solid #000', width: '20%', padding: '4px' }}>ABDOMEN / PELVIS</td>
                                        <td style={{ border: '1px solid #000', width: '20%', padding: '4px' }}>EXTREMIDADES</td>
                                        <td style={{ border: '1px solid #000', width: '20%', padding: '4px' }}>NEUROLÓGICO</td>
                                    </tr>
                                    <tr style={{ fontSize: '9px', verticalAlign: 'top' }}>
                                        <td style={{ border: '1px solid #000', padding: '6px' }}>
                                            • Piel: Normal<br />
                                            • Ojos/Párpados: Normal<br />
                                            • Oído/Tímpanos: Normal<br />
                                            • Orofaringe: Normal<br />
                                            • Nariz/Mucosas: Normal<br />
                                            • Cuello: Móvil, sin masas
                                        </td>
                                        <td style={{ border: '1px solid #000', padding: '6px' }}>
                                            • Tórax simétrico: Normal<br />
                                            • Mamas: Normal<br />
                                            • Corazón: R1/R2 rítmicos<br />
                                            • Pulmones: Murmullo vesicular conservado<br />
                                            • Parrilla costal: Normal
                                        </td>
                                        <td style={{ border: '1px solid #000', padding: '6px' }}>
                                            • Vísceras: Normal<br />
                                            • Pared abdominal: Blando, no doloroso<br />
                                            • Columna: Eje alineado, flexibilidad conservada<br />
                                            • Pelvis / Genitales: Normal
                                        </td>
                                        <td style={{ border: '1px solid #000', padding: '6px' }}>
                                            • Vascular: Pulsos conservados<br />
                                            • Miembros superiores: Movilidad adecuada<br />
                                            • Miembros inferiores: Sin edemas
                                        </td>
                                        <td style={{ border: '1px solid #000', padding: '6px' }}>
                                            • Fuerza muscular: 5/5<br />
                                            • Sensibilidad: Conservada<br />
                                            • Marcha: Estable<br />
                                            • Reflejos osteotendinosos: Normales
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colSpan={5} style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold', background: '#fafafa' }}>
                                            HALLAZGOS: {exFisico}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            {/* SECCIÓN L: RESULTADOS DE EXÁMENES */}
                            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px' }}>
                                <tbody>
                                    <tr>
                                        <td colSpan={3} style={{ background: '#d9d9f3', fontWeight: 'bold', padding: '4px 8px', border: '1px solid #000', fontSize: '11px' }}>
                                            L. RESULTADOS DE EXÁMENES GENERALES Y ESPECÍFICOS DE ACUERDO AL RIESGO Y PUESTO
                                        </td>
                                    </tr>
                                    <tr style={{ background: '#e2efda', fontWeight: 'bold', textAlign: 'center', fontSize: '8.5px' }}>
                                        <td style={{ border: '1px solid #000', width: '35%', padding: '4px' }}>EXAMEN</td>
                                        <td style={{ border: '1px solid #000', width: '20%', padding: '4px' }}>FECHA (aaaa/mm/dd)</td>
                                        <td style={{ border: '1px solid #000', width: '45%', padding: '4px' }}>RESULTADOS</td>
                                    </tr>
                                    {exLab.map((item, idx) => (
                                        <tr key={idx} style={{ textAlign: 'center', fontSize: '10px' }}>
                                            <td style={{ border: '1px solid #000', padding: '5px', textAlign: 'left', fontWeight: 'bold' }}>{item.examen}</td>
                                            <td style={{ border: '1px solid #000', padding: '5px' }}>{item.fecha || ''}</td>
                                            <td style={{ border: '1px solid #000', padding: '5px', fontWeight: 'bold', color: '#0284c7' }}>{item.resultado}</td>
                                        </tr>
                                    ))}
                                    <tr>
                                        <td colSpan={3} style={{ border: '1px solid #000', padding: '4px 8px', fontSize: '9px', background: '#fafafa' }}>
                                            <strong>OBSERVACIONES:</strong> Pendiente recepción y cotejo de resultados de laboratorio clínico y radiología.
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            {/* SECCIÓN M: DIAGNÓSTICO */}
                            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px' }}>
                                <tbody>
                                    <tr>
                                        <td colSpan={5} style={{ background: '#d9d9f3', fontWeight: 'bold', padding: '4px 8px', border: '1px solid #000', fontSize: '11px' }}>
                                            M. DIAGNÓSTICO <span style={{ fontSize: '9px', fontWeight: 'normal', float: 'right' }}>PRE = PRESUNTIVO | DEF = DEFINITIVO</span>
                                        </td>
                                    </tr>
                                    <tr style={{ background: '#e2efda', fontWeight: 'bold', textAlign: 'center', fontSize: '8.5px' }}>
                                        <td style={{ border: '1px solid #000', width: '5%', padding: '4px' }}>N°</td>
                                        <td style={{ border: '1px solid #000', width: '65%', padding: '4px' }}>DIAGNÓSTICO</td>
                                        <td style={{ border: '1px solid #000', width: '14%', padding: '4px' }}>CIE-10</td>
                                        <td style={{ border: '1px solid #000', width: '8%', padding: '4px' }}>PRE</td>
                                        <td style={{ border: '1px solid #000', width: '8%', padding: '4px' }}>DEF</td>
                                    </tr>
                                    {diags.map((d, idx) => (
                                        <tr key={idx} style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '10px' }}>
                                            <td style={{ border: '1px solid #000', padding: '5px' }}>{d.num || idx + 1}</td>
                                            <td style={{ border: '1px solid #000', padding: '5px', textAlign: 'left' }}>{d.desc}</td>
                                            <td style={{ border: '1px solid #000', padding: '5px' }}>{d.cie}</td>
                                            <td style={{ border: '1px solid #000', padding: '5px' }}>{d.pre ? 'X' : ''}</td>
                                            <td style={{ border: '1px solid #000', padding: '5px' }}>{d.def ? 'X' : ''}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* SECCIÓN N: APTITUD MÉDICA PARA EL TRABAJO */}
                            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px' }}>
                                <tbody>
                                    <tr>
                                        <td colSpan={4} style={{ background: '#d9d9f3', fontWeight: 'bold', padding: '4px 8px', border: '1px solid #000', fontSize: '11px' }}>
                                            N. APTITUD MÉDICA PARA EL TRABAJO
                                        </td>
                                    </tr>
                                    <tr style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '11px' }}>
                                        <td style={{ border: '1px solid #000', width: '25%', padding: '8px', background: apt.apto ? '#dcfce7' : '#ffffff', color: apt.apto ? '#15803d' : '#000000' }}>
                                            {apt.apto ? '☑' : '☐'} APTO
                                        </td>
                                        <td style={{ border: '1px solid #000', width: '25%', padding: '8px' }}>
                                            {apt.aptoObservacion ? '☑' : '☐'} APTO EN OBSERVACIÓN
                                        </td>
                                        <td style={{ border: '1px solid #000', width: '25%', padding: '8px' }}>
                                            {apt.aptoLimitaciones ? '☑' : '☐'} APTO CON LIMITACIONES
                                        </td>
                                        <td style={{ border: '1px solid #000', width: '25%', padding: '8px' }}>
                                            {apt.noApto ? '☑' : '☐'} NO APTO
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colSpan={4} style={{ border: '1px solid #000', padding: '6px 8px', fontSize: '9.5px' }}>
                                            <div><strong>Observación:</strong> {apt.observacion || ''}</div>
                                            <div style={{ marginTop: '3px' }}><strong>Limitación o restricciones laborales:</strong> {apt.limitacion || ''}</div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            {/* SECCIÓN O: RECOMENDACIONES Y/O TRATAMIENTO */}
                            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px' }}>
                                <tbody>
                                    <tr>
                                        <td style={{ background: '#d9d9f3', fontWeight: 'bold', padding: '4px 8px', border: '1px solid #000', fontSize: '11px' }}>
                                            O. RECOMENDACIONES Y/O TRATAMIENTO
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style={{ border: '1px solid #000', padding: '6px 12px', fontSize: '9.5px' }}>
                                            <ol style={{ margin: 0, paddingLeft: '18px' }}>
                                                {recs.map((rec, i) => (
                                                    <li key={i} style={{ marginBottom: '2px' }}><strong>{rec}</strong></li>
                                                ))}
                                            </ol>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            {/* CERTIFICACIÓN */}
                            <div style={{ border: '1px solid #000', padding: '5px 8px', fontSize: '8px', textAlign: 'justify', marginBottom: '8px', background: '#fafafa' }}>
                                <strong>CERTIFICACIÓN DEL TRABAJADOR:</strong> CERTIFICO QUE LO ANTERIORMENTE EXPRESADO EN RELACIÓN A MI ESTADO DE SALUD ES VERDAD. SE ME HA INFORMADO LAS MEDIDAS PREVENTIVAS A TOMAR PARA DISMINUIR O MITIGAR LOS RIESGOS RELACIONADOS CON MI ACTIVIDAD LABORAL.
                            </div>

                            {/* SECCIÓN P & Q: PROFESIONAL Y FIRMA */}
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <tbody>
                                    <tr style={{ background: '#d9d9f3', fontWeight: 'bold', fontSize: '10.5px' }}>
                                        <td style={{ border: '1px solid #000', width: '65%', padding: '4px 8px' }}>P. DATOS DEL PROFESIONAL</td>
                                        <td style={{ border: '1px solid #000', width: '35%', padding: '4px 8px', textAlign: 'center' }}>Q. FIRMA DEL USUARIO</td>
                                    </tr>
                                    <tr>
                                        <td style={{ border: '1px solid #000', padding: '8px', verticalAlign: 'top' }}>
                                            <div style={{ display: 'flex', gap: '16px', marginBottom: '6px', fontSize: '9.5px' }}>
                                                <div><strong>FECHA:</strong> {prof.fecha}</div>
                                                <div><strong>HORA:</strong> {prof.hora}</div>
                                                <div><strong>CÓDIGO:</strong> {prof.codigo}</div>
                                            </div>
                                            <div style={{ fontSize: '10px' }}>
                                                <strong>MÉDICO OCUPACIONAL:</strong> <span style={{ textTransform: 'uppercase', fontWeight: 'bold' }}>{prof.nombre}</span><br />
                                                <span style={{ fontSize: '8px', color: '#64748b' }}>Unidad de Seguridad y Salud en el Trabajo - UEB</span>
                                            </div>
                                        </td>
                                        <td style={{ border: '1px solid #000', textAlign: 'center', padding: '12px 8px', verticalAlign: 'bottom' }}>
                                            <div style={{ borderTop: '1px solid #000', width: '80%', margin: '40px auto 4px auto' }}></div>
                                            <div style={{ fontWeight: 'bold', fontSize: '9.5px' }}>FIRMA DEL TRABAJADOR</div>
                                            <div style={{ fontSize: '8px', color: '#555' }}>C.I.: {ced}</div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* PIE DEL MODAL */}
                <footer className="clinical-modal__actions" style={{ padding: '14px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', borderTop: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                        Formulario oficial MSP 077
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            type="button"
                            className="action-button action-button--light"
                            onClick={onClose}
                        >
                            Cerrar
                        </button>
                        <button
                            type="button"
                            className="action-button action-button--accent"
                            onClick={() => printOfficialIngresoForm(record, uebBannerLogo)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                        >
                            <Printer size={15} /> Imprimir Formulario Oficial (Excel A4)
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
}
