// Configuración de las matrices estadísticas de Medicina Ocupacional que se llenan a mano.
// Cada matriz define: endpoint del backend, campos del formulario, cómo armar el payload
// y cómo convertir la fila del backend al formato que usan las plantillas PDF de la página.

const MESES = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];

const upper = (v) => (v == null ? '' : String(v).trim().toUpperCase());

// 'YYYY-MM-DD...' -> 'DD/MM/YYYY'
export const toDmy = (value) => {
    if (!value) return '';
    const [y, m, d] = String(value).slice(0, 10).split('-');
    return y && m && d ? `${d}/${m}/${y}` : String(value);
};

const yearMonth = (value) => {
    const s = String(value || '').slice(0, 10);
    const [y, m] = s.split('-');
    return { anio: parseInt(y, 10) || null, mes: parseInt(m, 10) || null };
};

export const pacienteNombre = (paciente) => {
    const di = paciente?.datos_identificacion;
    if (di) {
        const full = [di.apellido_paterno, di.apellido_materno, di.primer_nombre, di.segundo_nombre].filter(Boolean).join(' ');
        if (full.trim()) return upper(full);
    }
    return upper(paciente?.name || 'PACIENTE SIN NOMBRE');
};

export const pacienteCedula = (paciente) => paciente?.datos_identificacion?.numero_cedula || 'N/D';

const base = (row) => ({
    id: row.id,
    paciente: pacienteNombre(row.paciente),
    cedula: pacienteCedula(row.paciente)
});

const AUSENTISMO_TIPOS = [
    { value: 'enfermedad comun', label: 'Enfermedad común', key: 'enfermedadComun' },
    { value: 'enfermedad laboral', label: 'Enfermedad laboral', key: 'enfermedadLaboral' },
    { value: 'accidente laboral', label: 'Accidente laboral', key: 'accidenteLaboral' },
    { value: 'otros', label: 'Otros motivos', key: 'otrosMotivos' }
];

// Grupos vulnerables: clave interna de la matriz <-> texto del catálogo en el backend
export const VULNERABLE_GRUPOS = [
    { key: 'diabeticos', label: 'DIABÉTICOS' },
    { key: 'hipertensos', label: 'HIPERTENSOS' },
    { key: 'adultoMayor', label: 'ADULTO MAYOR' },
    { key: 'otras', label: 'OTRAS PATOLOGÍAS' }
];

