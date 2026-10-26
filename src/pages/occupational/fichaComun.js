/**
 * Datos comunes de las fichas oficiales (Ingreso, Retiro y Reintegro).
 *
 * Solo se usan datos registrados en el sistema (ficha guardada y perfil del paciente).
 * Lo que no está registrado queda en blanco: nunca se completa con datos de ejemplo.
 */

// Datos fijos de la institución
export const RUC_UEB = '0260000920001';
export const ESTABLECIMIENTO_UEB = 'DEPARTAMENTO MEDICO U.E.B';

const primero = (...valores) => valores.find(v => v !== undefined && v !== null && String(v).trim() !== '') ?? '';

const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return '';
    const nac = new Date(fechaNacimiento);
    if (Number.isNaN(nac.getTime())) return '';
    const hoy = new Date();
    let edad = hoy.getFullYear() - nac.getFullYear();
    if (hoy.getMonth() < nac.getMonth() || (hoy.getMonth() === nac.getMonth() && hoy.getDate() < nac.getDate())) edad--;
    return edad;
};

const normalizarSexo = (valor) => {
    const s = String(valor || '').trim().toUpperCase();
    // "MUJER" empieza con M: se revisan primero las palabras completas
    if (['F', 'FEMENINO', 'FEMENINA', 'MUJER'].includes(s)) return 'F';
    if (['M', 'MASCULINO', 'HOMBRE'].includes(s)) return 'M';
    return '';
};

/** Identificación del trabajador y datos del puesto. */
export const extraerIdentificacion = (r = {}) => {
    const p = r.patientSelected || r.paciente_data || {};

    let p1Ape = primero(r.primerApellido, r.primer_apellido, r.apellido_paterno, p.primer_apellido, p.apellido_paterno);
    let p2Ape = primero(r.segundoApellido, r.segundo_apellido, r.apellido_materno, p.segundo_apellido, p.apellido_materno);
    let p1Nom = primero(r.primerNombre, r.primer_nombre, p.primer_nombre);
    let p2Nom = primero(r.segundoNombre, r.segundo_nombre, p.segundo_nombre);

    // "PAZ MORA" -> ['PAZ', 'MORA']
    const partir = (texto) => {
        const [uno, ...resto] = String(texto).trim().split(/\s+/);
        return [uno || '', resto.join(' ')];
    };
    const apellidos = primero(r.apellidos, p.apellidos);
    const nombres = primero(r.nombres, p.nombres);
    if (!p1Ape && apellidos) [p1Ape, p2Ape] = partir(apellidos);
    if (!p1Nom && nombres) [p1Nom, p2Nom] = partir(nombres);

    const pac = primero(r.paciente, r.nombre_completo, p.nombre_completo, [p1Ape, p2Ape, p1Nom, p2Nom].filter(Boolean).join(' '));

    const sexo = normalizarSexo(primero(r.sexo, r.genero, p.sexo, p.genero));
    const puesto = primero(r.puesto, r.cargo, r.puestoTrabajo, r.puesto_trabajo, p.puestoTrabajo, p.cargo);
    const ced = primero(r.cedula, r.ci, r.identificacion, p.cedula, p.numero_cedula, p.ci);

    let disc = r.discapacidad;
    if (!disc || typeof disc !== 'object') {
        disc = {
            tiene: Boolean(r.tiene_discapacidad || p.tiene_discapacidad || r.discapacidad === true),
            tipo: primero(r.tipo_discapacidad, p.tipo_discapacidad),
            porcentaje: primero(r.porcentaje_discapacidad, p.porcentaje_discapacidad)
        };
    }

    return {
        pac, ced, p1Ape, p2Ape, p1Nom, p2Nom, sexo, puesto,
        edad: primero(r.edad, p.edad, calcularEdad(primero(r.fecha_nacimiento, r.fechaNacimiento, p.fecha_nacimiento))),
        cargo: primero(r.cargo, puesto),
        ciuo: primero(r.ciuo, p.ciuo),
        actividades: primero(r.actividades, r.actividades_puesto, p.actividades),
        tel: primero(r.telefono, r.celular, p.celular, p.telefono),
        rel: primero(r.religion, p.religion),
        grpSangre: primero(r.grupoSanguineo, r.grupo_sanguineo, r.tipo_sangre, r.tipoSangre, r.vitalSigns?.tipoSangre, p.tipo_sangre),
        lat: String(primero(r.lateralidad, p.lateralidad)).toUpperCase(),
        orientacion: primero(r.orientacionSexual, r.orientacion_sexual, p.orientacion_sexual),
        idGen: primero(r.identidadGenero, r.identidad_genero, p.identidad_genero),
        disc,
        ruc: primero(r.ruc, r.empresa_ruc, RUC_UEB),
        estSalud: primero(r.establecimiento, r.establecimiento_salud, ESTABLECIMIENTO_UEB),
        numHC: primero(r.numHistoriaClinica, r.historia_clinica, ced),
        numArch: primero(r.numArchivo, r.numero_archivo)
    };
};

/** Antecedentes gineco-obstétricos: solo los registrados (en hombres, "NO APLICA"). */
export const extraerGineco = (r, sexo) => {
    if (r.ginecoObstetricos) return r.ginecoObstetricos;
    const valor = sexo === 'M' ? 'NO APLICA' : '';
    return {
        menarquia: valor, ciclos: valor, fum: valor,
        gestas: '', partos: '', cesareas: '', abortos: '', hijosVivos: '', hijosMuertos: '',
        vidaSexualActiva: false, planificacionFamiliar: false, tipoPlanificacion: valor, lactanciaActiva: false,
        papanicolaou: { realizada: false, tiempo: '', resultado: valor },
        colposcopia: { realizada: false, resultado: valor },
        mamografia: { realizada: false, resultado: valor },
        ecoMamario: { realizada: false, resultado: valor }
    };
};

