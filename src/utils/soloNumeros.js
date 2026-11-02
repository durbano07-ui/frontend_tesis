/**
 * Los <input type="number"> de algunos navegadores (Firefox) dejan escribir letras. Estos
 * manejadores solo permiten dígitos y separador decimal; el signo menos solo si el campo
 * admite negativos (min < 0). Las teclas de control (borrar, flechas, Tab, Ctrl+C…) pasan.
 */
export const bloquearNoNumericos = (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey || e.key.length !== 1) return;
    const admiteNegativos = e.currentTarget.min !== '' && Number(e.currentTarget.min) < 0;
    if (/[0-9.,]/.test(e.key) || (e.key === '-' && admiteNegativos)) return;
    e.preventDefault();
};

/** Rechaza pegar texto que no sea un número. */
export const pegarSoloNumeros = (e) => {
    const texto = e.clipboardData.getData('text');
    if (!/^\s*-?\d*([.,]\d*)?\s*$/.test(texto)) e.preventDefault();
};
