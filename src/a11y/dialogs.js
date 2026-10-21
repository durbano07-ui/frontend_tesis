/**
 * Accesibilidad de ventanas modales (NTE INEN-ISO/IEC 40500 / WCAG 2.0).
 *
 * El sistema tiene más de 90 modales construidos a mano con las mismas clases CSS.
 * En lugar de repetir la lógica en cada uno, este módulo la aplica a todos:
 *
 *  - 4.1.2 Nombre, función, valor: role="dialog", aria-modal y nombre accesible
 *          tomado del primer encabezado del modal.
 *  - 2.4.3 Orden del foco: al abrir, el foco entra al modal; al cerrar, vuelve al
 *          elemento que lo abrió.
 *  - 2.1.1 Teclado: Escape cierra el modal superior; Tab y Shift+Tab recorren solo
 *          los controles del modal abierto (no se pierde el foco detrás del fondo).
 */

const DIALOG_SELECTOR = [
    '[role="dialog"]',
    '[role="alertdialog"]',
    '.clinical-modal__dialog',
    '.modal__content',
    '.auth-modal',
    '.admin-modal-box',
].join(',');

const CLOSE_SELECTOR = [
    '[data-dialog-close]',
    '.clinical-modal__close',
    '.modal__cancel',
    '.auth-modal__close',
    'button[aria-label^="Cerrar"]',
].join(',');

const FOCUSABLE_SELECTOR = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled]):not([type="hidden"])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
].join(',');

const isVisible = (el) => !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);

const getOpenDialogs = () => [...document.querySelectorAll(DIALOG_SELECTOR)].filter(isVisible);

// El modal "superior" es el último abierto (el último en el DOM entre los visibles)
const getTopDialog = () => {
    const dialogs = getOpenDialogs();
    return dialogs[dialogs.length - 1] || null;
};

const getFocusable = (dialog) => [...dialog.querySelectorAll(FOCUSABLE_SELECTOR)].filter(isVisible);

let idCounter = 0;

const enhanceDialog = (dialog) => {
    if (!dialog.getAttribute('role')) dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');

    if (!dialog.hasAttribute('aria-label') && !dialog.hasAttribute('aria-labelledby')) {
        const heading = dialog.querySelector('h1, h2, h3, h4');
        if (heading) {
            if (!heading.id) heading.id = `a11y-dialog-title-${++idCounter}`;
            dialog.setAttribute('aria-labelledby', heading.id);
        }
    }

    // Botones de cierre que solo tienen una "X"
    dialog.querySelectorAll(CLOSE_SELECTOR).forEach((btn) => {
        if (!btn.textContent.trim() && !btn.hasAttribute('aria-label')) {
            btn.setAttribute('aria-label', 'Cerrar');
        }
    });

    // Elemento que abrió el modal, para devolverle el foco al cerrar
    dialog.__a11yReturnFocus = document.activeElement;

    // Mover el foco dentro del modal (sin robarlo si un campo ya tiene autoFocus)
    if (!dialog.contains(document.activeElement)) {
        const first = getFocusable(dialog).find((el) => !el.matches(CLOSE_SELECTOR)) || getFocusable(dialog)[0];
        if (first) {
            first.focus({ preventScroll: true });
        } else {
            dialog.setAttribute('tabindex', '-1');
            dialog.focus({ preventScroll: true });
        }
    }
};

const restoreFocus = (dialog) => {
    const target = dialog.__a11yReturnFocus;
    if (target && document.contains(target) && isVisible(target)) {
        target.focus({ preventScroll: true });
    }
};

const handleKeyDown = (event) => {
    const dialog = getTopDialog();
    if (!dialog) return;

    if (event.key === 'Escape') {
        const closeBtn = [...dialog.querySelectorAll(CLOSE_SELECTOR)].find(isVisible);
        if (closeBtn) {
            event.preventDefault();
            closeBtn.click();
            return;
        }
        // Sin botón de cierre: se simula el clic en el fondo, que es como se cierran estos modales
        const backdrop = dialog.parentElement?.querySelector(':scope > .clinical-modal__backdrop, :scope > .modal__backdrop');
        if (backdrop) {
            event.preventDefault();
            backdrop.click();
        }
        return;
    }

    if (event.key === 'Tab') {
        const focusable = getFocusable(dialog);
        if (focusable.length === 0) {
            event.preventDefault();
            return;
        }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active = document.activeElement;

        if (!dialog.contains(active)) {
            event.preventDefault();
            first.focus();
        } else if (event.shiftKey && active === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && active === last) {
            event.preventDefault();
            first.focus();
        }
    }
};

let started = false;

export const initDialogAccessibility = () => {
    if (started || typeof window === 'undefined') return;
    started = true;

    // Modales visibles en la revisión anterior. Se compara con los actuales para saber
    // cuáles se abrieron y cuáles se cerraron, tanto si se desmontan como si solo se ocultan.
    let previouslyOpen = new Set();

    const scan = () => {
        const nowOpen = new Set(getOpenDialogs());
        nowOpen.forEach((d) => { if (!previouslyOpen.has(d)) enhanceDialog(d); });
        previouslyOpen.forEach((d) => { if (!nowOpen.has(d)) restoreFocus(d); });
        previouslyOpen = nowOpen;
    };

    let scheduled = false;
    const observer = new MutationObserver(() => {
        if (scheduled) return;
        scheduled = true;
        requestAnimationFrame(() => { scheduled = false; scan(); });
    });

    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style', 'hidden'] });
    document.addEventListener('keydown', handleKeyDown);
    scan();
};
