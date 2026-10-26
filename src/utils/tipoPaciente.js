/**
 * Clasificación del paciente por tipo de usuario para los partes diarios y reportes.
 *
 * Códigos de la tabla tipo_usuario: 1 Médico (personal), 2 Estudiante, 3 Docente,
 * 4 Administrativo, 5 Código de Trabajo. Antes cada módulo tenía su propia versión con los
 * códigos desplazados (1 = estudiante, 2 = docente…) y Odontología contaba como estudiante a
 * cualquier paciente con datos académicos.
 *
 * @returns {'estudiante'|'docente'|'administrativo'|'codigo_trabajo'|null} null = sin confirmar
 */
export const TIPO_USUARIO = { MEDICO: 1, ESTUDIANTE: 2, DOCENTE: 3, ADMINISTRATIVO: 4, CODIGO_TRABAJO: 5 };

const POR_ID = {
    [TIPO_USUARIO.ESTUDIANTE]: 'estudiante',
    [TIPO_USUARIO.DOCENTE]: 'docente',
    [TIPO_USUARIO.ADMINISTRATIVO]: 'administrativo',
    [TIPO_USUARIO.CODIGO_TRABAJO]: 'codigo_trabajo',
};

export const getEstudioCarrera = (paciente) =>
    paciente?.estudio_carrera || paciente?.estudioCarrera || paciente?.career_study || null;

export const clasificarTipoPaciente = (paciente) => {
    const estudio = getEstudioCarrera(paciente);
    // El registro académico manda; id_tipo_usuario del propio paciente solo como respaldo
    const id = Number(estudio?.id_tipo_usuario ?? paciente?.id_tipo_usuario);
    if (POR_ID[id]) return POR_ID[id];

    const nombre = (estudio?.tipo_usuario?.nombre || estudio?.tipoUsuario?.nombre || '').toLowerCase();
    if (nombre.includes('estud')) return 'estudiante';
    if (nombre.includes('docen')) return 'docente';
    if (nombre.includes('admin')) return 'administrativo';
    if (nombre.includes('trabaj') || nombre.includes('servidor')) return 'codigo_trabajo';
    return null;
};

/** Para los reportes de 3 columnas: código de trabajo cuenta como personal administrativo. */
export const esPersonalAdministrativo = (tipo) => tipo === 'administrativo' || tipo === 'codigo_trabajo';