export const MATRICES = {
    catastroficas: {
        label: 'Enfermedades Catastróficas o Huérfanas',
        path: '/medicina-ocupacional/enfermedades-catastroficas',
        fields: [
            { name: 'tipoEnfermedad', label: 'Enfermedad', type: 'text', required: true, full: true },
            { name: 'clasificacion', label: 'Clasificación', type: 'select', required: true, options: ['Catastrófica', 'Huérfana o Rara'], default: 'Catastrófica' },
            { name: 'fechaDiagnostico', label: 'Fecha de diagnóstico', type: 'date', default: '' },
            { name: 'cargo', label: 'Cargo', type: 'text' },
            { name: 'recibioTratamiento', label: '¿Recibió tratamiento?', type: 'select', options: ['SI', 'NO'], default: 'SI' },
            { name: 'novedades', label: 'Novedades', type: 'text', full: true }
        ],
        toPayload: (f) => ({
            detalle_enfermedad: upper(f.tipoEnfermedad),
            clasificacion: f.clasificacion,
            fecha_diagnostico: f.fechaDiagnostico || null,
            cargo: upper(f.cargo) || null,
            recibio_tratamiento: f.recibioTratamiento,
            detalle_novedades: upper(f.novedades) || null
        }),
        fromApi: (row, idx) => ({
            ...base(row),
            numero: idx + 1,
            tipoEnfermedad: upper(row.detalle_enfermedad),
            clasificacion: row.clasificacion || 'Catastrófica',
            fechaDiagnostico: toDmy(row.fecha_diagnostico) || 'N/D',
            cargo: upper(row.cargo),
            recibioTratamiento: row.recibio_tratamiento || '',
            novedades: upper(row.detalle_novedades)
        }),
        summary: (r) => r.tipoEnfermedad
    },

    accidentes: {
        label: 'Accidentes Laborales y Enfermedades Profesionales',
        path: '/medicina-ocupacional/accidentes-laborales',
        fields: [
            { name: 'fechaAccidente', label: 'Fecha del accidente', type: 'date', required: true },
            { name: 'cargo', label: 'Cargo', type: 'text' },
            { name: 'lugar', label: 'Lugar del accidente', type: 'text', required: true, full: true },
            { name: 'tipoAccidente', label: 'Tipo de accidente', type: 'text', required: true, full: true },
            { name: 'parteLesionada', label: 'Parte del cuerpo lesionada', type: 'text', required: true },
            { name: 'diagnostico', label: 'Diagnóstico', type: 'text' },
            { name: 'causasDirectas', label: 'Causas directas', type: 'text', required: true },
            { name: 'agente', label: 'Agente del accidente', type: 'text', required: true },
            { name: 'fuente', label: 'Fuente del accidente', type: 'text', required: true },
            { name: 'tipoIncapacidad', label: 'Tipo de incapacidad', type: 'select', required: true, options: ['SIN INCAPACIDAD', 'TEMPORAL', 'PERMANENTE PARCIAL', 'PERMANENTE TOTAL', 'PERMANENTE ABSOLUTA'], default: 'TEMPORAL' },
            { name: 'diasPerdidos', label: 'Días perdidos', type: 'number', required: true, min: 0, default: '0' },
            { name: 'gravedad', label: 'Gravedad', type: 'select', options: ['LEVE', 'GRAVE', 'ENFERMEDAD PROFESIONAL'], default: 'LEVE' },
            { name: 'novedades', label: 'Novedades', type: 'text', full: true }
        ],
        toPayload: (f) => ({
            fecha_accidente: f.fechaAccidente,
            cargo: upper(f.cargo) || null,
            lugar_accidente: upper(f.lugar),
            tipo_accidente: upper(f.tipoAccidente),
            detalle_parte_lesionada: upper(f.parteLesionada),
            diagnostico: upper(f.diagnostico) || null,
            causas_directas: upper(f.causasDirectas),
            agente_accidente: upper(f.agente),
            fuente_accidente: upper(f.fuente),
            tipo_incapacidad: f.tipoIncapacidad,
            dias_perdidos: parseInt(f.diasPerdidos, 10) || 0,
            gravedad: f.gravedad,
            novedades: upper(f.novedades) || null
        }),
        fromApi: (row, idx) => ({
            ...base(row),
            numero: idx + 1,
            cargo: upper(row.cargo),
            fechaAccidente: toDmy(row.fecha_accidente),
            lugar: upper(row.lugar_accidente),
            tipoAccidente: upper(row.tipo_accidente),
            diagnostico: upper(row.diagnostico || row.detalle_parte_lesionada),
            diasIncapacidad: `${row.dias_perdidos ?? 0} DÍAS`,
            gravedad: row.gravedad || 'LEVE',
            novedades: upper(row.novedades)
        }),
        summary: (r) => `${r.fechaAccidente} · ${r.tipoAccidente}`
    },

    covid: {
        label: 'Casos Sospechosos y Confirmados COVID-19',
        path: '/medicina-ocupacional/influenza',
        fields: [
            { name: 'estado', label: 'Estado del caso', type: 'select', required: true, options: [{ value: 'sospechoso', label: 'Sospechoso' }, { value: 'confirmado', label: 'Confirmado' }, { value: 'descartado', label: 'Descartado' }], default: 'sospechoso' },
            { name: 'fechaResultados', label: 'Entrega de resultados', type: 'date' },
            { name: 'tipoTrabajador', label: 'Tipo de trabajador', type: 'text' },
            { name: 'lugarTrabajo', label: 'Lugar de trabajo', type: 'text' },
            { name: 'diasAislamiento', label: 'Días de aislamiento', type: 'number', required: true, min: 1, default: '7' },
            { name: 'pcr', label: 'Prueba PCR', type: 'checkbox' },
            { name: 'pruebaRapida', label: 'Prueba rápida', type: 'checkbox' },
            { name: 'altaMedica', label: 'Alta médica', type: 'checkbox' }
        ],
        toPayload: (f) => ({
            tipo: f.estado === 'confirmado' ? 'confirmado' : 'sospechoso',
            descartado: f.estado === 'descartado',
            fecha_resultados: f.fechaResultados || null,
            tipo_trabajador: upper(f.tipoTrabajador) || null,
            lugar_trabajo: upper(f.lugarTrabajo) || null,
            dias_aislamiento: parseInt(f.diasAislamiento, 10) || 1,
            pcr: !!f.pcr,
            prueba_rapida: !!f.pruebaRapida,
            alta_medica: !!f.altaMedica
        }),
        fromApi: (row) => {
            const nombre = pacienteNombre(row.paciente);
            return {
                id: row.id,
                cedula: pacienteCedula(row.paciente),
                pacienteSospechoso: nombre,
                pacienteConfirmado: row.tipo === 'confirmado' ? nombre : '',
                tipoTrabajador: upper(row.tipo_trabajador),
                lugarTrabajo: upper(row.lugar_trabajo),
                entregaResultados: row.descartado ? 'DESCARTADO' : (toDmy(row.fecha_resultados) || 'PENDIENTE'),
                pcr: !!row.pcr,
                pruebaRapida: !!row.prueba_rapida,
                altaMedica: !!row.alta_medica,
                diasAislamiento: row.dias_aislamiento,
                ...yearMonth(row.fecha_resultados || row.created_at)
            };
        },
        rowName: (r) => r.pacienteSospechoso,
        summary: (r) => (r.pacienteConfirmado ? 'CONFIRMADO' : (r.entregaResultados === 'DESCARTADO' ? 'DESCARTADO' : 'SOSPECHOSO'))
    },

    ausentismo: {
        label: 'Ausentismo Laboral',
        path: '/medicina-ocupacional/ausentismo-laboral',
        fields: [
            { name: 'fecha', label: 'Fecha', type: 'date', required: true },
            { name: 'cargo', label: 'Cargo', type: 'text' },
            { name: 'tipo', label: 'Motivo', type: 'select', required: true, options: AUSENTISMO_TIPOS.map(t => ({ value: t.value, label: t.label })), default: 'enfermedad comun' },
            { name: 'diagnostico', label: 'Diagnóstico / detalle', type: 'text', required: true },
            { name: 'diasPerdidos', label: 'Días perdidos', type: 'number', required: true, min: 0, default: '1' },
            { name: 'horasPerdidas', label: 'Horas de ausentismo', type: 'number', required: true, min: 0, default: '8' },
            { name: 'horasTrabajadas', label: 'Horas trabajadas', type: 'number', required: true, min: 1, default: '40' }
        ],
        toPayload: (f) => {
            const perdidas = parseFloat(f.horasPerdidas) || 0;
            const trabajadas = parseFloat(f.horasTrabajadas) || 1;
            return {
                fecha: f.fecha,
                cargo: upper(f.cargo) || null,
                tipo: f.tipo,
                detalle_ausentismo: upper(f.diagnostico),
                dias_perdidos: parseInt(f.diasPerdidos, 10) || 0,
                horas_perdidas: perdidas,
                horas_trabajadas: trabajadas,
                indice_ausentismo: Number((perdidas / trabajadas).toFixed(2))
            };
        },
        fromApi: (row, idx) => {
            const motivo = {};
            AUSENTISMO_TIPOS.forEach(t => { motivo[t.key] = row.tipo === t.value ? upper(row.detalle_ausentismo) : ''; });
            return {
                ...base(row),
                numeroCaso: idx + 1,
                cargo: upper(row.cargo),
                ...motivo,
                diasPerdidos: row.dias_perdidos,
                totalHorasAusentismo: Number(row.horas_perdidas),
                totalHorasTrabajadas: Number(row.horas_trabajadas),
                indiceAusentismo: Number(row.indice_ausentismo).toFixed(2).replace('.', ','),
                ...yearMonth(row.fecha || row.created_at)
            };
        },
        summary: (r) => r.enfermedadComun || r.enfermedadLaboral || r.accidenteLaboral || r.otrosMotivos
    },

    embarazadas: {
        label: 'Censo de Embarazadas',
        path: '/medicina-ocupacional/listado-embarazadas',
        fields: [
            { name: 'edad', label: 'Edad', type: 'number', min: 10 },
            { name: 'telefono', label: 'Teléfono', type: 'text' },
            { name: 'semanas', label: 'Semanas de gestación', type: 'number', required: true, min: 1 },
            { name: 'controles', label: 'Número de controles', type: 'number', required: true, min: 0, default: '0' },
            { name: 'fum', label: 'FUM', type: 'date', required: true },
            { name: 'fpp', label: 'Fecha probable de parto', type: 'date', required: true }
        ],
        toPayload: (f) => ({
            edad: f.edad ? parseInt(f.edad, 10) : null,
            telefono: f.telefono || null,
            detalle_semanas_gestacion: parseInt(f.semanas, 10),
            numero_controles: parseInt(f.controles, 10) || 0,
            fecha_fum: f.fum,
            fecha_probable_parto: f.fpp
        }),
        fromApi: (row, idx) => ({
            ...base(row),
            numero: idx + 1,
            edad: row.edad || '',
            semanasGestacion: `${row.detalle_semanas_gestacion} SEMANAS`,
            fum: toDmy(row.fecha_fum),
            fechaProbableParto: toDmy(row.fecha_probable_parto),
            controles: row.numero_controles,
            telefono: row.telefono || ''
        }),
        summary: (r) => `${r.semanasGestacion} · FPP ${r.fechaProbableParto}`
    },

    psicosocial: {
        label: 'Riesgo Psicosocial',
        path: '/medicina-ocupacional/grupo-riesgo-psicosocial',
        fields: [
            { name: 'tipoServidor', label: 'Tipo de servidor', type: 'select', required: true, options: ['DOCENTE', 'ADMINISTRATIVO', 'TRABAJADOR'], default: 'DOCENTE' },
            { name: 'diagnostico', label: 'Diagnóstico', type: 'text', required: true, full: true, placeholder: 'Ej: DEPRESIÓN Y ANSIEDAD' }
        ],
        toPayload: (f) => ({
            tipo_servidor: f.tipoServidor,
            detalle_diagnostico: upper(f.diagnostico)
        }),
        fromApi: (row, idx) => ({
            ...base(row),
            numero: idx + 1,
            tiposervidor: upper(row.tipo_servidor),
            diagnostico: upper(row.detalle_diagnostico)
        }),
        summary: (r) => r.diagnostico
    },

    enfermedades_nuevas: {
        label: 'Enfermedades Nuevas',
        path: '/medicina-ocupacional/enfermedades-nuevas',
        fields: [
            { name: 'patologia', label: 'Patología nueva', type: 'text', required: true },
            { name: 'fechaAparicion', label: 'Fecha de aparición', type: 'date', required: true }
        ],
        toPayload: (f) => ({
            detalle_enfermedad_nueva: upper(f.patologia),
            fecha_aparicion: f.fechaAparicion
        }),
        fromApi: (row) => ({
            ...base(row),
            patologiaNueva: upper(row.detalle_enfermedad_nueva),
            fechaAparecimiento: toDmy(row.fecha_aparicion),
            year: String(row.fecha_aparicion || '').slice(0, 4)
        }),
        summary: (r) => `${r.patologiaNueva} · ${r.fechaAparecimiento}`
    },

    discapacidad: {
        label: 'Funcionarios con Discapacidad',
        path: '/medicina-ocupacional/funcionarios-discapacidad',
        catalog: { path: '/medicina-ocupacional/listado-discapacidades', field: 'detalle_tipo' },
        fields: [
            { name: 'tipoDiscapacidad', label: 'Tipo de discapacidad', type: 'select', required: true, options: ['FÍSICA', 'VISUAL', 'AUDITIVA', 'INTELECTUAL', 'PSICOSOCIAL', 'LENGUAJE'], default: 'FÍSICA' },
            { name: 'porcentaje', label: 'Porcentaje (%)', type: 'number', required: true, min: 0, max: 100 },
            { name: 'cargo', label: 'Cargo', type: 'text' },
            { name: 'condicionLaboral', label: 'Condición laboral', type: 'select', options: ['NOMBRAMIENTO', 'CONTRATO OCASIONAL', 'CÓDIGO DE TRABAJO'], default: 'NOMBRAMIENTO' },
            { name: 'dependencia', label: 'Dependencia / Facultad', type: 'text', full: true }
        ],
        catalogValue: (f) => f.tipoDiscapacidad,
        toPayload: (f, catalogId) => ({
            id_tipo_discapacidad: catalogId,
            porcentaje_discapacidad: parseFloat(f.porcentaje) || 0,
            cargo: upper(f.cargo) || null,
            dependencia: upper(f.dependencia) || null,
            condicion_laboral: f.condicionLaboral || null
        }),
        fromApi: (row, idx) => ({
            ...base(row),
            numero: idx + 1,
            tipoDiscapacidad: upper(row.tipo_discapacidad?.detalle_tipo),
            porcentaje: `${Number(row.porcentaje_discapacidad)}%`,
            cargo: upper(row.cargo),
            dependencia: upper(row.dependencia),
            condicionLaboral: upper(row.condicion_laboral)
        }),
        summary: (r) => `${r.tipoDiscapacidad} ${r.porcentaje}`
    },

    vulnerables_patologias: {
        label: 'Grupos Vulnerables',
        path: '/medicina-ocupacional/grupo-vulnerable',
        catalog: { path: '/medicina-ocupacional/lista-vulnerabilidades', field: 'detalle_vulnerabilidad' },
        fields: [
            { name: 'grupo', label: 'Grupo', type: 'select', required: true, options: VULNERABLE_GRUPOS.map(g => ({ value: g.key, label: g.label })), default: 'diabeticos' },
            { name: 'edad', label: 'Edad', type: 'number', min: 0 },
            { name: 'patologia', label: 'Patología (para "Otras patologías")', type: 'text', full: true }
        ],
        catalogValue: (f) => VULNERABLE_GRUPOS.find(g => g.key === f.grupo)?.label,
        toPayload: (f, catalogId) => ({
            id_lista_vulnerabilidad: catalogId,
            edad: f.edad ? parseInt(f.edad, 10) : null,
            detalle_otra_enfermedad: upper(f.patologia) || null
        }),
        fromApi: (row) => {
            const label = upper(row.vulnerabilidad?.detalle_vulnerabilidad);
            return {
                ...base(row),
                nombre: pacienteNombre(row.paciente),
                grupo: VULNERABLE_GRUPOS.find(g => g.label === label)?.key || 'otras',
                edad: row.edad ? `${row.edad} AÑOS` : '',
                patologia: upper(row.detalle_otra_enfermedad)
            };
        },
        summary: (r) => VULNERABLE_GRUPOS.find(g => g.key === r.grupo)?.label + (r.patologia ? ` · ${r.patologia}` : '')
    },

    personal_nuevo: {
        label: 'Personal Nuevo',
        path: '/medicina-ocupacional/personal-nuevo',
        fields: [
            { name: 'fechaIngreso', label: 'Fecha de ingreso', type: 'date', required: true },
            { name: 'cargo', label: 'Cargo', type: 'text' }
        ],
        toPayload: (f) => ({
            fecha_ingreso: f.fechaIngreso,
            cargo: upper(f.cargo) || null
        }),
        fromApi: (row) => ({
            ...base(row),
            fechaIngreso: toDmy(row.fecha_ingreso),
            anio: String(row.fecha_ingreso || '').slice(0, 4),
            cargo: upper(row.cargo)
        }),
        summary: (r) => `${r.fechaIngreso} · ${r.cargo || 'SIN CARGO'}`
    },

    examenes_periodicos: {
        label: 'Exámenes Médicos y Fichas Periódicas por Mes',
        path: '/medicina-ocupacional/examenes-periodicos',
        noPatient: true,
        fields: [
            { name: 'anio', label: 'Año', type: 'number', required: true, min: 2000, default: String(new Date().getFullYear()) },
            { name: 'mes', label: 'Mes', type: 'select', required: true, options: MESES.map((m, i) => ({ value: String(i + 1), label: m })), default: String(new Date().getMonth() + 1) },
            { name: 'cantidad', label: 'Exámenes y fichas realizadas', type: 'number', required: true, min: 0, full: true }
        ],
        toPayload: (f) => ({
            anio: parseInt(f.anio, 10),
            mes: parseInt(f.mes, 10),
            cantidad: parseInt(f.cantidad, 10) || 0
        }),
        fromApi: (row) => ({
            id: row.id,
            anio: row.anio,
            mes: row.mes,
            paciente: `${MESES[row.mes - 1] || row.mes} ${row.anio}`,
            cantidad: row.cantidad
        }),
        summary: (r) => `${r.cantidad} exámenes / fichas`
    }
,

    // Fichas que se registran a mano (la ficha de ingreso se emite al finalizar la atención)
    ficha_cese: {
        label: 'Ficha de Retiro / Cese de Funciones',
        path: '/medicina-ocupacional/cese-funciones',
        fields: [
            { name: 'fechaSalida', label: 'Fecha de salida', type: 'date', required: true },
            { name: 'motivo', label: 'Motivo de salida', type: 'text', required: true, full: true, placeholder: 'Ej: RENUNCIA VOLUNTARIA / JUBILACIÓN' }
        ],
        toPayload: (f) => ({
            fecha_salida: f.fechaSalida,
            detalle_motivo_salida: upper(f.motivo)
        }),
        fromApi: (row) => ({
            ...base(row),
            fechaSalida: toDmy(row.fecha_salida),
            motivo: upper(row.detalle_motivo_salida)
        }),
        summary: (r) => `${r.fechaSalida} · ${r.motivo}`
    },

    ficha_reintegro: {
        label: 'Ficha de Reintegro Laboral',
        path: '/medicina-ocupacional/reintegro-ueb',
        fields: [
            { name: 'fechaSalida', label: 'Fecha de salida', type: 'date', required: true },
            { name: 'fechaReintegro', label: 'Fecha de reintegro', type: 'date', required: true },
            { name: 'motivo', label: 'Motivo de la salida', type: 'text', required: true, full: true, placeholder: 'Ej: REPOSO MÉDICO POR CIRUGÍA' }
        ],
        toPayload: (f) => ({
            fecha_salida: f.fechaSalida,
            fecha_reintegro: f.fechaReintegro,
            detalle_motivo_salida: upper(f.motivo)
        }),
        fromApi: (row) => ({
            ...base(row),
            fechaSalida: toDmy(row.fecha_salida),
            fechaReintegro: toDmy(row.fecha_reintegro),
            motivo: upper(row.detalle_motivo_salida)
        }),
        summary: (r) => `${r.fechaSalida} → ${r.fechaReintegro} · ${r.motivo}`
    }
};

