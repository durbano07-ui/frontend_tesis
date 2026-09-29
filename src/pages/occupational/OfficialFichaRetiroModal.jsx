import React, { useState } from 'react';
import { FileText, Printer, Download, X, FileSpreadsheet } from 'lucide-react';
import { logoBienestar } from '../../assets/logoBienestarBase64.js';

/**
 * Función que extrae y normaliza de forma exhaustiva todos los campos clínicos,
 * ocupacionales y administrativos de la FICHA MÉDICA OCUPACIONAL DE RETIRO / CESE LABORAL (MSP / MDT 077),
 * soportando modelos del Backend, estado de consulta del Frontend y registros históricos.
 */
export const extractFichaRetiroFields = (record = {}) => {
    const r = record || {};
    const p = r.patientSelected || r.paciente_data || {};

    // 1. Identificación y Nombres
    const pac = r.paciente || r.nombre_completo || 
        ([r.primerNombre || r.primer_apellido || p.primer_nombre || p.nombres,
          r.segundoNombre || r.segundo_nombre || p.segundo_nombre,
          r.primerApellido || r.primer_apellido || p.primer_apellido || p.apellidos,
          r.segundoApellido || r.segundo_apellido || p.segundo_apellido].filter(Boolean).join(' ')) ||
        (p.nombres ? `${p.nombres} ${p.apellidos || ''}`.trim() : '') ||
        'LÓPEZ CARLOS ALBERTO';

    // Desglose de apellidos y nombres
    let p1Ape = r.primerApellido || r.primer_apellido || p.primer_apellido;
    let p2Ape = r.segundoApellido || r.segundo_apellido || p.segundo_apellido;
    let p1Nom = r.primerNombre || r.primer_nombre || p.primer_nombre;
    let p2Nom = r.segundoNombre || r.segundo_nombre || p.segundo_nombre;

    if (!p1Ape && (r.apellidos || p.apellidos)) {
        const apes = (r.apellidos || p.apellidos).trim().split(/\s+/);
        p1Ape = apes[0] || '';
        p2Ape = apes.slice(1).join(' ') || '';
    }
    if (!p1Nom && (r.nombres || p.nombres)) {
        const noms = (r.nombres || p.nombres).trim().split(/\s+/);
        p1Nom = noms[0] || '';
        p2Nom = noms.slice(1).join(' ') || '';
    }
    if (!p1Ape && pac) {
        const parts = pac.trim().split(/\s+/);
        if (parts.length >= 4) {
            p1Ape = parts[0];
            p2Ape = parts[1];
            p1Nom = parts[2];
            p2Nom = parts.slice(3).join(' ');
        } else if (parts.length === 3) {
            p1Ape = parts[0];
            p2Ape = parts[1];
            p1Nom = parts[2];
            p2Nom = '';
        } else if (parts.length === 2) {
            p1Ape = parts[0];
            p2Ape = '';
            p1Nom = parts[1];
            p2Nom = '';
        } else {
            p1Ape = parts[0] || 'LÓPEZ';
            p2Ape = 'MENDOZA';
            p1Nom = 'CARLOS';
            p2Nom = 'ALBERTO';
        }
    }

    const ced = r.cedula || r.ci || r.identificacion || p.cedula || p.ci || '1798765432';

    // Cálculo de edad si no viene directo
    let edad = r.edad || p.edad;
    const fecNac = r.fecha_nacimiento || p.fecha_nacimiento || r.fechaNacimiento;
    if (!edad && fecNac) {
        const birth = new Date(fecNac);
        const now = new Date();
        edad = now.getFullYear() - birth.getFullYear();
        if (now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())) {
            edad--;
        }
    }
    if (!edad) edad = 45;

    // Sexo / Género
    let sexo = (r.sexo || r.genero || p.sexo || p.genero || 'M').toUpperCase();
    if (sexo.startsWith('M') || sexo === 'HOMBRE' || sexo === 'MASCULINO') sexo = 'M';
    else if (sexo.startsWith('F') || sexo === 'MUJER' || sexo === 'FEMENINO') sexo = 'F';

    const puesto = r.puesto || r.cargo || r.puestoTrabajo || r.puesto_trabajo || p.puestoTrabajo || p.cargo || 'TÉCNICO DE MANTENIMIENTO GENERAL';
    const cargo = r.cargo || puesto;
    const ciuo = r.ciuo || p.ciuo || 'C07';
    const actividades = r.actividades || r.actividades_puesto || p.actividades || 'MANTENIMIENTO PREVENTIVO Y CORRECTIVO DE INFRAESTRUCTURA';
    const fecIngreso = r.fechaIngreso || r.fecha_ingreso || '2021-06-01';
    const fecRetiro = r.fechaRetiro || r.fecha_retiro || r.fechaCese || r.fecha || new Date().toISOString().split('T')[0];
    const tiempoServicio = r.tiempoServicio || r.tiempo_servicio || '5 AÑOS 3 MESES';
    const causaRetiro = r.causaRetiro || r.causa_retiro || r.motivoSalida || 'CULMINACIÓN DE CONTRATO LABORAL';

    const tel = r.telefono || r.celular || p.celular || p.telefono || '0987123456';
    const rel = r.religion || p.religion || 'Católica';
    const grpSangre = r.grupoSanguineo || r.grupo_sanguineo || r.tipo_sangre || r.tipoSangre || r.vitalSigns?.tipoSangre || p.tipo_sangre || 'O+';
    const lat = (r.lateralidad || p.lateralidad || 'DIESTRO').toUpperCase();
    const orientacion = r.orientacionSexual || r.orientacion_sexual || p.orientacion_sexual || 'Heterosexual';
    const idGen = r.identidadGenero || r.identidad_genero || p.identidad_genero || (sexo === 'F' ? 'Femenino' : 'Masculino');
    
    // Discapacidad
    let disc = r.discapacidad;
    if (!disc || typeof disc !== 'object') {
        const tieneDisc = Boolean(r.tiene_discapacidad || p.tiene_discapacidad || r.discapacidad === true);
        disc = {
            tiene: tieneDisc,
            tipo: r.tipo_discapacidad || p.tipo_discapacidad || '',
            porcentaje: r.porcentaje_discapacidad || p.porcentaje_discapacidad || ''
        };
    }

    // Datos institucionales
    const ruc = r.ruc || r.empresa_ruc || '0260000920001';
    const estSalud = r.establecimiento || r.establecimiento_salud || 'DEPARTAMENTO MEDICO U.E.B';
    const numHC = r.numHistoriaClinica || r.historia_clinica || ced;
    const numArch = r.numArchivo || r.numero_archivo || 'RET-2026-003';

    // Motivo de consulta
    const motivo = r.motivoConsulta || r.detalle_motivo || r.motivo || 
        `EVALUACIÓN MÉDICA OCUPACIONAL DE RETIRO / CESE LABORAL POR ${causaRetiro}.`;

    // Antecedentes Clínicos y Quirúrgicos
    const antClin = r.antecedentesClinicos || r.antecedentesPersonales || r.detalle_antecedente ||
        'HIPERTENSIÓN ARTERIAL CONTROLADA. NO ALERGIAS MEDICAMENTOSAS CONOCIDAS. VACUNACIÓN COMPLETA.';
    const antQuir = r.antecedentesQuirurgicos || 'HERNIORRAFIA INGUINAL DERECHA HACE 6 AÑOS SIN SECUELAS.';

    // Gineco-obstétricos
    let gin = r.ginecoObstetricos;
    if (!gin) {
        if (sexo === 'M') {
            gin = {
                menarquia: 'NO APLICA',
                ciclos: 'NO APLICA',
                fum: 'NO APLICA',
                gestas: 0,
                partos: 0,
                cesareas: 0,
                abortos: 0,
                hijosVivos: 0,
                hijosMuertos: 0,
                vidaSexualActiva: false,
                planificacionFamiliar: false,
                tipoPlanificacion: 'NO APLICA',
                papanicolaou: { realizada: false, tiempo: 'NO APLICA', resultado: 'NO APLICA' },
                colposcopia: { realizada: false, resultado: 'NO APLICA' },
                mamografia: { realizada: false, resultado: 'NO APLICA' },
                ecoMamario: { realizada: false, resultado: 'NO APLICA' }
            };
        } else {
            gin = {
                menarquia: '12 AÑOS',
                ciclos: 'REGULARES',
                fum: '2026-08-20',
                gestas: 2,
                partos: 2,
                cesareas: 0,
                abortos: 0,
                hijosVivos: 2,
                hijosMuertos: 0,
                vidaSexualActiva: true,
                planificacionFamiliar: true,
                tipoPlanificacion: 'QUIRÚRGICA',
                papanicolaou: { realizada: true, tiempo: '5 MESES', resultado: 'NORMAL' },
                colposcopia: { realizada: false, resultado: 'NO APLICA' },
                mamografia: { realizada: true, tiempo: '1 AÑO', resultado: 'NORMAL' },
                ecoMamario: { realizada: false, resultado: 'NO APLICA' }
            };
        }
    }

    // Hábitos
    let hab = r.habitosToxicos;
    if (!hab) {
        hab = {
            tabaco: Boolean(r.tabaco),
            alcohol: Boolean(r.alcohol),
            drogas: Boolean(r.drogas),
            actividadFisica: r.actividadFisica || { tiene: true, cual: 'CAMINATA DIARIA', tiempo: '45 MINUTOS' },
            medicacionHabitual: r.medicacionHabitual || { tiene: true, cual: 'LOSARTÁN 50 MG CADA 24H', tiempo: 'CONTINUO' }
        };
    }

    // Historial Ocupacional en la Institución
    let empAnt = r.empleosAnteriores || r.historialInstitucional;
    if (!empAnt || !Array.isArray(empAnt) || empAnt.length === 0) {
        empAnt = [{
            empresa: 'UNIVERSIDAD ESTATAL DE BOLIVAR',
            puesto: cargo,
            actividades: actividades,
            tiempo: tiempoServicio,
            riesgos: { fisico: true, mecanico: true, quimico: false, biologico: false, ergonomico: true, psicosocial: false },
            observaciones: 'CUMPLIÓ SUS LABORES CON EQUIPOS DE PROTECCIÓN INDIVIDUAL ASIGNADOS.'
        }];
    }

    // Accidentes de trabajo y enfermedades profesionales durante su tiempo en la institución
    const accTrab = r.accidentesTrabajo || {
        calificado: false,
        fecha: '',
        especificaciones: 'NO REGISTRA ACCIDENTES LABORALES DURANTE SU PERIODO DE SERVICIO EN LA UEB',
        observaciones: 'NINGUNA SECUELA REGISTRADA'
    };
    const enfProf = r.enfermedadesProfesionales || {
        calificado: false,
        fecha: '',
        especificaciones: 'NO PRESENTA ENFERMEDADES PROFESIONALES CALIFICADAS POR EL IESS',
        observaciones: 'NINGUNA'
    };

    // Antecedentes Familiares
    let antFam = r.antecedentesFamiliares;
    if (!antFam || typeof antFam !== 'object') {
        antFam = {
            cardiovascular: true,
            descripcion: typeof r.antecedentesFamiliares === 'string' ? r.antecedentesFamiliares : 'MADRE HIPERTENSA. PADRE FALLECIDO POR CAUSA NATURAL.'
        };
    }

    // Factores de Riesgo del Puesto que Cesa
    let factRiesgo = r.factoresRiesgo;
    if (!factRiesgo || Array.isArray(factRiesgo)) {
        const arr = Array.isArray(factRiesgo) ? factRiesgo : [];
        factRiesgo = {
            puesto: cargo,
            actividades: actividades,
            fisico: arr.some(x => x.toLowerCase().includes('físic') || x.toLowerCase().includes('fisic')) ? ['Ruido de herramientas', 'Vibraciones'] : ['Ruido de herramientas eléctricas', 'Temperaturas ambientales variables'],
            mecanico: arr.some(x => x.toLowerCase().includes('mecán') || x.toLowerCase().includes('mecan')) ? ['Caídas al mismo y distinto nivel'] : ['Caídas al mismo nivel', 'Uso de escaleras', 'Manejo de herramientas manuales'],
            quimico: arr.some(x => x.toLowerCase().includes('quím') || x.toLowerCase().includes('quim')) ? ['Polvo', 'Pinturas'] : ['Polvo por mampostería'],
            biologico: arr.some(x => x.toLowerCase().includes('biol')) ? ['Virus'] : ['Virus respiratorios estacionales'],
            ergonomico: arr.some(x => x.toLowerCase().includes('ergon')) ? ['Manipulación de cargas', 'Posturas forzadas'] : ['Manipulación manual de cargas', 'Posturas forzadas en reparaciones'],
            psicosocial: arr.some(x => x.toLowerCase().includes('psico')) ? ['Exigencia de tiempo'] : ['Atención a emergencias de mantenimiento'],
            medidasPreventivas: '1.- Uso reglamentario de casco, gafas, guantes y botas de seguridad con punta de acero. 2.- Capacitación en levantamiento seguro de cargas. 3.- Mantenimiento y verificación de escaleras y andamios. 4.- Protocolos de bioseguridad institucional.'
        };
    }

    const actExtra = r.actividadesExtraLaborales || 'NO';
    const enfAct = r.enfermedadActual || r.detalle_enfermedad_actual || 
        'PACIENTE ACUDE PARA VALORACIÓN MÉDICA OCUPACIONAL DE RETIRO / CESE LABORAL. AL MOMENTO SE ENCUENTRA ASINTOMÁTICO, SIN REFERIR QUEJAS NI LIMITACIONES FUNCIONALES.';
    const orgSist = r.organosSistemas || (r.detalle_revision_organos ? { normal: true, descripcion: r.detalle_revision_organos } : { normal: true, descripcion: 'Aparatos y sistemas evaluados sin sintomatología patológica activa al cese.' });

    // Constantes Vitales al Cese
    const vs = r.vitalSigns || {};
    const paVal = r.constantes?.pa || (vs.paSystolic && vs.paDiastolic ? `${vs.paSystolic}/${vs.paDiastolic}` : (r.presion_arterial_sistolica ? `${r.presion_arterial_sistolica}/${r.presion_arterial_diastolica || 80}` : '125/80'));
    const tempVal = r.constantes?.temp || vs.temp || r.temperatura || '36.5';
    const fcVal = r.constantes?.fc || vs.fc || r.frecuencia_cardiaca || '74';
    const satO2Val = r.constantes?.satO2 || vs.spo2 || r.saturacion_oxigeno || '97';
    const frVal = r.constantes?.fr || vs.fr || r.frecuencia_respiratoria || '18';
    const pesoVal = r.constantes?.peso || vs.peso || r.peso || '73';
    let tallaVal = r.constantes?.talla || vs.talla || r.talla || '1.68';
    if (parseFloat(tallaVal) > 3) tallaVal = (parseFloat(tallaVal) / 100).toFixed(2);
    
    let imcVal = r.constantes?.imc || vs.imc || r.imc;
    if (!imcVal && parseFloat(pesoVal) && parseFloat(tallaVal)) {
        const tM = parseFloat(tallaVal);
        imcVal = (parseFloat(pesoVal) / (tM * tM)).toFixed(2);
    }
    if (!imcVal) imcVal = '25.86';

    const perimVal = r.constantes?.perimetroAbd || r.perimetro_abdominal || '85';

    const constantes = {
        pa: paVal,
        temp: tempVal,
        fc: fcVal,
        satO2: satO2Val,
        fr: frVal,
        peso: pesoVal,
        talla: tallaVal,
        imc: imcVal,
        perimetroAbd: perimVal
    };

    // Examen Físico de Egreso
    let exFisico = 'NO SE EVIDENCIA SIGNOS PATOLÓGICOS NI SECUELAS DERIVADAS DEL TRABAJO.';
    if (typeof r.examenFisico === 'string') exFisico = r.examenFisico;
    else if (r.examenFisico?.descripcion) exFisico = r.examenFisico.descripcion;
    else if (r.detalle_examen_fisico) exFisico = r.detalle_examen_fisico;

    // Laboratorios y Exámenes de Salida
    let exLab = r.examenesLab || r.laboratorios;
    if (!exLab || !Array.isArray(exLab) || exLab.length === 0) {
        exLab = [
            { examen: 'BIOMETRIA HEMATICA Y GLUCOSA', fecha: fecRetiro, resultado: 'DENTRO DE PARÁMETROS NORMALES' },
            { examen: 'AUDIOMETRÍA DE EGRESO LABORAL', fecha: fecRetiro, resultado: 'NORMOTÍMPICA / NORMOUDIENTE BILATERAL' },
            { examen: 'RX TÓRAX POSTEROANTERIOR', fecha: fecRetiro, resultado: 'CAMPOS PULMONARES LIBRES SIN SECUELAS' },
            { examen: 'OPTOMETRÍA OCUPACIONAL DE SALIDA', fecha: fecRetiro, resultado: 'AGUDEZA VISUAL CONSERVADA 20/20 AMBOS OJOS' }
        ];
    }

    // Diagnósticos CIE-10
    let diags = r.diagnosticos;
    if (!diags || !Array.isArray(diags) || diags.length === 0) {
        if (r.diagnosticos_medicina && Array.isArray(r.diagnosticos_medicina)) {
            diags = r.diagnosticos_medicina.map((dm, idx) => ({
                num: idx + 1,
                desc: dm.detalle_diagnostico || 'EVALUACIÓN MÉDICA DE RETIRO',
                cie: dm.cie10 || 'Z00.0',
                pre: Boolean(dm.presuntivo),
                def: Boolean(dm.definitivo)
            }));
        } else if (r.diagnosticoCie) {
            const cieStr = r.diagnosticoCie;
            const cieCode = cieStr.includes('-') ? cieStr.split('-')[0].trim() : (cieStr.match(/^[A-Z][0-9]+/i) ? cieStr.match(/^[A-Z][0-9]+/i)[0] : 'Z00.0');
            const cieDesc = cieStr.includes('-') ? cieStr.split('-')[1].trim().toUpperCase() : cieStr.toUpperCase();
            diags = [{ num: 1, desc: cieDesc, cie: cieCode, pre: false, def: true }];
        } else {
            diags = [
                { num: 1, desc: 'EXAMEN MÉDICO DE RETIRO / CESE OCUPACIONAL', cie: 'Z00.0', pre: false, def: true },
                { num: 2, desc: 'HIPERTENSIÓN ESENCIAL PRIMARIA (COMÚN PREVIA)', cie: 'I10', pre: false, def: true }
            ];
        }
    }

    // Dictamen de Condición de Salud al Retiro
    let condSalida = r.condicionSalida || r.aptitudDetalle;
    if (!condSalida) {
        const aptStr = (r.aptitudLaboral || r.aptitud || 'Apto').toLowerCase();
        const tieneSecuela = aptStr.includes('secuela') || aptStr.includes('no') || (r.enfermedadesProfesionales?.calificado);
        const tieneComun = aptStr.includes('comun') || aptStr.includes('observ') || aptStr.includes('restric');

        condSalida = {
            satisfactorio: !tieneSecuela && !tieneComun,
            conPatologiaComun: tieneComun && !tieneSecuela,
            conSecuelaLaboral: tieneSecuela,
            observacion: r.observacionesRetiro || 'El trabajador no presenta enfermedades profesionales ni secuelas originadas por el trabajo en la institución.',
            recomendacionLegal: 'El trabajador finaliza sus labores en la institución en condiciones físicas y de salud adecuadas para su reinserción o cese.'
        };
    }

    // Recomendaciones Post-Ocupacionales
    let recs = r.recomendaciones;
    if (!recs || !Array.isArray(recs) || recs.length === 0) {
        recs = [
            'CONTINUAR CON CONTROLES MÉDICOS PREVENTIVOS DE FORMA PERIÓDICA EN SU SISTEMA DE SALUD (IESS / PRIVADO)',
            'MANTENER ESTILO DE VIDA SALUDABLE, ALIMENTACIÓN BALANCEADA Y ACTIVIDAD FÍSICA REGULAR',
            'CONTINUAR TRATAMIENTO DE PATOLOGÍAS COMUNES CON SU MÉDICO TRATANTE',
            'EN CASO DE REINSERCIÓN LABORAL, PRESENTAR COPIA DE ESTE CERTIFICADO DE EGRESO AL NUEVO EMPLEADOR',
            'SE ENTREGA CONSTANCIA OFICIAL DE EVALUACIÓN MÉDICA OCUPACIONAL DE RETIRO AL TRABAJADOR'
        ];
    }

    // Profesional Evaluador
    const prof = r.profesional || {
        fecha: fecRetiro,
        hora: r.hora || '11:45',
        nombre: r.doctor_nombre || 'DR. JORGE MORALES',
        codigo: r.doctor_codigo || '1804486288'
    };

    return {
        pac, ced, p1Ape, p2Ape, p1Nom, p2Nom, edad, sexo, puesto, cargo, ciuo, actividades,
        fecIngreso, fecRetiro, tiempoServicio, causaRetiro, tel, rel, grpSangre, lat,
        orientacion, idGen, disc, ruc, estSalud, numHC, numArch, motivo, antClin, antQuir,
        gin, hab, empAnt, accTrab, enfProf, antFam, factRiesgo, actExtra, enfAct, orgSist,
        constantes, exFisico, exLab, diags, condSalida, recs, prof
    };
};