export const extraerHabitos = (r) => r.habitosToxicos || r.habitos || {
    tabaco: Boolean(r.tabaco),
    alcohol: Boolean(r.alcohol),
    drogas: Boolean(r.drogas),
    actividadFisica: r.actividadFisica || { tiene: false, cual: '', tiempo: '' },
    medicacionHabitual: r.medicacionHabitual || { tiene: false, cual: '', tiempo: '' }
};

export const extraerAntecedentesFamiliares = (r) => {
    if (r.antecedentesFamiliares && typeof r.antecedentesFamiliares === 'object') return r.antecedentesFamiliares;
    return { cardiovascular: false, descripcion: typeof r.antecedentesFamiliares === 'string' ? r.antecedentesFamiliares : '' };
};

/** Factores de riesgo marcados en la atención (lista de categorías) o guardados con detalle. */
export const extraerFactoresRiesgo = (r, cargo, actividades) => {
    const fr = r.factoresRiesgo;
    if (fr && typeof fr === 'object' && !Array.isArray(fr)) return fr;
    const marcados = Array.isArray(fr) ? fr.map(x => String(x)) : [];
    const tiene = (...claves) => marcados.filter(x => claves.some(c => x.toLowerCase().includes(c)));
    return {
        puesto: cargo,
        actividades,
        fisico: tiene('físic', 'fisic'),
        mecanico: tiene('mecán', 'mecan'),
        quimico: tiene('quím', 'quim'),
        biologico: tiene('biol'),
        ergonomico: tiene('ergon'),
        psicosocial: tiene('psico'),
        medidasPreventivas: r.medidasPreventivas || ''
    };
};

/** Constantes vitales registradas en la atención. */
export const extraerConstantes = (r) => {
    const vs = r.vitalSigns || {};
    const c = r.constantes || {};
    const sis = primero(vs.paSystolic, r.presion_arterial_sistolica);
    const dia = primero(vs.paDiastolic, r.presion_arterial_diastolica);
    let talla = primero(c.talla, vs.talla, r.talla);
    if (parseFloat(talla) > 3) talla = (parseFloat(talla) / 100).toFixed(2);
    const peso = primero(c.peso, vs.peso, r.peso);
    let imc = primero(c.imc, vs.imc, r.imc);
    if (!imc && parseFloat(peso) && parseFloat(talla)) imc = (parseFloat(peso) / (parseFloat(talla) ** 2)).toFixed(2);
    return {
        pa: primero(c.pa, sis && dia ? `${sis}/${dia}` : ''),
        temp: primero(c.temp, vs.temp, r.temperatura),
        fc: primero(c.fc, vs.fc, r.frecuencia_cardiaca),
        satO2: primero(c.satO2, vs.spo2, r.saturacion_oxigeno),
        fr: primero(c.fr, vs.fr, r.frecuencia_respiratoria),
        peso,
        talla,
        imc,
        perimetroAbd: primero(c.perimetroAbd, r.perimetro_abdominal),
        novedades: c.novedades || ''
    };
};

export const extraerExamenFisico = (r) => {
    if (typeof r.examenFisico === 'string') return r.examenFisico;
    return primero(r.examenFisico?.descripcion, r.detalle_examen_fisico);
};

export const extraerLaboratorios = (r) => {
    const lab = r.examenesLab || r.laboratorios;
    return Array.isArray(lab) ? lab : [];
};

/** Diagnósticos CIE-10 registrados ("M54.5 - Lumbalgia" o lista ya estructurada). */
export const extraerDiagnosticos = (r) => {
    if (Array.isArray(r.diagnosticos) && r.diagnosticos.length > 0) return r.diagnosticos;
    if (Array.isArray(r.diagnosticos_medicina)) {
        return r.diagnosticos_medicina.map((dm, idx) => ({
            num: idx + 1, desc: dm.detalle_diagnostico || '', cie: dm.cie10 || '', pre: Boolean(dm.presuntivo), def: Boolean(dm.definitivo)
        }));
    }
    const texto = primero(r.diagnosticoCie, r.diagnostico);
    if (!texto) return [];
    const [codigo, ...desc] = texto.split('-');
    const tieneCodigo = desc.length > 0;
    return [{ num: 1, desc: (tieneCodigo ? desc.join('-') : texto).trim().toUpperCase(), cie: tieneCodigo ? codigo.trim().toUpperCase() : '', pre: false, def: true }];
};

/** Recomendaciones: las registradas, o el plan de tratamiento y la prescripción de la atención. */
export const extraerRecomendaciones = (r) => {
    if (Array.isArray(r.recomendaciones) && r.recomendaciones.length > 0) return r.recomendaciones;
    const recs = [];
    const plan = primero(r.planTratamiento, r.detalle_plan_terapeutico);
    if (plan) recs.push(String(plan).toUpperCase());
    (r.prescripcionesList || []).forEach(m => {
        recs.push(`FARMACOTERAPIA: ${m.detalle_medicamento} (${m.dosis}, cada ${m.frecuencia}h x ${m.duracion} días)`.toUpperCase());
    });
    return recs;
};

/** Profesional que firmó la ficha. */
export const extraerProfesional = (r, fecha) => r.profesional || {
    fecha: primero(fecha, r.fecha),
    hora: primero(r.hora),
    nombre: primero(r.doctor_nombre),
    codigo: primero(r.doctor_codigo)
};

export { primero };