export const MATRIZ_KEYS = Object.keys(MATRICES);

// Vista de exámenes periódicos: { '2026': [12 meses] }
/** Fecha principal del registro (la del evento o, si no tiene, la de registro) para filtrar por período */
export const fechaPrincipal = (row) => String(
    row.fecha || row.fecha_diagnostico || row.fecha_accidente || row.fecha_ingreso || row.fecha_aparicion
    || row.fecha_reintegro || row.fecha_salida || row.fecha_resultados || row.created_at || ''
).slice(0, 10);

export const buildExamenesPeriodicosByYear = (rows) => {
    const byYear = {};
    rows.forEach(r => {
        const y = String(r.anio);
        if (!byYear[y]) byYear[y] = MESES.map((mes, i) => ({ id: i + 1, mes, examenes: 0, total: 0 }));
        const item = byYear[y][r.mes - 1];
        if (item) {
            item.examenes = r.cantidad;
            item.total = r.cantidad;
        }
    });
    return byYear;
};

// Vista de grupos vulnerables: { diabeticos: [], hipertensos: [], adultoMayor: [], otras: [] }
export const buildVulnerablesByGroup = (rows) => {
    const groups = Object.fromEntries(VULNERABLE_GRUPOS.map(g => [g.key, []]));
    rows.forEach(r => {
        groups[r.grupo].push({ id: r.id, nombre: r.nombre, edad: r.edad, patologia: r.patologia, fechaPeriodo: r.fechaPeriodo });
    });
    return groups;
};

// Busca en el catálogo el id del texto indicado y, si no existe, lo crea
export const ensureCatalogId = async (api, catalog, value) => {
    const res = await api.get(catalog.path);
    const list = res.data?.data || [];
    const found = list.find(item => upper(item[catalog.field]) === upper(value));
    if (found) return found.id;
    const created = await api.post(catalog.path, { [catalog.field]: upper(value) });
    return created.data?.data?.id;
};
