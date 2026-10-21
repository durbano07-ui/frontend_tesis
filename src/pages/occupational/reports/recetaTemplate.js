/**
 * Plantilla HTML de la receta médica de Medicina Ocupacional.
 * Extraído de MedicoOcupacional_page.jsx — ISO/IEC 25010, mantenibilidad (modularidad).
 */
import { escapeHtml } from '../../../utils/escapeHtml';
import { logoBienestar } from '../../../assets/logoBienestarBase64.js';

export const compileRecetaFormHtmlString = (receta, forPrint = false) => {
    if (!receta) return '<!DOCTYPE html><html lang="es"><body><p style="padding:40px; text-align:center; color:#64748b; font-family:sans-serif;">Seleccione un paciente / expediente para visualizar su receta médica.</p></body></html>';

    const patientName = receta.paciente || 'Paciente';
    const cedula = receta.cedula || 'N/D';
    const fechaStr = receta.fecha ? receta.fecha.split('-').reverse().join(' / ') : 'dd / mm / aaaa';
    const numReceta = receta.numero_receta || `REC-${receta.id || '001'}`;

    const lineasHtmlPart1 = (receta.lineas || []).map((l, idx) => `
        <tr>
            <td><strong>${idx + 1}. ${escapeHtml(l.detalle_medicamento)}</strong></td>
            <td style="text-align:center;">${escapeHtml(l.dosis || '-')}</td>
            <td style="text-align:center;">Cada ${escapeHtml(l.frecuencia || '8')} horas</td>
            <td style="text-align:center;">${escapeHtml(l.duracion || '3')} días</td>
            <td style="text-align:center;">${escapeHtml(l.via || 'Oral')}</td>
            <td style="text-align:center;">${escapeHtml(l.cantidad_texto || '1 caja')}</td>
        </tr>
    `).join('');

    const emptyRowsCountPart1 = Math.max(0, 4 - (receta.lineas || []).length);
    let emptyRowsPart1 = '';
    for (let i = 0; i < emptyRowsCountPart1; i++) {
        emptyRowsPart1 += `
            <tr style="height:22px;">
                <td></td><td></td><td></td><td></td><td></td><td></td>
            </tr>
        `;
    }

    const lineasHtmlPart2 = (receta.lineas || []).map((l, idx) => `
        <tr>
            <td><strong>${escapeHtml(l.detalle_medicamento)}</strong></td>
            <td style="text-align:center;">${escapeHtml(l.dosis || '-')}</td>
            <td style="text-align:center;">Cada ${escapeHtml(l.frecuencia || '8')} horas</td>
            <td style="text-align:center;">${escapeHtml(l.duracion || '3')} días</td>
            <td style="text-align:center;">${escapeHtml(l.via || 'Oral')}</td>
            <td style="text-align:center;">${l.manana ? '✓' : ''}</td>
            <td style="text-align:center;">${l.mediodia ? '✓' : ''}</td>
            <td style="text-align:center;">${l.tarde ? '✓' : ''}</td>
            <td style="text-align:center;">${l.noche ? '✓' : ''}</td>
        </tr>
    `).join('');

    const emptyRowsCountPart2 = Math.max(0, 3 - (receta.lineas || []).length);
    let emptyRowsPart2 = '';
    for (let i = 0; i < emptyRowsCountPart2; i++) {
        emptyRowsPart2 += `
            <tr style="height:20px;">
                <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
            </tr>
        `;
    }

    return `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <title>Recetario Médico Ocupacional - ${escapeHtml(numReceta)}</title>
            <meta charset="utf-8" />
            <style>
                @page { size: A4 portrait; margin: 8mm; }
                body {
                    font-family: Arial, Helvetica, sans-serif;
                    font-size: 9px;
                    color: #1e293b;
                    margin: 0;
                    padding: 10px;
                    background: #f8fafc;
                    display: flex;
                    justify-content: center;
                }
                .receta-sheet {
                    background: #ffffff;
                    width: 190mm;
                    min-height: 270mm;
                    padding: 10mm;
                    box-sizing: border-box;
                    border: 1px solid #cbd5e1;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.05);
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                }
                .header-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 2px solid #0f172a;
                    padding-bottom: 6px;
                    margin-bottom: 8px;
                }
                .header-title {
                    text-align: center;
                }
                .header-title h2 {
                    margin: 0;
                    font-size: 16px;
                    color: #0f172a;
                    font-weight: 800;
                }
                .header-title h3 {
                    margin: 2px 0 0 0;
                    font-size: 12px;
                    color: #0284c7;
                }
                .section-title {
                    background: #f1f5f9;
                    padding: 4px 8px;
                    font-weight: bold;
                    font-size: 9.5px;
                    border: 1px solid #94a3b8;
                    margin-top: 6px;
                    text-transform: uppercase;
                }
                table.grid-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 4px;
                }
                table.grid-table th, table.grid-table td {
                    border: 1px solid #64748b;
                    padding: 4px 6px;
                    font-size: 8.5px;
                }
                table.grid-table th {
                    background: #f8fafc;
                    font-weight: bold;
                    text-align: center;
                }
                .vigencia-banner {
                    border: 1px solid #0f172a;
                    text-align: center;
                    font-weight: bold;
                    padding: 4px;
                    margin: 6px 0;
                    font-size: 9px;
                    background: #f8fafc;
                }
                .dotted-separator {
                    border-bottom: 2px dashed #94a3b8;
                    margin: 12px 0;
                    position: relative;
                    text-align: center;
                }
                .dotted-separator span {
                    background: #fff;
                    padding: 0 8px;
                    font-size: 8px;
                    color: #64748b;
                    position: relative;
                    top: -7px;
                }
                @media print {
                    body { background: white; padding: 0; }
                    .receta-sheet { border: none; box-shadow: none; width: 100%; padding: 0; }
                }
            </style>
        </head>
        <body>
            <div class="receta-sheet">
                <div>
                    <!-- HEADER PARTE 1 -->
                    <div class="header-top" style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #0f172a; padding-bottom: 6px; margin-bottom: 8px;">
                        <div style="width: 130px; text-align: left;">
                            <img src="${logoBienestar}" alt="Bienestar Universitario" style="max-height: 42px; width: auto; object-fit: contain;" />
                        </div>
                        <div class="header-title" style="text-align: center; flex: 1;">
                            <div style="font-size: 11px; font-weight: 900; color: #002040;">UNIVERSIDAD ESTATAL DE BOLÍVAR</div>
                            <h2 style="margin: 0; font-size: 13px; color: #0f172a; font-weight: 900;">DIRECCIÓN DE BIENESTAR UNIVERSITARIO</h2>
                            <h3 style="margin: 1px 0 0 0; font-size: 10.5px; color: #0284c7; font-weight: 800;">Puesto de Salud · Medicina Ocupacional</h3>
                        </div>
                        <div style="text-align: right; width: 130px;">
                            <strong>RECETA N°:</strong> <span style="color:#dc2626; font-size:11px;">${escapeHtml(numReceta)}</span><br/>
                            <span style="font-size:8.5px;">FECHA: ${escapeHtml(fechaStr)}</span>
                        </div>
                    </div>

                    <!-- DATOS GENERALES DEL PACIENTE -->
                    <div class="section-title">DATOS GENERALES DEL PACIENTE</div>
                    <table class="grid-table">
                        <tr>
                            <td colspan="3"><strong>Apellidos y Nombres:</strong> ${escapeHtml(patientName)}</td>
                            <td colspan="2"><strong>Documento identidad/ HCL:</strong> ${escapeHtml(cedula)}</td>
                            <td><strong>Sexo:</strong> F [${receta.sexo === 'F' ? 'X' : ' '}] M [${receta.sexo === 'M' ? 'X' : ' '}]</td>
                        </tr>
                        <tr>
                            <td colspan="6"><strong>Estado de Enfermedad:</strong> Agudo [${receta.estado_enfermedad === 'Agudo' ? 'X' : ' '}] &nbsp;&nbsp;&nbsp;&nbsp; Crónico [${receta.estado_enfermedad === 'Crónico' ? 'X' : ' '}]</td>
                        </tr>
                        <tr>
                            <td><strong>Fecha nac:</strong> ${escapeHtml(receta.fecha_nacimiento || 'N/D')}</td>
                            <td><strong>Edad:</strong> ${escapeHtml(receta.edad_anios || '0')} años ${escapeHtml(receta.edad_meses || '0')} m</td>
                            <td colspan="4"><strong>CIE:</strong> ${escapeHtml(receta.cie || 'Z00.0')}</td>
                        </tr>
                        <tr>
                            <td colspan="3"><strong>Peso (kg):</strong> ${escapeHtml(receta.peso || '-')}</td>
                            <td colspan="3"><strong>Talla (cm):</strong> ${escapeHtml(receta.talla || '-')}</td>
                        </tr>
                        <tr>
                            <td colspan="6"><strong>Alergias:</strong> SI [${receta.alergias_si ? 'X' : ' '}] NO [${!receta.alergias_si ? 'X' : ' '}] &nbsp;&nbsp;&nbsp;&nbsp; <strong>ESPECIFICAR:</strong> ${escapeHtml(receta.alergias_detalle || 'Ninguna')}</td>
                        </tr>
                    </table>

                    <!-- DATOS DEL MEDICAMENTO -->
                    <div class="section-title">DATOS DEL MEDICAMENTO</div>
                    <table class="grid-table">
                        <thead>
                            <tr>
                                <th style="width:40%;">Medicamento (DCI, forma farmacéutica y concentración)</th>
                                <th style="width:12%;">Dosis</th>
                                <th style="width:12%;">Frecuencia</th>
                                <th style="width:10%;">Duración</th>
                                <th style="width:12%;">Vía</th>
                                <th style="width:14%;">Cantidad</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${lineasHtmlPart1}
                            ${escapeHtml(emptyRowsPart1)}
                        </tbody>
                    </table>

                    <!-- DATOS DEL PRESCRIPTOR PARTE 1 -->
                    <table class="grid-table" style="margin-top:8px;">
                        <tr>
                            <td style="width:50%; vertical-align:top;">
                                <strong>DATOS DEL PRESCRIPTOR:</strong><br/>
                                <strong>Apellido y Nombre:</strong> ${escapeHtml(receta.prescriptor_nombre || 'Dr. Fernando Vaca')}<br/>
                                <strong>Nro. Reg. Prof ACESS:</strong> ${escapeHtml(receta.prescriptor_acess || 'ACESS-MED-84920')}<br/><br/>
                                <strong>Firma:</strong> ___________________________________
                            </td>
                            <td style="width:50%; vertical-align:top;">
                                <strong>VÁLIDO __________ VERIFICADO __________</strong><br/>
                                <strong>Apellido y Nombre:</strong> ${escapeHtml(receta.valido_verificado || 'Farmacia Bienestar')}<br/><br/><br/>
                                <strong>Firma:</strong> ___________________________________
                            </td>
                        </tr>
                    </table>

                    <div class="vigencia-banner">VIGENCIA MÁXIMA : (03) días</div>

                    <!-- SEPARADOR -->
                    <div class="dotted-separator">
                        <span>INDICACIONES PARA EL USUARIO / PACIENTE</span>
                    </div>

                    <!-- PARTE 2: INDICACIONES -->
                    <table class="grid-table">
                        <tr>
                            <td style="width:60%;"><strong>Apellidos y Nombres del usuario/paciente:</strong> ${escapeHtml(patientName)}</td>
                            <td style="width:20%;"><strong>Nro. Receta:</strong> ${escapeHtml(numReceta)}</td>
                            <td style="width:20%;"><strong>Fecha prescripción:</strong> ${escapeHtml(fechaStr)}</td>
                        </tr>
                    </table>

                    <div class="section-title">INDICACIONES Y HORARIOS</div>
                    <table class="grid-table">
                        <thead>
                            <tr>
                                <th style="width:35%;">Medicamento (DCI, concentración)</th>
                                <th style="width:10%;">Dosis</th>
                                <th style="width:12%;">Frecuencia</th>
                                <th style="width:10%;">Duración</th>
                                <th style="width:11%;">Vía</th>
                                <th style="width:5.5%;">Mañana</th>
                                <th style="width:5.5%;">Mediodía</th>
                                <th style="width:5.5%;">Tarde</th>
                                <th style="width:5.5%;">Noche</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${lineasHtmlPart2}
                            ${escapeHtml(emptyRowsPart2)}
                        </tbody>
                    </table>

                    <!-- DATOS PRESCRIPTOR & RECOMENDACIONES PARTE 2 -->
                    <table class="grid-table" style="margin-top:8px;">
                        <tr>
                            <td style="width:40%; vertical-align:top;">
                                <strong>DATOS DEL PRESCRIPTOR:</strong><br/>
                                <strong>Apellido y Nombre:</strong> ${escapeHtml(receta.prescriptor_nombre || 'Dr. Fernando Vaca')}<br/>
                                <strong>Nro. Reg. Profesional ACESS:</strong> ${escapeHtml(receta.prescriptor_acess || 'ACESS-MED-84920')}<br/><br/>
                                <strong>Firma:</strong> ____________________________
                            </td>
                            <td style="width:60%; vertical-align:top;">
                                <strong>SIGNOS DE ALARMA:</strong> ${escapeHtml(receta.signos_alarma || 'Fiebre persistente, intolerancia oral o reacción alérgica.')}<br/><br/>
                                <strong>RECOMENDACIONES NO FARMACOLÓGICAS:</strong> ${escapeHtml(receta.recomendaciones_no_farmacologicas || 'Reposo relativo e hidratación continua.')}
                            </td>
                        </tr>
                    </table>
                </div>
            </div>

            ${forPrint ? `
            <script>
                window.onload = function() { window.print(); };
            </script>
            ` : ''}
        </body>
        </html>
    `;
};
