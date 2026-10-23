import { useEffect, useRef } from 'react';

/** Cada cuánto se actualizan solos los datos en pantalla. */
export const AUTO_REFRESH_MS = 15000;

/**
 * Vuelve a ejecutar `refresh` cada `intervalMs` mientras la pestaña está visible, y en cuanto el
 * usuario regresa a ella. Así los cambios hechos por otros usuarios (citas nuevas, canceladas,
 * notificaciones) aparecen sin recargar la página. Con la pestaña oculta no se hacen peticiones.
 *
 * @param {() => any} refresh  función que vuelve a cargar los datos (se usa siempre la última versión)
 * @param {boolean} enabled    p. ej. solo mientras la pestaña de citas está abierta
 */
export default function useAutoRefresh(refresh, enabled = true, intervalMs = AUTO_REFRESH_MS) {
    const refreshRef = useRef(refresh);
    refreshRef.current = refresh;

    useEffect(() => {
        if (!enabled) return undefined;

        const run = () => {
            if (document.visibilityState === 'visible') refreshRef.current();
        };
        const timer = setInterval(run, intervalMs);
        const onVisible = () => { if (document.visibilityState === 'visible') refreshRef.current(); };
        document.addEventListener('visibilitychange', onVisible);
        window.addEventListener('focus', onVisible);

        return () => {
            clearInterval(timer);
            document.removeEventListener('visibilitychange', onVisible);
            window.removeEventListener('focus', onVisible);
        };
    }, [enabled, intervalMs]);
}
