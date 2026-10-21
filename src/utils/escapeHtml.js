/**
 * Codifica un valor para insertarlo en HTML generado como texto (fichas, recetas y
 * certificados que se imprimen con document.write / srcDoc).
 *
 * OWASP ASVS 4.0.3 — V5.3.3: codificación de salida según el contexto para evitar XSS.
 * React ya escapa lo que se renderiza con JSX; esto cubre las plantillas HTML en texto.
 */
const HTML_ESCAPES = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '`': '&#96;',
};

export const escapeHtml = (value) => {
    if (value === null || value === undefined) return '';
    return String(value).replace(/[&<>"'`]/g, (ch) => HTML_ESCAPES[ch]);
};

export default escapeHtml;
