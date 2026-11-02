/**
 * Nombre completo de una persona a partir de sus datos de identificación (dos nombres y dos
 * apellidos). Antes varias tablas mostraban solo el primer nombre y el primer apellido.
 * Devuelve '' si no hay datos, para que quien llama ponga su propio respaldo.
 */
export const nombreCompleto = (ident) => ident
    ? [ident.primer_nombre, ident.segundo_nombre, ident.apellido_paterno, ident.apellido_materno]
        .map(p => String(p ?? '').trim())
        .filter(Boolean)
        .join(' ')
    : '';