/**
 * Genera el HTML completo del Formulario Oficial MSP/MDT de Retiro / Cese Laboral
 */
export const compileOfficialRetiroFormHtml = (record = {}, uebBannerLogo = '', forPrint = false) => {
    const {
        pac, ced, p1Ape, p2Ape, p1Nom, p2Nom, edad, sexo, puesto, cargo, ciuo, actividades,
        fecIngreso, fecRetiro, tiempoServicio, causaRetiro, tel, rel, grpSangre, lat,
        orientacion, idGen, disc, ruc, estSalud, numHC, numArch, motivo, antClin, antQuir,
        gin, hab, empAnt, accTrab, enfProf, antFam, factRiesgo, actExtra, enfAct, orgSist,
        constantes, exFisico, exLab, diags, condSalida, recs, prof
    } = extractFichaRetiroFields(record);

    const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8" />
        <title>FORMULARIO 077 - EVALUACIÓN MÉDICA OCUPACIONAL DE RETIRO - ${pac}</title>
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
                UNIVERSIDAD ESTATAL DE BOLÍVAR · FORMULARIO OFICIAL MSP/MDT (RETIRO / CESE LABORAL)
            </div>
            <div style="display: flex; gap: 8px;">
                <button onclick="window.print()" style="background: #0284c7; color: #ffffff; border: none; padding: 7px 16px; border-radius: 6px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px; font-size: 12px;">
                    Imprimir Formato Completo (3 Hojas A4)
                </button>
                <button onclick="window.close()" style="background: #475569; color: #ffffff; border: none; padding: 7px 14px; border-radius: 6px; font-weight: 700; cursor: pointer; font-size: 12px;">
                    Cerrar
                </button>
            </div>
        </div>

        <!-- ========================================== -->
        <!-- HOJA 1: 077-RETIRO 1-3                     -->
        <!-- ========================================== -->
        <div class="sheet-break">
            <!-- ENCABEZADO INSTITUCIONAL -->
            <table style="margin-bottom: 4px; border: 1.5px solid #000;">
                <tr>
                    <td style="width: 32%; padding: 4px 8px; border: 1.5px solid #000;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <img src="${logoBienestar}" style="height: 38px; object-fit: contain;" alt="Bienestar Universitario" />
                            ${uebBannerLogo ? `<img src="${uebBannerLogo}" style="height: 38px; object-fit: contain;" alt="UEB" />` : ''}
                            <div>
                                <div style="font-weight: 900; font-size: 11px; color: #002060;">UNIVERSIDAD ESTATAL DE BOLÍVAR</div>
                                <div style="font-size: 7.5px; font-weight: bold; color: #002060;">DIRECCIÓN DE BIENESTAR UNIVERSITARIO · SALUD OCUPACIONAL</div>
                            </div>
                        </div>
                    </td>
                    <td style="background: #d9d9f3; text-align: center; font-weight: 900; font-size: 13px; padding: 6px; border: 1.5px solid #000;">
                        EVALUACIÓN MÉDICA OCUPACIONAL DE RETIRO / CESE LABORAL
                        <div style="font-size: 8px; font-weight: normal; margin-top: 2px;">FORMULARIO MSP / MDT 077 - RETIRO · HOJA 1 DE 3</div>
                    </td>
                </tr>
            </table>

            <!-- SECCIÓN A: DATOS DE LA EMPRESA -->
            <table>
                <tr>
                    <td colspan="6" class="bg-purple">A. DATOS DE LA EMPRESA Y DEL TRABAJADOR QUE CESA FUNCIONES</td>
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
                    <td>${ruc}</td>
                    <td>-</td>
                    <td>${estSalud}</td>
                    <td>${numHC}</td>
                    <td>${numArch}</td>
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
                    <td class="uppercase">${p1Ape}</td>
                    <td class="uppercase">${p2Ape}</td>
                    <td class="uppercase">${p1Nom}</td>
                    <td class="uppercase">${p2Nom}</td>
                    <td>${sexo}</td>
                    <td>${edad}</td>
                    <td>${rel}</td>
                    <td>${grpSangre}</td>
                    <td>${lat}</td>
                </tr>
            </table>

            <!-- ORIENTACIÓN, GÉNERO, DISCAPACIDAD Y PUESTO DE SALIDA -->
            <table>
                <tr class="bg-green">
                    <td style="width: 14%;">ORIENTACIÓN SEXUAL</td>
                    <td style="width: 14%;">IDENTIDAD DE GÉNERO</td>
                    <td style="width: 12%;">DISCAPACIDAD</td>
                    <td style="width: 12%;">FECHA DE INGRESO</td>
                    <td style="width: 12%;">FECHA DE RETIRO</td>
                    <td style="width: 14%;">TIEMPO DE SERVICIO</td>
                    <td style="width: 22%;">PUESTO QUE DESEMPEÑÓ</td>
                </tr>
                <tr class="text-center font-bold">
                    <td>${orientacion}</td>
                    <td>${idGen}</td>
                    <td>${disc.tiene ? `SÍ (${disc.tipo} ${disc.porcentaje}%)` : 'NO'}</td>
                    <td>${fecIngreso}</td>
                    <td style="color: #dc2626;">${fecRetiro}</td>
                    <td>${tiempoServicio}</td>
                    <td class="uppercase" style="font-size: 7.5px;">${cargo} (CIUO: ${ciuo})</td>
                </tr>
                <tr>
                    <td colspan="7" style="background: #f8fafc; padding: 3px 6px;">
                        <strong>ACTIVIDADES DESARROLLADAS EN LA INSTITUCIÓN:</strong> <span class="uppercase font-bold">${actividades}</span> · <strong>TELÉFONO POST-LABORAL:</strong> ${tel}
                    </td>
                </tr>
            </table>

            <!-- SECCIÓN B: MOTIVO DE LA EVALUACIÓN DE RETIRO -->
            <table>
                <tr>
                    <td class="bg-purple">B. MOTIVO DE LA EVALUACIÓN DE RETIRO / CESE LABORAL</td>
                </tr>
                <tr>
                    <td style="padding: 5px 8px; font-weight: bold; background: #fafafa;">
                        CAUSA DE SALIDA: <span style="color: #002060;">${causaRetiro}</span><br />
                        <span style="font-weight: normal; font-size: 8px;">DETALLE: ${motivo}</span>
                    </td>
                </tr>
            </table>

            <!-- SECCIÓN C: ANTECEDENTES PERSONALES -->
            <table>
                <tr>
                    <td colspan="4" class="bg-purple">C. ANTECEDENTES PERSONALES (CLÍNICOS, QUIRÚRGICOS, GINECOLÓGICOS Y HÁBITOS)</td>
                </tr>
                <tr class="bg-green">
                    <td colspan="4">1. ANTECEDENTES CLÍNICOS Y QUIRÚRGICOS</td>
                </tr>
                <tr>
                    <td colspan="4" style="padding: 4px 8px;">
                        <div><strong>Clínicos:</strong> ${antClin}</div>
                        <div><strong>Quirúrgicos:</strong> ${antQuir}</div>
                    </td>
                </tr>
                <tr class="bg-green">
                    <td colspan="4">2. ANTECEDENTES GINECO OBSTÉTRICOS (EN CASO DE APLICAR)</td>
                </tr>
                <tr>
                    <td colspan="4" style="padding: 0;">
                        <table>
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
                            <tr class="text-center font-bold">
                                <td>${gin.menarquia || '-'}</td>
                                <td>${gin.ciclos || '-'}</td>
                                <td>${gin.fum || '-'}</td>
                                <td>${gin.gestas ?? 0}</td>
                                <td>${gin.partos ?? 0}</td>
                                <td>${gin.cesareas ?? 0}</td>
                                <td>${gin.abortos ?? 0}</td>
                                <td>${gin.hijosVivos ?? 0}</td>
                                <td>${gin.vidaSexualActiva ? 'SÍ' : 'NO'}</td>
                                <td>${gin.planificacionFamiliar ? 'SÍ' : 'NO'}</td>
                            </tr>
                        </table>
                        <div style="padding: 2px 6px; font-size: 7.5px; background: #fafafa;">
                            <strong>Papanicolaou:</strong> ${gin.papanicolaou?.realizada ? `SÍ (${gin.papanicolaou.tiempo} - ${gin.papanicolaou.resultado})` : 'NO'} | 
                            <strong>Mamografía:</strong> ${gin.mamografia?.resultado || 'NO APLICA'}
                        </div>
                    </td>
                </tr>
                <tr class="bg-green">
                    <td colspan="4">3. HÁBITOS TÓXICOS Y ESTILO DE VIDA</td>
                </tr>
                <tr class="text-center font-bold">
                    <td style="width: 25%;">TABACO: ${hab.tabaco ? 'SÍ' : 'NO'}</td>
                    <td style="width: 25%;">ALCOHOL: ${hab.alcohol ? 'SÍ' : 'NO'}</td>
                    <td style="width: 25%;">ACTIVIDAD FÍSICA: ${hab.actividadFisica?.tiene ? `SÍ (${hab.actividadFisica.cual})` : 'NO'}</td>
                    <td style="width: 25%;">MEDICACIÓN HABITUAL: ${hab.medicacionHabitual?.tiene ? `SÍ (${hab.medicacionHabitual.cual})` : 'NO'}</td>
                </tr>
            </table>

            <!-- SECCIÓN D: HISTORIAL LABORAL EN LA INSTITUCIÓN -->
            <table>
                <tr>
                    <td colspan="6" class="bg-purple">D. HISTORIAL LABORAL EN LA INSTITUCIÓN Y ANTECEDENTES DE RIESGOS</td>
                </tr>
                <tr class="bg-green">
                    <td style="width: 26%;">EMPRESA / INSTITUCIÓN</td>
                    <td style="width: 14%;">PUESTO</td>
                    <td style="width: 16%;">ACTIVIDADES</td>
                    <td style="width: 10%;">TIEMPO</td>
                    <td style="width: 20%;">RIESGOS PRINCIPALES</td>
                    <td style="width: 14%;">OBSERVACIONES</td>
                </tr>
                ${empAnt.map((item, idx) => `
                    <tr key="${idx}" class="text-center font-bold">
                        <td class="text-left">${item.empresa}</td>
                        <td>${item.puesto}</td>
                        <td>${item.actividades}</td>
                        <td>${item.tiempo}</td>
                        <td style="font-size: 7px;">${item.riesgos?.fisico ? '[FÍSICO] ' : ''}${item.riesgos?.mecanico ? '[MECÁNICO] ' : ''}${item.riesgos?.ergonomico ? '[ERGONÓMICO]' : ''}</td>
                        <td>${item.observaciones || 'NINGUNA'}</td>
                    </tr>
                `).join('')}
                <tr>
                    <td colspan="6" style="padding: 4px 6px; background: #fafafa; font-size: 8px;">
                        <div><strong>ACCIDENTES DE TRABAJO REGISTRADOS EN LA UEB:</strong> ${accTrab.calificado ? `SÍ (${accTrab.especificaciones})` : 'NO REGISTRA ACCIDENTES LABORALES EN EL PERÍODO DE SERVICIO'}</div>
                        <div style="margin-top: 2px;"><strong>ENFERMEDADES PROFESIONALES CALIFICADAS POR IESS:</strong> ${enfProf.calificado ? `SÍ (${enfProf.especificaciones})` : 'NO REGISTRA ENFERMEDADES PROFESIONALES'}</div>
                    </td>
                </tr>
            </table>
        </div>

        <!-- ========================================== -->
        <!-- HOJA 2: 077-RETIRO 2-3                     -->
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
                        EVALUACIÓN MÉDICA OCUPACIONAL DE RETIRO / CESE LABORAL
                        <div style="font-size: 8px; font-weight: normal; margin-top: 2px;">FORMULARIO MSP / MDT 077 - RETIRO · HOJA 2 DE 3</div>
                    </td>
                </tr>
            </table>

            <!-- SECCIÓN E: ANTECEDENTES FAMILIARES -->
            <table>
                <tr>
                    <td class="bg-purple">E. ANTECEDENTES FAMILIARES</td>
                </tr>
                <tr class="bg-green">
                    <td>[X] 1. CARDIO-VASCULAR | [ ] 2. METABÓLICA | [ ] 3. NEUROLÓGICA | [ ] 4. ONCOLÓGICA | [ ] 5. OTRAS</td>
                </tr>
                <tr>
                    <td style="padding: 4px 8px; font-weight: bold; background: #fafafa;">${antFam.descripcion || 'FAMILIARES DIRECTOS CON ANTECEDENTE CARDIOVASCULAR CONTROLADO.'}</td>
                </tr>
            </table>

            <!-- SECCIÓN F: FACTORES DE RIESGO DEL PUESTO AL QUE CESA -->
            <table>
                <tr>
                    <td colspan="5" class="bg-purple">F. FACTORES DE RIESGOS DEL PUESTO DESEMPEÑADO EN LA INSTITUCIÓN</td>
                </tr>
                <tr class="bg-green">
                    <td style="width: 22%;">PUESTO / ÁREA</td>
                    <td style="width: 14%;">ACTIVIDADES</td>
                    <td style="width: 22%;">FÍSICO</td>
                    <td style="width: 22%;">MECÁNICO</td>
                    <td style="width: 20%;">ERGONÓMICO / PSICOSOCIAL</td>
                </tr>
                <tr style="font-size: 7.5px;">
                    <td class="font-bold uppercase">${factRiesgo.puesto || cargo}</td>
                    <td class="font-bold uppercase">${factRiesgo.actividades || actividades}</td>
                    <td>${(factRiesgo.fisico || []).map(f => `• ${f}`).join('<br>') || 'Ninguno'}</td>
                    <td>${(factRiesgo.mecanico || []).map(m => `• ${m}`).join('<br>') || 'Ninguno'}</td>
                    <td>
                        <strong>Ergonómico:</strong><br>${(factRiesgo.ergonomico || []).map(e => `• ${e}`).join('<br>') || 'Ninguno'}<br>
                        <strong>Psicosocial:</strong><br>${(factRiesgo.psicosocial || []).map(p => `• ${p}`).join('<br>') || 'Ninguno'}
                    </td>
                </tr>
                <tr>
                    <td colspan="5" style="padding: 3px 6px; font-size: 7.5px; background: #fafafa;">
                        <strong>MEDIDAS DE PROTECCIÓN Y CONTROL APLICADAS DURANTE SU GESTIÓN:</strong> ${factRiesgo.medidasPreventivas}
                    </td>
                </tr>
            </table>

            <!-- SECCIÓN G: ACTIVIDADES EXTRA LABORALES -->
            <table>
                <tr>
                    <td class="bg-purple">G. ACTIVIDADES EXTRA LABORALES</td>
                </tr>
                <tr>
                    <td style="padding: 4px 8px; font-weight: bold;">${actExtra}</td>
                </tr>
            </table>

            <!-- SECCIÓN H: SINTOMATOLOGÍA ACTUAL AL CESE -->
            <table>
                <tr>
                    <td class="bg-purple">H. SINTOMATOLOGÍA ACTUAL AL MOMENTO DEL CESE / EGRESO LABORAL</td>
                </tr>
                <tr>
                    <td style="padding: 5px 8px; font-weight: bold; background: #fafafa;">${enfAct}</td>
                </tr>
            </table>

            <!-- SECCIÓN I: REVISIÓN DE ÓRGANOS Y SISTEMAS -->
            <table>
                <tr>
                    <td colspan="5" class="bg-purple">I. REVISIÓN ACTUAL DE ÓRGANOS Y SISTEMAS AL EGRESO</td>
                </tr>
                <tr class="bg-green">
                    <td style="width: 20%;">ÓRGANOS DE LOS SENTIDOS</td>
                    <td style="width: 20%;">RESPIRATORIO</td>
                    <td style="width: 20%;">CARDIO-VASCULAR</td>
                    <td style="width: 20%;">DIGESTIVO</td>
                    <td style="width: 20%;">OSTEO-MUSCULAR</td>
                </tr>
                <tr class="text-center font-bold">
                    <td>CP [ ] SP [X]</td>
                    <td>CP [ ] SP [X]</td>
                    <td>CP [ ] SP [X]</td>
                    <td>CP [ ] SP [X]</td>
                    <td>CP [ ] SP [X]</td>
                </tr>
                <tr>
                    <td colspan="5" style="padding: 3px 6px; background: #fafafa; font-size: 8px;">
                        <strong>DESCRIPCIÓN:</strong> ${orgSist.descripcion || 'Aparatos y sistemas evaluados sin sintomatología clínica activa.'}
                    </td>
                </tr>
            </table>

            <!-- SECCIÓN J: CONSTANTES VITALES Y ANTROPOMETRÍA -->
            <table>
                <tr>
                    <td colspan="9" class="bg-purple">J. CONSTANTES VITALES Y ANTROPOMETRÍA DE EGRESO LABORAL</td>
                </tr>
                <tr class="bg-green">
                    <td>PRESIÓN ARTERIAL</td>
                    <td>TEMPERATURA</td>
                    <td>FREC. CARDIACA</td>
                    <td>SATURACIÓN O2</td>
                    <td>FREC. RESP.</td>
                    <td>PESO (KG)</td>
                    <td>TALLA (M)</td>
                    <td>IMC</td>
                    <td>PERÍMETRO ABD.</td>
                </tr>
                <tr class="text-center font-bold">
                    <td style="color: #0284c7;">${constantes.pa} mmHg</td>
                    <td>${constantes.temp} °C</td>
                    <td>${constantes.fc} lpm</td>
                    <td>${constantes.satO2}%</td>
                    <td>${constantes.fr} rpm</td>
                    <td>${constantes.peso} Kg</td>
                    <td>${constantes.talla} m</td>
                    <td style="background: #f0fdf4; color: #166534;">${constantes.imc}</td>
                    <td>${constantes.perimetroAbd} cm</td>
                </tr>
            </table>
        </div>

        <!-- ========================================== -->
        <!-- HOJA 3: 077-RETIRO 3-3                     -->
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
                        EVALUACIÓN MÉDICA OCUPACIONAL DE RETIRO / CESE LABORAL
                        <div style="font-size: 8px; font-weight: normal; margin-top: 2px;">FORMULARIO MSP / MDT 077 - RETIRO · HOJA 3 DE 3</div>
                    </td>
                </tr>
            </table>

            <!-- SECCIÓN K: EXAMEN FÍSICO REGIONAL DE EGRESO -->
            <table>
                <tr>
                    <td colspan="5" class="bg-purple">K. EXAMEN FÍSICO REGIONAL DE EGRESO</td>
                </tr>
                <tr class="bg-green" style="font-size: 7px;">
                    <td style="width: 20%;">CABEZA / CUELLO</td>
                    <td style="width: 20%;">TÓRAX / CARDIO</td>
                    <td style="width: 20%;">ABDOMEN / PELVIS</td>
                    <td style="width: 20%;">COLUMNA / POSTURA</td>
                    <td style="width: 20%;">EXTREMIDADES / NEURO</td>
                </tr>
                <tr style="font-size: 7.2px; vertical-align: top;">
                    <td>• Ojos/Oídos: Normal<br>• Nariz/Orofaringe: Normal<br>• Cuello: Móvil sin adenopatías</td>
                    <td>• Tórax simétrico: Normal<br>• R1/R2 rítmicos sin soplos<br>• Murmullo vesicular conservado</td>
                    <td>• Blando, depresible, no doloroso<br>• Sin visceromegalias<br>• Herniorrafia previa cicatrizada</td>
                    <td>• Eje vertebral alineado<br>• Flexo-extensión conservada<br>• Sin dolor a la percusión</td>
                    <td>• Fuerza y tono muscular: 5/5<br>• Reflejos osteotendinosos normales<br>• Sin edemas ni várices</td>
                </tr>
                <tr>
                    <td colspan="5" style="padding: 4px 8px; font-weight: bold; background: #fafafa;">
                        HALLAZGOS CLÍNICOS AL CESE: ${exFisico}
                    </td>
                </tr>
            </table>

            <!-- SECCIÓN L: RESULTADOS DE EXÁMENES PARACLÍNICOS DE RETIRO -->
            <table>
                <tr>
                    <td colspan="3" class="bg-purple">L. RESULTADOS DE EXÁMENES PARACLÍNICOS Y DE CONTROL DE SALIDA</td>
                </tr>
                <tr class="bg-green">
                    <td style="width: 35%;">EXAMEN PRACTICADO</td>
                    <td style="width: 20%;">FECHA (aaaa/mm/dd)</td>
                    <td style="width: 45%;">RESULTADOS DE CONTROL</td>
                </tr>
                ${exLab.map((item, idx) => `
                    <tr key="${idx}" class="text-center font-bold">
                        <td class="text-left">${item.examen}</td>
                        <td>${item.fecha || fecRetiro}</td>
                        <td style="color: #0284c7;">${item.resultado}</td>
                    </tr>
                `).join('')}
            </table>

            <!-- SECCIÓN M: DIAGNÓSTICO AL RETIRO (CIE-10) -->
            <table>
                <tr>
                    <td colspan="5" class="bg-purple">
                        M. DIAGNÓSTICO AL EGRESO LABORAL
                        <span style="font-size: 7.5px; font-weight: normal; float: right;">PRE = PRESUNTIVO | DEF = DEFINITIVO</span>
                    </td>
                </tr>
                <tr class="bg-green">
                    <td style="width: 5%;">N°</td>
                    <td style="width: 65%;">DIAGNÓSTICO MÉDICO OCUPACIONAL</td>
                    <td style="width: 14%;">CIE-10</td>
                    <td style="width: 8%;">PRE</td>
                    <td style="width: 8%;">DEF</td>
                </tr>
                ${diags.map((d, idx) => `
                    <tr key="${idx}" class="text-center font-bold">
                        <td>${d.num || idx + 1}</td>
                        <td class="text-left">${d.desc}</td>
                        <td>${d.cie}</td>
                        <td>${d.pre ? 'X' : ''}</td>
                        <td>${d.def ? 'X' : ''}</td>
                    </tr>
                `).join('')}
            </table>

            <!-- SECCIÓN N: DICTAMEN DE SALUD AL RETIRO / EGRESO LABORAL -->
            <table>
                <tr>
                    <td colspan="3" class="bg-purple">N. DICTAMEN DE LA CONDICIÓN DE SALUD AL RETIRO / CESE LABORAL</td>
                </tr>
                <tr class="text-center font-bold" style="font-size: 9px;">
                    <td style="width: 33%; padding: 6px; background: ${condSalida.satisfactorio ? '#dcfce7' : '#ffffff'}; color: ${condSalida.satisfactorio ? '#15803d' : '#000000'};">
                        ${condSalida.satisfactorio ? '☑' : '☐'} SATISFACTORIO (SIN SECUELAS LABORALES)
                    </td>
                    <td style="width: 33%; padding: 6px; background: ${condSalida.conPatologiaComun ? '#fffbeb' : '#ffffff'}; color: ${condSalida.conPatologiaComun ? '#b45309' : '#000000'};">
                        ${condSalida.conPatologiaComun ? '☑' : '☐'} CON PATOLOGÍA COMÚN NO LABORAL
                    </td>
                    <td style="width: 34%; padding: 6px; background: ${condSalida.conSecuelaLaboral ? '#fef2f2' : '#ffffff'}; color: ${condSalida.conSecuelaLaboral ? '#dc2626' : '#000000'};">
                        ${condSalida.conSecuelaLaboral ? '☑' : '☐'} CON SECUELA O ENFERMEDAD LABORAL
                    </td>
                </tr>
                <tr>
                    <td colspan="3" style="padding: 5px 8px; font-size: 8px;">
                        <div><strong>Observaciones de Salida:</strong> ${condSalida.observacion}</div>
                        <div style="margin-top: 2px;"><strong>Criterio Médico-Legal:</strong> ${condSalida.recomendacionLegal}</div>
                    </td>
                </tr>
            </table>

            <!-- SECCIÓN O: RECOMENDACIONES POST-OCUPACIONALES -->
            <table>
                <tr>
                    <td class="bg-purple">O. RECOMENDACIONES POST-OCUPACIONALES</td>
                </tr>
                <tr>
                    <td style="padding: 4px 8px; font-size: 8px;">
                        <ol style="margin: 0; padding-left: 16px;">
                            ${recs.map((rec, i) => `<li key="${i}"><strong>${rec}</strong></li>`).join('')}
                        </ol>
                    </td>
                </tr>
            </table>

            <!-- CERTIFICACIÓN Y FINIQUITO -->
            <div style="border: 1px solid #000; padding: 4px 6px; font-size: 7.5px; text-align: justify; margin-bottom: 4px; background: #fafafa;">
                <strong>CERTIFICACIÓN DE FINIQUITO DE SALUD OCUPACIONAL:</strong> Certifico que he sido sometido a la evaluación médica ocupacional de retiro/cese correspondiente a mi desvinculación laboral de la UNIVERSIDAD ESTATAL DE BOLÍVAR, que la información proporcionada es verídica y que se me han informado los resultados y recomendaciones de salud pertinentes.
            </div>

            <!-- SECCIÓN P & Q: PROFESIONAL Y FIRMA -->
            <table>
                <tr class="bg-purple">
                    <td style="width: 65%;">P. DATOS DEL PROFESIONAL EVALUADOR</td>
                    <td style="width: 35%; text-align: center;">Q. FIRMA Y FINIQUITO DEL TRABAJADOR</td>
                </tr>
                <tr>
                    <td style="padding: 6px; vertical-align: top;">
                        <div style="display: flex; gap: 14px; margin-bottom: 4px; font-size: 8px;">
                            <div><strong>FECHA:</strong> ${prof.fecha}</div>
                            <div><strong>HORA:</strong> ${prof.hora}</div>
                            <div><strong>CÓDIGO:</strong> ${prof.codigo}</div>
                        </div>
                        <div style="font-size: 8.5px;">
                            <strong>MÉDICO OCUPACIONAL:</strong> <span class="uppercase font-bold">${prof.nombre}</span><br />
                            <span style="font-size: 7.5px; color: #555;">Unidad de Seguridad y Salud en el Trabajo · UEB</span>
                        </div>
                    </td>
                    <td style="text-align: center; padding: 10px 6px; vertical-align: bottom;">
                        <div style="border-top: 1px solid #000; width: 80%; margin: 28px auto 2px auto;"></div>
                        <div style="font-weight: bold; font-size: 8px;">FIRMA DEL TRABAJADOR</div>
                        <div style="font-size: 7.5px; color: #555;">C.I.: ${ced}</div>
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

export const printOfficialRetiroForm = (record = {}, uebBannerLogo = '') => {
    const html = compileOfficialRetiroFormHtml(record, uebBannerLogo, true);
    const printWindow = window.open('', '_blank', 'width=1100,height=850');
    if (printWindow) {
        printWindow.document.open();
        printWindow.document.write(html);
        printWindow.document.close();
    } else {
        alert('Por favor habilite los popups en el navegador para imprimir el Formulario Oficial de Retiro.');
    }
};

/**
 * Componente Modal para visualización e interactividad en pantalla
 * de la Ficha Médica Ocupacional de Retiro / Cese Laboral
 */
export default function OfficialFichaRetiroModal({
    isOpen,
    onClose,
    record,
    uebBannerLogo
}) {
    const [activeSheet, setActiveSheet] = useState(1); // 1 | 2 | 3 | 'all'

    if (!isOpen || !record) return null;

    const {
        pac, ced, p1Ape, p2Ape, p1Nom, p2Nom, edad, sexo, puesto, cargo, ciuo, actividades,
        fecIngreso, fecRetiro, tiempoServicio, causaRetiro, tel, rel, grpSangre, lat,
        orientacion, idGen, disc, ruc, estSalud, numHC, numArch, motivo, antClin, antQuir,
        gin, hab, empAnt, accTrab, enfProf, antFam, factRiesgo, actExtra, enfAct, orgSist,
        constantes, exFisico, exLab, diags, condSalida, recs, prof
    } = extractFichaRetiroFields(record);

    return (
        <div className="clinical-modal show" style={{ zIndex: 99999 }}>
            <div className="clinical-modal__backdrop" onClick={onClose}></div>
            <div className="clinical-modal__dialog" style={{ maxWidth: '1100px', width: '96vw', maxHeight: '94vh', display: 'flex', flexDirection: 'column' }}>
                {/* ENCABEZADO MODAL */}
                <header className="clinical-modal__header" style={{ background: '#002060', color: '#ffffff', padding: '14px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <FileText size={24} style={{ color: '#f87171' }} />
                        <div>
                            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', letterSpacing: '0.4px', color: '#ffffff' }}>
                                FORMATO OFICIAL: EVALUACIÓN MÉDICA OCUPACIONAL DE RETIRO / CESE LABORAL
                            </h3>
                            <p style={{ margin: 0, fontSize: '12px', color: '#fecaca' }}>
                                FICHA DE RETIRO · {pac} (C.I.: {ced}) · Cese: {fecRetiro}
                            </p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <a
                            href="/formats/FORMATO_FICHA_MEDICA_RETIRO_CESE_MSP.xlsx"
                            download="FORMATO_FICHA_MEDICA_RETIRO_CESE_MSP.xlsx"
                            className="action-button"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                background: '#166534',
                                color: '#ffffff',
                                fontWeight: '700',
                                padding: '7px 14px',
                                borderRadius: '8px',
                                fontSize: '12px',
                                textDecoration: 'none',
                                border: 'none'
                            }}
                            title="Descargar archivo Excel oficial de Retiro (.xlsx)"
                        >
                            <FileSpreadsheet size={15} /> Descargar Excel Retiro (.xlsx)
                        </a>
                        <button
                            type="button"
                            className="action-button action-button--accent"
                            onClick={() => printOfficialRetiroForm(record, uebBannerLogo)}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                background: '#0284c7',
                                color: '#ffffff',
                                fontWeight: '700',
                                padding: '7px 14px',
                                borderRadius: '8px',
                                fontSize: '12px',
                                border: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            <Printer size={15} /> Imprimir Formulario Retiro (A4)
                        </button>
                        <button
                            type="button"
                            className="clinical-modal__close"
                            onClick={onClose}
                            style={{ color: '#ffffff' }}
                        >
                            <X size={20} />
                        </button>
                    </div>
                </header>

                {/* SELECTOR DE PESTAÑAS DE HOJAS DEL FORMATO 077 RETIRO */}
                <div style={{ display: 'flex', gap: '8px', padding: '10px 22px', background: '#f1f5f9', borderBottom: '1px solid #cbd5e1', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '12px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginRight: '6px' }}>
                        Hojas del Formato Retiro:
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
                        077-RETIRO 1-3
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
                        077-RETIRO 2-3
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
                        077-RETIRO 3-3
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
                        Ver Formulario Completo de Retiro (1-3)
                    </button>
                </div>

                {/* CUERPO DEL MODAL (RÉPLICA EXACTA MSP RETIRO) */}
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
                                            EVALUACIÓN MÉDICA OCUPACIONAL DE RETIRO / CESE LABORAL
                                            <div style={{ fontSize: '9px', fontWeight: 'normal', marginTop: '2px' }}>FORMULARIO MSP / MDT 077 - RETIRO · HOJA 1 DE 3</div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            {/* SECCIÓN A: DATOS DE LA EMPRESA */}
                            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '6px' }}>
                                <tbody>
                                    <tr>
                                        <td colSpan={6} style={{ background: '#d9d9f3', fontWeight: 'bold', padding: '4px 8px', border: '1px solid #000', fontSize: '11px' }}>
                                            A. DATOS DE LA EMPRESA Y DEL TRABAJADOR QUE CESA FUNCIONES
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

                            {/* ORIENTACIÓN, GÉNERO, DISCAPACIDAD Y PUESTO DE RETIRO */}
                            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px' }}>
                                <tbody>
                                    <tr style={{ background: '#e2efda', fontWeight: 'bold', textAlign: 'center', fontSize: '8.5px' }}>
                                        <td style={{ border: '1px solid #000', width: '14%', padding: '4px' }}>ORIENTACIÓN SEXUAL</td>
                                        <td style={{ border: '1px solid #000', width: '14%', padding: '4px' }}>IDENTIDAD DE GÉNERO</td>
                                        <td style={{ border: '1px solid #000', width: '12%', padding: '4px' }}>DISCAPACIDAD</td>
                                        <td style={{ border: '1px solid #000', width: '12%', padding: '4px' }}>FECHA INGRESO</td>
                                        <td style={{ border: '1px solid #000', width: '12%', padding: '4px' }}>FECHA RETIRO</td>
                                        <td style={{ border: '1px solid #000', width: '14%', padding: '4px' }}>TIEMPO DE SERVICIO</td>
                                        <td style={{ border: '1px solid #000', width: '22%', padding: '4px' }}>CARGO / PUESTO QUE CESA</td>
                                    </tr>
                                    <tr style={{ textAlign: 'center', fontSize: '10px' }}>
                                        <td style={{ border: '1px solid #000', padding: '5px', fontWeight: 'bold' }}>{orientacion}</td>
                                        <td style={{ border: '1px solid #000', padding: '5px', fontWeight: 'bold' }}>{idGen}</td>
                                        <td style={{ border: '1px solid #000', padding: '5px' }}>
                                            {disc.tiene ? <strong>SÍ ({disc.tipo} {disc.porcentaje}%)</strong> : <strong>NO [X]</strong>}
                                        </td>
                                        <td style={{ border: '1px solid #000', padding: '5px', fontWeight: 'bold' }}>{fecIngreso}</td>
                                        <td style={{ border: '1px solid #000', padding: '5px', fontWeight: 'bold', color: '#dc2626' }}>{fecRetiro}</td>
                                        <td style={{ border: '1px solid #000', padding: '5px', fontWeight: 'bold' }}>{tiempoServicio}</td>
                                        <td style={{ border: '1px solid #000', padding: '5px', fontWeight: 'bold' }}>{cargo}</td>
                                    </tr>
                                    <tr>
                                        <td colSpan={7} style={{ border: '1px solid #000', padding: '5px 8px', background: '#fafafa', fontSize: '9.5px' }}>
                                            <strong>ACTIVIDADES DESEMPEÑADAS EN LA INSTITUCIÓN:</strong> <span style={{ textTransform: 'uppercase', fontWeight: 'bold' }}>{actividades}</span> · <strong>TELÉFONO DE CONTACTO POST-LABORAL:</strong> {tel}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            {/* SECCIÓN B: MOTIVO DE LA EVALUACIÓN DE RETIRO */}
                            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px' }}>
                                <tbody>
                                    <tr>
                                        <td style={{ background: '#d9d9f3', fontWeight: 'bold', padding: '4px 8px', border: '1px solid #000', fontSize: '11px' }}>
                                            B. MOTIVO DE LA EVALUACIÓN DE RETIRO / CESE LABORAL
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style={{ border: '1px solid #000', padding: '8px', background: '#fafafa' }}>
                                            <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#002060', marginBottom: '3px' }}>
                                                CAUSA DE DESVINCULACIÓN: {causaRetiro}
                                            </div>
                                            <div style={{ fontSize: '10px' }}>
                                                <strong>Declaración del trabajador:</strong> {motivo}
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            {/* SECCIÓN C: ANTECEDENTES PERSONALES */}
                            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px' }}>
                                <tbody>
                                    <tr>
                                        <td colSpan={4} style={{ background: '#d9d9f3', fontWeight: 'bold', padding: '4px 8px', border: '1px solid #000', fontSize: '11px' }}>
                                            C. ANTECEDENTES PERSONALES (CLÍNICOS, QUIRÚRGICOS, GINECOLÓGICOS Y HÁBITOS)
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

                            {/* SECCIÓN D: HISTORIAL LABORAL EN LA INSTITUCIÓN */}
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <tbody>
                                    <tr>
                                        <td colSpan={6} style={{ background: '#d9d9f3', fontWeight: 'bold', padding: '4px 8px', border: '1px solid #000', fontSize: '11px' }}>
                                            D. HISTORIAL LABORAL EN LA INSTITUCIÓN Y RIESGOS ASOCIADOS
                                        </td>
                                    </tr>
                                    <tr style={{ background: '#e2efda', fontWeight: 'bold', textAlign: 'center', fontSize: '8.5px' }}>
                                        <td style={{ border: '1px solid #000', width: '26%', padding: '4px' }}>EMPRESA / INSTITUCIÓN</td>
                                        <td style={{ border: '1px solid #000', width: '16%', padding: '4px' }}>PUESTO DESEMPEÑADO</td>
                                        <td style={{ border: '1px solid #000', width: '18%', padding: '4px' }}>ACTIVIDADES PRINCIPALES</td>
                                        <td style={{ border: '1px solid #000', width: '10%', padding: '4px' }}>TIEMPO</td>
                                        <td style={{ border: '1px solid #000', width: '16%', padding: '4px' }}>RIESGOS ASOCIADOS</td>
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
                                                {item.riesgos?.mecanico && <span style={{ background: '#fef3c7', padding: '2px 4px', borderRadius: '4px', marginRight: '3px' }}>MECÁNICO</span>}
                                                {item.riesgos?.ergonomico && <span style={{ background: '#e0f2fe', padding: '2px 4px', borderRadius: '4px' }}>ERGONÓMICO</span>}
                                            </td>
                                            <td style={{ border: '1px solid #000', padding: '5px' }}>{item.observaciones || 'NINGUNA'}</td>
                                        </tr>
                                    ))}
                                    <tr>
                                        <td colSpan={6} style={{ border: '1px solid #000', padding: '6px 8px', fontSize: '9.5px', background: '#fafafa' }}>
                                            <div><strong>ACCIDENTES DE TRABAJO EN LA INSTITUCIÓN:</strong> {accTrab.calificado ? `CALIFICADO IESS - ${accTrab.especificaciones}` : 'NO REGISTRA ACCIDENTES LABORALES DURANTE SU TIEMPO DE SERVICIO'}</div>
                                            <div style={{ marginTop: '3px' }}><strong>ENFERMEDADES PROFESIONALES EN LA INSTITUCIÓN:</strong> {enfProf.calificado ? `CALIFICADA IESS - ${enfProf.especificaciones}` : 'NO REGISTRA ENFERMEDADES PROFESIONALES CALIFICADAS'}</div>
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
                                            EVALUACIÓN MÉDICA OCUPACIONAL DE RETIRO / CESE LABORAL
                                            <div style={{ fontSize: '9px', fontWeight: 'normal', marginTop: '2px' }}>FORMULARIO MSP / MDT 077 - RETIRO · HOJA 2 DE 3</div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            {/* SECCIÓN E: ANTECEDENTES FAMILIARES */}
                            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px' }}>
                                <tbody>
                                    <tr>
                                        <td style={{ background: '#d9d9f3', fontWeight: 'bold', padding: '4px 8px', border: '1px solid #000', fontSize: '11px' }}>
                                            E. ANTECEDENTES FAMILIARES
                                        </td>
                                    </tr>
                                    <tr style={{ background: '#e2efda', fontSize: '8.5px', textAlign: 'center', fontWeight: 'bold' }}>
                                        <td style={{ border: '1px solid #000', padding: '4px' }}>
                                            [X] 1. CARDIO-VASCULAR | [ ] 2. METABÓLICA | [ ] 3. NEUROLÓGICA | [ ] 4. ONCOLÓGICA | [ ] 5. OTRAS
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style={{ border: '1px solid #000', padding: '8px', fontWeight: 'bold', background: '#fafafa', fontSize: '10px' }}>
                                            {antFam.descripcion || 'FAMILIARES DIRECTOS CON ANTECEDENTE CARDIOVASCULAR CONTROLADO.'}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            {/* SECCIÓN F: FACTORES DE RIESGO DEL PUESTO AL QUE CESA */}
                            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px' }}>
                                <tbody>
                                    <tr>
                                        <td colSpan={5} style={{ background: '#d9d9f3', fontWeight: 'bold', padding: '4px 8px', border: '1px solid #000', fontSize: '11px' }}>
                                            F. FACTORES DE RIESGOS DEL PUESTO DESEMPEÑADO EN LA INSTITUCIÓN
                                        </td>
                                    </tr>
                                    <tr style={{ background: '#e2efda', fontWeight: 'bold', textAlign: 'center', fontSize: '8.5px' }}>
                                        <td style={{ border: '1px solid #000', width: '22%', padding: '4px' }}>PUESTO / ÁREA</td>
                                        <td style={{ border: '1px solid #000', width: '14%', padding: '4px' }}>ACTIVIDADES</td>
                                        <td style={{ border: '1px solid #000', width: '22%', padding: '4px' }}>FÍSICO</td>
                                        <td style={{ border: '1px solid #000', width: '22%', padding: '4px' }}>MECÁNICO</td>
                                        <td style={{ border: '1px solid #000', width: '20%', padding: '4px' }}>ERGONÓMICO / PSICOSOCIAL</td>
                                    </tr>
                                    <tr style={{ fontSize: '9px' }}>
                                        <td style={{ border: '1px solid #000', padding: '6px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                                            {factRiesgo.puesto || cargo}
                                        </td>
                                        <td style={{ border: '1px solid #000', padding: '6px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                                            {factRiesgo.actividades || actividades}
                                        </td>
                                        <td style={{ border: '1px solid #000', padding: '6px' }}>
                                            {(factRiesgo.fisico || []).map((f, i) => <div key={i}><strong>• {f}</strong></div>)}
                                        </td>
                                        <td style={{ border: '1px solid #000', padding: '6px' }}>
                                            {(factRiesgo.mecanico || []).map((m, i) => <div key={i}><strong>• {m}</strong></div>)}
                                        </td>
                                        <td style={{ border: '1px solid #000', padding: '6px' }}>
                                            <div><strong>Ergonómico:</strong></div>
                                            {(factRiesgo.ergonomico || []).map((e, i) => <div key={i} style={{ fontSize: '8px' }}>• {e}</div>)}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colSpan={5} style={{ border: '1px solid #000', padding: '5px 8px', fontSize: '9px', background: '#fafafa' }}>
                                            <strong>MEDIDAS PREVENTIVAS APLICADAS EN LA INSTITUCIÓN:</strong> {factRiesgo.medidasPreventivas}
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
                                        <td style={{ border: '1px solid #000', padding: '8px', fontWeight: 'bold' }}>
                                            {actExtra}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            {/* SECCIÓN H: SINTOMATOLOGÍA ACTUAL AL CESE */}
                            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px' }}>
                                <tbody>
                                    <tr>
                                        <td style={{ background: '#d9d9f3', fontWeight: 'bold', padding: '4px 8px', border: '1px solid #000', fontSize: '11px' }}>
                                            H. SINTOMATOLOGÍA ACTUAL AL MOMENTO DEL CESE / EGRESO LABORAL
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style={{ border: '1px solid #000', padding: '8px', fontWeight: 'bold', background: '#fafafa' }}>
                                            {enfAct}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            {/* SECCIÓN I: REVISIÓN DE ÓRGANOS Y SISTEMAS */}
                            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px' }}>
                                <tbody>
                                    <tr>
                                        <td colSpan={5} style={{ background: '#d9d9f3', fontWeight: 'bold', padding: '4px 8px', border: '1px solid #000', fontSize: '11px' }}>
                                            I. REVISIÓN ACTUAL DE ÓRGANOS Y SISTEMAS AL EGRESO
                                        </td>
                                    </tr>
                                    <tr style={{ background: '#e2efda', fontSize: '8.5px', textAlign: 'center', fontWeight: 'bold' }}>
                                        <td style={{ border: '1px solid #000', width: '20%', padding: '4px' }}>ÓRGANOS DE LOS SENTIDOS</td>
                                        <td style={{ border: '1px solid #000', width: '20%', padding: '4px' }}>RESPIRATORIO</td>
                                        <td style={{ border: '1px solid #000', width: '20%', padding: '4px' }}>CARDIO-VASCULAR</td>
                                        <td style={{ border: '1px solid #000', width: '20%', padding: '4px' }}>DIGESTIVO</td>
                                        <td style={{ border: '1px solid #000', width: '20%', padding: '4px' }}>OSTEO-MUSCULAR</td>
                                    </tr>
                                    <tr style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '9.5px' }}>
                                        <td style={{ border: '1px solid #000', padding: '5px' }}>SIN PATOLOGÍA [X]</td>
                                        <td style={{ border: '1px solid #000', padding: '5px' }}>SIN PATOLOGÍA [X]</td>
                                        <td style={{ border: '1px solid #000', padding: '5px' }}>SIN PATOLOGÍA [X]</td>
                                        <td style={{ border: '1px solid #000', padding: '5px' }}>SIN PATOLOGÍA [X]</td>
                                        <td style={{ border: '1px solid #000', padding: '5px' }}>SIN PATOLOGÍA [X]</td>
                                    </tr>
                                    <tr>
                                        <td colSpan={5} style={{ border: '1px solid #000', padding: '5px 8px', fontSize: '9.5px', background: '#fafafa' }}>
                                            <strong>DESCRIPCIÓN CLÍNICA:</strong> {orgSist.descripcion || 'Aparatos y sistemas evaluados sin sintomatología clínica activa.'}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            {/* SECCIÓN J: CONSTANTES VITALES Y ANTROPOMETRÍA */}
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <tbody>
                                    <tr>
                                        <td colSpan={9} style={{ background: '#d9d9f3', fontWeight: 'bold', padding: '4px 8px', border: '1px solid #000', fontSize: '11px' }}>
                                            J. CONSTANTES VITALES Y ANTROPOMETRÍA DE EGRESO LABORAL
                                        </td>
                                    </tr>
                                    <tr style={{ background: '#e2efda', fontWeight: 'bold', textAlign: 'center', fontSize: '8.5px' }}>
                                        <td style={{ border: '1px solid #000', padding: '4px' }}>PRESIÓN ARTERIAL</td>
                                        <td style={{ border: '1px solid #000', padding: '4px' }}>TEMPERATURA</td>
                                        <td style={{ border: '1px solid #000', padding: '4px' }}>FREC. CARDIACA</td>
                                        <td style={{ border: '1px solid #000', padding: '4px' }}>SATURACIÓN O2</td>
                                        <td style={{ border: '1px solid #000', padding: '4px' }}>FREC. RESP.</td>
                                        <td style={{ border: '1px solid #000', padding: '4px' }}>PESO (KG)</td>
                                        <td style={{ border: '1px solid #000', padding: '4px' }}>TALLA (M)</td>
                                        <td style={{ border: '1px solid #000', padding: '4px' }}>IMC</td>
                                        <td style={{ border: '1px solid #000', padding: '4px' }}>PERÍMETRO ABD.</td>
                                    </tr>
                                    <tr style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '10px' }}>
                                        <td style={{ border: '1px solid #000', padding: '5px', color: '#0284c7' }}>{constantes.pa} mmHg</td>
                                        <td style={{ border: '1px solid #000', padding: '5px' }}>{constantes.temp} °C</td>
                                        <td style={{ border: '1px solid #000', padding: '5px' }}>{constantes.fc} lpm</td>
                                        <td style={{ border: '1px solid #000', padding: '5px' }}>{constantes.satO2}%</td>
                                        <td style={{ border: '1px solid #000', padding: '5px' }}>{constantes.fr} rpm</td>
                                        <td style={{ border: '1px solid #000', padding: '5px' }}>{constantes.peso} Kg</td>
                                        <td style={{ border: '1px solid #000', padding: '5px' }}>{constantes.talla} m</td>
                                        <td style={{ border: '1px solid #000', padding: '5px', background: '#f0fdf4', color: '#166534' }}>{constantes.imc}</td>
                                        <td style={{ border: '1px solid #000', padding: '5px' }}>{constantes.perimetroAbd} cm</td>
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
                                            EVALUACIÓN MÉDICA OCUPACIONAL DE RETIRO / CESE LABORAL
                                            <div style={{ fontSize: '9px', fontWeight: 'normal', marginTop: '2px' }}>FORMULARIO MSP / MDT 077 - RETIRO · HOJA 3 DE 3</div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            {/* SECCIÓN K: EXAMEN FÍSICO REGIONAL DE EGRESO */}
                            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px' }}>
                                <tbody>
                                    <tr>
                                        <td colSpan={5} style={{ background: '#d9d9f3', fontWeight: 'bold', padding: '4px 8px', border: '1px solid #000', fontSize: '11px' }}>
                                            K. EXAMEN FÍSICO REGIONAL DE EGRESO
                                        </td>
                                    </tr>
                                    <tr style={{ background: '#e2efda', fontWeight: 'bold', textAlign: 'center', fontSize: '8.5px' }}>
                                        <td style={{ border: '1px solid #000', width: '20%', padding: '4px' }}>CABEZA / CUELLO</td>
                                        <td style={{ border: '1px solid #000', width: '20%', padding: '4px' }}>TÓRAX / CARDIO</td>
                                        <td style={{ border: '1px solid #000', width: '20%', padding: '4px' }}>ABDOMEN / PELVIS</td>
                                        <td style={{ border: '1px solid #000', width: '20%', padding: '4px' }}>COLUMNA / POSTURA</td>
                                        <td style={{ border: '1px solid #000', width: '20%', padding: '4px' }}>EXTREMIDADES / NEURO</td>
                                    </tr>
                                    <tr style={{ fontSize: '8.5px', verticalAlign: 'top' }}>
                                        <td style={{ border: '1px solid #000', padding: '6px' }}>• Ojos/Oídos: Normal<br />• Nariz/Orofaringe: Normal<br />• Cuello: Móvil sin adenopatías</td>
                                        <td style={{ border: '1px solid #000', padding: '6px' }}>• Tórax simétrico: Normal<br />• R1/R2 rítmicos sin soplos<br />• Murmullo vesicular conservado</td>
                                        <td style={{ border: '1px solid #000', padding: '6px' }}>• Blando, depresible, no doloroso<br />• Sin visceromegalias<br />• Herniorrafia previa cicatrizada</td>
                                        <td style={{ border: '1px solid #000', padding: '6px' }}>• Eje vertebral alineado<br />• Flexo-extensión conservada<br />• Sin dolor a la percusión</td>
                                        <td style={{ border: '1px solid #000', padding: '6px' }}>• Fuerza muscular: 5/5 bilateral<br />• Reflejos osteotendinosos normales<br />• Sin edemas ni várices</td>
                                    </tr>
                                    <tr>
                                        <td colSpan={5} style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold', background: '#fafafa', fontSize: '9.5px' }}>
                                            HALLAZGOS CLÍNICOS AL CESE: {exFisico}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            {/* SECCIÓN L: RESULTADOS DE EXÁMENES PARACLÍNICOS DE RETIRO */}
                            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px' }}>
                                <tbody>
                                    <tr>
                                        <td colSpan={3} style={{ background: '#d9d9f3', fontWeight: 'bold', padding: '4px 8px', border: '1px solid #000', fontSize: '11px' }}>
                                            L. RESULTADOS DE EXÁMENES PARACLÍNICOS Y DE CONTROL DE SALIDA
                                        </td>
                                    </tr>
                                    <tr style={{ background: '#e2efda', fontWeight: 'bold', textAlign: 'center', fontSize: '8.5px' }}>
                                        <td style={{ border: '1px solid #000', width: '35%', padding: '4px' }}>EXAMEN PRACTICADO</td>
                                        <td style={{ border: '1px solid #000', width: '20%', padding: '4px' }}>FECHA (aaaa/mm/dd)</td>
                                        <td style={{ border: '1px solid #000', width: '45%', padding: '4px' }}>RESULTADOS DE CONTROL</td>
                                    </tr>
                                    {exLab.map((item, idx) => (
                                        <tr key={idx} style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '10px' }}>
                                            <td style={{ border: '1px solid #000', padding: '5px', textAlign: 'left' }}>{item.examen}</td>
                                            <td style={{ border: '1px solid #000', padding: '5px' }}>{item.fecha || fecRetiro}</td>
                                            <td style={{ border: '1px solid #000', padding: '5px', color: '#0284c7' }}>{item.resultado}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* SECCIÓN M: DIAGNÓSTICO AL RETIRO (CIE-10) */}
                            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px' }}>
                                <tbody>
                                    <tr>
                                        <td colSpan={5} style={{ background: '#d9d9f3', fontWeight: 'bold', padding: '4px 8px', border: '1px solid #000', fontSize: '11px' }}>
                                            M. DIAGNÓSTICO AL EGRESO LABORAL
                                            <span style={{ fontSize: '9px', fontWeight: 'normal', float: 'right' }}>PRE = PRESUNTIVO | DEF = DEFINITIVO</span>
                                        </td>
                                    </tr>
                                    <tr style={{ background: '#e2efda', fontWeight: 'bold', textAlign: 'center', fontSize: '8.5px' }}>
                                        <td style={{ border: '1px solid #000', width: '5%', padding: '4px' }}>N°</td>
                                        <td style={{ border: '1px solid #000', width: '65%', padding: '4px' }}>DIAGNÓSTICO MÉDICO OCUPACIONAL</td>
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

                            {/* SECCIÓN N: DICTAMEN DE SALUD AL RETIRO / EGRESO LABORAL */}
                            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px' }}>
                                <tbody>
                                    <tr>
                                        <td colSpan={3} style={{ background: '#d9d9f3', fontWeight: 'bold', padding: '4px 8px', border: '1px solid #000', fontSize: '11px' }}>
                                            N. DICTAMEN DE LA CONDICIÓN DE SALUD AL RETIRO / CESE LABORAL
                                        </td>
                                    </tr>
                                    <tr style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '11px' }}>
                                        <td style={{ border: '1px solid #000', width: '33%', padding: '8px', background: condSalida.satisfactorio ? '#dcfce7' : '#ffffff', color: condSalida.satisfactorio ? '#15803d' : '#000000' }}>
                                            {condSalida.satisfactorio ? '☑' : '☐'} SATISFACTORIO (SIN SECUELAS LABORALES)
                                        </td>
                                        <td style={{ border: '1px solid #000', width: '33%', padding: '8px', background: condSalida.conPatologiaComun ? '#fffbeb' : '#ffffff', color: condSalida.conPatologiaComun ? '#b45309' : '#000000' }}>
                                            {condSalida.conPatologiaComun ? '☑' : '☐'} CON PATOLOGÍA COMÚN NO LABORAL
                                        </td>
                                        <td style={{ border: '1px solid #000', width: '34%', padding: '8px', background: condSalida.conSecuelaLaboral ? '#fef2f2' : '#ffffff', color: condSalida.conSecuelaLaboral ? '#dc2626' : '#000000' }}>
                                            {condSalida.conSecuelaLaboral ? '☑' : '☐'} CON SECUELA O ENFERMEDAD LABORAL
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colSpan={3} style={{ border: '1px solid #000', padding: '6px 8px', fontSize: '9.5px' }}>
                                            <div><strong>Observaciones de Salida:</strong> {condSalida.observacion}</div>
                                            <div style={{ marginTop: '3px' }}><strong>Criterio Médico-Legal:</strong> {condSalida.recomendacionLegal}</div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            {/* SECCIÓN O: RECOMENDACIONES POST-OCUPACIONALES */}
                            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px' }}>
                                <tbody>
                                    <tr>
                                        <td style={{ background: '#d9d9f3', fontWeight: 'bold', padding: '4px 8px', border: '1px solid #000', fontSize: '11px' }}>
                                            O. RECOMENDACIONES POST-OCUPACIONALES
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

                            {/* CERTIFICACIÓN Y FINIQUITO DE SALUD */}
                            <div style={{ border: '1px solid #000', padding: '5px 8px', fontSize: '8px', textAlign: 'justify', marginBottom: '8px', background: '#fafafa' }}>
                                <strong>CERTIFICACIÓN DE FINIQUITO DE SALUD OCUPACIONAL:</strong> Certifico que he sido sometido a la evaluación médica ocupacional de retiro/cese correspondiente a mi desvinculación laboral de la UNIVERSIDAD ESTATAL DE BOLÍVAR, que la información proporcionada es verídica y que se me han informado los resultados y recomendaciones de salud pertinentes.
                            </div>

                            {/* SECCIÓN P & Q: PROFESIONAL Y FIRMA */}
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <tbody>
                                    <tr style={{ background: '#d9d9f3', fontWeight: 'bold', fontSize: '10.5px' }}>
                                        <td style={{ border: '1px solid #000', width: '65%', padding: '4px 8px' }}>P. DATOS DEL PROFESIONAL EVALUADOR</td>
                                        <td style={{ border: '1px solid #000', width: '35%', padding: '4px 8px', textAlign: 'center' }}>Q. FIRMA Y FINIQUITO DEL TRABAJADOR</td>
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
                                                <span style={{ fontSize: '8px', color: '#64748b' }}>Unidad de Seguridad y Salud en el Trabajo · UEB</span>
                                            </div>
                                        </td>
                                        <td style={{ border: '1px solid #000', textAlign: 'center', padding: '12px 8px', verticalAlign: 'bottom' }}>
                                            <div style={{ borderTop: '1px solid #000', width: '80%', margin: '40px auto 4px auto' }}></div>
                                            <div style={{ fontWeight: 'bold', fontSize: '9.5px' }}>FIRMA DEL TRABAJADOR SALIENTE</div>
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
                        Formato Oficial de Retiro: <strong>EVALUACIÓN MÉDICA DE CESE LABORAL (FORMULARIO MSP 077 - RETIRO)</strong>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            type="button"
                            className="action-button action-button--light"
                            onClick={onClose}
                        >
                            Cerrar
                        </button>
                        <a
                            href="/formats/FORMATO_FICHA_MEDICA_RETIRO_CESE_MSP.xlsx"
                            download="FORMATO_FICHA_MEDICA_RETIRO_CESE_MSP.xlsx"
                            className="action-button"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                background: '#166534',
                                color: '#ffffff',
                                fontWeight: '700',
                                padding: '7px 14px',
                                borderRadius: '8px',
                                fontSize: '12.5px',
                                textDecoration: 'none'
                            }}
                        >
                            <Download size={15} /> Descargar .xlsx
                        </a>
                        <button
                            type="button"
                            className="action-button action-button--accent"
                            onClick={() => printOfficialRetiroForm(record, uebBannerLogo)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                        >
                            <Printer size={15} /> Imprimir Formulario Oficial (A4)
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
}
