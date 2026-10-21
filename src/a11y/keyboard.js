/**
 * WCAG 2.0 — 2.1.1 Teclado.
 * Para elementos que no son <button> pero responden a onClick (tarjetas, filas, pasos):
 * se usan con role="button" tabIndex={0} onKeyDown={onKeyActivate}, de modo que
 * Enter o Espacio ejecuten la misma acción que el clic.
 */
export const onKeyActivate = (event) => {
    if (event.target !== event.currentTarget) return; // no interferir con controles internos
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        event.currentTarget.click();
    }
};
