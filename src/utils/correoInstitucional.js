/**
 * Dominios de correo institucional aceptados (deben coincidir con App\Support\CorreoInstitucional
 * del backend). El primero es el que se propone por defecto.
 */
export const DOMINIOS_INSTITUCIONALES = ['ueb.edu.ec', 'mailes.ueb.edu.ec'];
export const DOMINIO_POR_DEFECTO = DOMINIOS_INSTITUCIONALES[0];

export const TEXTO_DOMINIOS = DOMINIOS_INSTITUCIONALES.map(d => `@${d}`).join(' o ');

/** Completa el usuario con el dominio elegido; si ya trae un @ se respeta tal cual. */
export const armarCorreo = (usuario, dominio = DOMINIO_POR_DEFECTO) => {
    const texto = String(usuario ?? '').trim();
    if (!texto || texto.includes('@')) return texto;
    return `${texto}@${dominio}`;
};

/**
 * Separa lo que se escribe o pega en el campo: "ana@mailes.ueb.edu.ec" devuelve el usuario
 * "ana" y el dominio, si es uno de los institucionales (si no, dominio null).
 */
export const separarCorreo = (valor) => {
    const [usuario, ...resto] = String(valor ?? '').trim().split('@');
    const dominio = resto.join('@').toLowerCase();
    return { usuario: usuario.trim(), dominio: DOMINIOS_INSTITUCIONALES.includes(dominio) ? dominio : null };
};

export const esCorreoInstitucional = (correo) => {
    const dominio = String(correo ?? '').trim().toLowerCase().split('@')[1];
    return DOMINIOS_INSTITUCIONALES.includes(dominio);
};
