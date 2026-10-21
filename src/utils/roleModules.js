// Módulos del sistema según rol. El orden define la prioridad cuando
// el usuario tiene un único módulo y se le redirige directamente.
export const ROLE_MODULES = [
    { key: 'enfermeria', roles: ['enfermero'], path: '/enfermeria', label: 'Enfermería', description: 'Signos vitales, atenciones y procedimientos' },
    { key: 'psicologia', roles: ['psicologo'], path: '/psicologia', label: 'Psicología', description: 'Fichas y seguimiento psicológico' },
    { key: 'odontologia', roles: ['odontologo'], path: '/odontologia', label: 'Odontología', description: 'Odontogramas y tratamientos dentales' },
    { key: 'medicina-ocupacional', roles: ['medico_ocupacional'], path: '/medicina-ocupacional', label: 'Medicina Ocupacional', description: 'Exámenes y matrices ocupacionales' },
    { key: 'medicina-general', roles: ['medico_general'], path: '/medicina-general', label: 'Medicina General', description: 'Consultas e historias clínicas' },
    { key: 'administracion', roles: ['administrador', 'medico_coordinador'], path: '/administrador', label: 'Coordinación y Administración', description: 'Usuarios, reportes y configuración' },
    { key: 'paciente', roles: ['paciente'], path: '/estudiante', label: 'Mi Portal de Paciente', description: 'Mis citas, fichas y datos personales' },
];

// Roles de personal que se pueden combinar entre sí
export const STAFF_ROLES = [
    { role: 'medico_general', label: 'Médico General' },
    { role: 'medico_ocupacional', label: 'Médico Ocupacional' },
    { role: 'psicologo', label: 'Psicólogo / Psicóloga' },
    { role: 'odontologo', label: 'Odontólogo / Odontóloga' },
    { role: 'enfermero', label: 'Enfermero / Enfermera' },
    { role: 'medico_coordinador', label: 'Médico Coordinador' },
    { role: 'administrador', label: 'Administrador del Sistema' },
];

export const normalizeRoles = (roles = []) =>
    roles.map(r => (typeof r === 'string' ? r : r?.name || '').toLowerCase()).filter(Boolean);

export const getUserModules = (user) => {
    const roles = normalizeRoles(user?.roles);
    return ROLE_MODULES.filter(m => m.roles.some(r => roles.includes(r)));
};
